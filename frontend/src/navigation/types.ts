export type RootStackParamList = {
  Home: undefined;
  MessagesList: undefined;
  ChatDetail: { chatId: string };
  Profile: undefined;
  OtherProfile: { userId: string };
  SetupProfile: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
