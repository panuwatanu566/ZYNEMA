import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserTier } from '../types/zynema';

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

  const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

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

interface StoredUser extends User {
  passwordHash: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  rememberedEmail: string;
  isUpgradeModalOpen: boolean;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  login: (email: string, password: string, rememberMe?: boolean) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string, tier?: UserTier) => { success: boolean; error?: string };
  logout: () => void;
  forgotPassword: (email: string) => { success: boolean; message: string };
  resetPassword: (email: string, newPassword: string) => { success: boolean; error?: string };
  upgradeToPremium: () => void;
  downgradeToFree: () => void;
  canWatchEpisode: (episodeIndex: number, isPremiumShow?: boolean) => boolean;
  canWatchFullMovie: boolean;
}

const STORAGE_USERS_KEY = 'zynema_registered_users';
const STORAGE_CURRENT_USER_KEY = 'zynema_active_user';
const STORAGE_REMEMBER_EMAIL_KEY = 'zynema_remembered_email';

// Default pre-seeded users for instant testing
const DEFAULT_USERS: StoredUser[] = [
  {
    id: 'usr-free-1',
    name: 'Free Member',
    email: 'free@zynema.com',
    passwordHash: 'Demo1234!',
    tier: 'free',
    createdAt: '2024-01-15'
  },
  {
    id: 'usr-premium-1',
    name: 'VIP Movie Lover',
    email: 'premium@zynema.com',
    passwordHash: 'Demo1234!',
    tier: 'premium',
    createdAt: '2024-01-01'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [rememberedEmail, setRememberedEmail] = useState<string>('');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    // Seed default users if none exist
    const existingUsers = localStorage.getItem(STORAGE_USERS_KEY);
    if (!existingUsers) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
    }

    // Check remembered email
    const savedEmail = localStorage.getItem(STORAGE_REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      setRememberedEmail(savedEmail);
    }

    // Check current session
    const savedUser = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      }
    }
  }, []);

  const getUsers = (): StoredUser[] => {
    try {
      const stored = localStorage.getItem(STORAGE_USERS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  };

  const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  };

  const login = (email: string, password: string, rememberMe = false): { success: boolean; error?: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    const users = getUsers();
    const matched = users.find(u => u.email.toLowerCase() === trimmedEmail);

    if (!matched) {
      return { success: false, error: 'No account found with this email address.' };
    }

    if (matched.passwordHash !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const sessionUser: User = {
      id: matched.id,
      name: matched.name,
      email: matched.email,
      tier: matched.tier,
      createdAt: matched.createdAt
    };

    setUser(sessionUser);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(sessionUser));

    if (rememberMe) {
      localStorage.setItem(STORAGE_REMEMBER_EMAIL_KEY, trimmedEmail);
      setRememberedEmail(trimmedEmail);
    } else {
      localStorage.removeItem(STORAGE_REMEMBER_EMAIL_KEY);
      setRememberedEmail('');
    }

    return { success: true };
  };

  const register = (
    name: string,
    email: string,
    password: string,
    tier: UserTier = 'free'
  ): { success: boolean; error?: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName) {
      return { success: false, error: 'Please enter your full name.' };
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      return { success: false, error: 'Password does not meet the security criteria.' };
    }

    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: StoredUser = {
      id: `usr-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      passwordHash: password,
      tier,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);

    // Auto-login newly registered user
    const sessionUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      tier: newUser.tier,
      createdAt: newUser.createdAt
    };

    setUser(sessionUser);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(sessionUser));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  };

  const forgotPassword = (email: string): { success: boolean; message: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    const users = getUsers();
    const exists = users.find(u => u.email.toLowerCase() === trimmedEmail);

    if (!exists) {
      return { success: false, message: 'If an account exists with this email, a reset verification code has been dispatched.' };
    }

    return {
      success: true,
      message: `Password reset instructions have been generated for ${exists.email}. You can now proceed to set a new password.`
    };
  };

  const resetPassword = (email: string, newPassword: string): { success: boolean; error?: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      return { success: false, error: 'New password does not meet the security criteria.' };
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === trimmedEmail);

    if (userIndex === -1) {
      return { success: false, error: 'Account not found.' };
    }

    users[userIndex].passwordHash = newPassword;
    saveUsers(users);

    return { success: true };
  };

  const upgradeToPremium = () => {
    if (!user) {
      setIsUpgradeModalOpen(true);
      return;
    }
    const updatedUser: User = { ...user, tier: 'premium' };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updatedUser));

    // Update in user db as well
    const users = getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index].tier = 'premium';
      saveUsers(users);
    }
    setIsUpgradeModalOpen(false);
  };

  const downgradeToFree = () => {
    if (!user) return;
    const updatedUser: User = { ...user, tier: 'free' };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updatedUser));

    const users = getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index].tier = 'free';
      saveUsers(users);
    }
  };

  // Content authorization check:
  // Episode index 0 & 1 (Ep 1 & 2) are FREE for everyone.
  // Episode index 2+ (Ep 3+) or Premium Exclusive shows require Premium tier.
  const canWatchEpisode = (episodeIndex: number, isPremiumShow = false): boolean => {
    if (user?.tier === 'premium') return true;
    if (isPremiumShow) return false;
    return episodeIndex < 2; // Only first 2 episodes are free
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isPremium: user?.tier === 'premium',
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
        canWatchEpisode,
        canWatchFullMovie: user?.tier === 'premium'
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
