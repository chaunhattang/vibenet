import { useMemo, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchIcon } from '../assets/Icon';
import MasonryGrid, { GridItem } from '../components/profileScreen/MasonryGrid';
import EmptyState from '../components/ui/EmptyState';
import { MOCK_EXPLORE } from '../data/mockExplore';
import { C, PLACEHOLDER } from '../theme/colors';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  // Lọc lưới theo tag ngay tại client (mock). Sau này: GET /api/explore?q=.
  const items = useMemo<GridItem[]>(() => {
    const q = query.trim().toLowerCase();
    return MOCK_EXPLORE.filter(it => !q || it.tag.includes(q)).map(it => ({
      id: it.id,
      imageUri: it.imageUri,
      likeCount: it.likeCount,
    }));
  }, [query]);

  return (
    <View className="flex-1 bg-paper-base dark:bg-ink-base">
      <View style={{ paddingTop: insets.top + 8 }} className="px-5 pb-2">
        <View className="flex-row items-center gap-2 bg-paper-raised dark:bg-ink-overlay rounded-full px-4 py-2.5">
          <SearchIcon size={18} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search vibes (nature, travel, city…)"
            placeholderTextColor={PLACEHOLDER}
            autoCapitalize="none"
            textBreakStrategy="simple"
            className="flex-1 text-sm text-content-strong dark:text-content-strong-dark"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {items.length > 0 ? (
          <MasonryGrid items={items} />
        ) : (
          <View className="px-5 mt-16">
            <EmptyState
              icon={<SearchIcon size={26} color={C.brand} />}
              title="Nothing found"
              subtitle="Try a different vibe."
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
