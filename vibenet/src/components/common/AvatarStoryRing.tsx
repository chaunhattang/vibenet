import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Colors } from '../../constants/theme';

interface AvatarStoryRingProps {
  avatarUri: string | undefined;
  size: number;
  hasStories: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// Wraps a profile avatar with an Instagram-style gradient ring when the user has
// active stories, tappable to open them; falls back to a plain bordered avatar otherwise.
export const AvatarStoryRing: React.FC<AvatarStoryRingProps> = ({
  avatarUri,
  size,
  hasStories,
  onPress,
  style,
}) => {
  const innerSize = size - 7;
  const avatar = (
    <Image
      source={{ uri: avatarUri }}
      style={[styles.avatarImg, { width: innerSize, height: innerSize, borderRadius: innerSize / 2 }]}
    />
  );

  const content = hasStories ? (
    <LinearGradient
      colors={Colors.storyGradient as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={styles.ringInner}>{avatar}</View>
    </LinearGradient>
  ) : (
    <View style={[styles.plainBorder, { width: size, height: size, borderRadius: size / 2 }]}>{avatar}</View>
  );

  if (!onPress) return <View style={style}>{content}</View>;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={style}>
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  ring: {
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    flex: 1,
    width: '100%',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plainBorder: {
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatarImg: {
    backgroundColor: Colors.surfaceMuted,
  },
});
