import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Pencil, ScanLine } from 'lucide-react-native';
import { Text, View } from 'react-native';
import {
  useGetShipmentQuery,
  useUpdateShipmentMutation,
  useUpdateShipmentStatusMutation,
} from '@/features/shipments/shipments.api';
import {
  updateShipmentSchema,
  type UpdateShipmentFormValues,
} from '@/features/shipments/shipments.schema';
import type { ShipmentStatus } from '@/features/shipments/shipments.types';
import { AttachmentSection } from '@/features/attachments/components/AttachmentSection';
import { BarcodeScannerModal } from '@/shared/components/BarcodeScannerModal';
import { usePermission } from '@/shared/hooks/usePermission';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { Button } from '@/shared/components/Button';
import { DetailRow, DetailSection } from '@/shared/components/DetailSection';
import { ErrorState, LoadingState } from '@/shared/components/StateViews';
import { PageHeader, Screen } from '@/shared/components/Screen';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { StatusTimeline, type TimelineStep } from '@/shared/components/StatusTimeline';
import { TextField } from '@/shared/components/TextField';
import { formatDate, titleCase } from '@/shared/utils/format';

const TRANSITIONS: Partial<Record<ShipmentStatus, ShipmentStatus[]>> = {
  PENDING: ['PREPARING', 'CANCELLED'],
  PREPARING: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED'],
};

