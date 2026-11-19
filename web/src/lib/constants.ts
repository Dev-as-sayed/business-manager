export const USER_ROLES = ["admin", "customer", "supplier"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const CONSIGNMENT_STATUSES = [
  "pending", "in-transit", "delivered", "cancelled",
  "partially-delivered", "refunded",
] as const;
export type ConsignmentStatus = (typeof CONSIGNMENT_STATUSES)[number];

export const PRODUCT_STATUSES = [
  "pending", "delivered", "refunded", "returned", "damaged",
] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_CATEGORIES = ["mobile", "laptop", "accessory", "other"] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const TRANSACTION_METHODS = ["cash", "bank", "mobile", "card", "other"] as const;
export type TransactionMethod = (typeof TRANSACTION_METHODS)[number];

export const TRANSACTION_TYPES = [
  "advance", "payment", "refund", "pay-in", "pay-out",
] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_DIRECTIONS = ["in", "out"] as const;
export type TransactionDirection = (typeof TRANSACTION_DIRECTIONS)[number];

export const TRANSACTION_PARTIES = ["customer", "supplier", "company"] as const;
export type TransactionParty = (typeof TRANSACTION_PARTIES)[number];
