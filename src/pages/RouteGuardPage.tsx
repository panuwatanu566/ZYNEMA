import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { tokenStore } from '../lib/api';
import { Breadcrumb } from '../components/Breadcrumb';

interface EndpointTestResult {
  endpoint: string;
  requiredRole: string;
  status: number | null;
  success: boolean | null;
  data: any;
  error: any;
  stoppedAtStep: number; // 1: TOKEN_MISSING, 2: TOKEN_INVALID, 3: ACCOUNT_BANNED, 4: FORBIDDEN, 5: PASSED
  loading: boolean;
}

export const RouteGuardPage: React.FC = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [attachToken, setAttachToken] = useState<boolean>(true);
  const [results, setResults] = useState<Record<string, EndpointTestResult>>({
    public: { endpoint: '/demo/public', requiredRole: 'ทุกคนเข้าได้ (Public)', status: null, success: null, data: null, error: null, stoppedAtStep: 5, loading: false },
    user: { endpoint: '/demo/user', requiredRole: 'USER, EDITOR, ADMIN (ต้อง Login)', status: null, success: null, data: null, error: null, stoppedAtStep: 1, loading: false },
    editor: { endpoint: '/demo/editor', requiredRole: 'EDITOR หรือ ADMIN', status: null, success: null, data: null, error: null, stoppedAtStep: 1, loading: false },
    admin: { endpoint: '/demo/admin', requiredRole: 'ADMIN เท่านั้น', status: null, success: null, data: null, error: null, stoppedAtStep: 1, loading: false }
  });

  const baseURL = import.meta.env.VITE_API_URL || 'https://react-api.dev2life.workers.dev/api/v1';

  // Run tests on all 4 endpoints
  const runTests = async () => {
    const endpoints = [
      { key: 'public', path: '/demo/public' },
      { key: 'user', path: '/demo/user' },
      { key: 'editor', path: '/demo/editor' },
      { key: 'admin', path: '/demo/admin' }
    ];

    // Set loading
    setResults((prev) => {
      const next = { ...prev };
      endpoints.forEach(({ key }) => {
        next[key] = { ...next[key], loading: true };
      });
      return next;
    });

    for (const { key, path } of endpoints) {
      try {
        const headers: Record<string, string> = {};
        if (attachToken && tokenStore.access) {
          headers['Authorization'] = `Bearer ${tokenStore.access}`;
        }

        const res = await axios.get(`${baseURL}${path}`, { headers });
        setResults((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            status: res.status,
            success: true,
            data: res.data,
            error: null,
            stoppedAtStep: 5, // Passed all checks!
            loading: false
          }
        }));
      } catch (err: any) {
        const status = err.response?.status || 0;
        const errData = err.response?.data?.error || null;
        const code = errData?.code;

        let stoppedAt = 1;
        if (code === 'TOKEN_MISSING') stoppedAt = 1;
        else if (code === 'TOKEN_INVALID' || code === 'TOKEN_EXPIRED') stoppedAt = 2;
        else if (code === 'ACCOUNT_BANNED') stoppedAt = 3;
        else if (code === 'FORBIDDEN') stoppedAt = 4;

        setResults((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            status,
            success: false,
            data: null,
            error: errData || { message: err.message },
            stoppedAtStep: stoppedAt,
            loading: false
          }
        }));
      }
    }
  };

  // Run on mount or when token/user changes
  useEffect(() => {
    runTests();
  }, [user, attachToken]);

  // Quick switch demo accounts
  const handleQuickSwitch = async (email: string) => {
    try {
      await login(email, 'Password123', true);
    } catch {
      // Ignored for banned test
    }
  };

  const getStepBadge = (step: number, currentStopped: number, isSuccess: boolean | null) => {
    if (isSuccess) {
      return <span className="badge badge-success px-2 py-1">ผ่าน (200 OK)</span>;
    }
    if (step === currentStopped) {
      return <span className="badge badge-danger px-2 py-1">หยุดที่ขั้นนี้ ✗</span>;
    }
    if (step < currentStopped) {
      return <span className="badge badge-secondary px-2 py-1">ผ่าน ✓</span>;
    }
    return <span className="badge badge-dark text-muted px-2 py-1">ข้าม</span>;
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'แดชบอร์ด', to: '/' },
          { label: 'ทดสอบ Route Guard & สิทธิ์ 2 ชั้น (Demo API)' }
        ]}
      />

      <section className="spad pt-2">
        <div className="container">
          {/* Header Description */}
          <div className="mb-4">
            <h3 className="text-white font-weight-bold mb-2">
              <i className="fa fa-shield text-warning mr-2"></i> Route Guard & การตรวจสิทธิ์ 2 ชั้น (4 ลำดับ)
            </h3>
            <p className="text-white-50">
              ทดสอบการเรียกใช้งาน Endpoint ทั้ง 4 ระดับของหมวด <code>/api/v1/demo/*</code> เพื่อศึกษาว่า Server ตรวจสอบสิทธิ์อย่างไร
              และ React สามารถจัดการ UI ตามบทบาท (Role) ของผู้ใช้ได้อย่างไร
            </p>
          </div>

          {/* Quick Account Switcher & Token Toggle Bar */}
          <div
            className="p-4 mb-4 rounded d-flex flex-wrap align-items-center justify-content-between"
            style={{
              background: 'rgba(14, 18, 44, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              gap: '15px'
            }}
          >
            <div>
              <div className="text-muted small text-uppercase font-weight-bold mb-2">
                สลับบัญชีทดสอบด่วน (Quick Switch):
              </div>
              <div className="d-flex flex-wrap" style={{ gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickSwitch('user@demo.com')}
                  className={`btn btn-sm ${user?.role === 'USER' ? 'btn-info font-weight-bold' : 'btn-outline-info'}`}
                  style={{ borderRadius: '9999px', fontSize: '12px' }}
                >
                  <i className="fa fa-user mr-1"></i> USER
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSwitch('editor@demo.com')}
                  className={`btn btn-sm ${user?.role === 'EDITOR' ? 'btn-primary font-weight-bold' : 'btn-outline-primary'}`}
                  style={{ borderRadius: '9999px', fontSize: '12px' }}
                >
                  <i className="fa fa-pencil mr-1"></i> EDITOR
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSwitch('admin@demo.com')}
                  className={`btn btn-sm ${user?.role === 'ADMIN' ? 'btn-warning text-dark font-weight-bold' : 'btn-outline-warning'}`}
                  style={{ borderRadius: '9999px', fontSize: '12px' }}
                >
                  <i className="fa fa-crown mr-1"></i> ADMIN
                </button>
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="btn btn-sm btn-outline-danger"
                    style={{ borderRadius: '9999px', fontSize: '12px' }}
                  >
                    <i className="fa fa-sign-out mr-1"></i> ไม่ Login (Guest)
                  </button>
                )}
              </div>
            </div>

            <div className="d-flex align-items-center flex-wrap" style={{ gap: '15px' }}>
              {/* Token Switch */}
              <div className="d-flex align-items-center">
                <label className="d-flex align-items-center text-white mb-0" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={attachToken}
                    onChange={(e) => setAttachToken(e.target.checked)}
                    className="mr-2"
                    style={{ width: '18px', height: '18px', accentColor: '#e53637' }}
                  />
                  <span className="small font-weight-bold">
                    {attachToken ? '✓ แนบ Authorization Token' : '✗ ไม่แนบ Token (จำลอง Token หาย)'}
                  </span>
                </label>
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={runTests}
                className="btn btn-sm btn-danger px-3 py-2"
                style={{ borderRadius: '9999px', fontSize: '12px', fontWeight: 600 }}
              >
                <i className="fa fa-refresh mr-1"></i> ทดสอบเรียกทั้ง 4 Endpoint
              </button>
            </div>
          </div>

          {/* Current Auth Status Summary */}
          <div
            className="p-3 mb-4 rounded d-flex align-items-center justify-content-between flex-wrap"
            style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)' }}
          >
            <div>
              <span className="text-muted small mr-2">สถานะผู้ใช้ปัจจุบัน:</span>
              {user ? (
                <span>
                  <strong className="text-white mr-2">{user.name}</strong>
                  <span className="badge badge-warning text-dark font-weight-bold mr-2">Role: {user.role}</span>
                  <span className="badge badge-secondary">{user.email}</span>
                </span>
              ) : (
                <span className="badge badge-secondary">ยังไม่ได้เข้าสู่ระบบ (Guest / Unauthenticated)</span>
              )}
            </div>
            <div className="small text-muted">
              Token ในเครื่อง: {tokenStore.access ? <span className="text-success">มี Token พร้อมใช้งาน</span> : <span className="text-danger">ไม่มี Token</span>}
            </div>
          </div>

          {/* 4 Cards Grid */}
          <div className="row">
            {Object.entries(results).map(([key, res]) => {
              const is200 = res.status === 200;
              const is403 = res.status === 403;
              const is401 = res.status === 401;

              return (
                <div key={key} className="col-lg-6 col-md-12 mb-4">
                  <div
                    className="p-4 rounded h-100 d-flex flex-column"
                    style={{
                      background: 'rgba(14, 18, 44, 0.75)',
                      border: is200
                        ? '1px solid rgba(46, 204, 113, 0.4)'
                        : is403
                        ? '1px solid rgba(245, 158, 11, 0.4)'
                        : '1px solid rgba(231, 76, 60, 0.4)',
                      borderRadius: '16px',
                      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    {/* Card Header */}
                    <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-dark pb-2">
                      <div>
                        <h5 className="font-weight-bold text-white mb-0">GET {res.endpoint}</h5>
                        <div className="small text-muted">{res.requiredRole}</div>
                      </div>
                      <div>
                        {res.loading ? (
                          <span className="spinner-border spinner-border-sm text-danger" role="status"></span>
                        ) : is200 ? (
                          <span className="badge badge-success px-2 py-1 font-weight-bold">HTTP 200 OK</span>
                        ) : (
                          <span className="badge badge-danger px-2 py-1 font-weight-bold">HTTP {res.status || 'ERR'}</span>
                        )}
                      </div>
                    </div>

                    {/* 4 Steps Checklist Flow */}
                    <div className="mb-3 small p-3 rounded" style={{ background: 'rgba(0, 0, 0, 0.35)' }}>
                      <div className="text-muted font-weight-bold mb-2">ลำดับการตรวจของ Server:</div>
                      <div className="d-flex flex-column" style={{ rowGap: '6px' }}>
                        <div className="d-flex align-items-center justify-content-between">
                          <span>1. มี Token แนบมาไหม?</span>
                          {getStepBadge(1, res.stoppedAtStep, res.success)}
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <span>2. Token ถูกต้องและไม่หมดอายุ?</span>
                          {getStepBadge(2, res.stoppedAtStep, res.success)}
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <span>3. บัญชีเปิดใช้งานปกติ (ไม่ถูก BAN)?</span>
                          {getStepBadge(3, res.stoppedAtStep, res.success)}
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <span>4. บทบาท (Role) ตรงตามที่อนุญาต?</span>
                          {getStepBadge(4, res.stoppedAtStep, res.success)}
                        </div>
                      </div>
                    </div>

                    {/* Result Response Box */}
                    <div className="mt-auto">
                      <div className="small text-muted font-weight-bold mb-1">ผลลัพธ์ (Response):</div>
                      <pre
                        className="p-2 rounded small mb-0 text-truncate"
                        style={{
                          background: '#070814',
                          color: is200 ? '#2ecc71' : '#e74c3c',
                          maxHeight: '120px',
                          overflowY: 'auto',
                          fontSize: '11.5px',
                          border: '1px solid rgba(255, 255, 255, 0.06)'
                        }}
                      >
                        {JSON.stringify(res.data || res.error, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};
