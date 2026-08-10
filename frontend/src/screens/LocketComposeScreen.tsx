import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SendIcon } from '../assets/Icon';
import { ApiError } from '../api/client';
import MomentPreview from '../components/Locket/MomentPreview';
import RecipientPicker from '../components/Locket/RecipientPicker';
import ReplyContextBanner from '../components/Locket/ReplyContextBanner';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useLocket } from '../contexts/LocketContext';
import { RootStackParamList } from '../navigation/types';
import { PLACEHOLDER } from '../theme/colors';
import { RecipientScope } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'LocketCompose'>;
type Route = RouteProp<RootStackParamList, 'LocketCompose'>;

export default function LocketComposeScreen() {
  const navigation = useNavigation<Nav>();
  const { assetUri, assetType, assetMimeType, assetFileName, durationSeconds, replyToMomentId } =
    useRoute<Route>().params;
  const { closeFriends, loadCloseFriends, createMoment } = useLocket();

  const [caption, setCaption] = useState('');
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
    <KeyboardAvoidingView
      className="flex-1 bg-paper-base dark:bg-ink-base"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader
        title="New Moment"
        right={
          <Pressable
            onPress={handleSend}
            disabled={sending}
            className="w-9 h-9 rounded-full bg-brand items-center justify-center disabled:opacity-40"
          >
            <SendIcon size={16} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingVertical: 16, paddingBottom: 40, gap: 16 }}>
        {replyToMomentId && <ReplyContextBanner />}

        <MomentPreview assetUri={assetUri} assetType={assetType} />

        <View className="mx-5 bg-paper-raised dark:bg-ink-input rounded-card px-4 py-3 border border-hairline-light dark:border-hairline-dark">
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Add a caption..."
            placeholderTextColor={PLACEHOLDER}
            maxLength={280}
            multiline
            className="text-content-strong dark:text-content-strong-dark"
          />
        </View>

        <View>
          <Text className="text-content-faint dark:text-content-faint-dark text-xs font-semibold uppercase px-5 mb-2">
            Send to
          </Text>
          <RecipientPicker
            closeFriends={closeFriends}
            selectedIds={selectedIds}
            onToggle={toggleRecipient}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
