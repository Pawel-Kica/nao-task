import { ObjectId } from 'mongodb';

export interface Product {
  _id: ObjectId;
  productId: string;
  active: boolean;
  docId: string;
  data: ProductData;
}

export interface ProductData {
  name: string;
  type: string;
  shortDescription: string;
  description: string;
  vendorId: string;
  manufacturerId: string;
  storefrontPriceVisibility: string;
  variants: ProductVariant[];
  options: OptionsItem[];
  availability: string;
  isFragile: boolean;
  published: string;
  isTaxable: boolean;
  images: ImagesItem[];
  categoryId: string;
}

export interface ProductVariant {
  id: string;
  available: boolean;
  attributes: ProductVariantAttributes;
  cost: number;
  currency: string;
  depth: null;
  description: string;
  dimensionUom: null;
  height: null;
  width: null;
  manufacturerItemCode: string;
  manufacturerItemId: string;
  packaging: string;
  price: number;
  volume: null;
  volumeUom: null;
  weight: null;
  weightUom: null;
  optionName: string;
  optionsPath: string;
  optionItemsPath: string;
  sku: string;
  active: boolean;
  images: ImagesItem[];
  itemCode: string;
}

export interface ProductVariantAttributes {
  packaging: string;
  description: string;
}

export interface ImagesItem {
  fileName: string;
  cdnLink: string;
  i: number;
  alt: null;
}

export interface OptionsItem {
  id: string;
  name: string;
  dataField: null;
  values: ValuesItem[];
}

export interface ValuesItem {
  id: string;
  name: string;
  value: string;
}
