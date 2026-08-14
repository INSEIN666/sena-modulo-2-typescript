import type { Customer } from "./customer.js";

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "cancelled";

export enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  TRANSFER = "TRANSFER"
}

export interface OrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: number;
  customer: Customer;
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  total: number;
}