import {
  Prisma,
  type ConsignmentProduct,
  type ConsignmentProductStatus,
  type ConsignmentStatus,
  type ConsignmentTransaction,
  type ConsignmentTransactionStatus,
} from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/shared/errors/ApiError';
import { writeAuditLog } from '@/shared/services/auditLog.service';
import type { AuthUser, RequestMeta } from '@/shared/types';
import {
  calculateProduct,
  calculateTotals,
  normalizeTransaction,
} from '@/modules/consignments/consignments.calculations';
import type {
  CalculatedProduct,
  ConsignmentProductInput,
  ConsignmentTotals,
  ConsignmentTransactionInput,
  CreateConsignmentInput,
  DirectoryRole,
  ListConsignmentsQuery,
  NormalizedTransaction,
  UpdateConsignmentInput,
} from '@/modules/consignments/consignments.types';

const consignmentInclude = {
  admin: {
    select: { id: true, email: true, firstName: true, lastName: true, phone: true },
  },
  customer: { select: { id: true, name: true, email: true, phone: true } },
  supplier: { select: { id: true, name: true, email: true, phone: true } },
  products: {
    orderBy: [{ position: 'asc' as const }, { createdAt: 'asc' as const }],
  },
  transactions: { orderBy: [{ date: 'asc' as const }, { createdAt: 'asc' as const }] },
} satisfies Prisma.ConsignmentInclude;

type ConsignmentWithRelations = Prisma.ConsignmentGetPayload<{
  include: typeof consignmentInclude;
}>;

const toMoney = (value: number): Prisma.Decimal => new Prisma.Decimal(value.toFixed(2));

const toMargin = (value: number): Prisma.Decimal => new Prisma.Decimal(value.toFixed(4));

const toNumber = (value: Prisma.Decimal | number | null | undefined): number =>
  value === null || value === undefined ? 0 : Number(value);

const toWebConsignmentStatus = (status: ConsignmentStatus): string =>
  status.toLowerCase().replace(/_/g, '-');

const toWebProductStatus = (status: ConsignmentProductStatus): string => status.toLowerCase();

const toWebTransactionStatus = (status: ConsignmentTransactionStatus): string =>
  status.toLowerCase();

const serializeAdmin = (admin: ConsignmentWithRelations['admin']) => ({
  _id: admin.id,
  id: admin.id,
  name: `${admin.firstName} ${admin.lastName}`.trim(),
  email: admin.email,
  phone: admin.phone,
  role: 'admin',
});

const serializeCustomer = (customer: ConsignmentWithRelations['customer']) => ({
  _id: customer.id,
  id: customer.id,
  name: customer.name,
  email: customer.email ?? '',
  phone: customer.phone ?? '',
  role: 'customer',
});

const serializeSupplier = (supplier: ConsignmentWithRelations['supplier']) => ({
  _id: supplier.id,
  id: supplier.id,
  name: supplier.name,
  email: supplier.email ?? '',
  phone: supplier.phone ?? '',
  role: 'supplier',
});

