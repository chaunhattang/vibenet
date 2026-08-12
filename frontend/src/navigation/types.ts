import { MomentMediaType, SentMoment } from '../types';

export type RootStackParamList = {
  Login: { registered?: boolean } | undefined;
  Register: undefined;
  MainTabs: undefined;
  // Leaf tab screens live inside MainTabs (see navigation/MainTabs.tsx).
  // Kept here too so `navigation.navigate('Home' | 'Explore' | ...)` type-checks
  // from anywhere in the app — React Navigation resolves these to the nested
  // tab screen by name at runtime.
  Home: undefined;
  Explore: undefined;
  MessagesList: undefined;
  ChatDetail: { chatId: string };
  Notifications: undefined;
  Profile: undefined;
  OtherProfile: { userId: string };
  SetupProfile: undefined;
  CloseFriends: undefined;
  LocketFeed: undefined;
  SentMoments: undefined;
  MomentViewers: { moment: SentMoment };
  LocketCapture: { replyToMomentId?: string } | undefined;
  LocketCompose: {
    assetUri: string;
    assetType: MomentMediaType;
    assetMimeType: string;
    assetFileName: string;
    durationSeconds?: number;
    replyToMomentId?: string;
  };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
