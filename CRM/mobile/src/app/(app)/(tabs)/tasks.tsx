import { router } from 'expo-router';
import { ClipboardCheck, ClipboardList } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { useListProductRequestsQuery } from '@/features/product-requests/product-requests.api';
import { useListQcReportsQuery } from '@/features/quality-control/quality-control.api';
import { ListRow } from '@/shared/components/StateViews';
import { PageHeader, Screen } from '@/shared/components/Screen';
import { SectionTitle } from '@/shared/components/SectionTitle';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { usePermission } from '@/shared/hooks/usePermission';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { formatDate } from '@/shared/utils/format';

export default function TasksScreen() {
  const { can } = usePermission();
  const submitted = useListProductRequestsQuery({ status: 'SUBMITTED', limit: 20 });
  const reviewing = useListProductRequestsQuery({ status: 'REVIEWING', limit: 20 });
  const qc = useListQcReportsQuery({ status: 'PENDING', limit: 20 });

  if (!can('product_requests', 'read') && !can('quality_control', 'read')) {
    return <AccessDenied onBack={() => router.back()} />;
  }

  const requests = [...(submitted.data?.items ?? []), ...(reviewing.data?.items ?? [])];
  const loading = submitted.isLoading || reviewing.isLoading || qc.isLoading;

  return (
    <Screen
      refreshing={submitted.isFetching || reviewing.isFetching || qc.isFetching}
      onRefresh={() => {
        void submitted.refetch();
        void reviewing.refetch();
        void qc.refetch();
      }}
    >
      <PageHeader title="Tasks" subtitle="Sourcing requests and inspections that need an owner." />

      <SectionTitle title="Sourcing queue" subtitle={`${requests.length} active requests`} />
      {loading ? <Text className="text-[12px] text-ink-400">Loading tasks...</Text> : null}
      {!loading && requests.length === 0 ? (
        <View className="flex-row items-center gap-3 rounded-card border border-dashed border-ink-200 bg-surface/70 p-4">
          <ClipboardList size={20} color="#718B7F" />
          <Text className="flex-1 text-[12px] text-ink-500">
            No submitted or reviewing requests right now.
          </Text>
        </View>
      ) : (
        requests.map((request) => (
          <ListRow
            key={request.id}
            title={request.title}
            subtitle={`${request.requestNumber} · ${request.customer?.name ?? 'Internal'} · ${formatDate(request.createdAt)}`}
            onPress={() =>
              router.push({ pathname: '/product-requests/[id]', params: { id: request.id } })
            }
            right={<StatusBadge status={request.status} />}
          />
        ))
      )}

      <SectionTitle title="QC queue" subtitle={`${qc.data?.meta.total ?? 0} pending inspections`} />
      {!qc.isLoading && (qc.data?.items ?? []).length === 0 ? (
        <View className="flex-row items-center gap-3 rounded-card border border-dashed border-ink-200 bg-surface/70 p-4">
          <ClipboardCheck size={20} color="#718B7F" />
          <Text className="flex-1 text-[12px] text-ink-500">
            No pending inspections. New QC tasks will appear here.
          </Text>
        </View>
      ) : (
        (qc.data?.items ?? []).map((report) => (
          <ListRow
            key={report.id}
            title={report.reportNumber}
            subtitle={`${report.purchaseOrder?.orderNumber ?? 'Purchase order'} · ${report.supplier?.name ?? 'Supplier'}`}
            onPress={() => router.push({ pathname: '/qc/[id]', params: { id: report.id } })}
            right={<StatusBadge status={report.status} />}
          />
        ))
      )}
    </Screen>
  );
}
