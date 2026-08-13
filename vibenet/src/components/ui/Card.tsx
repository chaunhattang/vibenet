import { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

type CardProps = ViewProps & {
  children: ReactNode;
  variant?: 'card' | 'hero';
  className?: string;
};

// Standardized surface: content lists/rows use `card` radius, media/hero cards & sheets
// use `hero` radius. See UI_REDESIGN_PLAN.md §2.4.
export default function Card({ children, variant = 'card', className = '', ...props }: CardProps) {
  const radius = variant === 'hero' ? 'rounded-hero' : 'rounded-card';
  return (
    <View
      {...props}
      className={`bg-paper-raised dark:bg-ink-raised border border-hairline-light dark:border-hairline-dark ${radius} ${className}`}
    >
      {children}
    </View>
  );
}
