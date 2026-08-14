import type { Product } from "../models/product.js";

export function findProductById(
  products: Product[],
  id: number
): Product | undefined {
  return products.find((product) => product.id === id);
}

export function updateStock(
  product: Product,
  quantity: number
): Product {
  if (quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }
  if (quantity > product.stock) {
    throw new Error("Insufficient stock");
  }
  const newStock = product.stock - quantity;
  return { ...product, stock: newStock, available: newStock > 0 };
}