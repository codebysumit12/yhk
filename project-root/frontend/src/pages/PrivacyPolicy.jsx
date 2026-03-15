import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-page">
      <div className="privacy-container">
        <div className="privacy-header">
          <h1>YHK Healthy Kitchen Privacy Policy</h1>
          <p className="app-description">YHK Healthy Kitchen - Food Ordering & Delivery Platform</p>
          <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="privacy-content">
          <section className="policy-section">
            <h2>Information We Collect</h2>
            <p>
              When you use YHK Healthy Kitchen, we may collect certain information to provide you with the best food ordering and delivery service possible.
            </p>
            <ul>
              <li>Personal information (name, email, phone number)</li>
              <li>Order history and preferences</li>
              <li>Delivery address information</li>
              <li>Payment information (processed securely)</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Process and deliver your orders</li>
              <li>Provide customer support</li>
              <li>Improve our services</li>
              <li>Send important updates about your orders</li>
              <li>Personalize your experience</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>Data Security</h2>
            <p>
              We take data security seriously and implement appropriate measures to protect your personal information. 
              All payment transactions are processed using secure encryption methods.
            </p>
          </section>

          <section className="policy-section">
            <h2>Third-Party Services</h2>
            <p>
              We may use third-party services to help us operate our business, including payment processors and delivery services. 
              These services have access to your information only as necessary to perform their functions.
            </p>
          </section>

          <section className="policy-section">
            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Update or correct your information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>Cookies</h2>
            <p>
              We use cookies to enhance your experience on our website. These help us remember your preferences 
              and provide a more personalized service.
            </p>
          </section>

          <section className="policy-section">
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="contact-info">
              <p>Email: privacy@yhk-p2.com</p>
              <p>Website: https://sumitweb.xyz</p>
              <p>App: YHK Healthy Kitchen</p>
            </div>
          </section>
        </div>

        <div className="privacy-footer">
          <button onClick={() => window.history.back()} className="back-btn">
            ← Back to Previous Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
