import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StoryViewerModal } from '../../components/stories/StoryViewerModal';
import * as storiesApi from '../../services/api/stories';
import * as usersApi from '../../services/api/users';
import { StoryUserGroupResponse } from '../../services/api/types';

export default function StoryRouteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<StoryUserGroupResponse | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [stories, author] = await Promise.all([
          storiesApi.getUserStories(id),
          usersApi.getUserById(id),
        ]);
        setGroup({
          userId: id,
          username: author.username,
          fullName: author.profileResponse?.fullName ?? null,
          avatarUrl: author.profileResponse?.avatarUrl ?? null,
          hasUnseenStories: stories.some((s) => !s.isViewed),
          stories,
        });
      } catch {
        router.back();
      }
    })();
  }, [id, router]);

  if (!group) return null;

  return (
    <StoryViewerModal
      visible={true}
      stories={[group]}
      initialStoryIndex={0}
      onClose={() => router.back()}
    />
  );
}
