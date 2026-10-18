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
        <Link to={`/movie/${show.id}`}>
          <div
            className="product__item__pic set-bg"
            style={{
              backgroundImage: `url(${posterUrl})`,
              position: 'relative',
              borderRadius: '6px',
              overflow: 'hidden'
            }}
          >
            {/* Tier Badge */}
            {show.isPremiumOnly ? (
              <div
                className="ep"
                style={{
                  background: 'linear-gradient(90deg, #f39c12, #e53637)',
                  color: '#fff',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                }}
              >
                👑 PREMIUM
              </div>
            ) : (
              <div className="ep" style={{ background: '#1d1e39', color: '#00d2d3' }}>
                FREE 720P
              </div>
            )}

            {/* Rating */}
            <div className="comment" style={{ background: 'rgba(0,0,0,0.7)' }}>
              <i className="fa fa-star text-warning"></i> {rating}
            </div>

            {/* Year / Runtime */}
            <div className="view" style={{ background: 'rgba(0,0,0,0.7)' }}>
              <i className="fa fa-clock-o"></i> {year}
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
