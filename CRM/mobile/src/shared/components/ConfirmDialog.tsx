import { Modal, Pressable, Text, View } from 'react-native';
import { Button } from '@/shared/components/Button';

export const ConfirmDialog = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <Pressable onPress={onCancel} className="flex-1 justify-center bg-ink-900/40 px-6">
      <Pressable
        onPress={(event) => event.stopPropagation()}
        className="rounded-card bg-surface p-5"
      >
        <Text className="text-[18px] font-bold text-ink-900">{title}</Text>
        {message ? (
          <Text className="mt-2 text-[13px] leading-5 text-ink-500">{message}</Text>
        ) : null}
        <View className="mt-5 flex-row justify-end gap-2">
          <Button title={cancelLabel} variant="secondary" compact onPress={onCancel} />
          <Button
            title={confirmLabel}
            variant={destructive ? 'danger' : 'primary'}
            compact
            loading={loading}
            onPress={onConfirm}
          />
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);
