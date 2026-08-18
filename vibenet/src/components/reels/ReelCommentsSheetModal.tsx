import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ReelCommentResponse, ReelResponse } from '../../services/api/types';
import * as reelsApi from '../../services/api/reels';
import { Colors, Radii, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { resolveMediaUrl } from '../../services/config';
import { onReelComment } from '../../services/websocket';

interface ReelCommentsSheetModalProps {
  visible: boolean;
  reel: ReelResponse | null;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ReelCommentsSheetModal: React.FC<ReelCommentsSheetModalProps> = ({
  visible,
  reel,
  onClose,
}) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<ReelCommentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (!visible || !reel) {
      setComments([]);
      return;
    }
    setIsLoading(true);
    reelsApi
      .getReelComments(reel.id, 0, 50)
      .then((page) => setComments(page.data))
      .catch(() => setComments([]))
      .finally(() => setIsLoading(false));
  }, [visible, reel]);

  // Live cross-device sync: append comments posted from this account's other
  // sessions (or by anyone else) while the sheet is open, deduping our own optimistic add.
  React.useEffect(() => {
    if (!visible || !reel) return;
    return onReelComment(reel.id, (event) => {
      setComments((prev) =>
        prev.some((c) => c.id === event.comment.id) ? prev : [event.comment, ...prev]
      );
    });
  }, [visible, reel]);

  const handleAddComment = async () => {
    if (!commentText.trim() || !user || !reel) return;
    const content = commentText.trim();
    setCommentText('');
    try {
      const created = await reelsApi.addReelComment(reel.id, content);
      setComments((prev) => [created, ...prev]);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to post comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!reel) return;
    const prev = comments;
    setComments((c) => c.filter((item) => item.id !== commentId));
    try {
      await reelsApi.deleteReelComment(reel.id, commentId);
    } catch (err) {
      setComments(prev);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete comment');
    }
  };

  if (!visible || !reel) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetContainer}>
          <View style={styles.header}>
            <View style={styles.dragHandle} />
            <Text style={styles.headerTitle}>Comments</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.commentsList}
            contentContainerStyle={styles.commentsListContent}
            showsVerticalScrollIndicator={false}>
            {comments.map((item, idx) => {
              const isMyComment = item.owner.id === user?.id;
              return (
                <Animated.View
                  key={item.id}
                  entering={FadeInUp.springify().damping(16).delay(Math.min(idx * 30, 200))}
                  style={styles.commentItem}>
                  <Image
                    source={{ uri: resolveMediaUrl(item.owner.avatarUrl) }}
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentBody}>
                    <View style={styles.commentUserRow}>
                      <Text style={styles.commentUsername}>{item.owner.username}</Text>
                      <Text style={styles.commentTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <Text style={styles.commentText}>{item.content}</Text>
                    {isMyComment && (
                      <TouchableOpacity onPress={() => handleDeleteComment(item.id)} style={styles.deleteAction}>
                        <Text style={styles.deleteText}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Animated.View>
              );
            })}

            {!isLoading && comments.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No comments yet.</Text>
                <Text style={styles.emptySubtext}>Start the conversation! ✨</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <Image
              source={{ uri: resolveMediaUrl(user?.profileResponse?.avatarUrl) }}
              style={styles.myInputAvatar}
            />
            <TextInput
              placeholder={`Add a comment for @${reel.creator.username}...`}
              placeholderTextColor={Colors.textPlaceholder}
              value={commentText}
              onChangeText={setCommentText}
              style={styles.textInput}
            />
            {commentText.trim().length > 0 && (
              <TouchableOpacity onPress={handleAddComment} style={styles.sendButton}>
                <Text style={styles.sendButtonText}>Post</Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropTouch: { flex: 1 },
  sheetContainer: {
    backgroundColor: Colors.surfaceWhite,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    maxHeight: SCREEN_HEIGHT * 0.75,
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  header: {
    position: 'relative',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginBottom: Spacing.two,
  },
  headerTitle: { ...Typography.bodyMedium, fontWeight: '700', color: Colors.textPrimary },
  closeBtn: { position: 'absolute', right: Spacing.four, top: Spacing.three, padding: 2 },
  commentsList: { flex: 1 },
  commentsListContent: { padding: Spacing.four, gap: Spacing.four },
  commentItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceMuted },
  commentBody: { flex: 1 },
  commentUserRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  commentUsername: { ...Typography.bodySmall, fontWeight: '700', color: Colors.textPrimary },
  commentTime: { ...Typography.caption, fontSize: 10, color: Colors.textTertiary },
  commentText: { ...Typography.bodySmall, fontSize: 13, color: Colors.textPrimary, lineHeight: 18 },
  deleteAction: { marginTop: 4, paddingVertical: 2 },
  deleteText: { ...Typography.caption, fontSize: 11, fontWeight: '600', color: Colors.statusLive },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.eight },
  emptyText: { ...Typography.bodyMedium, fontWeight: '600', color: Colors.textPrimary },
  emptySubtext: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    gap: Spacing.three,
  },
  myInputAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceMuted },
  textInput: {
    flex: 1,
    height: 40,
    borderRadius: Radii.pill,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: Spacing.four,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  sendButton: { paddingHorizontal: Spacing.two },
  sendButtonText: { ...Typography.bodySmall, color: Colors.accentBlue, fontWeight: '700' },
});
