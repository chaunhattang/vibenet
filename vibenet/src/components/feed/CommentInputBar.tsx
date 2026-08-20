import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { CommentResponse } from '../../services/api/types';
import { resolveMediaUrl } from '../../services/config';
import { Colors, Radii, Spacing } from '../../constants/theme';

interface CommentInputBarProps {
  avatarUrl?: string | null;
  authorUsername: string;
  value: string;
  onChangeText: (text: string) => void;
  replyingTo: CommentResponse | null;
  onCancelReply: () => void;
  onSubmit: () => void;
  style?: StyleProp<ViewStyle>;
}

export const CommentInputBar: React.FC<CommentInputBarProps> = ({
  avatarUrl,
  authorUsername,
  value,
  onChangeText,
  replyingTo,
  onCancelReply,
  onSubmit,
  style,
}) => (
  <View style={[styles.inputContainer, style]}>
    <Image source={{ uri: resolveMediaUrl(avatarUrl) }} style={styles.myInputAvatar} />
    <TextInput
      placeholder={replyingTo ? `Replying to @${replyingTo.owner.username}...` : `Add a comment for @${authorUsername}...`}
      placeholderTextColor={Colors.textPlaceholder}
      value={value}
      onChangeText={onChangeText}
      style={styles.textInput}
    />
    {replyingTo ? (
      <TouchableOpacity onPress={onCancelReply} style={styles.cancelReplyBtn}>
        <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
    ) : null}
    {value.trim().length > 0 ? (
      <TouchableOpacity onPress={onSubmit} style={styles.sendButton}>
        <Text style={styles.sendButtonText}>Post</Text>
      </TouchableOpacity>
    ) : (
      <View style={styles.quickEmojiRow}>
        {['❤️', '🔥', '👏'].map((emoji) => (
          <TouchableOpacity key={emoji} onPress={() => onChangeText(value + emoji)} style={styles.quickEmoji}>
            <Text style={styles.quickEmojiText}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
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
  myInputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceMuted,
  },
  textInput: {
    flex: 1,
    height: 40,
    borderRadius: Radii.pill,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: Spacing.four,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  cancelReplyBtn: {
    padding: 2,
  },
  sendButton: {
    paddingHorizontal: Spacing.two,
  },
  sendButtonText: {
    fontWeight: '700',
    fontSize: 13,
    color: Colors.accentBlue,
  },
  quickEmojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickEmoji: {
    padding: 2,
  },
  quickEmojiText: {
    fontSize: 18,
  },
});
