import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchShows } from '../services/tvmazeApi';
import { TVMazeShow } from '../types/zynema';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<TVMazeShow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const shows = await searchShows(searchTerm.trim());
        setResults(shows.slice(0, 6));
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectShow = (id: number) => {
    navigate(`/movie/${id}`);
    onClose();
    setSearchTerm('');
  };

  return (
    <div
      className="custom-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(5, 6, 26, 0.95)',
        zIndex: 99999,
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-100 d-flex flex-column align-items-center justify-content-center">
        <button
          type="button"
          className="search-close-switch bg-transparent border-0 text-white"
          onClick={onClose}
          style={{
            cursor: 'pointer',
            position: 'absolute',
            top: '30px',
            right: '30px',
            fontSize: '32px'
          }}
        >
          <i className="icon_close"></i>
        </button>

        <div style={{ width: '100%', maxWidth: '650px' }}>
          <div className="text-center mb-3">
            <span
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#fff',
                fontFamily: '"Oswald", sans-serif'
              }}
            >
              ZYNE<span style={{ color: '#e53637' }}>MA</span> SEARCH
            </span>
            <p className="text-muted small">Search thousands of movies & series from TVMaze</p>
          </div>

          <form className="search-model-form mb-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              id="search-input"
              placeholder="Search movie or series title (e.g. Breaking Bad, Thrones)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '2px solid #e53637',
                color: '#ffffff',
                fontSize: '22px',
                padding: '12px 0',
                outline: 'none',
                textAlign: 'center'
              }}
            />
          </form>

          {isLoading && (
            <div className="text-center py-4 text-white">
              <div className="spinner-border text-danger mb-2" role="status" style={{ width: '2rem', height: '2rem' }}>
                <span className="sr-only">กำลังค้นหา...</span>
              </div>
              <div className="small text-muted d-flex align-items-center justify-content-center">
                <span className="spinner-grow spinner-grow-sm text-warning mr-2" style={{ width: '6px', height: '6px' }}></span>
                กำลังค้นหาในฐานข้อมูลภาพยนตร์ TVMaze...
              </div>
            </div>
          )}

          {/* Search results dropdown list */}
          {results.length > 0 && (
            <div
              className="search-results bg-dark rounded p-3 shadow-lg"
              style={{
                maxHeight: '380px',
                overflowY: 'auto',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <h6 className="text-muted text-uppercase mb-3 small">TVMaze Results ({results.length})</h6>
              {results.map((show) => {
                const poster = show.image?.medium || show.image?.original || '/img/trending/trend-1.jpg';
                return (
                  <div
                    key={show.id}
                    onClick={() => handleSelectShow(show.id)}
                    className="d-flex align-items-center p-2 rounded mb-2 search-item"
                    style={{
                      cursor: 'pointer',
                      background: 'rgba(255,255,255,0.04)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <img
                      src={poster}
                      alt={show.name}
                      style={{
                        width: '45px',
                        height: '62px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        marginRight: '14px'
                      }}
                    />
                    <div className="flex-grow-1">
                      <div className="text-white font-weight-bold d-flex align-items-center">
                        {show.name}
                        {show.isPremiumOnly && (
                          <span className="badge badge-warning text-dark ml-2" style={{ fontSize: '9px' }}>
                            👑 VIP
                          </span>
                        )}
                      </div>
                      <div className="text-danger small">
                        {show.genres.join(', ') || 'Series'} &bull; ★ {show.rating.average || '7.5'}
                      </div>
                      <div className="text-muted small">
                        {show.network?.name || 'TV Stream'} ({show.premiered ? show.premiered.split('-')[0] : 'N/A'})
                      </div>
                    </div>
                    <span className="arrow_right text-muted mr-2"></span>
                  </div>
                );
              })}
            </div>
          )}

          {searchTerm.trim() !== '' && !isLoading && results.length === 0 && (
            <p className="text-center text-muted">No titles found matching "{searchTerm}"</p>
          )}
        </div>
      </div>
    </div>
  );
};
