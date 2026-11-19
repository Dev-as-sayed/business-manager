import { router, useLocalSearchParams } from 'expo-router';
import { Share, Text, View } from 'react-native';
import {
  useGetProductRequestQuery,
  useUpdateProductRequestStatusMutation,
} from '@/features/product-requests/product-requests.api';
import type { ProductRequestStatus } from '@/features/product-requests/product-requests.types';
import { AttachmentSection } from '@/features/attachments/components/AttachmentSection';
import { usePermission } from '@/shared/hooks/usePermission';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { Button } from '@/shared/components/Button';
import { DetailRow, DetailSection } from '@/shared/components/DetailSection';
import { ErrorState, LoadingState } from '@/shared/components/StateViews';
import { PageHeader, Screen } from '@/shared/components/Screen';
import { Share2 } from 'lucide-react-native';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatDate, formatMoney, titleCase } from '@/shared/utils/format';

const STAFF_TRANSITIONS: Partial<Record<ProductRequestStatus, ProductRequestStatus[]>> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['REVIEWING', 'CANCELLED'],
  REVIEWING: ['QUOTED', 'REJECTED', 'CANCELLED'],
  QUOTED: ['APPROVED', 'REJECTED', 'CANCELLED'],
};

const CUSTOMER_TRANSITIONS: Partial<Record<ProductRequestStatus, ProductRequestStatus[]>> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['CANCELLED'],
};

const isDestructive = (status: ProductRequestStatus) =>
  status === 'CANCELLED' || status === 'REJECTED';

export default function ProductRequestDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { can, user } = usePermission();
  const query = useGetProductRequestQuery(id ?? '', { skip: !id });
  const [updateStatus, { isLoading: updating }] = useUpdateProductRequestStatusMutation();

  if (!can('product_requests', 'read')) {
    return <AccessDenied onBack={() => router.back()} />;
  }

  const request = query.data;
  const transitions =
    (user?.role === 'CUSTOMER' ? CUSTOMER_TRANSITIONS : STAFF_TRANSITIONS)[
      request?.status ?? 'DRAFT'
    ] ?? [];

  return (
    <Screen
      refreshing={query.isFetching}
      onRefresh={() => void query.refetch()}
      footer={
        request ? (
          <View className="flex-row flex-wrap gap-2">
            <Button
              title="Share"
              variant="secondary"
              compact
              icon={<Share2 size={14} color="#14211C" />}
              onPress={() =>
                void Share.share({
                  message: `${request.requestNumber}: omnia://product-requests/${request.id}`,
                })
              }
            />
            {transitions.map((status) => (
              <Button
                key={status}
                title={titleCase(status)}
                compact
                variant={isDestructive(status) ? 'danger' : 'primary'}
                loading={updating}
                onPress={() => void updateStatus({ id: request.id, status })}
              />
            ))}
          </View>
        ) : undefined
      }
    >
      <PageHeader title="Request detail" back={() => router.back()} />

      {query.isLoading ? <LoadingState label="Loading request" /> : null}
      {query.isError ? (
        <ErrorState message={query.error?.message} onRetry={() => void query.refetch()} />
      ) : null}

      {request ? (
        <>
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-[12px] font-bold uppercase tracking-wide text-jade-700">
                {request.requestNumber}
              </Text>
              <StatusBadge status={request.status} />
            </View>
            <Text className="text-[26px] font-bold leading-8 tracking-tight text-ink-900">
              {request.title}
            </Text>
            {request.description ? (
              <Text className="text-[13px] leading-5 text-ink-500">{request.description}</Text>
            ) : null}
          </View>

          <DetailSection title="Overview">
            <DetailRow label="Customer" value={request.customer?.name ?? 'Internal'} />
            <DetailRow
              label="Created by"
              value={
                request.createdBy
                  ? `${request.createdBy.firstName} ${request.createdBy.lastName}`
                  : 'Unknown'
              }
            />
            <DetailRow
              label="Assigned to"
              value={
                request.assignedUser
                  ? `${request.assignedUser.firstName} ${request.assignedUser.lastName}`
                  : 'Unassigned'
              }
            />
            <DetailRow label="Created" value={formatDate(request.createdAt)} />
            <DetailRow label="Last update" value={formatDate(request.updatedAt)} />
          </DetailSection>

          <DetailSection title={`Items · ${request._count.items}`}>
            <View className="gap-2">
              {(request.items ?? []).map((item) => (
                <View key={item.id} className="rounded-xl border border-ink-100 bg-canvas p-3">
                  <View className="flex-row items-start justify-between gap-3">
                    <Text className="flex-1 text-[14px] font-semibold text-ink-900">
                      {item.name}
                    </Text>
                    <Text className="rounded-full bg-jade-50 px-2 py-0.5 text-[11px] font-bold text-jade-700">
                      x{item.quantity}
                    </Text>
                  </View>
                  {item.description ? (
                    <Text className="mt-1 text-[12px] leading-4 text-ink-500">
                      {item.description}
                    </Text>
                  ) : null}
                  <Text className="mt-1.5 text-[11px] text-ink-400">
                    Target {item.targetPrice ? formatMoney(item.targetPrice) : 'not set'}
                  </Text>
                </View>
              ))}
            </View>
          </DetailSection>

          <AttachmentSection
            entityType="product_request"
            entityId={request.id}
            canUpload={can('attachments', 'create')}
          />
        </>
      ) : null}
    </Screen>
  );
}
