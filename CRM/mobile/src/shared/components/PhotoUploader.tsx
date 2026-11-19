import { Alert, Image, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera, ImagePlus, X } from 'lucide-react-native';
import type { LocalFile } from '@/features/attachments/attachments.types';
import { cn } from '@/shared/utils/cn';

const mapAsset = async (asset: ImagePicker.ImagePickerAsset): Promise<LocalFile> => {
  if (!asset.mimeType?.startsWith('image/')) {
    return {
      uri: asset.uri,
      name: asset.fileName ?? `photo-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
      size: asset.fileSize,
    };
  }

  const compressed = await ImageManipulator.manipulateAsync(
    asset.uri,
    asset.width > 1600 ? [{ resize: { width: 1600 } }] : [],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
  );

  return {
    uri: compressed.uri,
    name: (asset.fileName ?? `photo-${Date.now()}`).replace(/\.[^.]+$/, '.jpg'),
    mimeType: 'image/jpeg',
    size: undefined,
  };
};

export const PhotoUploader = ({
  files,
  onChange,
  maxFiles = 5,
  className,
}: {
  files: LocalFile[];
  onChange: (files: LocalFile[]) => void;
  maxFiles?: number;
  className?: string;
}) => {
  const remaining = Math.max(0, maxFiles - files.length);

  const pickFromLibrary = async () => {
    if (remaining === 0) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.7,
    });

    if (!result.canceled) {
      const mapped = await Promise.all(result.assets.map(mapAsset));
      onChange([...files, ...mapped].slice(0, maxFiles));
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Enable camera access in settings to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });

    if (!result.canceled && result.assets[0]) {
      const mapped = await mapAsset(result.assets[0]);
      onChange([...files, mapped].slice(0, maxFiles));
    }
  };

  const remove = (index: number) => {
    onChange(files.filter((_, fileIndex) => fileIndex !== index));
  };

  return (
    <View className={cn('gap-3', className)}>
      <View className="flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose photo from library"
          onPress={pickFromLibrary}
          disabled={remaining === 0}
          className={cn(
            'flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-ink-200 bg-surface px-3 py-3',
            remaining === 0 && 'opacity-40',
          )}
        >
          <ImagePlus size={18} color="#047857" />
          <Text className="text-[13px] font-semibold text-ink-700">Library</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Take a photo"
          onPress={takePhoto}
          disabled={remaining === 0}
          className={cn(
            'flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-ink-200 bg-surface px-3 py-3',
            remaining === 0 && 'opacity-40',
          )}
        >
          <Camera size={18} color="#047857" />
          <Text className="text-[13px] font-semibold text-ink-700">Camera</Text>
        </Pressable>
      </View>

      {files.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {files.map((file, index) => (
            <View key={`${file.uri}-${index}`} className="relative">
              <Image source={{ uri: file.uri }} className="h-20 w-20 rounded-xl bg-ink-50" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
                onPress={() => remove(index)}
                hitSlop={8}
                className="absolute -right-1.5 -top-1.5 h-6 w-6 items-center justify-center rounded-full border border-white bg-ink-900"
              >
                <X size={12} color="#FFFFFF" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};
