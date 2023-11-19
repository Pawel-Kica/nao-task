import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InsertProductPayload } from './@types/insert-product-payload';
import { CSVProduct } from './@types/csv-product';
import parseProductsCSV from './helpers/parseCSV';
import config from '../config';
import { logError, logInfo } from '../common/logger';
import { mongoClient } from '../common/create-mongo-connection';
import { MongoClient, ObjectId } from 'mongodb';
import { Product } from './models/product.model';
import {
  LogEmoji,
  getHeading,
  sendSlackNotif,
} from '../common/send-slack-notif';
import { OpenAIService } from '../openai/openai.service';
import {
  EnhanceProductDescriptionArgs,
  EnhancedProductDescription,
} from './@types/enhanced-description-payload';
import { makeProducts } from './helpers/make-products';
import { MongoService } from '../mongo/mongo.service';
import { getImagesFromVariants } from './helpers/get-images-from-variants';
import { makeOptions } from './helpers/make-options';
import { updateVariantsWithOptions } from './helpers/update-variants-with-options';

@Injectable()
export class ProductsService {
  constructor(
    private openAIService: OpenAIService,
    private mongoService: MongoService,
  ) {}
  /**
   * Properties
   */
  private collectionName = 'products';
  private importsProductsLock = false;

  /**
   * Cron jobs
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async importProducts() {
    try {
      if (this.importsProductsLock) {
        return logInfo('Products import is already running');
      }
      // Lock to prevent multiple imports in the same time
      this.importsProductsLock = true;
      logInfo(`Starting products import`);

      // Fetch and parse products from vendor
      const csvProducts = await this.fetchProductsFromVendor();

      // Get OpenAI enhanced descriptions and format data
      const products = await this.enhanceAndFormatData(csvProducts);

      // Save products to DB
      await this.handleDatabaseUpdate(products);
    } catch (error) {
      // Log error
      logError('Error importing products', error.message);
    } finally {
      // Unlock after import is done
      this.importsProductsLock = false;
    }
  }

  /**
   * Functions
   */
  async handleDatabaseUpdate(products: InsertProductPayload[]) {
    let client: MongoClient;
    try {
      // Connect to DB
      client = await mongoClient();
      const collection = client
        .db(config.mongo.dbName)
        .collection<Product>(this.collectionName);

      const allProducts = await collection.find().toArray();
      const { productsToUpdate, productsToInsert } = this.classifyProducts(
        products,
        allProducts,
      );

      const erroredInsert = await this.mongoService.insertManyByChunks<Product>(
        collection,
        productsToInsert,
        'productId',
      );
      const erroredUpdate = await this.mongoService.updateMany(
        collection,
        productsToUpdate,
      );

      // Delete all products from DB that are not in the new list
      // if (config.deleteProducts) {
      //   deleteResponse = await this.collection.deleteMany({
      //     productId: { $nin: productsIds },
      //   });
      // }

      /**
       * Send slack notification
       */
      const heading = getHeading('Products import', LogEmoji.SUCCESS);
      const softDeletedProductsCount = productsToUpdate.filter(
        (p) => !p.active,
      ).length;

      const elemens = [
        heading,
        `Inserted: ${productsToInsert.length - erroredInsert.length}`,
        `Updated: ${productsToUpdate.length - softDeletedProductsCount}`,
        `Soft Deleted: ${softDeletedProductsCount}`,
      ];
      // Combine all elements
      let slackMessage = elemens.join('\n');

      // Add error messages
      if (erroredInsert.length || erroredUpdate.length) {
        const errorsElements = ['\n' + getHeading('Errors', LogEmoji.ERROR)];
        if (erroredInsert.length) {
          errorsElements.push(
            `Insert (${erroredInsert.length}): ${erroredInsert}`,
          );
        }
        if (erroredUpdate.length) {
          errorsElements.push(
            `Update (${erroredUpdate.length}): ${erroredUpdate}`,
          );
        }
        slackMessage += errorsElements.join('\n');
      }
      // Send
      await sendSlackNotif(slackMessage);
    } catch (e) {
      throw e;
    } finally {
      if (client) {
        await client.close();
      }
    }
  }

  async fetchProductsFromVendor(): Promise<CSVProduct[]> {
    // If we are in test mode, we will use the local CSV file
    if (config.mockedProducts) {
      // "PROD" FILE
      const CSV_PATH = './src/common/data/images40.txt';

      // TEST FILES
      // const CSV_PATH = './src/common/data/images40_500.txt';
      // const CSV_PATH = './src/common/data/images40_2.txt';
      return await parseProductsCSV(CSV_PATH);
    } else {
      // Make API request to vendor...
    }
  }

