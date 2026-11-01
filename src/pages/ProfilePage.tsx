import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, validatePassword } from '../context/AuthContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { Session } from '../types/zynema';
import { fieldErrors, getErrorMessage, api } from '../lib/api';

export const ProfilePage: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isPremium,
    logout,
    upgradeToPremium,
    downgradeToFree,
    openUpgradeModal,
    updateProfile,
    changePassword,
    getSessions,
    revokeSession,
    revokeAllSessions,
    getExpiredToken
  } = useAuth();

  const navigate = useNavigate();

  // Active Tab: 'tier' | 'profile' | 'password' | 'sessions' | 'dev'
  const [activeTab, setActiveTab] = useState<'tier' | 'profile' | 'password' | 'sessions' | 'dev'>('tier');

  // Edit Profile Form State
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionActionId, setSessionActionId] = useState<string | null>(null);
  const [sessionMessage, setSessionMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Dev Expired Token State
  const [expiredTokenMessage, setExpiredTokenMessage] = useState<string | null>(null);
  const [simulatedApiResult, setSimulatedApiResult] = useState<string | null>(null);
  const [isRefreshingExpired, setIsRefreshingExpired] = useState(false);

  // Populate profile fields when user loads
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Load sessions when sessions tab is opened
  useEffect(() => {
    if (activeTab === 'sessions') {
      loadSessions();
    }
  }, [activeTab]);

  const loadSessions = async () => {
    setSessionsLoading(true);
    setSessionMessage(null);
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (err: any) {
      setSessionMessage({ type: 'danger', text: getErrorMessage(err, 'โหลดรายการอุปกรณ์ไม่สำเร็จ') });
    } finally {
      setSessionsLoading(false);
    }
  };

  // Submit Profile Update (PATCH /auth/me)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrors({});
    setProfileMessage(null);
    setProfileSubmitting(true);

    try {
      await updateProfile({
        name: name.trim(),
        avatarUrl: avatarUrl.trim() || null
      });
      setProfileMessage({ type: 'success', text: 'อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว' });
    } catch (err: any) {
      setProfileErrors(fieldErrors(err));
      setProfileMessage({
        type: 'danger',
        text: getErrorMessage(err, 'อัปเดตโปรไฟล์ไม่สำเร็จ (บัญชีตัวอย่างไม่สามารถแก้ไขได้)')
      });
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Submit Password Change (PUT /auth/change-password)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordMessage(null);

    // Client check for password matching
    if (newPassword !== confirmNewPassword) {
      setPasswordErrors({ confirmNewPassword: 'รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordErrors({ newPassword: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร' });
      return;
    }

    setPasswordSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMessage({
        type: 'success',
        text: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว และได้ต่ออายุเซสชันใหม่ในเครื่องนี้เรียบร้อย'
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPasswordErrors(fieldErrors(err));
      setPasswordMessage({
        type: 'danger',
        text: getErrorMessage(err, 'เปลี่ยนรหัสผ่านไม่สำเร็จ (ตรวจสอบรหัสผ่านเดิม หรือบัญชีตัวอย่างไม่สามารถเปลี่ยนได้)')
      });
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // Revoke single session
  const handleRevokeSession = async (id: string) => {
    setSessionActionId(id);
    try {
      await revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setSessionMessage({ type: 'success', text: 'ออกจากระบบอุปกรณ์ที่เลือกเรียบร้อยแล้ว' });
    } catch (err: any) {
      setSessionMessage({ type: 'danger', text: getErrorMessage(err, 'ออกจากระบบอุปกรณ์ไม่สำเร็จ') });
    } finally {
      setSessionActionId(null);
    }
  };

  // Revoke all sessions (POST /auth/logout-all)
  const handleRevokeAllSessions = async () => {
    const confirmLogout = window.confirm('ยืนยันออกจากระบบทุกเครื่องหรือไม่?');
    if (!confirmLogout) return;

    try {
      const revoked = await revokeAllSessions();
      setSessionMessage({ type: 'success', text: `ออกจากระบบทุกเครื่องเรียบร้อยแล้ว (${revoked} อุปกรณ์)` });
      loadSessions();
    } catch (err: any) {
      setSessionMessage({ type: 'danger', text: getErrorMessage(err, 'ไม่สามารถออกจากระบบทุกเครื่องได้') });
    }
  };

  // Dev helper: Test expired token (POST /auth/dev/expired-token)
  const handleTestExpiredToken = async () => {
    setIsRefreshingExpired(true);
    setExpiredTokenMessage(null);
    setSimulatedApiResult(null);

    try {
      const expiredToken = await getExpiredToken();
      setExpiredTokenMessage(
        `บันทึก Token ที่หมดอายุแล้วลงใน localStorage สำเร็จ: ${expiredToken.slice(0, 20)}...`
      );

      // Now call any protected endpoint to trigger the interceptor's auto-refresh!
      const res = await api.get('/auth/me');
      setSimulatedApiResult(
        `✅ ผลลัพธ์: Interceptor ดักจับ 401 TOKEN_EXPIRED สำเร็จ -> เรียก /auth/refresh อัตโนมัติ -> ยิงซ้ำสำเร็จ! (ผู้ใช้: ${res.data.data.name})`
      );
    } catch (err: any) {
      setSimulatedApiResult(`เกิดข้อผิดพลาดในการทดสอบ: ${getErrorMessage(err)}`);
    } finally {
      setIsRefreshingExpired(false);
    }
  };

  const newPasswordValidation = validatePassword(newPassword);

  if (!isAuthenticated || !user) {
    return (
      <div className="container py-5 text-center text-white" style={{ minHeight: '50vh' }}>
        <h3>กรุณาเข้าสู่ระบบเพื่อดูข้อมูลโปรไฟล์ของคุณ</h3>
        <Link to="/login" className="primary-btn mt-3">
          ไปที่หน้าเข้าสู่ระบบ (Sign In)
        </Link>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'โปรไฟล์บัญชีผู้ใช้ (Account Profile)' }]} />

      <section className="spad pt-2">
        <div className="container">
          <div className="row">
            {/* Left Sidebar: User Card */}
            <div className="col-lg-4 mb-4">
              <div
                className="p-4 rounded text-center"
                style={{
                  background: 'rgba(14, 18, 44, 0.75)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '18px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
                }}
              >
                {/* Avatar Display */}
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="rounded-circle mx-auto mb-3"
                    style={{
                      width: '95px',
                      height: '95px',
                      objectFit: 'cover',
                      border: isPremium ? '3px solid #f59e0b' : '3px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: isPremium ? '0 0 20px rgba(245, 158, 11, 0.4)' : 'none'
                    }}
                  />
                ) : (
                  <div
                    className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center font-weight-bold"
                    style={{
                      width: '95px',
                      height: '95px',
                      background: isPremium ? 'linear-gradient(135deg, #f59e0b, #e53637)' : '#242654',
                      color: '#fff',
                      fontSize: '36px',
                      boxShadow: isPremium ? '0 8px 25px rgba(245, 158, 11, 0.4)' : 'none',
                      border: '2px solid rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <h4 className="text-white font-weight-bold mb-1">{user.name}</h4>
                <p className="text-muted small mb-3">{user.email}</p>

                {/* Badges */}
                <div className="d-flex justify-content-center flex-wrap mb-3" style={{ gap: '6px' }}>
                  <span
                    className={`badge ${isPremium ? 'badge-warning text-dark font-weight-bold' : 'badge-info'} px-3 py-2`}
                    style={{ fontSize: '12px', borderRadius: '9999px' }}
                  >
                    {isPremium ? '👑 VIP PREMIUM 4K' : '🎬 FREE TIER MEMBER'}
                  </span>
                  {user.role && (
                    <span
                      className="badge badge-dark border border-secondary px-3 py-2 text-white"
                      style={{ fontSize: '12px', borderRadius: '9999px' }}
                    >
                      Role: <strong className="text-warning">{user.role}</strong>
                    </span>
                  )}
                </div>

                {user.isProtected && (
                  <div className="alert alert-secondary py-1 px-2 small mb-3 text-muted" style={{ fontSize: '11px' }}>
                    <i className="fa fa-lock mr-1"></i> บัญชีตัวอย่างส่วนรวม (แก้ไขไม่ได้)
                  </div>
                )}

                <p className="small text-muted mb-4">
                  สร้างบัญชีเมื่อ: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>

                {/* Navigation Pills inside Card */}
                <div className="d-flex flex-column text-left mb-4" style={{ gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('tier')}
                    className={`btn btn-sm text-left ${activeTab === 'tier' ? 'btn-danger font-weight-bold' : 'btn-dark text-white-50'}`}
                    style={{ borderRadius: '8px', padding: '9px 16px' }}
                  >
                    <i className="fa fa-diamond mr-2"></i> สิทธิ์สมาชิก & แพลนรับชม
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className={`btn btn-sm text-left ${activeTab === 'profile' ? 'btn-danger font-weight-bold' : 'btn-dark text-white-50'}`}
                    style={{ borderRadius: '8px', padding: '9px 16px' }}
                  >
                    <i className="fa fa-user-circle mr-2"></i> แก้ไขข้อมูลโปรไฟล์
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('password')}
                    className={`btn btn-sm text-left ${activeTab === 'password' ? 'btn-danger font-weight-bold' : 'btn-dark text-white-50'}`}
                    style={{ borderRadius: '8px', padding: '9px 16px' }}
                  >
                    <i className="fa fa-key mr-2"></i> เปลี่ยนรหัสผ่าน
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sessions')}
                    className={`btn btn-sm text-left ${activeTab === 'sessions' ? 'btn-danger font-weight-bold' : 'btn-dark text-white-50'}`}
                    style={{ borderRadius: '8px', padding: '9px 16px' }}
                  >
                    <i className="fa fa-laptop mr-2"></i> อุปกรณ์ที่ Login อยู่ (Sessions)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dev')}
                    className={`btn btn-sm text-left ${activeTab === 'dev' ? 'btn-warning text-dark font-weight-bold' : 'btn-dark text-warning'}`}
                    style={{ borderRadius: '8px', padding: '9px 16px' }}
                  >
                    <i className="fa fa-flask mr-2"></i> ตัวช่วยสอน: ทดสอบ Token หมดอายุ
                  </button>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                  className="btn btn-outline-danger btn-block py-2"
                  style={{ borderRadius: '9999px', fontSize: '13px', fontWeight: 600 }}
                >
                  <i className="fa fa-sign-out mr-1"></i> ออกจากระบบ (Log Out)
                </button>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="col-lg-8">
              <div
                className="p-4 p-md-5 rounded"
                style={{
                  background: 'rgba(14, 18, 44, 0.75)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '18px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
                }}
              >
                {/* TAB 1: Streaming Tier & Authorization */}
                {activeTab === 'tier' && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary">
                      <div>
                        <h4 className="text-white font-weight-bold mb-1">สิทธิ์การรับชม (Streaming Tier)</h4>
                        <p className="text-muted small mb-0">ควบคุมสิทธิ์การรับชมภาพยนตร์เต็มเรื่องและความคมชัด 4K Ultra HD</p>
                      </div>
                      <div>
                        {isPremium ? (
                          <span className="badge badge-warning text-dark font-weight-bold p-2" style={{ borderRadius: '9999px' }}>
                            👑 ACTIVE VIP
                          </span>
                        ) : (
                          <span className="badge badge-secondary p-2" style={{ borderRadius: '9999px' }}>
                            BASIC FREE
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="row mb-4">
                      {/* Free Plan */}
                      <div className="col-md-6 mb-3 mb-md-0">
                        <div
                          className={`p-4 rounded h-100 ${!isPremium ? 'border border-info' : 'border border-secondary'}`}
                          style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '14px' }}
                        >
                          <h5 className="text-white font-weight-bold mb-2">สิทธิ์ Free Member</h5>
                          <ul className="list-unstyled small text-muted mb-4" style={{ lineHeight: '2.1' }}>
                            <li><i className="fa fa-check text-success mr-2"></i> ความคมชัด Standard HD (720p)</li>
                            <li><i className="fa fa-check text-success mr-2"></i> ดูตัวอย่างภาพยนตร์ (Trailer) ทุกเรื่อง</li>
                            <li><i className="fa fa-times text-danger mr-2"></i> ล็อกการรับชมภาพยนตร์เต็มเรื่อง</li>
                            <li><i className="fa fa-times text-danger mr-2"></i> ล็อกภาพยนตร์ระดับ 4K Ultra HD</li>
                          </ul>
                          {isPremium && (
                            <button
                              type="button"
                              onClick={downgradeToFree}
                              className="btn btn-sm btn-outline-secondary btn-block text-white"
                              style={{ borderRadius: '9999px' }}
                            >
                              สลับเป็น Free (ทดสอบระบบล็อก)
                            </button>
                          )}
                        </div>
                      </div>

                      {/* VIP Plan */}
                      <div className="col-md-6">
                        <div
                          className={`p-4 rounded h-100 ${isPremium ? 'border border-warning' : 'border border-secondary'}`}
                          style={{
                            background: isPremium ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                            boxShadow: isPremium ? '0 5px 25px rgba(245, 158, 11, 0.15)' : 'none',
                            borderRadius: '14px'
                          }}
                        >
                          <h5 className="text-warning font-weight-bold mb-2">👑 สิทธิ์ VIP Premium</h5>
                          <ul className="list-unstyled small text-muted mb-4" style={{ lineHeight: '2.1' }}>
                            <li><i className="fa fa-check text-warning mr-2"></i> <strong>ดูหนังเต็มเรื่อง:</strong> ปลดล็อกครบทุกตอน</li>
                            <li><i className="fa fa-check text-warning mr-2"></i> <strong>4K Ultra HD & HDR:</strong> บิตเรตภาพสูงสุด</li>
                            <li><i className="fa fa-check text-warning mr-2"></i> <strong>ไม่มีโฆษณา:</strong> รับชมลื่นไหลไม่มีสะดุด</li>
                            <li><i className="fa fa-check text-warning mr-2"></i> <strong>ป้ายมงกุฎ VIP:</strong> แสดงในทุกรีวิว</li>
                          </ul>
                          {!isPremium ? (
                            <button
                              type="button"
                              onClick={upgradeToPremium}
                              className="btn btn-sm btn-warning btn-block font-weight-bold text-dark py-2"
                              style={{ borderRadius: '9999px', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' }}
                            >
                              <i className="fa fa-bolt mr-1"></i> อัปเกรดเป็น VIP ทันที
                            </button>
                          ) : (
                            <div className="text-center text-success small font-weight-bold py-2">
                              <i className="fa fa-check-circle mr-1"></i> คุณกำลังใช้งานสิทธิ์ VIP อยู่
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Edit Profile (PATCH /auth/me) */}
                {activeTab === 'profile' && (
                  <div>
                    <div className="mb-4 pb-3 border-bottom border-secondary">
                      <h4 className="text-white font-weight-bold mb-1">แก้ไขโปรไฟล์ (PATCH /auth/me)</h4>
                      <p className="text-muted small mb-0">ปรับปรุงชื่อและรูปภาพโปรไฟล์ของคุณ (ต้องเป็นบัญชีที่สมัครเอง บัญชีตัวอย่างแก้ไขไม่ได้)</p>
                    </div>

                    {profileMessage && (
                      <div className={`alert alert-${profileMessage.type} py-2 px-3 mb-4 rounded`} role="alert">
                        <i className={`fa ${profileMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2`}></i>
                        {profileMessage.text}
                      </div>
                    )}

                    <form onSubmit={handleUpdateProfile}>
                      {/* Name */}
                      <div className="form-group mb-3">
                        <label className="text-white small font-weight-bold">ชื่อ-นามสกุล (Name: 2–50 ตัวอักษร):</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="form-control"
                          disabled={profileSubmitting || user.isProtected}
                          style={{
                            background: '#ffffff',
                            color: '#0f172a',
                            fontWeight: 600,
                            borderRadius: '8px',
                            height: '46px'
                          }}
                          required
                        />
                        {profileErrors.name && (
                          <small className="text-danger font-weight-bold d-block mt-1">
                            <i className="fa fa-times-circle mr-1"></i> {profileErrors.name}
                          </small>
                        )}
                      </div>

                      {/* Avatar URL */}
                      <div className="form-group mb-4">
                        <label className="text-white small font-weight-bold">ลิงก์รูปภาพโปรไฟล์ (Avatar URL):</label>
                        <input
                          type="url"
                          placeholder="https://example.com/avatar.jpg"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          className="form-control mb-2"
                          disabled={profileSubmitting || user.isProtected}
                          style={{
                            background: '#ffffff',
                            color: '#0f172a',
                            fontWeight: 600,
                            borderRadius: '8px',
                            height: '46px'
                          }}
                        />
                        {avatarUrl && (
                          <div className="d-flex align-items-center mt-2 p-2 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <span className="small text-muted mr-3">ตัวอย่างรูป (Preview):</span>
                            <img
                              src={avatarUrl}
                              alt="Preview"
                              className="rounded-circle"
                              style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                              onError={(e) => {
                                (e.target as any).src = '/img/anime/review-1.jpg';
                              }}
                            />
                          </div>
                        )}
                        {profileErrors.avatarUrl && (
                          <small className="text-danger font-weight-bold d-block mt-1">
                            <i className="fa fa-times-circle mr-1"></i> {profileErrors.avatarUrl}
                          </small>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="primary-btn"
                        disabled={profileSubmitting || user.isProtected}
                      >
                        {profileSubmitting ? (
                          <span><i className="fa fa-spinner fa-spin mr-2"></i> กำลังบันทึกโปรไฟล์...</span>
                        ) : (
                          'บันทึกข้อมูลโปรไฟล์'
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 3: Change Password (PUT /auth/change-password) */}
                {activeTab === 'password' && (
                  <div>
                    <div className="mb-4 pb-3 border-bottom border-secondary">
                      <h4 className="text-white font-weight-bold mb-1">เปลี่ยนรหัสผ่าน (PUT /auth/change-password)</h4>
                      <p className="text-muted small mb-0">
                        เมื่อเปลี่ยนรหัสผ่านสำเร็จ อุปกรณ์อื่นทั้งหมดจะถูก Logout และจะได้รับ Token คู่ใหม่สำหรับเครื่องนี้
                      </p>
                    </div>

                    {passwordMessage && (
                      <div className={`alert alert-${passwordMessage.type} py-2 px-3 mb-4 rounded`} role="alert">
                        <i className={`fa ${passwordMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2`}></i>
                        {passwordMessage.text}
                      </div>
                    )}

                    <form onSubmit={handleChangePassword}>
                      {/* Current Password */}
                      <div className="form-group mb-3">
                        <label className="text-white small font-weight-bold">รหัสผ่านปัจจุบัน (Current Password):</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="form-control"
                          disabled={passwordSubmitting || user.isProtected}
                          style={{ background: '#ffffff', color: '#0f172a', fontWeight: 600, borderRadius: '8px', height: '46px' }}
                          required
                        />
                        {passwordErrors.currentPassword && (
                          <small className="text-danger font-weight-bold d-block mt-1">
                            <i className="fa fa-times-circle mr-1"></i> {passwordErrors.currentPassword}
                          </small>
                        )}
                      </div>

                      {/* New Password */}
                      <div className="form-group mb-3">
                        <label className="text-white small font-weight-bold">รหัสผ่านใหม่ (New Password: 8–72 ตัวอักษร):</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="form-control"
                          disabled={passwordSubmitting || user.isProtected}
                          style={{ background: '#ffffff', color: '#0f172a', fontWeight: 600, borderRadius: '8px', height: '46px' }}
                          required
                        />
                        {passwordErrors.newPassword && (
                          <small className="text-danger font-weight-bold d-block mt-1">
                            <i className="fa fa-times-circle mr-1"></i> {passwordErrors.newPassword}
                          </small>
                        )}

                        {newPassword && (
                          <div className="mt-2 small text-muted">
                            <span className={newPasswordValidation.hasMinLength ? 'text-success mr-2' : 'text-danger mr-2'}>
                              ● อย่างน้อย 8 ตัวอักษร
                            </span>
                            <span className={newPasswordValidation.hasNumber ? 'text-success mr-2' : 'text-danger mr-2'}>
                              ● มีตัวเลข (0-9)
                            </span>
                            <span className={newPasswordValidation.hasLowerCase || newPasswordValidation.hasUpperCase ? 'text-success' : 'text-danger'}>
                              ● มีตัวอักษรภาษาอังกฤษ
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Confirm New Password */}
                      <div className="form-group mb-4">
                        <label className="text-white small font-weight-bold">ยืนยันรหัสผ่านใหม่อีกครั้ง (Confirm New Password):</label>
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="form-control"
                          disabled={passwordSubmitting || user.isProtected}
                          style={{ background: '#ffffff', color: '#0f172a', fontWeight: 600, borderRadius: '8px', height: '46px' }}
                          required
                        />
                        {confirmNewPassword && newPassword === confirmNewPassword && (
                          <small className="text-success font-weight-bold d-block mt-1">
                            <i className="fa fa-check-circle mr-1"></i> รหัสผ่านตรงกันเรียบร้อย
                          </small>
                        )}
                        {passwordErrors.confirmNewPassword && (
                          <small className="text-danger font-weight-bold d-block mt-1">
                            <i className="fa fa-times-circle mr-1"></i> {passwordErrors.confirmNewPassword}
                          </small>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="primary-btn"
                        disabled={passwordSubmitting || user.isProtected || !newPasswordValidation.isValid || newPassword !== confirmNewPassword}
                      >
                        {passwordSubmitting ? (
                          <span><i className="fa fa-spinner fa-spin mr-2"></i> กำลังเปลี่ยนรหัสผ่าน...</span>
                        ) : (
                          'บันทึกรหัสผ่านใหม่'
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 4: Active Sessions (GET /auth/sessions) */}
                {activeTab === 'sessions' && (
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-secondary flex-wrap" style={{ gap: '10px' }}>
                      <div>
                        <h4 className="text-white font-weight-bold mb-1">อุปกรณ์ที่ Login อยู่ (Sessions)</h4>
                        <p className="text-muted small mb-0">รายการเครื่องและอุปกรณ์ที่มีการเข้าสู่ระบบค้างไว้</p>
                      </div>
                      <div className="d-flex" style={{ gap: '8px' }}>
                        <button
                          type="button"
                          onClick={loadSessions}
                          className="btn btn-sm btn-outline-light"
                          style={{ borderRadius: '9999px' }}
                        >
                          <i className="fa fa-refresh mr-1"></i> รีเฟรช
                        </button>
                        <button
                          type="button"
                          onClick={handleRevokeAllSessions}
                          className="btn btn-sm btn-danger font-weight-bold"
                          style={{ borderRadius: '9999px' }}
                        >
                          <i className="fa fa-power-off mr-1"></i> ออกจากระบบทุกเครื่อง
                        </button>
                      </div>
                    </div>

                    {sessionMessage && (
                      <div className={`alert alert-${sessionMessage.type} py-2 px-3 mb-4 rounded`} role="alert">
                        <i className={`fa ${sessionMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2`}></i>
                        {sessionMessage.text}
                      </div>
                    )}

                    {sessionsLoading ? (
                      <div className="text-center py-4 text-white">
                        <div className="spinner-border text-danger" role="status"></div>
                      </div>
                    ) : sessions.length === 0 ? (
                      <div className="text-center py-4 text-muted">ไม่พบข้อมูลเซสชัน</div>
                    ) : (
                      <div className="d-flex flex-column" style={{ gap: '12px' }}>
                        {sessions.map((sess) => (
                          <div
                            key={sess.id}
                            className="p-3 rounded d-flex align-items-center justify-content-between flex-wrap"
                            style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', gap: '10px' }}
                          >
                            <div className="d-flex align-items-center">
                              <i className="fa fa-desktop text-muted mr-3" style={{ fontSize: '24px' }}></i>
                              <div>
                                <div className="text-white font-weight-bold small text-truncate" style={{ maxWidth: '380px' }}>
                                  {sess.userAgent || 'Web Browser Client'}
                                </div>
                                <div className="text-muted" style={{ fontSize: '11px' }}>
                                  เข้าสู่ระบบเมื่อ: {new Date(sess.createdAt).toLocaleString()} &bull; หมดอายุ: {new Date(sess.expiresAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRevokeSession(sess.id)}
                              disabled={sessionActionId === sess.id}
                              className="btn btn-sm btn-outline-danger"
                              style={{ borderRadius: '6px', fontSize: '11px' }}
                            >
                              {sessionActionId === sess.id ? 'กำลังออก...' : 'เตะเครื่องนี้ออก'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 5: Dev Helper - Expired Token (POST /auth/dev/expired-token) */}
                {activeTab === 'dev' && (
                  <div>
                    <div className="mb-4 pb-3 border-bottom border-secondary">
                      <h4 className="text-warning font-weight-bold mb-1">
                        <i className="fa fa-flask mr-2"></i> ตัวช่วยสอน: ทดสอบ Auto-Refresh Token
                      </h4>
                      <p className="text-muted small mb-0">
                        เรียก Endpoint <code>POST /api/v1/auth/dev/expired-token</code> เพื่อนำ Token ที่หมดอายุไปแทนที่ใน LocalStorage
                        จากนั้น Axios Interceptor จะดักจับ <code>401 TOKEN_EXPIRED</code> และเรียก <code>POST /auth/refresh</code> ยิงซ้ำให้อัตโนมัติ!
                      </p>
                    </div>

                    <div className="p-4 rounded mb-4" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      <p className="small text-white mb-3">
                        กดปุ่มด้านล่างเพื่อทดสอบกระบวนการ Auto-Refresh ทันที:
                      </p>
                      <button
                        type="button"
                        onClick={handleTestExpiredToken}
                        disabled={isRefreshingExpired}
                        className="btn btn-warning font-weight-bold text-dark px-4 py-2"
                        style={{ borderRadius: '9999px', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' }}
                      >
                        {isRefreshingExpired ? (
                          <span><i className="fa fa-spinner fa-spin mr-2"></i> กำลังทดสอบ Refresh Token...</span>
                        ) : (
                          '⏰ จำลอง Token หมดอายุและทดสอบ Auto-Refresh'
                        )}
                      </button>
                    </div>

                    {expiredTokenMessage && (
                      <div className="alert alert-secondary py-2 small mb-3">
                        <i className="fa fa-info-circle mr-1"></i> {expiredTokenMessage}
                      </div>
                    )}

                    {simulatedApiResult && (
                      <div className="p-3 rounded small font-weight-bold text-success" style={{ background: 'rgba(46, 204, 113, 0.1)', border: '1px solid #2ecc71' }}>
                        {simulatedApiResult}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
