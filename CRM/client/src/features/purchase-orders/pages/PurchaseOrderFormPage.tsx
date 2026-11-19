import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useGetQuotationQuery, useListQuotationsQuery } from '@/features/quotations/quotations.api';
import {
  purchaseOrderFormSchema,
  type PurchaseOrderFormValues,
} from '@/features/purchase-orders/purchase-orders.schema';
import {
  useCreatePurchaseOrderMutation,
  useGetPurchaseOrderQuery,
  useUpdatePurchaseOrderMutation,
} from '@/features/purchase-orders/purchase-orders.api';
import { useListSuppliersQuery } from '@/features/suppliers/suppliers.api';
import { FormActions } from '@/shared/components/form-actions';
import { FieldGrid, SelectField, TextField, TextareaField } from '@/shared/components/form-fields';
import {
  LineItemsEditor,
  createEmptyLineItem,
  type EditableLineItem,
} from '@/shared/components/line-items-editor';
import { PageHeader } from '@/shared/components/page-header';
import { SplashScreen } from '@/shared/components/splash-screen';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { applyServerFieldErrors, toastApiError, toastError } from '@/shared/utils/toast';
import { formatMoney } from '@/shared/utils/format';

const emptyValues: PurchaseOrderFormValues = {
  quotationId: '',
  supplierId: '',
  shippingFee: '',
  tax: '',
  expectedDeliveryDate: '',
  notes: '',
};

