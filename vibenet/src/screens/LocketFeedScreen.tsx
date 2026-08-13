import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraIcon, SendIcon } from '../assets/Icon';
import AvatarBubbleRow from '../components/Locket/AvatarBubbleRow';
import MomentCard from '../components/Locket/MomentCard';
import GradientButton from '../components/ui/GradientButton';
import { useLocket } from '../contexts/LocketContext';
import { RootStackParamList } from '../navigation/types';
import { PressableScale } from '../theme/motion';

type Nav = NativeStackNavigationProp<RootStackParamList, 'LocketFeed'>;

// Locket's real home screen isn't a scrolling list — it's one big featured widget with a
// row of friend bubbles underneath to swap it, and a shutter button pinned to the bottom
// to fire back a reply. This mirrors that: no FlatList, just a selected moment + a strip.
export default function LocketFeedScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { feed, feedLoading, feedError, loadFeed, markViewed, react } = useLocket();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (feed.length > 0 && !feed.some(m => m.momentId === selectedId)) {
      setSelectedId(feed[0].momentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feed]);

  useEffect(() => {
    if (selectedId) markViewed(selectedId);
  }, [selectedId, markViewed]);

  const selectedIndex = useMemo(
    () => Math.max(0, feed.findIndex(m => m.momentId === selectedId)),
    [feed, selectedId],
  );
  const selectedMoment = feed[selectedIndex];

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Minimal top bar — wordmark + sent-moments shortcut, no border/surface like the rest of the app */}
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800', letterSpacing: -0.5 }}>
          Locket
        </Text>
        <Pressable
          onPress={() => navigation.navigate('SentMoments')}
          hitSlop={8}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: 'rgba(255,255,255,0.10)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SendIcon size={16} color="#FFFFFF" />
        </Pressable>
      </View>

      {feedError && feed.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <CameraIcon size={30} color="rgba(255,255,255,0.4)" />
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginTop: 12, textAlign: 'center' }}>
            {feedError}
          </Text>
          <GradientButton onPress={() => loadFeed()} label="Try Again" className="mt-4" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Featured widget */}
          <View style={{ flex: 1, paddingHorizontal: 20, justifyContent: 'center' }}>
            {feedLoading && feed.length === 0 ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : selectedMoment ? (
              <MomentCard
                moment={selectedMoment}
                onReact={emoji => react(selectedMoment.momentId, emoji)}
                onReply={() =>
                  navigation.navigate('LocketCapture', { replyToMomentId: selectedMoment.momentId })
                }
              />
            ) : (
              <View style={{ alignItems: 'center', gap: 8 }}>
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CameraIcon size={28} color="rgba(255,255,255,0.5)" />
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginTop: 8 }}>
                  No moments yet
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center' }}>
                  When a friend shares a Locket moment, it'll light up here.
                </Text>
              </View>
            )}
          </View>

          {/* Friend switcher strip */}
          {feed.length > 0 && (
            <View style={{ paddingBottom: 10 }}>
              <AvatarBubbleRow moments={feed} selectedId={selectedId} onSelect={i => setSelectedId(feed[i].momentId)} />
            </View>
          )}

          {/* Shutter — the one persistent action, Locket-style */}
          <View style={{ alignItems: 'center', paddingBottom: insets.bottom + 20, paddingTop: 6 }}>
            <PressableScale onPress={() => navigation.navigate('LocketCapture')}>
              <View
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 38,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 4,
                  borderColor: 'rgba(255,255,255,0.25)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF' }} />
              </View>
            </PressableScale>
          </View>
        </View>
      )}
    </View>
  );
}
