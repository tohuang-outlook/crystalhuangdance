import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  type AuthCredentials,
  type AuthUser,
} from '../services/auth';

interface AuthContextValue {
  error: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  register: (credentials: AuthCredentials) => Promise<void>;
  user: AuthUser | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    try {
      const response = await fetchCurrentUser();
      setUser(response.user);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load session';
      setUser(null);
      setError(message === 'Unauthorized' ? null : message);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };

    void loadUser();
  }, []);

  const handleAuthAction = async (
    action: (credentials: AuthCredentials) => Promise<{ user: AuthUser }>,
    credentials: AuthCredentials
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await action(credentials);
      setUser(response.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: AuthCredentials) => {
    await handleAuthAction(loginUser, credentials);
  };

  const register = async (credentials: AuthCredentials) => {
    await handleAuthAction(registerUser, credentials);
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await logoutUser();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      error,
      isAdmin: user?.role === 'admin',
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      refreshUser,
      register,
      user,
    }),
    [error, isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
