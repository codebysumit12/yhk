import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CategoriesPage from '../admin-view/pages/CategoriesPage';
import { API_CONFIG } from '../config/api';

// Mock fetch API
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock alert
global.alert = jest.fn();

describe('CategoriesPage - Category Creation', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'mock-token';
      if (key === 'user') return JSON.stringify({ isAdmin: true });
      return null;
    });
    global.alert.mockClear();
  });

  const mockCategories = [
    {
      _id: '1',
      name: 'Pizza',
      slug: 'pizza',
      description: 'Italian pizzas',
      icon: '🍕',
      color: '#ef4444',
      displayOrder: 1,
      isActive: true,
      itemCount: 5,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: '2',
      name: 'Burgers',
      slug: 'burgers',
      description: 'American burgers',
      icon: '🍔',
      color: '#f59e0b',
      displayOrder: 2,
      isActive: true,
      itemCount: 3,
      createdAt: '2024-01-02T00:00:00.000Z'
    }
  ];

  it('renders category management page correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockCategories
      })
    });

    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('📁 Category Management')).toBeInTheDocument();
      expect(screen.getByText('Organize your menu items into categories')).toBeInTheDocument();
      expect(screen.getByText('+ Add New Category')).toBeInTheDocument();
    });

    // Check if categories are displayed
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('Burgers')).toBeInTheDocument();
  });

  it('opens create category modal when button is clicked', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockCategories
      })
    });

    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('+ Add New Category')).toBeInTheDocument();
    });

    const addButton = screen.getByText('+ Add New Category');
    userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create New Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Category Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByText('Select Icon')).toBeInTheDocument();
      expect(screen.getByText('Select Color')).toBeInTheDocument();
      expect(screen.getByText('Create Category')).toBeInTheDocument();
    });
  });

  it('creates a new category successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockCategories
      })
    });

    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('+ Add New Category')).toBeInTheDocument();
    });

    // Open modal
    userEvent.click(screen.getByText('+ Add New Category'));

    await waitFor(() => {
      expect(screen.getByLabelText('Category Name *')).toBeInTheDocument();
    });

    // Fill form
    const nameInput = screen.getByLabelText('Category Name *');
    const descriptionInput = screen.getByLabelText('Description');
    const displayOrderInput = screen.getByLabelText('Display Order');

    userEvent.type(nameInput, 'New Category');
    userEvent.type(descriptionInput, 'Test description');
    userEvent.clear(displayOrderInput);
    userEvent.type(displayOrderInput, '3');

    // Select icon
    const iconOptions = screen.getAllByTestId('icon-option');
    userEvent.click(iconOptions[1]); // Select 🍕

    // Select color
    const colorOptions = screen.getAllByTestId('color-option');
    userEvent.click(colorOptions[0]); // Select first color

    // Mock successful creation response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Category created successfully',
        data: {
          _id: '3',
          name: 'New Category',
          slug: 'new-category',
          description: 'Test description',
          icon: '🍕',
          color: '#22c55e',
          displayOrder: 3,
          isActive: true,
          itemCount: 0
        }
      })
    });

    // Mock refetch response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [...mockCategories, {
          _id: '3',
          name: 'New Category',
          slug: 'new-category',
          description: 'Test description',
          icon: '🍕',
          color: '#22c55e',
          displayOrder: 3,
          isActive: true,
          itemCount: 0
        }]
      })
    });

    // Submit form
    userEvent.click(screen.getByText('Create Category'));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Category created successfully!');
    });

    // Verify fetch was called with correct data
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/categories'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-token'
        }),
        body: expect.any(FormData)
      })
    );
  });

  it('validates required fields', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockCategories
      })
    });

    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('+ Add New Category')).toBeInTheDocument();
    });

    // Open modal
    userEvent.click(screen.getByText('+ Add New Category'));

    await waitFor(() => {
      expect(screen.getByText('Create Category')).toBeInTheDocument();
    });

    // Try to submit without required fields
    const createButton = screen.getByText('Create Category');
    userEvent.click(createButton);

    // HTML5 validation should prevent submission
    const nameInput = screen.getByLabelText('Category Name *');
    expect(nameInput).toBeInvalid();
  });

  it('prevents duplicate category names', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockCategories
      })
    });

    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('+ Add New Category')).toBeInTheDocument();
    });

    // Open modal
    userEvent.click(screen.getByText('+ Add New Category'));

    await waitFor(() => {
      expect(screen.getByLabelText('Category Name *')).toBeInTheDocument();
    });

    // Try to create category with existing name
    const nameInput = screen.getByLabelText('Category Name *');
    userEvent.type(nameInput, 'Pizza'); // Existing category name

    const createButton = screen.getByText('Create Category');
    userEvent.click(createButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('A category with this name already exists!');
    });
  });

  it('handles API errors gracefully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockCategories
      })
    });

    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('+ Add New Category')).toBeInTheDocument();
    });

    // Open modal
    userEvent.click(screen.getByText('+ Add New Category'));

    await waitFor(() => {
      expect(screen.getByLabelText('Category Name *')).toBeInTheDocument();
    });

    // Fill form
    const nameInput = screen.getByLabelText('Category Name *');
    userEvent.type(nameInput, 'Error Category');

    // Mock error response
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Server error occurred'
      })
    });

    // Submit form
    userEvent.click(screen.getByText('Create Category'));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Server error occurred');
    });
  });

  it('handles network errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockCategories
      })
    });

    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('+ Add New Category')).toBeInTheDocument();
    });

    // Open modal
    userEvent.click(screen.getByText('+ Add New Category'));

    await waitFor(() => {
      expect(screen.getByLabelText('Category Name *')).toBeInTheDocument();
    });

    // Fill form
    const nameInput = screen.getByLabelText('Category Name *');
    userEvent.type(nameInput, 'Network Error Category');

    // Mock network error
    fetch.mockRejectedValueOnce(new Error('Network error'));

    // Submit form
    userEvent.click(screen.getByText('Create Category'));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Error saving category: Network error');
    });
  });

  it('displays loading state correctly', async () => {
    // Mock delayed response
    fetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: mockCategories
          })
        }), 100)
      )
    );

    render(<CategoriesPage />);

    expect(screen.getByText('Loading categories...')).toBeInTheDocument();
  });

  it('displays empty state when no categories exist', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: []
      })
    });

    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('No Categories Found')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating your first category')).toBeInTheDocument();
      expect(screen.getByText('+ Create First Category')).toBeInTheDocument();
    });
  });

  it('filters categories correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockCategories
      })
    });

    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Pizza')).toBeInTheDocument();
    });

    // Test search
    const searchInput = screen.getByPlaceholderText('Search categories...');
    userEvent.type(searchInput, 'Pizza');

    await waitFor(() => {
      expect(screen.getByText('Pizza')).toBeInTheDocument();
      expect(screen.queryByText('Burgers')).not.toBeInTheDocument();
    });

    // Test filter
    const filterSelect = screen.getByDisplayValue('All Status');
    userEvent.selectOptions(filterSelect, 'active');

    // Both categories are active, so both should still show
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('Burgers')).toBeInTheDocument();
  });
});
