import { CSVProduct } from '../@types/csv-product';
import { ImagesItem } from '../models/product.model';

export const makeImage = (el: CSVProduct): ImagesItem[] => {
  if (!el.ImageFileName || !el.ItemImageURL) return [];

  return [
    {
      cdnLink: el.ItemImageURL,
      fileName: el.ImageFileName,
      i: 0,
      alt: null,
    },
  ];
};
