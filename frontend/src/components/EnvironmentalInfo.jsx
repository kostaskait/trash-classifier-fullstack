import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EnvironmentalInfo() {
  const [environmentalData, setEnvironmentalData] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnvironmentalData();
  }, []);

  const fetchEnvironmentalData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/environmental');
      setEnvironmentalData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load environmental data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const materialColors = {
    plastic: '#FF6384',
    paper: '#0088FE',
    glass: '#00C49F',
    metal: '#FFBB28',
    cardboard: '#FF8042'
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading environmental data...</h2>
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
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Environmental Impact Information
      </h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px', fontSize: '16px' }}>
        Learn about the environmental impact of different materials and how to recycle them properly
      </p>

      {/* Material Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '25px',
        marginBottom: '30px'
      }}>
        {environmentalData.map((material) => (
          <div
            key={material.id}
            onClick={() => setSelectedMaterial(selectedMaterial?.id === material.id ? null : material)}
            style={{
              backgroundColor: 'white',
              borderRadius: '15px',
              padding: '25px',
              boxShadow: selectedMaterial?.id === material.id 
                ? `0 8px 20px ${materialColors[material.material]}40`
                : '0 2px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: selectedMaterial?.id === material.id 
                ? `3px solid ${materialColors[material.material]}`
                : '3px solid transparent',
              transform: selectedMaterial?.id === material.id ? 'scale(1.02)' : 'scale(1)'
            }}
            onMouseOver={(e) => {
              if (selectedMaterial?.id !== material.id) {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }
            }}
            onMouseOut={(e) => {
              if (selectedMaterial?.id !== material.id) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }
            }}
          >
            <h2 style={{
              textAlign: 'center',
              color: materialColors[material.material],
              textTransform: 'capitalize',
              marginBottom: '20px',
              fontSize: '28px',
              fontWeight: 'bold'
            }}>
              {material.material}
            </h2>

            <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Decomposition:</strong>
                <br />
                <span style={{ color: '#333' }}>{material.decompositionTime}</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Recycling Rate:</strong>
                <br />
                <span style={{ color: materialColors[material.material], fontWeight: 'bold', fontSize: '18px' }}>
                  {material.recyclingRate}%
                </span>
              </div>
              <div>
                <strong>CO2 Impact:</strong>
                <br />
                <span style={{ color: '#333' }}>{material.co2PerKg} kg CO2 per kg</span>
              </div>
            </div>

            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#666'
            }}>
              Click for more details
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Info Panel */}
      {selectedMaterial && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '30px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderLeft: `5px solid ${materialColors[selectedMaterial.material]}`,
          animation: 'fadeIn 0.3s'
        }}>
          <h2 style={{
            color: materialColors[selectedMaterial.material],
            marginBottom: '20px',
            textTransform: 'capitalize',
            fontSize: '28px'
          }}>
            {selectedMaterial.material} - Detailed Information
          </h2>

          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '18px' }}>
              Did You Know?
            </h3>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#555',
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              fontStyle: 'italic'
            }}>
              {selectedMaterial.funFact}
            </p>
          </div>

          <div>
            <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '18px' }}>
              Recycling Tips
            </h3>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#555',
              backgroundColor: '#e8f5e9',
              padding: '15px',
              borderRadius: '8px'
            }}>
              {selectedMaterial.tips}
            </p>
          </div>

          <button
            onClick={() => setSelectedMaterial(null)}
            style={{
              marginTop: '20px',
              padding: '12px 30px',
              backgroundColor: materialColors[selectedMaterial.material],
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'opacity 0.3s'
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.8'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            Close Details
          </button>
        </div>
      )}
    </div>
  );
}

export default EnvironmentalInfo;