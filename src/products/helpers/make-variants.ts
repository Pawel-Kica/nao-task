import { getRandomString } from '../../common/get-random-string';
import { CSVProduct } from '../@types/csv-product';
import { ProductVariant } from '../models/product.model';
import { getRandomCost } from './get-random-cost';
import { makeImage } from './make-image';

export function makeVariants(csvProducts: CSVProduct[]): ProductVariant[] {
  return csvProducts.map((el) => ({
    id: getRandomString(),
    // Can also use 'quantityOnHand', but check 10311873
    available:
      el.Availability || el.Availability?.includes('days') ? false : true,
    attributes: { packaging: el.PKG, description: '' },
    cost: getRandomCost(parseFloat(el.UnitPrice)),
    currency: 'USD',
    description: el.ProductDescription,
    manufacturerItemCode: el.ManufacturerItemCode,
    manufacturerItemId: el.ItemID,
    packaging: el.PKG,
    price: parseFloat(el.UnitPrice),
    optionName: '',
    optionsPath: '',
    optionItemsPath: '',
    sku: '',
    active: true,
    images: makeImage(el),
    itemCode: el.NDCItemCode,
    depth: null,
    weight: null,
    weightUom: null,
    volume: null,
    volumeUom: null,
    dimensionUom: null,
    height: null,
    width: null,
  }));
}
