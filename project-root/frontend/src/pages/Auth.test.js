import React from 'react';
import { render, screen } from '@testing-library/react';
import Auth from './Auth';

// Mock Firebase
jest.mock('../firebase', () => ({
  auth: {
    currentUser: null
  }
}));

test('renders Auth page with app purpose description', () => {
  render(<Auth />);
  
  // Check for app name (split across elements)
  expect(screen.getByText('YHK')).toBeInTheDocument();
  expect(screen.getByText('Healthy Kitchen')).toBeInTheDocument();
  
  // Check for app purpose description
  expect(screen.getByText('Welcome to YHK Healthy Kitchen!')).toBeInTheDocument();
  expect(screen.getByText(/Your ultimate food delivery platform/)).toBeInTheDocument();
  expect(screen.getByText(/healthy, delicious meals/)).toBeInTheDocument();
  
  // Check for privacy policy link
  expect(screen.getByText('🔒 Privacy Policy')).toBeInTheDocument();
  expect(screen.getByText('📋 Terms of Service')).toBeInTheDocument();
});

test('renders consistent branding across Auth page', () => {
  render(<Auth />);
  
  // Verify branding elements
  expect(screen.getByText(/Where every bite tells a story of health & happiness!/i)).toBeInTheDocument();
  expect(screen.getByText('Fresh & Organic')).toBeInTheDocument();
  expect(screen.getByText('Fast Delivery')).toBeInTheDocument();
  expect(screen.getByText('Made with Love')).toBeInTheDocument();
});
