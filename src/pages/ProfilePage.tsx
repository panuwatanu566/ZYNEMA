import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Breadcrumb } from '../components/Breadcrumb';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isPremium, logout, upgradeToPremium, downgradeToFree, openUpgradeModal } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <div className="container py-5 text-center text-white" style={{ minHeight: '50vh' }}>
        <h3>Please Log In to View Your Account Profile</h3>
        <Link to="/login" className="btn btn-danger mt-3">Go to Login</Link>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Account Profile' }
        ]}
      />

      <section className="spad pt-4">
        <div className="container">
          <div className="row">
            {/* User Card */}
            <div className="col-lg-4 mb-4">
              <div
                className="p-4 rounded text-center"
                style={{ background: '#0e1035', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div
                  className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center font-weight-bold"
                  style={{
                    width: '90px',
                    height: '90px',
                    background: isPremium ? 'linear-gradient(45deg, #f39c12, #e53637)' : '#242654',
                    color: '#fff',
                    fontSize: '36px',
                    boxShadow: isPremium ? '0 8px 25px rgba(243, 156, 18, 0.4)' : 'none'
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <h4 className="text-white font-weight-bold mb-1">{user.name}</h4>
                <p className="text-muted small mb-2">{user.email}</p>

                <div className="mb-3">
                  <span
                    className={`badge ${isPremium ? 'badge-warning text-dark font-weight-bold' : 'badge-info'} px-3 py-2`}
                    style={{ fontSize: '13px' }}
                  >
                    {isPremium ? '👑 VIP PREMIUM SUBSCRIBER' : 'FREE TIER MEMBER'}
                  </span>
                </div>

                <p className="small text-muted mb-4">
                  Account Created: {user.createdAt || '2024-01-01'}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="btn btn-outline-danger btn-block py-2"
                >
                  <i className="fa fa-sign-out mr-1"></i> Log Out
                </button>
              </div>
            </div>

            {/* Plan Management & Authorization */}
            <div className="col-lg-8">
              <div
                className="p-4 p-md-5 rounded"
                style={{ background: '#0e1035', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary">
                  <div>
                    <h4 className="text-white font-weight-bold mb-1">Membership & Authorization Tier</h4>
                    <p className="text-muted small mb-0">Control access to 4K Ultra HD and gated series episodes.</p>
                  </div>
                  <div>
                    {isPremium ? (
                      <span className="badge badge-warning text-dark font-weight-bold p-2">ACTIVE VIP</span>
                    ) : (
                      <span className="badge badge-secondary p-2">BASIC FREE</span>
                    )}
                  </div>
                </div>

                {/* Plan Comparison Box */}
                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <div
                      className={`p-3 rounded h-100 ${!isPremium ? 'border border-info' : 'border border-secondary'}`}
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    >
                      <h5 className="text-white font-weight-bold mb-2">Free Plan</h5>
                      <ul className="list-unstyled small text-muted mb-3" style={{ lineHeight: '2' }}>
                        <li><i className="fa fa-check text-success mr-2"></i> Standard HD (720p)</li>
                        <li><i className="fa fa-check text-success mr-2"></i> Episodes 1 and 2 of all shows</li>
                        <li><i className="fa fa-times text-danger mr-2"></i> Full season episodes locked</li>
                        <li><i className="fa fa-times text-danger mr-2"></i> 4K UHD exclusive titles locked</li>
                      </ul>
                      {isPremium && (
                        <button
                          type="button"
                          onClick={downgradeToFree}
                          className="btn btn-sm btn-outline-secondary btn-block text-white"
                        >
                          Switch back to Free (Test Role)
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div
                      className={`p-3 rounded h-100 ${isPremium ? 'border border-warning' : 'border border-secondary'}`}
                      style={{
                        background: isPremium ? 'rgba(243, 156, 18, 0.08)' : 'rgba(255,255,255,0.02)',
                        boxShadow: isPremium ? '0 5px 20px rgba(243, 156, 18, 0.15)' : 'none'
                      }}
                    >
                      <h5 className="text-warning font-weight-bold mb-2">👑 VIP Premium Plan</h5>
                      <ul className="list-unstyled small text-muted mb-3" style={{ lineHeight: '2' }}>
                        <li><i className="fa fa-check text-warning mr-2"></i> <strong>All Episodes Unlocked:</strong> Binge watch entire seasons</li>
                        <li><i className="fa fa-check text-warning mr-2"></i> <strong>4K Ultra HD & HDR:</strong> Maximum cinematic bitrate</li>
                        <li><i className="fa fa-check text-warning mr-2"></i> <strong>Ad-Free:</strong> Zero commercial interruptions</li>
                        <li><i className="fa fa-check text-warning mr-2"></i> <strong>VIP Crown Badge:</strong> Displayed on all reviews</li>
                      </ul>
                      {!isPremium ? (
                        <button
                          type="button"
                          onClick={upgradeToPremium}
                          className="btn btn-sm btn-warning btn-block font-weight-bold text-dark"
                        >
                          <i className="fa fa-bolt mr-1"></i> Upgrade to VIP Now
                        </button>
                      ) : (
                        <div className="text-center text-success small font-weight-bold py-1">
                          <i className="fa fa-check-circle mr-1"></i> You currently enjoy VIP benefits
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="pt-3 border-top border-secondary">
                  <h6 className="text-white-50 text-uppercase small mb-3">Quick Navigation</h6>
                  <div className="d-flex flex-wrap" style={{ gap: '10px' }}>
                    <Link to="/movies" className="btn btn-sm btn-outline-light">
                      <i className="fa fa-film mr-1"></i> Browse Movie Catalog
                    </Link>
                    <Link to="/watch/82" className="btn btn-sm btn-outline-danger">
                      <i className="fa fa-play mr-1"></i> Test Video Streaming
                    </Link>
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
