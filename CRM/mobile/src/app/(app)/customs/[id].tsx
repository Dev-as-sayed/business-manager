import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Pencil } from 'lucide-react-native';
import { Text, View } from 'react-native';
import {
  useGetCustomsRecordQuery,
  useUpdateCustomsRecordMutation,
  useUpdateCustomsStatusMutation,
} from '@/features/customs/customs.api';
import {
  updateCustomsSchema,
  type UpdateCustomsFormValues,
} from '@/features/customs/customs.schema';
import type { CustomsStatus } from '@/features/customs/customs.types';
import { AttachmentSection } from '@/features/attachments/components/AttachmentSection';
import { usePermission } from '@/shared/hooks/usePermission';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { Button } from '@/shared/components/Button';
import { DetailRow, DetailSection } from '@/shared/components/DetailSection';
import { ErrorState, LoadingState } from '@/shared/components/StateViews';
import { PageHeader, Screen } from '@/shared/components/Screen';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { TextField } from '@/shared/components/TextField';
import { formatDate, formatMoney, titleCase } from '@/shared/utils/format';

const TRANSITIONS: Partial<Record<CustomsStatus, CustomsStatus[]>> = {
  PENDING: ['IN_REVIEW', 'CANCELLED'],
  IN_REVIEW: ['CLEARED', 'HELD', 'CANCELLED'],
  HELD: ['IN_REVIEW', 'CANCELLED'],
};

const toNumber = (value?: string): number | undefined =>
  value && value.trim() ? Number(value) : undefined;

const toText = (value?: string): string | undefined =>
  value && value.trim() ? value.trim() : undefined;

