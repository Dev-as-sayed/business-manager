import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import {
  useApprovePurchaseOrderMutation,
  useGetPurchaseOrderQuery,
  useUpdatePurchaseOrderStatusMutation,
} from '@/features/purchase-orders/purchase-orders.api';
import type { PurchaseOrderStatus } from '@/features/purchase-orders/purchase-orders.types';
import { AttachmentSection } from '@/features/attachments/components/AttachmentSection';
import { usePermission } from '@/shared/hooks/usePermission';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { Button } from '@/shared/components/Button';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { DetailRow, DetailSection } from '@/shared/components/DetailSection';
import { ErrorState, LoadingState } from '@/shared/components/StateViews';
import { PageHeader, Screen } from '@/shared/components/Screen';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { StatusTimeline, type TimelineStep } from '@/shared/components/StatusTimeline';
import { formatDate, formatMoney, titleCase } from '@/shared/utils/format';

const TRANSITIONS: Partial<Record<PurchaseOrderStatus, PurchaseOrderStatus[]>> = {
  DRAFT: ['PENDING_APPROVAL', 'CANCELLED'],
  PENDING_APPROVAL: ['CANCELLED'],
  APPROVED: ['IN_PRODUCTION', 'CANCELLED'],
  IN_PRODUCTION: ['SHIPPED'],
  SHIPPED: ['COMPLETED'],
};

