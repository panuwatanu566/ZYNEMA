import React from 'react';
import { Link } from 'react-router-dom';
import { Anime } from '../types/anime';

interface AnimeCardProps {
  anime: Anime;
  columnClass?: string;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ 
  anime, 
  columnClass = 'col-lg-4 col-md-6 col-sm-6' 
}) => {
  return (
    <div className={columnClass}>
      <div className="product__item">
        <Link to={`/anime/${anime.id}`}>
          <div
            className="product__item__pic set-bg"
            style={{
              backgroundImage: `url(${anime.image})`,
              position: 'relative'
            }}
          >
            <div className="ep">{anime.episodes}</div>
            <div className="comment">
              <i className="fa fa-comments"></i> {anime.commentsCount}
            </div>
            <div className="view">
              <i className="fa fa-eye"></i> {typeof anime.viewsCount === 'number' ? anime.viewsCount.toLocaleString() : anime.viewsCount}
            </div>
          </div>
        </Link>
        <div className="product__item__text">
          <ul>
            {anime.genres.slice(0, 2).map((genre, idx) => (
              <li key={idx}>{genre}</li>
            ))}
          </ul>
          <h5>
            <Link to={`/anime/${anime.id}`}>{anime.title}</Link>
          </h5>
        </div>
      </div>
    </div>
  );
};
