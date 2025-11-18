import React from 'react';

function ResultDisplay({ result }) {
  if (!result) {
    return null;
  }

  const materialColors = {
    cardboard: '#FF8042',
    glass: '#00C49F',
    metal: '#FFBB28',
    paper: '#0088FE',
    plastic: '#FF6384'
  };

  const predictedColor = materialColors[result.predictedClass.toLowerCase()] || '#2D6A4F';

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      border: '2px solid #E0E0E0',
      height: 'fit-content'
    }}>
      <h2 style={{ 
        marginTop: 0, 
        marginBottom: '25px',
        color: '#2D6A4F', 
        fontSize: '22px' 
      }}>
        Classification Result
      </h2>

      {/* Predicted Class */}
      <div style={{
        backgroundColor: '#F0F8F5',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '25px',
        textAlign: 'center',
        border: `2px solid ${predictedColor}20`
      }}>
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: predictedColor,
          textTransform: 'capitalize',
          marginBottom: '10px'
        }}>
          {result.predictedClass}
        </div>
        <div style={{ fontSize: '15px', color: '#666' }}>
          Confidence: <span style={{ fontWeight: 'bold', color: '#2D6A4F' }}>
            {(result.confidence * 100).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* All Predictions */}
      <h3 style={{ 
        fontSize: '16px', 
        color: '#2D6A4F', 
        marginBottom: '15px',
        marginTop: '25px'
      }}>
        All Predictions:
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.entries(result.allScores)
          .sort((a, b) => b[1] - a[1])
          .map(([className, score]) => (
            <div key={className}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <span style={{
                  textTransform: 'capitalize',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  {className}
                </span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: materialColors[className.toLowerCase()] || '#2D6A4F'
                }}>
                  {(score * 100).toFixed(2)}%
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#E0E0E0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div
                  style={{
                    width: `${score * 100}%`,
                    height: '100%',
                    backgroundColor: materialColors[className.toLowerCase()] || '#2D6A4F',
                    transition: 'width 0.5s ease',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default ResultDisplay;