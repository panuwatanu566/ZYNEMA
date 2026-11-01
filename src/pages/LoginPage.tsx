import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fieldErrors, getErrorMessage } from '../lib/api';

export const LoginPage: React.FC = () => {
  const { login, rememberedEmail } = useAuth();
  const [email, setEmail] = useState(rememberedEmail || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(!!rememberedEmail);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login(email, password, rememberMe);
      const redirectTarget = (location.state as any)?.from?.pathname || '/';
      navigate(redirectTarget, { replace: true });
    } catch (err: any) {
      setErrors(fieldErrors(err));
      setErrorMessage(getErrorMessage(err, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoRoleLabel: string) => {
    setEmail(demoEmail);
    setPassword('Password123');
    setErrors({});
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login(demoEmail, 'Password123', true);
      const redirectTarget = (location.state as any)?.from?.pathname || '/';
      navigate(redirectTarget, { replace: true });
    } catch (err: any) {
      setErrors(fieldErrors(err));
      setErrorMessage(getErrorMessage(err, `เข้าสู่ระบบด้วย ${demoRoleLabel} ไม่สำเร็จ`));
    } finally {
      setIsSubmitting(false);
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
                <h2>ยินดีต้อนรับสู่ ZYNEMA</h2>
                <p>เข้าสู่ระบบเพื่อสตรีมมิ่งภาพยนตร์ ซีรีส์ และผลงานระดับ 4K Ultra HD แบบไร้ขีดจำกัด</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="login spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div
                className="login__form p-4 p-md-5 rounded"
                style={{ background: '#0e1035', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h3 className="mb-0 text-white font-weight-bold">เข้าสู่ระบบ (Login)</h3>
                  <span className="badge badge-danger px-2 py-1" style={{ fontSize: '11px' }}>
                    API v1 Connected
                  </span>
                </div>

                {/* Overall Error Alert (Thai message from backend: INVALID_CREDENTIALS, ACCOUNT_BANNED, etc.) */}
                {errorMessage && (
                  <div
                    className="alert alert-danger py-2 px-3 mb-4 rounded d-flex align-items-center"
                    role="alert"
                    style={{ background: 'rgba(231, 76, 60, 0.2)', border: '1px solid #e74c3c', color: '#ffb3b3' }}
                  >
                    <i className="fa fa-exclamation-triangle mr-2" style={{ fontSize: '18px' }}></i>
                    <div>
                      <strong>เกิดข้อผิดพลาด:</strong> {errorMessage}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Email Input */}
                  <div className="mb-3">
                    <div
                      className="input__item mb-1 position-relative"
                      style={{
                        border: errors.email ? '1px solid #e74c3c' : undefined
                      }}
                    >
                      <input
                        name="email"
                        type="email"
                        placeholder="อีเมล (Email address)"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) {
                            setErrors((prev) => ({ ...prev, email: '' }));
                          }
                        }}
                        required
                        disabled={isSubmitting}
                      />
                      <span className="icon_mail"></span>
                    </div>
                    {/* Error message under Email input */}
                    {errors.email && (
                      <small className="text-danger font-weight-bold d-block pl-1">
                        <i className="fa fa-times-circle mr-1"></i>
                        {errors.email}
                      </small>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="mb-3">
                    <div
                      className="input__item position-relative mb-1"
                      style={{
                        border: errors.password ? '1px solid #e74c3c' : undefined
                      }}
                    >
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="รหัสผ่าน (Password)"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) {
                            setErrors((prev) => ({ ...prev, password: '' }));
                          }
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
                    {/* Error message under Password input */}
                    {errors.password && (
                      <small className="text-danger font-weight-bold d-block pl-1">
                        <i className="fa fa-times-circle mr-1"></i>
                        {errors.password}
                      </small>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <label className="d-flex align-items-center text-white mb-0" style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="mr-2"
                        style={{ accentColor: '#e53637', width: '16px', height: '16px' }}
                        disabled={isSubmitting}
                      />
                      <span className="small">จำอีเมลของฉัน</span>
                    </label>

                    <Link to="/forgot-password" className="forget_pass mb-0" style={{ position: 'static' }}>
                      ลืมรหัสผ่าน?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="site-btn btn-block"
                    disabled={isSubmitting}
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
                        <i className="fa fa-spinner fa-spin mr-2"></i> กำลังเข้าสู่ระบบ...
                      </span>
                    ) : (
                      'เข้าสู่ระบบ (Sign In)'
                    )}
                  </button>
                </form>

                {/* 1-Click Demo Accounts Selection */}
                <div className="mt-4 pt-3 border-top border-secondary">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small text-uppercase font-weight-bold">
                      <i className="fa fa-flask mr-1 text-warning"></i> บัญชีทดสอบด่วน (Demo Accounts):
                    </span>
                    <span className="badge badge-dark text-muted" style={{ fontSize: '10px' }}>
                      Pass: Password123
                    </span>
                  </div>

                  <div className="row no-gutters" style={{ gap: '6px' }}>
                    {/* Admin */}
                    <div className="col">
                      <button
                        type="button"
                        onClick={() => handleQuickLogin('admin@demo.com', 'Admin')}
                        disabled={isSubmitting}
                        className="btn btn-sm btn-outline-warning w-100 text-truncate"
                        title="admin@demo.com (ADMIN / 👑 VIP)"
                        style={{ fontSize: '11px', padding: '6px 4px' }}
                      >
                        <i className="fa fa-shield mr-1"></i> ADMIN (VIP)
                      </button>
                    </div>

                    {/* Editor */}
                    <div className="col">
                      <button
                        type="button"
                        onClick={() => handleQuickLogin('editor@demo.com', 'Editor')}
                        disabled={isSubmitting}
                        className="btn btn-sm btn-outline-info w-100 text-truncate"
                        title="editor@demo.com (EDITOR / 👑 VIP)"
                        style={{ fontSize: '11px', padding: '6px 4px' }}
                      >
                        <i className="fa fa-pencil mr-1"></i> EDITOR (VIP)
                      </button>
                    </div>

                    {/* User */}
                    <div className="col">
                      <button
                        type="button"
                        onClick={() => handleQuickLogin('user@demo.com', 'User')}
                        disabled={isSubmitting}
                        className="btn btn-sm btn-outline-light w-100 text-truncate"
                        title="user@demo.com (USER / Free)"
                        style={{ fontSize: '11px', padding: '6px 4px' }}
                      >
                        <i className="fa fa-user mr-1"></i> USER (Free)
                      </button>
                    </div>

                    {/* Banned */}
                    <div className="col">
                      <button
                        type="button"
                        onClick={() => handleQuickLogin('banned@demo.com', 'Banned')}
                        disabled={isSubmitting}
                        className="btn btn-sm btn-outline-danger w-100 text-truncate"
                        title="banned@demo.com (ทดสอบถูกระงับ 403)"
                        style={{ fontSize: '11px', padding: '6px 4px' }}
                      >
                        <i className="fa fa-ban mr-1"></i> BANNED
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Call to Action */}
            <div className="col-lg-6">
              <div
                className="login__register p-4 p-md-5 rounded h-100 d-flex flex-column justify-content-center"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}
              >
                <h3 className="text-white font-weight-bold mb-3">ยังไม่มีบัญชีผู้ใช้?</h3>
                <p className="text-white-50 mb-4" style={{ lineHeight: 1.8 }}>
                  สมัครสมาชิกใหม่วันนี้เพื่อรับสิทธิ์ในการค้นหาภาพยนตร์กว่า 80,000 เรื่องจากระบบ TVMaze พร้อมรองรับระบบสมาชิก VIP Premium ดูหนังเต็มเรื่องระดับ 4K Ultra HD แบบไม่มีโฆษณาคั่น
                </p>
                <div>
                  <Link to="/signup" className="primary-btn d-inline-block">
                    <i className="fa fa-user-plus mr-1"></i> สมัครสมาชิกใหม่ (Create Account)
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
