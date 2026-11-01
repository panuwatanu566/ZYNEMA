import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Breadcrumb } from '../components/Breadcrumb';

export const ForbiddenPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Breadcrumb items={[{ label: '403 Forbidden' }]} />

      <section className="spad pt-5 pb-5 text-center text-white">
        <div className="container">
          <div
            className="p-5 rounded mx-auto"
            style={{
              maxWidth: '620px',
              background: 'rgba(14, 18, 44, 0.75)',
              border: '1px solid rgba(229, 54, 55, 0.4)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
            }}
          >
            <div
              className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
              style={{
                width: '80px',
                height: '80px',
                background: 'rgba(229, 54, 55, 0.15)',
                color: '#ff5252',
                fontSize: '36px',
                border: '1px solid rgba(229, 54, 55, 0.3)'
              }}
            >
              <i className="fa fa-lock"></i>
            </div>

            <h2 className="font-weight-bold text-white mb-2">403 — คุณไม่มีสิทธิ์เข้าหน้านี้</h2>
            <p className="text-white-50 mb-4">
              หน้านี้สงวนสิทธิ์เฉพาะผู้ใช้ที่มีระดับสิทธิ์ (Role) ตามที่ระบบกำหนดเท่านั้น<br />
              {user && (
                <span className="badge badge-dark border border-secondary mt-2 px-3 py-2 text-warning">
                  สิทธิ์ปัจจุบันของคุณ: <strong>{user.role}</strong>
                </span>
              )}
            </p>

            <div className="d-flex justify-content-center flex-wrap" style={{ gap: '12px' }}>
              <Link to="/" className="primary-btn">
                <i className="fa fa-home mr-1"></i> กลับสู่หน้าแรก
              </Link>
              <Link to="/roles" className="btn btn-outline-info" style={{ borderRadius: '9999px', padding: '10px 22px' }}>
                <i className="fa fa-shield mr-1"></i> ตรวจสอบสิทธิ์ใน Route Guard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
