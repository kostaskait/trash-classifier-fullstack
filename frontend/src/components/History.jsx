import React, { useState, useEffect } from 'react';
import axios from 'axios';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/history/${id}`);
      fetchHistory();
      setShowConfirm(false);
      setDeleteId(null);
    } catch (err) {
      setError('Failed to delete classification');
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete('http://localhost:8080/api/history/clear');
      fetchHistory();
      setShowClearConfirm(false);
    } catch (err) {
      setError('Failed to clear history');
      console.error(err);
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

  if (error && history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header with Clear All button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ margin: 0, color: '#2D6A4F' }}>
          Classification History
        </h1>
        {history.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#E63946',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#D62828'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#E63946'}
          >
            Clear All History
          </button>
        )}
      </div>

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
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s',
                border: '1px solid #e0e0e0',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#2D6A4F',
                textTransform: 'capitalize',
                marginBottom: '10px'
              }}>
                {item.predictedClass}
              </div>

              <div style={{ marginBottom: '10px' }}>
                <span style={{ color: '#666' }}>Confidence: </span>
                <span style={{ fontWeight: 'bold', color: '#40916C' }}>
                  {(item.confidence * 100).toFixed(2)}%
                </span>
              </div>

              <div style={{ marginBottom: '10px', fontSize: '14px', color: '#888' }}>
                {item.imageName}
              </div>

              <div style={{ fontSize: '12px', color: '#999', marginBottom: '15px' }}>
                {formatDate(item.createdAt)}
              </div>

              {/* Delete button */}
              <button
                onClick={() => {
                  setDeleteId(item.id);
                  setShowConfirm(true);
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#FFE5E5',
                  color: '#E63946',
                  border: '1px solid #FFCCCC',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#FFCCCC';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#FFE5E5';
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '400px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginTop: 0, color: '#2D6A4F' }}>Confirm Delete</h3>
            <p style={{ color: '#666' }}>
              Are you sure you want to delete this classification?
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setDeleteId(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#F8F9FA',
                  color: '#2D6A4F',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#E63946',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '400px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginTop: 0, color: '#E63946' }}>Clear All History</h3>
            <p style={{ color: '#666' }}>
              Are you sure you want to delete ALL classifications? This action cannot be undone!
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#F8F9FA',
                  color: '#2D6A4F',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#E63946',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;