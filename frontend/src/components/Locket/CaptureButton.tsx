import { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { C } from '../../theme/colors';
import { PressableScale } from '../../theme/motion';

type CaptureButtonProps = {
  icon: ReactNode;
  label: string;
  loading?: boolean;
  onPress: () => void;
};

export default function CaptureButton({ icon, label, loading, onPress }: CaptureButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={loading}
      className="flex-row items-center gap-3 bg-paper-raised dark:bg-ink-raised border border-hairline-light dark:border-hairline-dark rounded-card px-5 py-4 disabled:opacity-50"
    >
      <View className="w-10 h-10 rounded-full bg-brand items-center justify-center">
        {loading ? <ActivityIndicator size="small" color={C.white} /> : icon}
      </View>
      <Text className="text-content-strong dark:text-content-strong-dark font-medium text-base flex-1">
        {label}
      </Text>
    </PressableScale>
  );
}
