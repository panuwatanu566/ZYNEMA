import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { fetchShowById, fetchShowCast, fetchShowEpisodes, cleanSummary } from '../services/tvmazeApi';
import { TVMazeShow, TVMazeCast, Review } from '../types/zynema';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [show, setShow] = useState<TVMazeShow | null>(null);
  const [cast, setCast] = useState<TVMazeCast[]>([]);
  const [episodeCount, setEpisodeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);

  const { isPremium, user, openUpgradeModal } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'rev-1',
      userName: 'Alex Miller',
      userAvatar: '/img/anime/review-1.jpg',
      userTier: 'premium',
      timeAgo: '2 hours ago',
      comment: 'The cinematography in this series is unbelievable! Easily one of the top productions on TVMaze.',
      rating: 5
    },
    {
      id: 'rev-2',
      userName: 'Sarah Jenkins',
      userAvatar: '/img/anime/review-2.jpg',
      userTier: 'free',
      timeAgo: 'Yesterday',
      comment: 'Loved the plot twists in the first few episodes. Planning to upgrade to Premium to binge the rest!',
      rating: 4
    }
  ]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!id) return;
    const loadDetails = async () => {
      setLoading(true);
      try {
        const [showData, castData, eps] = await Promise.all([
          fetchShowById(id),
          fetchShowCast(id),
          fetchShowEpisodes(id)
        ]);
        setShow(showData);
        setCast(castData);
        setEpisodeCount(eps.length);
      } catch (err) {
        console.error('Failed to load movie details', err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      userName: user ? user.name : 'Movie Enthusiast (Guest)',
      userAvatar: '/img/anime/review-1.jpg',
      userTier: user ? user.tier : 'free',
      timeAgo: 'Just now',
      comment: newComment.trim(),
      rating: 5
    };

    setReviews([newRev, ...reviews]);
    setNewComment('');
  };

  if (loading) {
    return (
      <div className="container py-5">
        <LoadingSpinner
          message="กำลังโหลดข้อมูลภาพยนตร์ เรื่องย่อ และรายชื่อนักแสดงจาก TVMaze..."
          minHeight="65vh"
        />
      </div>
    );
  }

  if (!show) {
    return (
      <div className="container py-5 text-center text-white" style={{ minHeight: '50vh' }}>
        <h3>Title Not Found</h3>
        <Link to="/movies" className="btn btn-danger mt-3">Back to Catalog</Link>
      </div>
    );
  }

  const poster = show.image?.original || show.image?.medium || '/img/trending/trend-1.jpg';
  const ratingVal = show.rating.average ? show.rating.average.toFixed(1) : '8.2';
  const summaryText = cleanSummary(show.summary);

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Browse Shows', to: '/movies' },
          { label: show.genres[0] || 'Drama', to: `/movies?genre=${show.genres[0] || 'Drama'}` },
          { label: show.name }
        ]}
      />

      <section className="anime-details spad">
        <div className="container">
          <div className="anime__details__content">
            <div className="row">
              <div className="col-lg-3">
                <div
                  className="anime__details__pic set-bg"
                  style={{
                    backgroundImage: `url(${poster})`,
                    borderRadius: '8px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {show.isPremiumOnly ? (
                    <div
                      className="ep"
                      style={{
                        background: 'linear-gradient(90deg, #f39c12, #e53637)',
                        color: '#fff',
                        fontWeight: 'bold'
                      }}
                    >
                      👑 4K VIP
                    </div>
                  ) : (
                    <div className="ep" style={{ background: '#1d1e39', color: '#00d2d3' }}>
                      FREE HD
                    </div>
                  )}
                  <div className="comment">
                    <i className="fa fa-star text-warning"></i> {ratingVal}
                  </div>
                  <div className="view">
                    <i className="fa fa-film"></i> {episodeCount} Eps
                  </div>
                </div>
              </div>

              <div className="col-lg-9">
                <div className="anime__details__text">
                  <div className="anime__details__title">
                    <h3>{show.name}</h3>
                    <span>{show.network?.name || show.webChannel?.name || 'Streaming Exclusive'} &bull; {show.language}</span>
                  </div>

                  <div className="anime__details__rating">
                    <div className="rating">
                      <i className="fa fa-star text-warning"></i>{' '}
                      <i className="fa fa-star text-warning"></i>{' '}
                      <i className="fa fa-star text-warning"></i>{' '}
                      <i className="fa fa-star text-warning"></i>{' '}
                      <i className="fa fa-star-half-o text-warning"></i>
                    </div>
                    <span>★ {ratingVal} / 10 on TVMaze</span>
                  </div>

                  <p>{summaryText}</p>

                  <div className="anime__details__widget">
                    <div className="row">
                      <div className="col-lg-6 col-md-6">
                        <ul>
                          <li><span>Type:</span> {show.type || 'Scripted'}</li>
                          <li><span>Network:</span> {show.network?.name || show.webChannel?.name || 'VOD'}</li>
                          <li><span>Premiered:</span> {show.premiered || 'N/A'}</li>
                          <li><span>Status:</span> {show.status}</li>
                          <li><span>Genres:</span> {show.genres.join(', ') || 'Drama'}</li>
                        </ul>
                      </div>
                      <div className="col-lg-6 col-md-6">
                        <ul>
                          <li><span>Runtime:</span> {show.runtime || show.averageRuntime || 60} mins/ep</li>
                          <li><span>Episodes:</span> {episodeCount} episodes</li>
                          <li><span>Quality:</span> {show.isPremiumOnly ? '4K Ultra HD & HDR' : '1080p / 720p HD'}</li>
                          <li><span>Tier Access:</span> {isPremium ? '👑 VIP (Full Movie 4K)' : 'Free (Trailer Only)'}</li>
                          <li>
                            <span>Official Site:</span>{' '}
                            {show.officialSite ? (
                              <a href={show.officialSite} target="_blank" rel="noreferrer" className="text-danger">
                                Visit Site <i className="fa fa-external-link"></i>
                              </a>
                            ) : 'Available on ZYNEMA'}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="anime__details__btn d-flex flex-wrap align-items-center" style={{ gap: '12px' }}>
                    <Link to={`/watch/${show.id}`} className="watch-btn">
                      <span>{isPremium ? 'Watch Full Movie 4K' : 'Watch Trailer (Free)'}</span> <i className="fa fa-play"></i>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setInWatchlist(!inWatchlist)}
                      className={`btn ${inWatchlist ? 'btn-danger' : 'btn-outline-light'} py-2 px-3`}
                      style={{ borderRadius: '4px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}
                    >
                      <i className={`fa ${inWatchlist ? 'fa-check' : 'fa-bookmark-o'} mr-2`}></i>
                      {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                    </button>

                    {show.isPremiumOnly && !isPremium && (
                      <button
                        type="button"
                        onClick={openUpgradeModal}
                        className="btn btn-warning font-weight-bold py-2 px-3 text-dark"
                        style={{ borderRadius: '4px', fontSize: '13px' }}
                      >
                        <i className="fa fa-crown mr-1"></i> Unlock 4K Ultra HD
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cast Section */}
          {cast.length > 0 && (
            <div className="mb-5">
              <div className="section-title">
                <h5>Featured Cast & Characters</h5>
              </div>
              <div className="row">
                {cast.map((item, idx) => (
                  <div key={idx} className="col-lg-3 col-md-4 col-sm-6 mb-3">
                    <div
                      className="d-flex align-items-center p-2 rounded"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <img
                        src={item.person.image?.medium || '/img/anime/review-1.jpg'}
                        alt={item.person.name}
                        style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', marginRight: '12px' }}
                      />
                      <div>
                        <div className="text-white font-weight-bold small">{item.person.name}</div>
                        <div className="text-danger small">{item.character.name}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews & Discussion Section */}
          <div className="row">
            <div className="col-lg-8">
              <div className="anime__details__review">
                <div className="section-title">
                  <h5>Community Reviews ({reviews.length})</h5>
                </div>
                {reviews.map((rev) => (
                  <div key={rev.id} className="anime__review__item">
                    <div className="anime__review__item__pic">
                      <img src={rev.userAvatar} alt={rev.userName} />
                    </div>
                    <div className="anime__review__item__text">
                      <h6>
                        {rev.userName}{' '}
                        {rev.userTier === 'premium' && (
                          <span className="badge badge-warning text-dark ml-1" style={{ fontSize: '10px' }}>
                            👑 VIP
                          </span>
                        )}
                        {' '}- <span>{rev.timeAgo}</span>
                      </h6>
                      <p>{rev.comment}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Review Form */}
              <div className="anime__details__form">
                <div className="section-title">
                  <h5>Leave a Review</h5>
                </div>
                <form onSubmit={handleAddReview}>
                  <textarea
                    placeholder="Share your thoughts about this movie or show..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={4}
                    required
                  ></textarea>
                  <button type="submit">
                    <i className="fa fa-location-arrow mr-1"></i> Post Review
                  </button>
                </form>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="anime__details__sidebar">
                <div className="section-title">
                  <h5>Streaming Specifications</h5>
                </div>
                <div
                  className="p-4 rounded text-white mb-4"
                  style={{ background: '#0e1035', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="mb-3">
                    <strong className="text-danger">Audio:</strong> 5.1 Surround, Dolby Atmos
                  </div>
                  <div className="mb-3">
                    <strong className="text-danger">Resolution:</strong> 4K UHD, 1080p FHD, 720p HD
                  </div>
                  <div className="mb-3">
                    <strong className="text-danger">Subtitles:</strong> English [CC], Thai, Spanish
                  </div>
                  <div className="mb-0">
                    <strong className="text-danger">Content Advisory:</strong> Mature Themes, Violence
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
