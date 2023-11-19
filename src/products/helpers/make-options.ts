import { getRandomString } from '../../common/get-random-string';
import { ProductVariant } from '../models/product.model';

export function makeOptions(variants: ProductVariant[]) {
  const createOptionItem = (variantValue) => ({
    id: getRandomString(),
    name: variantValue,
    value: variantValue,
  });

  const createOptions = (optionName) => {
    const optionSet = new Set();
    const filteredVariants = variants.filter(
      (v) => v.active && !optionSet.has(v[optionName]),
    );

    return {
      id: getRandomString(),
      name: optionName,
      dataField: null,
      values: filteredVariants.map((variant) => {
        optionSet.add(variant[optionName]);
        return createOptionItem(variant[optionName]);
      }),
    };
  };

  return ['packaging', 'description'].map(createOptions);
}
