import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  minHeight?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'กำลังดึงข้อมูลจาก TVMaze API...',
  minHeight = '50vh',
  fullPage = false
}) => {
  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center p-5 ${
        fullPage ? 'position-fixed' : ''
      }`}
      style={{
        minHeight: fullPage ? '100vh' : minHeight,
        width: '100%',
        inset: fullPage ? 0 : undefined,
        backgroundColor: fullPage ? 'rgba(11, 12, 42, 0.95)' : 'transparent',
        zIndex: fullPage ? 99999 : 1,
        backdropFilter: fullPage ? 'blur(6px)' : undefined
      }}
    >
      {/* Animated Glowing Ring & Film Icon */}
      <div className="position-relative mb-4 d-flex align-items-center justify-content-center">
        {/* Pulsing Outer Glow */}
        <div
          style={{
            position: 'absolute',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(229, 54, 55, 0.35) 0%, rgba(229, 54, 55, 0) 70%)',
            animation: 'pulseGlow 2s infinite ease-in-out'
          }}
        ></div>

        {/* Spinning Gradient Border */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '3px solid rgba(255, 255, 255, 0.1)',
            borderTopColor: '#e53637',
            borderRightColor: '#f39c12',
            animation: 'spin 0.9s linear infinite'
          }}
        ></div>

        {/* Center Icon */}
        <div
          className="position-absolute"
          style={{
            color: '#ffffff',
            fontSize: '22px'
          }}
        >
          <i className="fa fa-film text-danger"></i>
        </div>
      </div>

      {/* Brand & Loading Text */}
      <div className="text-center">
        <h5
          className="font-weight-bold mb-1"
          style={{
            letterSpacing: '2px',
            fontFamily: '"Oswald", sans-serif',
            color: '#ffffff'
          }}
        >
          ZYNE<span style={{ color: '#e53637' }}>MA</span>
        </h5>
        <p className="text-muted small mb-0 d-flex align-items-center justify-content-center">
          <span className="spinner-grow spinner-grow-sm text-danger mr-2" style={{ width: '8px', height: '8px' }}></span>
          {message}
        </p>
      </div>
    </div>
  );
};

// Skeleton Placeholder for Movie Cards
export const MovieGridSkeleton: React.FC<{ count?: number; columnClass?: string }> = ({
  count = 6,
  columnClass = 'col-lg-4 col-md-6 col-sm-6'
}) => {
  return (
    <div className="row w-100">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className={`${columnClass} mb-4`}>
          <div
            className="rounded overflow-hidden"
            style={{
              background: '#0e1035',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            {/* Poster Skeleton */}
            <div
              className="skeleton-shimmer"
              style={{
                width: '100%',
                height: '320px',
                background: 'linear-gradient(90deg, #13153d 25%, #1a1c4e 50%, #13153d 75%)',
                backgroundSize: '200% 100%'
              }}
            ></div>

            {/* Content Skeleton */}
            <div className="p-3">
              <div
                className="skeleton-shimmer mb-2 rounded"
                style={{
                  width: '40%',
                  height: '14px',
                  background: 'linear-gradient(90deg, #13153d 25%, #1a1c4e 50%, #13153d 75%)',
                  backgroundSize: '200% 100%'
                }}
              ></div>
              <div
                className="skeleton-shimmer rounded"
                style={{
                  width: '80%',
                  height: '18px',
                  background: 'linear-gradient(90deg, #13153d 25%, #1a1c4e 50%, #13153d 75%)',
                  backgroundSize: '200% 100%'
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
