import { TVMazeShow, TVMazeEpisode, TVMazeCast } from '../types/zynema';

const BASE_URL = 'https://api.tvmaze.com';

// Clean HTML tags from TVMaze summary string
export const cleanSummary = (html?: string): string => {
  if (!html) return 'No description available for this title.';
  return html.replace(/<[^>]*>?/gm, '').trim();
};

// Fallback curated shows (Blockbusters / Top TV Series)
export const FALLBACK_SHOWS: TVMazeShow[] = [
  {
    id: 82,
    name: 'Game of Thrones',
    type: 'Scripted',
    language: 'English',
    genres: ['Drama', 'Adventure', 'Fantasy'],
    status: 'Ended',
    runtime: 60,
    premiered: '2011-04-17',
    rating: { average: 9.3 },
    network: { id: 8, name: 'HBO' },
    image: {
      medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/190/476117.jpg',
      original: 'https://static.tvmaze.com/uploads/images/original_untouched/190/476117.jpg'
    },
    summary: 'Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north.',
    isPremiumOnly: true
  },
  {
    id: 169,
    name: 'Breaking Bad',
    type: 'Scripted',
    language: 'English',
    genres: ['Drama', 'Crime', 'Thriller'],
    status: 'Ended',
    runtime: 60,
    premiered: '2008-01-20',
    rating: { average: 9.5 },
    network: { id: 20, name: 'AMC' },
    image: {
      medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2400.jpg',
      original: 'https://static.tvmaze.com/uploads/images/original_untouched/0/2400.jpg'
    },
    summary: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family\'s financial future.',
    isPremiumOnly: true
  },
  {
    id: 2993,
    name: 'Stranger Things',
    type: 'Scripted',
    language: 'English',
    genres: ['Drama', 'Fantasy', 'Science-Fiction'],
    status: 'Running',
    runtime: 60,
    premiered: '2016-07-15',
    rating: { average: 8.8 },
    network: null,
    webChannel: { id: 1, name: 'Netflix' },
    image: {
      medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/394/986161.jpg',
      original: 'https://static.tvmaze.com/uploads/images/original_untouched/394/986161.jpg'
    },
    summary: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    isPremiumOnly: false
  },
  {
    id: 431,
    name: 'Friends',
    type: 'Scripted',
    language: 'English',
    genres: ['Comedy', 'Romance'],
    status: 'Ended',
    runtime: 30,
    premiered: '1994-09-22',
    rating: { average: 8.9 },
    network: { id: 1, name: 'NBC' },
    image: {
      medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/41/104550.jpg',
      original: 'https://static.tvmaze.com/uploads/images/original_untouched/41/104550.jpg'
    },
    summary: 'Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan.',
    isPremiumOnly: false
  },
  {
    id: 17861,
    name: 'Westworld',
    type: 'Scripted',
    language: 'English',
    genres: ['Drama', 'Science-Fiction', 'Western'],
    status: 'Ended',
    runtime: 60,
    premiered: '2016-10-02',
    rating: { average: 8.4 },
    network: { id: 8, name: 'HBO' },
    image: {
      medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/439/1099447.jpg',
      original: 'https://static.tvmaze.com/uploads/images/original_untouched/439/1099447.jpg'
    },
    summary: 'At the intersection of the near future and the reimagined past, a world in which every human appetite can be indulged without consequence.',
    isPremiumOnly: true
  },
  {
    id: 305,
    name: 'Black Mirror',
    type: 'Scripted',
    language: 'English',
    genres: ['Drama', 'Science-Fiction', 'Thriller'],
    status: 'Running',
    runtime: 60,
    premiered: '2011-12-04',
    rating: { average: 8.8 },
    webChannel: { id: 1, name: 'Netflix' },
    image: {
      medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/465/1164936.jpg',
      original: 'https://static.tvmaze.com/uploads/images/original_untouched/465/1164936.jpg'
    },
    summary: 'An anthology series exploring a twisted, high-tech multiverse where humanity\'s greatest innovations and darkest instincts collide.',
    isPremiumOnly: false
  }
];

