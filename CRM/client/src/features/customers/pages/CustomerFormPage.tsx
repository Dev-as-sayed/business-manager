import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import {
  customerFormSchema,
  type CustomerFormValues,
} from '@/features/customers/customers.schema';
import {
  useCreateCustomerMutation,
  useGetCustomerQuery,
  useUpdateCustomerMutation,
} from '@/features/customers/customers.api';
import { FormActions } from '@/shared/components/form-actions';
import { FieldGrid, TextField, TextareaField } from '@/shared/components/form-fields';
import { PageHeader } from '@/shared/components/page-header';
import { SplashScreen } from '@/shared/components/splash-screen';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { applyServerFieldErrors, toastApiError } from '@/shared/utils/toast';

const emptyValues: CustomerFormValues = {
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

export const CustomerFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: customer, isLoading } = useGetCustomerQuery(id ?? '', { skip: !isEdit });
  const [createCustomer, { isLoading: creating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: updating }] = useUpdateCustomerMutation();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: emptyValues,
  });
  const { reset, handleSubmit, setError, formState } = form;

  useEffect(() => {
    if (!customer) return;
    reset({
      name: customer.name,
      contactName: orEmpty(customer.contactName),
      email: orEmpty(customer.email),
      phone: orEmpty(customer.phone),
      address: orEmpty(customer.address),
      city: orEmpty(customer.city),
      country: orEmpty(customer.country),
      taxId: orEmpty(customer.taxId),
      notes: orEmpty(customer.notes),
    });
  }, [customer, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const saved = isEdit
        ? await updateCustomer({ id: id ?? '', body: values }).unwrap()
        : await createCustomer(values).unwrap();
      navigate(`/customers/${saved.id}`);
    } catch (error) {
      if (applyServerFieldErrors(error, setError)) return;
      toastApiError(error);
    }
  });

  if (isEdit && isLoading) return <SplashScreen label="Loading customer…" />;

  const isSubmitting = creating || updating || formState.isSubmitting;

  return (
    <div className="space-y-5">
      <PageHeader
        backTo={isEdit ? `/customers/${id}` : '/customers'}
        backLabel={isEdit ? 'Back to customer' : 'All customers'}
        eyebrow={isEdit ? 'Edit record' : 'New record'}
        title={isEdit ? 'Edit customer' : 'New customer'}
        description="Company details used on quotations, purchase orders and shipment paperwork."
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
                  placeholder="Acme Trading Ltd."
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
                  placeholder="buyer@company.com"
                  autoComplete="email"
                />
                <TextField
                  name="phone"
                  label="Phone"
                  type="tel"
                  placeholder="+880 …"
                  autoComplete="tel"
                />
                <TextField name="city" label="City" placeholder="Dhaka" />
                <TextField name="country" label="Country" placeholder="Bangladesh" />
                <TextField
                  name="taxId"
                  label="Tax / VAT ID"
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
                placeholder="Payment terms, preferences, history…"
                rows={4}
              />
            </CardContent>
          </Card>

          <FormActions
            cancelTo={isEdit ? `/customers/${id}` : '/customers'}
            submitLabel={isEdit ? 'Save changes' : 'Create customer'}
            isSubmitting={isSubmitting}
          />
        </form>
      </FormProvider>
    </div>
  );
};
