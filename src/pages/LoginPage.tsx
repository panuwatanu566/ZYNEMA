import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, rememberedEmail } = useAuth();
  const [email, setEmail] = useState(rememberedEmail || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(!!rememberedEmail);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = login(email, password, rememberMe);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Failed to sign in. Please verify your details.');
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo1234!');
    const result = login(demoEmail, 'Demo1234!', true);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <>
      <section
        className="normal-breadcrumb set-bg"
        style={{ backgroundImage: `url(/img/normal-breadcrumb.jpg)` }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <div className="normal__breadcrumb__text">
                <h2>Welcome to ZYNEMA</h2>
                <p>Sign in to stream unlimited movies, shows, and 4K exclusive blockbusters.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="login spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="login__form">
                <h3>Account Login</h3>

                {error && (
                  <div className="alert alert-danger py-2 small" role="alert">
                    <i className="fa fa-exclamation-triangle mr-1"></i> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="input__item">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <span className="icon_mail"></span>
                  </div>

                  <div className="input__item position-relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span className="icon_lock"></span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="border-0 bg-transparent text-muted position-absolute"
                      style={{ right: '15px', top: '14px', cursor: 'pointer', zIndex: 5 }}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <label className="d-flex align-items-center text-white mb-0" style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="mr-2"
                        style={{ accentColor: '#e53637' }}
                      />
                      <span className="small">Remember my email</span>
                    </label>

                    <Link to="/forgot-password" className="forget_pass mb-0" style={{ position: 'static' }}>
                      Forgot Password?
                    </Link>
                  </div>

                  <button type="submit" className="site-btn btn-block" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span><i className="fa fa-spinner fa-spin mr-1"></i> Signing In...</span>
                    ) : (
                      'Sign In to ZYNEMA'
                    )}
                  </button>
                </form>

                {/* Quick Demo Logins for Easy Evaluation */}
                <div className="mt-4 pt-3 border-top border-secondary">
                  <p className="text-muted small mb-2 text-uppercase">1-Click Test Demo Accounts:</p>
                  <div className="d-flex gap-2" style={{ gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('free@zynema.com')}
                      className="btn btn-sm btn-outline-info flex-fill"
                      style={{ fontSize: '12px' }}
                    >
                      <i className="fa fa-user mr-1"></i> Free User (Demo)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('premium@zynema.com')}
                      className="btn btn-sm btn-outline-warning flex-fill"
                      style={{ fontSize: '12px' }}
                    >
                      <i className="fa fa-crown mr-1"></i> 👑 VIP Premium (Demo)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="login__register">
                <h3>New to ZYNEMA?</h3>
                <p className="text-white-50 mb-4">
                  Join our movie streaming community! Start with a Free tier or unlock unlimited 4K Ultra HD streaming with ZYNEMA VIP Premium.
                </p>
                <Link to="/signup" className="primary-btn">
                  Create Account Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
