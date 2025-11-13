import React, { useState, useEffect } from 'react';
import axios from 'axios';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/history');
      setHistory(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading history...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        Classification History
      </h1>

      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>
            No classifications yet. Upload an image to get started!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {history.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#4CAF50',
                textTransform: 'capitalize',
                marginBottom: '10px'
              }}>
                {item.predictedClass}
              </div>

              <div style={{ marginBottom: '10px' }}>
                <span style={{ color: '#666' }}>Confidence: </span>
                <span style={{ fontWeight: 'bold', color: '#333' }}>
                  {(item.confidence * 100).toFixed(2)}%
                </span>
              </div>

              <div style={{ marginBottom: '10px', fontSize: '14px', color: '#888' }}>
                {item.imageName}
              </div>

              <div style={{ fontSize: '12px', color: '#999' }}>
                {formatDate(item.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;