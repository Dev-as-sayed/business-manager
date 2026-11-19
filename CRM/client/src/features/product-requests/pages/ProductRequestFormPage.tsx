import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectAuthUser } from '@/features/auth/auth.slice';
import { useListCustomersQuery } from '@/features/customers/customers.api';
import {
  productRequestFormSchema,
  type ProductRequestFormValues,
} from '@/features/product-requests/product-requests.schema';
import {
  useCreateProductRequestMutation,
  useGetProductRequestQuery,
  useUpdateProductRequestMutation,
} from '@/features/product-requests/product-requests.api';
import { useListUsersQuery } from '@/features/users/users.api';
import { FormActions } from '@/shared/components/form-actions';
import { FieldGrid, SelectField, TextField, TextareaField } from '@/shared/components/form-fields';
import {
  LineItemsEditor,
  createEmptyLineItem,
  type EditableLineItem,
} from '@/shared/components/line-items-editor';
import { PageHeader } from '@/shared/components/page-header';
import { SplashScreen } from '@/shared/components/splash-screen';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { toastError } from '@/shared/utils/toast';
import { applyServerFieldErrors, toastApiError } from '@/shared/utils/toast';

const emptyValues: ProductRequestFormValues = {
  title: '',
  description: '',
  customerId: '',
  assignedUserId: '',
};

export const ProductRequestFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);
  const isCustomer = user?.role === 'CUSTOMER';
  const { data: request, isLoading } = useGetProductRequestQuery(id ?? '', { skip: !isEdit });
  const { data: customers } = useListCustomersQuery(
    { limit: 100, status: 'ACTIVE' },
    { skip: isCustomer },
  );
  const { data: opsUsers } = useListUsersQuery(
    { limit: 100, status: 'ACTIVE', role: 'CHINA_OPERATIONS' },
    { skip: isCustomer },
  );
  const [createRequest, { isLoading: creating }] = useCreateProductRequestMutation();
  const [updateRequest, { isLoading: updating }] = useUpdateProductRequestMutation();
  const [items, setItems] = useState<EditableLineItem[]>([createEmptyLineItem()]);

  const form = useForm<ProductRequestFormValues>({
    resolver: zodResolver(productRequestFormSchema),
    defaultValues: emptyValues,
  });
  const { reset, handleSubmit, setError, formState } = form;

  useEffect(() => {
    if (!request) return;
    reset({
      title: request.title,
      description: request.description ?? '',
      customerId: request.customerId ?? '',
      assignedUserId: request.assignedUserId ?? '',
    });
    if (request.items?.length) {
      setItems(
        request.items.map((item) => ({
          key: item.id,
          name: item.name,
          description: item.description ?? '',
          quantity: String(item.quantity),
          price: item.targetPrice === null ? '' : String(item.targetPrice),
          notes: item.notes ?? '',
        })),
      );
    }
  }, [request, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!isEdit && !isCustomer && !values.customerId) {
      setError('customerId', { type: 'manual', message: 'Select a customer' });
      return;
    }

    const payloadItems = items.map((item) => ({
      name: item.name.trim(),
      description: item.description.trim() || undefined,
      quantity: Number(item.quantity),
      targetPrice: item.price === '' ? undefined : Number(item.price),
      notes: item.notes || undefined,
    }));

    if (payloadItems.length === 0) {
      toastError('Add at least one line item.');
      return;
    }

    const invalid = payloadItems.find(
      (item) =>
        !item.name ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        (item.targetPrice !== undefined && Number.isNaN(item.targetPrice)),
    );

    if (invalid) {
      toastError('Each line needs a name, a whole quantity of at least 1, and a valid price.');
      return;
    }

    try {
      const saved = isEdit
        ? await updateRequest({
            id: id ?? '',
            body: {
              title: values.title,
              description: values.description ?? '',
              items: payloadItems,
            },
          }).unwrap()
        : await createRequest({
            title: values.title,
            description: values.description ?? '',
            customerId: isCustomer ? undefined : values.customerId,
            assignedUserId: values.assignedUserId || undefined,
            items: payloadItems,
          }).unwrap();
      navigate(`/product-requests/${saved.id}`);
    } catch (error) {
      if (applyServerFieldErrors(error, setError)) return;
      toastApiError(error);
    }
  });

  if (isEdit && isLoading) return <SplashScreen label="Loading request…" />;

  const customerOptions = (customers?.items ?? []).map((customer) => ({
    value: customer.id,
    label: customer.name,
  }));
  const opsOptions = (opsUsers?.items ?? []).map((opsUser) => ({
    value: opsUser.id,
    label: `${opsUser.firstName} ${opsUser.lastName}`,
  }));

  const isSubmitting = creating || updating || formState.isSubmitting;

  return (
    <div className="space-y-5">
      <PageHeader
        backTo={isEdit ? `/product-requests/${id}` : '/product-requests'}
        backLabel={isEdit ? 'Back to request' : 'All requests'}
        eyebrow={isEdit ? 'Edit brief' : 'New brief'}
        title={isEdit ? 'Edit product request' : 'New product request'}
        description="Capture what the customer needs. China operations turns this into a quotation."
      />

      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Request details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextField
                name="title"
                label="Title"
                placeholder="Cotton tote bags, 5k units"
                required
              />
              <TextareaField
                name="description"
                label="Brief"
                placeholder="Materials, artwork, packaging, compliance…"
                rows={4}
              />
              <FieldGrid>
                {!isEdit && !isCustomer ? (
                  <>
                    <SelectField
                      name="customerId"
                      label="Customer"
                      placeholder="Select an active customer"
                      options={customerOptions}
                      required
                    />
                    <SelectField
                      name="assignedUserId"
                      label="Assign to operations"
                      placeholder="Leave unassigned"
                      options={opsOptions}
                      allowClear
                    />
                  </>
                ) : null}
              </FieldGrid>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Line items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LineItemsEditor
                items={items}
                onChange={setItems}
                priceLabel="Target price"
                priceHint="Optional per-unit target in USD."
              />
            </CardContent>
          </Card>

          <FormActions
            cancelTo={isEdit ? `/product-requests/${id}` : '/product-requests'}
            submitLabel={isEdit ? 'Save changes' : 'Create request'}
            isSubmitting={isSubmitting}
          />
        </form>
      </FormProvider>
    </div>
  );
};
