import { Pressable, TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';

export const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search',
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) => (
  <View className="flex-row items-center gap-2 rounded-xl border border-ink-100 bg-surface px-3.5">
    <Search size={18} color="#718B7F" />
    <TextInput
      className="flex-1 py-3 text-[15px] text-ink-900"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CB0A6"
      autoCorrect={false}
      returnKeyType="search"
      accessibilityRole="search"
      accessibilityLabel={placeholder}
    />
    {value ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Clear search"
        onPress={() => onChangeText('')}
        hitSlop={8}
        className="h-6 w-6 items-center justify-center rounded-full bg-ink-50"
      >
        <X size={14} color="#526C60" />
      </Pressable>
    ) : null}
  </View>
);
