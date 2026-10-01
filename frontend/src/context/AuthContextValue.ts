
import { createContext } from 'react';

import type { LoginRequest, Permission, Role, User } from '../types/auth';

export interface AuthContextType {
  user: User | null;
  role: Role | null;
  permissions: Permission[];
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

