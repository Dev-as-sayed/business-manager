import type {
  ConsignmentProductCategory,
  ConsignmentProductStatus,
  ConsignmentStatus,
  ConsignmentTransactionDirection,
  ConsignmentTransactionMethod,
  ConsignmentTransactionParty,
  ConsignmentTransactionStatus,
  ConsignmentTransactionType,
} from '@prisma/client';

export type DirectoryRole = 'ADMIN' | 'CUSTOMER' | 'SUPPLIER';

export interface ConsignmentProductInput {
  category: ConsignmentProductCategory;
  brand: string;
  model: string;
  specs?: string | null;
  buyingPrice: number;
  sellingPrice: number;
  quantity: number;
  status?: ConsignmentProductStatus;
  deliveredQuantity?: number;
  refundedQuantity?: number;
}

export interface ConsignmentTransactionInput {
  transactionId: string;
  date?: Date;
  amount: number;
  method: ConsignmentTransactionMethod;
  type: ConsignmentTransactionType;
  direction: ConsignmentTransactionDirection;
  party: ConsignmentTransactionParty;
  note?: string | null;
  addBy?: string | null;
  status?: ConsignmentTransactionStatus;
}

export interface CreateConsignmentInput {
  consignmentId: string;
  admin: string;
  supplier: string;
  customer: string;
  products: ConsignmentProductInput[];
  transactions?: ConsignmentTransactionInput[];
  startDate?: Date;
  shippingDate?: Date | null;
  deliveryDate?: Date | null;
  shippingCost?: number;
  status?: ConsignmentStatus;
  destination?: string;
}

export interface UpdateConsignmentInput {
  consignmentId?: string;
  admin?: string;
  supplier?: string;
  customer?: string;
  products?: ConsignmentProductInput[];
  transactions?: ConsignmentTransactionInput[];
  startDate?: Date;
  shippingDate?: Date | null;
  deliveryDate?: Date | null;
  shippingCost?: number;
  status?: ConsignmentStatus;
  destination?: string;
}

export interface ListConsignmentsQuery {
  status?: ConsignmentStatus;
  customerId?: string;
  supplierId?: string;
  destination?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateProductInput {
  index: number;
  product: Partial<ConsignmentProductInput>;
}

export interface CalculatedProduct extends ConsignmentProductInput {
  status: ConsignmentProductStatus;
  deliveredQuantity: number;
  refundedQuantity: number;
  totalBuyingCost: number;
  totalSellingCost: number;
  profit: number;
  profitMargin: number;
}

export interface NormalizedTransaction extends ConsignmentTransactionInput {
  date: Date;
  status: ConsignmentTransactionStatus;
}

export interface ConsignmentTotals {
  shippingCost: number;
  totalAmount: number;
  totalAdvance: number;
  totalDue: number;
  totalProductCost: number;
  totalSellingPrice: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  totalReceived: number;
  totalPaid: number;
}
