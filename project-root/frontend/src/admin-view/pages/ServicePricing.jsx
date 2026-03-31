import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../../config/api';
import './service-pricing.css';

const ServicePricing = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('delivery');

  const API_URL = API_CONFIG.API_URL;
  const token = localStorage.getItem('userToken') || localStorage.getItem('token');

  // Pricing State
  const [pricingConfig, setPricingConfig] = useState({
    // Delivery Charges
    delivery: {
      upto5km: 0,
      upto10km: 30,
      above10km: 50,
      freeDeliveryAbove: 500,
      enabled: true
    },
    // Packaging Charges
    packaging: {
      perOrder: 10,
      enabled: true
    },
    // GST
    gst: {
      percentage: 5,
      enabled: true
    },
    // Platform Fee
    platformFee: {
      amount: 5,
      enabled: false
    },
    // Discount
    discount: {
      percentage: 0,
      maxAmount: 100,
      enabled: false
    }
  });

  // Fetch current pricing configuration
  useEffect(() => {
    fetchPricingConfig();
  }, []);

  const fetchPricingConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/settings/pricing`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setPricingConfig(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching pricing config:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save pricing configuration
  const savePricingConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/settings/pricing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(pricingConfig)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Pricing configuration saved successfully!');
      } else {
        alert('❌ Failed to save: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving pricing config:', error);
      alert('❌ Failed to save pricing configuration');
    } finally {
      setSaving(false);
    }
  };

  // Update handlers
  const updateDelivery = (field, value) => {
    setPricingConfig(prev => ({
      ...prev,
      delivery: { ...prev.delivery, [field]: value }
    }));
  };

  const updatePackaging = (field, value) => {
    setPricingConfig(prev => ({
      ...prev,
      packaging: { ...prev.packaging, [field]: value }
    }));
  };

  const updateGST = (field, value) => {
    setPricingConfig(prev => ({
      ...prev,
      gst: { ...prev.gst, [field]: value }
    }));
  };

  const updatePlatformFee = (field, value) => {
    setPricingConfig(prev => ({
      ...prev,
      platformFee: { ...prev.platformFee, [field]: value }
    }));
  };

  const updateDiscount = (field, value) => {
    setPricingConfig(prev => ({
      ...prev,
      discount: { ...prev.discount, [field]: value }
    }));
  };

  if (loading) {
    return (
      <div className="service-pricing-page">
        <div className="loading">Loading pricing configuration...</div>
      </div>
    );
  }

  return (
    <div className="service-pricing-page">
      {/* Header */}
      <div className="pricing-header">
        <div>
          <h2>💰 Service Pricing & Configuration</h2>
          <p>Manage delivery charges, packaging fees, taxes and other service pricing</p>
        </div>
        <button 
          className="save-btn"
          onClick={savePricingConfig}
          disabled={saving}
        >
          {saving ? '⏳ Saving...' : '💾 Save Changes'}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="pricing-tabs">
        <button
          className={`pricing-tab ${activeSection === 'delivery' ? 'active' : ''}`}
          onClick={() => setActiveSection('delivery')}
        >
          <span className="tab-icon">🚚</span>
          Delivery Charges
        </button>
        <button
          className={`pricing-tab ${activeSection === 'packaging' ? 'active' : ''}`}
          onClick={() => setActiveSection('packaging')}
        >
          <span className="tab-icon">📦</span>
          Packaging
        </button>
        <button
          className={`pricing-tab ${activeSection === 'gst' ? 'active' : ''}`}
          onClick={() => setActiveSection('gst')}
        >
          <span className="tab-icon">🧾</span>
          GST & Taxes
        </button>
        <button
          className={`pricing-tab ${activeSection === 'other' ? 'active' : ''}`}
          onClick={() => setActiveSection('other')}
        >
          <span className="tab-icon">⚙️</span>
          Other Fees
        </button>
      </div>

      {/* Content */}
      <div className="pricing-content">

        {/* ── DELIVERY CHARGES ── */}
        {activeSection === 'delivery' && (
          <div className="pricing-section">
            <div className="section-header">
              <h3>🚚 Delivery Charges Configuration</h3>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={pricingConfig.delivery.enabled}
                  onChange={e => updateDelivery('enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">
                  {pricingConfig.delivery.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            <div className="pricing-grid">
              {/* Distance-based pricing */}
              <div className="pricing-card">
                <div className="card-icon">📍</div>
                <h4>Within 5 KM</h4>
                <p className="card-description">Delivery fee for orders within 5 kilometers</p>
                <div className="input-group">
                  <span className="input-prefix">₹</span>
                  <input
                    type="number"
                    className="pricing-input"
                    value={pricingConfig.delivery.upto5km}
                    onChange={e => updateDelivery('upto5km', parseFloat(e.target.value) || 0)}
                    disabled={!pricingConfig.delivery.enabled}
                  />
                </div>
              </div>

              <div className="pricing-card">
                <div className="card-icon">📍📍</div>
                <h4>5 - 10 KM</h4>
                <p className="card-description">Delivery fee for orders between 5-10 kilometers</p>
                <div className="input-group">
                  <span className="input-prefix">₹</span>
                  <input
                    type="number"
                    className="pricing-input"
                    value={pricingConfig.delivery.upto10km}
                    onChange={e => updateDelivery('upto10km', parseFloat(e.target.value) || 0)}
                    disabled={!pricingConfig.delivery.enabled}
                  />
                </div>
              </div>

              <div className="pricing-card">
                <div className="card-icon">📍📍📍</div>
                <h4>Above 10 KM</h4>
                <p className="card-description">Delivery fee for orders above 10 kilometers</p>
                <div className="input-group">
                  <span className="input-prefix">₹</span>
                  <input
                    type="number"
                    className="pricing-input"
                    value={pricingConfig.delivery.above10km}
                    onChange={e => updateDelivery('above10km', parseFloat(e.target.value) || 0)}
                    disabled={!pricingConfig.delivery.enabled}
                  />
                </div>
              </div>

              <div className="pricing-card highlight">
                <div className="card-icon">🎁</div>
                <h4>Free Delivery Above</h4>
                <p className="card-description">Order value for free delivery (set 0 to disable)</p>
                <div className="input-group">
                  <span className="input-prefix">₹</span>
                  <input
                    type="number"
                    className="pricing-input"
                    value={pricingConfig.delivery.freeDeliveryAbove}
                    onChange={e => updateDelivery('freeDeliveryAbove', parseFloat(e.target.value) || 0)}
                    disabled={!pricingConfig.delivery.enabled}
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="pricing-preview">
              <h4>📋 Delivery Charges Preview</h4>
              <table className="preview-table">
                <thead>
                  <tr>
                    <th>Distance</th>
                    <th>Delivery Fee</th>
                    <th>Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>0 - 5 KM</td>
                    <td className="fee-amount">₹{pricingConfig.delivery.upto5km}</td>
                    <td className="example-text">Customer 3 km away</td>
                  </tr>
                  <tr>
                    <td>5 - 10 KM</td>
                    <td className="fee-amount">₹{pricingConfig.delivery.upto10km}</td>
                    <td className="example-text">Customer 7 km away</td>
                  </tr>
                  <tr>
                    <td>Above 10 KM</td>
                    <td className="fee-amount">₹{pricingConfig.delivery.above10km}</td>
                    <td className="example-text">Customer 15 km away</td>
                  </tr>
                  {pricingConfig.delivery.freeDeliveryAbove > 0 && (
                    <tr className="free-delivery-row">
                      <td colSpan="2">Order ≥ ₹{pricingConfig.delivery.freeDeliveryAbove}</td>
                      <td className="free-text">FREE Delivery 🎉</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PACKAGING CHARGES ── */}
        {activeSection === 'packaging' && (
          <div className="pricing-section">
            <div className="section-header">
              <h3>📦 Packaging Charges</h3>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={pricingConfig.packaging.enabled}
                  onChange={e => updatePackaging('enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">
                  {pricingConfig.packaging.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            <div className="pricing-grid">
              <div className="pricing-card large">
                <div className="card-icon">📦</div>
                <h4>Packaging Fee Per Order</h4>
                <p className="card-description">
                  Standard packaging and handling charges applied to each order
                </p>
                <div className="input-group large-input">
                  <span className="input-prefix">₹</span>
                  <input
                    type="number"
                    className="pricing-input"
                    value={pricingConfig.packaging.perOrder}
                    onChange={e => updatePackaging('perOrder', parseFloat(e.target.value) || 0)}
                    disabled={!pricingConfig.packaging.enabled}
                  />
                </div>
              </div>
            </div>

            <div className="info-box">
              <div className="info-icon">💡</div>
              <div>
                <strong>Packaging Includes:</strong>
                <ul>
                  <li>Food containers and boxes</li>
                  <li>Cutlery, napkins, and tissues</li>
                  <li>Tamper-proof seals and bags</li>
                  <li>Thermal packaging for hot items</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── GST & TAXES ── */}
        {activeSection === 'gst' && (
          <div className="pricing-section">
            <div className="section-header">
              <h3>🧾 GST & Tax Configuration</h3>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={pricingConfig.gst.enabled}
                  onChange={e => updateGST('enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">
                  {pricingConfig.gst.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            <div className="pricing-grid">
              <div className="pricing-card large">
                <div className="card-icon">🧾</div>
                <h4>GST Percentage</h4>
                <p className="card-description">
                  Goods and Services Tax applied on order subtotal
                </p>
                <div className="input-group large-input">
                  <input
                    type="number"
                    className="pricing-input"
                    value={pricingConfig.gst.percentage}
                    onChange={e => updateGST('percentage', parseFloat(e.target.value) || 0)}
                    disabled={!pricingConfig.gst.enabled}
                    step="0.1"
                    max="18"
                  />
                  <span className="input-suffix">%</span>
                </div>
              </div>
            </div>

            {/* GST Calculation Example */}
            <div className="calculation-example">
              <h4>📊 GST Calculation Example</h4>
              <div className="calc-box">
                <div className="calc-row">
                  <span>Subtotal</span>
                  <span>₹500.00</span>
                </div>
                <div className="calc-row gst-row">
                  <span>GST ({pricingConfig.gst.percentage}%)</span>
                  <span>₹{(500 * pricingConfig.gst.percentage / 100).toFixed(2)}</span>
                </div>
                <div className="calc-row total">
                  <strong>Total with GST</strong>
                  <strong>₹{(500 + (500 * pricingConfig.gst.percentage / 100)).toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <div className="info-box">
              <div className="info-icon">ℹ️</div>
              <div>
                <strong>Standard GST Rates for Food:</strong>
                <ul>
                  <li>Restaurant Service: 5% (non-AC) or 18% (AC)</li>
                  <li>Food Delivery: 5% GST</li>
                  <li>Packaged Food: 12% - 18% GST</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── OTHER FEES ── */}
        {activeSection === 'other' && (
          <div className="pricing-section">
            <h3>⚙️ Additional Fees & Charges</h3>

            {/* Platform Fee */}
            <div className="fee-section">
              <div className="section-header">
                <h4>💻 Platform Fee</h4>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={pricingConfig.platformFee.enabled}
                    onChange={e => updatePlatformFee('enabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">
                    {pricingConfig.platformFee.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              <div className="pricing-card">
                <p className="card-description">
                  Service fee for using the online ordering platform
                </p>
                <div className="input-group">
                  <span className="input-prefix">₹</span>
                  <input
                    type="number"
                    className="pricing-input"
                    value={pricingConfig.platformFee.amount}
                    onChange={e => updatePlatformFee('amount', parseFloat(e.target.value) || 0)}
                    disabled={!pricingConfig.platformFee.enabled}
                  />
                </div>
              </div>
            </div>

            {/* Default Discount */}
            <div className="fee-section">
              <div className="section-header">
                <h4>🎁 Default Discount</h4>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={pricingConfig.discount.enabled}
                    onChange={e => updateDiscount('enabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">
                    {pricingConfig.discount.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              <div className="pricing-grid">
                <div className="pricing-card">
                  <h4>Discount Percentage</h4>
                  <div className="input-group">
                    <input
                      type="number"
                      className="pricing-input"
                      value={pricingConfig.discount.percentage}
                      onChange={e => updateDiscount('percentage', parseFloat(e.target.value) || 0)}
                      disabled={!pricingConfig.discount.enabled}
                      max="100"
                    />
                    <span className="input-suffix">%</span>
                  </div>
                </div>

                <div className="pricing-card">
                  <h4>Maximum Discount Cap</h4>
                  <div className="input-group">
                    <span className="input-prefix">₹</span>
                    <input
                      type="number"
                      className="pricing-input"
                      value={pricingConfig.discount.maxAmount}
                      onChange={e => updateDiscount('maxAmount', parseFloat(e.target.value) || 0)}
                      disabled={!pricingConfig.discount.enabled}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Floating Save Button */}
      <div className="floating-save">
        <button 
          className="save-btn-large"
          onClick={savePricingConfig}
          disabled={saving}
        >
          {saving ? '⏳ Saving Configuration...' : '💾 Save All Changes'}
        </button>
      </div>
    </div>
  );
};

export default ServicePricing;