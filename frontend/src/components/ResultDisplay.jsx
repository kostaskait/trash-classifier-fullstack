import React from 'react';

function ResultDisplay({ result }) {
  if (!result) return null;

  const { predictedClass, confidence, allScores } = result;

  // Emoji mapping για κάθε κλάση
  const emojiMap = {
    cardboard: '📦',
    glass: '🥤',
    metal: '🔩',
    paper: '📄',
    plastic: '♻️',
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '20px auto',
      backgroundColor: '#f5f5f5',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>
        Classification Result
      </h2>

      {/* Predicted Class */}
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '48px' }}>
          {emojiMap[predictedClass] || '🗑️'}
        </div>
        <h1 style={{ 
          margin: '10px 0',
          textTransform: 'capitalize',
          color: '#4CAF50'
        }}>
          {predictedClass}
        </h1>
        <p style={{ fontSize: '18px', color: '#666' }}>
          Confidence: <strong>{(confidence * 100).toFixed(2)}%</strong>
        </p>
      </div>

      {/* All Scores */}
      <div>
        <h3 style={{ marginBottom: '15px', color: '#555' }}>
          All Predictions:
        </h3>
        {Object.entries(allScores)
          .sort(([, a], [, b]) => b - a)
          .map(([className, score]) => (
            <div
              key={className}
              style={{
                marginBottom: '10px',
                backgroundColor: 'white',
                padding: '10px',
                borderRadius: '5px',
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '5px'
              }}>
                <span style={{ textTransform: 'capitalize' }}>
                  {emojiMap[className]} {className}
                </span>
                <span><strong>{(score * 100).toFixed(2)}%</strong></span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${score * 100}%`,
                  height: '100%',
                  backgroundColor: className === predictedClass ? '#4CAF50' : '#2196F3',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default ResultDisplay;