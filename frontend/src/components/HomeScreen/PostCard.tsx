import { useState } from 'react';
import { Animated, Image, Pressable, Text, TextInput, View } from 'react-native';
import { CURRENT_USER_AVATAR } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { mockComments } from '../../data/mockData';
import { useGoToProfile } from '../../hooks/useGoToProfile';
import { C } from '../../theme/colors';
import { usePop } from '../../theme/motion';
import { CommentData, PostData } from '../../types';
import Avatar from '../ui/Avatar';
import GradientButton from '../ui/GradientButton';
import ConfirmModal from '../HomeScreen/ConfirmModal';
import {
  CommentIcon,
  EditIcon,
  HeartIcon,
  MusicIcon,
  PlayIcon,
  ShareIcon,
  TrashIcon,
} from '../../assets/Icon';
import PostDetailModal from './PostDetailModal';

type PostCardProps = {
  post: PostData;
  onDelete?: (id: string) => void;
};

export default function PostCard({ post, onDelete }: PostCardProps) {
  const { currentUser } = useAuth();
  const goToProfile = useGoToProfile();
  const isOwner = post.ownerId === currentUser?.userId;

  const [liked, setLiked] = useState(false);
  const likeCount = post.likes + (liked ? 1 : 0);
  const { scale: heartScale, pop } = usePop();

  const [displayContent, setDisplayContent] = useState(post.content);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  // Sau này có be thì: bỏ mockComments, gọi getCommentsByPostId(post.id) khi mở showDetail
  const [comments, setComments] = useState<CommentData[]>(
    mockComments[post.id] ?? [],
  );

  const handleStartEdit = () => {
    setEditContent(displayContent);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditContent(displayContent);
    setIsEditing(false);
  };

  // Sau này có be thì: await updatePost(post.id, editContent) rồi mới setDisplayContent bằng data trả về
  const handleSaveEdit = () => {
    setDisplayContent(editContent.trim());
    setIsEditing(false);
  };

  // Sau này có be thì: await addComment(post.id, content, parentId) rồi setComments bằng comment server trả về
  const handleAddComment = (content: string, parentId?: string) => {
    setComments(prev => [
      {
        id: `c-${Date.now()}`,
        author: currentUser?.fullName ?? 'You',
        userId: currentUser?.userId ?? '',
        avatar: currentUser?.avatar ?? CURRENT_USER_AVATAR,
        content,
        timestamp: 'JUST NOW',
        parentId,
      },
      ...prev,
    ]);
  };

  const handleToggleLike = () => {
    setLiked(v => {
      const next = !v;
      if (next) pop();
      return next;
    });
  };

  return (
    <View className="mx-5 bg-paper-base dark:bg-ink-raised rounded-hero p-4 border border-hairline-light dark:border-hairline-dark shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <Pressable onPress={() => post.ownerId && goToProfile(post.ownerId)}>
            <Avatar uri={post.avatar} size={44} shape="squircle" />
          </Pressable>
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-sm font-semibold text-content-strong dark:text-content-strong-dark">
                {post.author}
              </Text>
              {post.isNew && (
                <View className="bg-spark px-1.5 py-0.5 rounded">
                  <Text className="text-[9px] font-bold text-ink-base">NEW</Text>
                </View>
              )}
            </View>
            <Text className="text-xs text-content-muted dark:text-content-muted-dark">
              {post.handle} · {post.timestamp}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2 ml-2">
          {post.timeLeft && (
            <View className="bg-danger/15 px-2 py-1 rounded-md">
              <Text className="text-danger font-bold text-[10px]">{post.timeLeft}</Text>
            </View>
          )}
          {isOwner && !isEditing && (
            <>
              <Pressable onPress={handleStartEdit} hitSlop={8}>
                <EditIcon size={16} />
              </Pressable>
              <Pressable onPress={() => setShowDeleteConfirm(true)} hitSlop={8}>
                <TrashIcon size={16} />
              </Pressable>
            </>
          )}
        </View>
      </View>

      {isEditing ? (
        <View className="mt-3" style={{ gap: 8 }}>
          <TextInput
            value={editContent}
            onChangeText={setEditContent}
            multiline
            textBreakStrategy="simple"
            className="bg-paper-raised dark:bg-black/20 rounded-field p-3 text-[15px] text-content-strong dark:text-content-strong-dark"
          />
          <View className="flex-row justify-end gap-2">
            <Pressable onPress={handleCancelEdit} className="px-4 py-2">
              <Text className="text-sm font-semibold text-content-muted dark:text-content-muted-dark">
                Cancel
              </Text>
            </Pressable>
            <GradientButton onPress={handleSaveEdit} label="Save" />
          </View>
        </View>
      ) : (
        !!displayContent && (
          <Text className="text-[15px] text-content-strong dark:text-content-strong-dark leading-relaxed mt-3">
            {displayContent}
          </Text>
        )
      )}

      {post.media && post.mediaType === 'image' && (
        <View className="mt-3 rounded-card overflow-hidden bg-paper-raised dark:bg-black/20">
          <Image
            source={{ uri: post.media }}
            className="w-full h-56"
            resizeMode="cover"
          />
        </View>
      )}

      {post.media && post.mediaType === 'video' && (
        <View className="mt-3 rounded-card overflow-hidden bg-black h-56 items-center justify-center">
          <Image
            source={{ uri: post.media }}
            className="w-full h-full absolute opacity-70"
            resizeMode="cover"
          />
          <View className="w-14 h-14 rounded-full bg-black/50 items-center justify-center">
            <PlayIcon />
          </View>
        </View>
      )}

      {post.mediaType === 'audio' && (
        <View className="mt-3 flex-row items-center gap-3 bg-paper-raised dark:bg-black/20 rounded-card p-4">
          <View className="w-10 h-10 bg-brand/20 rounded-full items-center justify-center">
            <MusicIcon />
          </View>
          <View className="flex-1 h-1 bg-hairline-light dark:bg-white/10 rounded-full overflow-hidden">
            <View className="w-1/3 h-full bg-brand" />
          </View>
          <Text className="text-xs font-mono text-content-faint dark:text-content-faint-dark">
            0:14 / 1:30
          </Text>
        </View>
      )}

      <View className="flex-row items-center gap-5 mt-4 pt-3 border-t border-hairline-light dark:border-hairline-dark">
        {/* Sau này có be thì: gọi toggleReaction(post.id, 'LOVE') trong onPress, giống handleReact bên web */}
        <Pressable onPress={handleToggleLike} hitSlop={8} className="flex-row items-center gap-1.5">
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <HeartIcon size={18} color={liked ? C.accent : C.contentFaint} filled={liked} />
          </Animated.View>
          <Text className="text-xs text-content-muted dark:text-content-muted-dark">
            {likeCount}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setShowDetail(true)}
          hitSlop={8}
          className="flex-row items-center gap-1.5"
        >
          <CommentIcon size={18} />
          <Text className="text-xs text-content-muted dark:text-content-muted-dark">
            {comments.length}
          </Text>
        </Pressable>
        <Pressable hitSlop={8} className="flex-row items-center gap-1.5">
          <ShareIcon size={18} />
        </Pressable>
      </View>

      <ConfirmModal
        visible={showDeleteConfirm}
        icon={<TrashIcon size={28} color={C.danger} />}
        title="Delete Whisper"
        message="Are you sure you want to let this thought fade away? This action cannot be undone."
        confirmLabel="Delete"
        confirmColor={C.danger}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDelete?.(post.id);
        }}
      />

      <PostDetailModal
        visible={showDetail}
        post={{ ...post, content: displayContent }}
        comments={comments}
        onClose={() => setShowDetail(false)}
        onAddComment={handleAddComment}
      />
    </View>
  );
}
