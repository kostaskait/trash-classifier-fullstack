import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/statistics');
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = {
    cardboard: '#FF8042',
    glass: '#00C49F',
    metal: '#FFBB28',
    paper: '#0088FE',
    plastic: '#FF6384'
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading statistics...</h2>
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

  if (!stats || stats.distribution.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>No statistics available yet</h2>
        <p style={{ color: '#666' }}>Upload some images to see statistics!</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>
        Statistics Dashboard
      </h1>

      {/* Total Classifications Card */}
      <div style={{
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '30px',
        borderRadius: '10px',
        textAlign: 'center',
        marginBottom: '40px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '48px' }}>
          {stats.totalClassifications}
        </h2>
        <p style={{ margin: 0, fontSize: '20px', opacity: 0.9 }}>
          Total Classifications
        </p>
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '30px',
        marginBottom: '30px'
      }}>
        
        {/* Pie Chart */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
            Material Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.distribution}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.name}: ${entry.count}`}
              >
                {stats.distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
            Classification Count
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.distribution}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
          Detailed Breakdown
        </h3>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                Material
              </th>
              <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
                Count
              </th>
              <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
                Percentage
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.distribution.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px', textTransform: 'capitalize' }}>
                  <span style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    backgroundColor: COLORS[item.name],
                    marginRight: '10px',
                    borderRadius: '2px'
                  }}></span>
                  {item.name}
                </td>
                <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold' }}>
                  {item.count}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  {((item.count / stats.totalClassifications) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Statistics;