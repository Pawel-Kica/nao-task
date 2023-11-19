import { nanoid } from 'nanoid';
import { CSVProduct } from '../@types/csv-product';
import { InsertProductPayload } from '../@types/insert-product-payload';
import { makeVariants } from './make-variants';

export function makeProducts(
  uniqueProducts: CSVProduct[],
  groupedProducts: Record<string, CSVProduct[]>,
) {
  let counter = 0;
  const products = uniqueProducts.map((el: CSVProduct) => {
    console.log(counter++);

    const sameIdProducts = groupedProducts[el.ProductID];
    const variants = makeVariants(sameIdProducts);

    const product: InsertProductPayload = {
      docId: nanoid(),
      active: true,
      productId: el.ProductID,
      data: {
        vendorId: el.ManufacturerID,
        name: el.ProductName,
        shortDescription: el.ProductDescription,
        description: el.ProductDescription,
        manufacturerId: el.ManufacturerID,
        variants,
        options: [],
        images: [],
        availability: el.Availability,
        categoryId: el.CategoryID,
        // Same for all products
        type: 'non-inventory',
        storefrontPriceVisibility: 'members-only',
        published: 'published',
        isFragile: false,
        isTaxable: false,
      },
    };
    return product;
  });

  return products;
}
