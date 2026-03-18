import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';

const CATEGORIES = [
  { value: 'diseases', label: '🦠 Diseases' },
  { value: 'pests', label: '🐛 Pests' },
  { value: 'general', label: '📄 General' },
  { value: 'techniques', label: '🔧 Techniques' },
  { value: 'fertilizers', label: '🧪 Fertilizers' },
  { value: 'irrigation', label: '💧 Irrigation' },
  { value: 'seeds', label: '🌱 Seeds' },
  { value: 'weather', label: '🌦️ Weather' },
  { value: 'market', label: '📊 Market' },
  { value: 'government-schemes', label: '🏛️ Govt Schemes' },
];

const AddEditArticle = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const contentRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'general',
    summary: '',
    author: '',
    imageUrl: '',
    tags: '',
    readTimeMinutes: '',
    isActive: true,
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchArticle = async () => {
        try {
          const res = await client.get(`/admin/library/${id}`);
          const data = res.data.data;
          setFormData({
            ...data,
            tags: data.tags?.join(', ') || '',
            readTimeMinutes: data.readTimeMinutes || '',
          });
          if (contentRef.current) {
            contentRef.current.innerHTML = data.content || '';
          }
        } catch (error) {
          alert('Failed to load article');
          navigate('/library');
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
      content: contentRef.current?.innerHTML || '',
      tags: formData.tags
        ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [],
      readTimeMinutes: formData.readTimeMinutes ? Number(formData.readTimeMinutes) : undefined,
    };

    try {
      if (isEdit) {
        await client.put(`/admin/library/${id}`, payload);
      } else {
        await client.post('/admin/library', payload);
      }
      navigate('/library');
    } catch (error) {
      console.error(error);
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
        <h2>{isEdit ? '✏️ Edit Article' : '📝 Write New Article'}</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/library')}>Cancel</button>
      </div>

      <form onSubmit={handleSubmit}>

        {/* === SECTION 1: Article Meta === */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>1. Article Info</h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required style={inputStyle} placeholder="e.g. How to identify and treat wheat rust disease" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} required style={inputStyle}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Author Name</label>
              <input type="text" name="author" value={formData.author} onChange={handleChange} style={inputStyle} placeholder="e.g. Dr. Rajesh Kumar" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Read Time (minutes)</label>
              <input type="number" name="readTimeMinutes" value={formData.readTimeMinutes} onChange={handleChange} style={inputStyle} placeholder="e.g. 5" min="1" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>
                Keywords / Tags
                <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>(comma separated)</span>
              </label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} style={inputStyle} placeholder="wheat, rust, fungal, disease, kharif" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Cover Image URL</label>
              <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} style={inputStyle} placeholder="https://example.com/image.jpg" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>
              Short Summary
              <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>(1-2 sentences shown in list cards)</span>
            </label>
            <textarea name="summary" value={formData.summary} onChange={handleChange} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="A quick blurb that appears in the article list preview..." />
          </div>
        </div>

        {/* === SECTION 2: Full Article Body === */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>2. Article Body *</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Paste from Word/Google Docs to keep formatting (bold, headings, bullet lists, tables all supported).
          </p>
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            style={{
              ...inputStyle,
              minHeight: '320px',
              outline: 'none',
              lineHeight: '1.7',
              overflowY: 'auto',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* === SECTION 3: Visibility === */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>3. Visibility</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
            <label htmlFor="isActive" style={{ fontWeight: 500, cursor: 'pointer' }}>
              Published (visible to farmers in the app)
            </label>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
          {saving ? 'Saving...' : (isEdit ? 'Update Article' : 'Publish Article')}
        </button>

      </form>
    </div>
  );
};

export default AddEditArticle;
