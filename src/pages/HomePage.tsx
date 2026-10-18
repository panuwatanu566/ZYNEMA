import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeroSlider } from '../components/HeroSlider';
import { MovieCard } from '../components/MovieCard';
import { SidebarTopViews } from '../components/SidebarTopViews';
import { SidebarNewComment } from '../components/SidebarNewComment';
import { fetchShows, FALLBACK_SHOWS } from '../services/tvmazeApi';
import { TVMazeShow } from '../types/zynema';
import { LoadingSpinner, MovieGridSkeleton } from '../components/LoadingSpinner';

export const HomePage: React.FC = () => {
  const [shows, setShows] = useState<TVMazeShow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShows = async () => {
      try {
        const data = await fetchShows(0);
        if (data && data.length > 0) {
          setShows(data);
        } else {
          setShows(FALLBACK_SHOWS);
        }
      } catch (err) {
        console.error('Failed to load shows from TVMaze', err);
        setShows(FALLBACK_SHOWS);
      } finally {
        setLoading(false);
      }
    };
    loadShows();
  }, []);

  // Filter shows by categories
  const trendingShows = shows.slice(0, 6);
  const premiumExclusiveShows = shows.filter(s => s.isPremiumOnly).slice(0, 6);
  const freeStreamShows = shows.filter(s => !s.isPremiumOnly).slice(0, 6);
  const popularDrama = shows.filter(s => s.genres.includes('Drama')).slice(0, 6);

  return (
    <>
      <HeroSlider />

      <section className="product spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {loading ? (
                <div className="py-4">
                  <LoadingSpinner
                    message="กำลังดึงข้อมูลภาพยนตร์และซีรีส์ล่าสุดจาก TVMaze API..."
                    minHeight="220px"
                  />
                  <div className="mt-4">
                    <h5 className="text-white-50 small text-uppercase mb-3">กำลังเตรียมแคตตาล็อก...</h5>
                    <MovieGridSkeleton count={6} />
                  </div>
                </div>
              ) : (
                <>
                  {/* Trending Now */}
                  <div className="trending__product mb-5">
                <div className="row align-items-center mb-3">
                  <div className="col-lg-8 col-md-8 col-sm-8">
                    <div className="section-title">
                      <h4>Trending Shows & Series</h4>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4 col-sm-4 text-sm-right">
                    <div className="btn__all">
                      <Link to="/movies" className="primary-btn">
                        View All <span className="arrow_right"></span>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="row">
                  {trendingShows.map((show) => (
                    <MovieCard key={show.id} show={show} />
                  ))}
                </div>
              </div>

              {/* Premium 4K VIP Exclusives */}
              <div className="popular__product mb-5">
                <div className="row align-items-center mb-3">
                  <div className="col-lg-8 col-md-8 col-sm-8">
                    <div className="section-title">
                      <h4>👑 Premium 4K VIP Exclusives</h4>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4 col-sm-4 text-sm-right">
                    <div className="btn__all">
                      <Link to="/movies?tier=premium" className="primary-btn text-warning">
                        VIP Only <span className="arrow_right"></span>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="row">
                  {premiumExclusiveShows.map((show) => (
                    <MovieCard key={show.id} show={show} />
                  ))}
                </div>
              </div>

              {/* Free To Watch (720p) */}
              <div className="recent__product mb-5">
                <div className="row align-items-center mb-3">
                  <div className="col-lg-8 col-md-8 col-sm-8">
                    <div className="section-title">
                      <h4>Free To Stream (HD)</h4>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4 col-sm-4 text-sm-right">
                    <div className="btn__all">
                      <Link to="/movies?tier=free" className="primary-btn">
                        View All <span className="arrow_right"></span>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="row">
                  {freeStreamShows.map((show) => (
                    <MovieCard key={show.id} show={show} />
                  ))}
                </div>
              </div>

              {/* Popular Drama & Crime */}
              <div className="live__product">
                <div className="row align-items-center mb-3">
                  <div className="col-lg-8 col-md-8 col-sm-8">
                    <div className="section-title">
                      <h4>Top Rated Dramas</h4>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4 col-sm-4 text-sm-right">
                    <div className="btn__all">
                      <Link to="/movies?genre=Drama" className="primary-btn">
                        View All <span className="arrow_right"></span>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="row">
                  {popularDrama.map((show) => (
                    <MovieCard key={show.id} show={show} />
                  ))}
                </div>
              </div>
            </>
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
