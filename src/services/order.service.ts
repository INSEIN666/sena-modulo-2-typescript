import type { OrderItem } from "../models/order.js";

export function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  );
}