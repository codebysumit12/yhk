import React from 'react';
import './TermsOfService.css';

const TermsOfService = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <div className="terms-header">
          <h1>Yeswanth's Healthy Kitchen - Terms of Service</h1>
          <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="terms-content">
          <section className="terms-section">
            <h2>Acceptance of Terms</h2>
            <p>By using Yeswanth's Healthy Kitchen, you agree to these terms.</p>
          </section>

          <section className="terms-section">
            <h2>Services</h2>
            <p>We provide food ordering and delivery services through our platform.</p>
          </section>

          <section className="terms-section">
            <h2>User Responsibilities</h2>
            <ul>
              <li>Provide accurate information</li>
              <li>Maintain account security</li>
              <li>Use services legally</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>Payment Terms</h2>
            <p>Payments are processed securely. Refunds follow our refund policy.</p>
          </section>

          <section className="terms-section">
            <h2>Limitation of Liability</h2>
            <p>Our liability is limited as described in these terms.</p>
          </section>

          <section className="terms-section">
            <h2>Changes to Terms</h2>
            <p>We may update these terms. Continued use means acceptance.</p>
          </section>

          <section className="terms-section">
            <h2>Contact</h2>
            <p>Email: support@sumitweb.xyz</p>
            <p>Website: https://sumitweb.xyz</p>
          </section>
        </div>

        <div className="terms-footer">
          <button onClick={() => window.history.back()} className="back-btn">
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
