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
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
