import { Schema, model, models } from "mongoose";
import { TConsignment } from "../interface/Consignment";

// Enhanced transaction schema with better tracking
const transactionSchema = new Schema(
  {
    transactionId: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ["cash", "bank", "mobile", "card", "other"],
      required: true,
    },
    type: {
      type: String,
      enum: ["advance", "payment", "refund", "pay-in", "pay-out"],
      required: true,
    },
    direction: {
      type: String,
      enum: ["in", "out"],
      required: true,
    },
    party: {
      type: String,
      enum: ["customer", "supplier", "company"],
      required: true,
    },
    note: { type: String },
    addBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
  },
  { _id: false }
);

// Enhanced product schema with better status tracking
const consignmentProductSchema = new Schema({
  category: {
    type: String,
    enum: ["mobile", "laptop", "accessory", "other"],
    required: true,
  },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  specs: { type: String },
  buyingPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  totalbuyingCost: { type: Number },
  totalsellingCost: { type: Number },
  status: {
    type: String,
    enum: ["pending", "delivered", "refunded", "returned", "damaged"],
    default: "pending",
  },
  deliveredQuantity: { type: Number, default: 0 },
  refundedQuantity: { type: Number, default: 0 },
  // Profit calculation for individual product
  profit: { type: Number, default: 0 },
  profitMargin: { type: Number, default: 0 },
});

const consignmentSchema = new Schema<TConsignment>(
  {
    consignmentId: { type: String, required: true, unique: true },
    admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
    supplier: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [consignmentProductSchema],
    transactions: [transactionSchema],
    startDate: { type: Date, required: true, default: Date.now },
    shippingDate: { type: Date },
    deliveryDate: { type: Date },
    shippingCost: { type: Number, required: true, default: 0 },

    // Financial totals
    totalAmount: { type: Number, required: true },
    totalAdvance: { type: Number, required: true },
    totalDue: { type: Number, required: true },

    // Cost breakdown
    totalProductCost: { type: Number, required: true },
    totalSellingPrice: { type: Number, required: true },

    // Profit/Loss tracking
    grossProfit: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    profitMargin: { type: Number, default: 0 },

    // Payment tracking
    totalReceived: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },

    status: {
      type: String,
      enum: [
        "pending",
        "in-transit",
        "delivered",
        "cancelled",
        "partially-delivered",
        "refunded",
      ],
      default: "pending",
    },
    destination: { type: String, default: "Bangladesh" },

    // Product status summary
    productStatus: {
      total: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      refunded: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Pre-save middleware for calculations
consignmentSchema.pre("save", function (next) {
  // Calculate product costs
  this.products.forEach((product: any) => {
    product.totalbuyingCost = product.buyingPrice * product.quantity;
    product.totalsellingCost = product.sellingPrice * product.quantity;
    product.profit =
      (product.sellingPrice - product.buyingPrice) * product.quantity;
    product.profitMargin =
      product.buyingPrice > 0
        ? ((product.sellingPrice - product.buyingPrice) / product.buyingPrice) *
          100
        : 0;
  });

  // Calculate totals
  this.totalProductCost = this.products.reduce(
    (sum, p) => sum + (p.totalbuyingCost || 0),
    0
  );

  this.totalSellingPrice = this.products.reduce(
    (sum, p) => sum + (p.totalsellingCost || 0),
    0
  );

  this.totalAmount = this.totalSellingPrice + (this.shippingCost || 0);

  // Calculate transactions
  const customerTransactions = this.transactions.filter(
    (t) =>
      t.party === "customer" && t.direction === "in" && t.status === "completed"
  );

  const supplierTransactions = this.transactions.filter(
    (t) =>
      t.party === "supplier" &&
      t.direction === "out" &&
      t.status === "completed"
  );

  this.totalReceived = customerTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  this.totalPaid = supplierTransactions.reduce((sum, t) => sum + t.amount, 0);
  this.totalAdvance = this.totalReceived;

  // Calculate profit
  this.grossProfit = this.totalSellingPrice - this.totalProductCost;
  this.netProfit = this.grossProfit - (this.shippingCost || 0);
  this.profitMargin =
    this.totalProductCost > 0
      ? (this.netProfit / this.totalProductCost) * 100
      : 0;

  this.totalDue = this.totalAmount - this.totalReceived;

  // Update product status summary
  this.productStatus = {
    total: this.products.length,
    delivered: this.products.filter((p) => p.status === "delivered").length,
    pending: this.products.filter((p) => p.status === "pending").length,
    refunded: this.products.filter((p) => p.status === "refunded").length,
  };

  next();
});

// Method to update product status
consignmentSchema.methods.updateProductStatus = function (
  productIndex: number,
  status: string,
  quantity?: number
) {
  const product = this.products[productIndex];

  if (!product) throw new Error("Product not found");

  product.status = status;

  switch (status) {
    case "delivered":
      product.deliveredQuantity = quantity || product.quantity;
      break;
    case "refunded":
      product.refundedQuantity = quantity || product.quantity;
      break;
  }

  return this.save();
};

// Method to add transaction
consignmentSchema.methods.addTransaction = function (transactionData: any) {
  this.transactions.push(transactionData);
  return this.save();
};

// Method to calculate profit/loss
consignmentSchema.methods.getProfitSummary = function () {
  return {
    grossProfit: this.grossProfit,
    netProfit: this.netProfit,
    profitMargin: this.profitMargin,
    totalRevenue: this.totalSellingPrice,
    totalCost: this.totalProductCost + (this.shippingCost || 0),
    shippingCost: this.shippingCost || 0,
  };
};

// Method to update overall consignment status
consignmentSchema.methods.updateConsignmentStatus = function () {
  const deliveredCount = this.products.filter(
    (p: any) => p.status === "delivered"
  ).length;
  const refundedCount = this.products.filter(
    (p: any) => p.status === "refunded"
  ).length;
  const totalCount = this.products.length;

  if (refundedCount === totalCount) {
    this.status = "refunded";
  } else if (deliveredCount === totalCount) {
    this.status = "delivered";
  } else if (deliveredCount > 0) {
    this.status = "partially-delivered";
  }
};

// Static method for financial reporting
consignmentSchema.statics.getFinancialReport = async function (
  adminId: string,
  startDate?: Date,
  endDate?: Date
) {
  const matchStage: any = { admin: adminId };

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = startDate;
    if (endDate) matchStage.createdAt.$lte = endDate;
  }

  const report = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalSellingPrice" },
        totalCost: { $sum: "$totalProductCost" },
        totalShipping: { $sum: "$shippingCost" },
        totalNetProfit: { $sum: "$netProfit" },
        totalGrossProfit: { $sum: "$grossProfit" },
        totalReceived: { $sum: "$totalReceived" },
        totalDue: { $sum: "$totalDue" },
        count: { $sum: 1 },
      },
    },
  ]);

  return (
    report[0] || {
      totalRevenue: 0,
      totalCost: 0,
      totalShipping: 0,
      totalNetProfit: 0,
      totalGrossProfit: 0,
      totalReceived: 0,
      totalDue: 0,
      count: 0,
    }
  );
};

export const ConsignmentModel =
  models.Consignment || model<TConsignment>("Consignment", consignmentSchema);
