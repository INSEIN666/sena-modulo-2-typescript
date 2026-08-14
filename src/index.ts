import type { Product } from "./models/product.js";
import type { Customer } from "./models/customer.js";
import { PaymentMethod, type Order, type OrderItem } from "./models/order.js";
import type { ServiceResponse } from "./types/response.js";
import { findProductById, updateStock } from "./services/product.service.js";
import { calculateOrderTotal } from "./services/order.service.js";

const products: Product[] = [
  { id: 1, name: "Laptop", price: 2800000, stock: 5, available: true },
  { id: 2, name: "Monitor", price: 850000, stock: 8, available: true },
  { id: 3, name: "Mouse", price: 80000, stock: 20, available: true }
];

const customer: Customer = {
  id: 1,
  name: "Carlos Martínez",
  email: "carlos@example.com"
};

const laptop = findProductById(products, 1);
const mouse = findProductById(products, 3);

if (!laptop || !mouse) {
  throw new Error("No fue posible construir el pedido");
}

const items: OrderItem[] = [
  { productId: laptop.id, productName: laptop.name, unitPrice: laptop.price, quantity: 1 },
  { productId: mouse.id, productName: mouse.name, unitPrice: mouse.price, quantity: 2 }
];

const order: Order = {
  id: 1,
  customer,
  items,
  status: "pending",
  paymentMethod: PaymentMethod.CARD,
  total: calculateOrderTotal(items)
};

const response: ServiceResponse<Order> = {
  success: true,
  message: "Pedido creado correctamente",
  data: order
};

console.dir(response, { depth: null });
console.log("Stock laptop luego de vender 1 unidad:", updateStock(laptop, 1).stock);