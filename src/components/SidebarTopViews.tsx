import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TOP_RATED_SHOWS = {
  day: [
    { id: 82, title: 'Game of Thrones', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/190/476117.jpg', rating: '9.3', isPremium: true },
    { id: 169, title: 'Breaking Bad', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2400.jpg', rating: '9.5', isPremium: true },
    { id: 2993, title: 'Stranger Things', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/394/986161.jpg', rating: '8.8', isPremium: false },
    { id: 17861, title: 'Westworld', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/439/1099447.jpg', rating: '8.4', isPremium: true },
    { id: 305, title: 'Black Mirror', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/465/1164936.jpg', rating: '8.8', isPremium: false }
  ],
  week: [
    { id: 169, title: 'Breaking Bad', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2400.jpg', rating: '9.5', isPremium: true },
    { id: 82, title: 'Game of Thrones', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/190/476117.jpg', rating: '9.3', isPremium: true },
    { id: 305, title: 'Black Mirror', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/465/1164936.jpg', rating: '8.8', isPremium: false },
    { id: 431, title: 'Friends', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/41/104550.jpg', rating: '8.9', isPremium: false },
    { id: 2993, title: 'Stranger Things', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/394/986161.jpg', rating: '8.8', isPremium: false }
  ],
  month: [
    { id: 82, title: 'Game of Thrones', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/190/476117.jpg', rating: '9.3', isPremium: true },
    { id: 431, title: 'Friends', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/41/104550.jpg', rating: '8.9', isPremium: false },
    { id: 169, title: 'Breaking Bad', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2400.jpg', rating: '9.5', isPremium: true },
    { id: 17861, title: 'Westworld', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/439/1099447.jpg', rating: '8.4', isPremium: true },
    { id: 2993, title: 'Stranger Things', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/394/986161.jpg', rating: '8.8', isPremium: false }
  ],
  years: [
    { id: 169, title: 'Breaking Bad', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2400.jpg', rating: '9.5', isPremium: true },
    { id: 82, title: 'Game of Thrones', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/190/476117.jpg', rating: '9.3', isPremium: true },
    { id: 431, title: 'Friends', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/41/104550.jpg', rating: '8.9', isPremium: false },
    { id: 305, title: 'Black Mirror', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/465/1164936.jpg', rating: '8.8', isPremium: false },
    { id: 17861, title: 'Westworld', image: 'https://static.tvmaze.com/uploads/images/medium_portrait/439/1099447.jpg', rating: '8.4', isPremium: true }
  ]
};

export const SidebarTopViews: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month' | 'years'>('day');
  const items = TOP_RATED_SHOWS[activeTab];

  return (
    <div className="product__sidebar__view">
      <div className="section-title">
        <h5>Top Rated Shows</h5>
      </div>
      <ul className="filter__controls mb-4">
        {(['day', 'week', 'month', 'years'] as const).map((tab) => (
          <li
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
            style={{ cursor: 'pointer', textTransform: 'capitalize' }}
          >
            {tab}
          </li>
        ))}
      </ul>
      <div className="filter__gallery">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="product__sidebar__view__item set-bg mb-3"
            style={{
              backgroundImage: `url(${item.image})`,
              borderRadius: '6px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              className="ep"
              style={{
                background: item.isPremium ? 'linear-gradient(90deg, #f39c12, #e53637)' : '#1d1e39',
                color: item.isPremium ? '#fff' : '#00d2d3'
              }}
            >
              {item.isPremium ? '👑 VIP' : 'FREE'}
            </div>
            <div className="view">
              <i className="fa fa-star text-warning"></i> {item.rating}
            </div>
            <h5>
              <Link to={`/movie/${item.id}`}>{item.title}</Link>
            </h5>
          </div>
        ))}
      </div>
    </div>
  );
};
