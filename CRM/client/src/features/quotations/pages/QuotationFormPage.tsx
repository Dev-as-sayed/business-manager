import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useGetProductRequestQuery, useListProductRequestsQuery } from '@/features/product-requests/product-requests.api';
import {
  quotationFormSchema,
  type QuotationFormValues,
} from '@/features/quotations/quotations.schema';
import {
  useCreateQuotationMutation,
  useGetQuotationQuery,
  useUpdateQuotationMutation,
} from '@/features/quotations/quotations.api';
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

const emptyValues: QuotationFormValues = {
  productRequestId: '',
  currency: 'USD',
  serviceFeePercent: '5',
  shippingFee: '',
  tax: '',
  validUntil: '',
  notes: '',
};

const parseAmount = (value: string | undefined): number => {
  if (!value) return 0;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const QuotationFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRequestId = searchParams.get('productRequestId') ?? '';

  const { data: quotation, isLoading } = useGetQuotationQuery(id ?? '', { skip: !isEdit });
  const { data: reviewingRequests } = useListProductRequestsQuery({
    limit: 100,
    status: 'REVIEWING',
  });
  const { data: quotedRequests } = useListProductRequestsQuery({
    limit: 100,
    status: 'QUOTED',
  });
  const [createQuotation, { isLoading: creating }] = useCreateQuotationMutation();
  const [updateQuotation, { isLoading: updating }] = useUpdateQuotationMutation();
  const [items, setItems] = useState<EditableLineItem[]>([createEmptyLineItem()]);

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationFormSchema),
    defaultValues: { ...emptyValues, productRequestId: initialRequestId },
  });
  const { reset, handleSubmit, setError, watch, formState } = form;
  const selectedRequestId = watch('productRequestId') ?? '';
  const { data: selectedRequest } = useGetProductRequestQuery(selectedRequestId, {
    skip: !selectedRequestId,
  });

  useEffect(() => {
    if (!quotation) return;
    reset({
      productRequestId: quotation.productRequestId,
      currency: quotation.currency,
      serviceFeePercent: (Number(quotation.serviceFeeRate) * 100).toString(),
      shippingFee: String(Number(quotation.shippingFee)),
      tax: String(Number(quotation.tax)),
      validUntil: quotation.validUntil?.slice(0, 10) ?? '',
      notes: quotation.notes ?? '',
    });
    if (quotation.items?.length) {
      setItems(
        quotation.items.map((item) => ({
          key: item.id,
          name: item.name,
          description: item.description ?? '',
          quantity: String(item.quantity),
          price: String(item.unitPrice),
          notes: item.notes ?? '',
        })),
      );
    }
  }, [quotation, reset]);

  const requestOptions = useMemo(() => {
    const combined = [...(reviewingRequests?.items ?? []), ...(quotedRequests?.items ?? [])];
    const seen = new Set<string>();

    return combined
      .filter((request) => {
        if (seen.has(request.id)) return false;
        seen.add(request.id);
        return true;
      })
      .map((request) => ({
        value: request.id,
        label: `${request.requestNumber} — ${request.title}`,
      }));
  }, [reviewingRequests, quotedRequests]);

  const watched = watch();
  const subtotal = items.reduce(
    (sum, item) => sum + parseAmount(item.quantity) * parseAmount(item.price),
    0,
  );
  const serviceFee = subtotal * (parseAmount(watched.serviceFeePercent) / 100);
  const shipping = parseAmount(watched.shippingFee);
  const tax = parseAmount(watched.tax);
  const total = subtotal + serviceFee + shipping + tax;

  const loadRequestLines = () => {
    if (!selectedRequest?.items?.length) {
      toastError('This product request has no line items to load.');
      return;
    }

    setItems(
      selectedRequest.items.map((item) => ({
        key: crypto.randomUUID(),
        name: item.name,
        description: item.description ?? '',
        quantity: String(item.quantity),
        price: item.targetPrice === null ? '' : String(item.targetPrice),
        notes: item.notes ?? '',
      })),
    );
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!isEdit && !values.productRequestId) {
      setError('productRequestId', { type: 'manual', message: 'Select a product request' });
      return;
    }

    const payloadItems = items.map((item) => ({
      name: item.name.trim(),
      description: item.description.trim() || undefined,
      quantity: Number(item.quantity),
      unitPrice: Number(item.price),
      notes: item.notes || undefined,
    }));

    const invalid = payloadItems.find(
      (item) =>
        !item.name ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        !Number.isFinite(item.unitPrice) ||
        item.unitPrice < 0,
    );

    if (payloadItems.length === 0 || invalid) {
      toastError('Each line needs a name, a whole quantity, and a valid unit price.');
      return;
    }

    const percent = parseAmount(values.serviceFeePercent);
    if (percent < 0 || percent > 100) {
      setError('serviceFeePercent', { type: 'manual', message: 'Use a value between 0 and 100' });
      return;
    }

    try {
      const body = {
        currency: (values.currency ?? 'USD').toUpperCase(),
        serviceFeeRate: percent / 100,
        shippingFee: shipping,
        tax,
        validUntil: values.validUntil || undefined,
        notes: values.notes ?? '',
        items: payloadItems,
      };

      const saved = isEdit
        ? await updateQuotation({ id: id ?? '', body }).unwrap()
        : await createQuotation({
            ...body,
            productRequestId: values.productRequestId ?? '',
          }).unwrap();
      navigate(`/quotations/${saved.id}`);
    } catch (error) {
      if (applyServerFieldErrors(error, setError)) return;
      toastApiError(error);
    }
  });

  if (isEdit && isLoading) return <SplashScreen label="Loading quotation…" />;

  const isSubmitting = creating || updating || formState.isSubmitting;

  return (
    <div className="space-y-5">
      <PageHeader
        backTo={isEdit ? `/quotations/${id}` : '/quotations'}
        backLabel={isEdit ? 'Back to quotation' : 'All quotations'}
        eyebrow={isEdit ? 'Edit offer' : 'New offer'}
        title={isEdit ? 'Edit quotation' : 'New quotation'}
        description="Price customer lines, add service fee, freight and tax, then send for approval."
      />

      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Offer details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEdit ? (
                quotation?.productRequest ? (
                  <p className="text-sm text-muted-foreground">
                    From request{' '}
                    <Link
                      to={`/product-requests/${quotation.productRequest.id}`}
                      className="font-mono text-xs text-foreground underline decoration-border underline-offset-4"
                    >
                      {quotation.productRequest.requestNumber}
                    </Link>
                    {' — '}
                    {quotation.productRequest.title}
                  </p>
                ) : null
              ) : (
                <FieldGrid>
                  <SelectField
                    name="productRequestId"
                    label="Product request"
                    placeholder="Select a request in review or quoted"
                    options={requestOptions}
                    required
                    className="sm:col-span-2"
                  />
                </FieldGrid>
              )}

              <FieldGrid>
                <TextField
                  name="currency"
                  label="Currency"
                  placeholder="USD"
                  required
                />
                <TextField
                  name="serviceFeePercent"
                  label="Service fee (%)"
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  placeholder="5"
                />
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
                <TextField name="validUntil" label="Valid until" type="date" />
              </FieldGrid>

              <TextareaField
                name="notes"
                label="Notes"
                placeholder="Terms, lead times, exclusions…"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Line items
              </CardTitle>
              {selectedRequestId ? (
                <Button type="button" variant="outline" size="sm" onClick={loadRequestLines}>
                  Load request lines
                </Button>
              ) : null}
            </CardHeader>
            <CardContent>
              <LineItemsEditor
                items={items}
                onChange={setItems}
                priceLabel="Unit price"
                priceHint="Unit selling price in the quotation currency."
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
                  <span className="font-mono text-xs">
                    {formatMoney(subtotal, (watched.currency ?? 'USD').toUpperCase())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service fee</span>
                  <span className="font-mono text-xs">
                    {formatMoney(serviceFee, (watched.currency ?? 'USD').toUpperCase())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-mono text-xs">
                    {formatMoney(shipping, (watched.currency ?? 'USD').toUpperCase())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-mono text-xs">
                    {formatMoney(tax, (watched.currency ?? 'USD').toUpperCase())}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-medium">Total</span>
                  <span className="font-mono text-base font-semibold text-accent">
                    {formatMoney(total, (watched.currency ?? 'USD').toUpperCase())}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <FormActions
            cancelTo={isEdit ? `/quotations/${id}` : '/quotations'}
            submitLabel={isEdit ? 'Save changes' : 'Create quotation'}
            isSubmitting={isSubmitting}
          />
        </form>
      </FormProvider>
    </div>
  );
};
