import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    fetchStatistics();
  }, [timeframe]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/statistics/timeframe?timeframe=${timeframe}`);
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

  if (!stats || stats.totalClassifications === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>No statistics available yet</h2>
        <p style={{ color: '#666' }}>Upload some images to see statistics!</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '25px', color: '#2D6A4F' }}>
          Statistics Dashboard
        </h1>

        {/* Timeframe Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          marginBottom: '25px'
        }}>
          {['week', 'month', 'all'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: timeframe === tf ? '#2D6A4F' : 'white',
                color: timeframe === tf ? 'white' : '#2D6A4F',
                border: `2px solid ${timeframe === tf ? '#2D6A4F' : '#E0E0E0'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textTransform: 'capitalize'
              }}
              onMouseOver={(e) => {
                if (timeframe !== tf) {
                  e.target.style.borderColor = '#2D6A4F';
                  e.target.style.backgroundColor = '#F0F8F5';
                }
              }}
              onMouseOut={(e) => {
                if (timeframe !== tf) {
                  e.target.style.borderColor = '#E0E0E0';
                  e.target.style.backgroundColor = 'white';
                }
              }}
            >
              {tf === 'week' ? 'Last 7 Days' : tf === 'month' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Total Classifications Card */}
      <div style={{
        backgroundColor: '#2D6A4F',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        textAlign: 'center',
        marginBottom: '25px',
        boxShadow: '0 4px 12px rgba(45, 106, 79, 0.2)'
      }}>
        <h2 style={{ margin: '0 0 5px 0', fontSize: '36px' }}>
          {stats.totalClassifications}
        </h2>
        <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
          Total Classifications
        </p>
      </div>

      {/* Charts Grid - Pie Chart + Detailed Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        
        {/* Pie Chart */}
        {stats.distribution && stats.distribution.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #E0E0E0'
          }}>
            <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#2D6A4F', fontSize: '16px' }}>
              Material Distribution
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats.distribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
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
        )}

        {/* Detailed Breakdown */}
        {stats.distribution && stats.distribution.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #E0E0E0'
          }}>
            <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#2D6A4F', fontSize: '16px' }}>
              Detailed Breakdown
            </h3>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#F8F9FA' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #E0E0E0', color: '#2D6A4F', fontSize: '14px' }}>
                    Material
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #E0E0E0', color: '#2D6A4F', fontSize: '14px' }}>
                    Count
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #E0E0E0', color: '#2D6A4F', fontSize: '14px' }}>
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.distribution.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <td style={{ padding: '12px', textTransform: 'capitalize', fontSize: '14px' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '12px',
                        height: '12px',
                        backgroundColor: COLORS[item.name],
                        marginRight: '10px',
                        borderRadius: '3px'
                      }}></span>
                      {item.name}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#2D6A4F', fontSize: '14px' }}>
                      {item.count}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>
                      {((item.count / stats.totalClassifications) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Line Chart - Daily/Monthly Trend */}
      {stats.dailyTrend && stats.dailyTrend.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #E0E0E0',
          marginBottom: '20px'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#2D6A4F', fontSize: '16px' }}>
            {timeframe === 'all' ? 'Monthly Trend' : 'Daily Trend'} {/* ΑΛΛΑΓΗ: Conditional title */}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.dailyTrend}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => {
                  const d = new Date(date);
                  // ΑΛΛΑΓΗ: Διαφορετικό format για All Time (μήνες) vs Days
                  if (timeframe === 'all') {
                    return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
                  } else {
                    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                  }
                }}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => {
                  const d = new Date(date);
                  // ΑΛΛΑΓΗ: Conditional tooltip format
                  if (timeframe === 'all') {
                    return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
                  } else {
                    return d.toLocaleDateString('en-GB');
                  }
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#2D6A4F" 
                strokeWidth={3}
                dot={{ fill: '#2D6A4F', r: 5 }}
                activeDot={{ r: 8 }}
                name="Classifications"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default Statistics;