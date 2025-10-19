import { Types } from "mongoose";

// ✅ Transaction inside a consignment
export interface TTransaction {
  _id?: string;
  transactionId: string; // Unique reference (e.g., TRX-2025-0001)
  date: Date;
  amount: number;
  method: "cash" | "bank" | "mobile" | "card" | "other";
  type: "advance" | "payment" | "refund";
  note?: string;
  receivedBy?: Types.ObjectId; // who handled it (e.g., admin or user)
}

// ✅ Product details inside a consignment
export interface TConsignmentProduct {
  category: "mobile" | "laptop" | "accessory" | "other";
  brand: string;
  model: string;
  specs?: string;
  buyingPrice: number;
  sellingPrice: number;
  quantity: number;
  totalbuyingCost?: number;
  totalsellingCost?: number;
}

// ✅ Main Consignment
export interface TConsignment {
  _id?: string;
  consignmentId: string;
  supplier: Types.ObjectId; // user who supplied goods
  customer: Types.ObjectId; // user receiving goods
  products: TConsignmentProduct[];
  transactions: TTransaction[]; // 💰 New field for all payments
  startDate: Date;
  shippingDate?: Date;
  deliveryDate?: Date;
  shippingCost: number;
  totalAmount: number; // total selling cost + shipping
  totalAdvance: number; // total paid from transactions (advance)
  totalDue: number; // totalAmount - totalAdvance
  status: "pending" | "in-transit" | "delivered" | "cancelled";
  destination: string;
  createdAt?: Date;
  updatedAt?: Date;
}
