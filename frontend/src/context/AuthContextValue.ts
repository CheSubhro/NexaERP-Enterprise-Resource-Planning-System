import { createContext } from 'react'

import type { LoginRequest, User } from '../types/auth'

export interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
)