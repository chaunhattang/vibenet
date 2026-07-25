import { createContext, ReactNode, useContext, useState } from 'react';
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

  const setStatus = (userId: string, status: FriendStatus) =>
    setFriendStatusByUser(prev => ({ ...prev, [userId]: status }));

  const getFriendStatus = (userId: string): FriendStatus =>
    friendStatusByUser[userId] ?? 'NONE';

  return (
    <FriendsContext.Provider
      value={{
        getFriendStatus,
        // Sau này có be thì mỗi hàm dưới đây gọi API tương ứng rồi mới cập nhật state
        sendRequest: userId => setStatus(userId, 'PENDING_SENT'),
        cancelRequest: userId => setStatus(userId, 'NONE'),
        acceptRequest: userId => setStatus(userId, 'FRIENDS'),
        declineRequest: userId => setStatus(userId, 'NONE'),
        unfriend: userId => setStatus(userId, 'NONE'),
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  const ctx = useContext(FriendsContext);
  if (!ctx) throw new Error('useFriends must be used within a FriendsProvider');
  return ctx;
}
