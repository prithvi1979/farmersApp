import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import client from '../api/client';

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';
const CATEGORIES = ['General', 'Government Scheme', 'Market Price', 'Weather Alert', 'Pest & Disease', 'Irrigation', 'Subsidy'];

const AddEditNews = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const descRef = useRef(null);
  const fileInputRef = useRef(null);

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
          if (descRef.current) {
            descRef.current.innerHTML = data.description || '';
          }
          if (data.imageUrl) {
            setImagePreview(data.imageUrl);
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);
    setImageUploading(true);

    try {
      const data = new FormData();
      data.append('image', file);

      const res = await axios.post(`${API_BASE_URL}/admin/upload-image`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setFormData(prev => ({ ...prev, imageUrl: res.data.url }));
        setImagePreview(res.data.url); // replace local blob with Cloudinary URL
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      alert('Image upload failed. Please try again.');
      setImagePreview(null);
      setFormData(prev => ({ ...prev, imageUrl: '' }));
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageUploading) {
      alert('Please wait for the image to finish uploading.');
      return;
    }
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

            {/* Image Upload */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Article Image</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '8px',
                  padding: imagePreview ? '0' : '1rem',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  minHeight: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--input-bg)',
                  position: 'relative',
                }}
              >
                {imageUploading && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 600, fontSize: '0.9rem', zIndex: 2
                  }}>
                    ⏳ Uploading...
                  </div>
                )}
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>🖼️</div>
                    <span>Click to upload image</span>
                    <br />
                    <span style={{ fontSize: '0.75rem' }}>JPG, PNG, WebP — max 5MB</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              {imagePreview && !imageUploading && (
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); setFormData(prev => ({ ...prev, imageUrl: '' })); }}
                  style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: '#c53030', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  ✕ Remove image
                </button>
              )}
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

        <button type="submit" className="btn btn-primary" disabled={saving || imageUploading} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
          {saving ? 'Saving...' : (isEdit ? 'Update Article' : 'Publish Article')}
        </button>
      </form>
    </div>
  );
};

export default AddEditNews;
