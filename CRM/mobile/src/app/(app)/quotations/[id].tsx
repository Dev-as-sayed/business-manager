import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import {
  useApproveQuotationMutation,
  useGetQuotationQuery,
  useUpdateQuotationStatusMutation,
} from '@/features/quotations/quotations.api';
import type { QuotationStatus } from '@/features/quotations/quotations.types';
import { AttachmentSection } from '@/features/attachments/components/AttachmentSection';
import { usePermission } from '@/shared/hooks/usePermission';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { Button } from '@/shared/components/Button';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { DetailRow, DetailSection } from '@/shared/components/DetailSection';
import { ErrorState, LoadingState } from '@/shared/components/StateViews';
import { PageHeader, Screen } from '@/shared/components/Screen';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatDate, formatMoney, titleCase } from '@/shared/utils/format';

const STAFF_TRANSITIONS: Partial<Record<QuotationStatus, Exclude<QuotationStatus, 'APPROVED'>[]>> =
  {
    DRAFT: ['SENT'],
    SENT: ['REJECTED', 'EXPIRED'],
  };

export default function QuotationDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { can, user } = usePermission();
  const query = useGetQuotationQuery(id ?? '', { skip: !id });
  const [approve, { isLoading: approving }] = useApproveQuotationMutation();
  const [updateStatus, { isLoading: updating }] = useUpdateQuotationStatusMutation();
  const [confirmApprove, setConfirmApprove] = useState(false);

  if (!can('quotations', 'read')) {
    return <AccessDenied onBack={() => router.back()} />;
  }

  const quotation = query.data;
  const isCustomer = user?.role === 'CUSTOMER';
  const canApprove = quotation?.status === 'SENT' && can('quotations', 'approve');
  const transitions: Exclude<QuotationStatus, 'APPROVED'>[] =
    quotation?.status === 'SENT' && isCustomer
      ? []
      : (STAFF_TRANSITIONS[quotation?.status ?? 'DRAFT'] ?? []);

  return (
    <Screen
      refreshing={query.isFetching}
      onRefresh={() => void query.refetch()}
      footer={
        quotation ? (
          <View className="flex-row flex-wrap gap-2">
            {canApprove ? (
              <Button title="Approve quotation" onPress={() => setConfirmApprove(true)} />
            ) : null}
            {!isCustomer
              ? transitions.map((status) => (
                  <Button
                    key={status}
                    title={titleCase(status)}
                    variant={status === 'REJECTED' ? 'danger' : 'secondary'}
                    compact
                    loading={updating}
                    onPress={() => void updateStatus({ id: quotation.id, status })}
                  />
                ))
              : null}
          </View>
        ) : undefined
      }
    >
      <PageHeader title="Quotation" back={() => router.back()} />

      {query.isLoading ? <LoadingState label="Loading quotation" /> : null}
      {query.isError ? (
        <ErrorState message={query.error?.message} onRetry={() => void query.refetch()} />
      ) : null}

      {quotation ? (
        <>
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-[12px] font-bold uppercase tracking-wide text-jade-700">
                {quotation.quotationNumber}
              </Text>
              <StatusBadge status={quotation.status} />
            </View>
            <Text className="text-[26px] font-bold leading-8 tracking-tight text-ink-900">
              {formatMoney(quotation.total, quotation.currency)}
            </Text>
            <Text className="text-[13px] text-ink-500">
              {quotation.customer?.name ?? 'Customer'} · Valid until{' '}
              {quotation.validUntil ? formatDate(quotation.validUntil) : 'not set'}
            </Text>
          </View>

          {quotation.status === 'SENT' && isCustomer ? (
            <View className="rounded-card border border-jade-200 bg-jade-50 p-4">
              <Text className="text-[13px] font-semibold text-jade-800">
                This quotation is waiting for your approval.
              </Text>
              <Text className="mt-1 text-[12px] leading-5 text-jade-700">
                Review the line items and totals below. Approving starts the purchase order process.
              </Text>
            </View>
          ) : null}

          <DetailSection title="Pricing">
            <DetailRow
              label="Subtotal"
              value={formatMoney(quotation.subtotal, quotation.currency)}
            />
            <DetailRow
              label={`Service fee (${Number(quotation.serviceFeeRate)}%)`}
              value={formatMoney(quotation.serviceFee, quotation.currency)}
            />
            <DetailRow
              label="Shipping"
              value={formatMoney(quotation.shippingFee, quotation.currency)}
            />
            <DetailRow label="Tax" value={formatMoney(quotation.tax, quotation.currency)} />
            <View className="my-1 h-px bg-ink-100" />
            <DetailRow
              label="Total"
              value={
                <Text className="text-[18px] font-bold text-jade-700">
                  {formatMoney(quotation.total, quotation.currency)}
                </Text>
              }
            />
          </DetailSection>

          <DetailSection title={`Line items · ${quotation._count.items}`}>
            <View className="gap-2">
              {(quotation.items ?? []).map((item) => (
                <View key={item.id} className="rounded-xl border border-ink-100 bg-canvas p-3">
                  <View className="flex-row items-start justify-between gap-3">
                    <Text className="flex-1 text-[14px] font-semibold text-ink-900">
                      {item.name}
                    </Text>
                    <Text className="text-[13px] font-bold text-ink-800">
                      {formatMoney(Number(item.unitPrice) * item.quantity, quotation.currency)}
                    </Text>
                  </View>
                  <Text className="mt-1 text-[11px] text-ink-400">
                    {item.quantity} × {formatMoney(item.unitPrice, quotation.currency)}
                  </Text>
                </View>
              ))}
            </View>
          </DetailSection>

          {quotation.notes ? (
            <DetailSection title="Notes">
              <Text className="text-[13px] leading-5 text-ink-600">{quotation.notes}</Text>
            </DetailSection>
          ) : null}

          <DetailSection title="Activity">
            <DetailRow
              label="Prepared by"
              value={
                quotation.createdBy
                  ? `${quotation.createdBy.firstName} ${quotation.createdBy.lastName}`
                  : '—'
              }
            />
            <DetailRow label="Sent" value={formatDate(quotation.sentAt)} />
            <DetailRow
              label="Approved by"
              value={
                quotation.approvedBy
                  ? `${quotation.approvedBy.firstName} ${quotation.approvedBy.lastName}`
                  : 'Not approved'
              }
            />
            <DetailRow label="Approved at" value={formatDate(quotation.approvedAt)} />
          </DetailSection>

          <AttachmentSection
            entityType="quotation"
            entityId={quotation.id}
            canUpload={can('attachments', 'create')}
          />

          <ConfirmDialog
            visible={confirmApprove}
            title="Approve this quotation?"
            message="Approving confirms the price and starts the purchase order process. This cannot be undone."
            confirmLabel="Approve"
            loading={approving}
            onCancel={() => setConfirmApprove(false)}
            onConfirm={() => {
              setConfirmApprove(false);
              void approve(quotation.id);
            }}
          />
        </>
      ) : null}
    </Screen>
  );
}