// In-memory cache to reduce network latency
const cache = new Map<string, any>();

// Fetch all popular shows
export const fetchShows = async (page = 0): Promise<TVMazeShow[]> => {
  const cacheKey = `shows_page_${page}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const res = await fetch(`${BASE_URL}/shows?page=${page}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: TVMazeShow[] = await res.json();

    // Map and assign some high-rated titles as Premium Exclusive
    const enhanced = data.map((show, index) => ({
      ...show,
      isPremiumOnly: (show.rating.average !== null && show.rating.average >= 8.5) || index % 4 === 0
    }));

    cache.set(cacheKey, enhanced);
    return enhanced;
  } catch (error) {
    console.warn('TVMaze API fetch failed, using fallback shows:', error);
    return FALLBACK_SHOWS;
  }
};

// Search shows from TVMaze
export const searchShows = async (query: string): Promise<TVMazeShow[]> => {
  if (!query.trim()) return [];

  const cacheKey = `search_${query.toLowerCase()}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const res = await fetch(`${BASE_URL}/search/shows?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: { score: number; show: TVMazeShow }[] = await res.json();
    const shows = data.map(item => ({
      ...item.show,
      isPremiumOnly: item.show.rating?.average ? item.show.rating.average >= 8.5 : false
    }));
    cache.set(cacheKey, shows);
    return shows;
  } catch (error) {
    console.warn('TVMaze search failed:', error);
    return FALLBACK_SHOWS.filter(s =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.genres.some(g => g.toLowerCase().includes(query.toLowerCase()))
    );
  }
};

// Fetch single show by ID
export const fetchShowById = async (id: number | string): Promise<TVMazeShow | null> => {
  const cacheKey = `show_${id}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const res = await fetch(`${BASE_URL}/shows/${id}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: TVMazeShow = await res.json();
    const enhanced = {
      ...data,
      isPremiumOnly: (data.rating.average !== null && data.rating.average >= 8.5) || Number(id) % 3 === 0
    };
    cache.set(cacheKey, enhanced);
    return enhanced;
  } catch (error) {
    console.warn(`TVMaze fetchShowById(${id}) failed, checking fallback:`, error);
    const found = FALLBACK_SHOWS.find(s => s.id === Number(id));
    return found || FALLBACK_SHOWS[0];
  }
};

// Fetch episodes of a show
export const fetchShowEpisodes = async (id: number | string): Promise<TVMazeEpisode[]> => {
  const cacheKey = `episodes_${id}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const res = await fetch(`${BASE_URL}/shows/${id}/episodes`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const episodes: TVMazeEpisode[] = await res.json();
    
    // Episodes 1 and 2 are FREE for everyone; Episode 3 onwards are PREMIUM
    const gated = episodes.map((ep, idx) => ({
      ...ep,
      isPremium: idx >= 2 // Episode 1 and 2 are Free, 3+ Premium
    }));

    cache.set(cacheKey, gated);
    return gated;
  } catch (error) {
    console.warn(`TVMaze fetchShowEpisodes(${id}) failed, generating default:`, error);
    // Generate fallback episodes
    return Array.from({ length: 12 }).map((_, idx) => ({
      id: 1000 + idx,
      name: `Episode ${idx + 1}`,
      season: 1,
      number: idx + 1,
      isPremium: idx >= 2,
      summary: `Episode ${idx + 1} of this thrilling series.`
    }));
  }
};

// Fetch cast of a show
export const fetchShowCast = async (id: number | string): Promise<TVMazeCast[]> => {
  const cacheKey = `cast_${id}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const res = await fetch(`${BASE_URL}/shows/${id}/cast`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const cast: TVMazeCast[] = await res.json();
    cache.set(cacheKey, cast);
    return cast.slice(0, 8); // Take top 8 cast
  } catch (error) {
    console.warn(`TVMaze fetchShowCast(${id}) failed:`, error);
    return [];
  }
};
