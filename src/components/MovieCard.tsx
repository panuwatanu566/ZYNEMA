import React from 'react';
import { Link } from 'react-router-dom';
import { TVMazeShow } from '../types/zynema';

interface MovieCardProps {
  show: TVMazeShow;
  columnClass?: string;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  show,
  columnClass = 'col-lg-4 col-md-6 col-sm-6'
}) => {
  const posterUrl = show.image?.original || show.image?.medium || '/img/trending/trend-1.jpg';
  const rating = show.rating.average ? show.rating.average.toFixed(1) : '8.0';
  const year = show.premiered ? show.premiered.split('-')[0] : '2024';

  return (
    <div className={`${columnClass} mb-4`}>
      <div className="product__item">
        <Link to={`/movie/${show.id}`} className="d-block position-relative">
          <div
            className="product__item__pic set-bg"
            style={{
              backgroundImage: `url(${posterUrl})`,
              position: 'relative',
              borderRadius: '12px 12px 0 0',
              overflow: 'hidden'
            }}
          >
            {/* Tier Badge */}
            {show.isPremiumOnly ? (
              <div
                className="ep"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                  color: '#0f172a',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
                }}
              >
                👑 4K VIP
              </div>
            ) : (
              <div
                className="ep"
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                  color: '#ffffff',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
                }}
              >
                FREE HD
              </div>
            )}

            {/* Rating */}
            <div className="comment">
              <i className="fa fa-star text-warning mr-1"></i> {rating}
            </div>

            {/* Year / Runtime */}
            <div className="view">
              <i className="fa fa-calendar-o mr-1"></i> {year}
            </div>
          </div>
        </Link>

        <div className="product__item__text">
          <ul>
            {show.genres.slice(0, 2).map((genre, idx) => (
              <li key={idx}>{genre}</li>
            ))}
            {show.network?.name && <li>{show.network.name}</li>}
          </ul>
          <h5>
            <Link to={`/movie/${show.id}`}>{show.name}</Link>
          </h5>
        </div>
      </div>
    </div>
  );
};
