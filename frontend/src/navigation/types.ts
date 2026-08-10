import { MomentMediaType, SentMoment } from '../types';

export type RootStackParamList = {
  Login: { registered?: boolean } | undefined;
  Register: undefined;
  Home: undefined;
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
