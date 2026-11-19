import { router, useLocalSearchParams } from 'expo-router';
import { Image, Linking, Pressable, Text, View } from 'react-native';
import {
  useGetQcReportQuery,
  useUpdateQcReportStatusMutation,
} from '@/features/quality-control/quality-control.api';
import type { QcStatus } from '@/features/quality-control/quality-control.types';
import { useListAttachmentsQuery } from '@/features/attachments/attachments.api';
import { AttachmentSection } from '@/features/attachments/components/AttachmentSection';
import { usePermission } from '@/shared/hooks/usePermission';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { Button } from '@/shared/components/Button';
import { DetailRow, DetailSection } from '@/shared/components/DetailSection';
import { ErrorState, LoadingState } from '@/shared/components/StateViews';
import { PageHeader, Screen } from '@/shared/components/Screen';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { env } from '@/config/env';
import { formatDate, titleCase } from '@/shared/utils/format';

const TRANSITIONS: Partial<Record<QcStatus, QcStatus[]>> = {
  PENDING: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['PASSED', 'FAILED', 'CANCELLED'],
  FAILED: ['IN_PROGRESS'],
};

const absoluteUrl = (url: string): string =>
  url.startsWith('http') ? url : `${env.apiUrl.replace(/\/api\/v1\/?$/, '')}${url}`;

export default function QcDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { can, user } = usePermission();
  const query = useGetQcReportQuery(id ?? '', { skip: !id });
  const attachments = useListAttachmentsQuery(
    { entityType: 'qc_report', entityId: id ?? '', limit: 50 },
    { skip: !id },
  );
  const [updateStatus, { isLoading: updating }] = useUpdateQcReportStatusMutation();

  if (!can('quality_control', 'read')) {
    return <AccessDenied onBack={() => router.back()} />;
  }

  const report = query.data;
  const canUpdate = can('quality_control', 'update') && user?.role !== 'CUSTOMER';
  const transitions = canUpdate ? (TRANSITIONS[report?.status ?? 'PENDING'] ?? []) : [];
  const photos = [
    ...(report?.photoUrls ?? []),
    ...(attachments.data?.items ?? [])
      .filter((attachment) => attachment.mimeType.startsWith('image/'))
      .map((attachment) => absoluteUrl(attachment.url)),
  ].filter((url, index, list) => list.indexOf(url) === index);

  return (
    <Screen
      refreshing={query.isFetching}
      onRefresh={() => void query.refetch()}
      footer={
        transitions.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {transitions.map((status) => (
              <Button
                key={status}
                title={titleCase(status)}
                compact
                variant={status === 'FAILED' || status === 'CANCELLED' ? 'danger' : 'primary'}
                loading={updating}
                onPress={() => void updateStatus({ id: report!.id, status })}
              />
            ))}
          </View>
        ) : undefined
      }
    >
      <PageHeader title="Inspection report" back={() => router.back()} />

      {query.isLoading ? <LoadingState label="Loading report" /> : null}
      {query.isError ? (
        <ErrorState message={query.error?.message} onRetry={() => void query.refetch()} />
      ) : null}

      {report ? (
        <>
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-[12px] font-bold uppercase tracking-wide text-jade-700">
                {report.reportNumber}
              </Text>
              <StatusBadge status={report.status} />
            </View>
            <Text className="text-[24px] font-bold leading-8 tracking-tight text-ink-900">
              {report.purchaseOrder?.orderNumber ?? 'Purchase order'}
            </Text>
            <Text className="text-[13px] text-ink-500">
              {report.supplier?.name ?? 'Supplier'} · {report.customer?.name ?? 'Customer'}
            </Text>
          </View>

          <DetailSection title="Inspection details">
            <DetailRow label="Inspection date" value={formatDate(report.inspectionDate)} />
            <DetailRow
              label="Inspector"
              value={
                report.inspector
                  ? `${report.inspector.firstName} ${report.inspector.lastName}`
                  : 'Unassigned'
              }
            />
            <DetailRow label="Completed" value={formatDate(report.completedAt)} />
            <DetailRow label="Photos" value={`${photos.length}`} />
          </DetailSection>

          {report.notes ? (
            <DetailSection title="Checklist and notes">
              <Text className="text-[13px] leading-6 text-ink-600">{report.notes}</Text>
            </DetailSection>
          ) : null}

          {photos.length > 0 ? (
            <DetailSection title="Photo gallery">
              <View className="flex-row flex-wrap gap-2">
                {photos.map((url) => (
                  <Pressable
                    key={url}
                    onPress={() => void Linking.openURL(url)}
                    className="overflow-hidden rounded-xl bg-ink-50"
                  >
                    <Image source={{ uri: url }} className="h-28 w-28" resizeMode="cover" />
                  </Pressable>
                ))}
              </View>
            </DetailSection>
          ) : null}

          <DetailSection title="Purchase order">
            <Button
              title="Open purchase order"
              variant="secondary"
              compact
              onPress={() =>
                router.push({
                  pathname: '/purchase-orders/[id]',
                  params: { id: report.purchaseOrderId },
                })
              }
            />
          </DetailSection>

          <AttachmentSection
            entityType="qc_report"
            entityId={report.id}
            canUpload={can('attachments', 'create')}
          />
        </>
      ) : null}
    </Screen>
  );
}