  async enhanceAndFormatData(csvProducts: CSVProduct[]) {
    const uniqueProducts: CSVProduct[] = [];
    // To speed up the process - 100k rows :))
    const uniqueProductsIds = new Set<string>();
    csvProducts.forEach((el) => {
      if (!uniqueProductsIds.has(el.ProductID)) {
        uniqueProductsIds.add(el.ProductID);
        uniqueProducts.push(el);
      }
    });

    const groupedCsvProducts = csvProducts.reduce((acc, curr) => {
      if (!acc[curr.ProductID]) {
        acc[curr.ProductID] = [];
      }
      acc[curr.ProductID].push(curr);
      return acc;
    }, {});

    await this.enhanceDescriptions(uniqueProducts);

    return makeProducts(uniqueProducts, groupedCsvProducts);
  }

  async enhanceDescriptions(products: CSVProduct[]) {
    const CHUNK_SIZE = 5;

    // Only for first 10 products, get enhanced description from OpenAI
    for (let i = 0; i < 10; i += CHUNK_SIZE) {
      const chunk = products.slice(i, i + CHUNK_SIZE);
      // I'm not using Promise.all because I want to make sure that I don't hit the OpenAI API limits
      const descriptions = await this.getEnchanedDescriptions(chunk);
      for (const description of descriptions) {
        const product = products.find(
          (el) => el.ProductName === description.productName,
        );
        if (product) {
          product.ProductName = description.newDescription;
        }
      }
    }
  }

  async getEnchanedDescriptions(
    products: CSVProduct[],
  ): Promise<EnhancedProductDescription[]> {
    const defaultResponse = products.map((el) => ({
      productName: el.ProductName,
      newDescription: el.ProductDescription,
    }));

    // Validation - max 5 products because of OpenAI GPT4 limitations
    if (products.length > 5) {
      throw new Error('Too many products, max 5 allowed');
    }
    // If OpenAI service is not initialized, return the same description
    if (!this.openAIService.llm) {
      logInfo('OpenAI service not initialized, skipping');
      return defaultResponse;
    }

    try {
      const data: EnhanceProductDescriptionArgs[] = products.map((data) => ({
        productName: data.ProductName,
        productDescription: data.ProductDescription,
      }));

      const prompt = `You are an expert in medical sales. Your specialty is medical consumables used by hospitals on a daily basis. Your task to enhance the description of a product based on the information provided. I'm gonna provide you list of products in the following format:
{
    "productName": "...",
    "productDescription": "...",
} and you should respond to me JSON with the new description for each product, in the following format:
{
    "productName": "...",
    "newDescription": "...",
}
Data:
${JSON.stringify(data)}`;

      const tokens = await this.openAIService.llm.getNumTokens(prompt);
      if (tokens > 2048) {
        throw new Error(
          'Too many tokens, max 2048 allowed due to OpenAI GPT4 limitations',
        );
      }

      logInfo('Enhancing description prompt', prompt);
      const response = JSON.parse(
        await this.openAIService.llm.invoke(prompt, {}),
      );
      return response;
    } catch (error) {
      logError('Error enhancing description', error.message);
      return defaultResponse;
    }
  }

  classifyProducts(
    newProducts: InsertProductPayload[],
    allProducts: Product[],
  ) {
    const productsToUpdate: Product[] = [];
    const productsToInsert: Product[] = [];
    // Helper set
    const allProductIds = new Set(allProducts.map((p) => p.productId));

    for (const newProduct of newProducts) {
      if (allProductIds.has(newProduct.productId)) {
        const existingProduct = allProducts.find(
          (p) => p.productId === newProduct.productId,
        );

        const variants = existingProduct.data.variants.map(
          (existingVariant) => {
            const newVariant = newProduct.data.variants.find(
              (v) =>
                v.manufacturerItemId === existingVariant.manufacturerItemId,
            );

            return newVariant || { ...existingVariant, active: false };
          },
        );

        const toUpdateProduct: Product = {
          _id: existingProduct._id,
          ...newProduct,
          active: true,
          data: {
            ...newProduct.data,
            variants,
          },
        };
        toUpdateProduct.data.images = getImagesFromVariants(
          toUpdateProduct.data.variants,
        );
        toUpdateProduct.data.options = makeOptions(newProduct.data.variants);
        updateVariantsWithOptions(toUpdateProduct);

        productsToUpdate.push(toUpdateProduct);
      } else {
        newProduct.data.images = getImagesFromVariants(
          newProduct.data.variants,
        );
        newProduct.data.options = makeOptions(newProduct.data.variants);
        updateVariantsWithOptions(newProduct);
        productsToInsert.push({
          _id: new ObjectId(),
          ...newProduct,
          active: true,
        });
      }
    }

    const newProductsIds = new Set(newProducts.map((p) => p.productId));
    const activeProducts = allProducts.filter((p) => p.active);

    if (config.softDeleteProducts) {
      for (const existingProduct of activeProducts) {
        if (!newProductsIds.has(existingProduct.productId)) {
          productsToUpdate.push({
            ...existingProduct,
            active: false,
          });
        }
      }
    }

    return { productsToUpdate, productsToInsert };
  }
}
