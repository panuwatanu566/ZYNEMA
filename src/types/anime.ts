export interface Anime {
  id: string;
  title: string;
  japaneseTitle?: string;
  image: string;
  banner?: string;
  episodes: string;
  commentsCount: number;
  viewsCount: number | string;
  genres: string[];
  rating?: number;
  votes?: string;
  type?: string;
  studios?: string;
  dateAired?: string;
  status?: string;
  scores?: string;
  duration?: string;
  quality?: string;
  description?: string;
  category?: 'trending' | 'popular' | 'recent' | 'live';
  topViewRank?: number;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  timeAgo: string;
  comment: string;
}

export interface Episode {
  id: number;
  title: string;
  videoUrl: string;
  poster?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  image: string;
  author: string;
  excerpt: string;
  tags?: string[];
  commentsCount?: number;
  viewsCount?: string;
  content?: string[];
}
