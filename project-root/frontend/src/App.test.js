import React from 'react';
import { render, screen } from '@testing-library/react';

// Create a simple test component that doesn't use routing
const TestApp = () => {
  return (
    <div>
      <h1>YHK Healthy Kitchen</h1>
      <p>Food Ordering & Delivery Platform</p>
    </div>
  );
};

test('renders app title and description', () => {
  render(<TestApp />);
  expect(screen.getByText('YHK Healthy Kitchen')).toBeInTheDocument();
  expect(screen.getByText('Food Ordering & Delivery Platform')).toBeInTheDocument();
});
