import type { PropsWithChildren } from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@/shared/utils/cn';

export const Card = ({ children, className, style, ...rest }: PropsWithChildren<ViewProps>) => (
  <View
    className={cn('rounded-card border border-ink-100/70 bg-surface p-4', className)}
    style={[
      {
        shadowColor: '#14211C',
        shadowOpacity: 0.05,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      },
      style,
    ]}
    {...rest}
  >
    {children}
  </View>
);
