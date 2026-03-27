import React, { useState } from 'react';
import './Checkout.css';

const PhoneTest = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    const filtered = value.replace(/\D/g, '');
    addLog(`Input: "${value}" -> Filtered: "${filtered}"`);
    setPhoneNumber(filtered);
  };

  const handleSendOTP = () => {
    addLog(`Attempting to send OTP to: ${phoneNumber}`);
    addLog(`Phone valid: ${/^\d{10}$/.test(phoneNumber)}`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>🔍 Phone Input Test</h2>
      
      <div className="input-group">
        <label>Mobile Number</label>
        <div className="send-otp-row">
          <div className="country-code">🇮🇳 +91</div>
          <input
            type="tel"
            className="checkout-input-field"
            placeholder="Enter 10-digit number"
            maxLength="10"
            value={phoneNumber}
            onChange={handleChange}
          />
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '0 20px' }}
            onClick={handleSendOTP}
          >
            Test
          </button>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4>📋 Debug Logs:</h4>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '8px',
          maxHeight: '200px',
          overflow: 'auto',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhoneTest;
