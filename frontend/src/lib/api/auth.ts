
import api from './axios';

import type {
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
} from '../../types/auth';

export const login = async (
  data: LoginRequest,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    '/auth/login',
    data,
  );

  return response.data;
};

export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  const response = await api.get<CurrentUserResponse>(
    '/auth/user',
  );

  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

