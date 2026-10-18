import React from 'react';
import { Link } from 'react-router-dom';

const NEW_COMMENTS = [
  {
    id: 'trend-1',
    title: 'The Seven Deadly Sins: Wrath of the Gods',
    image: '/img/sidebar/comment-1.jpg',
    genres: ['Active', 'Movie'],
    views: '19,141 Views'
  },
  {
    id: 'pop-1',
    title: 'Shirobako The Movie Special',
    image: '/img/sidebar/comment-2.jpg',
    genres: ['Active', 'Movie'],
    views: '15,320 Views'
  },
  {
    id: 'trend-3',
    title: 'Kizumonogatari III: Reiketsu-hen',
    image: '/img/sidebar/comment-3.jpg',
    genres: ['Active', 'Movie'],
    views: '12,980 Views'
  },
  {
    id: 'fate-stay-night',
    title: 'Monogatari Series: Second Season',
    image: '/img/sidebar/comment-4.jpg',
    genres: ['Active', 'Movie'],
    views: '10,410 Views'
  }
];

export const SidebarNewComment: React.FC = () => {
  return (
    <div className="product__sidebar__comment">
      <div className="section-title">
        <h5>New Comment</h5>
      </div>
      {NEW_COMMENTS.map((item, idx) => (
        <div key={idx} className="product__sidebar__comment__item">
          <div className="product__sidebar__comment__item__pic">
            <img src={item.image} alt={item.title} />
          </div>
          <div className="product__sidebar__comment__item__text">
            <ul>
              {item.genres.map((g, gIdx) => (
                <li key={gIdx}>{g}</li>
              ))}
            </ul>
            <h5>
              <Link to={`/anime/${item.id}`}>{item.title}</Link>
            </h5>
            <span>
              <i className="fa fa-eye"></i> {item.views}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
