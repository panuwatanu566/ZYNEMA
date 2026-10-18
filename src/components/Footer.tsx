import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="footer" id="footer" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="page-up">
        <button
          type="button"
          id="scrollToTopButton"
          onClick={scrollToTop}
          title="Back to Top"
          style={{ background: '#e53637', border: 'none', cursor: 'pointer' }}
        >
          <span className="arrow_carrot-up"></span>
        </button>
      </div>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-3">
            <div className="footer__logo">
              <Link to="/" className="text-decoration-none">
                <span
                  style={{
                    fontSize: '26px',
                    fontWeight: 900,
                    letterSpacing: '2px',
                    color: '#ffffff',
                    fontFamily: '"Oswald", sans-serif'
                  }}
                >
                  ZYNE<span style={{ color: '#e53637' }}>MA</span>
                </span>
              </Link>
              <p className="text-muted small mt-2 mb-0">Powered by TVMaze Open REST API</p>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="footer__nav">
              <ul>
                <li className="active"><Link to="/">Home</Link></li>
                <li><Link to="/movies">Movies & Shows</Link></li>
                <li><Link to="/blog">News & Articles</Link></li>
                <li><Link to="/profile">My Account</Link></li>
              </ul>
            </div>
          </div>
          <div className="col-lg-3 text-lg-right">
            <p className="small mb-0">
              Copyright &copy; {new Date().getFullYear()} <strong>ZYNEMA</strong>. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
