import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useNavigate } from 'react-router-dom';

const MasterCrops = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCrops = async () => {
    try {
      const response = await client.get('/admin/master-crops');
      setCrops(response.data.data);
    } catch (error) {
      console.error('Failed to fetch crops', error);
      alert('Failed to load Master Crops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Master Crop?')) {
      try {
        await client.delete(`/admin/master-crops/${id}`);
        fetchCrops(); // Refresh list
      } catch (error) {
        console.error('Failed to delete crop', error);
        alert('Failed to delete Master Crop');
      }
    }
  };

  if (loading) return <p>Loading Master Crops...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Master Crops</h2>
        <button className="btn btn-primary" onClick={() => navigate('/crops/add')}>+ Create Crop</button>
      </div>
      
      <div className="glass-card">
        {crops.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No Master Crops found. Create your first crop template.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Duration (Days)</th>
                <th style={{ padding: '1rem' }}>Timeline Tasks</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {crops.map((crop) => (
                <tr key={crop._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>{crop.name}</td>
                  <td style={{ padding: '1rem' }}>{crop.totalDurationDays}</td>
                  <td style={{ padding: '1rem' }}>{crop.timelineTemplate?.length || 0} tasks</td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ marginRight: '0.5rem', padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                      onClick={() => navigate(`/crops/edit/${crop._id}`)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ backgroundColor: '#c53030', borderColor: '#c53030', color: 'white', padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                      onClick={() => handleDelete(crop._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MasterCrops;
