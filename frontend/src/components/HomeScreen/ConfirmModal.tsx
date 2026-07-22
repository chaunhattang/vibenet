import { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

type ConfirmModalProps = {
  visible: boolean;
  icon: ReactNode;
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor?: string;
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
  confirmColor = '#EF4444',
  cancelLabel = 'Cancel',
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 bg-black/60 items-center justify-center p-6">
        <View className="w-full max-w-sm bg-white dark:bg-[#181825] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
          <View className="p-6 items-center">
            <View className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full items-center justify-center mb-4">
              {icon}
            </View>
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm text-center">
              {message}
            </Text>
          </View>
          <View className="flex-row border-t border-gray-200 dark:border-white/10">
            <Pressable onPress={onCancel} className="flex-1 py-4 items-center">
              <Text className="text-gray-600 dark:text-gray-400 font-medium">{cancelLabel}</Text>
            </Pressable>
            <View className="w-px bg-gray-200 dark:bg-white/10" />
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
