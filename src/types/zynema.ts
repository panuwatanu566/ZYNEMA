export type UserTier = 'free' | 'premium';
export type UserRole = 'USER' | 'EDITOR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BANNED';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role?: UserRole;
  status?: UserStatus;
  isProtected?: boolean;
  tier?: UserTier;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResult {
  user: User;
  tokenType: 'Bearer';
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface TVMazeShow {
  id: number;
  name: string;
  type: string;
  language: string;
  genres: string[];
  status: string;
  runtime?: number;
  averageRuntime?: number;
  premiered?: string;
  ended?: string;
  officialSite?: string;
  schedule?: {
    time: string;
    days: string[];
  };
  rating: {
    average: number | null;
  };
  network?: {
    id: number;
    name: string;
    country?: {
      name: string;
      code: string;
    };
  } | null;
  webChannel?: {
    id: number;
    name: string;
  } | null;
  image?: {
    medium: string;
    original: string;
  } | null;
  summary?: string;
  isPremiumOnly?: boolean;
}

export interface TVMazeEpisode {
  id: number;
  name: string;
  season: number;
  number: number;
  airdate?: string;
  runtime?: number;
  rating?: {
    average: number | null;
  };
  image?: {
    medium: string;
    original: string;
  } | null;
  summary?: string;
  isPremium?: boolean;
}

export interface TVMazeCast {
  person: {
    id: number;
    name: string;
    image?: {
      medium: string;
    } | null;
  };
  character: {
    id: number;
    name: string;
  };
}

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  userTier?: UserTier;
  timeAgo: string;
  comment: string;
  rating?: number;
}
