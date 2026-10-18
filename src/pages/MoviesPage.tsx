import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { MovieCard } from '../components/MovieCard';
import { SidebarTopViews } from '../components/SidebarTopViews';
import { SidebarNewComment } from '../components/SidebarNewComment';
import { fetchShows, FALLBACK_SHOWS } from '../services/tvmazeApi';
import { TVMazeShow } from '../types/zynema';
import { LoadingSpinner, MovieGridSkeleton } from '../components/LoadingSpinner';

const GENRES = [
  'All',
  'Drama',
  'Action',
  'Science-Fiction',
  'Comedy',
  'Crime',
  'Thriller',
  'Adventure',
  'Fantasy'
];

export const MoviesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shows, setShows] = useState<TVMazeShow[]>(FALLBACK_SHOWS);
  const [loading, setLoading] = useState(true);

  // URL query params
  const initialGenre = searchParams.get('genre') || 'All';
  const initialTier = searchParams.get('tier') || 'all';

  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedTier, setSelectedTier] = useState(initialTier);
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'title'>('default');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const loadShows = async () => {
      try {
        const data = await fetchShows(0);
        if (data && data.length > 0) {
          setShows(data);
        }
      } catch (err) {
        console.error('Failed to load shows', err);
      } finally {
        setLoading(false);
      }
    };
    loadShows();
  }, []);

  // Sync state with URL params
  useEffect(() => {
    const g = searchParams.get('genre');
    if (g) setSelectedGenre(g);
    const t = searchParams.get('tier');
    if (t) setSelectedTier(t);
  }, [searchParams]);

  // Filtering
  let filtered = shows;

  if (selectedGenre !== 'All') {
    filtered = filtered.filter(s =>
      s.genres.some(g => g.toLowerCase() === selectedGenre.toLowerCase())
    );
  }

  if (selectedTier === 'premium') {
    filtered = filtered.filter(s => s.isPremiumOnly);
  } else if (selectedTier === 'free') {
    filtered = filtered.filter(s => !s.isPremiumOnly);
  }

  if (keyword.trim()) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(keyword.toLowerCase()) ||
      s.genres.some(g => g.toLowerCase().includes(keyword.toLowerCase()))
    );
  }

  // Sorting
  if (sortBy === 'rating') {
    filtered = [...filtered].sort((a, b) => (b.rating.average || 0) - (a.rating.average || 0));
  } else if (sortBy === 'title') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const displayedShows = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    setCurrentPage(1);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (genre === 'All') p.delete('genre');
      else p.set('genre', genre);
      return p;
    });
  };

  const handleTierChange = (tier: string) => {
    setSelectedTier(tier);
    setCurrentPage(1);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (tier === 'all') p.delete('tier');
      else p.set('tier', tier);
      return p;
    });
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Browse Shows', to: '/movies' },
          { label: selectedGenre }
        ]}
      />

      <section className="product-page spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="product__page__content">
                <div className="product__page__title mb-4">
                  <div className="row align-items-center">
                    <div className="col-lg-6 col-md-6">
                      <div className="section-title">
                        <h4>
                          {selectedTier === 'premium' ? '👑 Premium Exclusive' : selectedGenre} Catalog
                        </h4>
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6">
                      <div className="d-flex justify-content-md-end align-items-center">
                        <span className="mr-2 text-white small">Sort:</span>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="bg-dark text-white border-secondary p-1 rounded small"
                          style={{ outline: 'none' }}
                        >
                          <option value="default">Default</option>
                          <option value="rating">Top Rated (★)</option>
                          <option value="title">A-Z Name</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search in page */}
                <div className="mb-4">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="Filter by title..."
                      value={keyword}
                      onChange={(e) => {
                        setKeyword(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                    {keyword && (
                      <div className="input-group-append">
                        <button
                          type="button"
                          className="btn btn-outline-secondary text-white"
                          onClick={() => setKeyword('')}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tier Filter Pills */}
                <div className="d-flex flex-wrap gap-2 mb-3" style={{ gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleTierChange('all')}
                    className={`btn btn-sm ${selectedTier === 'all' ? 'btn-danger' : 'btn-outline-secondary text-white'}`}
                    style={{ borderRadius: '20px', fontSize: '13px' }}
                  >
                    All Tiers
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTierChange('free')}
                    className={`btn btn-sm ${selectedTier === 'free' ? 'btn-info' : 'btn-outline-info'}`}
                    style={{ borderRadius: '20px', fontSize: '13px' }}
                  >
                    FREE HD (720p)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTierChange('premium')}
                    className={`btn btn-sm ${selectedTier === 'premium' ? 'btn-warning text-dark font-weight-bold' : 'btn-outline-warning'}`}
                    style={{ borderRadius: '20px', fontSize: '13px' }}
                  >
                    👑 VIP Premium Only
                  </button>
                </div>

                {/* Genre Filter Pills */}
                <div className="d-flex flex-wrap gap-2 mb-4" style={{ gap: '6px' }}>
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => handleGenreChange(genre)}
                      className={`btn btn-sm ${selectedGenre === genre ? 'btn-danger' : 'btn-outline-secondary text-white-50'}`}
                      style={{ fontSize: '12px', borderRadius: '15px', padding: '3px 12px' }}
                    >
                      {genre}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className="py-4">
                    <LoadingSpinner
                      message="กำลังดึงแคตตาล็อกภาพยนตร์ทั้งหมดจาก TVMaze API..."
                      minHeight="180px"
                    />
                    <div className="mt-3">
                      <MovieGridSkeleton count={9} />
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    {displayedShows.length > 0 ? (
                      displayedShows.map((show) => (
                        <MovieCard key={show.id} show={show} />
                      ))
                    ) : (
                      <div className="col-12 text-center py-5">
                        <p className="text-white-50">No movies or series found matching your criteria.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="product__pagination d-flex justify-content-center mt-4">
                    {Array.from({ length: Math.min(totalPages, 8) }).map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className={`border-0 mx-1 ${currentPage === pageNum ? 'current-page' : ''}`}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '4px',
                            background: currentPage === pageNum ? '#e53637' : '#1d1e39',
                            color: '#ffffff',
                            cursor: 'pointer'
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4 col-md-6 col-sm-8">
              <div className="product__sidebar">
                <SidebarTopViews />
                <SidebarNewComment />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
