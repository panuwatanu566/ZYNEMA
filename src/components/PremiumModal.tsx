import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ 
  isOpen, 
  onClose,
  reason = 'สมาชิกสิทธิ์ Free ดูได้แค่ตัวอย่างหนังเท่านั้น กรุณาอัปเกรดเป็น VIP Premium เพื่อรับชมภาพยนตร์เต็มเรื่อง' 
}) => {
  const { isAuthenticated, user, upgradeToPremium } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="custom-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="custom-modal-card">
        {/* Header Ribbon */}
        <div
          className="p-4 text-center text-white"
          style={{
            background: 'linear-gradient(90deg, #e53637, #ff6b6b)',
            position: 'relative'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="border-0 bg-transparent text-white"
            style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              fontSize: '28px',
              lineHeight: '1',
              cursor: 'pointer',
              opacity: 0.9,
              zIndex: 10
            }}
            title="Close Modal (Esc)"
          >
            &times;
          </button>
          <div style={{ fontSize: '38px', marginBottom: '2px' }}>👑</div>
          <h3 className="font-weight-bold mb-1 text-white">UNLOCK ZYNEMA PREMIUM</h3>
          <p className="mb-0 text-white-50 small">รับชมภาพยนตร์ฉบับเต็ม & ซีรีส์ครบทุกตอนในระบบ 4K Ultra HD</p>
        </div>

        {/* Modal Body */}
        <div className="p-4">
          {/* Reason Alert */}
          <div
            className="p-3 mb-4 rounded"
            style={{
              background: 'rgba(229, 54, 55, 0.15)',
              borderLeft: '4px solid #e53637',
              fontSize: '13px',
              color: '#ffffff'
            }}
          >
            <i className="fa fa-lock mr-2 text-danger"></i> {reason}
          </div>

          {/* Benefits List */}
          <ul className="list-unstyled mb-4" style={{ fontSize: '14px', lineHeight: '2.1' }}>
            <li className="d-flex align-items-center mb-2">
              <i className="fa fa-check-circle text-success mr-3" style={{ fontSize: '18px' }}></i>
              <span><strong>ดูหนังเต็มเรื่อง:</strong> ปลดล็อกภาพยนตร์และซีรีส์ครบทุกตอนจาก TVMaze</span>
            </li>
            <li className="d-flex align-items-center mb-2">
              <i className="fa fa-check-circle text-success mr-3" style={{ fontSize: '18px' }}></i>
              <span><strong>Ultra HD 4K & HDR:</strong> คมชัดระดับภาพยนตร์พร้อมระบบเสียงรอบทิศทาง</span>
            </li>
            <li className="d-flex align-items-center mb-2">
              <i className="fa fa-check-circle text-success mr-3" style={{ fontSize: '18px' }}></i>
              <span><strong>Ad-Free Experience:</strong> สตรีมมิ่งต่อเนื่อง ไม่มีโฆษณาคั่น</span>
            </li>
            <li className="d-flex align-items-center mb-2">
              <i className="fa fa-check-circle text-success mr-3" style={{ fontSize: '18px' }}></i>
              <span><strong>3 Video Servers:</strong> มีเซิร์ฟเวอร์สำรองให้เลือกสลับรับชมได้อย่างอิสระ</span>
            </li>
          </ul>

          {/* Upgrade Action */}
          {isAuthenticated ? (
            <div>
              <div className="text-center mb-3">
                <span className="badge badge-secondary p-2 mr-2">
                  สถานะปัจจุบัน: {user?.tier === 'premium' ? '👑 VIP' : 'FREE'}
                </span>
                <span className="text-muted small">&bull; อัปเกรดและเปิดดูได้ทันที</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  upgradeToPremium();
                  onClose();
                }}
                className="btn btn-danger btn-block py-3 font-weight-bold"
                style={{
                  background: 'linear-gradient(90deg, #e53637, #f05051)',
                  borderRadius: '30px',
                  fontSize: '15px',
                  letterSpacing: '1px',
                  boxShadow: '0 8px 25px rgba(229, 54, 55, 0.4)'
                }}
              >
                <i className="fa fa-bolt mr-2"></i> UPGRADE TO PREMIUM (FREE DEMO)
              </button>
            </div>
          ) : (
            <div>
              <p className="text-center text-muted small mb-3">
                กรุณาเข้าสู่ระบบหรือสมัครสมาชิกเพื่อเปิดใช้งาน ZYNEMA Premium
              </p>
              <div className="d-flex gap-2" style={{ gap: '10px' }}>
                <Link
                  to="/login"
                  onClick={onClose}
                  className="btn btn-outline-light flex-fill py-2 text-center"
                  style={{ borderRadius: '25px' }}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={onClose}
                  className="btn btn-danger flex-fill py-2 text-center"
                  style={{ borderRadius: '25px' }}
                >
                  Create Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
