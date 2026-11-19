import { useState } from 'react';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import {
  useCreateQcReportMutation,
  useUpdateQcReportStatusMutation,
} from '@/features/quality-control/quality-control.api';
import { PurchaseOrderPicker } from '@/features/quality-control/components/PurchaseOrderPicker';
import {
  QC_CHECKLIST_ITEMS,
  type QcChecklist,
  type QcChecklistKey,
} from '@/features/quality-control/quality-control.types';
import type { PurchaseOrder } from '@/features/purchase-orders/purchase-orders.types';
import { enqueueUpload } from '@/features/attachments/uploadQueue.slice';
import type { LocalFile } from '@/features/attachments/attachments.types';
import { usePermission } from '@/shared/hooks/usePermission';
import { useAppDispatch } from '@/store/hooks';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { PageHeader, Screen } from '@/shared/components/Screen';
import { Button } from '@/shared/components/Button';
import { TextField } from '@/shared/components/TextField';
import { PhotoUploader } from '@/shared/components/PhotoUploader';
import { cn } from '@/shared/utils/cn';

const initialChecklist: QcChecklist = {
  quantity: true,
  packaging: true,
  materials: true,
  dimensions: true,
  defects: true,
};

export default function NewQcReportScreen() {
  const { can } = usePermission();
  const dispatch = useAppDispatch();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [orderError, setOrderError] = useState<string>();
  const [checklist, setChecklist] = useState<QcChecklist>(initialChecklist);
  const [defects, setDefects] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<LocalFile[]>([]);
  const [createReport, { isLoading: creating }] = useCreateQcReportMutation();
  const [updateStatus] = useUpdateQcReportStatusMutation();

  if (!can('quality_control', 'create')) {
    return <AccessDenied onBack={() => router.back()} />;
  }

  const toggle = (key: QcChecklistKey) => {
    setChecklist((current) => ({ ...current, [key]: !current[key] }));
  };

  const allPassed = QC_CHECKLIST_ITEMS.every((item) => checklist[item.key]);
  const hasDefects = defects.trim().length > 0;
  const passed = allPassed && !hasDefects;

  const submit = async () => {
    if (!order) {
      setOrderError('Select the purchase order being inspected');
      return;
    }

    setOrderError(undefined);

    const checklistNotes = QC_CHECKLIST_ITEMS.map(
      (item) => `${checklist[item.key] ? '✓' : '✗'} ${item.label}`,
    ).join('\n');

    const summary = [
      'Checklist:',
      checklistNotes,
      defects.trim() ? `\nDefects:\n${defects.trim()}` : '',
      notes.trim() ? `\nNotes:\n${notes.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const report = await createReport({
        purchaseOrderId: order.id,
        inspectionDate: new Date().toISOString(),
        notes: summary,
      }).unwrap();

      await updateStatus({ id: report.id, status: 'IN_PROGRESS' });
      await updateStatus({ id: report.id, status: passed ? 'PASSED' : 'FAILED' });

      photos.forEach((file) =>
        dispatch(enqueueUpload({ file, entityType: 'qc_report', entityId: report.id })),
      );

      router.replace({ pathname: '/qc/[id]', params: { id: report.id } });
    } catch {
      return;
    }
  };

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={<Button title="Submit inspection" loading={creating} onPress={() => void submit()} />}
    >
      <PageHeader
        title="New inspection"
        subtitle="Record the checklist, defects, and factory photos."
        back={() => router.back()}
      />

      <PurchaseOrderPicker
        value={order?.id}
        onChange={(selected) => {
          setOrder(selected);
          setOrderError(undefined);
        }}
        error={orderError}
      />

      <View className="gap-2">
        <Text className="text-[15px] font-bold text-ink-900">Checklist</Text>
        <View className="overflow-hidden rounded-card border border-ink-100 bg-surface">
          {QC_CHECKLIST_ITEMS.map((item, index) => {
            const checked = checklist[item.key];

            return (
              <Pressable
                key={item.key}
                onPress={() => toggle(item.key)}
                className={cn(
                  'flex-row items-center gap-3 p-4',
                  index < QC_CHECKLIST_ITEMS.length - 1 && 'border-b border-ink-100',
                )}
              >
                <View
                  className={cn(
                    'h-6 w-6 items-center justify-center rounded-lg border',
                    checked ? 'border-jade-600 bg-jade-600' : 'border-ink-200 bg-surface',
                  )}
                >
                  {checked ? <Check size={14} color="#FFFFFF" /> : null}
                </View>
                <Text className="flex-1 text-[13px] leading-5 text-ink-700">{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <TextField
        label="Defects"
        placeholder="Describe any defects found, or leave blank when none"
        value={defects}
        onChangeText={setDefects}
        multiline
      />

      <TextField
        label="Additional notes"
        placeholder="Measurements, packaging notes, next steps"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <View className="gap-2">
        <Text className="text-[15px] font-bold text-ink-900">Photos</Text>
        <PhotoUploader files={photos} onChange={setPhotos} maxFiles={8} />
      </View>

      <View
        className={cn(
          'rounded-card border p-4',
          passed ? 'border-jade-200 bg-jade-50' : 'border-amber-200 bg-amber-50',
        )}
      >
        <Text
          className={cn('text-[13px] font-semibold', passed ? 'text-jade-800' : 'text-amber-800')}
        >
          {passed
            ? 'This inspection will be marked passed.'
            : 'This inspection will be marked failed.'}
        </Text>
        <Text
          className={cn('mt-1 text-[12px] leading-5', passed ? 'text-jade-700' : 'text-amber-700')}
        >
          {passed
            ? 'All checklist items pass and no defects were recorded.'
            : 'A failed checklist item or a defect note requires follow-up.'}
        </Text>
      </View>
    </Screen>
  );
}
