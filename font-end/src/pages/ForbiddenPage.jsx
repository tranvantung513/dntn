import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ForbiddenPage = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      fontFamily: 'Inter, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        textAlign: 'center',
        maxWidth: '480px',
        width: '100%'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#fee2e2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <ShieldAlert size={40} color="#ef4444" />
        </div>
        
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 12px 0' }}>403 - Truy cập bị từ chối</h1>
        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: '0 0 32px 0' }}>
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là một sự nhầm lẫn.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: 'white',
              color: '#475569',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={18} /> Quay lại
          </button>

          <Link to={userRole === 'ADMIN' ? '/admin' : '/'} style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: '#0ea5e9',
              color: 'white',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}>
              <Home size={18} /> Về trang chủ
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