export default function PurchaseOrderDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { can, user } = usePermission();
  const query = useGetPurchaseOrderQuery(id ?? '', { skip: !id });
  const [approve, { isLoading: approving }] = useApprovePurchaseOrderMutation();
  const [updateStatus, { isLoading: updating }] = useUpdatePurchaseOrderStatusMutation();
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<PurchaseOrderStatus | null>(null);

  if (!can('purchase_orders', 'read')) {
    return <AccessDenied onBack={() => router.back()} />;
  }

  const order = query.data;
  const isCustomer = user?.role === 'CUSTOMER';
  const canApprove = order?.status === 'PENDING_APPROVAL' && can('purchase_orders', 'approve');
  const transitions =
    isCustomer || !can('purchase_orders', 'update')
      ? []
      : (TRANSITIONS[order?.status ?? 'DRAFT'] ?? []);

  const steps: TimelineStep[] = order
    ? [
        { status: 'DRAFT', label: 'Draft created', date: order.createdAt },
        {
          status: 'PENDING_APPROVAL',
          label: 'Submitted for approval',
          date: order.submittedAt,
        },
        { status: 'APPROVED', label: 'Approved', date: order.approvedAt },
        {
          status: 'IN_PRODUCTION',
          label: 'In production',
          date: order.productionStartedAt,
        },
        { status: 'SHIPPED', label: 'Shipped', date: order.shippedAt },
        { status: 'COMPLETED', label: 'Completed', date: order.completedAt },
      ]
    : [];

  const changeStatus = async (status: PurchaseOrderStatus) => {
    if (!order) return;

    if (status === 'CANCELLED') {
      setPendingStatus(status);
      return;
    }

    await updateStatus({ id: order.id, status });
  };

  return (
    <Screen
      refreshing={query.isFetching}
      onRefresh={() => void query.refetch()}
      footer={
        order && (canApprove || transitions.length > 0) ? (
          <View className="flex-row flex-wrap gap-2">
            {canApprove ? (
              <Button title="Approve order" onPress={() => setConfirmApprove(true)} />
            ) : null}
            {transitions.map((status) => (
              <Button
                key={status}
                title={titleCase(status)}
                compact
                variant={status === 'CANCELLED' ? 'danger' : 'secondary'}
                loading={updating}
                onPress={() => void changeStatus(status)}
              />
            ))}
          </View>
        ) : undefined
      }
    >
      <PageHeader title="Purchase order" back={() => router.back()} />

      {query.isLoading ? <LoadingState label="Loading order" /> : null}
      {query.isError ? (
        <ErrorState message={query.error?.message} onRetry={() => void query.refetch()} />
      ) : null}

      {order ? (
        <>
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-[12px] font-bold uppercase tracking-wide text-jade-700">
                {order.orderNumber}
              </Text>
              <StatusBadge status={order.status} />
            </View>
            <Text className="text-[26px] font-bold leading-8 tracking-tight text-ink-900">
              {formatMoney(order.total, order.currency)}
            </Text>
            <Text className="text-[13px] text-ink-500">
              {order.customer?.name ?? 'Customer'} · {order.supplier?.name ?? 'Supplier'}
            </Text>
          </View>

          <DetailSection title="Progress">
            <StatusTimeline steps={steps} currentStatus={order.status} />
          </DetailSection>

          <DetailSection title="Order details">
            <DetailRow
              label="Quotation"
              value={order.quotation?.quotationNumber ?? 'Direct order'}
            />
            <DetailRow label="Expected delivery" value={formatDate(order.expectedDeliveryDate)} />
            <DetailRow
              label="Created by"
              value={
                order.createdBy ? `${order.createdBy.firstName} ${order.createdBy.lastName}` : '—'
              }
            />
            <DetailRow
              label="Approved by"
              value={
                order.approvedBy
                  ? `${order.approvedBy.firstName} ${order.approvedBy.lastName}`
                  : 'Not approved'
              }
            />
          </DetailSection>

          <DetailSection title={`Items · ${order._count.items}`}>
            <View className="gap-2">
              {(order.items ?? []).map((item) => (
                <View key={item.id} className="rounded-xl border border-ink-100 bg-canvas p-3">
                  <View className="flex-row items-start justify-between gap-3">
                    <Text className="flex-1 text-[14px] font-semibold text-ink-900">
                      {item.name}
                    </Text>
                    <Text className="text-[13px] font-bold text-ink-800">
                      {formatMoney(item.total, order.currency)}
                    </Text>
                  </View>
                  <Text className="mt-1 text-[11px] text-ink-400">
                    {item.quantity} × {formatMoney(item.unitCost, order.currency)}
                  </Text>
                  {item.description ? (
                    <Text className="mt-1 text-[12px] leading-4 text-ink-500">
                      {item.description}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          </DetailSection>

          <DetailSection title="Totals">
            <DetailRow label="Subtotal" value={formatMoney(order.subtotal, order.currency)} />
            <DetailRow label="Shipping" value={formatMoney(order.shippingFee, order.currency)} />
            <DetailRow label="Tax" value={formatMoney(order.tax, order.currency)} />
            <View className="my-1 h-px bg-ink-100" />
            <DetailRow
              label="Total"
              value={
                <Text className="text-[18px] font-bold text-jade-700">
                  {formatMoney(order.total, order.currency)}
                </Text>
              }
            />
          </DetailSection>

          {order.notes ? (
            <DetailSection title="Notes">
              <Text className="text-[13px] leading-5 text-ink-600">{order.notes}</Text>
            </DetailSection>
          ) : null}

          <AttachmentSection
            entityType="purchase_order"
            entityId={order.id}
            canUpload={can('attachments', 'create')}
          />

          <ConfirmDialog
            visible={confirmApprove}
            title="Approve this purchase order?"
            message="Approval allows production to begin. Make sure quantities, costs, and supplier details are correct."
            confirmLabel="Approve"
            loading={approving}
            onCancel={() => setConfirmApprove(false)}
            onConfirm={() => {
              setConfirmApprove(false);
              void approve(order.id);
            }}
          />

          <ConfirmDialog
            visible={pendingStatus === 'CANCELLED'}
            title="Cancel this purchase order?"
            message="This will stop the order. The action cannot be undone."
            confirmLabel="Cancel order"
            cancelLabel="Keep order"
            destructive
            loading={updating}
            onCancel={() => setPendingStatus(null)}
            onConfirm={() => {
              if (order && pendingStatus) {
                void updateStatus({ id: order.id, status: pendingStatus });
              }
              setPendingStatus(null);
            }}
          />
        </>
      ) : null}
    </Screen>
  );
}
