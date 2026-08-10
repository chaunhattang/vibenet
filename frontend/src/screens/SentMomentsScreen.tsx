import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { SendIcon } from '../assets/Icon';
import SentMomentCard from '../components/Locket/SentMomentCard';
import EmptyState from '../components/ui/EmptyState';
import GradientButton from '../components/ui/GradientButton';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useLocket } from '../contexts/LocketContext';
import { RootStackParamList } from '../navigation/types';
import { C } from '../theme/colors';
import { SentMoment } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SentMoments'>;

export default function SentMomentsScreen() {
  const navigation = useNavigation<Nav>();
  const { sentMoments, sentLoading, sentError, hasMoreSent, loadSentMoments, loadMoreSentMoments } =
    useLocket();

  useEffect(() => {
    loadSentMoments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: SentMoment }) => (
      <SentMomentCard moment={item} onPress={() => navigation.navigate('MomentViewers', { moment: item })} />
    ),
    [navigation],
  );

  return (
    <View className="flex-1 bg-paper-base dark:bg-ink-base">
      <ScreenHeader title="Sent Moments" />

      {sentError && sentMoments.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <EmptyState icon={<SendIcon size={26} color={C.danger} />} title={sentError} />
          <GradientButton onPress={() => loadSentMoments()} label="Try Again" className="mt-4" />
        </View>
      ) : (
        <FlatList
          data={sentMoments}
          keyExtractor={item => item.momentId}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 16, paddingBottom: 40, gap: 10 }}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasMoreSent) loadMoreSentMoments();
          }}
          ListEmptyComponent={
            !sentLoading ? (
              <EmptyState
                icon={<SendIcon size={26} color={C.brand} />}
                title="No sent moments yet"
                subtitle="Moments you share will show up here, along with who's seen them."
              />
            ) : null
          }
          ListFooterComponent={
            sentLoading && sentMoments.length > 0 ? (
              <ActivityIndicator size="small" color={C.brand} style={{ marginTop: 8 }} />
            ) : null
          }
        />
      )}
    </View>
  );
}
