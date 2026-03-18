import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['general', 'fertilizer', 'tools', 'seeds', 'pesticide', 'irrigation'];

const MarketAdmin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      // Use the admin-side route that fetches ALL products (including inactive)
      const response = await client.get('/market/products?all=true');
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch products', error);
      alert('Failed to load market products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await client.delete(`/market/products/${id}`);
        fetchProducts();
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await client.put(`/market/products/${product._id}`, { isActive: !product.isActive });
      fetchProducts();
    } catch (error) {
      alert('Failed to update product status');
    }
  };

  if (loading) return <p>Loading products...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>🛒 Affiliate Market</h2>
        <button className="btn btn-primary" onClick={() => navigate('/market/add')}>+ Add Product</button>
      </div>

      <div className="glass-card">
        {products.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No products yet. Add your first affiliate product.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.2)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>Image</th>
                <th style={{ padding: '0.75rem' }}>Title</th>
                <th style={{ padding: '0.75rem' }}>Category</th>
                <th style={{ padding: '0.75rem' }}>Price</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Added</th>
                <th style={{ padding: '0.75rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} style={{ borderBottom: '1px solid rgba(128,128,128,0.1)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#eee' }}
                      onError={e => { e.target.src = 'https://via.placeholder.com/52'; }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 600 }}>{product.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.description}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '12px', backgroundColor: 'rgba(128,128,128,0.15)', textTransform: 'capitalize' }}>
                      {product.category}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                    ₹{product.price}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px',
                      backgroundColor: product.isActive ? 'rgba(56,161,105,0.2)' : 'rgba(200,0,0,0.15)',
                      color: product.isActive ? '#38a169' : '#c53030'
                    }}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                    {new Date(product.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ marginRight: '0.4rem', padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                      onClick={() => navigate(`/market/edit/${product._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ marginRight: '0.4rem', padding: '0.3rem 0.5rem', fontSize: '0.8rem', backgroundColor: product.isActive ? '#dd6b20' : '#38a169', color: 'white', borderColor: 'transparent' }}
                      onClick={() => handleToggleActive(product)}
                    >
                      {product.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#c53030', color: 'white', borderColor: 'transparent' }}
                      onClick={() => handleDelete(product._id)}
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

export default MarketAdmin;
