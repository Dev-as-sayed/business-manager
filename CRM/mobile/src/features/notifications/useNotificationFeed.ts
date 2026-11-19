import { useMemo } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { usePermission } from '@/shared/hooks/usePermission';
import { useAppSelector } from '@/store/hooks';
import { selectLastReadAt } from '@/features/notifications/notifications.slice';
import { useListQuotationsQuery } from '@/features/quotations/quotations.api';
import { useListQcReportsQuery } from '@/features/quality-control/quality-control.api';
import { useListShipmentsQuery } from '@/features/shipments/shipments.api';
import { useListCustomsRecordsQuery } from '@/features/customs/customs.api';
import { formatDate } from '@/shared/utils/format';

export type NotificationTone = 'info' | 'success' | 'warning' | 'danger';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  href: string;
  tone: NotificationTone;
}

export const useNotificationFeed = () => {
  const { can } = usePermission();
  const lastReadAt = useAppSelector(selectLastReadAt);

  const quotations = useListQuotationsQuery(
    can('quotations', 'read') ? { status: 'SENT', limit: 10 } : skipToken,
  );
  const qcReports = useListQcReportsQuery(
    can('quality_control', 'read') ? { limit: 10 } : skipToken,
  );
  const shipments = useListShipmentsQuery(can('shipments', 'read') ? { limit: 10 } : skipToken);
  const customs = useListCustomsRecordsQuery(can('customs', 'read') ? { limit: 10 } : skipToken);

  const items = useMemo(() => {
    const feed: NotificationItem[] = [];

    for (const quotation of quotations.data?.items ?? []) {
      feed.push({
        id: `quotation-${quotation.id}`,
        title: 'Quotation awaiting approval',
        message: `${quotation.quotationNumber} for ${quotation.customer?.name ?? 'a customer'} is ready for review.`,
        date: quotation.sentAt ?? quotation.createdAt,
        href: `/quotations/${quotation.id}`,
        tone: 'warning',
      });
    }

    for (const report of qcReports.data?.items ?? []) {
      if (report.status !== 'PASSED' && report.status !== 'FAILED') continue;

      feed.push({
        id: `qc-${report.id}`,
        title: report.status === 'PASSED' ? 'QC inspection passed' : 'QC inspection failed',
        message: `${report.reportNumber} · ${report.purchaseOrder?.orderNumber ?? 'Purchase order'}`,
        date: report.completedAt ?? report.updatedAt,
        href: `/qc/${report.id}`,
        tone: report.status === 'PASSED' ? 'success' : 'danger',
      });
    }

    for (const shipment of shipments.data?.items ?? []) {
      if (!['PENDING', 'PREPARING', 'IN_TRANSIT'].includes(shipment.status)) continue;

      feed.push({
        id: `shipment-${shipment.id}`,
        title:
          shipment.status === 'IN_TRANSIT' ? 'Shipment in transit' : 'Shipment needs attention',
        message: `${shipment.shipmentNumber} · ${shipment.destination ?? 'Destination pending'}`,
        date: shipment.shippedAt ?? shipment.updatedAt,
        href: `/shipments/${shipment.id}`,
        tone: shipment.status === 'IN_TRANSIT' ? 'info' : 'warning',
      });
    }

    for (const record of customs.data?.items ?? []) {
      if (record.status !== 'HELD' && record.status !== 'IN_REVIEW') continue;

      feed.push({
        id: `customs-${record.id}`,
        title: record.status === 'HELD' ? 'Customs shipment held' : 'Customs review in progress',
        message: `${record.recordNumber} · ${record.customsOffice ?? 'Customs office'}`,
        date: record.updatedAt,
        href: `/customs/${record.id}`,
        tone: record.status === 'HELD' ? 'danger' : 'info',
      });
    }

    feed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return feed.map((item) => ({
      ...item,
      read: Boolean(lastReadAt && new Date(item.date) <= new Date(lastReadAt)),
      displayDate: formatDate(item.date),
    }));
  }, [
    customs.data?.items,
    lastReadAt,
    qcReports.data?.items,
    quotations.data?.items,
    shipments.data?.items,
  ]);

  const unreadCount = items.filter((item) => !item.read).length;

  return {
    items,
    unreadCount,
    isLoading:
      quotations.isLoading || qcReports.isLoading || shipments.isLoading || customs.isLoading,
  };
};
