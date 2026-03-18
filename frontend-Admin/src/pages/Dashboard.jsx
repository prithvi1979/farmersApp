import React, { useState, useEffect } from 'react';
import client from '../api/client';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCrops: 0,
    totalPosts: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await client.get('/admin/stats');
        setStats(response.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        
        <div className="glass-card" style={{ borderLeft: '4px solid #3182ce' }}>
          <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Users</h4>
          <h2 style={{ fontSize: '2.5rem', color: '#2b6cb0' }}>{stats.totalUsers}</h2>
        </div>
        
        <div className="glass-card" style={{ borderLeft: '4px solid #38a169' }}>
          <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Active Crops</h4>
          <h2 style={{ fontSize: '2.5rem', color: '#2f855a' }}>{stats.activeCrops}</h2>
        </div>
        
        <div className="glass-card" style={{ borderLeft: '4px solid #dd6b20' }}>
          <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Community Posts</h4>
          <h2 style={{ fontSize: '2.5rem', color: '#c05621' }}>{stats.totalPosts}</h2>
        </div>
        
        <div className="glass-card" style={{ borderLeft: '4px solid #805ad5' }}>
          <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Market Products</h4>
          <h2 style={{ fontSize: '2.5rem', color: '#6b46c1' }}>{stats.totalProducts}</h2>
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
