/**
 * MasonryGrid — 2-column staggered masonry layout.
 * Babagang spec §5D F6: mock HTML lines 823-852.
 *
 * Left column items → tall (210px), right column → shorter (160px).
 * Each cell: cover Image + bottom-left frosted glass like-count pill.
 */
import { Image, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export type GridItem = {
  id: string;
  imageUri: string;
  likeCount: number;
};

function HeartFillIcon() {
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24" fill="#FFFFFF">
      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </Svg>
  );
}

function formatCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function GridCard({ item, height }: { item: GridItem; height: number }) {
  return (
    <View
      style={{
        height,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <Image
        source={{ uri: item.imageUri }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      {/* Like count glass pill */}
      <View
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: 'rgba(0, 0, 0, 0.42)',
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 9999,
        }}
      >
        <HeartFillIcon />
        <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600' }}>
          {formatCount(item.likeCount)}
        </Text>
      </View>
    </View>
  );
}

export default function MasonryGrid({ items }: { items: GridItem[] }) {
  // Split into left (even indices) and right (odd indices) columns
  const left = items.filter((_, i) => i % 2 === 0);
  const right = items.filter((_, i) => i % 2 !== 0);

  return (
    <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 16 }}>
      <View style={{ flex: 1 }}>
        {left.map(item => (
          <GridCard key={item.id} item={item} height={210} />
        ))}
      </View>
      <View style={{ flex: 1 }}>
        {right.map(item => (
          <GridCard key={item.id} item={item} height={160} />
        ))}
      </View>
    </View>
  );
}
