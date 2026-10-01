
import { useEffect, useState, type ReactNode } from 'react';

import { getCurrentUser, login as loginApi, logout as logoutApi } from '../lib/api/auth';

import { AuthContext } from './AuthContextValue';

import type { LoginRequest, Permission, Role, User } from '../types/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  const setAuthData = (authData: {
    user: User;
    role: Role | null;
    permissions: Permission[];
  }) => {
    setUser(authData.user);
    setRole(authData.role);
    setPermissions(authData.permissions);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('nexaerp_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        setAuthData(currentUser);
      } catch {
        localStorage.removeItem('nexaerp_token');
        setUser(null);
        setRole(null);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await loginApi(credentials);

    localStorage.setItem('nexaerp_token', response.token);

    const currentUser = await getCurrentUser();

    setAuthData(currentUser);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      localStorage.removeItem('nexaerp_token');
      setUser(null);
      setRole(null);
      setPermissions([]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        permissions,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