const serializeProduct = (product: ConsignmentProduct) => ({
  _id: product.id,
  id: product.id,
  category: product.category.toLowerCase(),
  brand: product.brand,
  model: product.model,
  specs: product.specs,
  quantity: product.quantity,
  buyingPrice: toNumber(product.buyingPrice),
  sellingPrice: toNumber(product.sellingPrice),
  totalbuyingCost: toNumber(product.totalBuyingCost),
  totalsellingCost: toNumber(product.totalSellingCost),
  totalBuyingCost: toNumber(product.totalBuyingCost),
  totalSellingCost: toNumber(product.totalSellingCost),
  status: toWebProductStatus(product.status),
  deliveredQuantity: product.deliveredQuantity,
  refundedQuantity: product.refundedQuantity,
  profit: toNumber(product.profit),
  profitMargin: toNumber(product.profitMargin),
  position: product.position,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

const serializeTransaction = (transaction: ConsignmentTransaction) => ({
  _id: transaction.id,
  id: transaction.id,
  transactionId: transaction.transactionId,
  date: transaction.date,
  amount: toNumber(transaction.amount),
  method: transaction.method.toLowerCase(),
  type: transaction.type.toLowerCase().replace(/_/g, '-'),
  direction: transaction.direction.toLowerCase(),
  party: transaction.party.toLowerCase(),
  note: transaction.note,
  addBy: transaction.addById,
  status: toWebTransactionStatus(transaction.status),
  createdAt: transaction.createdAt,
  updatedAt: transaction.updatedAt,
});

const buildProductStatus = (products: ConsignmentProduct[]) => {
  const total = products.reduce((sum, product) => sum + product.quantity, 0);
  const delivered = products.reduce((sum, product) => sum + product.deliveredQuantity, 0);
  const refunded = products.reduce((sum, product) => sum + product.refundedQuantity, 0);

  return {
    total,
    delivered,
    pending: Math.max(total - delivered - refunded, 0),
    refunded,
  };
};

const serializeConsignment = (consignment: ConsignmentWithRelations) => ({
  _id: consignment.id,
  id: consignment.id,
  consignmentId: consignment.consignmentId,
  admin: serializeAdmin(consignment.admin),
  supplier: serializeSupplier(consignment.supplier),
  customer: serializeCustomer(consignment.customer),
  products: consignment.products.map(serializeProduct),
  transactions: consignment.transactions.map(serializeTransaction),
  startDate: consignment.startDate,
  shippingDate: consignment.shippingDate,
  deliveryDate: consignment.deliveryDate,
  shippingCost: toNumber(consignment.shippingCost),
  totalAmount: toNumber(consignment.totalAmount),
  totalAdvance: toNumber(consignment.totalAdvance),
  totalDue: toNumber(consignment.totalDue),
  totalProductCost: toNumber(consignment.totalProductCost),
  totalSellingPrice: toNumber(consignment.totalSellingPrice),
  grossProfit: toNumber(consignment.grossProfit),
  netProfit: toNumber(consignment.netProfit),
  profitMargin: toNumber(consignment.profitMargin),
  totalReceived: toNumber(consignment.totalReceived),
  totalPaid: toNumber(consignment.totalPaid),
  status: toWebConsignmentStatus(consignment.status),
  destination: consignment.destination,
  productStatus: buildProductStatus(consignment.products),
  createdAt: consignment.createdAt,
  updatedAt: consignment.updatedAt,
});

const productData = (product: CalculatedProduct, position: number) => ({
  category: product.category,
  brand: product.brand,
  model: product.model,
  specs: product.specs ?? null,
  buyingPrice: toMoney(product.buyingPrice),
  sellingPrice: toMoney(product.sellingPrice),
  quantity: product.quantity,
  totalBuyingCost: toMoney(product.totalBuyingCost),
  totalSellingCost: toMoney(product.totalSellingCost),
  position,
  status: product.status,
  deliveredQuantity: product.deliveredQuantity,
  refundedQuantity: product.refundedQuantity,
  profit: toMoney(product.profit),
  profitMargin: toMargin(product.profitMargin),
});

const transactionData = (transaction: NormalizedTransaction, addById: string | null) => ({
  transactionId: transaction.transactionId,
  date: transaction.date,
  amount: toMoney(transaction.amount),
  method: transaction.method,
  type: transaction.type,
  direction: transaction.direction,
  party: transaction.party,
  note: transaction.note ?? null,
  addById,
  status: transaction.status,
});

const totalsData = (totals: ConsignmentTotals) => ({
  shippingCost: toMoney(totals.shippingCost),
  totalAmount: toMoney(totals.totalAmount),
  totalAdvance: toMoney(totals.totalAdvance),
  totalDue: toMoney(totals.totalDue),
  totalProductCost: toMoney(totals.totalProductCost),
  totalSellingPrice: toMoney(totals.totalSellingPrice),
  grossProfit: toMoney(totals.grossProfit),
  netProfit: toMoney(totals.netProfit),
  profitMargin: toMargin(totals.profitMargin),
  totalReceived: toMoney(totals.totalReceived),
  totalPaid: toMoney(totals.totalPaid),
});

const productToInput = (product: ConsignmentProduct): ConsignmentProductInput => ({
  category: product.category,
  brand: product.brand,
  model: product.model,
  specs: product.specs,
  buyingPrice: toNumber(product.buyingPrice),
  sellingPrice: toNumber(product.sellingPrice),
  quantity: product.quantity,
  status: product.status,
  deliveredQuantity: product.deliveredQuantity,
  refundedQuantity: product.refundedQuantity,
});

const transactionToInput = (transaction: ConsignmentTransaction): ConsignmentTransactionInput => ({
  transactionId: transaction.transactionId,
  date: transaction.date,
  amount: toNumber(transaction.amount),
  method: transaction.method,
  type: transaction.type,
  direction: transaction.direction,
  party: transaction.party,
  note: transaction.note,
  addBy: transaction.addById,
  status: transaction.status,
});

const findConsignmentOrThrow = async (id: string): Promise<ConsignmentWithRelations> => {
  const consignment = await prisma.consignment.findFirst({
    where: { id, deletedAt: null },
    include: consignmentInclude,
  });

  if (!consignment) {
    throw ApiError.notFound('Consignment not found');
  }

  return consignment;
};

const ensureAdmin = async (id: string): Promise<void> => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
      status: 'ACTIVE',
      role: { name: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    },
    select: { id: true },
  });

  if (!user) {
    throw ApiError.badRequest('Admin user not found');
  }
};

