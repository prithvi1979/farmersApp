import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['General', 'Government Scheme', 'Market Price', 'Weather Alert', 'Pest & Disease', 'Irrigation', 'Subsidy'];

const NewsAdmin = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchArticles = async () => {
    try {
      const response = await client.get('/admin/news');
      setArticles(response.data.data);
    } catch (error) {
      console.error('Failed to fetch news', error);
      alert('Failed to load news articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await client.delete(`/admin/news/${id}`);
        fetchArticles();
      } catch (error) {
        alert('Failed to delete article');
      }
    }
  };

  const handleToggleActive = async (article) => {
    try {
      await client.put(`/admin/news/${article._id}`, { ...article, isActive: !article.isActive });
      fetchArticles();
    } catch (error) {
      alert('Failed to update article status');
    }
  };

  if (loading) return <p>Loading news...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>📰 Local News & Alerts</h2>
        <button className="btn btn-primary" onClick={() => navigate('/news/add')}>+ Publish Article</button>
      </div>

      <div className="glass-card">
        {articles.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No articles published yet. Create your first news alert.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.2)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>Title</th>
                <th style={{ padding: '0.75rem' }}>Category</th>
                <th style={{ padding: '0.75rem' }}>Target</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Published</th>
                <th style={{ padding: '0.75rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article._id} style={{ borderBottom: '1px solid rgba(128,128,128,0.1)' }}>
                  <td style={{ padding: '0.75rem', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {article.title}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '12px', backgroundColor: 'rgba(128,128,128,0.15)' }}>
                      {article.category || 'General'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {article.targetState || article.targetCity
                      ? `${article.targetCity || ''}${article.targetCity && article.targetState ? ', ' : ''}${article.targetState || ''}`
                      : 'All India'}
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
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                    {new Date(article.publishedAt).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ marginRight: '0.4rem', padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                      onClick={() => navigate(`/news/edit/${article._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ marginRight: '0.4rem', padding: '0.3rem 0.5rem', fontSize: '0.8rem', backgroundColor: article.isActive ? '#dd6b20' : '#38a169', color: 'white', borderColor: 'transparent' }}
                      onClick={() => handleToggleActive(article)}
                    >
                      {article.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#c53030', color: 'white', borderColor: 'transparent' }}
                      onClick={() => handleDelete(article._id)}
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

export default NewsAdmin;
