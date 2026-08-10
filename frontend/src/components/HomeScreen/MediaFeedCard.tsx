/**
 * MediaFeedCard — Full-bleed 480px media card with glassmorphic overlays.
 * Spec: design.md §5C + mock HTML lines 679-753.
 *
 * Layout:
 *   - Cover Image fills the entire card
 *   - Top glass banner (absolute, inset 12px, 52px, border-radius 20px):
 *       author 34px avatar + name/handle + verified check + 3-dot menu
 *   - Bottom gradient scrim:
 *       caption + hashtags (accent-blue) + stat pills (heart/comment/share)
 */
import { Image, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { MediaFeedPost } from '../../data/mockMediaFeed';

// ── Inline icon helpers ───────────────────────────────────────────────────────
function HeartIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function CommentIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function ShareIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx="18" cy="5" r="3" stroke="#FFFFFF" strokeWidth={2} />
      <Circle cx="6" cy="12" r="3" stroke="#FFFFFF" strokeWidth={2} />
      <Circle cx="18" cy="19" r="3" stroke="#FFFFFF" strokeWidth={2} />
      <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
      <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function VerifiedIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="#0084FF">
      <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </Svg>
  );
}
function DotsIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="#FFFFFF">
      <Circle cx="12" cy="5" r="2" />
      <Circle cx="12" cy="12" r="2" />
      <Circle cx="12" cy="19" r="2" />
    </Svg>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ icon, count }: { icon: React.ReactNode; count: number }) {
  const label = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      {icon}
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>{label}</Text>
    </View>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
type Props = { post: MediaFeedPost };

export default function MediaFeedCard({ post }: Props) {
  return (
    <View
      style={{
        width: '100%',
        height: 480,
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
      }}
    >
      {/* Cover image */}
      <Image
        source={{ uri: post.media }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        resizeMode="cover"
      />

      {/* ── Top frosted glass banner ─────────────────────────────────── */}
      <View
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          height: 52,
          backgroundColor: 'rgba(20, 20, 22, 0.65)',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.15)',
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Author info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Image
            source={{ uri: post.author.avatarUri }}
            style={{ width: 34, height: 34, borderRadius: 9999 }}
            resizeMode="cover"
          />
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' }}>
                {post.author.name}
              </Text>
              {post.author.verified && <VerifiedIcon />}
            </View>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.70)' }}>
              {post.author.handle}
            </Text>
          </View>
        </View>

        <DotsIcon />
      </View>

      {/* ── Bottom gradient scrim — layered transparent→dark simulation ── */}
      {/* Outer: 100% height but transparent at top */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          backgroundColor: 'transparent',
        }}
        pointerEvents="box-none"
      >
        {/* Inner dark band that provides the scrim */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 140,
            backgroundColor: 'rgba(0,0,0,0.72)',
            paddingTop: 20,
            paddingBottom: 16,
            paddingHorizontal: 16,
          }}
        >
          {/* Caption */}
          {!!post.caption && (
            <Text style={{ fontSize: 13, color: '#FFFFFF', lineHeight: 18, marginBottom: 10 }}>
              {post.caption}
              {post.hashtags.length > 0 && (
                <Text style={{ color: '#0084FF', fontWeight: '500' }}>
                  {' '}{post.hashtags.join(' ')}
                </Text>
              )}
            </Text>
          )}

          {/* Stats row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
            <StatPill icon={<HeartIcon />} count={post.stats.likes} />
            <StatPill icon={<CommentIcon />} count={post.stats.comments} />
            <StatPill icon={<ShareIcon />} count={post.stats.shares} />
          </View>
        </View>
      </View>
    </View>
  );
}
