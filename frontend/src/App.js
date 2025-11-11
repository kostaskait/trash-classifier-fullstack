import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import ResultDisplay from './components/ResultDisplay';
import './App.css';

function App() {
  const [prediction, setPrediction] = useState(null);

  return (
    <div className="App">
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#282c34',
        color: 'white',
        paddingTop: '20px'
      }}>
        <ImageUpload onPrediction={setPrediction} />
        <ResultDisplay result={prediction} />
      </div>
    </div>
  );
}

export default App;