import { ReactNode } from 'react';
import { Text, View } from 'react-native';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
};

// Shared empty state — replaces 5 inconsistent ad-hoc versions (dashed cards with/without
// icons, bare text) across Newsfeed/Profile/Messages/ChatDetail/MomentViewers/Locket.
export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View className="mx-5 items-center py-16 px-8 bg-paper-raised/50 dark:bg-ink-raised/50 rounded-hero border border-dashed border-hairline-light dark:border-hairline-dark">
      <View className="w-16 h-16 rounded-full bg-brand/10 items-center justify-center mb-3">
        {icon}
      </View>
      <Text className="text-headline text-content-strong dark:text-content-strong-dark text-center">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-sm text-content-muted dark:text-content-muted-dark mt-1 text-center">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
