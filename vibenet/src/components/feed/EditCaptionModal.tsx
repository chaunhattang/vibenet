import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { PostResponse } from '../../services/api/types';
import * as postsApi from '../../services/api/posts';
import { Colors, Radii, Spacing, Typography } from '../../constants/theme';

interface EditCaptionModalProps {
  visible: boolean;
  post: PostResponse | null;
  onClose: () => void;
  onSaved: (updatedPost: PostResponse) => void;
}

export const EditCaptionModal: React.FC<EditCaptionModalProps> = ({
  visible,
  post,
  onClose,
  onSaved,
}) => {
  const [caption, setCaption] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible && post) {
      setCaption(post.textContent ?? '');
    }
  }, [visible, post]);

  if (!visible || !post) return null;

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const updated = await postsApi.updatePost(post.id, caption.trim());
      onSaved(updated);
      onClose();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update caption');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Edit Caption</Text>
            <TouchableOpacity onPress={handleSave} activeOpacity={0.7} disabled={isSaving}>
              <Text style={[styles.saveText, isSaving && styles.saveTextDisabled]}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Write a caption..."
            placeholderTextColor={Colors.textPlaceholder}
            multiline
            autoFocus
            style={styles.input}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.eight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: Spacing.three,
  },
  title: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cancelText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  saveText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.accentBlue,
  },
  saveTextDisabled: {
    opacity: 0.5,
  },
  input: {
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#F7F8FA',
    borderRadius: Radii.md,
    padding: Spacing.three,
  },
});
