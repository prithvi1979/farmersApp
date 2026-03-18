import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';

const CATEGORIES = ['General', 'Government Scheme', 'Market Price', 'Weather Alert', 'Pest & Disease', 'Irrigation', 'Subsidy'];

const AddEditNews = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const descRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    description: '',
    content: '',
    imageUrl: '',
    source: '',
    targetState: '',
    targetCity: '',
    targetCrops: '',
    isActive: true,
    expiresAt: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchArticle = async () => {
        try {
          const res = await client.get(`/admin/news/${id}`);
          const data = res.data.data;
          setFormData({
            ...data,
            targetCrops: data.targetCrops?.join(', ') || '',
            expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString().split('T')[0] : '',
          });
          // Populate contentEditable with existing HTML
          if (descRef.current) {
            descRef.current.innerHTML = data.description || '';
          }
        } catch (error) {
          alert('Failed to load article');
          navigate('/news');
        } finally {
          setLoading(false);
        }
      };
      fetchArticle();
    }
  }, [isEdit, id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...formData,
      description: descRef.current?.innerHTML || '',
      targetCrops: formData.targetCrops
        ? formData.targetCrops.split(',').map(c => c.trim()).filter(Boolean)
        : [],
      expiresAt: formData.expiresAt || null,
    };

    try {
      if (isEdit) {
        await client.put(`/admin/news/${id}`, payload);
      } else {
        await client.post('/admin/news', payload);
      }
      navigate('/news');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--input-bg)',
    fontSize: '0.95rem',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>{isEdit ? '✏️ Edit Article' : '📰 Publish News Article'}</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/news')}>Cancel</button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* === SECTION 1: Core Info === */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>1. Article Details</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required style={inputStyle} placeholder="e.g. Government announces new fertilizer subsidy" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Source</label>
              <input type="text" name="source" value={formData.source} onChange={handleChange} style={inputStyle} placeholder="e.g. Govt of Punjab, Krishi Kendra" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Image URL</label>
              <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} style={inputStyle} placeholder="https://example.com/image.jpg" />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>
              Description *&nbsp;
              <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Supports pasting formatted text, bullets, paragraphs)</span>
            </label>
            <div
              ref={descRef}
              contentEditable
              suppressContentEditableWarning
              style={{
                ...inputStyle,
                minHeight: '150px',
                outline: 'none',
                lineHeight: '1.6',
                overflowY: 'auto',
              }}
            />
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>
              Full Article Body
              <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>(Optional — for a "Read more" expanded view)</span>
            </label>
            <textarea name="content" value={formData.content} onChange={handleChange} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Extended article content..." />
          </div>
        </div>

        {/* === SECTION 2: Targeting === */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>2. Targeting</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Leave all blank to show this article to all farmers nationwide (generic).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Target State</label>
              <input type="text" name="targetState" value={formData.targetState} onChange={handleChange} style={inputStyle} placeholder="e.g. Punjab" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Target City / District</label>
              <input type="text" name="targetCity" value={formData.targetCity} onChange={handleChange} style={inputStyle} placeholder="e.g. Ludhiana" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Target Crops</label>
              <input type="text" name="targetCrops" value={formData.targetCrops} onChange={handleChange} style={inputStyle} placeholder="Wheat, Rice, Mustard (comma separated)" />
            </div>
          </div>
        </div>

        {/* === SECTION 3: Lifecycle === */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem', color: 'var(--primary-color)' }}>3. Lifecycle</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Expires On</label>
              <input type="date" name="expiresAt" value={formData.expiresAt} onChange={handleChange} style={inputStyle} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Article auto-hides from farmers after this date.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
              <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              <label htmlFor="isActive" style={{ fontWeight: 500, cursor: 'pointer' }}>
                Active (visible to farmers)
              </label>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
          {saving ? 'Saving...' : (isEdit ? 'Update Article' : 'Publish Article')}
        </button>
      </form>
    </div>
  );
};

export default AddEditNews;
