export const getRandomCost = (price: number): number =>
  parseFloat((price * (Math.random() * (0.9 - 0.5) + 0.5)).toFixed(2));
