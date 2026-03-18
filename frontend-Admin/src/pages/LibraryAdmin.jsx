import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useNavigate } from 'react-router-dom';

const CATEGORY_LABELS = {
  'diseases': '🦠 Diseases',
  'pests': '🐛 Pests',
  'general': '📄 General',
  'techniques': '🔧 Techniques',
  'fertilizers': '🧪 Fertilizers',
  'irrigation': '💧 Irrigation',
  'seeds': '🌱 Seeds',
  'weather': '🌦️ Weather',
  'market': '📊 Market',
  'government-schemes': '🏛️ Govt Schemes',
};

const LibraryAdmin = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const navigate = useNavigate();

  const fetchArticles = async () => {
    try {
      const response = await client.get('/admin/library');
      setArticles(response.data.data);
    } catch (error) {
      console.error('Failed to fetch library articles', error);
      alert('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await client.delete(`/admin/library/${id}`);
        fetchArticles();
      } catch (error) {
        alert('Failed to delete article');
      }
    }
  };

  const handleToggleActive = async (article) => {
    try {
      await client.put(`/admin/library/${article._id}`, { ...article, isActive: !article.isActive, tags: article.tags || [] });
      fetchArticles();
    } catch (error) {
      alert('Failed to update article status');
    }
  };

  const filtered = filterCategory
    ? articles.filter(a => a.category === filterCategory)
    : articles;

  if (loading) return <p>Loading articles...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>📚 Library & Knowledge Base</h2>
        <button className="btn btn-primary" onClick={() => navigate('/library/add')}>+ Write Article</button>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <button
          className={`btn btn-secondary`}
          style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', backgroundColor: !filterCategory ? 'var(--primary-color)' : '', color: !filterCategory ? 'white' : '' }}
          onClick={() => setFilterCategory('')}
        >All</button>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', backgroundColor: filterCategory === key ? 'var(--primary-color)' : '', color: filterCategory === key ? 'white' : '' }}
            onClick={() => setFilterCategory(filterCategory === key ? '' : key)}
          >{label}</button>
        ))}
      </div>

      <div className="glass-card">
        {filtered.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No articles found. Write your first knowledge base article.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.2)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>Title</th>
                <th style={{ padding: '0.75rem' }}>Category</th>
                <th style={{ padding: '0.75rem' }}>Author</th>
                <th style={{ padding: '0.75rem' }}>Read Time</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((article) => (
                <tr key={article._id} style={{ borderBottom: '1px solid rgba(128,128,128,0.1)' }}>
                  <td style={{ padding: '0.75rem', maxWidth: '250px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.title}</div>
                    {article.tags?.length > 0 && (
                      <div style={{ marginTop: '0.2rem' }}>
                        {article.tags.slice(0, 3).map(tag => (
                          <span key={tag} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', backgroundColor: 'rgba(128,128,128,0.15)', marginRight: '0.25rem' }}>#{tag}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '12px', backgroundColor: 'rgba(128,128,128,0.15)' }}>
                      {CATEGORY_LABELS[article.category] || article.category}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{article.author || '—'}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {article.readTimeMinutes ? `${article.readTimeMinutes} min` : '—'}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px',
                      backgroundColor: article.isActive ? 'rgba(56,161,105,0.2)' : 'rgba(200,0,0,0.15)',
                      color: article.isActive ? '#38a169' : '#c53030'
                    }}>
                      {article.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button className="btn btn-secondary" style={{ marginRight: '0.4rem', padding: '0.3rem 0.5rem', fontSize: '0.8rem' }} onClick={() => navigate(`/library/edit/${article._id}`)}>Edit</button>
                    <button className="btn btn-secondary" style={{ marginRight: '0.4rem', padding: '0.3rem 0.5rem', fontSize: '0.8rem', backgroundColor: article.isActive ? '#dd6b20' : '#38a169', color: 'white', borderColor: 'transparent' }} onClick={() => handleToggleActive(article)}>
                      {article.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#c53030', color: 'white', borderColor: 'transparent' }} onClick={() => handleDelete(article._id)}>Delete</button>
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

export default LibraryAdmin;
