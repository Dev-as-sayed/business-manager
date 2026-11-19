import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useListCustomersQuery } from '@/features/customers/customers.api';
import { useListRolesQuery } from '@/features/roles/roles.api';
import { userFormSchema, type UserFormValues } from '@/features/users/users.schema';
import {
  useCreateUserMutation,
  useGetUserQuery,
  useUpdateUserMutation,
} from '@/features/users/users.api';
import { FormActions } from '@/shared/components/form-actions';
import {
  FieldGrid,
  SelectField,
  TextField,
} from '@/shared/components/form-fields';
import { PageHeader } from '@/shared/components/page-header';
import { SplashScreen } from '@/shared/components/splash-screen';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { applyServerFieldErrors, toastApiError } from '@/shared/utils/toast';
import { roleLabel } from '@/shared/utils/roles';

const emptyValues: UserFormValues = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  roleId: '',
  customerId: '',
};

const orEmpty = (value: string | null | undefined): string => value ?? '';

export const UserFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: user, isLoading } = useGetUserQuery(id ?? '', { skip: !isEdit });
  const { data: roles } = useListRolesQuery({ limit: 100 });
  const { data: customers } = useListCustomersQuery({ limit: 100, status: 'ACTIVE' });
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: emptyValues,
  });
  const { reset, handleSubmit, setError, watch, formState } = form;
  const roleId = watch('roleId');
  const selectedRole = roles?.items.find((role) => role.id === roleId);
  const isCustomerRole = selectedRole?.name === 'CUSTOMER';

  useEffect(() => {
    if (!user) return;
    reset({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      phone: orEmpty(user.phone),
      roleId: user.roleId,
      customerId: orEmpty(user.customerId),
    });
  }, [user, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!isEdit && !values.password) {
      setError('password', { type: 'manual', message: 'Password is required for new users' });
      return;
    }

    const base = {
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      roleId: values.roleId,
      customerId: isCustomerRole ? (values.customerId ?? '') : '',
    };

    try {
      const saved = isEdit
        ? await updateUser({ id: id ?? '', body: base }).unwrap()
        : await createUser({ ...base, password: values.password ?? '' }).unwrap();
      navigate(`/users/${saved.id}`);
    } catch (error) {
      if (applyServerFieldErrors(error, setError)) return;
      toastApiError(error);
    }
  });

  if (isEdit && isLoading) return <SplashScreen label="Loading user…" />;

  const roleOptions = (roles?.items ?? []).map((role) => ({
    value: role.id,
    label: roleLabel(role.name),
  }));
  const customerOptions = (customers?.items ?? []).map((customer) => ({
    value: customer.id,
    label: customer.name,
  }));

  const isSubmitting = creating || updating || formState.isSubmitting;

  return (
    <div className="space-y-5">
      <PageHeader
        backTo={isEdit ? `/users/${id}` : '/users'}
        backLabel={isEdit ? 'Back to user' : 'All users'}
        eyebrow={isEdit ? 'Edit access' : 'Invite account'}
        title={isEdit ? 'Edit user' : 'New user'}
        description="Staff accounts sign in with email and password. Customer users can be linked to one customer."
      />

      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Identity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGrid>
                <TextField
                  name="firstName"
                  label="First name"
                  placeholder="First name"
                  required
                  autoComplete="given-name"
                />
                <TextField
                  name="lastName"
                  label="Last name"
                  placeholder="Last name"
                  required
                  autoComplete="family-name"
                />
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                />
                <TextField
                  name="phone"
                  label="Phone"
                  type="tel"
                  placeholder="Optional"
                  autoComplete="tel"
                />
                {!isEdit ? (
                  <TextField
                    name="password"
                    label="Temporary password"
                    type="password"
                    placeholder="At least 8 characters"
                    required
                    autoComplete="new-password"
                    className="sm:col-span-2"
                    hint="The user can change this from their profile after signing in."
                  />
                ) : null}
              </FieldGrid>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGrid>
                <SelectField
                  name="roleId"
                  label="Role"
                  placeholder="Select a role"
                  options={roleOptions}
                  required
                />
                {isCustomerRole ? (
                  <SelectField
                    name="customerId"
                    label="Linked customer"
                    placeholder="Select an active customer"
                    options={customerOptions}
                    allowClear
                    hint="Customer users can only see their Linked customer's records."
                  />
                ) : (
                  <div className="hidden sm:block" aria-hidden />
                )}
              </FieldGrid>
            </CardContent>
          </Card>

          <FormActions
            cancelTo={isEdit ? `/users/${id}` : '/users'}
            submitLabel={isEdit ? 'Save changes' : 'Create user'}
            isSubmitting={isSubmitting}
          />
        </form>
      </FormProvider>
    </div>
  );
};
