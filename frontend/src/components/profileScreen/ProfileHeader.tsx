/**
 * ProfileHeader — Babagang glassmorphic redesign.
 * Phase G: dark-mode aware colour values.
 *
 * Structure:
 *   1. Hero banner (140px) + optional Change Cover button
 *   2. Central circular avatar (90px, 4px white border, −45px overlap)
 *   3. Centred name + verified badge
 *   4. @handle + bio (centred)
 *   5. 3-column split stats: Followers | Following | Posts
 *   6. `actions` slot
 */
import { ReactNode } from 'react';
import { Image, Pressable, Text, View, useColorScheme } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CameraIcon } from '../../assets/Icon';
import { C } from '../../theme/colors';

function VerifiedBadge({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill={color}>
      <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </Svg>
  );
}

type ProfileHeaderProps = {
  coverImage: string;
  avatar: string;
  displayName: string;
  handle?: string;
  bio: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  verified?: boolean;
  showChangeCover?: boolean;
  onChangeCover?: () => void;
  actions?: ReactNode;
};

function formatStat(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function StatColumn({
  value,
  label,
  divider,
  textColor,
  subColor,
  dividerColor,
}: {
  value: string;
  label: string;
  divider?: boolean;
  textColor: string;
  subColor: string;
  dividerColor: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        borderRightWidth: divider ? 1 : 0,
        borderRightColor: dividerColor,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '700', color: textColor }}>{value}</Text>
      <Text style={{ fontSize: 12, fontWeight: '500', color: subColor, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

export default function ProfileHeader({
  coverImage,
  avatar,
  displayName,
  handle,
  bio,
  postsCount,
  followersCount,
  followingCount,
  verified = false,
  showChangeCover,
  onChangeCover,
  actions,
}: ProfileHeaderProps) {
  const isDark = useColorScheme() === 'dark';

  // Adaptive colour tokens
  const textPrimary = isDark ? C.onDark : '#0D0E11';
  const textSecondary = isDark ? C.mutedDark : '#6C727F';
  const dividerColor = isDark ? C.inkOverlay : '#F0F0F3';
  const borderColor = isDark ? C.inkOverlay : '#FFFFFF';
  const verifiedColor = C.accentBlue;

  return (
    <View>
      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <View style={{ height: 140, position: 'relative' }}>
        <Image
          source={{ uri: coverImage }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        <View
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(13,14,17,0.18)',
          }}
        />
        {showChangeCover && (
          <Pressable
            onPress={onChangeCover}
            style={({ pressed }) => ({
              position: 'absolute',
              top: 12,
              right: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: pressed ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.45)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 9999,
            })}
          >
            <CameraIcon size={14} color={C.white} />
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '500' }}>
              Change Cover
            </Text>
          </Pressable>
        )}
      </View>

      {/* ── Centred Profile Content ───────────────────────────────────────── */}
      <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
        {/* Avatar — overlaps hero by 45px */}
        <View
          style={{
            marginTop: -45,
            width: 94,
            height: 94,
            borderRadius: 9999,
            borderWidth: 4,
            borderColor: borderColor,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.4 : 0.12,
            shadowRadius: 16,
            elevation: 6,
            overflow: 'hidden',
            backgroundColor: isDark ? C.inkRaised : '#F0F0F3',
          }}
        >
          <Image
            source={{ uri: avatar }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>

        {/* Name + verified */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary }}>
            {displayName}
          </Text>
          {verified && <VerifiedBadge color={verifiedColor} />}
        </View>

        {/* @handle */}
        {!!handle && (
          <Text style={{ fontSize: 13, color: textSecondary, marginTop: 2 }}>
            {handle.startsWith('@') ? handle : `@${handle}`}
          </Text>
        )}

        {/* Bio */}
        {!!bio && (
          <Text
            style={{
              fontSize: 13,
              color: textPrimary,
              marginTop: 8,
              lineHeight: 18,
              textAlign: 'center',
              maxWidth: 300,
            }}
          >
            {bio}
          </Text>
        )}

        {/* 3-column stats */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            marginTop: 20,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: dividerColor,
          }}
        >
          <StatColumn
            value={formatStat(followersCount)}
            label="Followers"
            divider
            textColor={textPrimary}
            subColor={textSecondary}
            dividerColor={dividerColor}
          />
          <StatColumn
            value={formatStat(followingCount)}
            label="Following"
            divider
            textColor={textPrimary}
            subColor={textSecondary}
            dividerColor={dividerColor}
          />
          <StatColumn
            value={formatStat(postsCount)}
            label="Posts"
            textColor={textPrimary}
            subColor={textSecondary}
            dividerColor={dividerColor}
          />
        </View>
      </View>

      {/* Actions slot */}
      {actions}
    </View>
  );
}
