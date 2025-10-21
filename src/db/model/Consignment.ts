import { Schema, model } from "mongoose";
import { TConsignment } from "../interface/Consignment";
import { models } from "mongoose";

const transactionSchema = new Schema(
  {
    transactionId: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ["cash", "bank", "mobile", "card", "other"],
      required: true,
    },
    type: {
      type: String,
      enum: ["advance", "payment", "refund"],
      required: true,
    },
    note: { type: String },
    receivedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const consignmentProductSchema = new Schema(
  {
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
  },
  { _id: false }
);

const consignmentSchema = new Schema<TConsignment>(
  {
    consignmentId: { type: String, required: true, unique: true },
    supplier: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [consignmentProductSchema],
    transactions: [transactionSchema], // 💰 Array of transaction records
    startDate: { type: Date, required: true },
    shippingDate: { type: Date },
    deliveryDate: { type: Date },
    shippingCost: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    totalAdvance: { type: Number, required: true },
    totalDue: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "in-transit", "delivered", "cancelled"],
      default: "pending",
    },
    destination: { type: String, required: true },
  },
  { timestamps: true }
);

// 🧮 Pre-save hook for automatic totals
consignmentSchema.pre("save", function (next) {
  // Calculate totalbuyingCost and totalsellingCost
  this.products.forEach((p) => {
    p.totalbuyingCost = p.buyingPrice * p.quantity;
    p.totalsellingCost = p.sellingPrice * p.quantity;
  });

  const productTotal = this.products.reduce(
    (sum, p) => sum + (p.totalsellingCost || 0),
    0
  );

  this.totalAmount = productTotal + this.shippingCost;

  // Calculate advance & due from transactions
  const totalAdvance = this.transactions
    .filter((t) => t.type === "advance" || t.type === "payment")
    .reduce((sum, t) => sum + t.amount, 0);

  this.totalAdvance = totalAdvance;
  this.totalDue = this.totalAmount - totalAdvance;

  next();
});

export const ConsignmentModel =
  models.Consignment || model<TConsignment>("Consignment", consignmentSchema);
