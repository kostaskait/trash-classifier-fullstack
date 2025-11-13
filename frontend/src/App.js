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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'history', label: 'History', icon: '📋' },
    { id: 'statistics', label: 'Statistics', icon: '📊' },
    { id: 'environmental', label: 'Environmental', icon: '🌿' }
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F8F9FA' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '260px' : '80px',
        backgroundColor: '#2D6A4F',
        color: 'white',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1000
      }}>
        {/* Logo/Header */}
        <div style={{
          padding: '30px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center'
        }}>
          {sidebarOpen && (
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '600' }}>
                Trash Classifier
              </h2>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
                Smart Recycling
              </p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px',
              transition: 'background 0.3s'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav style={{ flex: 1, padding: '20px 0' }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                width: '100%',
                padding: '16px 20px',
                backgroundColor: currentPage === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                border: 'none',
                borderLeft: currentPage === item.id ? '4px solid #74C69D' : '4px solid transparent',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                fontSize: '15px',
                fontWeight: currentPage === item.id ? '600' : '400',
                transition: 'all 0.3s',
                textAlign: 'left'
              }}
              onMouseOver={(e) => {
                if (currentPage !== item.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                }
              }}
              onMouseOut={(e) => {
                if (currentPage !== item.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '20px', minWidth: '24px' }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div style={{
            padding: '20px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontSize: '12px',
            opacity: 0.7
          }}>
            <p style={{ margin: 0 }}>Version 1.0</p>
            <p style={{ margin: '5px 0 0 0' }}>Made with 🌱</p>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        backgroundColor: '#F8F9FA'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '40px'
        }}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;