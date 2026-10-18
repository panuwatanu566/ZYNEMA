import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, isPremium, logout, openUpgradeModal } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="header" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="container">
        <div className="row align-items-center">
          {/* Logo */}
          <div className="col-xl-3 col-lg-3 col-6">
            <div className="header__logo">
              <Link to="/" className="text-decoration-none d-flex align-items-center">
                <span
                  style={{
                    fontSize: '26px',
                    fontWeight: 900,
                    letterSpacing: '2px',
                    color: '#ffffff',
                    fontFamily: '"Oswald", sans-serif',
                    whiteSpace: 'nowrap'
                  }}
                >
                  ZYNE<span style={{ color: '#e53637' }}>MA</span>
                </span>
                <span
                  className="badge badge-danger ml-2 px-1 text-uppercase"
                  style={{ fontSize: '9px', verticalAlign: 'middle', letterSpacing: '0.5px' }}
                >
                  TVMaze
                </span>
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="col-xl-6 col-lg-6 d-none d-lg-block">
            <div className="header__nav text-center">
              <nav className="header__menu">
                <ul>
                  <li className={isActive('/') ? 'active' : ''}>
                    <Link to="/">Home</Link>
                  </li>
                  <li
                    className={`dropdown-container ${location.pathname.includes('/movies') ? 'active' : ''}`}
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <Link to="/movies">
                      Browse Shows <span className="arrow_carrot-down"></span>
                    </Link>
                    <ul className={`dropdown ${dropdownOpen ? 'show' : ''}`}>
                      <li><Link to="/movies?genre=Drama">Drama</Link></li>
                      <li><Link to="/movies?genre=Action">Action</Link></li>
                      <li><Link to="/movies?genre=Science-Fiction">Sci-Fi</Link></li>
                      <li><Link to="/movies?genre=Comedy">Comedy</Link></li>
                      <li><Link to="/movies?genre=Thriller">Thriller</Link></li>
                      <li><Link to="/movies?tier=premium">👑 Premium Only</Link></li>
                    </ul>
                  </li>
                  <li className={isActive('/blog') ? 'active' : ''}>
                    <Link to="/blog">News & Reviews</Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={openUpgradeModal}
                      className="btn btn-sm btn-link text-decoration-none p-0 text-warning font-weight-bold"
                      style={{ fontSize: '15px' }}
                    >
                      <i className="fa fa-crown mr-1"></i> {isPremium ? 'VIP Active' : 'Upgrade Plan'}
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* User Auth & Actions */}
          <div className="col-xl-3 col-lg-3 col-md-3 col-6">
            <div className="header__right d-flex align-items-center justify-content-end">
              {/* Search Button */}
              <button
                type="button"
                onClick={onOpenSearch}
                className="search-switch bg-transparent border-0 text-white p-0 mr-3"
                title="Search TVMaze Shows"
                style={{ cursor: 'pointer', fontSize: '18px' }}
              >
                <span className="icon_search"></span>
              </button>

              {/* Authentication Status */}
              {isAuthenticated && user ? (
                <div
                  className="position-relative"
                  onMouseEnter={() => setUserMenuOpen(true)}
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <button
                    type="button"
                    className="btn btn-sm d-flex align-items-center border-0 text-white bg-transparent p-0"
                    style={{ cursor: 'pointer' }}
                  >
                    <div
                      className="rounded-circle mr-2 d-flex align-items-center justify-content-center font-weight-bold"
                      style={{
                        width: '32px',
                        height: '32px',
                        background: isPremium ? 'linear-gradient(45deg, #f39c12, #e53637)' : '#333',
                        color: '#fff',
                        fontSize: '13px'
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={`badge ${isPremium ? 'badge-warning text-dark' : 'badge-secondary'} d-none d-sm-inline`}
                      style={{ fontSize: '10px' }}
                    >
                      {isPremium ? '👑 VIP' : 'FREE'}
                    </span>
                    <span className="arrow_carrot-down ml-1 text-white"></span>
                  </button>

                  {/* User dropdown menu */}
                  {userMenuOpen && (
                    <div
                      className="dropdown-menu show position-absolute"
                      style={{
                        right: 0,
                        top: '100%',
                        minWidth: '200px',
                        background: '#0e1035',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                        zIndex: 9999
                      }}
                    >
                      <div className="px-3 py-2 border-bottom border-secondary">
                        <div className="text-white font-weight-bold text-truncate">{user.name}</div>
                        <div className="small text-muted text-truncate">{user.email}</div>
                        <div className="mt-1">
                          <span
                            className={`badge ${isPremium ? 'badge-warning text-dark' : 'badge-info'}`}
                            style={{ fontSize: '10px' }}
                          >
                            Tier: {user.tier.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <Link to="/profile" className="dropdown-item text-white py-2" onClick={() => setUserMenuOpen(false)}>
                        <i className="fa fa-user-circle mr-2"></i> Account Profile
                      </Link>
                      {!isPremium && (
                        <button
                          type="button"
                          className="dropdown-item text-warning py-2 border-0 bg-transparent"
                          onClick={() => {
                            setUserMenuOpen(false);
                            openUpgradeModal();
                          }}
                        >
                          <i className="fa fa-diamond mr-2"></i> Upgrade to Premium
                        </button>
                      )}
                      <div className="dropdown-divider border-secondary my-1"></div>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="dropdown-item text-danger py-2 border-0 bg-transparent"
                      >
                        <i className="fa fa-sign-out mr-2"></i> Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="d-flex align-items-center">
                  <Link
                    to="/login"
                    className="btn btn-sm btn-outline-light mr-2 px-3"
                    style={{ borderRadius: '20px', fontSize: '13px' }}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="btn btn-sm btn-danger px-3 d-none d-sm-inline"
                    style={{ borderRadius: '20px', fontSize: '13px' }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                type="button"
                className="d-lg-none bg-transparent border-0 text-white ml-2 p-1"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Menu"
              >
                <i className={`fa ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`} style={{ fontSize: '20px' }}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="mobile-nav-panel d-lg-none mt-3 p-3" style={{ background: '#0b0c2a', borderRadius: '6px' }}>
            <ul className="list-unstyled mb-0">
              <li className="py-2 border-bottom border-dark">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-white d-block">
                  Home
                </Link>
              </li>
              <li className="py-2 border-bottom border-dark">
                <Link to="/movies" onClick={() => setMobileMenuOpen(false)} className="text-white d-block">
                  Browse All Shows
                </Link>
              </li>
              <li className="py-2 border-bottom border-dark">
                <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="text-white d-block">
                  News & Reviews
                </Link>
              </li>
              <li className="py-2 border-bottom border-dark">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openUpgradeModal();
                  }}
                  className="btn btn-sm btn-link text-warning p-0"
                >
                  👑 Upgrade to Premium
                </button>
              </li>
              {isAuthenticated ? (
                <>
                  <li className="py-2 border-bottom border-dark">
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-white d-block">
                      My Profile ({user?.name})
                    </Link>
                  </li>
                  <li className="py-2">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="btn btn-link text-danger p-0"
                    >
                      Log Out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="py-2 border-bottom border-dark">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-white d-block">
                      Log In
                    </Link>
                  </li>
                  <li className="py-2">
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="text-danger d-block">
                      Sign Up Now
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};
