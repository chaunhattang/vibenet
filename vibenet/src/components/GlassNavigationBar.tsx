import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Home, Compass, Plus, MessageCircle, User } from 'lucide-react-native';

const AnimatedView = Animated.createAnimatedComponent(View);

const iconMap: Record<string, any> = {
  index: Home,
  find: Compass,
  plus: Plus,
  message: MessageCircle,
  profile: User,
};

export default function GlassNavigationBar({ state, navigation }: BottomTabBarProps) {
  return (
    // Changes: Increased height from h-16 (64px) to h-20 (80px)
    // Widened the bar horizontally by changing left-12/right-12 to left-6/right-6 for 5 icons
    <View className="absolute bottom-8 left-6 right-6 h-20 flex-row items-center overflow-hidden rounded-full border border-white/10 shadow-2xl">
      {/* Frosted Glass Layer */}
      <BlurView
        intensity={80}
        tint="dark"
        className="absolute inset-0 bg-black/20"
      />

      {/* Navigation Items */}
      {/* Changes: Adjusted inner horizontal padding to px-4 to distribute larger buttons evenly */}
      <View className="w-full h-full flex-row justify-around items-center px-4">
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const isPlus = route.name === 'plus';
          const IconComponent = iconMap[route.name] || Home;
          const isHighlighted = isFocused || isPlus;

          // Changes: Increased spring scale pop slightly to 1.1 for a more pronounced feel
          const animatedStyle = useAnimatedStyle(() => {
            return {
              transform: [{ scale: withSpring(isHighlighted ? 1.1 : 1) }],
            };
          });

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              className="items-center justify-center"
              activeOpacity={0.7}
            >
              {/* Changes: Increased background circle dimensions from w-11/h-11 (44px) to w-13/h-13 (52px) */}
              <AnimatedView
                style={animatedStyle}
                className={`items-center justify-center rounded-full ${
                  isHighlighted ? 'bg-white w-[52px] h-[52px]' : 'w-[52px] h-[52px]'
                }`}
              >
                {/* Changes: Increased icon size from 22 to 24 */}
                <IconComponent
                  size={24}
                  color={isHighlighted ? '#0f172a' : 'rgba(255, 255, 255, 0.7)'}
                  strokeWidth={2}
                />
              </AnimatedView>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
