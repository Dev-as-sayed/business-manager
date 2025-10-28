import { Types } from "mongoose";

// ✅ Enhanced Transaction inside a consignment
export interface TTransaction {
  _id?: string;
  transactionId: string;
  date: Date;
  amount: number;
  method: "cash" | "bank" | "mobile" | "card" | "other";
  type: "advance" | "payment" | "refund" | "pay-in" | "pay-out";
  direction: "in" | "out";
  party: "customer" | "supplier" | "company";
  note?: string;
  addBy?: Types.ObjectId;
  status?: "pending" | "completed" | "failed";
}

// ✅ Enhanced Product details inside a consignment
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
  status: "pending" | "delivered" | "refunded" | "returned" | "damaged";
  deliveredQuantity?: number;
  refundedQuantity?: number;
  profit?: number;
  profitMargin?: number;
}

// ✅ Product Status Summary
export interface TProductStatus {
  total: number;
  delivered: number;
  pending: number;
  refunded: number;
}

// ✅ Main Consignment - Enhanced with profit/loss tracking
export interface TConsignment {
  _id?: string;
  consignmentId: string;
  admin: Types.ObjectId; // admin who added this consignment
  supplier: Types.ObjectId; // user who supplied goods
  customer: Types.ObjectId; // user receiving goods
  products: TConsignmentProduct[];
  transactions: TTransaction[];
  startDate: Date;
  shippingDate?: Date;
  deliveryDate?: Date;
  shippingCost: number;

  // Financial totals
  totalAmount: number; // total selling cost + shipping
  totalAdvance: number; // total paid from transactions (advance)
  totalDue: number; // totalAmount - totalAdvance

  // Cost breakdown
  totalProductCost: number;
  totalSellingPrice: number;

  // Profit/Loss tracking
  grossProfit?: number;
  netProfit?: number;
  profitMargin?: number;

  // Payment tracking
  totalReceived?: number;
  totalPaid?: number;

  status:
    | "pending"
    | "in-transit"
    | "delivered"
    | "cancelled"
    | "partially-delivered"
    | "refunded";
  destination: string;

  // Product status summary
  productStatus?: TProductStatus;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

// ✅ Profit Summary Interface
export interface TProfitSummary {
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  totalRevenue: number;
  totalCost: number;
  shippingCost: number;
}

// ✅ Financial Report Interface
export interface TFinancialReport {
  totalRevenue: number;
  totalCost: number;
  totalShipping: number;
  totalNetProfit: number;
  totalGrossProfit: number;
  totalReceived: number;
  totalDue: number;
  count: number;
}

// ✅ Methods Interfaces
export interface TConsignmentMethods {
  updateProductStatus(
    productIndex: number,
    status: TConsignmentProduct["status"],
    quantity?: number
  ): Promise<TConsignment>;
  addTransaction(
    transactionData: Omit<TTransaction, "_id">
  ): Promise<TConsignment>;
  getProfitSummary(): TProfitSummary;
  updateConsignmentStatus(): void;
}

// ✅ Static Methods Interface
export interface TConsignmentStatics {
  getFinancialReport(
    adminId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TFinancialReport>;
}
