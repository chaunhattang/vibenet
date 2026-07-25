import { CURRENT_USER_ID } from '../constants';

export type MockAccount = {
  userId: string;
  userName: string;
  email: string;
  password: string;
};

// Tài khoản giả để test đăng nhập (chưa có backend) — sau này có be thì xoá file này,
// login()/register() (lib/auth) sẽ gọi API thật.
export const mockAccounts: MockAccount[] = [
  { userId: CURRENT_USER_ID, userName: 'me', email: 'me@fade.app', password: '123456' },
  { userId: 'u1', userName: 'minhanh', email: 'minhanh@fade.app', password: '123456' },
  { userId: 'u2', userName: 'duykhang', email: 'duykhang@fade.app', password: '123456' },
];
