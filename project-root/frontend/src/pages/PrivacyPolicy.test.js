import React from 'react';
import { render, screen } from '@testing-library/react';
import PrivacyPolicy from './PrivacyPolicy';

test('renders Privacy Policy page with correct content', () => {
  render(<PrivacyPolicy />);
  
  // Check for correct app name
  expect(screen.getByText('YHK Healthy Kitchen Privacy Policy')).toBeInTheDocument();
  expect(screen.getByText('YHK Healthy Kitchen - Food Ordering & Delivery Platform')).toBeInTheDocument();
  
  // Check for key sections
  expect(screen.getByText('Information We Collect')).toBeInTheDocument();
  expect(screen.getByText('How We Use Your Information')).toBeInTheDocument();
  expect(screen.getByText('Data Security')).toBeInTheDocument();
  expect(screen.getByText('Your Rights')).toBeInTheDocument();
  
  // Check for contact information
  expect(screen.getByText('Contact Us')).toBeInTheDocument();
  expect(screen.getByText(/Email: privacy@yhk-p2.com/)).toBeInTheDocument();
  expect(screen.getByText(/Website: https:\/\/sumitweb.xyz/)).toBeInTheDocument();
});

test('renders privacy policy with proper structure', () => {
  render(<PrivacyPolicy />);
  
  // Verify the page has proper structure
  expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  expect(screen.getByText('← Back to Previous Page')).toBeInTheDocument();
});
