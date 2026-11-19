import type {
  CalculatedProduct,
  ConsignmentProductInput,
  ConsignmentTotals,
  ConsignmentTransactionInput,
  NormalizedTransaction,
} from '@/modules/consignments/consignments.types';

const roundMoney = (value: number): number => Math.round(value * 100) / 100;
const roundMargin = (value: number): number => Math.round(value * 10000) / 10000;

export const normalizeTransaction = (
  input: ConsignmentTransactionInput,
): NormalizedTransaction => ({
  ...input,
  date: input.date ?? new Date(),
  status: input.status ?? 'COMPLETED',
});

export const calculateProduct = (input: ConsignmentProductInput): CalculatedProduct => {
  const quantity = input.quantity;
  const totalBuyingCost = roundMoney(input.buyingPrice * quantity);
  const totalSellingCost = roundMoney(input.sellingPrice * quantity);
  const profit = roundMoney((input.sellingPrice - input.buyingPrice) * quantity);
  const profitMargin =
    input.buyingPrice > 0
      ? roundMargin(((input.sellingPrice - input.buyingPrice) / input.buyingPrice) * 100)
      : 0;

  return {
    ...input,
    status: input.status ?? 'PENDING',
    deliveredQuantity: input.deliveredQuantity ?? 0,
    refundedQuantity: input.refundedQuantity ?? 0,
    totalBuyingCost,
    totalSellingCost,
    profit,
    profitMargin,
  };
};

export const calculateTotals = (
  products: CalculatedProduct[],
  transactions: NormalizedTransaction[],
  shippingCost: number,
): ConsignmentTotals => {
  const totalProductCost = roundMoney(
    products.reduce((sum, product) => sum + product.totalBuyingCost, 0),
  );
  const totalSellingPrice = roundMoney(
    products.reduce((sum, product) => sum + product.totalSellingCost, 0),
  );
  const totalAmount = roundMoney(totalSellingPrice + shippingCost);
  const totalReceived = roundMoney(
    transactions
      .filter(
        (transaction) =>
          transaction.party === 'CUSTOMER' &&
          transaction.direction === 'IN' &&
          transaction.status === 'COMPLETED',
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0),
  );
  const totalPaid = roundMoney(
    transactions
      .filter(
        (transaction) =>
          transaction.party === 'SUPPLIER' &&
          transaction.direction === 'OUT' &&
          transaction.status === 'COMPLETED',
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0),
  );
  const grossProfit = roundMoney(totalSellingPrice - totalProductCost);
  const netProfit = roundMoney(grossProfit - shippingCost);
  const profitMargin = totalProductCost > 0 ? roundMargin((netProfit / totalProductCost) * 100) : 0;
  const totalDue = roundMoney(totalAmount - totalReceived);

  return {
    shippingCost: roundMoney(shippingCost),
    totalAmount,
    totalAdvance: totalReceived,
    totalDue,
    totalProductCost,
    totalSellingPrice,
    grossProfit,
    netProfit,
    profitMargin,
    totalReceived,
    totalPaid,
  };
};
