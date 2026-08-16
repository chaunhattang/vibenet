import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { PostResponse } from '../../services/api/types';
import * as postsApi from '../../services/api/posts';
import { Colors, Radii, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

interface PostOptionsModalProps {
  visible: boolean;
  post: PostResponse | null;
  onClose: () => void;
  onDeletePost?: (postId: string) => void;
  onEditCaption?: (post: PostResponse) => void;
  onToggleSave?: (postId: string, isSaved: boolean) => void;
}

export const PostOptionsModal: React.FC<PostOptionsModalProps> = ({
  visible,
  post,
  onClose,
  onDeletePost,
  onEditCaption,
  onToggleSave,
}) => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  if (!visible || !post) return null;

  const isMyPost = user?.id === post.owner.id;

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await postsApi.deletePost(post.id);
              onDeletePost?.(post.id);
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete post');
            } finally {
              onClose();
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const { isSaved } = await postsApi.toggleSavePost(post.id);
      onToggleSave?.(post.id, isSaved);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}>
        <View style={styles.sheetContainer}>
          <View style={styles.dragHandle} />

          {/* Quick Actions Grid */}
          <View style={styles.quickGrid}>
            <TouchableOpacity activeOpacity={0.7} onPress={handleSave} style={styles.quickItem}>
              <View style={styles.quickIconCircle}>
                <Ionicons
                  name={post.saved ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={Colors.textPrimary}
                />
              </View>
              <Text style={styles.quickLabel}>{post.saved ? 'Saved' : 'Save'}</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} style={styles.quickItem}>
              <View style={styles.quickIconCircle}>
                <Feather name="link" size={19} color={Colors.textPrimary} />
              </View>
              <Text style={styles.quickLabel}>Copy Link</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} style={styles.quickItem}>
              <View style={styles.quickIconCircle}>
                <Feather name="share" size={19} color={Colors.textPrimary} />
              </View>
              <Text style={styles.quickLabel}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Items List */}
          <View style={styles.menuList}>
            {isMyPost ? (
              <>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onEditCaption?.(post);
                  }}
                  style={styles.menuRow}>
                  <Feather name="edit-2" size={18} color={Colors.textPrimary} />
                  <Text style={styles.menuRowText}>Edit Caption</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleDelete}
                  style={styles.menuRow}>
                  <Ionicons name="trash-outline" size={19} color={Colors.statusLive} />
                  <Text style={[styles.menuRowText, styles.destructiveText]}>
                    Delete Post
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.menuRow}>
                  <Feather name="eye-off" size={18} color={Colors.textPrimary} />
                  <Text style={styles.menuRowText}>Not Interested</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.menuRow}>
                  <Ionicons name="flag-outline" size={19} color={Colors.statusLive} />
                  <Text style={[styles.menuRowText, styles.destructiveText]}>
                    Report
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.eight,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: Spacing.four,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  quickItem: {
    alignItems: 'center',
    gap: 6,
  },
  quickIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  menuList: {
    marginTop: Spacing.two,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three + 2,
  },
  menuRowText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  destructiveText: {
    color: Colors.statusLive,
  },
});
