import { Image, Text, View } from 'react-native';
import { PlayIcon } from '../../assets/Icon';
import { MomentMediaType } from '../../types';

type MomentPreviewProps = {
  assetUri: string;
  assetType: MomentMediaType;
};

export default function MomentPreview({ assetUri, assetType }: MomentPreviewProps) {
  return (
    <View className="mx-5 aspect-square rounded-hero overflow-hidden bg-black">
      {assetType === 'PHOTO' ? (
        <Image source={{ uri: assetUri }} className="w-full h-full" resizeMode="cover" />
      ) : (
        // No video player lib installed yet (see LOCKET_FEATURE_PLAN.md §8) — placeholder only.
        <View className="w-full h-full items-center justify-center bg-gray-900">
          <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center">
            <PlayIcon size={28} />
          </View>
          <Text className="text-white/70 text-xs mt-2">Video preview coming soon</Text>
        </View>
      )}
    </View>
  );
}
