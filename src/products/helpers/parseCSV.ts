import { readFile } from 'fs/promises';
import { nanoid } from 'nanoid';

const parseProductsCSV = async <T>(CSV_PATH: string): Promise<T[]> => {
  // Read the file
  const data = await readFile(CSV_PATH, 'utf8');

  // Split the content into lines
  const lines = data.split('\n');
  // Extract column names
  const columns = lines[0].split('\t');

  // Create an array to store the objects
  const result = lines
    .slice(1)
    .map((line) => line.split('\t'))
    .map((values) =>
      columns.reduce((obj, column, index) => {
        obj[column] = values[index];
        if (column === 'ProductID' && !values[index]) {
          obj[column] = nanoid();
        }

        return obj;
      }, {} as T),
    );

  return result;
};

export default parseProductsCSV;
