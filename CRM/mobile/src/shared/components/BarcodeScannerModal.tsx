import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X } from 'lucide-react-native';

export const BarcodeScannerModal = ({
  visible,
  onClose,
  onScan,
}: {
  visible: boolean;
  onClose: () => void;
  onScan: (value: string) => void;
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (visible) {
      if (!permission?.granted) {
        void requestPermission();
      }
    }
  }, [permission?.granted, requestPermission, visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      onShow={() => setLocked(false)}
    >
      <View className="flex-1 bg-ink-900">
        {permission?.granted ? (
          <CameraView
            className="flex-1"
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128'] }}
            onBarcodeScanned={
              locked
                ? undefined
                : ({ data }) => {
                    setLocked(true);
                    onScan(data);
                  }
            }
          />
        ) : (
          <View className="flex-1 items-center justify-center gap-3 px-8">
            <ActivityIndicator color="#34D399" />
            <Text className="text-center text-[13px] text-white/80">
              Allow camera access to scan barcodes.
            </Text>
          </View>
        )}

        <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
          <View className="h-56 w-72 rounded-3xl border-2 border-jade-400" />
          <Text className="mt-4 text-[13px] font-medium text-white/80">
            Align a barcode inside the frame
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close scanner"
          hitSlop={10}
          onPress={onClose}
          className="absolute right-5 top-14 h-11 w-11 items-center justify-center rounded-full bg-black/40"
        >
          <X size={22} color="#FFFFFF" />
        </Pressable>
      </View>
    </Modal>
  );
};
