import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserTier, UserRole } from '../types/zynema';
import { api, tokenStore } from '../lib/api';

export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  score: number;
  strength: 'weak' | 'medium' | 'strong';
}

/**
 * Validates password according to API rules (8–72 characters, must include English letters & numbers)
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-]/.test(password);

  let score = 0;
  if (hasMinLength) score++;
  if (hasUpperCase) score++;
  if (hasLowerCase) score++;
  if (hasNumber) score++;
  if (hasSpecialChar) score++;

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 4 && hasMinLength) {
    strength = score === 5 ? 'strong' : 'medium';
  } else if (score >= 3) {
    strength = 'medium';
  }

  // API rule: 8-72 chars, must have letters and numbers
  const isValid = hasMinLength && (hasUpperCase || hasLowerCase) && hasNumber && password.length <= 72;

  return {
    isValid,
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
    score,
    strength
  };
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isPremium: boolean;
  rememberedEmail: string;
  isUpgradeModalOpen: boolean;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; resetToken: string | null; expiresIn: number }>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<{ message: string }>;
  upgradeToPremium: () => void;
  downgradeToFree: () => void;
  hasRole: (...roles: string[]) => boolean;
  canWatchEpisode: (episodeIndex: number, isPremiumShow?: boolean) => boolean;
  canWatchFullMovie: boolean;
}

const STORAGE_REMEMBER_EMAIL_KEY = 'zynema_remembered_email';
const STORAGE_USER_TIER_KEY = 'zynema_local_tier_preference';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [rememberedEmail, setRememberedEmail] = useState<string>('');
  const [localTier, setLocalTier] = useState<UserTier>(() => {
    return (localStorage.getItem(STORAGE_USER_TIER_KEY) as UserTier) || 'free';
  });
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Determine if active user has VIP/Premium streaming access
  // ADMIN and EDITOR automatically have full VIP access. USER tier can also have VIP if upgraded.
  const isPremium = user?.role === 'ADMIN' || user?.role === 'EDITOR' || user?.tier === 'premium' || localTier === 'premium';

  // Initialize Auth state from stored tokens on app start
  useEffect(() => {
    // Check remembered email
    const savedEmail = localStorage.getItem(STORAGE_REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      setRememberedEmail(savedEmail);
    }

    // Call GET /auth/me if accessToken exists
    if (tokenStore.access) {
      api.get('/auth/me')
        .then(({ data }) => {
          const apiUser = data.data;
          const assignedTier: UserTier =
            apiUser.role === 'ADMIN' || apiUser.role === 'EDITOR'
              ? 'premium'
              : (localStorage.getItem(STORAGE_USER_TIER_KEY) as UserTier) || 'free';

          setUser({
            ...apiUser,
            tier: assignedTier
          });
        })
        .catch((err) => {
          const code = err.response?.data?.error?.code;
          // Only clear tokens if the token is invalid or user is banned.
          // Do not log out on 5xx or network errors.
          if (['TOKEN_INVALID', 'TOKEN_MISSING', 'REFRESH_TOKEN_INVALID', 'ACCOUNT_BANNED'].includes(code)) {
            tokenStore.clear();
            setUser(null);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    // Listen to global logout events dispatched by the api interceptor
    const onLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', onLogout);
    return () => {
      window.removeEventListener('auth:logout', onLogout);
    };
  }, []);

  const handleAuthSuccess = (data: any, emailToRemember?: string, rememberMe = false): User => {
    tokenStore.save(data);
    const apiUser = data.user;
    const assignedTier: UserTier =
      apiUser.role === 'ADMIN' || apiUser.role === 'EDITOR'
        ? 'premium'
        : (localStorage.getItem(STORAGE_USER_TIER_KEY) as UserTier) || 'free';

    const fullUser: User = {
      ...apiUser,
      tier: assignedTier
    };

    setUser(fullUser);

    if (rememberMe && emailToRemember) {
      localStorage.setItem(STORAGE_REMEMBER_EMAIL_KEY, emailToRemember);
      setRememberedEmail(emailToRemember);
    } else if (!rememberMe) {
      localStorage.removeItem(STORAGE_REMEMBER_EMAIL_KEY);
      setRememberedEmail('');
    }

    return fullUser;
  };

  /**
   * Log in via POST /auth/login
   */
  const login = async (email: string, password: string, rememberMe = false): Promise<User> => {
    const trimmedEmail = email.trim();
    const response = await api.post('/auth/login', {
      email: trimmedEmail,
      password
    });

    return handleAuthSuccess(response.data.data, trimmedEmail, rememberMe);
  };

  /**
   * Register via POST /auth/register
   * Server returns tokens and automatically logs user in.
   */
  const register = async (name: string, email: string, password: string): Promise<User> => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    const response = await api.post('/auth/register', {
      name: trimmedName,
      email: trimmedEmail,
      password
    });

    return handleAuthSuccess(response.data.data, trimmedEmail, true);
  };

  /**
   * Logout via POST /auth/logout
   */
  const logout = async (): Promise<void> => {
    try {
      const refreshToken = tokenStore.refresh;
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  };

  /**
   * Forgot password via POST /auth/forgot-password
   */
  const forgotPassword = async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email: email.trim() });
    return response.data.data;
  };

  /**
   * Reset password via POST /auth/reset-password
   */
  const resetPassword = async (resetToken: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', {
      resetToken,
      newPassword
    });
    return response.data.data;
  };

  /**
   * Upgrade user to VIP Premium streaming tier
   */
  const upgradeToPremium = () => {
    localStorage.setItem(STORAGE_USER_TIER_KEY, 'premium');
    setLocalTier('premium');
    if (user) {
      setUser({ ...user, tier: 'premium' });
    }
    setIsUpgradeModalOpen(false);
  };

  /**
   * Switch back to Free streaming tier for evaluation/testing
   */
  const downgradeToFree = () => {
    localStorage.setItem(STORAGE_USER_TIER_KEY, 'free');
    setLocalTier('free');
    if (user) {
      setUser({ ...user, tier: 'free' });
    }
  };

  const hasRole = (...roles: string[]): boolean => {
    return !!user && !!user.role && roles.includes(user.role);
  };

  const canWatchEpisode = (episodeIndex: number, isPremiumShow = false): boolean => {
    if (isPremium) return true;
    if (isPremiumShow) return false;
    return episodeIndex < 2; // Episodes 1 and 2 are free
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isPremium,
        rememberedEmail,
        isUpgradeModalOpen,
        openUpgradeModal: () => setIsUpgradeModalOpen(true),
        closeUpgradeModal: () => setIsUpgradeModalOpen(false),
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        upgradeToPremium,
        downgradeToFree,
        hasRole,
        canWatchEpisode,
        canWatchFullMovie: isPremium
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
