import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { MessageIcon, PlayIcon } from '../../assets/Icon';
import { formatRelativeTime } from '../../utils/time';
import { MomentFeedItem } from '../../types';
import ReactionBar from './ReactionBar';

type MomentCardProps = {
  moment: MomentFeedItem;
  onReact: (emoji: string) => void;
  onReply: () => void;
};

// The one big "widget" — Locket's whole app is built around this single rounded photo
// card. Name + timestamp sit directly on the photo like the real home-screen widget;
// tapping the photo reveals the reaction tray instead of it always being on screen.
export default function MomentCard({ moment, onReact, onReply }: MomentCardProps) {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <View
      style={{
        width: '100%',
        aspectRatio: 1,
        borderRadius: 36,
        overflow: 'hidden',
        backgroundColor: '#111',
      }}
    >
      <Pressable
        style={{ flex: 1 }}
        onPress={() => setShowReactions(v => !v)}
      >
        {moment.mediaType === 'PHOTO' ? (
          <Image source={{ uri: moment.mediaUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          // No video player lib installed yet (see LOCKET_FEATURE_PLAN.md §8) — placeholder only.
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a' }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <PlayIcon size={30} />
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 10 }}>
              Video playback coming soon
            </Text>
          </View>
        )}
      </Pressable>

      {/* Name + timestamp, straight on the photo like the real widget */}
      <View style={{ position: 'absolute', top: 20, left: 22, right: 22 }}>
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 17,
            fontWeight: '800',
            textShadowColor: 'rgba(0,0,0,0.5)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 6,
          }}
        >
          {moment.senderName}
        </Text>
        <Text
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 12,
            fontWeight: '600',
            marginTop: 2,
            textShadowColor: 'rgba(0,0,0,0.5)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 6,
          }}
        >
          {formatRelativeTime(moment.createdAt)} ago
        </Text>
      </View>

      {/* Caption, if any — small pill just above the reaction tray */}
      {moment.caption && (
        <View style={{ position: 'absolute', bottom: showReactions ? 86 : 22, left: 22, right: 70 }}>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: '600',
              textShadowColor: 'rgba(0,0,0,0.6)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 6,
            }}
            numberOfLines={2}
          >
            {moment.caption}
          </Text>
        </View>
      )}

      {/* Reply — bottom-right circular button, always visible */}
      <Pressable
        onPress={onReply}
        hitSlop={8}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: 'rgba(255,255,255,0.18)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.35)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MessageIcon size={19} color="#FFFFFF" />
      </Pressable>

      {/* Reaction tray — tap the photo to reveal, matching Locket's tap-to-react */}
      {showReactions && (
        <View style={{ position: 'absolute', bottom: 20, left: 20 }}>
          <ReactionBar
            myReaction={moment.myReaction}
            onReact={emoji => {
              onReact(emoji);
              setShowReactions(false);
            }}
          />
        </View>
      )}
    </View>
  );
}
