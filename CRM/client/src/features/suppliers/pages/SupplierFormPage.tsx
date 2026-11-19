import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import {
  supplierFormSchema,
  type SupplierFormValues,
} from '@/features/suppliers/suppliers.schema';
import {
  useCreateSupplierMutation,
  useGetSupplierQuery,
  useUpdateSupplierMutation,
} from '@/features/suppliers/suppliers.api';
import { FormActions } from '@/shared/components/form-actions';
import { FieldGrid, TextField, TextareaField } from '@/shared/components/form-fields';
import { PageHeader } from '@/shared/components/page-header';
import { SplashScreen } from '@/shared/components/splash-screen';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { applyServerFieldErrors, toastApiError } from '@/shared/utils/toast';

const emptyValues: SupplierFormValues = {
  name: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  taxId: '',
  notes: '',
};

const orEmpty = (value: string | null | undefined): string => value ?? '';

export const SupplierFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: supplier, isLoading } = useGetSupplierQuery(id ?? '', { skip: !isEdit });
  const [createSupplier, { isLoading: creating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: updating }] = useUpdateSupplierMutation();

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: emptyValues,
  });
  const { reset, handleSubmit, setError, formState } = form;

  useEffect(() => {
    if (!supplier) return;
    reset({
      name: supplier.name,
      contactName: orEmpty(supplier.contactName),
      email: orEmpty(supplier.email),
      phone: orEmpty(supplier.phone),
      address: orEmpty(supplier.address),
      city: orEmpty(supplier.city),
      country: orEmpty(supplier.country),
      taxId: orEmpty(supplier.taxId),
      notes: orEmpty(supplier.notes),
    });
  }, [supplier, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const saved = isEdit
        ? await updateSupplier({ id: id ?? '', body: values }).unwrap()
        : await createSupplier(values).unwrap();
      navigate(`/suppliers/${saved.id}`);
    } catch (error) {
      if (applyServerFieldErrors(error, setError)) return;
      toastApiError(error);
    }
  });

  if (isEdit && isLoading) return <SplashScreen label="Loading supplier…" />;

  const isSubmitting = creating || updating || formState.isSubmitting;

  return (
    <div className="space-y-5">
      <PageHeader
        backTo={isEdit ? `/suppliers/${id}` : '/suppliers'}
        backLabel={isEdit ? 'Back to supplier' : 'All suppliers'}
        eyebrow={isEdit ? 'Edit record' : 'New record'}
        title={isEdit ? 'Edit supplier' : 'New supplier'}
        description="Factory or trading partner details used across production and QC."
      />

      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Company
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGrid>
                <TextField
                  name="name"
                  label="Legal name"
                  placeholder="Guangzhou Manufacturing Co."
                  required
                  autoComplete="organization"
                />
                <TextField
                  name="contactName"
                  label="Contact person"
                  placeholder="Full name"
                  autoComplete="name"
                />
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="sales@factory.com"
                  autoComplete="email"
                />
                <TextField
                  name="phone"
                  label="Phone"
                  type="tel"
                  placeholder="+86 …"
                  autoComplete="tel"
                />
                <TextField name="city" label="City" placeholder="Guangzhou" />
                <TextField name="country" label="Country" placeholder="China" />
                <TextField
                  name="taxId"
                  label="Tax / registration ID"
                  placeholder="Optional"
                  className="sm:col-span-2"
                />
              </FieldGrid>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Address & notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextareaField
                name="address"
                label="Address"
                placeholder="Street, district, postal code"
                rows={3}
              />
              <TextareaField
                name="notes"
                label="Internal notes"
                placeholder="Capabilities, payment terms, lead times…"
                rows={4}
              />
            </CardContent>
          </Card>

          <FormActions
            cancelTo={isEdit ? `/suppliers/${id}` : '/suppliers'}
            submitLabel={isEdit ? 'Save changes' : 'Create supplier'}
            isSubmitting={isSubmitting}
          />
        </form>
      </FormProvider>
    </div>
  );
};
