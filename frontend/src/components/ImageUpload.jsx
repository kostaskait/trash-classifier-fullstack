import React, { useState } from 'react';
import axios from 'axios';

function ImageUpload({ onPrediction }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post(
        'http://localhost:8080/api/predict',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      onPrediction(response.data);
    } catch (err) {
      setError('Error processing image: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>🗑️ Trash Classifier</h2>
      <p>Upload an image of trash to classify it</p>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ margin: '20px 0' }}
      />

      {preview && (
        <div style={{ margin: '20px 0' }}>
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: '400px', maxHeight: '300px', borderRadius: '8px' }}
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || loading}
        style={{
          padding: '10px 30px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Classifying...' : 'Classify Image'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>
      )}
    </div>
  );
}

export default ImageUpload;