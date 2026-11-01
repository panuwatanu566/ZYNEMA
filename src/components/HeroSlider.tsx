import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FALLBACK_SHOWS } from '../services/tvmazeApi';

const FEATURED_SLIDES = [
  {
    id: 82, // Game of Thrones
    title: 'Game of Thrones',
    genres: 'Drama / Fantasy / Adventure',
    network: 'HBO Max',
    rating: '9.3',
    quality: '4K Ultra HD',
    isPremium: true,
    description: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia in the freezing North.',
    image: 'https://static.tvmaze.com/uploads/images/original_untouched/190/476117.jpg'
  },
  {
    id: 169, // Breaking Bad
    title: 'Breaking Bad',
    genres: 'Crime / Drama / Thriller',
    network: 'AMC',
    rating: '9.5',
    quality: '4K Ultra HD',
    isPremium: true,
    description: 'A chemistry teacher diagnosed with terminal lung cancer teams up with a former student to manufacture crystal meth to secure his family’s future.',
    image: 'https://static.tvmaze.com/uploads/images/original_untouched/0/2400.jpg'
  },
  {
    id: 2993, // Stranger Things
    title: 'Stranger Things',
    genres: 'Sci-Fi / Horror / Mystery',
    network: 'Netflix',
    rating: '8.8',
    quality: '1080p Full HD',
    isPremium: false,
    description: 'When a young boy vanishes, a small Indiana town uncovers a mystery involving secret government experiments, supernatural creatures and an enigmatic girl.',
    image: 'https://static.tvmaze.com/uploads/images/original_untouched/394/986161.jpg'
  }
];

export const HeroSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEATURED_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? FEATURED_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % FEATURED_SLIDES.length);
  };

  const slide = FEATURED_SLIDES[currentIndex];

  return (
    <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="container">
        <div
          className="hero__items set-bg"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(7, 8, 20, 0.96) 20%, rgba(7, 8, 20, 0.75) 55%, rgba(7, 8, 20, 0.25) 100%), url(${slide.image})`,
            backgroundPosition: 'center top',
            transition: 'background-image 0.6s ease-in-out',
            borderRadius: '20px',
            position: 'relative',
            minHeight: '460px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.7)'
          }}
        >
          <div className="row h-100 align-items-center">
            <div className="col-lg-7 col-md-10">
              <div className="hero__text p-4 p-md-5">
                <div className="d-flex align-items-center mb-3 flex-wrap" style={{ gap: '8px' }}>
                  <div
                    className="badge badge-dark px-3 py-1 font-weight-bold"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '9999px', fontSize: '11px' }}
                  >
                    {slide.genres}
                  </div>
                  {slide.isPremium ? (
                    <span className="badge badge-warning text-dark font-weight-bold px-3 py-1" style={{ borderRadius: '9999px', fontSize: '11px' }}>
                      👑 4K VIP EXCLUSIVE
                    </span>
                  ) : (
                    <span className="badge badge-info font-weight-bold px-3 py-1" style={{ borderRadius: '9999px', fontSize: '11px' }}>
                      FREE HD 720P
                    </span>
                  )}
                  <span
                    className="badge badge-secondary px-3 py-1 font-weight-bold"
                    style={{ borderRadius: '9999px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px' }}
                  >
                    ★ {slide.rating}
                  </span>
                </div>

                <h2>{slide.title}</h2>
                <p className="text-white-50">{slide.description}</p>

                <div className="d-flex align-items-center flex-wrap" style={{ gap: '15px' }}>
                  <Link to={`/watch/${slide.id}`} className="primary-btn">
                    <span>Watch Now</span> <i className="fa fa-play ml-2"></i>
                  </Link>
                  <Link
                    to={`/movie/${slide.id}`}
                    className="btn d-inline-flex align-items-center"
                    style={{
                      borderRadius: '9999px',
                      fontSize: '14px',
                      fontWeight: 600,
                      padding: '12px 24px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(8px)',
                      color: '#fff',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    Details <i className="fa fa-info-circle ml-2"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Slider Navigation Arrows */}
          <div
            className="slider-nav"
            style={{
              position: 'absolute',
              right: '30px',
              bottom: '30px',
              display: 'flex',
              gap: '10px',
              zIndex: 10
            }}
          >
            <button
              type="button"
              onClick={handlePrev}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(7, 8, 20, 0.65)',
                border: '1px solid rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                transition: 'all 0.2s ease'
              }}
              title="Previous Title"
            >
              <span className="arrow_carrot-left"></span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(7, 8, 20, 0.65)',
                border: '1px solid rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                transition: 'all 0.2s ease'
              }}
              title="Next Title"
            >
              <span className="arrow_carrot-right"></span>
            </button>
          </div>

          {/* Dots */}
          <div
            style={{
              position: 'absolute',
              bottom: '15px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px'
            }}
          >
            {FEATURED_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: idx === currentIndex ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: idx === currentIndex ? '#e53637' : 'rgba(255,255,255,0.4)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
