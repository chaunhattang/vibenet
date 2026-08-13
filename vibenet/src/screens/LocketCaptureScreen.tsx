import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { CloseIcon, FlashIcon, ImageIcon } from '../assets/Icon';
import { PressableScale } from '../theme/motion';
import { RootStackParamList } from '../navigation/types';
import { MomentMediaType } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'LocketCapture'>;
type Route = RouteProp<RootStackParamList, 'LocketCapture'>;

type CaptureMode = 'photo' | 'video';

export default function LocketCaptureScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const replyToMomentId = useRoute<Route>().params?.replyToMomentId;
  const [mode, setMode] = useState<CaptureMode>('photo');
  const [flashOn, setFlashOn] = useState(false);
  const [busy, setBusy] = useState<'shutter' | 'gallery' | null>(null);

  const handlePicked = (
    kind: CaptureMode | 'gallery',
    assets?: { uri?: string; type?: string; fileName?: string; duration?: number }[],
  ) => {
    const asset = assets?.[0];
    if (!asset?.uri) return;

    const mimeType = asset.type ?? (kind === 'video' ? 'video/mp4' : 'image/jpeg');
    const assetType: MomentMediaType = mimeType.startsWith('video') ? 'VIDEO' : 'PHOTO';

    navigation.replace('LocketCompose', {
      assetUri: asset.uri,
      assetType,
      assetMimeType: mimeType,
      assetFileName: asset.fileName ?? `moment.${assetType === 'VIDEO' ? 'mp4' : 'jpg'}`,
      durationSeconds: asset.duration,
      replyToMomentId,
    });
  };

  const pressShutter = async () => {
    setBusy('shutter');
    try {
      const result = await launchCamera({
        mediaType: mode === 'video' ? 'video' : 'photo',
        saveToPhotos: true,
        cameraType: 'back',
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Could not open camera', result.errorMessage ?? 'Please try again.');
        return;
      }
      handlePicked(mode, result.assets);
    } finally {
      setBusy(null);
    }
  };

  const pressGallery = async () => {
    setBusy('gallery');
    try {
      const result = await launchImageLibrary({ mediaType: 'mixed', selectionLimit: 1 });
      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Could not open gallery', result.errorMessage ?? 'Please try again.');
        return;
      }
      handlePicked('gallery', result.assets);
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Viewfinder area — no live camera preview lib wired up, so a dark placeholder
          stands in for it (see LOCKET_FEATURE_PLAN.md §8); everything else behaves
          exactly like the real capture flow. */}
      <View style={{ flex: 1, backgroundColor: '#111214' }}>
        <View
          style={{
            position: 'absolute',
            top: insets.top + 10,
            left: 16,
            right: 16,
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
            <CloseIcon size={20} color="#FFFFFF" />
          </Pressable>

          <Pressable
            onPress={() => setFlashOn(v => !v)}
            hitSlop={8}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: flashOn ? 'rgba(255,197,66,0.9)' : 'rgba(0,0,0,0.4)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FlashIcon size={18} color="#FFFFFF" filled={flashOn} />
          </Pressable>
        </View>

        {replyToMomentId && (
          <View
            style={{
              position: 'absolute',
              top: insets.top + 62,
              alignSelf: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 9999,
              paddingHorizontal: 14,
              paddingVertical: 6,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
              Replying with a new moment
            </Text>
          </View>
        )}
      </View>

      {/* Bottom control deck */}
      <View style={{ paddingBottom: insets.bottom + 24, paddingTop: 18, backgroundColor: '#000000' }}>
        {/* Mode toggle — Locket's tap-to-switch photo/video segmented text row */}
        <View style={{ flexDirection: 'row', alignSelf: 'center', gap: 24, marginBottom: 22 }}>
          {(['photo', 'video'] as CaptureMode[]).map(m => (
            <Pressable key={m} onPress={() => setMode(m)} hitSlop={8}>
              <Text
                style={{
                  color: mode === m ? '#FFC542' : 'rgba(255,255,255,0.55)',
                  fontSize: 13,
                  fontWeight: '800',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                {m}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 40 }}>
          <Pressable
            onPress={pressGallery}
            disabled={busy !== null}
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: busy === 'gallery' ? 0.5 : 1,
            }}
          >
            {busy === 'gallery' ? <ActivityIndicator color="#FFFFFF" /> : <ImageIcon size={20} color="#FFFFFF" />}
          </Pressable>

          <PressableScale onPress={pressShutter} disabled={busy !== null}>
            <View
              style={{
                width: 84,
                height: 84,
                borderRadius: 42,
                borderWidth: 4,
                borderColor: mode === 'video' ? '#FF3B5C' : '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {busy === 'shutter' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: mode === 'video' ? 16 : 34,
                    backgroundColor: mode === 'video' ? '#FF3B5C' : '#FFFFFF',
                  }}
                />
              )}
            </View>
          </PressableScale>

          {/* Balances the gallery button so the shutter stays centered */}
          <View style={{ width: 46, height: 46 }} />
        </View>
      </View>
    </View>
  );
}
