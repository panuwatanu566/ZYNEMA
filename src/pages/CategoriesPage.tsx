import React, { useState } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { AnimeCard } from '../components/AnimeCard';
import { SidebarTopViews } from '../components/SidebarTopViews';
import { SidebarNewComment } from '../components/SidebarNewComment';
import { ALL_ANIME } from '../data/animeData';

const GENRES = ['All', 'Action', 'Adventure', 'Fantasy', 'Comedy', 'Mystery', 'Movie'];

export const CategoriesPage: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'title'>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  let filtered = selectedGenre === 'All'
    ? ALL_ANIME
    : ALL_ANIME.filter(anime => anime.genres.some(g => g.toLowerCase() === selectedGenre.toLowerCase()));

  if (sortBy === 'rating') {
    filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === 'title') {
    filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  }

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const displayedAnime = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Categories', to: '/categories' },
          { label: selectedGenre }
        ]}
      />

      <section className="product-page spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="product__page__content">
                <div className="product__page__title">
                  <div className="row align-items-center">
                    <div className="col-lg-6 col-md-6 col-sm-6">
                      <div className="section-title">
                        <h4>{selectedGenre} Anime</h4>
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-6">
                      <div className="product__page__filter d-flex justify-content-sm-end align-items-center">
                        <p className="mb-0 mr-2 text-white">Order by:</p>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="bg-dark text-white border-secondary p-1 rounded"
                          style={{ outline: 'none' }}
                        >
                          <option value="default">Default</option>
                          <option value="rating">Highest Rating</option>
                          <option value="title">A-Z Title</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Genre Filter Pills */}
                <div className="d-flex flex-wrap gap-2 mb-4" style={{ gap: '8px' }}>
                  {GENRES.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => {
                        setSelectedGenre(genre);
                        setCurrentPage(1);
                      }}
                      className={`btn btn-sm ${selectedGenre === genre ? 'btn-danger' : 'btn-outline-secondary text-white'}`}
                      style={{ fontSize: '13px', borderRadius: '20px', padding: '4px 14px' }}
                    >
                      {genre}
                    </button>
                  ))}
                </div>

                <div className="row">
                  {displayedAnime.length > 0 ? (
                    displayedAnime.map(anime => (
                      <AnimeCard key={anime.id} anime={anime} />
                    ))
                  ) : (
                    <div className="col-12 text-center py-5">
                      <p className="text-white-50">No anime found in this category.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="product__pagination d-flex justify-content-center mt-4">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
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