export default function CustomsDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { can } = usePermission();
  const query = useGetCustomsRecordQuery(id ?? '', { skip: !id });
  const [updateStatus, { isLoading: updating }] = useUpdateCustomsStatusMutation();
  const [updateRecord, { isLoading: saving }] = useUpdateCustomsRecordMutation();
  const [editing, setEditing] = useState(false);
  const { control, handleSubmit, reset } = useForm<UpdateCustomsFormValues>({
    resolver: zodResolver(updateCustomsSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (!query.data) return;

    reset({
      declarationNumber: query.data.declarationNumber ?? '',
      customsOffice: query.data.customsOffice ?? '',
      country: query.data.country ?? '',
      dutyAmount: String(query.data.dutyAmount ?? ''),
      taxAmount: String(query.data.taxAmount ?? ''),
      otherFees: String(query.data.otherFees ?? ''),
      currency: query.data.currency ?? '',
      exchangeRate: String(query.data.exchangeRate ?? ''),
      clearanceDate: query.data.clearanceDate?.slice(0, 10) ?? '',
      notes: query.data.notes ?? '',
    });
  }, [query.data, reset]);

  if (!can('customs', 'read')) {
    return <AccessDenied onBack={() => router.back()} />;
  }

  const record = query.data;
  const canUpdate = can('customs', 'update');
  const transitions = canUpdate ? (TRANSITIONS[record?.status ?? 'PENDING'] ?? []) : [];

  const save = handleSubmit(async (values) => {
    if (!record) return;

    try {
      await updateRecord({
        id: record.id,
        body: {
          declarationNumber: toText(values.declarationNumber),
          customsOffice: toText(values.customsOffice),
          country: toText(values.country),
          dutyAmount: toNumber(values.dutyAmount),
          taxAmount: toNumber(values.taxAmount),
          otherFees: toNumber(values.otherFees),
          currency: toText(values.currency)?.toUpperCase(),
          exchangeRate: toNumber(values.exchangeRate),
          clearanceDate: toText(values.clearanceDate),
          notes: toText(values.notes),
        },
      }).unwrap();
      setEditing(false);
    } catch {
      return;
    }
  });

  return (
    <Screen
      refreshing={query.isFetching}
      onRefresh={() => void query.refetch()}
      footer={
        canUpdate && !editing ? (
          <View className="flex-row flex-wrap gap-2">
            <Button
              title="Edit expenses"
              variant="secondary"
              compact
              icon={<Pencil size={14} color="#14211C" />}
              onPress={() => setEditing(true)}
            />
            {transitions.map((status) => (
              <Button
                key={status}
                title={titleCase(status)}
                compact
                variant={status === 'CANCELLED' || status === 'HELD' ? 'danger' : 'primary'}
                loading={updating}
                onPress={() => void updateStatus({ id: record!.id, status })}
              />
            ))}
          </View>
        ) : editing ? (
          <View className="flex-row gap-2">
            <Button
              title="Cancel"
              variant="secondary"
              compact
              className="flex-1"
              onPress={() => setEditing(false)}
            />
            <Button
              title="Save changes"
              compact
              className="flex-1"
              loading={saving}
              onPress={() => void save()}
            />
          </View>
        ) : undefined
      }
    >
      <PageHeader title="Customs record" back={() => router.back()} />

      {query.isLoading ? <LoadingState label="Loading customs record" /> : null}
      {query.isError ? (
        <ErrorState message={query.error?.message} onRetry={() => void query.refetch()} />
      ) : null}

      {record ? (
        <>
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-[12px] font-bold uppercase tracking-wide text-jade-700">
                {record.recordNumber}
              </Text>
              <StatusBadge status={record.status} />
            </View>
            <Text className="text-[25px] font-bold leading-8 tracking-tight text-ink-900">
              {formatMoney(record.totalAmount, record.currency)}
            </Text>
            <Text className="text-[13px] text-ink-500">
              {record.shipment?.shipmentNumber ?? 'Shipment'} ·{' '}
              {record.customsOffice ?? 'Office pending'}
            </Text>
          </View>

          {editing ? (
            <View className="gap-3 rounded-card border border-ink-100 bg-surface p-4">
              <Text className="text-[15px] font-bold text-ink-900">Declaration and expenses</Text>
              <Controller
                control={control}
                name="declarationNumber"
                render={({ field }) => (
                  <TextField
                    label="Declaration number"
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="customsOffice"
                render={({ field }) => (
                  <TextField
                    label="Customs office"
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <TextField label="Country" value={field.value} onChangeText={field.onChange} />
                )}
              />
              <View className="flex-row gap-3">
                <Controller
                  control={control}
                  name="dutyAmount"
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Duty"
                      keyboardType="decimal-pad"
                      value={field.value}
                      onChangeText={field.onChange}
                      error={fieldState.error?.message}
                      containerClassName="flex-1"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="taxAmount"
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Tax"
                      keyboardType="decimal-pad"
                      value={field.value}
                      onChangeText={field.onChange}
                      error={fieldState.error?.message}
                      containerClassName="flex-1"
                    />
                  )}
                />
              </View>
              <View className="flex-row gap-3">
                <Controller
                  control={control}
                  name="otherFees"
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Other fees"
                      keyboardType="decimal-pad"
                      value={field.value}
                      onChangeText={field.onChange}
                      error={fieldState.error?.message}
                      containerClassName="flex-1"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="currency"
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Currency"
                      autoCapitalize="characters"
                      maxLength={3}
                      value={field.value}
                      onChangeText={field.onChange}
                      error={fieldState.error?.message}
                      containerClassName="w-28"
                    />
                  )}
                />
              </View>
              <View className="flex-row gap-3">
                <Controller
                  control={control}
                  name="exchangeRate"
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Exchange rate"
                      keyboardType="decimal-pad"
                      value={field.value}
                      onChangeText={field.onChange}
                      error={fieldState.error?.message}
                      containerClassName="flex-1"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="clearanceDate"
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Clearance date"
                      placeholder="YYYY-MM-DD"
                      value={field.value}
                      onChangeText={field.onChange}
                      error={fieldState.error?.message}
                      containerClassName="flex-1"
                    />
                  )}
                />
              </View>
              <Controller
                control={control}
                name="notes"
                render={({ field }) => (
                  <TextField
                    label="Notes"
                    value={field.value}
                    onChangeText={field.onChange}
                    multiline
                  />
                )}
              />
            </View>
          ) : (
            <>
              <DetailSection title="Declaration">
                <DetailRow label="Declaration" value={record.declarationNumber ?? 'Not set'} />
                <DetailRow label="Office" value={record.customsOffice ?? 'Not set'} />
                <DetailRow label="Country" value={record.country ?? 'Not set'} />
                <DetailRow label="Clearance date" value={formatDate(record.clearanceDate)} />
              </DetailSection>

              <DetailSection title="Expenses">
                <DetailRow label="Duty" value={formatMoney(record.dutyAmount, record.currency)} />
                <DetailRow label="Tax" value={formatMoney(record.taxAmount, record.currency)} />
                <DetailRow
                  label="Other fees"
                  value={formatMoney(record.otherFees, record.currency)}
                />
                <DetailRow label="Exchange rate" value={String(record.exchangeRate)} />
                <View className="my-1 h-px bg-ink-100" />
                <DetailRow
                  label="Total"
                  value={
                    <Text className="text-[18px] font-bold text-jade-700">
                      {formatMoney(record.totalAmount, record.currency)}
                    </Text>
                  }
                />
              </DetailSection>

              {record.notes ? (
                <DetailSection title="Notes">
                  <Text className="text-[13px] leading-5 text-ink-600">{record.notes}</Text>
                </DetailSection>
              ) : null}
            </>
          )}

          <DetailSection title="Shipment">
            <Button
              title="Open shipment"
              variant="secondary"
              compact
              onPress={() =>
                router.push({ pathname: '/shipments/[id]', params: { id: record.shipmentId } })
              }
            />
          </DetailSection>

          <AttachmentSection
            entityType="customs_record"
            entityId={record.id}
            canUpload={can('attachments', 'create')}
          />
        </>
      ) : null}
    </Screen>
  );
}
