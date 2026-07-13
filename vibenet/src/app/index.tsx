import '../global.css'; // 1. Add the CSS import here
import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    // 2. You can now use Tailwind classes inside className!
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold text-rose-500">Hiiiiiiiii</Text>
      <Text className="text-2xl font-bold text-rose-500">Hello</Text>
      <Text className="text-2xl font-bold text-green-500">Hello</Text>

    </View>
  );
}
