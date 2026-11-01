import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, validatePassword } from '../context/AuthContext';
import { fieldErrors, getErrorMessage } from '../lib/api';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState<string>('');
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: Reset Form, 3: Success
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validation = validatePassword(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await forgotPassword(email);
      setInfoMessage(res.message || 'ส่งคำขอรีเซ็ตรหัสผ่านเรียบร้อยแล้ว');
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
      setStep(2);
    } catch (err: any) {
      setErrors(fieldErrors(err));
      setErrorMessage(getErrorMessage(err, 'ไม่พบบัญชีผู้ใช้ที่ลงทะเบียนด้วยอีเมลนี้ หรือส่งคำขอถี่เกินไป'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMessage('');

    if (newPassword.length < 8) {
      setErrors({ newPassword: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' });
      return;
    }

    if (!passwordsMatch) {
      setErrors({ confirmPassword: 'รหัสผ่านทั้งสองช่องไม่ตรงกัน' });
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(resetToken, newPassword);
      setStep(3);
    } catch (err: any) {
      setErrors(fieldErrors(err));
      setErrorMessage(getErrorMessage(err, 'โทเค็นรีเซ็ตรหัสผ่านไม่ถูกต้อง หรือหมดอายุแล้ว (15 นาที)'));
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
                <h2>กู้คืนบัญชีผู้ใช้ (Account Recovery)</h2>
                <p>รีเซ็ตรหัสผ่านใหม่สำหรับเข้าใช้งาน ZYNEMA อย่างปลอดภัย</p>
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
                    <h3 className="mb-2 text-white font-weight-bold">ลืมรหัสผ่าน (Forgot Password)</h3>
                    <p className="text-white-50 small mb-4">
                      กรอกอีเมลบัญชีของคุณเพื่อขอรับรหัส Reset Token สำหรับตั้งรหัสผ่านใหม่
                    </p>

                    {errorMessage && (
                      <div className="alert alert-danger py-2 small" role="alert">
                        <i className="fa fa-exclamation-triangle mr-1"></i> {errorMessage}
                      </div>
                    )}

                    <form onSubmit={handleVerifyEmail}>
                      <div className="mb-3">
                        <div className="input__item mb-1">
                          <input
                            type="email"
                            placeholder="อีเมลที่ลงทะเบียนไว้"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isSubmitting}
                          />
                          <span className="icon_mail"></span>
                        </div>
                        {errors.email && (
                          <small className="text-danger font-weight-bold d-block pl-1">
                            <i className="fa fa-times-circle mr-1"></i> {errors.email}
                          </small>
                        )}
                      </div>

                      <button type="submit" className="site-btn btn-block" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <span><i className="fa fa-spinner fa-spin mr-1"></i> กำลังตรวจสอบอีเมล...</span>
                        ) : (
                          'ดำเนินการขอตั้งรหัสผ่านใหม่'
                        )}
                      </button>
                    </form>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h3 className="mb-2 text-white font-weight-bold">ตั้งรหัสผ่านใหม่ (Set New Password)</h3>
                    <p className="text-white-50 small mb-3">
                      กำลังรีเซ็ตรหัสผ่านสำหรับ: <strong className="text-white">{email}</strong>
                    </p>

                    {infoMessage && (
                      <div className="alert alert-info py-2 small mb-3">
                        <i className="fa fa-info-circle mr-1"></i> {infoMessage}
                      </div>
                    )}

                    {errorMessage && (
                      <div className="alert alert-danger py-2 small" role="alert">
                        <i className="fa fa-exclamation-triangle mr-1"></i> {errorMessage}
                      </div>
                    )}

                    <form onSubmit={handleResetPassword}>
                      {/* Optional Reset Token input if testing custom token */}
                      <div className="mb-3">
                        <div className="input__item mb-1">
                          <input
                            type="text"
                            placeholder="Reset Token (ได้จากระบบอัตโนมัติ)"
                            value={resetToken}
                            onChange={(e) => setResetToken(e.target.value)}
                            required
                            disabled={isSubmitting}
                          />
                          <span className="icon_key"></span>
                        </div>
                        {errors.resetToken && (
                          <small className="text-danger font-weight-bold d-block pl-1">
                            <i className="fa fa-times-circle mr-1"></i> {errors.resetToken}
                          </small>
                        )}
                      </div>

                      {/* New Password */}
                      <div className="mb-3">
                        <div className="input__item mb-1">
                          <input
                            type="password"
                            placeholder="รหัสผ่านใหม่ (8–72 ตัวอักษร มีทั้งตัวอักษรและตัวเลข)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            disabled={isSubmitting}
                          />
                          <span className="icon_lock"></span>
                        </div>
                        {errors.newPassword && (
                          <small className="text-danger font-weight-bold d-block pl-1">
                            <i className="fa fa-times-circle mr-1"></i> {errors.newPassword}
                          </small>
                        )}
                      </div>

                      {/* Password Requirements Checklist */}
                      <div
                        className="p-3 mb-3 rounded small"
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="font-weight-bold text-muted mb-1">เงื่อนไขรหัสผ่าน:</div>
                        <div>
                          <i className={`fa ${validation.hasMinLength ? 'fa-check text-success' : 'fa-times text-muted'} mr-2`}></i>
                          อย่างน้อย 8 ตัวอักษร
                        </div>
                        <div>
                          <i className={`fa ${validation.hasNumber ? 'fa-check text-success' : 'fa-times text-muted'} mr-2`}></i>
                          มีตัวเลขอย่างน้อย 1 ตัว (0-9)
                        </div>
                        <div>
                          <i className={`fa ${validation.hasLowerCase || validation.hasUpperCase ? 'fa-check text-success' : 'fa-times text-muted'} mr-2`}></i>
                          มีตัวอักษรภาษาอังกฤษ
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div className="mb-3">
                        <div className="input__item mb-1">
                          <input
                            type="password"
                            placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isSubmitting}
                          />
                          <span className="icon_lock"></span>
                        </div>

                        {confirmPassword && (
                          <div className="small pl-1">
                            {passwordsMatch ? (
                              <span className="text-success"><i className="fa fa-check mr-1"></i> รหัสผ่านตรงกันเรียบร้อย</span>
                            ) : (
                              <span className="text-danger"><i className="fa fa-times mr-1"></i> รหัสผ่านไม่ตรงกัน</span>
                            )}
                          </div>
                        )}
                        {errors.confirmPassword && (
                          <small className="text-danger font-weight-bold d-block pl-1">
                            <i className="fa fa-times-circle mr-1"></i> {errors.confirmPassword}
                          </small>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="site-btn btn-block"
                        disabled={isSubmitting || newPassword.length < 8 || !passwordsMatch}
                      >
                        {isSubmitting ? (
                          <span><i className="fa fa-spinner fa-spin mr-1"></i> กำลังบันทึกรหัสผ่าน...</span>
                        ) : (
                          'บันทึกรหัสผ่านใหม่'
                        )}
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
                    <h4 className="text-white font-weight-bold mb-2">เปลี่ยนรหัสผ่านสำเร็จแล้ว!</h4>
                    <p className="text-white-50 small mb-4">
                      คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที
                    </p>
                    <Link to="/login" className="btn btn-danger btn-block py-2" style={{ borderRadius: '25px' }}>
                      ไปที่หน้าเข้าสู่ระบบ
                    </Link>
                  </div>
                )}

                <div className="text-center mt-4">
                  <Link to="/login" className="text-muted small">
                    <i className="fa fa-arrow-left mr-1"></i> กลับไปหน้าเข้าสู่ระบบ
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
