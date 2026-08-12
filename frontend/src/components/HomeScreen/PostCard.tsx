import { useEffect, useState } from 'react';
import {
  Animated,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { resolveMediaUrl } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { usePosts } from '../../contexts/PostsContext';
import { useSaved } from '../../contexts/SavedContext';
import { useLiked } from '../../contexts/LikedContext';
import { useGoToProfile } from '../../hooks/useGoToProfile';
import { formatRelativeTime } from '../../utils/time';
import { C } from '../../theme/colors';
import { usePop } from '../../theme/motion';
import { Post } from '../../types';
import Avatar from '../ui/Avatar';
import GradientButton from '../ui/GradientButton';
import ConfirmModal from './ConfirmModal';
import PostDetailModal from './PostDetailModal';
import {
  BookmarkIcon,
  CheckIcon,
  CommentIcon,
  EditIcon,
  FlameIcon,
  HeartIcon,
  MoreVerticalIcon,
  ShareIcon,
  TrashIcon,
} from '../../assets/Icon';

type PostCardProps = {
  post: Post;
  editable?: boolean;
};

function renderOverlayCaption(text: string) {
  return text.split(/(\s+)/).map((chunk, i) =>
    chunk.startsWith('#') ? (
      <Text key={i} style={{ color: '#FFFFFF', fontWeight: '700', opacity: 0.95 }}>
        {chunk}
      </Text>
    ) : (
      <Text key={i}>{chunk}</Text>
    ),
  );
}

function renderCaption(text: string) {
  return text.split(/(\s+)/).map((chunk, i) =>
    chunk.startsWith('#') ? (
      <Text key={i} style={{ color: C.accentBlue, fontWeight: '600' }}>
        {chunk}
      </Text>
    ) : (
      <Text key={i}>{chunk}</Text>
    ),
  );
}

export default function PostCard({ post, editable = true }: PostCardProps) {
  const { currentUser } = useAuth();
  const { react, deletePost, updatePost } = usePosts();
  const { isSaved, toggleSave } = useSaved();
  const { setLikedEntry } = useLiked();
  const goToProfile = useGoToProfile();
  const saved = isSaved(post.id);

  useEffect(() => {
    setLikedEntry(post, post.currentReaction !== null);
  }, [post, post.currentReaction, setLikedEntry]);

  const isOwner = editable && post.owner.id === currentUser?.userId;

  const { scale: heartScale, pop } = usePop();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.textContent);
  const [savingEdit, setSavingEdit] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [carouselWidth, setCarouselWidth] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const media = post.mediaUrl ?? [];
  const loved = post.currentReaction === 'LOVE';
  const fired = post.currentReaction === 'FIRE';

  const onCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (carouselWidth <= 0) return;
    setCarouselIndex(Math.round(e.nativeEvent.contentOffset.x / carouselWidth));
  };

  const handleLove = () => {
    if (post.currentReaction === null) pop();
    react(post.id, 'LOVE');
  };

  const handleSaveEdit = async () => {
    const next = editText.trim();
    if (!next || next === post.textContent) {
      setIsEditing(false);
      return;
    }
    setSavingEdit(true);
    try {
      await updatePost(post.id, next);
      setIsEditing(false);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <View className="rounded-[28px] overflow-hidden bg-paper-base dark:bg-ink-raised border border-hairline-light dark:border-hairline-dark shadow-sm">
      {/* ── Media Post Layout (Babagang Overlaid Glassmorphic Design) ────── */}
      {media.length > 0 ? (
        <View style={{ position: 'relative' }} onLayout={e => setCarouselWidth(e.nativeEvent.layout.width)}>
          {/* Main Media Image / Carousel */}
          {media.length === 1 ? (
            <Image
              source={{ uri: resolveMediaUrl(media[0]) }}
              style={{ width: '100%', aspectRatio: 3 / 4 }}
              resizeMode="cover"
            />
          ) : (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onCarouselScroll}
                scrollEventThrottle={16}
              >
                {media.map((uri, i) => (
                  <Image
                    key={i}
                    source={{ uri: resolveMediaUrl(uri) }}
                    style={{ width: carouselWidth || 350, aspectRatio: 3 / 4 }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              {/* Carousel Indicators */}
              <View className="absolute top-3 left-0 right-0 flex-row justify-center gap-1.5 z-20">
                {media.map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: i === carouselIndex ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                    }}
                  />
                ))}
              </View>
            </>
          )}

          {/* Top-Left Overlaid Glassmorphic User Badge */}
          <Pressable
            onPress={() => goToProfile(post.owner.id)}
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              zIndex: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 9999,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.30)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
            }}
          >
            <BlurView
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              blurType="dark"
              blurAmount={20}
              reducedTransparencyFallbackColor="rgba(20, 20, 25, 0.65)"
            />
            <Avatar uri={resolveMediaUrl(post.owner.avatarUrl)} size={32} />
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                  {post.owner.fullName}
                </Text>
                <CheckIcon size={12} color={C.accentBlue} />
              </View>
              <Text style={{ color: 'rgba(255, 255, 255, 0.80)', fontSize: 11 }}>
                @{post.owner.username}
              </Text>
            </View>
          </Pressable>

          {/* Top-Right Overlaid Glassmorphic Actions Button */}
          <View style={{ position: 'absolute', top: 14, right: 14, zIndex: 20, flexDirection: 'row', gap: 6 }}>
            {isOwner && !isEditing ? (
              <>
                <Pressable
                  onPress={() => { setEditText(post.textContent); setIsEditing(true); }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    overflow: 'hidden',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.30)',
                  }}
                >
                  <BlurView
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                    blurType="dark"
                    blurAmount={20}
                    reducedTransparencyFallbackColor="rgba(20, 20, 25, 0.65)"
                  />
                  <EditIcon size={15} color="#FFFFFF" />
                </Pressable>
                <Pressable
                  onPress={() => setShowDeleteConfirm(true)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    overflow: 'hidden',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.30)',
                  }}
                >
                  <BlurView
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                    blurType="dark"
                    blurAmount={20}
                    reducedTransparencyFallbackColor="rgba(20, 20, 25, 0.65)"
                  />
                  <TrashIcon size={15} color={C.danger} />
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={() => setShowDetail(true)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.30)',
                }}
              >
                <BlurView
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                  blurType="dark"
                  blurAmount={20}
                  reducedTransparencyFallbackColor="rgba(20, 20, 25, 0.65)"
                />
                <MoreVerticalIcon size={18} color="#FFFFFF" />
              </Pressable>
            )}
          </View>

          {/* Bottom Overlaid Actions & Caption (No dark square background box!) */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              paddingHorizontal: 14,
              paddingBottom: 14,
              paddingTop: 24,
              backgroundColor: 'transparent',
            }}
          >
            {/* Frosted Glass Pill Actions Row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 9999,
                overflow: 'hidden',
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.35)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.20,
                shadowRadius: 10,
              }}
            >
              <BlurView
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                blurType="light"
                blurAmount={15}
                reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.55)"
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                {/* Heart / Flame */}
                <Pressable
                  onPress={handleLove}
                  onLongPress={() => react(post.id, 'FIRE')}
                  hitSlop={8}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                    {fired ? (
                      <FlameIcon size={18} color={C.danger} />
                    ) : (
                      <HeartIcon size={18} color={loved ? C.accent : '#FFFFFF'} filled={loved} />
                    )}
                  </Animated.View>
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
                    {post.reactionCount}
                  </Text>
                </Pressable>

                {/* Comment */}
                <Pressable
                  onPress={() => setShowDetail(true)}
                  hitSlop={8}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <CommentIcon size={17} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
                    {post.commentCount}
                  </Text>
                </Pressable>

                {/* Share */}
                <Pressable hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ShareIcon size={17} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
                    {Math.floor(post.reactionCount * 0.4)}
                  </Text>
                </Pressable>
              </View>

              {/* Bookmark */}
              <Pressable onPress={() => toggleSave(post)} hitSlop={8}>
                <BookmarkIcon size={17} color={saved ? C.accentBlue : '#FFFFFF'} filled={saved} />
              </Pressable>
            </View>

            {/* Caption Text & Hashtags floating over image */}
            {!!post.textContent && (
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 13,
                  marginTop: 10,
                  lineHeight: 18,
                  textShadowColor: 'rgba(0, 0, 0, 0.85)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 4,
                }}
                numberOfLines={3}
              >
                {renderOverlayCaption(post.textContent)}
              </Text>
            )}
          </View>
        </View>
      ) : (
        /* Text-only post layout */
        <View style={{ padding: 16 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Pressable onPress={() => goToProfile(post.owner.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Avatar uri={resolveMediaUrl(post.owner.avatarUrl)} size={38} />
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text className="text-sm font-bold text-content-strong dark:text-content-strong-dark">
                    {post.owner.fullName}
                  </Text>
                  <CheckIcon size={12} color={C.accentBlue} />
                </View>
                <Text className="text-xs text-content-muted dark:text-content-muted-dark">
                  @{post.owner.username} · {formatRelativeTime(post.createdAt)}
                </Text>
              </View>
            </Pressable>

            {isOwner && !isEditing && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Pressable onPress={() => { setEditText(post.textContent); setIsEditing(true); }} hitSlop={8}>
                  <EditIcon size={16} />
                </Pressable>
                <Pressable onPress={() => setShowDeleteConfirm(true)} hitSlop={8}>
                  <TrashIcon size={16} />
                </Pressable>
              </View>
            )}
          </View>

          {/* Caption text */}
          {isEditing ? (
            <View style={{ gap: 8 }}>
              <TextInput
                value={editText}
                onChangeText={setEditText}
                multiline
                textBreakStrategy="simple"
                className="bg-paper-raised dark:bg-black/20 rounded-field p-3 text-[15px] text-content-strong dark:text-content-strong-dark"
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                <Pressable onPress={() => setIsEditing(false)} className="px-4 py-2">
                  <Text className="text-sm font-semibold text-content-muted dark:text-content-muted-dark">
                    Cancel
                  </Text>
                </Pressable>
                <GradientButton onPress={handleSaveEdit} label="Save" loading={savingEdit} />
              </View>
            </View>
          ) : (
            <Text className="text-[15px] text-content-strong dark:text-content-strong-dark leading-relaxed mb-4">
              {renderCaption(post.textContent)}
            </Text>
          )}

          {/* Actions */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderColor: 'rgba(0,0,0,0.05)' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Pressable onPress={handleLove} onLongPress={() => react(post.id, 'FIRE')} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                  {fired ? <FlameIcon size={18} color={C.danger} /> : <HeartIcon size={18} color={loved ? C.accent : C.contentFaint} filled={loved} />}
                </Animated.View>
                <Text className="text-xs text-content-muted dark:text-content-muted-dark">{post.reactionCount}</Text>
              </Pressable>

              <Pressable onPress={() => setShowDetail(true)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CommentIcon size={17} />
                <Text className="text-xs text-content-muted dark:text-content-muted-dark">{post.commentCount}</Text>
              </Pressable>

              <Pressable hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ShareIcon size={17} />
              </Pressable>
            </View>

            <Pressable onPress={() => toggleSave(post)} hitSlop={8}>
              <BookmarkIcon size={17} color={saved ? C.accentBlue : C.contentFaint} filled={saved} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Confirmation & Detail Modals */}
      <ConfirmModal
        visible={showDeleteConfirm}
        icon={<TrashIcon size={28} color={C.danger} />}
        title="Delete post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        confirmColor={C.danger}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          deletePost(post.id);
        }}
      />

      <PostDetailModal visible={showDetail} post={post} onClose={() => setShowDetail(false)} />
    </View>
  );
}
