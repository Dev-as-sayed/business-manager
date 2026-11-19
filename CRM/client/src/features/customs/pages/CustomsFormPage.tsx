import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  customsFormSchema,
  type CustomsFormValues,
} from '@/features/customs/customs.schema';
import {
  useCreateCustomsRecordMutation,
  useGetCustomsRecordQuery,
  useUpdateCustomsRecordMutation,
} from '@/features/customs/customs.api';
import { useListShipmentsQuery } from '@/features/shipments/shipments.api';
import { useListSuppliersQuery } from '@/features/suppliers/suppliers.api';
import { FormActions } from '@/shared/components/form-actions';
import { FieldGrid, SelectField, TextField, TextareaField } from '@/shared/components/form-fields';
import { PageHeader } from '@/shared/components/page-header';
import { SplashScreen } from '@/shared/components/splash-screen';
import { formatMoney } from '@/shared/utils/format';
import { applyServerFieldErrors, toastApiError } from '@/shared/utils/toast';

const emptyValues: CustomsFormValues = {
  shipmentId: '',
  supplierId: '',
  declarationNumber: '',
  customsOffice: '',
  country: '',
  dutyAmount: '',
  taxAmount: '',
  otherFees: '',
  currency: 'USD',
  exchangeRate: '',
  clearanceDate: '',
  notes: '',
};

export const CustomsFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialShipmentId = searchParams.get('shipmentId') ?? '';

  const { data: record, isLoading } = useGetCustomsRecordQuery(id ?? '', { skip: !isEdit });
  const { data: shipments } = useListShipmentsQuery({ limit: 100 }, { skip: isEdit });
  const { data: suppliers } = useListSuppliersQuery(
    { limit: 100, status: 'ACTIVE' },
    { skip: isEdit },
  );
  const [createRecord, { isLoading: creating }] = useCreateCustomsRecordMutation();
  const [updateRecord, { isLoading: updating }] = useUpdateCustomsRecordMutation();

  const form = useForm<CustomsFormValues>({
    resolver: zodResolver(customsFormSchema),
    defaultValues: { ...emptyValues, shipmentId: initialShipmentId },
  });
  const { reset, handleSubmit, setError, watch, formState } = form;

  const currency = (watch('currency') || 'USD').toUpperCase();
  const totalPreview = useMemo(() => {
    const duty = Number(watch('dutyAmount') || 0);
    const tax = Number(watch('taxAmount') || 0);
    const other = Number(watch('otherFees') || 0);
    return duty + tax + other;
  }, [watch]);

  useEffect(() => {
    if (!record) return;
    reset({
      shipmentId: record.shipmentId,
      supplierId: record.supplierId ?? '',
      declarationNumber: record.declarationNumber ?? '',
      customsOffice: record.customsOffice ?? '',
      country: record.country ?? '',
      dutyAmount: String(record.dutyAmount ?? ''),
      taxAmount: String(record.taxAmount ?? ''),
      otherFees: String(record.otherFees ?? ''),
      currency: record.currency,
      exchangeRate: String(record.exchangeRate ?? ''),
      clearanceDate: record.clearanceDate?.slice(0, 10) ?? '',
      notes: record.notes ?? '',
    });
  }, [record, reset]);

  const shipmentOptions = useMemo(
    () =>
      (shipments?.items ?? [])
        .filter((shipment) => shipment.status !== 'CANCELLED')
        .map((shipment) => ({
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
    if (!isEdit && !values.shipmentId) {
      setError('shipmentId', { type: 'manual', message: 'Select a shipment' });
      return;
    }

    const payload = {
      supplierId: values.supplierId || undefined,
      declarationNumber: values.declarationNumber || undefined,
      customsOffice: values.customsOffice || undefined,
      country: values.country || undefined,
      dutyAmount: Number(values.dutyAmount || 0),
      taxAmount: Number(values.taxAmount || 0),
      otherFees: Number(values.otherFees || 0),
      currency: (values.currency ?? 'USD').toUpperCase(),
      exchangeRate: values.exchangeRate ? Number(values.exchangeRate) : undefined,
      clearanceDate: values.clearanceDate || undefined,
      notes: values.notes || undefined,
    };

    try {
      if (isEdit) {
        await updateRecord({ id: id ?? '', body: payload }).unwrap();
        navigate(`/customs/${id}`);
      } else {
        const created = await createRecord({
          ...payload,
          shipmentId: values.shipmentId ?? '',
        }).unwrap();
        navigate(`/customs/${created.id}`);
      }
    } catch (error) {
      if (applyServerFieldErrors(error, setError)) return;
      toastApiError(error);
    }
  });

  if (isEdit && isLoading) return <SplashScreen label="Loading customs record…" />;

  const isSubmitting = creating || updating || formState.isSubmitting;

  return (
    <div className="space-y-5">
      <PageHeader
        backTo={isEdit ? `/customs/${id}` : '/customs'}
        backLabel={isEdit ? 'Back to record' : 'All customs records'}
        eyebrow={isEdit ? 'Edit declaration' : 'New declaration'}
        title={isEdit ? 'Edit customs record' : 'New customs record'}
        description="Duties are recorded in the declaration currency; totals update automatically."
      />

      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="rounded-lg border border-border bg-card p-5">
            <FieldGrid>
              {isEdit ? (
                <div className="space-y-1.5 sm:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">Shipment</p>
                  {record?.shipment ? (
                    <Link
                      to={`/shipments/${record.shipment.id}`}
                      className="font-mono text-xs text-foreground underline decoration-border underline-offset-4"
                    >
                      {record.shipment.shipmentNumber}
                    </Link>
                  ) : (
                    <p className="text-sm">—</p>
                  )}
                </div>
              ) : (
                <SelectField
                  name="shipmentId"
                  label="Shipment"
                  placeholder="Select a non-cancelled shipment"
                  options={shipmentOptions}
                  required
                  className="sm:col-span-2"
                />
              )}
              <SelectField
                name="supplierId"
                label="Supplier"
                placeholder="Optional"
                options={supplierOptions}
              />
              <TextField
                name="declarationNumber"
                label="Declaration number"
                placeholder="Optional"
              />
              <TextField name="customsOffice" label="Customs office" placeholder="Chattogram" />
              <TextField name="country" label="Country" placeholder="Bangladesh" />
              <TextField name="clearanceDate" label="Clearance date" type="date" />
              <TextField name="currency" label="Currency" placeholder="USD" required />
            </FieldGrid>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Duties & fees
            </p>
            <FieldGrid>
              <TextField name="dutyAmount" label="Duty" type="number" step="0.01" min={0} />
              <TextField name="taxAmount" label="Tax" type="number" step="0.01" min={0} />
              <TextField name="otherFees" label="Other fees" type="number" step="0.01" min={0} />
              <TextField name="exchangeRate" label="Exchange rate" type="number" step="0.000001" min={0} />
            </FieldGrid>
            <p className="mt-3 text-sm">
              <span className="text-muted-foreground">Computed total </span>
              <span className="font-mono text-sm font-medium">
                {formatMoney(totalPreview, currency)}
              </span>
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <TextareaField
              name="notes"
              label="Notes"
              placeholder="Customs correspondence, HS codes, inspection notes…"
              rows={4}
            />
          </div>

          <FormActions
            cancelTo={isEdit ? `/customs/${id}` : '/customs'}
            submitLabel={isEdit ? 'Save changes' : 'Create record'}
            isSubmitting={isSubmitting}
          />
        </form>
      </FormProvider>
    </div>
  );
};
