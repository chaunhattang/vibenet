import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StatusBar,
  Text,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloseIcon } from '../../assets/Icon';
import { StoryItem } from '../../data/mockStories';
import { formatRelativeTime } from '../../utils/time';

const { width: SCREEN_W } = Dimensions.get('window');
const FRAME_MS = 5000; // mỗi frame hiện 5s

type StoryViewerProps = {
  visible: boolean;
  users: StoryItem[]; // chỉ những user có frames
  startUserIndex: number;
  onClose: () => void;
  onViewedUser?: (userId: string) => void;
};

export default function StoryViewer({
  visible,
  users,
  startUserIndex,
  onClose,
  onViewedUser,
}: StoryViewerProps) {
  const insets = useSafeAreaInsets();
  const [userIndex, setUserIndex] = useState(startUserIndex);
  const [frameIndex, setFrameIndex] = useState(0);

  const progress = useSharedValue(0);
  const pausedValue = useRef(0);
  const pausedRef = useRef(false);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const user = users[userIndex];
  const frame = user?.frames[frameIndex];

  // Reset về vị trí bắt đầu mỗi lần mở.
  useEffect(() => {
    if (visible) {
      setUserIndex(startUserIndex);
      setFrameIndex(0);
    }
  }, [visible, startUserIndex]);

  const stopTimer = () => {
    cancelAnimation(progress);
  };

  const startTimer = (fromValue = 0) => {
    progress.value = fromValue;
    progress.value = withTiming(
      1,
      { duration: FRAME_MS * (1 - fromValue), easing: Easing.linear },
      finished => {
        if (finished) runOnJS(goNext)();
      },
    );
  };

  // (Re)chạy timer khi đổi frame/user hoặc khi mở.
  useEffect(() => {
    if (!visible || !frame) return;
    pausedRef.current = false;
    startTimer(0);
    return stopTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, userIndex, frameIndex]);

  const goNext = () => {
    stopTimer();
    if (!user) return;
    if (frameIndex < user.frames.length - 1) {
      setFrameIndex(i => i + 1);
    } else if (userIndex < users.length - 1) {
      onViewedUser?.(user.id);
      setUserIndex(i => i + 1);
      setFrameIndex(0);
    } else {
      onViewedUser?.(user.id);
      onClose();
    }
  };

  const goPrev = () => {
    stopTimer();
    if (frameIndex > 0) {
      setFrameIndex(i => i - 1);
    } else if (userIndex > 0) {
      const prevUser = users[userIndex - 1];
      setUserIndex(i => i - 1);
      setFrameIndex(Math.max(0, prevUser.frames.length - 1));
    } else {
      startTimer(0); // đang ở frame đầu tiên → tua lại từ đầu
    }
  };

  const pause = () => {
    pausedRef.current = true;
    cancelAnimation(progress);
    pausedValue.current = progress.value;
  };

  const resume = () => {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    startTimer(pausedValue.current);
  };

  if (!user || !frame) return null;

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <StatusBar hidden />
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <Image
          source={{ uri: frame.uri }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          resizeMode="cover"
        />

        {/* Tap zones: trái = frame trước, phải = frame sau; giữ = tạm dừng */}
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, flexDirection: 'row' }}>
          <Pressable
            style={{ width: SCREEN_W * 0.32 }}
            onPress={() => !pausedRef.current && goPrev()}
            onLongPress={pause}
            onPressOut={resume}
            delayLongPress={200}
          />
          <Pressable
            style={{ flex: 1 }}
            onPress={() => !pausedRef.current && goNext()}
            onLongPress={pause}
            onPressOut={resume}
            delayLongPress={200}
          />
        </View>

        {/* Top gradient scrim + header (progress bars, author) */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: insets.top + 8, paddingHorizontal: 10 }}>
          {/* Progress segments */}
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {user.frames.map((f, i) => (
              <View
                key={f.id}
                style={{ flex: 1, height: 2.5, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)', overflow: 'hidden' }}
              >
                {i < frameIndex && <View style={{ height: '100%', width: '100%', backgroundColor: '#fff' }} />}
                {i === frameIndex && (
                  <Animated.View
                    style={[{ height: '100%', backgroundColor: '#fff' }, progressStyle]}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Author row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <Image
              source={user.avatarSource as any}
              style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' }}
            />
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>{user.name}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginLeft: 8 }}>
              {formatRelativeTime(frame.createdAt)}
            </Text>
            <View style={{ flex: 1 }} />
            <Pressable onPress={onClose} hitSlop={12}>
              <CloseIcon size={22} color="#fff" />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