export default function ShipmentDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { can } = usePermission();
  const query = useGetShipmentQuery(id ?? '', { skip: !id });
  const [updateStatus, { isLoading: updating }] = useUpdateShipmentStatusMutation();
  const [updateShipment, { isLoading: saving }] = useUpdateShipmentMutation();
  const [editing, setEditing] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const { control, handleSubmit, reset, setValue } = useForm<UpdateShipmentFormValues>({
    resolver: zodResolver(updateShipmentSchema),
    defaultValues: {
      carrier: '',
      trackingNumber: '',
      shippingMethod: '',
      origin: '',
      destination: '',
      estimatedDeliveryDate: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (!query.data) return;

    reset({
      carrier: query.data.carrier ?? '',
      trackingNumber: query.data.trackingNumber ?? '',
      shippingMethod: query.data.shippingMethod ?? '',
      origin: query.data.origin ?? '',
      destination: query.data.destination ?? '',
      estimatedDeliveryDate: query.data.estimatedDeliveryDate?.slice(0, 10) ?? '',
      notes: query.data.notes ?? '',
    });
  }, [query.data, reset]);

  if (!can('shipments', 'read')) {
    return <AccessDenied onBack={() => router.back()} />;
  }

  const shipment = query.data;
  const canUpdate = can('shipments', 'update');
  const transitions = canUpdate ? (TRANSITIONS[shipment?.status ?? 'PENDING'] ?? []) : [];

  const steps: TimelineStep[] = shipment
    ? [
        { status: 'PENDING', label: 'Shipment created', date: shipment.createdAt },
        {
          status: 'PREPARING',
          label: 'Preparing package',
          date: shipment.status === 'PREPARING' ? shipment.updatedAt : null,
        },
        { status: 'IN_TRANSIT', label: 'In transit', date: shipment.shippedAt },
        { status: 'DELIVERED', label: 'Delivered', date: shipment.deliveredAt },
      ]
    : [];

  const saveDetails = handleSubmit(async (values) => {
    if (!shipment) return;

    try {
      await updateShipment({ id: shipment.id, body: values }).unwrap();
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
              title="Edit details"
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
                variant={status === 'CANCELLED' ? 'danger' : 'primary'}
                loading={updating}
                onPress={() => void updateStatus({ id: shipment!.id, status })}
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
              onPress={() => void saveDetails()}
            />
          </View>
        ) : undefined
      }
    >
      <PageHeader title="Shipment" back={() => router.back()} />

      {query.isLoading ? <LoadingState label="Loading shipment" /> : null}
      {query.isError ? (
        <ErrorState message={query.error?.message} onRetry={() => void query.refetch()} />
      ) : null}

      {shipment ? (
        <>
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-[12px] font-bold uppercase tracking-wide text-jade-700">
                {shipment.shipmentNumber}
              </Text>
              <StatusBadge status={shipment.status} />
            </View>
            <Text className="text-[24px] font-bold leading-8 tracking-tight text-ink-900">
              {shipment.destination ?? 'Destination pending'}
            </Text>
            <Text className="text-[13px] text-ink-500">
              {shipment.customer?.name ?? 'Customer'} · ETA{' '}
              {formatDate(shipment.estimatedDeliveryDate)}
            </Text>
          </View>

          {editing ? (
            <View className="gap-3 rounded-card border border-ink-100 bg-surface p-4">
              <Text className="text-[15px] font-bold text-ink-900">Shipment details</Text>
              <Controller
                control={control}
                name="carrier"
                render={({ field, fieldState }) => (
                  <TextField
                    label="Carrier"
                    placeholder="e.g. DHL Express"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="trackingNumber"
                render={({ field, fieldState }) => (
                  <View className="flex-row items-end gap-2">
                    <TextField
                      label="Tracking number"
                      placeholder="Carrier tracking ID"
                      autoCapitalize="characters"
                      value={field.value}
                      onChangeText={field.onChange}
                      error={fieldState.error?.message}
                      containerClassName="flex-1"
                    />
                    <Button
                      title="Scan"
                      variant="secondary"
                      compact
                      icon={<ScanLine size={15} color="#14211C" />}
                      onPress={() => setScannerOpen(true)}
                    />
                  </View>
                )}
              />
              <Controller
                control={control}
                name="shippingMethod"
                render={({ field, fieldState }) => (
                  <TextField
                    label="Shipping method"
                    placeholder="Air freight, sea freight, courier"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <View className="flex-row gap-3">
                <Controller
                  control={control}
                  name="origin"
                  render={({ field }) => (
                    <TextField
                      label="Origin"
                      placeholder="Shenzhen"
                      value={field.value}
                      onChangeText={field.onChange}
                      containerClassName="flex-1"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="destination"
                  render={({ field }) => (
                    <TextField
                      label="Destination"
                      placeholder="London"
                      value={field.value}
                      onChangeText={field.onChange}
                      containerClassName="flex-1"
                    />
                  )}
                />
              </View>
              <Controller
                control={control}
                name="estimatedDeliveryDate"
                render={({ field, fieldState }) => (
                  <TextField
                    label="Estimated delivery"
                    placeholder="YYYY-MM-DD"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="notes"
                render={({ field }) => (
                  <TextField
                    label="Notes"
                    placeholder="Packaging or delivery notes"
                    value={field.value}
                    onChangeText={field.onChange}
                    multiline
                  />
                )}
              />
            </View>
          ) : (
            <>
              <DetailSection title="Progress">
                <StatusTimeline steps={steps} currentStatus={shipment.status} />
              </DetailSection>

              <DetailSection title="Tracking">
                <DetailRow label="Carrier" value={shipment.carrier ?? 'Not set'} />
                <DetailRow label="Tracking number" value={shipment.trackingNumber ?? 'Not set'} />
                <DetailRow label="Method" value={shipment.shippingMethod ?? 'Not set'} />
                <DetailRow label="Origin" value={shipment.origin ?? 'Not set'} />
                <DetailRow label="Destination" value={shipment.destination ?? 'Not set'} />
                <DetailRow
                  label="Actual delivery"
                  value={formatDate(shipment.actualDeliveryDate)}
                />
              </DetailSection>

              <DetailSection title={`Packages · ${shipment._count.items}`}>
                <View className="gap-2">
                  {(shipment.items ?? []).map((item) => (
                    <View key={item.id} className="rounded-xl border border-ink-100 bg-canvas p-3">
                      <Text className="text-[13px] font-semibold text-ink-900">
                        {item.purchaseOrderItem.name}
                      </Text>
                      <Text className="mt-0.5 text-[11px] text-ink-400">
                        {item.purchaseOrderItem.purchaseOrder.orderNumber} · Qty {item.quantity}
                      </Text>
                    </View>
                  ))}
                </View>
              </DetailSection>

              {shipment.notes ? (
                <DetailSection title="Notes">
                  <Text className="text-[13px] leading-5 text-ink-600">{shipment.notes}</Text>
                </DetailSection>
              ) : null}
            </>
          )}

          <AttachmentSection
            entityType="shipment"
            entityId={shipment.id}
            canUpload={can('attachments', 'create')}
          />
        </>
      ) : null}
      <BarcodeScannerModal
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={(value) => {
          setValue('trackingNumber', value, { shouldValidate: true });
          setScannerOpen(false);
        }}
      />
    </Screen>
  );
}
