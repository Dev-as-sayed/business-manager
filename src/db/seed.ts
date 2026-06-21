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
  await Promise.all([
    UserModel.deleteMany({}),
    ConsignmentModel.deleteMany({}),
  ]);
  logger.success("Existing data cleared");

  // ── Admin ──
  const admin = await UserModel.create({
    name: "Admin User",
    email: "admin@business.com",
    password: "admin123",
    phone: "+8801700000001",
    address: "Dhaka, Bangladesh",
    role: "admin",
    isActive: true,
  });
  logger.success(`Admin created: ${admin.email}`);

  // ── Customers ──
  const customers = await UserModel.create([
    {
      name: "Rahim Mia",
      email: "rahim@example.com",
      password: "pass123",
      phone: "+8801700000002",
      address: "Mirpur, Dhaka",
      role: "customer",
      isActive: true,
    },
    {
      name: "Karim Hossain",
      email: "karim@example.com",
      password: "pass123",
      phone: "+8801700000003",
      address: "Uttara, Dhaka",
      role: "customer",
      isActive: true,
    },
    {
      name: "Fatima Begum",
      email: "fatima@example.com",
      password: "pass123",
      phone: "+8801700000004",
      address: "Banani, Dhaka",
      role: "customer",
      isActive: true,
    },
  ]);
  logger.success(`${customers.length} customers created`);

  // ── Suppliers ──
  const suppliers = await UserModel.create([
    {
      name: "Global Tech Ltd",
      email: "supplier1@example.com",
      password: "pass123",
      phone: "+8801700000010",
      address: "Kawran Bazar, Dhaka",
      role: "supplier",
      isActive: true,
    },
    {
      name: "Mobile World BD",
      email: "supplier2@example.com",
      password: "pass123",
      phone: "+8801700000011",
      address: "Elephant Road, Dhaka",
      role: "supplier",
      isActive: true,
    },
    {
      name: "Laptop Hub",
      email: "supplier3@example.com",
      password: "pass123",
      phone: "+8801700000012",
      address: "Gulshan, Dhaka",
      role: "supplier",
      isActive: true,
    },
  ]);
  logger.success(`${suppliers.length} suppliers created`);

  // ── Consignments ──
  const consignments = await ConsignmentModel.create([
    {
      consignmentId: "CNS-2025-001",
      admin: admin._id,
      supplier: suppliers[0]._id,
      customer: customers[0]._id,
      startDate: new Date("2025-01-15"),
      shippingDate: new Date("2025-01-18"),
      deliveryDate: new Date("2025-01-22"),
      shippingCost: 500,
      destination: "Mirpur, Dhaka",
      status: "delivered",
      totalProductCost: 0,
      totalSellingPrice: 0,
      totalAmount: 0,
      totalAdvance: 0,
      totalDue: 0,
      products: [
        {
          category: "mobile",
          brand: "Samsung",
          model: "Galaxy S24 Ultra",
          specs: "12GB RAM, 256GB Storage",
          buyingPrice: 85000,
          sellingPrice: 95000,
          quantity: 5,
          status: "delivered",
          deliveredQuantity: 5,
        },
        {
          category: "mobile",
          brand: "iPhone",
          model: "15 Pro Max",
          specs: "256GB, Titanium",
          buyingPrice: 120000,
          sellingPrice: 135000,
          quantity: 3,
          status: "delivered",
          deliveredQuantity: 3,
        },
      ],
      transactions: [
        {
          transactionId: "TXN-001",
          date: new Date("2025-01-15"),
          amount: 50000,
          method: "bank",
          type: "advance",
          direction: "in",
          party: "customer",
          note: "Advance payment",
          status: "completed",
        },
        {
          transactionId: "TXN-002",
          date: new Date("2025-01-22"),
          amount: 410000,
          method: "cash",
          type: "payment",
          direction: "in",
          party: "customer",
          note: "Final payment",
          status: "completed",
        },
        {
          transactionId: "TXN-003",
          date: new Date("2025-01-17"),
          amount: 450000,
          method: "bank",
          type: "pay-out",
          direction: "out",
          party: "supplier",
          note: "Supplier payment",
          status: "completed",
        },
      ],
    },
    {
      consignmentId: "CNS-2025-002",
      admin: admin._id,
      supplier: suppliers[1]._id,
      customer: customers[1]._id,
      startDate: new Date("2025-02-01"),
      shippingDate: new Date("2025-02-05"),
      shippingCost: 300,
      destination: "Uttara, Dhaka",
      status: "in-transit",
      totalProductCost: 0,
      totalSellingPrice: 0,
      totalAmount: 0,
      totalAdvance: 0,
      totalDue: 0,
      products: [
        {
          category: "laptop",
          brand: "Apple",
          model: "MacBook Pro M3",
          specs: "16GB RAM, 512GB SSD",
          buyingPrice: 140000,
          sellingPrice: 165000,
          quantity: 2,
          status: "pending",
        },
        {
          category: "accessory",
          brand: "Apple",
          model: "AirPods Pro 2",
          specs: "USB-C",
          buyingPrice: 18000,
          sellingPrice: 22000,
          quantity: 10,
          status: "pending",
        },
      ],
      transactions: [
        {
          transactionId: "TXN-004",
          date: new Date("2025-02-01"),
          amount: 100000,
          method: "mobile",
          type: "advance",
          direction: "in",
          party: "customer",
          note: "Advance from customer",
          status: "completed",
        },
      ],
    },
    {
      consignmentId: "CNS-2025-003",
      admin: admin._id,
      supplier: suppliers[2]._id,
      customer: customers[2]._id,
      startDate: new Date("2025-02-10"),
      shippingCost: 200,
      destination: "Banani, Dhaka",
      status: "pending",
      totalProductCost: 0,
      totalSellingPrice: 0,
      totalAmount: 0,
      totalAdvance: 0,
      totalDue: 0,
      products: [
        {
          category: "laptop",
          brand: "Dell",
          model: "XPS 15",
          specs: "32GB RAM, 1TB SSD",
          buyingPrice: 130000,
          sellingPrice: 150000,
          quantity: 1,
          status: "pending",
        },
        {
          category: "mobile",
          brand: "OnePlus",
          model: "12",
          specs: "16GB RAM, 512GB Storage",
          buyingPrice: 55000,
          sellingPrice: 65000,
          quantity: 4,
          status: "pending",
        },
      ],
      transactions: [],
    },
    {
      consignmentId: "CNS-2025-004",
      admin: admin._id,
      supplier: suppliers[0]._id,
      customer: customers[0]._id,
      startDate: new Date("2025-03-01"),
      shippingDate: new Date("2025-03-03"),
      deliveryDate: new Date("2025-03-08"),
      shippingCost: 400,
      destination: "Mirpur, Dhaka",
      status: "delivered",
      totalProductCost: 0,
      totalSellingPrice: 0,
      totalAmount: 0,
      totalAdvance: 0,
      totalDue: 0,
      products: [
        {
          category: "mobile",
          brand: "Xiaomi",
          model: "14 Pro",
          specs: "12GB RAM, 256GB Storage",
          buyingPrice: 60000,
          sellingPrice: 72000,
          quantity: 8,
          status: "delivered",
          deliveredQuantity: 8,
        },
      ],
      transactions: [
        {
          transactionId: "TXN-005",
          date: new Date("2025-03-01"),
          amount: 200000,
          method: "bank",
          type: "advance",
          direction: "in",
          party: "customer",
          note: "Advance",
          status: "completed",
        },
        {
          transactionId: "TXN-006",
          date: new Date("2025-03-08"),
          amount: 376000,
          method: "cash",
          type: "payment",
          direction: "in",
          party: "customer",
          note: "Final payment",
          status: "completed",
        },
        {
          transactionId: "TXN-007",
          date: new Date("2025-03-02"),
          amount: 500000,
          method: "bank",
          type: "pay-out",
          direction: "out",
          party: "supplier",
          note: "Supplier payment",
          status: "completed",
        },
      ],
    },
    {
      consignmentId: "CNS-2025-005",
      admin: admin._id,
      supplier: suppliers[1]._id,
      customer: customers[1]._id,
      startDate: new Date("2025-03-15"),
      shippingCost: 250,
      destination: "Uttara, Dhaka",
      status: "cancelled",
      totalProductCost: 0,
      totalSellingPrice: 0,
      totalAmount: 0,
      totalAdvance: 0,
      totalDue: 0,
      products: [
        {
          category: "accessory",
          brand: "Anker",
          model: "Power Bank 20000mAh",
          specs: "USB-C PD 65W",
          buyingPrice: 2500,
          sellingPrice: 3500,
          quantity: 50,
          status: "pending",
        },
      ],
      transactions: [
        {
          transactionId: "TXN-008",
          date: new Date("2025-03-15"),
          amount: 50000,
          method: "mobile",
          type: "advance",
          direction: "in",
          party: "customer",
          note: "Advance (refunded after cancellation)",
          status: "completed",
        },
        {
          transactionId: "TXN-009",
          date: new Date("2025-03-18"),
          amount: 50000,
          method: "mobile",
          type: "refund",
          direction: "out",
          party: "customer",
          note: "Full refund due to cancellation",
          status: "completed",
        },
      ],
    },
  ]);
  logger.success(`${consignments.length} consignments created`);

  // ── Update user consignment references ──
  for (const consignment of consignments) {
    const adminUser = await UserModel.findById(consignment.admin);
    if (adminUser) {
      adminUser.consignment.push(consignment._id);
      await adminUser.save();
    }

    const customerUser = await UserModel.findById(consignment.customer);
    if (customerUser) {
      customerUser.consignment.push(consignment._id);
      await customerUser.save();
    }

    const supplierUser = await UserModel.findById(consignment.supplier);
    if (supplierUser) {
      supplierUser.consignment.push(consignment._id);
      await supplierUser.save();
    }
  }
  logger.success("User consignment references updated");

  logger.info("");
  logger.info("═══════════════════════════════════════════");
  logger.info("         SEED COMPLETE");
  logger.info("═══════════════════════════════════════════");
  logger.info("  Admin:    admin@business.com / admin123");
  logger.info("  Customers: rahim@example.com, karim@example.com, fatima@example.com");
  logger.info("  Suppliers: supplier1@example.com, supplier2@example.com, supplier3@example.com");
  logger.info("  Password:  pass123 (for all sample users)");
  logger.info("  Consignments: 5 created (various statuses)");
  logger.info("═══════════════════════════════════════════");
  logger.info("");

  process.exit(0);
}

seed().catch((err) => {
  logger.error("Seed failed", err);
  process.exit(1);
});
