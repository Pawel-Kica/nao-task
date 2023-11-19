import { InsertProductPayload } from '../@types/insert-product-payload';

export function updateVariantsWithOptions(product: InsertProductPayload) {
  const optionsPathMap = new Map();

  // Create a map of option IDs to their values
  for (const option of product.data.options) {
    optionsPathMap.set(option.id, option);
  }

  for (const variant of product.data.variants) {
    const optionItemsPath = [];

    for (const option of product.data.options) {
      const optionValue = optionsPathMap.get(option.id);

      if (optionValue) {
        const optionValueEl = optionValue.values.find(
          (optionValueEl) => optionValueEl.value === variant[option.name],
        );

        if (optionValueEl) {
          optionItemsPath.push(optionValueEl.id);
        }
      }
    }

    variant.optionsPath = product.data.options
      .map((option) => option.id)
      .join('.');
    variant.optionItemsPath = optionItemsPath.join('.');
  }
}
