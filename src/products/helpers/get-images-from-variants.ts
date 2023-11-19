import { ProductVariant, ImagesItem } from '../models/product.model';

export function getImagesFromVariants(
  variants: ProductVariant[],
): ImagesItem[] {
  // Get all images from variants, avoid or remove duplicates
  const value = variants
    .filter((el) => el.active)
    .reduce((acc, curr) => {
      if (curr.images.length) {
        acc.push(...curr.images);
      }
      return acc;
    }, [] as ImagesItem[]);

  // Remove duplicates
  const uniqueImages = value.filter(
    (el, i, arr) => arr.findIndex((t) => t.fileName === el.fileName) === i,
  );

  return uniqueImages;
}
