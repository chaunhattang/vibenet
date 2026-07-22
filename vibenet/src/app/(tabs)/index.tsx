import { Text, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    // Guaranteed dark blue to indigo gradient background
    <LinearGradient
      colors={['#1e3a8a', '#0f172a']} // Deep blue to dark slate
      style={{ flex: 1, height: height }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 100 }}
        className="px-6"
      >
        <Text className="text-white text-3xl font-bold text-center">
          Welcome Home
        </Text>
        <Text className="text-white/60 text-lg mt-4 text-center">
          The glass tab bar below will now beautifully blur this text and background as you scroll.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}
