import { ShieldX } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { Button } from '@/shared/components/Button';

export const AccessDenied = ({
  title = 'Access restricted',
  message = 'Your role does not have permission to view this area.',
  onBack,
}: {
  title?: string;
  message?: string;
  onBack?: () => void;
}) => (
  <View className="flex-1 items-center justify-center gap-4 bg-canvas px-8">
    <View className="h-16 w-16 items-center justify-center rounded-full bg-coral-50">
      <ShieldX size={30} color="#E11D48" />
    </View>
    <Text className="text-center text-[20px] font-bold text-ink-900">{title}</Text>
    <Text className="text-center text-[13px] leading-5 text-ink-500">{message}</Text>
    {onBack ? <Button title="Go back" variant="secondary" onPress={onBack} /> : null}
  </View>
);
