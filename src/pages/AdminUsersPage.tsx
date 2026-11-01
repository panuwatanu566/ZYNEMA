import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, getErrorMessage } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { User, PageMeta, UserStats, UserRole, UserStatus } from '../types/zynema';
import { Breadcrumb } from '../components/Breadcrumb';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query parameters
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const role = (searchParams.get('role') as UserRole) || '';
  const status = (searchParams.get('status') as UserStatus) || '';
  const sort = (searchParams.get('sort') as 'createdAt' | 'name' | 'email') || 'createdAt';
  const order = (searchParams.get('order') as 'asc' | 'desc') || 'desc';

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchInput, setSearchInput] = useState<string>(search);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Sync search input state with URL param
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Debounce search update to URL (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        if (searchInput.trim()) {
          p.set('search', searchInput.trim());
        } else {
          p.delete('search');
        }
        p.set('page', '1');
        return p;
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, setSearchParams]);

  // Fetch Users and Stats
  const loadData = useCallback(async () => {
    setLoading(true);
    setAlertMessage(null);
    try {
      const query = new URLSearchParams();
      query.set('page', String(page));
      query.set('limit', '10');
      if (search) query.set('search', search);
      if (role) query.set('role', role);
      if (status) query.set('status', status);
      query.set('sort', sort);
      query.set('order', order);

      const [usersRes, statsRes] = await Promise.all([
        api.get(`/admin/users?${query.toString()}`),
        api.get('/admin/users/stats').catch(() => null)
      ]);

      setUsers(usersRes.data.data);
      if (usersRes.data.meta) {
        setMeta(usersRes.data.meta);
      }
      if (statsRes?.data?.data) {
        setStats(statsRes.data.data);
      }
    } catch (err: any) {
      setAlertMessage({ type: 'danger', text: getErrorMessage(err, 'โหลดข้อมูลผู้ใช้ไม่สำเร็จ') });
    } finally {
      setLoading(false);
    }
  }, [page, search, role, status, sort, order]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper to update URL params
  const updateParams = (newParams: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([k, v]) => {
        if (v === null || v === '') {
          p.delete(k);
        } else {
          p.set(k, v);
        }
      });
      return p;
    });
  };

  // Sort toggle by column
  const handleSort = (column: 'createdAt' | 'name' | 'email') => {
    if (sort === column) {
      updateParams({ order: order === 'asc' ? 'desc' : 'asc', page: '1' });
    } else {
      updateParams({ sort: column, order: 'desc', page: '1' });
    }
  };

  // Change Role (USER | EDITOR)
  const handleChangeRole = async (targetUser: User, newRole: 'USER' | 'EDITOR') => {
    if (targetUser.role === newRole) return;
    setActionLoadingId(targetUser.id);
    try {
      const res = await api.patch(`/admin/users/${targetUser.id}/role`, { role: newRole });
      const updatedUser = res.data.data;
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, role: updatedUser.role } : u)));
      setAlertMessage({ type: 'success', text: `เปลี่ยนสิทธิ์ของ ${targetUser.name} เป็น ${newRole} สำเร็จ` });
      // Refresh stats
      api.get('/admin/users/stats').then((res) => setStats(res.data.data)).catch(() => {});
    } catch (err: any) {
      setAlertMessage({ type: 'danger', text: getErrorMessage(err, 'เปลี่ยนสิทธิ์ไม่สำเร็จ') });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Ban / Unban Status
  const handleToggleStatus = async (targetUser: User) => {
    const nextStatus: UserStatus = targetUser.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    const confirmAction = window.confirm(
      nextStatus === 'BANNED'
        ? `ยืนยันการระงับสิทธิ์ (BAN) บัญชี "${targetUser.name}" หรือไม่? ผู้ใช้จะถูกออกจากระบบทันที`
        : `ยืนยันการเปิดใช้งานบัญชี "${targetUser.name}" อีกครั้งหรือไม่?`
    );
    if (!confirmAction) return;

    setActionLoadingId(targetUser.id);
    try {
      const res = await api.patch(`/admin/users/${targetUser.id}/status`, { status: nextStatus });
      const updatedUser = res.data.data;
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, status: updatedUser.status } : u)));
      setAlertMessage({
        type: 'success',
        text: `${nextStatus === 'BANNED' ? 'ระงับบัญชี' : 'เปิดใช้งานบัญชี'} "${targetUser.name}" เรียบร้อยแล้ว`
      });
      // Refresh stats
      api.get('/admin/users/stats').then((res) => setStats(res.data.data)).catch(() => {});
    } catch (err: any) {
      setAlertMessage({ type: 'danger', text: getErrorMessage(err, 'อัปเดตสถานะไม่สำเร็จ') });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete User
  const handleDeleteUser = async (targetUser: User) => {
    const confirmAction = window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี "${targetUser.name}" (${targetUser.email}) ถาวร?`);
    if (!confirmAction) return;

    setActionLoadingId(targetUser.id);
    try {
      await api.delete(`/admin/users/${targetUser.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
      setAlertMessage({ type: 'success', text: `ลบบัญชี "${targetUser.name}" เรียบร้อยแล้ว` });
      // Refresh list
      loadData();
    } catch (err: any) {
      setAlertMessage({ type: 'danger', text: getErrorMessage(err, 'ลบบัญชีไม่สำเร็จ') });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'แดชบอร์ดผู้ดูแล', to: '/admin/users' },
          { label: 'จัดการผู้ใช้และสิทธิ์ (Users & Roles)' }
        ]}
      />

      <section className="spad pt-2">
        <div className="container">
          {/* Header Title Bar */}
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap" style={{ gap: '15px' }}>
            <div>
              <h3 className="text-white font-weight-bold mb-1">
                <i className="fa fa-users text-danger mr-2"></i> จัดการผู้ใช้และสิทธิ์ (Admin Users)
              </h3>
              <p className="text-muted small mb-0">
                จัดการรายชื่อผู้ใช้ ค้นหา กรองบทบาท (Role) เปลี่ยนสิทธิ์ และระงับบัญชีตามมาตรฐาน React Course API
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="btn btn-sm btn-outline-light d-inline-flex align-items-center"
              style={{ borderRadius: '9999px', padding: '8px 18px' }}
            >
              <i className="fa fa-refresh mr-2"></i> รีเฟรชข้อมูล
            </button>
          </div>

          {/* Alert Banner */}
          {alertMessage && (
            <div
              className={`alert alert-${alertMessage.type} py-2 px-3 mb-4 rounded d-flex align-items-center justify-content-between`}
              role="alert"
            >
              <div>
                <i className={`fa ${alertMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2`}></i>
                {alertMessage.text}
              </div>
              <button
                type="button"
                className="close text-white"
                onClick={() => setAlertMessage(null)}
                style={{ outline: 'none' }}
              >
                &times;
              </button>
            </div>
          )}

          {/* Stats Cards (/admin/users/stats) */}
          {stats && (
            <div className="row mb-4">
              <div className="col-lg-3 col-md-6 mb-3">
                <div
                  className="p-3 rounded"
                  style={{
                    background: 'rgba(14, 18, 44, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px'
                  }}
                >
                  <div className="text-muted small mb-1">ผู้ใช้ทั้งหมด (Total)</div>
                  <div className="h3 font-weight-bold text-white mb-0">{stats.total}</div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-3">
                <div
                  className="p-3 rounded"
                  style={{
                    background: 'rgba(14, 18, 44, 0.7)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '14px'
                  }}
                >
                  <div className="text-muted small mb-1">แบ่งตามบทบาท (By Role)</div>
                  <div className="small text-white">
                    <span className="badge badge-warning text-dark font-weight-bold mr-1">ADMIN: {stats.byRole.ADMIN}</span>
                    <span className="badge badge-info mr-1">EDITOR: {stats.byRole.EDITOR}</span>
                    <span className="badge badge-secondary">USER: {stats.byRole.USER}</span>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-3">
                <div
                  className="p-3 rounded"
                  style={{
                    background: 'rgba(14, 18, 44, 0.7)',
                    border: '1px solid rgba(46, 204, 113, 0.25)',
                    borderRadius: '14px'
                  }}
                >
                  <div className="text-muted small mb-1">สถานะใช้งานปกติ (Active)</div>
                  <div className="h3 font-weight-bold text-success mb-0">{stats.byStatus.ACTIVE}</div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-3">
                <div
                  className="p-3 rounded"
                  style={{
                    background: 'rgba(14, 18, 44, 0.7)',
                    border: '1px solid rgba(231, 76, 60, 0.25)',
                    borderRadius: '14px'
                  }}
                >
                  <div className="text-muted small mb-1">ถูกระงับสิทธิ์ (Banned)</div>
                  <div className="h3 font-weight-bold text-danger mb-0">{stats.byStatus.BANNED}</div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Bar (Synchronized with URL params) */}
          <div
            className="p-3 mb-4 rounded d-flex flex-wrap align-items-center justify-content-between"
            style={{
              background: 'rgba(14, 18, 44, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              gap: '12px'
            }}
          >
            {/* Search Input (Debounced) */}
            <div className="flex-grow-1" style={{ minWidth: '240px' }}>
              <div className="position-relative">
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ หรืออีเมล..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="form-control"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    borderRadius: '9999px',
                    paddingLeft: '38px'
                  }}
                />
                <i
                  className="fa fa-search position-absolute text-muted"
                  style={{ left: '14px', top: '12px' }}
                ></i>
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="position-absolute border-0 bg-transparent text-muted"
                    style={{ right: '12px', top: '8px', cursor: 'pointer' }}
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>

            {/* Filter by Role */}
            <div className="d-flex align-items-center">
              <span className="text-muted small mr-2">Role:</span>
              <select
                value={role}
                onChange={(e) => updateParams({ role: e.target.value || null, page: '1' })}
                className="custom-select custom-select-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  borderRadius: '8px',
                  width: '120px'
                }}
              >
                <option value="" style={{ background: '#0e1035' }}>ทั้งหมด</option>
                <option value="USER" style={{ background: '#0e1035' }}>USER</option>
                <option value="EDITOR" style={{ background: '#0e1035' }}>EDITOR</option>
                <option value="ADMIN" style={{ background: '#0e1035' }}>ADMIN</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div className="d-flex align-items-center">
              <span className="text-muted small mr-2">Status:</span>
              <select
                value={status}
                onChange={(e) => updateParams({ status: e.target.value || null, page: '1' })}
                className="custom-select custom-select-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  borderRadius: '8px',
                  width: '120px'
                }}
              >
                <option value="" style={{ background: '#0e1035' }}>ทั้งหมด</option>
                <option value="ACTIVE" style={{ background: '#0e1035' }}>ACTIVE</option>
                <option value="BANNED" style={{ background: '#0e1035' }}>BANNED</option>
              </select>
            </div>
          </div>

          {/* Table Card */}
          <div
            className="rounded overflow-hidden"
            style={{
              background: 'rgba(14, 18, 44, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
            }}
          >
            {loading ? (
              <div className="py-5 text-center">
                <LoadingSpinner message="กำลังโหลดรายชื่อผู้ใช้จากเซิร์ฟเวอร์..." minHeight="300px" />
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover mb-0" style={{ background: 'transparent' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <th
                        onClick={() => handleSort('name')}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        className="py-3 pl-4"
                      >
                        ชื่อผู้ใช้ {sort === 'name' && (order === 'asc' ? '▲' : '▼')}
                      </th>
                      <th
                        onClick={() => handleSort('email')}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        className="py-3"
                      >
                        อีเมล {sort === 'email' && (order === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="py-3">บทบาท (Role)</th>
                      <th className="py-3">สถานะ (Status)</th>
                      <th
                        onClick={() => handleSort('createdAt')}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        className="py-3"
                      >
                        วันที่สร้าง {sort === 'createdAt' && (order === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="py-3 text-right pr-4">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-white-50">
                          ไม่พบข้อมูลผู้ใช้ที่ตรงกับเงื่อนไขการค้นหา
                        </td>
                      </tr>
                    ) : (
                      users.map((targetUser) => {
                        const isSelf = targetUser.id === currentUser?.id;
                        const isDisabled = targetUser.isProtected || targetUser.role === 'ADMIN' || isSelf;
                        const isBusy = actionLoadingId === targetUser.id;

                        return (
                          <tr key={targetUser.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            {/* Name & Avatar */}
                            <td className="py-3 pl-4">
                              <div className="d-flex align-items-center">
                                {targetUser.avatarUrl ? (
                                  <img
                                    src={targetUser.avatarUrl}
                                    alt={targetUser.name}
                                    className="rounded-circle mr-3"
                                    style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div
                                    className="rounded-circle mr-3 d-flex align-items-center justify-content-center font-weight-bold"
                                    style={{
                                      width: '36px',
                                      height: '36px',
                                      background: targetUser.role === 'ADMIN' ? '#f59e0b' : '#334155',
                                      color: targetUser.role === 'ADMIN' ? '#0f172a' : '#ffffff',
                                      fontSize: '13px'
                                    }}
                                  >
                                    {targetUser.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="font-weight-bold text-white">
                                    {targetUser.name}
                                    {isSelf && <span className="badge badge-info ml-2">บัญชีของคุณ</span>}
                                    {targetUser.isProtected && (
                                      <span className="badge badge-secondary ml-1" title="บัญชีตัวอย่างที่ใช้ร่วมกัน แก้ไขไม่ได้">
                                        Protected
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="py-3 text-white-50 small align-middle">
                              {targetUser.email}
                            </td>

                            {/* Role Dropdown */}
                            <td className="py-3 align-middle">
                              {targetUser.role === 'ADMIN' || isDisabled ? (
                                <span
                                  className={`badge ${
                                    targetUser.role === 'ADMIN'
                                      ? 'badge-warning text-dark font-weight-bold'
                                      : targetUser.role === 'EDITOR'
                                      ? 'badge-info'
                                      : 'badge-secondary'
                                  } px-2 py-1`}
                                >
                                  {targetUser.role}
                                </span>
                              ) : (
                                <select
                                  value={targetUser.role}
                                  onChange={(e) => handleChangeRole(targetUser, e.target.value as any)}
                                  disabled={isBusy}
                                  className="custom-select custom-select-sm"
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: targetUser.role === 'EDITOR' ? '#00d2d3' : '#ffffff',
                                    borderRadius: '6px',
                                    width: '100px',
                                    fontWeight: 600
                                  }}
                                >
                                  <option value="USER" style={{ background: '#0e1035' }}>USER</option>
                                  <option value="EDITOR" style={{ background: '#0e1035' }}>EDITOR</option>
                                </select>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3 align-middle">
                              <span
                                className={`badge ${
                                  targetUser.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'
                                } px-2 py-1`}
                              >
                                {targetUser.status}
                              </span>
                            </td>

                            {/* Created At */}
                            <td className="py-3 text-muted small align-middle">
                              {new Date(targetUser.createdAt).toLocaleDateString()}
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3 text-right pr-4 align-middle">
                              <div className="d-inline-flex" style={{ gap: '6px' }}>
                                {/* Ban / Unban */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(targetUser)}
                                  disabled={isDisabled || isBusy}
                                  title={targetUser.status === 'ACTIVE' ? 'ระงับบัญชี (BAN)' : 'เปิดใช้งานบัญชี (UNBAN)'}
                                  className={`btn btn-sm ${
                                    targetUser.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'
                                  }`}
                                  style={{ borderRadius: '6px', fontSize: '11px', padding: '4px 10px' }}
                                >
                                  {targetUser.status === 'ACTIVE' ? (
                                    <>
                                      <i className="fa fa-ban mr-1"></i> BAN
                                    </>
                                  ) : (
                                    <>
                                      <i className="fa fa-check mr-1"></i> UNBAN
                                    </>
                                  )}
                                </button>

                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(targetUser)}
                                  disabled={isDisabled || isBusy}
                                  title="ลบบัญชีผู้ใช้นี้"
                                  className="btn btn-sm btn-outline-secondary text-danger"
                                  style={{ borderRadius: '6px', fontSize: '11px', padding: '4px 8px' }}
                                >
                                  <i className="fa fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <div
                className="p-3 d-flex align-items-center justify-content-between flex-wrap"
                style={{ background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <div className="small text-muted mb-2 mb-sm-0">
                  แสดงหน้า {meta.page} จาก {meta.totalPages} (ผู้ใช้ทั้งหมด {meta.total} คน)
                </div>

                <div className="btn-group btn-group-sm">
                  {/* Prev */}
                  <button
                    type="button"
                    onClick={() => updateParams({ page: String(Math.max(1, page - 1)) })}
                    disabled={page <= 1}
                    className="btn btn-dark text-white"
                  >
                    <i className="fa fa-chevron-left mr-1"></i> ก่อนหน้า
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: meta.totalPages }).map((_, idx) => {
                    const pNum = idx + 1;
                    return (
                      <button
                        key={pNum}
                        type="button"
                        onClick={() => updateParams({ page: String(pNum) })}
                        className={`btn ${page === pNum ? 'btn-danger font-weight-bold' : 'btn-dark text-white'}`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  {/* Next */}
                  <button
                    type="button"
                    onClick={() => updateParams({ page: String(Math.min(meta.totalPages, page + 1)) })}
                    disabled={page >= meta.totalPages}
                    className="btn btn-dark text-white"
                  >
                    ถัดไป <i className="fa fa-chevron-right ml-1"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};
