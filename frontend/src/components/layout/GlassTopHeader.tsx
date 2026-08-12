/**
 * GlassTopHeader — Redesigned top navigation bar (Babagang design system).
 * Features left Grid Menu pill button, centered Vibenet title, and right action pills.
 */
import { useColorScheme } from 'react-native';
import { ActivityIndicator, Image, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Path, Rect } from 'react-native-svg';
import { CameraIcon, CloseIcon, MessageIcon, SearchIcon } from '../../assets/Icon';
import { C, PLACEHOLDER } from '../../theme/colors';
import { OnlineUser } from '../../types';

type GlassTopHeaderProps = {
  title?: string;
  onPressMenu?: () => void;
  onPressBell?: () => void;
  unreadCount?: number;
  onPressAdd?: () => void;
  onPressMessages?: () => void;
  onPressLocket?: () => void;
  locketUnreadCount?: number;
  // Search props
  searchOpen?: boolean;
  onToggleSearch?: () => void;
  searchQuery?: string;
  onChangeSearchQuery?: (value: string) => void;
  searchResults?: OnlineUser[];
  isSearching?: boolean;
  onSelectUser?: (user: OnlineUser) => void;
};

function GridMenuIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" rx="2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="14" y="3" width="7" height="7" rx="2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="14" y="14" width="7" height="7" rx="2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="3" y="14" width="7" height="7" rx="2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BellIconSvg({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PlusIconSvg({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function CircleIconButton({
  onPress,
  children,
  badgeCount,
  dotColor,
  isDark,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  badgeCount?: number;
  dotColor?: string;
  isDark: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
        backgroundColor: pressed
          ? isDark ? 'rgba(255,255,255,0.16)' : '#E5E5EA'
          : isDark ? 'rgba(255,255,255,0.08)' : '#F0F0F3',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      })}
    >
      {children}
      {!!badgeCount && badgeCount > 0 ? (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            minWidth: 16,
            height: 16,
            paddingHorizontal: 3,
            borderRadius: 9999,
            backgroundColor: '#FF3B30',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            borderColor: isDark ? C.inkBase : '#FFFFFF',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '800' }}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </Text>
        </View>
      ) : dotColor ? (
        <View
          style={{
            position: 'absolute',
            top: 5,
            right: 5,
            width: 8,
            height: 8,
            borderRadius: 9999,
            backgroundColor: dotColor,
            borderWidth: 1.5,
            borderColor: isDark ? C.inkBase : '#FFFFFF',
          }}
        />
      ) : null}
    </Pressable>
  );
}

export default function GlassTopHeader({
  title = 'Vibenet',
  onPressMenu,
  onPressBell,
  unreadCount = 0,
  onPressAdd,
  onPressMessages,
  onPressLocket,
  locketUnreadCount = 0,
  searchOpen = false,
  onToggleSearch,
  searchQuery = '',
  onChangeSearchQuery,
  searchResults = [],
  isSearching = false,
  onSelectUser,
}: GlassTopHeaderProps) {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const iconColor = isDark ? C.onDark : C.contentStrong;
  const titleColor = isDark ? C.onDark : '#0D0E11';

  return (
    <View
      style={{
        zIndex: 50,
        paddingTop: insets.top,
        backgroundColor: isDark ? 'rgba(14, 14, 16, 0.94)' : 'rgba(255, 255, 255, 0.94)',
        borderBottomWidth: 1,
        borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
      }}
    >
      <View
        style={{
          height: 56,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {searchOpen ? (
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : '#F0F0F4',
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 9999,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
            }}
          >
            <SearchIcon size={18} color={iconColor} />
            <TextInput
              autoFocus
              value={searchQuery}
              onChangeText={onChangeSearchQuery}
              placeholder="Search users..."
              placeholderTextColor={PLACEHOLDER}
              textBreakStrategy="simple"
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: '500',
                color: titleColor,
                paddingVertical: 0,
              }}
            />
            {isSearching && <ActivityIndicator size="small" color={C.brand} />}
            <Pressable onPress={onToggleSearch} hitSlop={8}>
              <CloseIcon size={18} color={iconColor} />
            </Pressable>
          </View>
        ) : (
          <>
            {/* Left side: Grid Menu Icon Button */}
            <CircleIconButton onPress={onPressMenu} isDark={isDark}>
              <GridMenuIcon color={iconColor} />
            </CircleIconButton>

            {/* Center: Vibenet Logo Title */}
            <Text
              style={{
                fontSize: 22,
                fontWeight: '800',
                letterSpacing: -0.5,
                color: titleColor,
                textAlign: 'center',
              }}
            >
              {title}
            </Text>

            {/* Right side: Action Pill Buttons (Search, Notifications, Messages) */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {onToggleSearch && (
                <CircleIconButton onPress={onToggleSearch} isDark={isDark}>
                  <SearchIcon size={18} color={iconColor} />
                </CircleIconButton>
              )}
              {onPressAdd && (
                <CircleIconButton onPress={onPressAdd} isDark={isDark}>
                  <PlusIconSvg color={iconColor} />
                </CircleIconButton>
              )}
              {onPressBell && (
                <CircleIconButton
                  onPress={onPressBell}
                  badgeCount={unreadCount}
                  isDark={isDark}
                >
                  <BellIconSvg color={iconColor} />
                </CircleIconButton>
              )}
              {onPressMessages && (
                <CircleIconButton onPress={onPressMessages} isDark={isDark}>
                  <MessageIcon size={18} color={iconColor} />
                </CircleIconButton>
              )}
            </View>
          </>
        )}
      </View>

      {/* Search results dropdown panel */}
      {searchOpen && searchQuery.trim().length > 0 && (
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 12,
            borderRadius: 20,
            overflow: 'hidden',
            backgroundColor: isDark ? C.inkOverlay : '#FFFFFF',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
            maxHeight: 280,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {isSearching ? (
            <Text style={{ padding: 16, textAlign: 'center', fontSize: 13, color: C.contentMuted }}>
              Searching...
            </Text>
          ) : searchResults.length > 0 ? (
            searchResults.map(user => (
              <Pressable
                key={user.id}
                onPress={() => onSelectUser?.(user)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  backgroundColor: pressed
                    ? isDark ? 'rgba(255,255,255,0.08)' : '#F5F5F7'
                    : 'transparent',
                })}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    overflow: 'hidden',
                    backgroundColor: '#E5E7EB',
                  }}
                >
                  <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%' }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: titleColor }}>
                    {user.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: C.contentMuted }}>
                    @{user.handle}
                  </Text>
                </View>
              </Pressable>
            ))
          ) : (
            <Text style={{ padding: 16, textAlign: 'center', fontSize: 13, color: C.contentMuted }}>
              No users found
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
