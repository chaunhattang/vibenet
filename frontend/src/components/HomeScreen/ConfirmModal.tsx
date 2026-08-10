import { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { C } from '../../theme/colors';

type ConfirmModalProps = {
  visible: boolean;
  icon: ReactNode;
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor?: string;
  // Icon-circle tint: 'danger' for destructive actions (delete/logout), 'neutral' for
  // everything else (e.g. cancelling a pending request) — was hardcoded red always.
  tone?: 'danger' | 'neutral';
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({
  visible,
  icon,
  title,
  message,
  confirmLabel,
  confirmColor = C.danger,
  tone = 'danger',
  cancelLabel = 'Cancel',
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 bg-black/60 items-center justify-center p-6">
        <View className="w-full max-w-sm bg-paper-base dark:bg-ink-overlay rounded-card overflow-hidden border border-hairline-light dark:border-hairline-dark">
          <View className="p-6 items-center">
            <View
              className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
                tone === 'danger' ? 'bg-danger/10' : 'bg-brand/10'
              }`}
            >
              {icon}
            </View>
            <Text className="text-headline text-content-strong dark:text-content-strong-dark mb-2">
              {title}
            </Text>
            <Text className="text-content-muted dark:text-content-muted-dark text-sm text-center">
              {message}
            </Text>
          </View>
          <View className="flex-row border-t border-hairline-light dark:border-hairline-dark">
            <Pressable onPress={onCancel} className="flex-1 py-4 items-center">
              <Text className="text-content-muted dark:text-content-muted-dark font-medium">
                {cancelLabel}
              </Text>
            </Pressable>
            <View className="w-px bg-hairline-light dark:bg-hairline-dark" />
            <Pressable onPress={onConfirm} className="flex-1 py-4 items-center">
              <Text style={{ color: confirmColor }} className="font-medium">
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