const parseAmount = (value: string | undefined): number => {
  if (!value) return 0;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const PurchaseOrderFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuotationId = searchParams.get('quotationId') ?? '';

  const { data: order, isLoading } = useGetPurchaseOrderQuery(id ?? '', { skip: !isEdit });
  const { data: approvedQuotations } = useListQuotationsQuery(
    { limit: 100, status: 'APPROVED' },
    { skip: isEdit },
  );
  const { data: suppliers } = useListSuppliersQuery({ limit: 100, status: 'ACTIVE' });
  const [createOrder, { isLoading: creating }] = useCreatePurchaseOrderMutation();
  const [updateOrder, { isLoading: updating }] = useUpdatePurchaseOrderMutation();
  const [items, setItems] = useState<EditableLineItem[]>([createEmptyLineItem()]);

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: { ...emptyValues, quotationId: initialQuotationId },
  });
  const { reset, handleSubmit, setError, watch, formState } = form;
  const selectedQuotationId = watch('quotationId') ?? '';
  const { data: selectedQuotation } = useGetQuotationQuery(selectedQuotationId, {
    skip: !selectedQuotationId,
  });

  useEffect(() => {
    if (!order) return;
    reset({
      quotationId: order.quotationId,
      supplierId: order.supplierId,
      shippingFee: String(Number(order.shippingFee)),
      tax: String(Number(order.tax)),
      expectedDeliveryDate: order.expectedDeliveryDate?.slice(0, 10) ?? '',
      notes: order.notes ?? '',
    });
    if (order.items?.length) {
      setItems(
        order.items.map((item) => ({
          key: item.id,
          name: item.name,
          description: item.description ?? '',
          quantity: String(item.quantity),
          price: String(item.unitCost),
          notes: item.notes ?? '',
        })),
      );
    }
  }, [order, reset]);

  const quotationOptions = useMemo(
    () =>
      (approvedQuotations?.items ?? []).map((quotation) => ({
        value: quotation.id,
        label: `${quotation.quotationNumber} — ${quotation.customer?.name ?? 'Customer'}`,
      })),
    [approvedQuotations],
  );

  const watched = watch();
  const subtotal = items.reduce(
    (sum, item) => sum + parseAmount(item.quantity) * parseAmount(item.price),
    0,
  );
  const shipping = parseAmount(watched.shippingFee);
  const tax = parseAmount(watched.tax);
  const total = subtotal + shipping + tax;
  const currency = selectedQuotation?.currency ?? order?.currency ?? 'USD';

  const loadQuotationLines = () => {
    if (!selectedQuotation?.items?.length) {
      toastError('This quotation has no line items to load.');
      return;
    }

    setItems(
      selectedQuotation.items.map((item) => ({
        key: crypto.randomUUID(),
        name: item.name,
        description: item.description ?? '',
        quantity: String(item.quantity),
        price: '',
        notes: item.notes ?? '',
      })),
    );
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!isEdit && !values.quotationId) {
      setError('quotationId', { type: 'manual', message: 'Select an approved quotation' });
      return;
    }

    const payloadItems = items.map((item) => ({
      name: item.name.trim(),
      description: item.description.trim() || undefined,
      quantity: Number(item.quantity),
      unitCost: Number(item.price),
      notes: item.notes || undefined,
    }));

    const invalid = payloadItems.find(
      (item) =>
        !item.name ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        !Number.isFinite(item.unitCost) ||
        item.unitCost < 0,
    );

    if (payloadItems.length === 0 || invalid || items.some((item) => item.price === '')) {
      toastError('Each line needs a name, a whole quantity, and a supplier unit cost.');
      return;
    }

    try {
      const body = {
        supplierId: values.supplierId,
        shippingFee: shipping,
        tax,
        expectedDeliveryDate: values.expectedDeliveryDate || undefined,
        notes: values.notes ?? '',
        items: payloadItems,
      };
      const saved = isEdit
        ? await updateOrder({ id: id ?? '', body }).unwrap()
        : await createOrder({
            ...body,
            quotationId: values.quotationId ?? '',
          }).unwrap();
      navigate(`/purchase-orders/${saved.id}`);
    } catch (error) {
      if (applyServerFieldErrors(error, setError)) return;
      toastApiError(error);
    }
  });

  if (isEdit && isLoading) return <SplashScreen label="Loading purchase order…" />;

  const supplierOptions = (suppliers?.items ?? []).map((supplier) => ({
    value: supplier.id,
    label: supplier.name,
  }));
  const isSubmitting = creating || updating || formState.isSubmitting;

  return (
    <div className="space-y-5">
      <PageHeader
        backTo={isEdit ? `/purchase-orders/${id}` : '/purchase-orders'}
        backLabel={isEdit ? 'Back to order' : 'All purchase orders'}
        eyebrow={isEdit ? 'Edit order' : 'New order'}
        title={isEdit ? 'Edit purchase order' : 'New purchase order'}
        description="Orders can only be raised against approved quotations and active suppliers."
      />

      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Order details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEdit ? (
                order?.quotation ? (
                  <p className="text-sm text-muted-foreground">
                    From quotation{' '}
                    <Link
                      to={`/quotations/${order.quotation.id}`}
                      className="font-mono text-xs text-foreground underline decoration-border underline-offset-4"
                    >
                      {order.quotation.quotationNumber}
                    </Link>
                  </p>
                ) : null
              ) : (
                <FieldGrid>
                  <SelectField
                    name="quotationId"
                    label="Approved quotation"
                    placeholder="Select an approved quotation"
                    options={quotationOptions}
                    required
                    className="sm:col-span-2"
                  />
                </FieldGrid>
              )}

              <FieldGrid>
                <SelectField
                  name="supplierId"
                  label="Supplier"
                  placeholder="Select an active supplier"
                  options={supplierOptions}
                  required
                />
                <TextField name="expectedDeliveryDate" label="Expected delivery" type="date" />
                <TextField
                  name="shippingFee"
                  label="Shipping fee"
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="0.00"
                />
                <TextField
                  name="tax"
                  label="Tax"
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="0.00"
                />
              </FieldGrid>

              <TextareaField
                name="notes"
                label="Notes"
                placeholder="Packing, labelling, inspection instructions…"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Line items
              </CardTitle>
              {selectedQuotationId ? (
                <Button type="button" variant="outline" size="sm" onClick={loadQuotationLines}>
                  Load quotation lines
                </Button>
              ) : null}
            </CardHeader>
            <CardContent>
              <LineItemsEditor
                items={items}
                onChange={setItems}
                priceLabel="Unit cost"
                priceHint="Supplier cost per unit in the quotation currency."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Totals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="ml-auto max-w-sm space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono text-xs">{formatMoney(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-mono text-xs">{formatMoney(shipping, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-mono text-xs">{formatMoney(tax, currency)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-medium">Total</span>
                  <span className="font-mono text-base font-semibold text-accent">
                    {formatMoney(total, currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <FormActions
            cancelTo={isEdit ? `/purchase-orders/${id}` : '/purchase-orders'}
            submitLabel={isEdit ? 'Save changes' : 'Create purchase order'}
            isSubmitting={isSubmitting}
          />
        </form>
      </FormProvider>
    </div>
  );
};
