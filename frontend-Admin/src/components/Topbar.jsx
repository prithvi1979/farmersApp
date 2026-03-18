import React from 'react';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <header className="topbar glass-card" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '2rem',
      padding: '1rem 2rem'
    }}>
      <div>
        <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Admin Dashboard</h3>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Welcome back, Super Admin</p>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button 
            onClick={handleLogout}
            style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontWeight: '500'
            }}
        >
            Logout
        </button>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold'
        }}>
          A
        </div>
      </div>
    </header>
  );
};

export default Topbar;
