import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, PlayIcon, SendIcon } from '../assets/Icon';
import { ApiError } from '../api/client';
import RecipientPicker from '../components/Locket/RecipientPicker';
import { useLocket } from '../contexts/LocketContext';
import { RootStackParamList } from '../navigation/types';
import { RecipientScope } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'LocketCompose'>;
type Route = RouteProp<RootStackParamList, 'LocketCompose'>;

export default function LocketComposeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { assetUri, assetType, assetMimeType, assetFileName, durationSeconds, replyToMomentId } =
    useRoute<Route>().params;
  const { closeFriends, loadCloseFriends, createMoment } = useLocket();

  const [caption, setCaption] = useState('');
  const [captionOpen, setCaptionOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const initializedSelection = useRef(false);

  useEffect(() => {
    loadCloseFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initializedSelection.current && closeFriends.length > 0) {
      setSelectedIds(new Set(closeFriends.map(f => f.userId)));
      initializedSelection.current = true;
    }
  }, [closeFriends]);

  const toggleRecipient = (userId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSend = async () => {
    if (selectedIds.size === 0) {
      Alert.alert('Pick at least one recipient', 'Select who should see this moment.');
      return;
    }
    setSending(true);
    try {
      const scope: RecipientScope = selectedIds.size === closeFriends.length ? 'CLOSE_FRIENDS' : 'SPECIFIC';
      await createMoment({
        assetUri,
        assetType,
        assetMimeType,
        assetFileName,
        durationSeconds,
        caption: caption.trim() || undefined,
        scope,
        recipientIds: scope === 'SPECIFIC' ? Array.from(selectedIds) : undefined,
        replyToMomentId,
      });
      navigation.navigate('LocketFeed');
    } catch (err) {
      Alert.alert(
        'Could not send moment',
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Full-bleed preview — the photo/video IS the screen, like Locket's send flow */}
      {assetType === 'PHOTO' ? (
        <Image source={{ uri: assetUri }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} resizeMode="cover" />
      ) : (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a' }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <PlayIcon size={30} />
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 10 }}>
            Video preview coming soon
          </Text>
        </View>
      )}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 160,
          backgroundColor: 'rgba(0,0,0,0.35)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 260,
          backgroundColor: 'rgba(0,0,0,0.55)',
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top bar */}
        <View
          style={{
            paddingTop: insets.top + 10,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={8}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0,0,0,0.4)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeftIcon size={22} color="#FFFFFF" />
          </Pressable>

          {replyToMomentId && (
            <View
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 9999,
                paddingHorizontal: 14,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>Replying</Text>
            </View>
          )}

          <View style={{ width: 40, height: 40 }} />
        </View>

        <View style={{ flex: 1 }} />

        {/* Caption — sits directly on the photo, tap to type, exactly like Locket */}
        <Pressable onPress={() => setCaptionOpen(true)} style={{ paddingHorizontal: 28, marginBottom: 22 }}>
          {captionOpen ? (
            <TextInput
              autoFocus
              value={caption}
              onChangeText={setCaption}
              onBlur={() => setCaptionOpen(false)}
              placeholder="Add a caption..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              maxLength={280}
              multiline
              textAlign="center"
              style={{
                color: '#FFFFFF',
                fontSize: 20,
                fontWeight: '700',
                textShadowColor: 'rgba(0,0,0,0.6)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 8,
              }}
            />
          ) : (
            <Text
              style={{
                color: caption ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                fontSize: 20,
                fontWeight: '700',
                textAlign: 'center',
                textShadowColor: 'rgba(0,0,0,0.6)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 8,
              }}
              numberOfLines={2}
            >
              {caption || 'Add a caption...'}
            </Text>
          )}
        </Pressable>

        {/* Recipients + send */}
        <View style={{ paddingBottom: insets.bottom + 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <RecipientPicker closeFriends={closeFriends} selectedIds={selectedIds} onToggle={toggleRecipient} />
            </View>
            <Pressable
              onPress={handleSend}
              disabled={sending}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                marginRight: 20,
                backgroundColor: '#FFC542',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: sending ? 0.5 : 1,
              }}
            >
              {sending ? <ActivityIndicator color="#000000" /> : <SendIcon size={22} color="#000000" />}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
