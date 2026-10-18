import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { fetchShowById, fetchShowEpisodes, cleanSummary } from '../services/tvmazeApi';
import { TVMazeShow, TVMazeEpisode, Review } from '../types/zynema';
import { useAuth } from '../context/AuthContext';
import { PremiumModal } from '../components/PremiumModal';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Working Video Sources
const VIDEO_SOURCES = {
  // Free Tier Trailer Video Source
  trailer: 'https://media.w3.org/2010/05/sintel/trailer.mp4',

  // Premium Full Video Sources (Found from reliable public CDNs & local server)
  fullMovieServers: [
    { name: 'Server 1 (Local Fast Stream)', url: '/videos/1.mp4' },
    { name: 'Server 2 (Cloud CDN HD)', url: 'https://vjs.zencdn.net/v/oceans.mp4' },
    { name: 'Server 3 (Archive High-Res)', url: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4' }
  ]
};

export const MovieWatchingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [show, setShow] = useState<TVMazeShow | null>(null);
  const [episodes, setEpisodes] = useState<TVMazeEpisode[]>([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [selectedServerIndex, setSelectedServerIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'trailer' | 'full'>('trailer'); // 'trailer' for Free, can be 'full' for Premium
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const { user, isPremium, canWatchFullMovie, upgradeToPremium, downgradeToFree } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'rev-w1',
      userName: 'Marcus Vance',
      userAvatar: '/img/anime/review-1.jpg',
      userTier: 'premium',
      timeAgo: '15 mins ago',
      comment: 'The full movie video stream in 4K UHD is super smooth! VIP is definitely worth it.'
    },
    {
      id: 'rev-w2',
      userName: 'Elena Rostova',
      userAvatar: '/img/anime/review-2.jpg',
      userTier: 'free',
      timeAgo: '1 hour ago',
      comment: 'The official trailer looked incredible. Upgrading to Premium now to watch the full film!'
    }
  ]);
  const [newComment, setNewComment] = useState('');

  // Update view mode whenever user tier changes
  useEffect(() => {
    if (isPremium) {
      setViewMode('full'); // Premium defaults to Full Movie
    } else {
      setViewMode('trailer'); // Free defaults to Trailer Only
    }
  }, [isPremium]);

  useEffect(() => {
    if (!id) return;
    const loadMedia = async () => {
      setLoading(true);
      try {
        const [showData, epData] = await Promise.all([
          fetchShowById(id),
          fetchShowEpisodes(id)
        ]);
        setShow(showData);
        setEpisodes(epData);
      } catch (err) {
        console.error('Failed to load video episodes', err);
      } finally {
        setLoading(false);
      }
    };
    loadMedia();
  }, [id]);

  // Reload video element source whenever viewMode or server changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [viewMode, selectedServerIndex]);

  const currentEp = episodes[currentEpisodeIndex] || {
    id: 1,
    name: 'Official Feature Presentation',
    season: 1,
    number: 1,
    isPremium: false,
    summary: 'Streaming presentation.'
  };

  // Determine current active video URL
  const currentVideoUrl = isPremium && viewMode === 'full'
    ? VIDEO_SOURCES.fullMovieServers[selectedServerIndex].url
    : VIDEO_SOURCES.trailer;

  const handleSelectFullMovie = () => {
    if (!isPremium) {
      setUpgradeReason('สมาชิกสิทธิ์ Free ดูได้แค่ตัวอย่างหนังเท่านั้น กรุณาอัปเกรดเป็น VIP Premium เพื่อรับชมภาพยนตร์เต็มเรื่องในระบบ 4K Ultra HD!');
      setShowUpgradeModal(true);
    } else {
      setViewMode('full');
    }
  };

  const handleSelectEpisode = (index: number) => {
    if (!isPremium) {
      setUpgradeReason('สมาชิกสิทธิ์ Free ดูได้แค่ตัวอย่างหนังเท่านั้น หากต้องการดูแต่ละตอนฉบับเต็ม กรุณาอัปเกรดเป็น VIP Premium');
      setShowUpgradeModal(true);
    } else {
      setCurrentEpisodeIndex(index);
      setViewMode('full');
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setReviews([
      {
        id: `com-${Date.now()}`,
        userName: user ? user.name : 'Zynema Streamer (You)',
        userAvatar: '/img/anime/review-2.jpg',
        userTier: user ? user.tier : 'free',
        timeAgo: 'Just now',
        comment: newComment.trim()
      },
      ...reviews
    ]);
    setNewComment('');
  };

  if (loading) {
    return (
      <div className="container py-5">
        <LoadingSpinner
          message="กำลังเตรียมการสตรีมมิ่งและโหลดรายชื่อตอนจาก TVMaze..."
          minHeight="65vh"
        />
      </div>
    );
  }

  const showName = show ? show.name : 'Movie Stream';

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Browse Shows', to: '/movies' },
          { label: showName, to: `/movie/${id}` },
          { label: isPremium && viewMode === 'full' ? `ดูหนังเต็มเรื่อง (Full Movie)` : `ตัวอย่างหนัง (Official Trailer)` }
        ]}
      />

      <section className="anime-details spad pt-4">
        <div className="container">
          {/* Authorization Demo Mode Bar */}
          <div
            className="p-3 mb-4 rounded d-flex flex-wrap align-items-center justify-content-between"
            style={{
              background: 'linear-gradient(90deg, #151842, #0d0f2b)',
              border: isPremium ? '1px solid rgba(243, 156, 18, 0.4)' : '1px solid rgba(0, 210, 211, 0.4)'
            }}
          >
            <div className="d-flex align-items-center mb-2 mb-md-0">
              <span className="mr-2 text-white font-weight-bold">สถานะสิทธิ์สมาชิก:</span>
              <span
                className={`badge ${isPremium ? 'badge-warning text-dark font-weight-bold' : 'badge-info'} px-3 py-2 mr-3`}
                style={{ fontSize: '13px' }}
              >
                {isPremium ? '👑 สมาชิก VIP PREMIUM (ดูหนังเต็มเรื่องได้)' : '🎬 สมาชิก FREE (ดูได้เฉพาะตัวอย่างหนัง)'}
              </span>
            </div>

            <div className="d-flex" style={{ gap: '8px' }}>
              {!isPremium ? (
                <button
                  type="button"
                  onClick={upgradeToPremium}
                  className="btn btn-sm btn-warning font-weight-bold text-dark px-3"
                  style={{ borderRadius: '20px' }}
                >
                  <i className="fa fa-bolt mr-1"></i> สลับเป็นสิทธิ์ Premium (ดูหนังเต็มเรื่อง)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={downgradeToFree}
                  className="btn btn-sm btn-outline-info text-white px-3"
                  style={{ borderRadius: '20px' }}
                >
                  <i className="fa fa-lock mr-1"></i> สลับเป็นสิทธิ์ Free (ทดสอบดูได้แค่ตัวอย่าง)
                </button>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Media Player Box */}
              <div
                className="anime__video__player mb-3 position-relative"
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.7)',
                  background: '#000',
                  border: isPremium && viewMode === 'full' ? '2px solid rgba(243, 156, 18, 0.5)' : '2px solid rgba(229, 54, 55, 0.4)'
                }}
              >
                {/* Status Badges Overlay */}
                <div
                  className="position-absolute d-flex align-items-center p-2"
                  style={{
                    top: '15px',
                    left: '18px',
                    zIndex: 10,
                    background: 'rgba(0,0,0,0.75)',
                    borderRadius: '6px',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  {isPremium && viewMode === 'full' ? (
                    <span className="badge badge-warning text-dark font-weight-bold px-2 py-1 mr-2">
                      👑 FULL MOVIE &bull; 4K ULTRA HD
                    </span>
                  ) : (
                    <span className="badge badge-danger font-weight-bold px-2 py-1 mr-2">
                      🎬 OFFICIAL TRAILER &bull; ตัวอย่างหนัง
                    </span>
                  )}
                  <span className="text-white small font-weight-bold">
                    {isPremium ? 'VIP UNLOCKED' : 'FREE PREVIEW'}
                  </span>
                </div>

                {/* HTML5 Native Video Player */}
                <video
                  ref={videoRef}
                  id="player"
                  playsInline
                  controls
                  poster={currentEp.image?.original || show?.image?.original || '/videos/anime-watch.jpg'}
                  style={{
                    width: '100%',
                    maxHeight: '580px',
                    display: 'block',
                    backgroundColor: '#000'
                  }}
                >
                  <source src={currentVideoUrl} type="video/mp4" />
                  Your browser does not support HTML5 video streaming.
                </video>
              </div>

              {/* Free Tier Notice Banner */}
              {!isPremium && (
                <div
                  className="p-3 mb-4 rounded d-flex flex-wrap align-items-center justify-content-between"
                  style={{
                    background: 'rgba(229, 54, 55, 0.15)',
                    borderLeft: '5px solid #e53637'
                  }}
                >
                  <div className="d-flex align-items-center">
                    <i className="fa fa-info-circle text-danger mr-3" style={{ fontSize: '24px' }}></i>
                    <div>
                      <strong className="text-white">สมาชิกสิทธิ์ Free ดูได้เฉพาะตัวอย่างหนัง (Trailer Only)</strong>
                      <div className="small text-white-50">
                        อัปเกรดเป็นสมาชิก <strong>ZYNEMA VIP Premium</strong> เพื่อรับชมภาพยนตร์เต็มเรื่องและซีรีส์ครบทุกตอนในระบบ 4K Ultra HD แบบไร้โฆษณา
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUpgradeReason('สมาชิกสิทธิ์ Free ดูได้แค่ตัวอย่างหนังเท่านั้น อัปเกรดเป็น VIP Premium เพื่อรับชมภาพยนตร์เต็มเรื่องแบบ 4K!');
                      setShowUpgradeModal(true);
                    }}
                    className="btn btn-sm btn-danger font-weight-bold px-4 py-2 mt-2 mt-md-0"
                    style={{ borderRadius: '20px', letterSpacing: '0.5px' }}
                  >
                    <i className="fa fa-crown mr-1 text-warning"></i> อัปเกรดดูหนังเต็มเรื่อง
                  </button>
                </div>
              )}

              {/* Mode Switcher & Server Selectors */}
              <div
                className="p-3 mb-4 rounded d-flex flex-wrap align-items-center justify-content-between"
                style={{ background: '#0e1035', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {/* Watch Full Movie vs Trailer buttons */}
                <div className="d-flex flex-wrap align-items-center mb-2 mb-md-0" style={{ gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleSelectFullMovie}
                    className={`btn btn-sm ${
                      isPremium && viewMode === 'full'
                        ? 'btn-danger font-weight-bold'
                        : 'btn-outline-danger'
                    }`}
                    style={{ borderRadius: '20px', padding: '6px 18px' }}
                  >
                    <i className="fa fa-play mr-1"></i> ดูหนังเต็มเรื่อง (Full Movie)
                    {!isPremium && <i className="fa fa-lock ml-2 text-warning"></i>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('trailer')}
                    className={`btn btn-sm ${
                      viewMode === 'trailer'
                        ? 'btn-info font-weight-bold'
                        : 'btn-outline-info'
                    }`}
                    style={{ borderRadius: '20px', padding: '6px 18px' }}
                  >
                    <i className="fa fa-film mr-1"></i> ดูตัวอย่างหนัง (Trailer)
                  </button>
                </div>

                {/* Video Servers Selector (For Premium Users) */}
                {isPremium && viewMode === 'full' && (
                  <div className="d-flex align-items-center">
                    <span className="small text-white mr-2">
                      <i className="fa fa-server mr-1 text-warning"></i> เซิร์ฟเวอร์วิดีโอ:
                    </span>
                    <div className="btn-group btn-group-sm">
                      {VIDEO_SOURCES.fullMovieServers.map((srv, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => setSelectedServerIndex(sIdx)}
                          className={`btn ${
                            selectedServerIndex === sIdx ? 'btn-warning text-dark font-weight-bold' : 'btn-dark text-white'
                          }`}
                        >
                          Server {sIdx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Info Bar */}
              <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-3 border-bottom border-dark">
                <div>
                  <h4 className="text-white font-weight-bold mb-1">
                    {showName} &bull; {isPremium && viewMode === 'full' ? 'ภาพยนตร์ฉบับเต็ม (Full Movie 4K)' : 'ตัวอย่างภาพยนตร์อย่างเป็นทางการ (Official Trailer)'}
                  </h4>
                  <p className="text-muted small mb-0">
                    {cleanSummary(show?.summary)}
                  </p>
                </div>
                <div className="mt-2 mt-md-0">
                  <span className="badge badge-secondary p-2 mr-2">
                    <i className="fa fa-star text-warning mr-1"></i> {show?.rating.average || '8.5'} / 10
                  </span>
                  <span className="badge badge-dark p-2">
                    <i className="fa fa-clock-o mr-1"></i> {show?.runtime || 120} mins
                  </span>
                </div>
              </div>

              {/* Episode Selection List */}
              <div className="anime__details__episodes mb-5">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="section-title mb-0">
                    <h5>เลือกตอนรับชม (Episodes List)</h5>
                  </div>
                  <span className="text-muted small">
                    {isPremium ? (
                      <span className="text-warning font-weight-bold">👑 สมาชิก VIP ดูได้ครบทุกตอน</span>
                    ) : (
                      <span className="text-danger font-weight-bold">🔒 สมาชิก Free ดูได้เฉพาะตัวอย่างหนัง</span>
                    )}
                  </span>
                </div>

                <div className="d-flex flex-wrap" style={{ gap: '10px' }}>
                  {episodes.map((ep, idx) => {
                    const isCurrent = currentEpisodeIndex === idx && viewMode === 'full';

                    return (
                      <button
                        key={ep.id || idx}
                        type="button"
                        onClick={() => handleSelectEpisode(idx)}
                        className={`btn ${
                          isCurrent
                            ? 'btn-danger font-weight-bold'
                            : isPremium
                            ? 'btn-secondary text-white'
                            : 'btn-dark text-muted'
                        }`}
                        style={{
                          minWidth: '85px',
                          padding: '8px 14px',
                          borderRadius: '6px',
                          border: isCurrent
                            ? '2px solid #fff'
                            : isPremium
                            ? '1px solid rgba(255,255,255,0.1)'
                            : '1px dashed rgba(255,255,255,0.2)',
                          position: 'relative'
                        }}
                      >
                        <div>Ep {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</div>
                        <div style={{ fontSize: '10px' }}>
                          {isPremium ? (
                            <span className="text-warning"><i className="fa fa-check"></i> VIP 4K</span>
                          ) : (
                            <span className="text-danger"><i className="fa fa-lock"></i> ล็อก</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Discussion & Sidebar */}
          <div className="row">
            <div className="col-lg-8">
              <div className="anime__details__review">
                <div className="section-title">
                  <h5>ความคิดเห็นและรีวิวจากผู้ชม ({reviews.length})</h5>
                </div>
                {reviews.map((rev) => (
                  <div key={rev.id} className="anime__review__item">
                    <div className="anime__review__item__pic">
                      <img src={rev.userAvatar} alt={rev.userName} />
                    </div>
                    <div className="anime__review__item__text">
                      <h6>
                        {rev.userName}{' '}
                        {rev.userTier === 'premium' ? (
                          <span className="badge badge-warning text-dark ml-1" style={{ fontSize: '10px' }}>
                            👑 VIP
                          </span>
                        ) : (
                          <span className="badge badge-secondary ml-1" style={{ fontSize: '10px' }}>
                            FREE
                          </span>
                        )}
                        {' '}- <span>{rev.timeAgo}</span>
                      </h6>
                      <p>{rev.comment}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment Box */}
              <div className="anime__details__form">
                <div className="section-title">
                  <h5>เขียนรีวิวหรือแสดงความคิดเห็น</h5>
                </div>
                <form onSubmit={handleAddReview}>
                  <textarea
                    placeholder="แบ่งปันความคิดเห็นเกี่ยวกับภาพยนตร์เรื่องนี้..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={4}
                    required
                  ></textarea>
                  <button type="submit">
                    <i className="fa fa-paper-plane mr-1"></i> โพสต์รีวิว
                  </button>
                </form>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="anime__details__sidebar">
                <div className="section-title">
                  <h5>ข้อมูลทางเทคนิคของสื่อ</h5>
                </div>
                <div
                  className="p-4 rounded text-white mb-4"
                  style={{ background: '#0e1035', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <h6 className="text-warning font-weight-bold mb-3">
                    <i className="fa fa-shield mr-2"></i> สิทธิ์การรับชมปัจจุบัน:
                  </h6>
                  <p className="small mb-3">
                    {isPremium ? (
                      <span className="text-success">
                        <strong>คุณมีสิทธิ์ VIP Premium:</strong> รับชมภาพยนตร์ฉบับเต็ม (Full Movie) ความละเอียด 4K Ultra HD พร้อมสลับเซิร์ฟเวอร์ได้ 3 แหล่ง
                      </span>
                    ) : (
                      <span className="text-danger">
                        <strong>คุณมีสิทธิ์ Free:</strong> รับชมได้เฉพาะตัวอย่างภาพยนตร์ (Trailer) เท่านั้น
                      </span>
                    )}
                  </p>
                  <div className="small text-muted">
                    <p className="mb-1"><strong>Trailer URL:</strong> Sintel Official Trailer MP4</p>
                    <p className="mb-1"><strong>Full Stream:</strong> Local & Cloud 4K Media Server</p>
                    <p className="mb-0"><strong>Network Host:</strong> พร้อมแชร์ผ่านเครือข่าย Local IP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upgrade Modal */}
      <PremiumModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason={upgradeReason}
      />
    </>
  );
};
