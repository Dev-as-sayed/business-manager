import "dotenv/config";
import dbConnect from "./db";
import { UserModel } from "./model/user";
import { ConsignmentModel } from "./model/Consignment";
import { logger } from "../lib/logger";

async function seed() {
  logger.info("Connecting to database...");
  await dbConnect();
  logger.success("Connected to database");

  logger.info("Clearing existing data...");
  await UserModel.deleteMany({});
  await ConsignmentModel.deleteMany({});
  logger.success("Existing data cleared");

  // ── Users ──────────────────────────────────────────────
  console.log("👤 Creating users...");

  const admin = await UserModel.create({
    name: "Admin User",
    email: "admin@business.com",
    password: "admin123",
    phone: "+8801700000001",
    address: "Dhaka, Bangladesh",
    role: "admin",
    isActive: true,
  });

  const customer1 = await UserModel.create({
    name: "Rahim Mia",
    email: "rahim@example.com",
    password: "customer123",
    phone: "+8801700000002",
    address: "Gulshan, Dhaka",
    role: "customer",
    isActive: true,
  });

  const customer2 = await UserModel.create({
    name: "Karim Hossain",
    email: "karim@example.com",
    password: "customer123",
    phone: "+8801700000003",
    address: "Uttara, Dhaka",
    role: "customer",
    isActive: true,
  });

  const customer3 = await UserModel.create({
    name: "Fatima Begum",
    email: "fatima@example.com",
    password: "customer123",
    phone: "+8801700000004",
    address: "Mirpur, Dhaka",
    role: "customer",
    isActive: true,
  });

  const supplier1 = await UserModel.create({
    name: "Mobile Hub BD",
    email: "info@mobilehub.com",
    password: "supplier123",
    phone: "+8801700000005",
    address: "Elephant Road, Dhaka",
    role: "supplier",
    isActive: true,
  });

  const supplier2 = await UserModel.create({
    name: "Tech Traders",
    email: "info@techtraders.com",
    password: "supplier123",
    phone: "+8801700000006",
    address: "Kawran Bazar, Dhaka",
    role: "supplier",
    isActive: true,
  });

  logger.success("Users created");
  logger.info(`Admin: admin@business.com / admin123`);
  logger.info(`Customers: rahim@example.com, karim@example.com, fatima@example.com`);
  logger.info(`Suppliers: info@mobilehub.com, info@techtraders.com`);
  logger.info(`(all customers/suppliers password: customer123 / supplier123)`);

  // ── Consignments ───────────────────────────────────────
  console.log("📦 Creating consignments...");

  // Consignment 1: Delivered mobile phones
  const consignment1 = await ConsignmentModel.create({
    consignmentId: "CNS-2025-001",
    admin: admin._id,
    supplier: supplier1._id,
    customer: customer1._id,
    products: [
      {
        category: "mobile",
        brand: "Samsung",
        model: "Galaxy S24 Ultra",
        specs: "12GB RAM, 256GB Storage, Titanium Gray",
        buyingPrice: 85000,
        sellingPrice: 95000,
        quantity: 10,
        status: "delivered",
        deliveredQuantity: 10,
      },
      {
        category: "mobile",
        brand: "Apple",
        model: "iPhone 15 Pro Max",
        specs: "8GB RAM, 256GB Storage, Natural Titanium",
        buyingPrice: 120000,
        sellingPrice: 135000,
        quantity: 5,
        status: "delivered",
        deliveredQuantity: 5,
      },
      {
        category: "accessory",
        brand: "Samsung",
        model: "Galaxy Buds Pro 2",
        specs: "Wireless Earbuds, White",
        buyingPrice: 8000,
        sellingPrice: 12000,
        quantity: 20,
        status: "delivered",
        deliveredQuantity: 20,
      },
    ],
    transactions: [
      {
        transactionId: "TXN-001",
        date: new Date("2025-01-05"),
        amount: 500000,
        method: "bank",
        type: "advance",
        direction: "in",
        party: "customer",
        note: "Advance payment via bank transfer",
        status: "completed",
      },
      {
        transactionId: "TXN-002",
        date: new Date("2025-01-15"),
        amount: 600000,
        method: "cash",
        type: "payment",
        direction: "in",
        party: "customer",
        note: "Final payment on delivery",
        status: "completed",
      },
      {
        transactionId: "TXN-003",
        date: new Date("2025-01-03"),
        amount: 850000,
        method: "bank",
        type: "pay-out",
        direction: "out",
        party: "supplier",
        note: "Payment to supplier for stock",
        status: "completed",
      },
    ],
    startDate: new Date("2025-01-01"),
    shippingDate: new Date("2025-01-08"),
    deliveryDate: new Date("2025-01-15"),
    shippingCost: 5000,
    destination: "Gulshan, Dhaka",
    status: "delivered",
  });

  // Consignment 2: In-transit laptops
  const consignment2 = await ConsignmentModel.create({
    consignmentId: "CNS-2025-002",
    admin: admin._id,
    supplier: supplier2._id,
    customer: customer2._id,
    products: [
      {
        category: "laptop",
        brand: "Apple",
        model: "MacBook Pro M3",
        specs: "16GB RAM, 512GB SSD, Space Gray",
        buyingPrice: 160000,
        sellingPrice: 185000,
        quantity: 3,
        status: "delivered",
        deliveredQuantity: 3,
      },
      {
        category: "laptop",
        brand: "Dell",
        model: "XPS 15",
        specs: "32GB RAM, 1TB SSD, Intel i9",
        buyingPrice: 140000,
        sellingPrice: 160000,
        quantity: 5,
        status: "pending",
        deliveredQuantity: 0,
      },
      {
        category: "accessory",
        brand: "Logitech",
        model: "MX Master 3S",
        specs: "Wireless Mouse, Graphite",
        buyingPrice: 5000,
        sellingPrice: 8500,
        quantity: 15,
        status: "pending",
        deliveredQuantity: 0,
      },
    ],
    transactions: [
      {
        transactionId: "TXN-004",
        date: new Date("2025-02-10"),
        amount: 300000,
        method: "mobile",
        type: "advance",
        direction: "in",
        party: "customer",
        note: "Advance via bKash",
        status: "completed",
      },
      {
        transactionId: "TXN-005",
        date: new Date("2025-02-08"),
        amount: 750000,
        method: "bank",
        type: "pay-out",
        direction: "out",
        party: "supplier",
        note: "Partial supplier payment",
        status: "completed",
      },
    ],
    startDate: new Date("2025-02-05"),
    shippingDate: new Date("2025-02-12"),
    shippingCost: 4000,
    destination: "Uttara, Dhaka",
    status: "in-transit",
  });

  // Consignment 3: Pending (small order)
  const consignment3 = await ConsignmentModel.create({
    consignmentId: "CNS-2025-003",
    admin: admin._id,
    supplier: supplier1._id,
    customer: customer3._id,
    products: [
      {
        category: "mobile",
        brand: "Xiaomi",
        model: "Redmi Note 13 Pro",
        specs: "8GB RAM, 256GB Storage, Midnight Black",
        buyingPrice: 25000,
        sellingPrice: 32000,
        quantity: 25,
        status: "pending",
        deliveredQuantity: 0,
      },
    ],
    transactions: [
      {
        transactionId: "TXN-006",
        date: new Date("2025-03-01"),
        amount: 200000,
        method: "cash",
        type: "advance",
        direction: "in",
        party: "customer",
        note: "Cash advance",
        status: "pending",
      },
    ],
    startDate: new Date("2025-03-01"),
    shippingCost: 3000,
    destination: "Mirpur, Dhaka",
    status: "pending",
  });

  // Consignment 4: Completed with mixed status
  const consignment4 = await ConsignmentModel.create({
    consignmentId: "CNS-2025-004",
    admin: admin._id,
    supplier: supplier2._id,
    customer: customer1._id,
    products: [
      {
        category: "laptop",
        brand: "HP",
        model: "Spectre x360",
        specs: "16GB RAM, 512GB SSD, Intel i7",
        buyingPrice: 110000,
        sellingPrice: 135000,
        quantity: 4,
        status: "delivered",
        deliveredQuantity: 4,
      },
      {
        category: "accessory",
        brand: "Samsung",
        model: "T7 Shield 1TB",
        specs: "External SSD, IP65 rated",
        buyingPrice: 9000,
        sellingPrice: 14000,
        quantity: 10,
        status: "refunded",
        refundedQuantity: 10,
      },
    ],
    transactions: [
      {
        transactionId: "TXN-007",
        date: new Date("2025-03-15"),
        amount: 400000,
        method: "bank",
        type: "advance",
        direction: "in",
        party: "customer",
        note: "Advance payment",
        status: "completed",
      },
      {
        transactionId: "TXN-008",
        date: new Date("2025-03-25"),
        amount: 140000,
        method: "bank",
        type: "refund",
        direction: "out",
        party: "customer",
        note: "Refund for returned SSDs",
        status: "completed",
      },
      {
        transactionId: "TXN-009",
        date: new Date("2025-03-20"),
        amount: 450000,
        method: "bank",
        type: "pay-out",
        direction: "out",
        party: "supplier",
        note: "Full supplier payment",
        status: "completed",
      },
    ],
    startDate: new Date("2025-03-10"),
    shippingDate: new Date("2025-03-18"),
    deliveryDate: new Date("2025-03-22"),
    shippingCost: 3000,
    destination: "Gulshan, Dhaka",
    status: "partially-delivered",
  });

  // Update users with their consignment references
  await UserModel.findByIdAndUpdate(customer1._id, {
    $push: {
      consignment: { $each: [consignment1._id, consignment4._id] },
    },
  });
  await UserModel.findByIdAndUpdate(customer2._id, {
    $push: { consignment: consignment2._id },
  });
  await UserModel.findByIdAndUpdate(customer3._id, {
    $push: { consignment: consignment3._id },
  });

  logger.success("Consignments created");
  logger.info(`1. CNS-2025-001 — Samsung/Apple mobile order to Rahim — delivered`);
  logger.info(`2. CNS-2025-002 — MacBook/Dell laptop order to Karim — in-transit`);
  logger.info(`3. CNS-2025-003 — Xiaomi phone order to Fatima — pending`);
  logger.info(`4. CNS-2025-004 — HP laptop + Samsung SSD to Rahim — partially-delivered`);
  logger.success("Seeding complete!");
  logger.info(`Users: 6 (1 admin, 3 customers, 2 suppliers)`);
  logger.info(`Consignments: 4`);

  process.exit(0);
}

seed().catch((err) => {
  logger.error("Seed failed", err);
  process.exit(1);
});
