import dbConnect from "@/db/db";
import { ConsignmentModel } from "@/db/model/Consignment";
import { UserModel } from "@/db/model/user";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all"; // all, today, week, month, year, custom
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const supplierId = searchParams.get("supplierId");

    // Build date filter based on period
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dateFilter: any = {};
    const now = new Date();

    switch (period) {
      case "today":
        dateFilter = {
          createdAt: {
            $gte: new Date(now.setHours(0, 0, 0, 0)),
            $lte: new Date(now.setHours(23, 59, 59, 999)),
          },
        };
        break;
      case "week":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        dateFilter = { createdAt: { $gte: weekStart } };
        break;
      case "month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { createdAt: { $gte: monthStart } };
        break;
      case "year":
        const yearStart = new Date(now.getFullYear(), 0, 1);
        dateFilter = { createdAt: { $gte: yearStart } };
        break;
      case "custom":
        if (startDate && endDate) {
          dateFilter = {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          };
        }
        break;
      default:
        // 'all' - no date filter
        break;
    }

    // Build main filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { ...dateFilter };
    if (status) filter.status = status;
    if (customerId) filter.customer = customerId;
    if (supplierId) filter.supplier = supplierId;

    // Fetch consignments with populated data
    const consignments = await ConsignmentModel.find(filter)
      .populate("customer", "name email phone")
      .populate("supplier", "name email phone")
      .sort({ createdAt: -1 });

    if (!consignments.length) {
      return successResponse({
        ...getEmptyReportData(),
        message: "No consignments found for the selected criteria",
      });
    }

    // Calculate comprehensive analytics
    const analytics = calculateAnalytics(consignments);
    const statusSummary = calculateStatusSummary(consignments);
    const financialSummary = calculateFinancialSummary(consignments);
    const productAnalytics = calculateProductAnalytics(consignments);
    const paymentAnalytics = calculatePaymentAnalytics(consignments);
    const customerSupplierAnalytics = await calculateCustomerSupplierAnalytics(
      consignments
    );
    const recentActivity = getRecentActivity(consignments);
    const performanceMetrics = calculatePerformanceMetrics(consignments);

    return successResponse({
      summary: {
        totalConsignments: consignments.length,
        period,
        dateRange: dateFilter.createdAt || { $gte: null, $lte: null },
        filters: { status, customerId, supplierId },
      },
      analytics,
      statusSummary,
      financialSummary,
      productAnalytics,
      paymentAnalytics,
      customerSupplierAnalytics,
      recentActivity,
      performanceMetrics,
      rawData: {
        totalCount: consignments.length,
        consignments: consignments.slice(0, 50).map((c) => ({
          id: c._id,
          consignmentId: c.consignmentId,
          customer: c.customer,
          supplier: c.supplier,
          status: c.status,
          totalAmount: c.totalAmount,
          totalDue: c.totalDue,
          netProfit: c.netProfit,
          createdAt: c.createdAt,
        })),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    logger.error("Report API Error", error);
    return errorResponse(message);
  }
}

// Helper functions
function getEmptyReportData() {
  return {
    summary: {
      totalConsignments: 0,
      period: "all",
      dateRange: { $gte: null, $lte: null },
      filters: {},
    },
    analytics: {
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      averageOrderValue: 0,
      profitMargin: 0,
      completionRate: 0,
    },
    statusSummary: {},
    financialSummary: {
      totalSales: 0,
      totalCost: 0,
      grossProfit: 0,
      netProfit: 0,
      totalShipping: 0,
      totalReceived: 0,
      totalDue: 0,
      totalPaid: 0,
    },
    productAnalytics: {
      totalProducts: 0,
      totalDelivered: 0,
      totalPending: 0,
      totalRefunded: 0,
      topCategories: [],
      topBrands: [],
    },
    paymentAnalytics: {
      totalTransactions: 0,
      totalReceived: 0,
      totalPaid: 0,
      paymentMethods: {},
      transactionTypes: {},
    },
    customerSupplierAnalytics: {
      topCustomers: [],
      topSuppliers: [],
      customerCount: 0,
      supplierCount: 0,
    },
    recentActivity: [],
    performanceMetrics: {
      deliveryTime: 0,
      paymentCollectionRate: 0,
      refundRate: 0,
      customerSatisfaction: 0,
    },
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateAnalytics(consignments: any[]) {
  const totalRevenue = consignments.reduce(
    (sum, c) => sum + (c.totalSellingPrice || 0),
    0
  );
  const totalCost = consignments.reduce(
    (sum, c) => sum + (c.totalProductCost || 0),
    0
  );
  const totalProfit = consignments.reduce(
    (sum, c) => sum + (c.netProfit || 0),
    0
  );
  const averageOrderValue = totalRevenue / consignments.length;
  const profitMargin =
    totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const completedConsignments = consignments.filter((c) =>
    ["delivered", "partially-delivered"].includes(c.status)
  ).length;
  const completionRate = (completedConsignments / consignments.length) * 100;

  return {
    totalRevenue,
    totalCost,
    totalProfit,
    averageOrderValue,
    profitMargin,
    completionRate,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateStatusSummary(consignments: any[]) {
  return consignments.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateFinancialSummary(consignments: any[]) {
  const totalSales = consignments.reduce(
    (sum, c) => sum + (c.totalAmount || 0),
    0
  );
  const totalCost = consignments.reduce(
    (sum, c) => sum + (c.totalProductCost || 0),
    0
  );
  const grossProfit = consignments.reduce(
    (sum, c) => sum + (c.grossProfit || 0),
    0
  );
  const netProfit = consignments.reduce(
    (sum, c) => sum + (c.netProfit || 0),
    0
  );
  const totalShipping = consignments.reduce(
    (sum, c) => sum + (c.shippingCost || 0),
    0
  );
  const totalReceived = consignments.reduce(
    (sum, c) => sum + (c.totalReceived || 0),
    0
  );
  const totalDue = consignments.reduce((sum, c) => sum + (c.totalDue || 0), 0);
  const totalPaid = consignments.reduce(
    (sum, c) => sum + (c.totalPaid || 0),
    0
  );

  return {
    totalSales,
    totalCost,
    grossProfit,
    netProfit,
    totalShipping,
    totalReceived,
    totalDue,
    totalPaid,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateProductAnalytics(consignments: any[]) {
  let totalProducts = 0;
  let totalDelivered = 0;
  let totalPending = 0;
  let totalRefunded = 0;
  const categories: Record<string, number> = {};
  const brands: Record<string, number> = {};

  consignments.forEach((consignment) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    consignment.products.forEach((product: any) => {
      totalProducts += product.quantity;
      totalDelivered += product.deliveredQuantity || 0;
      totalPending +=
        product.quantity -
        (product.deliveredQuantity || 0) -
        (product.refundedQuantity || 0);
      totalRefunded += product.refundedQuantity || 0;

      // Track categories
      categories[product.category] =
        (categories[product.category] || 0) + product.quantity;

      // Track brands
      if (product.brand) {
        brands[product.brand] = (brands[product.brand] || 0) + product.quantity;
      }
    });
  });

  // Get top categories and brands
  const topCategories = Object.entries(categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const topBrands = Object.entries(brands)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return {
    totalProducts,
    totalDelivered,
    totalPending,
    totalRefunded,
    topCategories,
    topBrands,
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculatePaymentAnalytics(consignments: any[]) {
  let totalTransactions = 0;
  let totalReceived = 0;
  let totalPaid = 0;
  const paymentMethods: Record<string, number> = {};
  const transactionTypes: Record<string, number> = {};

  consignments.forEach((consignment) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    consignment.transactions.forEach((transaction: any) => {
      totalTransactions++;

      if (transaction.direction === "in") {
        totalReceived += transaction.amount;
      } else {
        totalPaid += transaction.amount;
      }

      // Track payment methods
      paymentMethods[transaction.method] =
        (paymentMethods[transaction.method] || 0) + transaction.amount;

      // Track transaction types
      transactionTypes[transaction.type] =
        (transactionTypes[transaction.type] || 0) + transaction.amount;
    });
  });

  return {
    totalTransactions,
    totalReceived,
    totalPaid,
    paymentMethods,
    transactionTypes,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function calculateCustomerSupplierAnalytics(consignments: any[]) {
  const customerStats: Record<
    string,
    { count: number; totalSpent: number; name: string }
  > = {};
  const supplierStats: Record<
    string,
    { count: number; totalEarned: number; name: string }
  > = {};

  consignments.forEach((consignment) => {
    // Customer stats
    const customerId = consignment.customer._id.toString();
    if (!customerStats[customerId]) {
      customerStats[customerId] = {
        count: 0,
        totalSpent: 0,
        name: consignment.customer.name,
      };
    }
    customerStats[customerId].count++;
    customerStats[customerId].totalSpent += consignment.totalAmount;

    // Supplier stats
    const supplierId = consignment.supplier._id.toString();
    if (!supplierStats[supplierId]) {
      supplierStats[supplierId] = {
        count: 0,
        totalEarned: 0,
        name: consignment.supplier.name,
      };
    }
    supplierStats[supplierId].count++;
    supplierStats[supplierId].totalEarned += consignment.totalProductCost;
  });

  const topCustomers = Object.entries(customerStats)
    .sort(([, a], [, b]) => b.totalSpent - a.totalSpent)
    .slice(0, 5)
    .map(([id, stats]) => ({ id, ...stats }));

  const topSuppliers = Object.entries(supplierStats)
    .sort(([, a], [, b]) => b.totalEarned - a.totalEarned)
    .slice(0, 5)
    .map(([id, stats]) => ({ id, ...stats }));

  // Get total counts
  const customerCount = await UserModel.countDocuments({ role: "customer" });
  const supplierCount = await UserModel.countDocuments({ role: "supplier" });

  return {
    topCustomers,
    topSuppliers,
    customerCount,
    supplierCount,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRecentActivity(consignments: any[]) {
  return consignments.slice(0, 10).map((c) => ({
    id: c._id,
    consignmentId: c.consignmentId,
    customer: c.customer.name,
    status: c.status,
    amount: c.totalAmount,
    profit: c.netProfit,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculatePerformanceMetrics(consignments: any[]) {
  const deliveredConsignments = consignments.filter(
    (c) => c.status === "delivered"
  );

  // Average delivery time
  let totalDeliveryTime = 0;
  deliveredConsignments.forEach((c) => {
    if (c.startDate && c.deliveryDate) {
      const start = new Date(c.startDate);
      const delivery = new Date(c.deliveryDate);
      totalDeliveryTime +=
        (delivery.getTime() - start.getTime()) / (1000 * 60 * 60 * 24); // days
    }
  });
  const deliveryTime =
    deliveredConsignments.length > 0
      ? totalDeliveryTime / deliveredConsignments.length
      : 0;

  // Payment collection rate
  const totalAmount = consignments.reduce(
    (sum, c) => sum + (c.totalAmount || 0),
    0
  );
  const totalReceived = consignments.reduce(
    (sum, c) => sum + (c.totalReceived || 0),
    0
  );
  const paymentCollectionRate =
    totalAmount > 0 ? (totalReceived / totalAmount) * 100 : 0;

  // Refund rate
  const totalProducts = consignments.reduce(
    (sum, c) =>
      sum +
      c.products.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (pSum: number, p: any) => pSum + (p.refundedQuantity || 0),
        0
      ),
    0
  );
  const totalSold = consignments.reduce(
    (sum, c) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sum + c.products.reduce((pSum: number, p: any) => pSum + p.quantity, 0),
    0
  );
  const refundRate = totalSold > 0 ? (totalProducts / totalSold) * 100 : 0;

  // Customer satisfaction (placeholder - would need review data)
  const customerSatisfaction = 85; // This would come from reviews/ratings

  return {
    deliveryTime: Math.round(deliveryTime * 10) / 10, // Round to 1 decimal
    paymentCollectionRate: Math.round(paymentCollectionRate * 10) / 10,
    refundRate: Math.round(refundRate * 10) / 10,
    customerSatisfaction,
  };
}
