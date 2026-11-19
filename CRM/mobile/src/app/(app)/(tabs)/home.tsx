import { useState } from 'react';
import { router, type Href } from 'expo-router';
import { skipToken } from '@reduxjs/toolkit/query';
import { format } from 'date-fns';
import {
  BellRing,
  ClipboardCheck,
  ClipboardList,
  FileText,
  PackageCheck,
  ScanLine,
  Truck,
  Wallet,
} from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { toast } from 'sonner-native';
import { useListPurchaseOrdersQuery } from '@/features/purchase-orders/purchase-orders.api';
import { useListProductRequestsQuery } from '@/features/product-requests/product-requests.api';
import { useListQuotationsQuery } from '@/features/quotations/quotations.api';
import { useListQcReportsQuery } from '@/features/quality-control/quality-control.api';
import { useListShipmentsQuery } from '@/features/shipments/shipments.api';
import { useListCustomsRecordsQuery } from '@/features/customs/customs.api';
import { useNotificationFeed } from '@/features/notifications/useNotificationFeed';
import { usePermission } from '@/shared/hooks/usePermission';
import { BarcodeScannerModal } from '@/shared/components/BarcodeScannerModal';
import { Button } from '@/shared/components/Button';
import { ListRow } from '@/shared/components/StateViews';
import { PageHeader, Screen } from '@/shared/components/Screen';
import { SectionTitle } from '@/shared/components/SectionTitle';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatMoney, titleCase } from '@/shared/utils/format';
import { ROLE_LABELS } from '@/config/routes.config';
import { cn } from '@/shared/utils/cn';

