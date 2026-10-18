import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { ALL_ANIME, INITIAL_REVIEWS } from '../data/animeData';
import { Review } from '../types/anime';

export const AnimeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const anime = ALL_ANIME.find(a => a.id === id) || ALL_ANIME[0];
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [newComment, setNewComment] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      userName: 'Anime Fan (You)',
      userAvatar: '/img/anime/review-1.jpg',
      timeAgo: 'Just now',
      comment: newComment.trim()
    };

    setReviews([newRev, ...reviews]);
    setNewComment('');
  };

  const recommendations = ALL_ANIME.filter(a => a.id !== anime.id).slice(0, 4);

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Categories', to: '/categories' },
          { label: anime.genres[0] || 'Anime', to: '/categories' },
          { label: anime.title }
        ]}
      />

      <section className="anime-details spad">
        <div className="container">
          <div className="anime__details__content">
            <div className="row">
              <div className="col-lg-3">
                <div
                  className="anime__details__pic set-bg"
                  style={{ backgroundImage: `url(${anime.image})` }}
                >
                  <div className="comment">
                    <i className="fa fa-comments"></i> {anime.commentsCount}
                  </div>
                  <div className="view">
                    <i className="fa fa-eye"></i> {typeof anime.viewsCount === 'number' ? anime.viewsCount.toLocaleString() : anime.viewsCount}
                  </div>
                </div>
              </div>

              <div className="col-lg-9">
                <div className="anime__details__text">
                  <div className="anime__details__title">
                    <h3>{anime.title}</h3>
                    <span>{anime.japaneseTitle || 'Japanese Title Unknown'}</span>
                  </div>
                  <div className="anime__details__rating">
                    <div className="rating">
                      <i className="fa fa-star text-warning"></i>{' '}
                      <i className="fa fa-star text-warning"></i>{' '}
                      <i className="fa fa-star text-warning"></i>{' '}
                      <i className="fa fa-star text-warning"></i>{' '}
                      <i className="fa fa-star-half-o text-warning"></i>
                    </div>
                    <span>{anime.votes || '1,029 Votes'}</span>
                  </div>
                  <p>{anime.description}</p>

                  <div className="anime__details__widget">
                    <div className="row">
                      <div className="col-lg-6 col-md-6">
                        <ul>
                          <li><span>Type:</span> {anime.type || 'TV Series'}</li>
                          <li><span>Studios:</span> {anime.studios || 'Lerche'}</li>
                          <li><span>Date aired:</span> {anime.dateAired || 'Oct 02, 2019'}</li>
                          <li><span>Status:</span> {anime.status || 'Completed'}</li>
                          <li><span>Genre:</span> {anime.genres.join(', ')}</li>
                        </ul>
                      </div>
                      <div className="col-lg-6 col-md-6">
                        <ul>
                          <li><span>Scores:</span> {anime.scores || '7.31 / 1,515'}</li>
                          <li><span>Rating:</span> {anime.rating || '8.5'} / 10</li>
                          <li><span>Duration:</span> {anime.duration || '24 min/ep'}</li>
                          <li><span>Quality:</span> {anime.quality || 'HD'}</li>
                          <li><span>Views:</span> {typeof anime.viewsCount === 'number' ? anime.viewsCount.toLocaleString() : anime.viewsCount}</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="anime__details__btn">
                    <button
                      type="button"
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`follow-btn border-0 mr-3 ${isFollowing ? 'bg-danger text-white' : ''}`}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <i className={`fa ${isFollowing ? 'fa-heart' : 'fa-heart-o'}`}></i>{' '}
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <Link to={`/watch/${anime.id}`} className="watch-btn">
                      <span>Watch Now</span> <i className="fa fa-angle-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-8 col-md-8">
              {/* Reviews List */}
              <div className="anime__details__review">
                <div className="section-title">
                  <h5>Reviews ({reviews.length})</h5>
                </div>
                {reviews.map((rev) => (
                  <div key={rev.id} className="anime__review__item">
                    <div className="anime__review__item__pic">
                      <img src={rev.userAvatar} alt={rev.userName} />
                    </div>
                    <div className="anime__review__item__text">
                      <h6>
                        {rev.userName} - <span>{rev.timeAgo}</span>
                      </h6>
                      <p>{rev.comment}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Review Submission Form */}
              <div className="anime__details__form">
                <div className="section-title">
                  <h5>Your Comment</h5>
                </div>
                <form onSubmit={handleAddReview}>
                  <textarea
                    placeholder="Write your review here..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={4}
                    required
                  ></textarea>
                  <button type="submit">
                    <i className="fa fa-location-arrow"></i> Review
                  </button>
                </form>
              </div>
            </div>

            {/* Recommendations Sidebar */}
            <div className="col-lg-4 col-md-4">
              <div className="anime__details__sidebar">
                <div className="section-title">
                  <h5>You Might Like...</h5>
                </div>
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="product__sidebar__view__item set-bg mb-3"
                    style={{ backgroundImage: `url(${rec.image})`, borderRadius: '4px' }}
                  >
                    <div className="ep">{rec.episodes}</div>
                    <div className="view">
                      <i className="fa fa-eye"></i> {rec.viewsCount}
                    </div>
                    <h5>
                      <Link to={`/anime/${rec.id}`}>{rec.title}</Link>
                    </h5>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
