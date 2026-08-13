import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { mockFriendStatusByUser } from '../data/mockData';
import { FriendStatus } from '../types';

type FriendsContextValue = {
  getFriendStatus: (userId: string) => FriendStatus;
  sendRequest: (userId: string) => void;
  cancelRequest: (userId: string) => void;
  acceptRequest: (userId: string) => void;
  declineRequest: (userId: string) => void;
  unfriend: (userId: string) => void;
};

const FriendsContext = createContext<FriendsContextValue | null>(null);

// Trạng thái kết bạn giữa "mình" và từng người, giữ ở đây (thay vì state riêng trong
// từng màn) để Notifications, OtherProfile, "Online Now"... luôn thấy cùng một trạng
// thái khi accept/cancel/unfriend ở bất kỳ đâu.
export function FriendsProvider({ children }: { children: ReactNode }) {
  const [friendStatusByUser, setFriendStatusByUser] =
    useState<Record<string, FriendStatus>>(mockFriendStatusByUser);

  const setStatus = useCallback((userId: string, status: FriendStatus) =>
    setFriendStatusByUser(prev => ({ ...prev, [userId]: status })), []);

  const getFriendStatus = useCallback(
    (userId: string): FriendStatus => friendStatusByUser[userId] ?? 'NONE',
    [friendStatusByUser],
  );

  // Sau này có be thì mỗi hàm dưới đây gọi API tương ứng rồi mới cập nhật state
  const sendRequest = useCallback((userId: string) => setStatus(userId, 'PENDING_SENT'), [setStatus]);
  const cancelRequest = useCallback((userId: string) => setStatus(userId, 'NONE'), [setStatus]);
  const acceptRequest = useCallback((userId: string) => setStatus(userId, 'FRIENDS'), [setStatus]);
  const declineRequest = useCallback((userId: string) => setStatus(userId, 'NONE'), [setStatus]);
  const unfriend = useCallback((userId: string) => setStatus(userId, 'NONE'), [setStatus]);

  const value = useMemo(
    () => ({ getFriendStatus, sendRequest, cancelRequest, acceptRequest, declineRequest, unfriend }),
    [getFriendStatus, sendRequest, cancelRequest, acceptRequest, declineRequest, unfriend],
  );

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>;
}

export function useFriends() {
  const ctx = useContext(FriendsContext);
  if (!ctx) throw new Error('useFriends must be used within a FriendsProvider');
  return ctx;
}
