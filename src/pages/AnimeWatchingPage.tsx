import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { ALL_ANIME, INITIAL_REVIEWS } from '../data/animeData';
import { Review } from '../types/anime';

export const AnimeWatchingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const anime = ALL_ANIME.find(a => a.id === id) || ALL_ANIME[0];
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [newComment, setNewComment] = useState('');

  const totalEpisodes = 20;

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      userName: 'Anime Watcher (You)',
      userAvatar: '/img/anime/review-2.jpg',
      timeAgo: 'Just now',
      comment: newComment.trim()
    };

    setReviews([newRev, ...reviews]);
    setNewComment('');
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Categories', to: '/categories' },
          { label: anime.title, to: `/anime/${anime.id}` },
          { label: `Watching Episode ${selectedEpisode.toString().padStart(2, '0')}` }
        ]}
      />

      <section className="anime-details spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="anime__video__player mb-4" style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <video
                  id="player"
                  playsInline
                  controls
                  poster="/videos/anime-watch.jpg"
                  style={{ width: '100%', maxHeight: '600px', backgroundColor: '#000', display: 'block' }}
                >
                  <source src="/videos/1.mp4" type="video/mp4" />
                  Your browser does not support HTML5 video.
                </video>
              </div>

              {/* Episode Selection Bar */}
              <div className="anime__details__episodes mb-5">
                <div className="section-title">
                  <h5>Episodes ({totalEpisodes})</h5>
                </div>
                <div className="d-flex flex-wrap" style={{ gap: '10px' }}>
                  {Array.from({ length: totalEpisodes }).map((_, index) => {
                    const epNum = index + 1;
                    const isActive = selectedEpisode === epNum;
                    return (
                      <button
                        key={epNum}
                        type="button"
                        onClick={() => setSelectedEpisode(epNum)}
                        className={`btn ${isActive ? 'btn-danger' : 'btn-dark'}`}
                        style={{
                          minWidth: '75px',
                          padding: '8px 16px',
                          fontWeight: 600,
                          borderRadius: '4px',
                          transition: 'all 0.2s',
                          border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        Ep {epNum < 10 ? `0${epNum}` : epNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-8">
              {/* Reviews list */}
              <div className="anime__details__review">
                <div className="section-title">
                  <h5>Community Discussion ({reviews.length})</h5>
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

              {/* Leave Comment */}
              <div className="anime__details__form">
                <div className="section-title">
                  <h5>Your Comment</h5>
                </div>
                <form onSubmit={handleAddReview}>
                  <textarea
                    placeholder="Discuss Episode..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={4}
                    required
                  ></textarea>
                  <button type="submit">
                    <i className="fa fa-location-arrow"></i> Submit
                  </button>
                </form>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="anime__details__sidebar">
                <div className="section-title">
                  <h5>Series Information</h5>
                </div>
                <div className="bg-dark p-4 rounded text-white mb-4" style={{ background: '#0b0c2a', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <h5 className="text-white mb-2">{anime.title}</h5>
                  <p className="small text-muted mb-3">{anime.description}</p>
                  <div className="small">
                    <p className="mb-1"><strong>Genres:</strong> {anime.genres.join(', ')}</p>
                    <p className="mb-1"><strong>Status:</strong> {anime.status || 'Finished'}</p>
                    <p className="mb-0"><strong>Current Episode:</strong> Episode {selectedEpisode}</p>
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
