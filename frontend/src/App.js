import React, { useState } from 'react';
import './App.css';
import ImageUpload from './components/ImageUpload';
import ResultDisplay from './components/ResultDisplay';
import History from './components/History';
import Statistics from './components/Statistics';
import EnvironmentalInfo from './components/EnvironmentalInfo';

function App() {
  const [result, setResult] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');

  const handlePrediction = (predictionResult) => {
    setResult(predictionResult);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            <ImageUpload onPrediction={handlePrediction} />
            <ResultDisplay result={result} />
          </>
        );
      case 'history':
        return <History />;
      case 'statistics':
        return <Statistics />;
      case 'environmental':
        return <EnvironmentalInfo />;
      default:
        return (
          <>
            <ImageUpload onPrediction={handlePrediction} />
            <ResultDisplay result={result} />
          </>
        );
    }
  };

  return (
    <div className="App">
      {/* Navigation Bar */}
      <nav style={{
        backgroundColor: '#2c3e50',
        padding: '15px 0',
        marginBottom: '20px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setCurrentPage('home')}
            style={{
              padding: '10px 25px',
              fontSize: '16px',
              backgroundColor: currentPage === 'home' ? '#4CAF50' : '#34495e',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.8'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            Home
          </button>
          
          <button
            onClick={() => setCurrentPage('history')}
            style={{
              padding: '10px 25px',
              fontSize: '16px',
              backgroundColor: currentPage === 'history' ? '#4CAF50' : '#34495e',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.8'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            History
          </button>

          <button
            onClick={() => setCurrentPage('statistics')}
            style={{
              padding: '10px 25px',
              fontSize: '16px',
              backgroundColor: currentPage === 'statistics' ? '#4CAF50' : '#34495e',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.8'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            Statistics
          </button>

          <button
            onClick={() => setCurrentPage('environmental')}
            style={{
              padding: '10px 25px',
              fontSize: '16px',
              backgroundColor: currentPage === 'environmental' ? '#4CAF50' : '#34495e',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.8'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            Environmental
          </button>
        </div>
      </nav>

      {/* Page Content */}
      {renderPage()}
    </div>
  );
}

export default App;