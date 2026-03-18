import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';

const AddEditCrop = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    totalDurationDays: '',
    imageUrl: '',
    timelineTemplate: []
  });

  // Fetch crop if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      const fetchCrop = async () => {
        try {
          const res = await client.get(`/admin/master-crops/${id}`);
          setFormData(res.data.data);
        } catch (error) {
          console.error('Failed to fetch crop', error);
          alert('Failed to load crop data');
          navigate('/crops');
        } finally {
          setLoading(false);
        }
      };
      fetchCrop();
    }
  }, [isEdit, id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- TIMELINE LOGIC ---
  const addTimelineTask = () => {
    setFormData(prev => ({
      ...prev,
      timelineTemplate: [
        ...prev.timelineTemplate,
        { phase: '', day: '', title: '', instructions: '', taskType: 'general' }
      ]
    }));
  };

  const removeTimelineTask = (index) => {
    const updatedTimeline = [...formData.timelineTemplate];
    updatedTimeline.splice(index, 1);
    setFormData(prev => ({ ...prev, timelineTemplate: updatedTimeline }));
  };

  const handleTaskChange = (index, e) => {
    const { name, value } = e.target;
    const updatedTimeline = [...formData.timelineTemplate];
    
    updatedTimeline[index][name] = name === 'day' ? Number(value) : value;
    
    setFormData(prev => ({ ...prev, timelineTemplate: updatedTimeline }));
  };

  const handleQuillChange = (index, html) => {
    const updatedTimeline = [...formData.timelineTemplate];
    updatedTimeline[index]['instructions'] = html;
    setFormData(prev => ({ ...prev, timelineTemplate: updatedTimeline }));
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (isEdit) {
        await client.put(`/admin/master-crops/${id}`, formData);
      } else {
        await client.post('/admin/master-crops', formData);
      }
      navigate('/crops');
    } catch (error) {
      console.error('Failed to save crop', error);
      alert(error.response?.data?.error || 'Failed to save crop template');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>{isEdit ? 'Edit Master Crop' : 'Create Master Crop'}</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/crops')}>Cancel</button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* TOP HALF: Crop Profile */}
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>1. Crop Details</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Crop Name *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="form-input"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Total Duration (Days) *</label>
              <input 
                type="number" 
                name="totalDurationDays" 
                value={formData.totalDurationDays} 
                onChange={handleChange} 
                required 
                className="form-input"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows="3"
              className="form-input"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)' }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Image URL</label>
            <input 
              type="text" 
              name="imageUrl" 
              value={formData.imageUrl} 
              onChange={handleChange} 
              placeholder="https://example.com/image.jpg"
              className="form-input"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)' }}
            />
          </div>
        </div>

        {/* BOTTOM HALF: Dynamic Timeline */}
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--primary-color)' }}>2. Timeline Tasks</h3>
            <button type="button" className="btn btn-secondary" onClick={addTimelineTask}>
              + Add Task Row
            </button>
          </div>

          {formData.timelineTemplate.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No tasks added yet. Click above to add the first day's step.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {formData.timelineTemplate.map((task, index) => (
                <div key={index} style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'minmax(80px, 1fr) minmax(80px, 1fr) 2fr 3fr 1fr auto', 
                  gap: '1rem', 
                  alignItems: 'start',
                  backgroundColor: 'var(--card-bg, #f7fafc)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  
                  {/* Phase */}
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phase *</label>
                    <input 
                      type="text" 
                      name="phase" 
                      value={task.phase} 
                      onChange={(e) => handleTaskChange(index, e)} 
                      placeholder="e.g. Seedling"
                      required
                      className="form-input"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)' }}
                    />
                  </div>

                  {/* Day */}
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Day *</label>
                    <input 
                      type="number" 
                      name="day" 
                      value={task.day} 
                      onChange={(e) => handleTaskChange(index, e)} 
                      placeholder="e.g. 1"
                      required
                      className="form-input"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)' }}
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Task Title *</label>
                    <input 
                      type="text" 
                      name="title" 
                      value={task.title} 
                      onChange={(e) => handleTaskChange(index, e)} 
                      placeholder="e.g. Apply Fertilizer"
                      required
                      className="form-input"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)' }}
                    />
                  </div>

                  {/* Instructions */}
                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Instructions / Things to do</label>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) => handleQuillChange(index, e.currentTarget.innerHTML)}
                      dangerouslySetInnerHTML={{ __html: task.instructions || '' }}
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--input-bg)',
                        outline: 'none',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        overflowY: 'auto'
                      }}
                    />
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Supports pasting formatted text, bullets, and paragraphs.</p>
                  </div>

                  {/* Task Type */}
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category</label>
                    <select 
                      name="taskType" 
                      value={task.taskType} 
                      onChange={(e) => handleTaskChange(index, e)}
                      className="form-input"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)' }}
                    >
                      <option value="general">General</option>
                      <option value="sowing">Sowing</option>
                      <option value="fertilizer">Fertilizer</option>
                      <option value="pesticide">Pesticide</option>
                      <option value="irrigation">Irrigation</option>
                      <option value="harvest">Harvest</option>
                    </select>
                  </div>

                  {/* Remove Button */}
                  <div style={{ paddingTop: '1.2rem' }}>
                    <button 
                      type="button"
                      onClick={() => removeTimelineTask(index)}
                      style={{ background: 'transparent', border: 'none', color: '#fc8181', cursor: 'pointer', fontSize: '1.2rem' }}
                      title="Remove Row"
                    >
                      ✕
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={saving}
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
        >
          {saving ? 'Saving...' : (isEdit ? 'Update Master Crop' : 'Publish Master Crop')}
        </button>

      </form>
    </div>
  );
};

export default AddEditCrop;
