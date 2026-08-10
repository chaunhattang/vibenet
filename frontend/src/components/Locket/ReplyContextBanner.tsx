import { Text, View } from 'react-native';

export default function ReplyContextBanner() {
  return (
    <View className="mx-5 mb-3 bg-brand/10 border border-brand/30 rounded-field px-3 py-2">
      <Text className="text-brand text-xs font-medium">Replying with a new moment</Text>
    </View>
  );
}
