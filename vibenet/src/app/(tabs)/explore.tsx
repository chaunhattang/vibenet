import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors, Radii, Spacing, Typography, BottomTabInset, MaxContentWidth } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (Math.min(SCREEN_WIDTH, MaxContentWidth) - 32 - 10) / 2;

const EXPLORE_ITEMS = [
  {
    id: 'exp-1',
    uri: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    aspectRatio: 1.3,
    likes: '1.4k',
    tag: 'Architecture',
  },
  {
    id: 'exp-2',
    uri: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80',
    aspectRatio: 0.8,
    likes: '890',
    tag: 'Tokyo',
  },
  {
    id: 'exp-3',
    uri: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80',
    aspectRatio: 0.9,
    likes: '2.1k',
    tag: 'Minimalism',
  },
  {
    id: 'exp-4',
    uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    aspectRatio: 1.2,
    likes: '3.4k',
    tag: 'Portraits',
  },
  {
    id: 'exp-5',
    uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
    aspectRatio: 1.1,
    likes: '1.8k',
    tag: 'Film',
  },
  {
    id: 'exp-6',
    uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    aspectRatio: 1.0,
    likes: '950',
    tag: 'Architecture',
  },
];

const CATEGORIES = ['All', 'Architecture', 'Tokyo', 'Minimalism', 'Portraits', 'Film'];

export default function ExploreScreen() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = EXPLORE_ITEMS.filter((item) => {
    if (activeCategory !== 'All' && item.tag !== activeCategory) return false;
    if (searchQuery && !item.tag.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          {/* Search Header */}
          <View style={styles.header}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={Colors.textTertiary} />
              <TextInput
                placeholder="Search styles, tags, creators..."
                placeholderTextColor={Colors.textPlaceholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Categories Pill Bar */}
          <View style={styles.categoriesSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.7}
                  onPress={() => setActiveCategory(cat)}
                  style={[
                    styles.categoryPill,
                    activeCategory === cat && styles.activeCategoryPill,
                  ]}>
                  <Text
                    style={[
                      styles.categoryText,
                      activeCategory === cat && styles.activeCategoryText,
                    ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Masonry Grid */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            <View style={styles.gridRow}>
              {/* Column 1 */}
              <View style={styles.gridColumn}>
                {filteredItems
                  .filter((_, i) => i % 2 === 0)
                  .map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.9}
                      style={[
                        styles.gridCard,
                        { height: GRID_ITEM_WIDTH * item.aspectRatio },
                      ]}>
                      <Image
                        source={{ uri: item.uri }}
                        style={styles.gridImage}
                        contentFit="cover"
                      />
                      <View style={styles.gridOverlay}>
                        <View style={styles.likesBadge}>
                          <Ionicons name="heart" size={12} color="#FFFFFF" />
                          <Text style={styles.likesText}>{item.likes}</Text>
                        </View>
                        <View style={styles.tagBadge}>
                          <Text style={styles.tagText}>{item.tag}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>

              {/* Column 2 */}
              <View style={styles.gridColumn}>
                {filteredItems
                  .filter((_, i) => i % 2 === 1)
                  .map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.9}
                      style={[
                        styles.gridCard,
                        { height: GRID_ITEM_WIDTH * item.aspectRatio },
                      ]}>
                      <Image
                        source={{ uri: item.uri }}
                        style={styles.gridImage}
                        contentFit="cover"
                      />
                      <View style={styles.gridOverlay}>
                        <View style={styles.likesBadge}>
                          <Ionicons name="heart" size={12} color="#FFFFFF" />
                          <Text style={styles.likesText}>{item.likes}</Text>
                        </View>
                        <View style={styles.tagBadge}>
                          <Text style={styles.tagText}>{item.tag}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgMain,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.bgMain,
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: Radii.pill,
    backgroundColor: '#EBECEF',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  categoriesSection: {
    marginBottom: Spacing.two,
  },
  categoriesScroll: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  categoryPill: {
    paddingHorizontal: Spacing.four,
    paddingVertical: 7,
    borderRadius: Radii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  activeCategoryPill: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  categoryText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
    paddingTop: Spacing.one,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gridColumn: {
    flex: 1,
    gap: 10,
  },
  gridCard: {
    width: '100%',
    borderRadius: Radii.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.surfaceMuted,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: Spacing.two,
    left: Spacing.two,
    right: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  likesText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  tagText: {
    color: Colors.textPrimary,
    fontSize: 9,
    fontWeight: '700',
  },
});
