import { apiGet } from './client';
import { UserResponse } from '../types';

export const getUserById = (id: string) => apiGet<UserResponse>(`/api/users/${id}`);
