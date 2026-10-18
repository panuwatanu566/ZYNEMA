import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, validatePassword } from '../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: Reset Form, 3: Success
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validation = validatePassword(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const res = forgotPassword(email);
    setIsSubmitting(false);

    if (res.success) {
      setInfoMessage(res.message);
      setStep(2);
    } else {
      setError('No registered account was found with this email address.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validation.isValid) {
      setError('Please satisfy all password criteria.');
      return;
    }

    if (!passwordsMatch) {
      setError('Confirm password does not match.');
      return;
    }

    setIsSubmitting(true);
    const res = resetPassword(email, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      setStep(3);
    } else {
      setError(res.error || 'Failed to update password.');
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
                <h2>Account Recovery</h2>
                <p>Reset your ZYNEMA password securely.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="login spad">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div
                className="login__form p-4 p-md-5 rounded"
                style={{ background: '#0e1035', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {step === 1 && (
                  <>
                    <h3 className="mb-2">Forgot Password</h3>
                    <p className="text-white-50 small mb-4">
                      Enter your account email to verify and receive password reset access.
                    </p>

                    {error && (
                      <div className="alert alert-danger py-2 small" role="alert">
                        <i className="fa fa-exclamation-triangle mr-1"></i> {error}
                      </div>
                    )}

                    <form onSubmit={handleVerifyEmail}>
                      <div className="input__item">
                        <input
                          type="email"
                          placeholder="Your account email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                        <span className="icon_mail"></span>
                      </div>

                      <button type="submit" className="site-btn btn-block" disabled={isSubmitting}>
                        {isSubmitting ? 'Verifying Email...' : 'Continue to Reset Password'}
                      </button>
                    </form>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h3 className="mb-2">Set New Password</h3>
                    <p className="text-white-50 small mb-3">
                      Resetting password for: <strong className="text-white">{email}</strong>
                    </p>

                    {infoMessage && (
                      <div className="alert alert-info py-2 small mb-3">
                        <i className="fa fa-info-circle mr-1"></i> {infoMessage}
                      </div>
                    )}

                    {error && (
                      <div className="alert alert-danger py-2 small" role="alert">
                        <i className="fa fa-exclamation-triangle mr-1"></i> {error}
                      </div>
                    )}

                    <form onSubmit={handleResetPassword}>
                      <div className="input__item mb-2">
                        <input
                          type="password"
                          placeholder="New secure password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <span className="icon_lock"></span>
                      </div>

                      {/* Password Requirements Checklist */}
                      <div
                        className="p-3 mb-3 rounded small"
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="font-weight-bold text-muted mb-1">Password Requirements:</div>
                        <div>
                          <i className={`fa ${validation.hasMinLength ? 'fa-check text-success' : 'fa-times text-muted'} mr-2`}></i>
                          8+ characters
                        </div>
                        <div>
                          <i className={`fa ${validation.hasUpperCase ? 'fa-check text-success' : 'fa-times text-muted'} mr-2`}></i>
                          One uppercase (A-Z)
                        </div>
                        <div>
                          <i className={`fa ${validation.hasLowerCase ? 'fa-check text-success' : 'fa-times text-muted'} mr-2`}></i>
                          One lowercase (a-z)
                        </div>
                        <div>
                          <i className={`fa ${validation.hasNumber ? 'fa-check text-success' : 'fa-times text-muted'} mr-2`}></i>
                          One number (0-9)
                        </div>
                        <div>
                          <i className={`fa ${validation.hasSpecialChar ? 'fa-check text-success' : 'fa-times text-muted'} mr-2`}></i>
                          One special symbol (!@#$%^&*)
                        </div>
                      </div>

                      <div className="input__item mb-2">
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <span className="icon_lock"></span>
                      </div>

                      {confirmPassword && (
                        <div className="mb-3 small">
                          {passwordsMatch ? (
                            <span className="text-success"><i className="fa fa-check mr-1"></i> Passwords match</span>
                          ) : (
                            <span className="text-danger"><i className="fa fa-times mr-1"></i> Passwords do not match</span>
                          )}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="site-btn btn-block"
                        disabled={isSubmitting || !validation.isValid || !passwordsMatch}
                      >
                        {isSubmitting ? 'Updating Password...' : 'Save New Password'}
                      </button>
                    </form>
                  </>
                )}

                {step === 3 && (
                  <div className="text-center py-4">
                    <div
                      className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                      style={{ width: '60px', height: '60px', background: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71', fontSize: '28px' }}
                    >
                      <i className="fa fa-check"></i>
                    </div>
                    <h4 className="text-white font-weight-bold mb-2">Password Reset Successful!</h4>
                    <p className="text-white-50 small mb-4">
                      Your new password has been applied. You can now log in with your updated credentials.
                    </p>
                    <Link to="/login" className="btn btn-danger btn-block py-2" style={{ borderRadius: '25px' }}>
                      Proceed to Log In
                    </Link>
                  </div>
                )}

                <div className="text-center mt-4">
                  <Link to="/login" className="text-muted small">
                    <i className="fa fa-arrow-left mr-1"></i> Return to Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
