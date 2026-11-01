import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, validatePassword } from '../context/AuthContext';
import { fieldErrors, getErrorMessage } from '../lib/api';

export const SignupPage: React.FC = () => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Real-time password validation based on API rules (8-72 chars, letters & numbers)
  const validation = validatePassword(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isConfirmDirty = confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMessage('');

    // Pre-flight client checks
    if (!name.trim()) {
      setErrors((prev) => ({ ...prev, name: 'กรุณากรอกชื่อ-นามสกุล' }));
      return;
    }

    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'กรุณากรอกอีเมล' }));
      return;
    }

    if (password.length < 8) {
      setErrors((prev) => ({ ...prev, password: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' }));
      return;
    }

    if (!passwordsMatch) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'รหัสผ่านทั้งสองช่องไม่ตรงกัน' }));
      return;
    }

    setIsSubmitting(true);

    try {
      await register(name, email, password);
      // Successful registration returns tokens & logs user in
      navigate('/');
    } catch (err: any) {
      setErrors(fieldErrors(err));
      setErrorMessage(getErrorMessage(err, 'การสมัครสมาชิกล้มเหลว กรุณาตรวจสอบข้อมูลอีกครั้ง'));
    } finally {
      setIsSubmitting(false);
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
                <h2>สมัครสมาชิก ZYNEMA</h2>
                <p>สร้างบัญชีเพื่อเข้าถึงคลังภาพยนตร์ ซีรีส์ และทดลองรับชมความคมชัดระดับ 4K</p>
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
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h3 className="mb-0 text-white font-weight-bold">สร้างบัญชีใหม่ (Register)</h3>
                  <span className="badge badge-danger px-2 py-1" style={{ fontSize: '11px' }}>
                    API v1 Real-time
                  </span>
                </div>

                {/* Overall Error Alert (e.g. 409 EMAIL_ALREADY_EXISTS, 429 RATE_LIMITED) */}
                {errorMessage && (
                  <div
                    className="alert alert-danger py-2 px-3 mb-4 rounded d-flex align-items-center"
                    role="alert"
                    style={{ background: 'rgba(231, 76, 60, 0.2)', border: '1px solid #e74c3c', color: '#ffb3b3' }}
                  >
                    <i className="fa fa-exclamation-triangle mr-2" style={{ fontSize: '18px' }}></i>
                    <div>
                      <strong>แจ้งเตือน:</strong> {errorMessage}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Full Name */}
                  <div className="mb-3">
                    <div
                      className="input__item mb-1 position-relative"
                      style={{ border: errors.name ? '1px solid #e74c3c' : undefined }}
                    >
                      <input
                        name="name"
                        type="text"
                        placeholder="ชื่อ-นามสกุล (Full Name: 2-50 ตัวอักษร)"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                        }}
                        required
                        disabled={isSubmitting}
                      />
                      <span className="icon_profile"></span>
                    </div>
                    {/* Error message under Name */}
                    {errors.name && (
                      <small className="text-danger font-weight-bold d-block pl-1">
                        <i className="fa fa-times-circle mr-1"></i> {errors.name}
                      </small>
                    )}
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <div
                      className="input__item mb-1 position-relative"
                      style={{ border: errors.email ? '1px solid #e74c3c' : undefined }}
                    >
                      <input
                        name="email"
                        type="email"
                        placeholder="อีเมล (Email address)"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                        }}
                        required
                        disabled={isSubmitting}
                      />
                      <span className="icon_mail"></span>
                    </div>
                    {/* Error message under Email */}
                    {errors.email && (
                      <small className="text-danger font-weight-bold d-block pl-1">
                        <i className="fa fa-times-circle mr-1"></i> {errors.email}
                      </small>
                    )}
                  </div>

                  {/* Password with Show/Hide toggle */}
                  <div className="mb-3">
                    <div
                      className="input__item position-relative mb-1"
                      style={{ border: errors.password ? '1px solid #e74c3c' : undefined }}
                    >
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="รหัสผ่าน (8–72 ตัวอักษร มีทั้งตัวอักษรและตัวเลข)"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                        }}
                        required
                        disabled={isSubmitting}
                      />
                      <span className="icon_lock"></span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="border-0 bg-transparent text-muted position-absolute"
                        style={{ right: '15px', top: '14px', cursor: 'pointer', zIndex: 5 }}
                        title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                      >
                        <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {/* Error message under Password */}
                    {errors.password && (
                      <small className="text-danger font-weight-bold d-block pl-1">
                        <i className="fa fa-times-circle mr-1"></i> {errors.password}
                      </small>
                    )}
                  </div>

                  {/* Password Strength Meter Bar */}
                  {password.length > 0 && (
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small text-muted">ระดับความปลอดภัยของรหัสผ่าน:</span>
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
                    <div className="small font-weight-bold text-muted mb-2">เงื่อนไขรหัสผ่านตามมาตรฐาน API:</div>
                    <div className="row small" style={{ rowGap: '6px' }}>
                      <div className="col-sm-6">
                        <i
                          className={`fa ${validation.hasMinLength ? 'fa-check-circle text-success' : 'fa-circle-o text-muted'} mr-2`}
                        ></i>
                        <span className={validation.hasMinLength ? 'text-white' : 'text-muted'}>
                          ความยาวอย่างน้อย 8 ตัวอักษร
                        </span>
                      </div>
                      <div className="col-sm-6">
                        <i
                          className={`fa ${validation.hasNumber ? 'fa-check-circle text-success' : 'fa-circle-o text-muted'} mr-2`}
                        ></i>
                        <span className={validation.hasNumber ? 'text-white' : 'text-muted'}>
                          มีตัวเลขอย่างน้อย 1 ตัว (0-9)
                        </span>
                      </div>
                      <div className="col-sm-6">
                        <i
                          className={`fa ${validation.hasLowerCase || validation.hasUpperCase ? 'fa-check-circle text-success' : 'fa-circle-o text-muted'} mr-2`}
                        ></i>
                        <span className={validation.hasLowerCase || validation.hasUpperCase ? 'text-white' : 'text-muted'}>
                          มีตัวอักษรภาษาอังกฤษ (a-z, A-Z)
                        </span>
                      </div>
                      <div className="col-sm-6">
                        <i
                          className={`fa ${validation.hasSpecialChar ? 'fa-check-circle text-success' : 'fa-circle-o text-muted'} mr-2`}
                        ></i>
                        <span className={validation.hasSpecialChar ? 'text-white' : 'text-muted'}>
                          อักขระพิเศษ (!@#$%^&*...)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-3">
                    <div
                      className="input__item mb-1 position-relative"
                      style={{ border: errors.confirmPassword ? '1px solid #e74c3c' : undefined }}
                    >
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="ยืนยันรหัสผ่านอีกครั้ง (Confirm Password)"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                        }}
                        required
                        disabled={isSubmitting}
                      />
                      <span className="icon_lock"></span>
                    </div>

                    {/* Confirm Password Feedback */}
                    {isConfirmDirty && (
                      <div className="small pl-1">
                        {passwordsMatch ? (
                          <span className="text-success font-weight-bold">
                            <i className="fa fa-check-circle mr-1"></i> รหัสผ่านตรงกันเรียบร้อย
                          </span>
                        ) : (
                          <span className="text-danger font-weight-bold">
                            <i className="fa fa-times-circle mr-1"></i> รหัสผ่านไม่ตรงกัน
                          </span>
                        )}
                      </div>
                    )}
                    {errors.confirmPassword && (
                      <small className="text-danger font-weight-bold d-block pl-1">
                        <i className="fa fa-times-circle mr-1"></i> {errors.confirmPassword}
                      </small>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="site-btn btn-block mt-4"
                    disabled={isSubmitting || (isConfirmDirty && !passwordsMatch)}
                    style={{
                      height: '48px',
                      fontSize: '15px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {isSubmitting ? (
                      <span>
                        <i className="fa fa-spinner fa-spin mr-2"></i> กำลังสร้างบัญชีผู้ใช้...
                      </span>
                    ) : (
                      'ลงทะเบียนสมาชิก (Create ZYNEMA Account)'
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <p className="text-white-50 mb-0">
                    มีบัญชี ZYNEMA อยู่แล้วใช่หรือไม่?{' '}
                    <Link to="/login" className="text-danger font-weight-bold">
                      เข้าสู่ระบบได้ที่นี่
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
