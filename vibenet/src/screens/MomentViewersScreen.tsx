import { useRoute, RouteProp } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { EyeIcon } from '../assets/Icon';
import { ApiError, resolveMediaUrl } from '../api/client';
import { getMomentViewers } from '../api/locket';
import ViewerRow from '../components/Locket/ViewerRow';
import ViewersProgressHeader from '../components/Locket/ViewersProgressHeader';
import EmptyState from '../components/ui/EmptyState';
import GradientButton from '../components/ui/GradientButton';
import ScreenHeader from '../components/ui/ScreenHeader';
import { RootStackParamList } from '../navigation/types';
import { C } from '../theme/colors';
import { MomentViewer } from '../types';

type Route = RouteProp<RootStackParamList, 'MomentViewers'>;

export default function MomentViewersScreen() {
  const { moment } = useRoute<Route>().params;

  const [viewers, setViewers] = useState<MomentViewer[]>([]);
  const [viewedCount, setViewedCount] = useState(moment.viewedCount);
  const [totalRecipients, setTotalRecipients] = useState(moment.recipientCount);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMomentViewers(moment.momentId);
      setViewers((result?.viewers ?? []).map(v => ({ ...v, avatarUrl: resolveMediaUrl(v.avatarUrl) })));
      setViewedCount(result?.viewedCount ?? moment.viewedCount);
      setTotalRecipients(result?.totalRecipients ?? moment.recipientCount);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load viewers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View className="flex-1 bg-paper-base dark:bg-ink-base">
      <ScreenHeader title="Seen By" />

      {error && viewers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <EmptyState icon={<EyeIcon size={26} color={C.danger} />} title={error} />
          <GradientButton onPress={load} label="Try Again" className="mt-4" />
        </View>
      ) : (
        <FlatList
          data={viewers}
          keyExtractor={item => item.userId}
          renderItem={({ item }) => <ViewerRow viewer={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListHeaderComponent={
            <ViewersProgressHeader
              moment={moment}
              viewedCount={viewedCount}
              totalRecipients={totalRecipients}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View className="items-center py-12">
                <Text className="text-content-muted dark:text-content-muted-dark">
                  No one has seen this yet.
                </Text>
              </View>
            ) : (
              <ActivityIndicator size="small" color={C.brand} style={{ marginTop: 24 }} />
            )
          }
        />
      )}
    </View>
  );
}
