import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, validatePassword } from '../context/AuthContext';
import { UserTier } from '../types/zynema';

export const SignupPage: React.FC = () => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tier, setTier] = useState<UserTier>('free');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Real-time password validation
  const validation = validatePassword(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isConfirmDirty = confirmPassword.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validation.isValid) {
      setError('Please satisfy all password security requirements before proceeding.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match. Please verify your confirm password field.');
      return;
    }

    setIsSubmitting(true);
    const result = register(name, email, password, tier);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Failed to create account.');
    }
  };

  // Helper color for strength meter
  const getStrengthColor = () => {
    if (validation.strength === 'strong') return '#2ecc71';
    if (validation.strength === 'medium') return '#f39c12';
    return '#e74c3c';
  };

  const getStrengthPercent = () => {
    return (validation.score / 5) * 100;
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
                <h2>Join ZYNEMA</h2>
                <p>Create your streaming account and explore movies & shows from TVMaze.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="signup spad">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-7">
              <div
                className="login__form p-4 p-md-5 rounded"
                style={{ background: '#0e1035', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <h3 className="mb-4">Create New Account</h3>

                {error && (
                  <div className="alert alert-danger py-2 small" role="alert">
                    <i className="fa fa-exclamation-triangle mr-1"></i> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Full Name */}
                  <div className="input__item">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <span className="icon_profile"></span>
                  </div>

                  {/* Email */}
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

                  {/* Password with Show/Hide toggle */}
                  <div className="input__item position-relative mb-2">
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

                  {/* Password Strength Meter Bar */}
                  {password.length > 0 && (
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small text-muted">Password Strength:</span>
                        <span
                          className="small font-weight-bold text-uppercase"
                          style={{ color: getStrengthColor() }}
                        >
                          {validation.strength} ({validation.score}/5)
                        </span>
                      </div>
                      <div className="progress" style={{ height: '6px', background: '#1d1e39' }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: `${getStrengthPercent()}%`,
                            backgroundColor: getStrengthColor(),
                            transition: 'width 0.3s ease'
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Password Validation Checklist */}
                  <div
                    className="p-3 mb-3 rounded"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="small font-weight-bold text-muted mb-2">Password Requirements:</div>
                    <div className="row small" style={{ rowGap: '6px' }}>
                      <div className="col-sm-6">
                        <i
                          className={`fa ${validation.hasMinLength ? 'fa-check-circle text-success' : 'fa-circle-o text-muted'} mr-2`}
                        ></i>
                        <span className={validation.hasMinLength ? 'text-white' : 'text-muted'}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="col-sm-6">
                        <i
                          className={`fa ${validation.hasUpperCase ? 'fa-check-circle text-success' : 'fa-circle-o text-muted'} mr-2`}
                        ></i>
                        <span className={validation.hasUpperCase ? 'text-white' : 'text-muted'}>
                          Uppercase letter (A-Z)
                        </span>
                      </div>
                      <div className="col-sm-6">
                        <i
                          className={`fa ${validation.hasLowerCase ? 'fa-check-circle text-success' : 'fa-circle-o text-muted'} mr-2`}
                        ></i>
                        <span className={validation.hasLowerCase ? 'text-white' : 'text-muted'}>
                          Lowercase letter (a-z)
                        </span>
                      </div>
                      <div className="col-sm-6">
                        <i
                          className={`fa ${validation.hasNumber ? 'fa-check-circle text-success' : 'fa-circle-o text-muted'} mr-2`}
                        ></i>
                        <span className={validation.hasNumber ? 'text-white' : 'text-muted'}>
                          At least one number (0-9)
                        </span>
                      </div>
                      <div className="col-sm-12">
                        <i
                          className={`fa ${validation.hasSpecialChar ? 'fa-check-circle text-success' : 'fa-circle-o text-muted'} mr-2`}
                        ></i>
                        <span className={validation.hasSpecialChar ? 'text-white' : 'text-muted'}>
                          Special character (!@#$%^&*...)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="input__item mb-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <span className="icon_lock"></span>
                  </div>

                  {/* Confirm Password Feedback */}
                  {isConfirmDirty && (
                    <div className="mb-3 small">
                      {passwordsMatch ? (
                        <span className="text-success">
                          <i className="fa fa-check mr-1"></i> Passwords match perfectly
                        </span>
                      ) : (
                        <span className="text-danger">
                          <i className="fa fa-times mr-1"></i> Passwords do not match
                        </span>
                      )}
                    </div>
                  )}

                  {/* Membership Tier Plan Selection */}
                  <div className="mb-4">
                    <label className="text-white small font-weight-bold mb-2">Select Initial Plan:</label>
                    <div className="row">
                      <div className="col-6">
                        <div
                          onClick={() => setTier('free')}
                          className={`p-3 rounded text-center ${tier === 'free' ? 'border border-danger' : 'border border-secondary'}`}
                          style={{
                            cursor: 'pointer',
                            background: tier === 'free' ? 'rgba(229, 54, 55, 0.15)' : 'rgba(255,255,255,0.03)'
                          }}
                        >
                          <div className="font-weight-bold text-white">Free Member</div>
                          <div className="text-muted small">Standard HD (720p)</div>
                          <div className="badge badge-secondary mt-1">$0 / forever</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div
                          onClick={() => setTier('premium')}
                          className={`p-3 rounded text-center ${tier === 'premium' ? 'border border-warning' : 'border border-secondary'}`}
                          style={{
                            cursor: 'pointer',
                            background: tier === 'premium' ? 'rgba(243, 156, 18, 0.15)' : 'rgba(255,255,255,0.03)'
                          }}
                        >
                          <div className="font-weight-bold text-warning">👑 VIP Premium</div>
                          <div className="text-muted small">4K Ultra HD & All Eps</div>
                          <div className="badge badge-warning text-dark mt-1">$9.99 / mo</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="site-btn btn-block"
                    disabled={isSubmitting || !validation.isValid || !passwordsMatch}
                  >
                    {isSubmitting ? (
                      <span><i className="fa fa-spinner fa-spin mr-1"></i> Registering Account...</span>
                    ) : (
                      'Create ZYNEMA Account'
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <p className="text-white-50 mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-danger font-weight-bold">
                      Log In here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
