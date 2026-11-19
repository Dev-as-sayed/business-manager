import { Prisma, type ConsignmentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ReportsQuery } from '@/modules/reports/reports.types';

const reportInclude = {
  customer: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
  products: true,
  transactions: true,
} satisfies Prisma.ConsignmentInclude;

type ReportConsignment = Prisma.ConsignmentGetPayload<{
  include: typeof reportInclude;
}>;

const toNumber = (value: Prisma.Decimal | number | null | undefined): number =>
  value === null || value === undefined ? 0 : Number(value);

const round = (value: number, decimals = 2): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const toWebStatus = (status: ConsignmentStatus): string => status.toLowerCase().replace(/_/g, '-');

const buildDateRange = (
  period: ReportsQuery['period'],
  startDate?: Date,
  endDate?: Date,
): { gte?: Date; lte?: Date } => {
  const now = new Date();

  switch (period) {
    case 'today': {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { gte: start, lte: end };
    }
    case 'week': {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      return { gte: start };
    }
    case 'month':
      return { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
    case 'year':
      return { gte: new Date(now.getFullYear(), 0, 1) };
    case 'custom':
      return {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    default:
      return {};
  }
};

const calculateAnalytics = (consignments: ReportConsignment[]) => {
  const totalRevenue = consignments.reduce(
    (sum, consignment) => sum + toNumber(consignment.totalSellingPrice),
    0,
  );
  const totalCost = consignments.reduce(
    (sum, consignment) => sum + toNumber(consignment.totalProductCost),
    0,
  );
  const totalProfit = consignments.reduce(
    (sum, consignment) => sum + toNumber(consignment.netProfit),
    0,
  );
  const averageOrderValue = consignments.length > 0 ? totalRevenue / consignments.length : 0;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const completedConsignments = consignments.filter((consignment) =>
    ['DELIVERED', 'PARTIALLY_DELIVERED'].includes(consignment.status),
  ).length;
  const completionRate =
    consignments.length > 0 ? (completedConsignments / consignments.length) * 100 : 0;

  return {
    totalRevenue: round(totalRevenue),
    totalCost: round(totalCost),
    totalProfit: round(totalProfit),
    averageOrderValue: round(averageOrderValue),
    profitMargin: round(profitMargin),
    completionRate: round(completionRate),
  };
};

const calculateStatusSummary = (consignments: ReportConsignment[]) =>
  consignments.reduce<Record<string, number>>((summary, consignment) => {
    const status = toWebStatus(consignment.status);
    summary[status] = (summary[status] ?? 0) + 1;
    return summary;
  }, {});

const calculateFinancialSummary = (consignments: ReportConsignment[]) => {
  const totalSales = consignments.reduce(
    (sum, consignment) => sum + toNumber(consignment.totalAmount),
    0,
  );
  const totalCost = consignments.reduce(
    (sum, consignment) => sum + toNumber(consignment.totalProductCost),
    0,
  );
  const grossProfit = consignments.reduce(
    (sum, consignment) => sum + toNumber(consignment.grossProfit),
    0,
  );
  const netProfit = consignments.reduce(
    (sum, consignment) => sum + toNumber(consignment.netProfit),
    0,
  );
  const totalShipping = consignments.reduce(
    (sum, consignment) => sum + toNumber(consignment.shippingCost),
    0,
  );
  const totalReceived = consignments.reduce(
    (sum, consignment) => sum + toNumber(consignment.totalReceived),
    0,
  );
  const totalDue = consignments.reduce(
    (sum, consignment) => sum + toNumber(consignment.totalDue),
    0,
  );
  const totalPaid = consignments.reduce(
    (sum, consignment) => sum + toNumber(consignment.totalPaid),
    0,
  );

  return {
    totalSales: round(totalSales),
    totalCost: round(totalCost),
    grossProfit: round(grossProfit),
    netProfit: round(netProfit),
    totalShipping: round(totalShipping),
    totalReceived: round(totalReceived),
    totalDue: round(totalDue),
    totalPaid: round(totalPaid),
  };
};

const calculateProductAnalytics = (consignments: ReportConsignment[]) => {
  let totalProducts = 0;
  let totalDelivered = 0;
  let totalPending = 0;
  let totalRefunded = 0;
  const categories: Record<string, number> = {};
  const brands: Record<string, number> = {};

  for (const consignment of consignments) {
    for (const product of consignment.products) {
      totalProducts += product.quantity;
      totalDelivered += product.deliveredQuantity;
      totalPending += product.quantity - product.deliveredQuantity - product.refundedQuantity;
      totalRefunded += product.refundedQuantity;

      const category = product.category.toLowerCase();
      categories[category] = (categories[category] ?? 0) + product.quantity;

      if (product.brand) {
        brands[product.brand] = (brands[product.brand] ?? 0) + product.quantity;
      }
    }
  }

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
};

const calculatePaymentAnalytics = (consignments: ReportConsignment[]) => {
  let totalTransactions = 0;
  let totalReceived = 0;
  let totalPaid = 0;
  const paymentMethods: Record<string, number> = {};
  const transactionTypes: Record<string, number> = {};

  for (const consignment of consignments) {
    for (const transaction of consignment.transactions) {
      totalTransactions += 1;
      const amount = toNumber(transaction.amount);

      if (transaction.direction === 'IN') {
        totalReceived += amount;
      } else {
        totalPaid += amount;
      }

      const method = transaction.method.toLowerCase();
      paymentMethods[method] = (paymentMethods[method] ?? 0) + amount;

      const type = transaction.type.toLowerCase().replace(/_/g, '-');
      transactionTypes[type] = (transactionTypes[type] ?? 0) + amount;
    }
  }

  return {
    totalTransactions,
    totalReceived: round(totalReceived),
    totalPaid: round(totalPaid),
    paymentMethods,
    transactionTypes,
  };
};

const calculateCustomerSupplierAnalytics = async (consignments: ReportConsignment[]) => {
  const customerStats: Record<string, { count: number; totalSpent: number; name: string }> = {};
  const supplierStats: Record<string, { count: number; totalEarned: number; name: string }> = {};

  for (const consignment of consignments) {
    const customer = customerStats[consignment.customer.id] ?? {
      count: 0,
      totalSpent: 0,
      name: consignment.customer.name,
    };
    customer.count += 1;
    customer.totalSpent += toNumber(consignment.totalAmount);
    customerStats[consignment.customer.id] = customer;

    const supplier = supplierStats[consignment.supplier.id] ?? {
      count: 0,
      totalEarned: 0,
      name: consignment.supplier.name,
    };
    supplier.count += 1;
    supplier.totalEarned += toNumber(consignment.totalProductCost);
    supplierStats[consignment.supplier.id] = supplier;
  }

  const topCustomers = Object.entries(customerStats)
    .sort(([, a], [, b]) => b.totalSpent - a.totalSpent)
    .slice(0, 5)
    .map(([id, stats]) => ({
      id,
      ...stats,
      totalSpent: round(stats.totalSpent),
    }));

  const topSuppliers = Object.entries(supplierStats)
    .sort(([, a], [, b]) => b.totalEarned - a.totalEarned)
    .slice(0, 5)
    .map(([id, stats]) => ({
      id,
      ...stats,
      totalEarned: round(stats.totalEarned),
    }));

  const [customerCount, supplierCount] = await prisma.$transaction([
    prisma.customer.count({ where: { deletedAt: null } }),
    prisma.supplier.count({ where: { deletedAt: null } }),
  ]);

  return { topCustomers, topSuppliers, customerCount, supplierCount };
};

const getRecentActivity = (consignments: ReportConsignment[]) =>
  consignments.slice(0, 10).map((consignment) => ({
    id: consignment.id,
    consignmentId: consignment.consignmentId,
    customer: consignment.customer.name,
    status: toWebStatus(consignment.status),
    amount: toNumber(consignment.totalAmount),
    profit: toNumber(consignment.netProfit),
    createdAt: consignment.createdAt,
    updatedAt: consignment.updatedAt,
  }));

const calculatePerformanceMetrics = (consignments: ReportConsignment[]) => {
  const deliveredConsignments = consignments.filter(
    (consignment) => consignment.status === 'DELIVERED',
  );

  let totalDeliveryTime = 0;
  let deliverySamples = 0;

  for (const consignment of deliveredConsignments) {
    if (consignment.deliveryDate) {
      totalDeliveryTime +=
        (consignment.deliveryDate.getTime() - consignment.startDate.getTime()) /
        (1000 * 60 * 60 * 24);
      deliverySamples += 1;
    }
  }

  const deliveryTime = deliverySamples > 0 ? totalDeliveryTime / deliverySamples : 0;

  const totalAmount = consignments.reduce(
    (sum, consignment) => sum + toNumber(consignment.totalAmount),
    0,
  );
  const totalReceived = consignments.reduce(
    (sum, consignment) => sum + toNumber(consignment.totalReceived),
    0,
  );
  const paymentCollectionRate = totalAmount > 0 ? (totalReceived / totalAmount) * 100 : 0;

  let totalRefunded = 0;
  let totalSold = 0;

  for (const consignment of consignments) {
    for (const product of consignment.products) {
      totalRefunded += product.refundedQuantity;
      totalSold += product.quantity;
    }
  }

  const refundRate = totalSold > 0 ? (totalRefunded / totalSold) * 100 : 0;

  return {
    deliveryTime: round(deliveryTime, 1),
    paymentCollectionRate: round(paymentCollectionRate, 1),
    refundRate: round(refundRate, 1),
    customerSatisfaction: 85,
  };
};

const emptyReport = (period: string, filters: Record<string, unknown>) => ({
  summary: {
    totalConsignments: 0,
    period,
    dateRange: { gte: null, lte: null },
    filters,
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
  rawData: { totalCount: 0, consignments: [] },
  message: 'No consignments found for the selected criteria',
});

export const getReports = async (query: ReportsQuery) => {
  const period = query.period ?? 'all';
  const dateRange = buildDateRange(period, query.startDate, query.endDate);
  const filters = {
    status: query.status ?? null,
    customerId: query.customerId ?? null,
    supplierId: query.supplierId ?? null,
  };

  const where: Prisma.ConsignmentWhereInput = {
    deletedAt: null,
    ...(query.status ? { status: query.status } : {}),
    ...(query.customerId ? { customerId: query.customerId } : {}),
    ...(query.supplierId ? { supplierId: query.supplierId } : {}),
    ...(dateRange.gte || dateRange.lte
      ? {
          createdAt: {
            ...(dateRange.gte ? { gte: dateRange.gte } : {}),
            ...(dateRange.lte ? { lte: dateRange.lte } : {}),
          },
        }
      : {}),
  };

  const consignments = await prisma.consignment.findMany({
    where,
    include: reportInclude,
    orderBy: { createdAt: 'desc' },
  });

  if (consignments.length === 0) {
    return emptyReport(period, filters);
  }

  const customerSupplierAnalytics = await calculateCustomerSupplierAnalytics(consignments);

  return {
    summary: {
      totalConsignments: consignments.length,
      period,
      dateRange: {
        gte: dateRange.gte?.toISOString() ?? null,
        lte: dateRange.lte?.toISOString() ?? null,
      },
      filters,
    },
    analytics: calculateAnalytics(consignments),
    statusSummary: calculateStatusSummary(consignments),
    financialSummary: calculateFinancialSummary(consignments),
    productAnalytics: calculateProductAnalytics(consignments),
    paymentAnalytics: calculatePaymentAnalytics(consignments),
    customerSupplierAnalytics,
    recentActivity: getRecentActivity(consignments),
    performanceMetrics: calculatePerformanceMetrics(consignments),
    rawData: {
      totalCount: consignments.length,
      consignments: consignments.slice(0, 50).map((consignment) => ({
        id: consignment.id,
        consignmentId: consignment.consignmentId,
        customer: consignment.customer,
        supplier: consignment.supplier,
        status: toWebStatus(consignment.status),
        totalAmount: toNumber(consignment.totalAmount),
        totalDue: toNumber(consignment.totalDue),
        netProfit: toNumber(consignment.netProfit),
        createdAt: consignment.createdAt,
      })),
    },
  };
};
