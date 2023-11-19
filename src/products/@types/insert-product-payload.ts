import { Product } from '../models/product.model';

export type InsertProductPayload = Omit<Product, '_id'>;
// export type InsertProductPayload = Product;
