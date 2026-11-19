import { useRef } from 'react';
import { Pressable, Text } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { Check, ChevronDown, SlidersHorizontal } from 'lucide-react-native';
import { cn } from '@/shared/utils/cn';

interface FilterOption<T extends string> {
  label: string;
  value: T;
}

export const FilterChips = <T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: FilterOption<T>[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  className?: string;
}) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const selected = options.find((option) => option.value === value);

  const choose = (next: T | undefined) => {
    onChange(next);
    sheetRef.current?.dismiss();
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Filter by status: ${selected?.label ?? 'All'}`}
        onPress={() => sheetRef.current?.present()}
        className={cn(
          'flex-row items-center gap-2 self-start rounded-full border px-3.5 py-2',
          value === undefined ? 'border-ink-100 bg-surface' : 'border-jade-600 bg-jade-50',
          className,
        )}
      >
        <SlidersHorizontal size={14} color={value === undefined ? '#3D564B' : '#047857'} />
        <Text
          className={cn(
            'text-[12px] font-semibold',
            value === undefined ? 'text-ink-600' : 'text-jade-700',
          )}
        >
          {selected?.label ?? 'All statuses'}
        </Text>
        <ChevronDown size={14} color={value === undefined ? '#3D564B' : '#047857'} />
      </Pressable>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['42%']}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#FFFFFF' }}
        handleIndicatorStyle={{ backgroundColor: '#C2CFC8' }}
      >
        <BottomSheetView className="flex-1 px-5 pb-8">
          <Text className="pb-3 text-[18px] font-bold tracking-tight text-ink-900">
            Filter by status
          </Text>
          <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: value === undefined }}
              onPress={() => choose(undefined)}
              className="flex-row items-center justify-between border-b border-ink-50 py-3.5"
            >
              <Text className="text-[15px] font-semibold text-ink-800">All statuses</Text>
              {value === undefined ? <Check size={18} color="#047857" /> : null}
            </Pressable>
            {options.map((option) => {
              const isSelected = value === option.value;

              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => choose(option.value)}
                  className="flex-row items-center justify-between border-b border-ink-50 py-3.5"
                >
                  <Text className="text-[15px] font-semibold text-ink-800">{option.label}</Text>
                  {isSelected ? <Check size={18} color="#047857" /> : null}
                </Pressable>
              );
            })}
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};
