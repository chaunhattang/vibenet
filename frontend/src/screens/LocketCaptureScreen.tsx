import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { CameraIcon, ImageIcon, VideoCameraIcon } from '../assets/Icon';
import CaptureButton from '../components/Locket/CaptureButton';
import ReplyContextBanner from '../components/Locket/ReplyContextBanner';
import ScreenHeader from '../components/ui/ScreenHeader';
import { RootStackParamList } from '../navigation/types';
import { C } from '../theme/colors';
import { MomentMediaType } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'LocketCapture'>;
type Route = RouteProp<RootStackParamList, 'LocketCapture'>;

type PickerKind = 'photo' | 'video' | 'gallery';

export default function LocketCaptureScreen() {
  const navigation = useNavigation<Nav>();
  const replyToMomentId = useRoute<Route>().params?.replyToMomentId;
  const [loadingKind, setLoadingKind] = useState<PickerKind | null>(null);

  const handlePicked = (kind: PickerKind, assets?: { uri?: string; type?: string; fileName?: string; duration?: number }[]) => {
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

  const runPicker = async (kind: PickerKind) => {
    setLoadingKind(kind);
    try {
      const result =
        kind === 'gallery'
          ? await launchImageLibrary({ mediaType: 'mixed', selectionLimit: 1 })
          : await launchCamera({ mediaType: kind === 'video' ? 'video' : 'photo', saveToPhotos: true });

      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Could not open camera', result.errorMessage ?? 'Please try again.');
        return;
      }
      handlePicked(kind, result.assets);
    } finally {
      setLoadingKind(null);
    }
  };

  return (
    <View className="flex-1 bg-paper-base dark:bg-ink-base">
      <ScreenHeader title="New Moment" />

      <View className="flex-1 justify-center px-6" style={{ gap: 12 }}>
        {replyToMomentId && <ReplyContextBanner />}

        <CaptureButton
          icon={<CameraIcon size={20} color={C.white} />}
          label="Take Photo"
          loading={loadingKind === 'photo'}
          onPress={() => runPicker('photo')}
        />
        <CaptureButton
          icon={<VideoCameraIcon size={20} color={C.white} />}
          label="Record Video"
          loading={loadingKind === 'video'}
          onPress={() => runPicker('video')}
        />
        <CaptureButton
          icon={<ImageIcon size={20} color={C.white} />}
          label="Choose from Gallery"
          loading={loadingKind === 'gallery'}
          onPress={() => runPicker('gallery')}
        />
      </View>
    </View>
  );
}
