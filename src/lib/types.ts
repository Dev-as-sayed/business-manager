export type User = { _id: string; name: string; email: string };

export type Transaction = {
  transactionId: string;
  date: string;
  amount: number;
  method: string;
  type: string;
  direction: "in" | "out";
  party: "customer" | "supplier" | "company";
  note?: string;
  addBy?: string;
  status: string;
};

export type Product = {
  category: string;
  brand: string;
  model: string;
  specs?: string;
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  totalbuyingCost: number;
  totalsellingCost: number;
  status: string;
  deliveredQuantity?: number;
  refundedQuantity?: number;
  profit?: number;
  profitMargin?: number;
  _id?: string;
};

export type Consignment = {
  _id: string;
  consignmentId: string;
  admin?: User;
  supplier: User;
  customer: User;
  products: Product[];
  transactions: Transaction[];
  startDate: string;
  shippingDate?: string;
  deliveryDate?: string;
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
  status: string;
  destination: string;
  productStatus?: {
    total: number;
    delivered: number;
    pending: number;
    refunded: number;
  };
};
