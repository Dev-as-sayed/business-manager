import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import {
  createProductRequestSchema,
  type CreateProductRequestFormValues,
} from '@/features/product-requests/product-requests.schema';
import { useCreateProductRequestMutation } from '@/features/product-requests/product-requests.api';
import { CustomerPicker } from '@/features/customers/components/CustomerPicker';
import { usePermission } from '@/shared/hooks/usePermission';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { PageHeader, Screen } from '@/shared/components/Screen';
import { Button } from '@/shared/components/Button';
import { TextField } from '@/shared/components/TextField';

const emptyItem = {
  name: '',
  description: '',
  quantity: '1',
  targetPrice: '',
  notes: '',
};

export default function NewProductRequestScreen() {
  const { can, user } = usePermission();
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [customerError, setCustomerError] = useState<string | undefined>();
  const [createRequest, { isLoading }] = useCreateProductRequestMutation();
  const { control, handleSubmit, formState } = useForm<CreateProductRequestFormValues>({
    resolver: zodResolver(createProductRequestSchema),
    defaultValues: {
      title: '',
      description: '',
      items: [emptyItem],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const isStaff = user?.role !== 'CUSTOMER';

  if (!can('product_requests', 'create')) {
    return <AccessDenied onBack={() => router.back()} />;
  }

  const onSubmit = handleSubmit(async (values) => {
    if (isStaff && !customerId) {
      setCustomerError('Choose the customer this request belongs to');
      return;
    }

    setCustomerError(undefined);

    try {
      const result = await createRequest({
        customerId: isStaff ? customerId : undefined,
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        items: values.items.map((item) => ({
          name: item.name.trim(),
          description: item.description?.trim() || undefined,
          quantity: Number(item.quantity),
          targetPrice: item.targetPrice ? Number(item.targetPrice) : undefined,
          notes: item.notes?.trim() || undefined,
        })),
      }).unwrap();

      router.replace({ pathname: '/product-requests/[id]', params: { id: result.id } });
    } catch {
      return;
    }
  });

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={<Button title="Create request" loading={isLoading} onPress={() => void onSubmit()} />}
    >
      <PageHeader
        title="New request"
        subtitle="Capture the customer brief so sourcing can start."
        back={() => router.back()}
      />

      {isStaff ? (
        <CustomerPicker value={customerId} onChange={setCustomerId} error={customerError} />
      ) : (
        <View className="rounded-xl border border-jade-100 bg-jade-50 px-3 py-2.5">
          <Text className="text-[12px] text-jade-700">
            This request will be linked to your customer account automatically.
          </Text>
        </View>
      )}

      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <TextField
            label="Request title"
            placeholder="e.g. Holiday lighting collection"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <TextField
            label="Brief"
            placeholder="Share target market, packaging, deadlines, or references"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            multiline
          />
        )}
      />

      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-[15px] font-bold text-ink-900">Items</Text>
          <Text className="text-[12px] text-ink-400">{fields.length} added</Text>
        </View>

        {fields.map((field, index) => (
          <View key={field.id} className="gap-3 rounded-card border border-ink-100 bg-surface p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-[12px] font-bold uppercase tracking-wide text-ink-400">
                Item {index + 1}
              </Text>
              {fields.length > 1 ? (
                <Pressable
                  onPress={() => remove(index)}
                  accessibilityLabel={`Remove item ${index + 1}`}
                  className="h-8 w-8 items-center justify-center rounded-full bg-coral-50"
                >
                  <Trash2 size={15} color="#E11D48" />
                </Pressable>
              ) : null}
            </View>

            <Controller
              control={control}
              name={`items.${index}.name`}
              render={({ field: input, fieldState }) => (
                <TextField
                  label="Item name"
                  placeholder="Product or component"
                  value={input.value}
                  onChangeText={input.onChange}
                  onBlur={input.onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />

            <View className="flex-row gap-3">
              <Controller
                control={control}
                name={`items.${index}.quantity`}
                render={({ field: input, fieldState }) => (
                  <TextField
                    label="Quantity"
                    placeholder="1"
                    keyboardType="number-pad"
                    value={input.value}
                    onChangeText={input.onChange}
                    onBlur={input.onBlur}
                    error={fieldState.error?.message}
                    containerClassName="flex-1"
                  />
                )}
              />
              <Controller
                control={control}
                name={`items.${index}.targetPrice`}
                render={({ field: input, fieldState }) => (
                  <TextField
                    label="Target price"
                    placeholder="Optional"
                    keyboardType="decimal-pad"
                    value={input.value}
                    onChangeText={input.onChange}
                    onBlur={input.onBlur}
                    error={fieldState.error?.message}
                    containerClassName="flex-1"
                  />
                )}
              />
            </View>

            <Controller
              control={control}
              name={`items.${index}.description`}
              render={({ field: input }) => (
                <TextField
                  label="Specification"
                  placeholder="Material, size, colour, finish"
                  value={input.value}
                  onChangeText={input.onChange}
                  onBlur={input.onBlur}
                  multiline
                />
              )}
            />
          </View>
        ))}

        <Pressable
          onPress={() => append(emptyItem)}
          className="flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-ink-200 bg-surface px-3 py-3"
        >
          <Plus size={17} color="#047857" />
          <Text className="text-[13px] font-semibold text-ink-700">Add another item</Text>
        </Pressable>
      </View>

      {formState.errors.items?.root?.message ? (
        <Text className="text-[12px] font-medium text-coral-600">
          {formState.errors.items.root.message}
        </Text>
      ) : null}
    </Screen>
  );
}
