import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ledgerFormSchema,
  type LedgerFormValues,
} from '@/features/finance/finance.schema';
import {
  useCreateLedgerEntryMutation,
  useGetLedgerEntryQuery,
  useUpdateLedgerEntryMutation,
} from '@/features/finance/finance.api';
import {
  LEDGER_TYPE_OPTIONS,
  type LedgerEntryType,
} from '@/features/finance/finance.types';
import { useListPurchaseOrdersQuery } from '@/features/purchase-orders/purchase-orders.api';
import { useListShipmentsQuery } from '@/features/shipments/shipments.api';
import { useListSuppliersQuery } from '@/features/suppliers/suppliers.api';
import { FormActions } from '@/shared/components/form-actions';
import { FieldGrid, SelectField, TextField, TextareaField } from '@/shared/components/form-fields';
import { PageHeader } from '@/shared/components/page-header';
import { SplashScreen } from '@/shared/components/splash-screen';
import { formatMoney } from '@/shared/utils/format';
import { applyServerFieldErrors, toastApiError } from '@/shared/utils/toast';

const today = new Date().toISOString().slice(0, 10);

const emptyValues: LedgerFormValues = {
  sourceType: 'PURCHASE_ORDER',
  purchaseOrderId: '',
  shipmentId: '',
  supplierId: '',
  type: 'REVENUE',
  amount: '',
  currency: 'USD',
  exchangeRate: '1',
  description: '',
  reference: '',
  occurredAt: today,
};