export default function HomeScreen() {
  const { can, user, role } = usePermission();
  const [scannerOpen, setScannerOpen] = useState(false);
  const { items: notifications } = useNotificationFeed();

  const orders = useListPurchaseOrdersQuery({ limit: 5 });
  const requests = useListProductRequestsQuery(
    can('product_requests', 'read') ? { limit: 5 } : skipToken,
  );
  const quotations = useListQuotationsQuery(
    can('quotations', 'read') ? { limit: 5, status: 'SENT' } : skipToken,
  );
  const qcReports = useListQcReportsQuery(
    can('quality_control', 'read') ? { limit: 5, status: 'PENDING' } : skipToken,
  );
  const shipments = useListShipmentsQuery({ limit: 5 });
  const customs = useListCustomsRecordsQuery(
    can('customs', 'read') ? { limit: 5, status: 'HELD' } : skipToken,
  );

  const cards = [
    can('quotations', 'read')
      ? {
          label: 'Quotes to review',
          value: quotations.data?.meta.total ?? 0,
          icon: FileText,
          href: '/quotations',
          tone: 'amber',
        }
      : null,
    {
      label: 'Open orders',
      value: orders.data?.meta.total ?? 0,
      icon: ClipboardList,
      href: '/orders',
      tone: 'jade',
    },
    can('quality_control', 'read')
      ? {
          label: 'QC pending',
          value: qcReports.data?.meta.total ?? 0,
          icon: ClipboardCheck,
          href: '/qc',
          tone: 'sky',
        }
      : null,
    {
      label: 'Shipments',
      value: shipments.data?.meta.total ?? 0,
      icon: Truck,
      href: '/shipments',
      tone: 'coral',
    },
    can('product_requests', 'read')
      ? {
          label: 'Product requests',
          value: requests.data?.meta.total ?? 0,
          icon: PackageCheck,
          href: '/product-requests',
          tone: 'jade',
        }
      : null,
    can('customs', 'read')
      ? {
          label: 'Customs held',
          value: customs.data?.meta.total ?? 0,
          icon: Wallet,
          href: '/customs',
          tone: 'amber',
        }
      : null,
  ].filter((card): card is NonNullable<typeof card> => Boolean(card));

  const recent = can('shipments', 'read') ? (shipments.data?.items ?? []).slice(0, 3) : [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <Screen
      refreshing={orders.isFetching || shipments.isFetching}
      onRefresh={() => {
        void orders.refetch();
        void shipments.refetch();
      }}
    >
      <PageHeader
        title={`${greeting}, ${user?.firstName ?? 'there'}`}
        subtitle={`${format(new Date(), 'EEEE, d MMMM')} · ${ROLE_LABELS[role ?? ''] ?? 'Team'}`}
      />

      <View className="flex-row flex-wrap gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const tone =
            card.tone === 'amber'
              ? 'bg-amber-50 text-amber-700'
              : card.tone === 'sky'
                ? 'bg-sky-50 text-sky-700'
                : card.tone === 'coral'
                  ? 'bg-coral-50 text-coral-700'
                  : 'bg-jade-50 text-jade-700';

          return (
            <Pressable
              key={card.label}
              onPress={() => router.push(card.href as Href)}
              className="w-[47%] flex-1 rounded-card border border-ink-100/70 bg-surface p-4 active:opacity-70"
            >
              <View className={cn('mb-3 h-9 w-9 items-center justify-center rounded-xl', tone)}>
                <Icon size={18} color="#047857" />
              </View>
              <Text className="text-[24px] font-bold tracking-tight text-ink-900">
                {card.value}
              </Text>
              <Text className="text-[11px] font-medium text-ink-500">{card.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row gap-2">
        {can('product_requests', 'create') ? (
          <Button
            title="New request"
            compact
            className="flex-1"
            onPress={() => router.push('/product-requests/new')}
          />
        ) : null}
        {can('quality_control', 'create') ? (
          <Button
            title="New inspection"
            compact
            className="flex-1"
            variant={can('product_requests', 'create') ? 'secondary' : 'primary'}
            onPress={() => router.push('/qc/new')}
          />
        ) : null}
        <Button
          title="Scan"
          compact
          variant="secondary"
          icon={<ScanLine size={16} color="#14211C" />}
          onPress={() => setScannerOpen(true)}
        />
      </View>

      <SectionTitle
        title="Needs attention"
        subtitle={`${notifications.length} updates across your work`}
        action={
          <Pressable onPress={() => router.push('/notifications' as Href)}>
            <Text className="text-[12px] font-semibold text-jade-700">View all</Text>
          </Pressable>
        }
      />

      {notifications.length === 0 ? (
        <View className="flex-row items-center gap-3 rounded-card border border-dashed border-ink-200 bg-surface/70 p-4">
          <BellRing size={20} color="#718B7F" />
          <Text className="flex-1 text-[12px] leading-5 text-ink-500">
            Nothing needs your attention right now.
          </Text>
        </View>
      ) : (
        notifications.slice(0, 3).map((item) => (
          <Pressable
            key={item.id}
            onPress={() => router.push(item.href as Href)}
            className="flex-row items-start gap-3 rounded-2xl border border-ink-100 bg-surface p-4 active:opacity-70"
          >
            <View
              className={cn(
                'mt-0.5 h-2 w-2 rounded-full',
                item.tone === 'danger'
                  ? 'bg-coral-500'
                  : item.tone === 'warning'
                    ? 'bg-amber-500'
                    : item.tone === 'success'
                      ? 'bg-jade-500'
                      : 'bg-sky-500',
              )}
            />
            <View className="flex-1">
              <Text className="text-[13px] font-semibold text-ink-900">{item.title}</Text>
              <Text className="mt-0.5 text-[11px] text-ink-500">{item.message}</Text>
            </View>
          </Pressable>
        ))
      )}

      {recent.length > 0 ? (
        <View className="gap-2">
          <SectionTitle
            title="Recent shipments"
            action={
              <Pressable onPress={() => router.push('/shipments' as Href)}>
                <Text className="text-[12px] font-semibold text-jade-700">View all</Text>
              </Pressable>
            }
          />
          {recent.map((shipment) => (
            <ListRow
              key={shipment.id}
              title={shipment.shipmentNumber}
              subtitle={`${shipment.customer?.name ?? 'Customer'} · ${shipment.destination ?? 'Destination pending'}`}
              onPress={() =>
                router.push({ pathname: '/shipments/[id]', params: { id: shipment.id } })
              }
              right={
                <View className="items-end gap-1">
                  <StatusBadge status={shipment.status} />
                  <Text className="text-[10px] text-ink-400">{titleCase(shipment.status)}</Text>
                </View>
              }
            />
          ))}
        </View>
      ) : null}

      {can('purchase_orders', 'read') && (orders.data?.items ?? []).length > 0 ? (
        <View className="gap-2">
          <SectionTitle
            title="Recent orders"
            action={
              <Pressable onPress={() => router.push('/orders' as Href)}>
                <Text className="text-[12px] font-semibold text-jade-700">View all</Text>
              </Pressable>
            }
          />
          {(orders.data?.items ?? []).slice(0, 3).map((order) => (
            <ListRow
              key={order.id}
              title={order.orderNumber}
              subtitle={`${order.supplier?.name ?? 'Supplier'} · ${formatMoney(order.total, order.currency)}`}
              onPress={() =>
                router.push({ pathname: '/purchase-orders/[id]', params: { id: order.id } })
              }
              right={<StatusBadge status={order.status} />}
            />
          ))}
        </View>
      ) : null}

      <BarcodeScannerModal
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={(value) => {
          setScannerOpen(false);
          toast.success(`Scanned ${value}`);
        }}
      />
    </Screen>
  );
}
