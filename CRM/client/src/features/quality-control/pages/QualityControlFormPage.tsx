import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectAuthUser } from '@/features/auth/auth.slice';
import { useListPurchaseOrdersQuery } from '@/features/purchase-orders/purchase-orders.api';
import {
  qcFormSchema,
  type QcFormValues,
} from '@/features/quality-control/quality-control.schema';
import {
  useCreateQcReportMutation,
  useGetQcReportQuery,
  useUpdateQcReportMutation,
} from '@/features/quality-control/quality-control.api';
import { useListUsersQuery } from '@/features/users/users.api';
import { FormActions } from '@/shared/components/form-actions';
import { FieldGrid, SelectField, TextField, TextareaField } from '@/shared/components/form-fields';
import { PageHeader } from '@/shared/components/page-header';
import { SplashScreen } from '@/shared/components/splash-screen';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { applyServerFieldErrors, toastApiError } from '@/shared/utils/toast';

const emptyValues: QcFormValues = {
  purchaseOrderId: '',
  inspectorId: '',
  inspectionDate: '',
  notes: '',
  photoUrls: '',
};

export const QualityControlFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPurchaseOrderId = searchParams.get('purchaseOrderId') ?? '';
  const user = useAppSelector(selectAuthUser);
  const isOps = user?.role === 'CHINA_OPERATIONS';

  const { data: report, isLoading } = useGetQcReportQuery(id ?? '', { skip: !isEdit });
  const { data: approvedOrders } = useListPurchaseOrdersQuery(
    { limit: 100, status: 'APPROVED' },
    { skip: isEdit },
  );
  const { data: productionOrders } = useListPurchaseOrdersQuery(
    { limit: 100, status: 'IN_PRODUCTION' },
    { skip: isEdit },
  );
  const { data: opsUsers } = useListUsersQuery(
    { limit: 100, status: 'ACTIVE', role: 'CHINA_OPERATIONS' },
    { skip: isOps },
  );
  const [createReport, { isLoading: creating }] = useCreateQcReportMutation();
  const [updateReport, { isLoading: updating }] = useUpdateQcReportMutation();

  const form = useForm<QcFormValues>({
    resolver: zodResolver(qcFormSchema),
    defaultValues: { ...emptyValues, purchaseOrderId: initialPurchaseOrderId },
  });
  const { reset, handleSubmit, setError, formState } = form;

  useEffect(() => {
    if (!report) return;
    reset({
      purchaseOrderId: report.purchaseOrderId,
      inspectorId: report.inspectorId ?? '',
      inspectionDate: report.inspectionDate?.slice(0, 10) ?? '',
      notes: report.notes ?? '',
      photoUrls: report.photoUrls.join('\n'),
    });
  }, [report, reset]);

  const orderOptions = useMemo(() => {
    const combined = [...(approvedOrders?.items ?? []), ...(productionOrders?.items ?? [])];
    const seen = new Set<string>();

    return combined
      .filter((order) => {
        if (seen.has(order.id)) return false;
        seen.add(order.id);
        return true;
      })
      .map((order) => ({
        value: order.id,
        label: `${order.orderNumber} — ${order.supplier?.name ?? 'Supplier'}`,
      }));
  }, [approvedOrders, productionOrders]);

  const onSubmit = handleSubmit(async (values) => {
    if (!isEdit && !isOps && !values.inspectorId) {
      setError('inspectorId', { type: 'manual', message: 'Select an inspector' });
      return;
    }

    const photoUrls = (values.photoUrls ?? '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (photoUrls.some((url) => !/^https?:\/\//i.test(url))) {
      setError('photoUrls', {
        type: 'manual',
        message: 'Each photo link must start with http:// or https://',
      });
      return;
    }

    if (!isEdit && !values.purchaseOrderId) {
      setError('purchaseOrderId', { type: 'manual', message: 'Select a purchase order' });
      return;
    }

    try {
      const body = {
        inspectionDate: values.inspectionDate || undefined,
        notes: values.notes ?? '',
        photoUrls,
        ...(isOps ? {} : { inspectorId: values.inspectorId || undefined }),
      };

      const saved = isEdit
        ? await updateReport({ id: id ?? '', body }).unwrap()
        : await createReport({
            ...body,
            purchaseOrderId: values.purchaseOrderId ?? '',
          }).unwrap();
      navigate(`/quality-control/${saved.id}`);
    } catch (error) {
      if (applyServerFieldErrors(error, setError)) return;
      toastApiError(error);
    }
  });

  if (isEdit && isLoading) return <SplashScreen label="Loading QC report…" />;

  const inspectorOptions = (opsUsers?.items ?? []).map((opsUser) => ({
    value: opsUser.id,
    label: `${opsUser.firstName} ${opsUser.lastName}`,
  }));
  const isSubmitting = creating || updating || formState.isSubmitting;

  return (
    <div className="space-y-5">
      <PageHeader
        backTo={isEdit ? `/quality-control/${id}` : '/quality-control'}
        backLabel={isEdit ? 'Back to report' : 'All QC reports'}
        eyebrow={isEdit ? 'Edit report' : 'New inspection'}
        title={isEdit ? 'Edit QC report' : 'New QC report'}
        description="Inspections can be raised on approved or in-production purchase orders."
      />

      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Inspection details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEdit ? (
                report?.purchaseOrder ? (
                  <p className="text-sm text-muted-foreground">
                    Purchase order{' '}
                    <Link
                      to={`/purchase-orders/${report.purchaseOrder.id}`}
                      className="font-mono text-xs text-foreground underline decoration-border underline-offset-4"
                    >
                      {report.purchaseOrder.orderNumber}
                    </Link>
                  </p>
                ) : null
              ) : (
                <FieldGrid>
                  <SelectField
                    name="purchaseOrderId"
                    label="Purchase order"
                    placeholder="Select an approved or in-production order"
                    options={orderOptions}
                    required
                    className="sm:col-span-2"
                  />
                </FieldGrid>
              )}

              <FieldGrid>
                {!isOps ? (
                  <SelectField
                    name="inspectorId"
                    label="Inspector"
                    placeholder="Select a China operations user"
                    options={inspectorOptions}
                    required={!isEdit}
                  />
                ) : (
                  <p className="self-end pb-2 text-sm text-muted-foreground">
                    This inspection will be assigned to you.
                  </p>
                )}
                <TextField name="inspectionDate" label="Inspection date" type="date" />
              </FieldGrid>

              <TextareaField
                name="notes"
                label="Findings"
                placeholder="Dimensions, defects, packing checks…"
                rows={4}
              />
              <TextareaField
                name="photoUrls"
                label="Photo links"
                placeholder={'https://…\nhttps://…'}
                rows={4}
                hint="One image URL per line. Links open in a new tab."
              />
            </CardContent>
          </Card>

          <FormActions
            cancelTo={isEdit ? `/quality-control/${id}` : '/quality-control'}
            submitLabel={isEdit ? 'Save changes' : 'Create QC report'}
            isSubmitting={isSubmitting}
          />
        </form>
      </FormProvider>
    </div>
  );
};