const ensureCustomer = async (id: string): Promise<void> => {
  const customer = await prisma.customer.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });

  if (!customer) {
    throw ApiError.badRequest('Customer not found');
  }
};

const ensureSupplier = async (id: string): Promise<void> => {
  const supplier = await prisma.supplier.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });

  if (!supplier) {
    throw ApiError.badRequest('Supplier not found');
  }
};

const ensureConsignmentIdAvailable = async (
  consignmentId: string,
  excludeId?: string,
): Promise<void> => {
  const existing = await prisma.consignment.findUnique({
    where: { consignmentId },
    select: { id: true },
  });

  if (existing && existing.id !== excludeId) {
    throw ApiError.conflict('Consignment ID already exists');
  }
};

export const createConsignment = async (
  input: CreateConsignmentInput,
  actor: AuthUser,
  meta: RequestMeta,
) => {
  await Promise.all([
    ensureAdmin(input.admin),
    ensureCustomer(input.customer),
    ensureSupplier(input.supplier),
    ensureConsignmentIdAvailable(input.consignmentId),
  ]);

  const products = input.products.map(calculateProduct);
  const transactions = (input.transactions ?? []).map(normalizeTransaction);
  const totals = calculateTotals(products, transactions, input.shippingCost ?? 0);

  const consignment = await prisma.consignment.create({
    data: {
      consignmentId: input.consignmentId,
      adminId: input.admin,
      customerId: input.customer,
      supplierId: input.supplier,
      startDate: input.startDate ?? new Date(),
      shippingDate: input.shippingDate ?? null,
      deliveryDate: input.deliveryDate ?? null,
      ...totalsData(totals),
      status: input.status ?? 'PENDING',
      destination: input.destination ?? 'Bangladesh',
      products: {
        create: products.map((product, index) => productData(product, index)),
      },
      transactions: {
        create: transactions.map((transaction) => transactionData(transaction, actor.id)),
      },
    },
    include: consignmentInclude,
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'consignments.create',
    resource: 'consignments',
    resourceId: consignment.id,
    metadata: {
      consignmentId: consignment.consignmentId,
      customerId: consignment.customerId,
      supplierId: consignment.supplierId,
    },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return serializeConsignment(consignment);
};

export const listConsignments = async (query: ListConsignmentsQuery) => {
  const where: Prisma.ConsignmentWhereInput = {
    deletedAt: null,
    ...(query.status ? { status: query.status } : {}),
    ...(query.customerId ? { customerId: query.customerId } : {}),
    ...(query.supplierId ? { supplierId: query.supplierId } : {}),
    ...(query.destination
      ? { destination: { contains: query.destination, mode: 'insensitive' } }
      : {}),
    ...(query.startDate || query.endDate
      ? {
          startDate: {
            ...(query.startDate ? { gte: query.startDate } : {}),
            ...(query.endDate ? { lte: query.endDate } : {}),
          },
        }
      : {}),
    ...(query.search
      ? {
          OR: [
            { consignmentId: { contains: query.search, mode: 'insensitive' } },
            { destination: { contains: query.search, mode: 'insensitive' } },
            { customer: { name: { contains: query.search, mode: 'insensitive' } } },
            { supplier: { name: { contains: query.search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const consignments = await prisma.consignment.findMany({
    where,
    include: consignmentInclude,
    orderBy: { createdAt: 'desc' },
  });

  return consignments.map(serializeConsignment);
};

export const listConsignmentsByUser = async (id: string, role: DirectoryRole) => {
  const where: Prisma.ConsignmentWhereInput = {
    deletedAt: null,
    ...(role === 'ADMIN' ? { adminId: id } : {}),
    ...(role === 'CUSTOMER' ? { customerId: id } : {}),
    ...(role === 'SUPPLIER' ? { supplierId: id } : {}),
  };

  const consignments = await prisma.consignment.findMany({
    where,
    include: consignmentInclude,
    orderBy: { createdAt: 'desc' },
  });

  return consignments.map(serializeConsignment);
};

export const getConsignment = async (id: string) => {
  const consignment = await findConsignmentOrThrow(id);
  return serializeConsignment(consignment);
};

export const updateConsignment = async (
  id: string,
  input: UpdateConsignmentInput,
  actor: AuthUser,
  meta: RequestMeta,
) => {
  const existing = await findConsignmentOrThrow(id);

  await Promise.all([
    input.admin ? ensureAdmin(input.admin) : Promise.resolve(),
    input.customer ? ensureCustomer(input.customer) : Promise.resolve(),
    input.supplier ? ensureSupplier(input.supplier) : Promise.resolve(),
    input.consignmentId ? ensureConsignmentIdAvailable(input.consignmentId, id) : Promise.resolve(),
  ]);

  const products = input.products
    ? input.products.map(calculateProduct)
    : existing.products.map(productToInput).map(calculateProduct);

  const existingByTransactionId = new Map(
    existing.transactions.map((transaction) => [transaction.transactionId, transaction]),
  );

  const transactions = input.transactions
    ? input.transactions.map((transaction) => {
        const previous = existingByTransactionId.get(transaction.transactionId);
        return normalizeTransaction({
          ...transaction,
          addBy: transaction.addBy ?? previous?.addById ?? actor.id,
        });
      })
    : existing.transactions.map(transactionToInput).map(normalizeTransaction);

  const shippingCost = input.shippingCost ?? toNumber(existing.shippingCost);
  const totals = calculateTotals(products, transactions, shippingCost);

  const updated = await prisma.$transaction(async (tx) => {
    if (input.products) {
      await tx.consignmentProduct.deleteMany({ where: { consignmentId: id } });
      await tx.consignmentProduct.createMany({
        data: products.map((product, index) => ({
          consignmentId: id,
          ...productData(product, index),
        })),
      });
    }

    if (input.transactions) {
      await tx.consignmentTransaction.deleteMany({ where: { consignmentId: id } });
      await tx.consignmentTransaction.createMany({
        data: transactions.map((transaction) => ({
          consignmentId: id,
          ...transactionData(transaction, transaction.addBy ?? actor.id),
        })),
      });
    }

    return tx.consignment.update({
      where: { id },
      data: {
        ...(input.consignmentId ? { consignmentId: input.consignmentId } : {}),
        ...(input.admin ? { adminId: input.admin } : {}),
        ...(input.customer ? { customerId: input.customer } : {}),
        ...(input.supplier ? { supplierId: input.supplier } : {}),
        ...(input.startDate ? { startDate: input.startDate } : {}),
        ...(input.shippingDate !== undefined ? { shippingDate: input.shippingDate } : {}),
        ...(input.deliveryDate !== undefined ? { deliveryDate: input.deliveryDate } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(input.destination ? { destination: input.destination } : {}),
        ...totalsData(totals),
      },
      include: consignmentInclude,
    });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'consignments.update',
    resource: 'consignments',
    resourceId: updated.id,
    metadata: {
      consignmentId: updated.consignmentId,
      fields: Object.keys(input),
    },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return serializeConsignment(updated);
};

export const deleteConsignment = async (id: string, actor: AuthUser, meta: RequestMeta) => {
  const existing = await findConsignmentOrThrow(id);

  await prisma.consignment.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'consignments.delete',
    resource: 'consignments',
    resourceId: existing.id,
    metadata: { consignmentId: existing.consignmentId },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });
};

export const addProduct = async (
  id: string,
  input: ConsignmentProductInput,
  actor: AuthUser,
  meta: RequestMeta,
) => {
  const existing = await findConsignmentOrThrow(id);
  const product = calculateProduct(input);
  const products = [...existing.products.map(productToInput).map(calculateProduct), product];
  const transactions = existing.transactions.map(transactionToInput).map(normalizeTransaction);
  const totals = calculateTotals(products, transactions, toNumber(existing.shippingCost));

  const updated = await prisma.$transaction(async (tx) => {
    await tx.consignmentProduct.create({
      data: {
        consignmentId: id,
        ...productData(product, existing.products.length),
      },
    });

    return tx.consignment.update({
      where: { id },
      data: totalsData(totals),
      include: consignmentInclude,
    });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'consignments.product.add',
    resource: 'consignments',
    resourceId: updated.id,
    metadata: {
      consignmentId: updated.consignmentId,
      brand: product.brand,
      model: product.model,
    },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return serializeConsignment(updated);
};

export const updateProduct = async (
  id: string,
  index: number,
  input: Partial<ConsignmentProductInput>,
  actor: AuthUser,
  meta: RequestMeta,
) => {
  const existing = await findConsignmentOrThrow(id);
  const target = existing.products[index];

  if (!target) {
    throw ApiError.badRequest('Product index is out of range');
  }

  const merged = calculateProduct({ ...productToInput(target), ...input });
  const products = existing.products.map((product, productIndex) =>
    productIndex === index ? merged : calculateProduct(productToInput(product)),
  );
  const transactions = existing.transactions.map(transactionToInput).map(normalizeTransaction);
  const totals = calculateTotals(products, transactions, toNumber(existing.shippingCost));

  const updated = await prisma.$transaction(async (tx) => {
    await tx.consignmentProduct.update({
      where: { id: target.id },
      data: productData(merged, target.position),
    });

    return tx.consignment.update({
      where: { id },
      data: totalsData(totals),
      include: consignmentInclude,
    });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'consignments.product.update',
    resource: 'consignments',
    resourceId: updated.id,
    metadata: {
      consignmentId: updated.consignmentId,
      productId: target.id,
      fields: Object.keys(input),
    },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return serializeConsignment(updated);
};

export const addTransaction = async (
  id: string,
  input: ConsignmentTransactionInput,
  actor: AuthUser,
  meta: RequestMeta,
) => {
  const existing = await findConsignmentOrThrow(id);
  const transaction = normalizeTransaction(input);
  const products = existing.products.map(productToInput).map(calculateProduct);
  const transactions = [
    ...existing.transactions.map(transactionToInput).map(normalizeTransaction),
    transaction,
  ];
  const totals = calculateTotals(products, transactions, toNumber(existing.shippingCost));

  const updated = await prisma.$transaction(async (tx) => {
    await tx.consignmentTransaction.create({
      data: {
        consignmentId: id,
        ...transactionData(transaction, actor.id),
      },
    });

    return tx.consignment.update({
      where: { id },
      data: totalsData(totals),
      include: consignmentInclude,
    });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'consignments.transaction.add',
    resource: 'consignments',
    resourceId: updated.id,
    metadata: {
      consignmentId: updated.consignmentId,
      transactionId: transaction.transactionId,
      amount: transaction.amount,
    },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return serializeConsignment(updated);
};
