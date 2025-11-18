import React, { useState } from 'react';
import axios from 'axios';

function ImageUpload({ onPrediction }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false); // ΠΡΟΣΘΗΚΗ: Drag state

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

  // ΠΡΟΣΘΗΚΗ: Drag & Drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setError(null);
      } else {
        setError('Please select a valid image file');
      }
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
    <div style={{
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      border: '2px solid #E0E0E0',
      height: 'fit-content'
    }}>
      <h2 style={{ marginTop: 0, color: '#2D6A4F', fontSize: '22px' }}>
        Upload Image
      </h2>
      
      <div 
        style={{
          border: `2px dashed ${isDragging ? '#40916C' : '#2D6A4F'}`, // ΑΛΛΑΓΗ: Conditional border color
          borderRadius: '12px',
          padding: '30px',
          textAlign: 'center',
          backgroundColor: isDragging ? '#E8F5F0' : '#F0F8F5', // ΑΛΛΑΓΗ: Conditional background
          marginBottom: '20px',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onDragEnter={handleDragEnter} // ΠΡΟΣΘΗΚΗ
        onDragOver={handleDragOver}   // ΠΡΟΣΘΗΚΗ
        onDragLeave={handleDragLeave} // ΠΡΟΣΘΗΚΗ
        onDrop={handleDrop}           // ΠΡΟΣΘΗΚΗ
        onMouseOver={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = '#E8F5F0';
            e.currentTarget.style.borderColor = '#40916C';
          }
        }}
        onMouseOut={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = '#F0F8F5';
            e.currentTarget.style.borderColor = '#2D6A4F';
          }
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <p style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#2D6A4F', fontWeight: '600' }}>
            {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'} {/* ΑΛΛΑΓΗ: Conditional text */}
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
            PNG, JPG (max 10MB)
          </p>
        </label>
      </div>

      {preview && (
        <div style={{ marginBottom: '20px' }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '100%',
              maxHeight: '250px',
              objectFit: 'contain',
              borderRadius: '12px',
              border: '1px solid #E0E0E0'
            }}
          />
          <p style={{ 
            fontSize: '13px', 
            color: '#666', 
            marginTop: '10px',
            textAlign: 'center'
          }}>
            {selectedFile?.name}
          </p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || loading}
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '16px',
          fontWeight: '600',
          backgroundColor: loading ? '#ccc' : '#2D6A4F',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s',
          boxShadow: '0 2px 8px rgba(45, 106, 79, 0.3)'
        }}
        onMouseOver={(e) => {
          if (!loading && selectedFile) {
            e.target.style.backgroundColor = '#40916C';
            e.target.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseOut={(e) => {
          if (!loading && selectedFile) {
            e.target.style.backgroundColor = '#2D6A4F';
            e.target.style.transform = 'translateY(0)';
          }
        }}
      >
        {loading ? 'Analyzing...' : 'Classify Image'}
      </button>

      {error && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          backgroundColor: '#FFE5E5',
          color: '#E63946',
          borderRadius: '8px',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;