export const FinanceFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: entry, isLoading } = useGetLedgerEntryQuery(id ?? '', { skip: !isEdit });
  const { data: orders } = useListPurchaseOrdersQuery({ limit: 100 }, { skip: isEdit });
  const { data: shipments } = useListShipmentsQuery({ limit: 100 }, { skip: isEdit });
  const { data: suppliers } = useListSuppliersQuery({ limit: 100 }, { skip: isEdit });
  const [createEntry, { isLoading: creating }] = useCreateLedgerEntryMutation();
  const [updateEntry, { isLoading: updating }] = useUpdateLedgerEntryMutation();

  const form = useForm<LedgerFormValues>({
    resolver: zodResolver(ledgerFormSchema),
    defaultValues: emptyValues,
  });
  const { reset, handleSubmit, setError, watch, formState } = form;
  const sourceType = watch('sourceType');
  const amount = Number(watch('amount') || 0);
  const exchangeRate = Number(watch('exchangeRate') || 1);
  const currency = (watch('currency') || 'USD').toUpperCase();
  const preview = useMemo(() => amount * exchangeRate, [amount, exchangeRate]);

  useEffect(() => {
    if (!entry) return;
    reset({
      sourceType: entry.purchaseOrderId ? 'PURCHASE_ORDER' : 'SHIPMENT',
      purchaseOrderId: entry.purchaseOrderId ?? '',
      shipmentId: entry.shipmentId ?? '',
      supplierId: entry.supplierId ?? '',
      type: entry.type,
      amount: String(entry.amount ?? ''),
      currency: entry.currency,
      exchangeRate: String(entry.exchangeRate ?? '1'),
      description: entry.description ?? '',
      reference: entry.reference ?? '',
      occurredAt: entry.occurredAt?.slice(0, 10) ?? today,
    });
  }, [entry, reset]);

  const orderOptions = useMemo(
    () =>
      (orders?.items ?? []).map((order) => ({
        value: order.id,
        label: `${order.orderNumber} — ${order.customer?.name ?? 'Customer'}`,
      })),
    [orders],
  );

  const shipmentOptions = useMemo(
    () =>
      (shipments?.items ?? []).map((shipment) => ({
        value: shipment.id,
        label: `${shipment.shipmentNumber} — ${shipment.customer?.name ?? 'Customer'}`,
      })),
    [shipments],
  );

  const supplierOptions = useMemo(
    () =>
      (suppliers?.items ?? []).map((supplier) => ({
        value: supplier.id,
        label: supplier.name,
      })),
    [suppliers],
  );

  const onSubmit = handleSubmit(async (values) => {
    if (!isEdit) {
      if (values.sourceType === 'PURCHASE_ORDER' && !values.purchaseOrderId) {
        setError('purchaseOrderId', { type: 'manual', message: 'Select a purchase order' });
        return;
      }
      if (values.sourceType === 'SHIPMENT' && !values.shipmentId) {
        setError('shipmentId', { type: 'manual', message: 'Select a shipment' });
        return;
      }
    }

    const payload = {
      supplierId: values.supplierId || undefined,
      amount: Number(values.amount),
      currency: (values.currency ?? 'USD').toUpperCase(),
      exchangeRate: values.exchangeRate ? Number(values.exchangeRate) : undefined,
      description: values.description || undefined,
      reference: values.reference || undefined,
      occurredAt: values.occurredAt || undefined,
    };

    try {
      if (isEdit) {
        await updateEntry({
          id: id ?? '',
          body: { ...payload, supplierId: values.supplierId || null },
        }).unwrap();
        navigate(`/finance/${id}`);
      } else {
        const created = await createEntry({
          ...payload,
          type: values.type as LedgerEntryType,
          purchaseOrderId:
            values.sourceType === 'PURCHASE_ORDER' ? values.purchaseOrderId : undefined,
          shipmentId: values.sourceType === 'SHIPMENT' ? values.shipmentId : undefined,
        }).unwrap();
        navigate(`/finance/${created.id}`);
      }
    } catch (error) {
      if (applyServerFieldErrors(error, setError)) return;
      toastApiError(error);
    }
  });

  if (isEdit && isLoading) return <SplashScreen label="Loading ledger entry…" />;

  const isSubmitting = creating || updating || formState.isSubmitting;

  return (
    <div className="space-y-5">
      <PageHeader
        backTo={isEdit ? `/finance/${id}` : '/finance'}
        backLabel={isEdit ? 'Back to entry' : 'Back to finance'}
        eyebrow={isEdit ? 'Edit ledger entry' : 'New ledger entry'}
        title={isEdit ? 'Edit ledger entry' : 'New ledger entry'}
        description="Every entry must reference a purchase order or shipment. Pending entries can be approved or voided."
      />

      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="rounded-lg border border-border bg-card p-5">
            <FieldGrid>
              {isEdit ? (
                <>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Type</p>
                    <p className="text-sm">{entry?.type}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Source</p>
                    {entry?.purchaseOrder ? (
                      <Link
                        to={`/purchase-orders/${entry.purchaseOrder.id}`}
                        className="font-mono text-xs underline decoration-border underline-offset-4"
                      >
                        {entry.purchaseOrder.orderNumber}
                      </Link>
                    ) : entry?.shipment ? (
                      <Link
                        to={`/shipments/${entry.shipment.id}`}
                        className="font-mono text-xs underline decoration-border underline-offset-4"
                      >
                        {entry.shipment.shipmentNumber}
                      </Link>
                    ) : (
                      <p className="text-sm">—</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <SelectField
                    name="sourceType"
                    label="Source"
                    options={[
                      { value: 'PURCHASE_ORDER', label: 'Purchase order' },
                      { value: 'SHIPMENT', label: 'Shipment' },
                    ]}
                    required
                  />
                  <SelectField
                    name="type"
                    label="Entry type"
                    options={LEDGER_TYPE_OPTIONS}
                    required
                  />
                  {sourceType === 'SHIPMENT' ? (
                    <SelectField
                      name="shipmentId"
                      label="Shipment"
                      placeholder="Select a shipment"
                      options={shipmentOptions}
                      required
                      className="sm:col-span-2"
                    />
                  ) : (
                    <SelectField
                      name="purchaseOrderId"
                      label="Purchase order"
                      placeholder="Select a purchase order"
                      options={orderOptions}
                      required
                      className="sm:col-span-2"
                    />
                  )}
                </>
              )}
              <SelectField
                name="supplierId"
                label="Supplier"
                placeholder="Optional"
                options={supplierOptions}
              />
              <TextField name="occurredAt" label="Occurred on" type="date" />
            </FieldGrid>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <FieldGrid>
              <TextField name="amount" label="Amount" type="number" step="0.01" min={0} required />
              <TextField name="currency" label="Currency" placeholder="USD" required />
              <TextField
                name="exchangeRate"
                label="Exchange rate"
                type="number"
                step="0.000001"
                min={0}
              />
              <div className="flex items-end pb-2">
                <p className="text-sm text-muted-foreground">
                  Base value{' '}
                  <span className="ml-1 font-mono text-sm text-foreground">
                    {formatMoney(preview)}
                  </span>
                </p>
              </div>
              <TextField name="reference" label="Reference" placeholder="Invoice or receipt no." />
            </FieldGrid>
            <div className="mt-4">
              <TextareaField
                name="description"
                label="Description"
                placeholder="What this entry covers…"
                rows={3}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Recorded as {currency}. Base value uses the exchange rate above (defaults to 1).
            </p>
          </div>

          <FormActions
            cancelTo={isEdit ? `/finance/${id}` : '/finance'}
            submitLabel={isEdit ? 'Save changes' : 'Create entry'}
            isSubmitting={isSubmitting}
          />
        </form>
      </FormProvider>
    </div>
  );
};
