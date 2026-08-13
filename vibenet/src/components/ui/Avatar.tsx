import { Image, View } from 'react-native';

type AvatarProps = {
  uri: string;
  size?: number;
  shape?: 'circle' | 'squircle';
  ring?: boolean;
};

// Single switch point for the app's avatar shape language: list avatars stay circles,
// "hero"/author avatars (post authors, composer, profile header) pass shape="squircle"
// per UI_REDESIGN_PLAN.md §2.4. `ring` adds the brand story-ring treatment for
// online/"story" contexts only — never on inert list avatars.
export default function Avatar({ uri, size = 44, shape = 'circle', ring = false }: AvatarProps) {
  const radius = shape === 'squircle' ? Math.round(size * 0.42) : size / 2;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        borderWidth: ring ? 2 : 0,
      }}
      className={`overflow-hidden bg-paper-overlay dark:bg-ink-overlay ${ring ? 'border-brand/30' : ''}`}
    >
      <Image source={{ uri }} className="w-full h-full" />
    </View>
  );
}
