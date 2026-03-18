import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';

const CATEGORIES = ['general', 'fertilizer', 'tools', 'seeds', 'pesticide', 'irrigation'];

const AddEditProduct = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    imageUrl: '',
    affiliateLink: '',
    category: 'general',
    targetPlants: '',
    isActive: true,
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchProduct = async () => {
        try {
          const res = await client.get(`/market/products/${id}`);
          const data = res.data.data;
          setFormData({
            ...data,
            targetPlants: data.targetPlants?.join(', ') || '',
          });
        } catch (error) {
          alert('Failed to load product');
          navigate('/market');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
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
      price: parseFloat(formData.price),
      targetPlants: formData.targetPlants
        ? formData.targetPlants.split(',').map(p => p.trim()).filter(Boolean)
        : [],
    };

    try {
      if (isEdit) {
        await client.put(`/market/products/${id}`, payload);
      } else {
        await client.post('/market/products', payload);
      }
      navigate('/market');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save product');
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
    boxSizing: 'border-box',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>{isEdit ? '✏️ Edit Product' : '🛒 Add New Product'}</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/market')}>Cancel</button>
      </div>

      <form onSubmit={handleSubmit}>

        {/* === SECTION 1: Core Info === */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>1. Product Details</h3>

          {/* Title + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="e.g. Organic Neem Pesticide Spray"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c} style={{ textTransform: 'capitalize' }}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price + Image URL */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                style={inputStyle}
                placeholder="e.g. 249.99"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Image URL *</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="https://example.com/product-image.jpg"
              />
            </div>
          </div>

          {/* Image Preview */}
          {formData.imageUrl && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Image Preview</label>
              <img
                src={formData.imageUrl}
                alt="Preview"
                style={{ height: '120px', width: '120px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border-color)' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Short Description */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Short Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Brief description shown to farmers on the product card…"
            />
          </div>

          {/* Affiliate Link */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Affiliate Link *</label>
            <input
              type="url"
              name="affiliateLink"
              value={formData.affiliateLink}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="https://amazon.in/dp/... or any affiliate URL"
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Farmers are redirected here when they tap "Buy Now".
            </p>
          </div>
        </div>

        {/* === SECTION 2: Targeting === */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>2. Crop Targeting</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Leave blank to show this product to all farmers (generic). Or specify crops to target farmers growing those crops.
          </p>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Target Crops</label>
            <input
              type="text"
              name="targetPlants"
              value={formData.targetPlants}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Wheat, Rice, Tomato (comma separated)"
            />
          </div>
        </div>

        {/* === SECTION 3: Visibility === */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem', color: 'var(--primary-color)' }}>3. Visibility</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="isActive" style={{ fontWeight: 500, cursor: 'pointer' }}>
              Active — show this product to farmers
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
        >
          {saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Add Product')}
        </button>
      </form>
    </div>
  );
};

export default AddEditProduct;
