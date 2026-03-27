import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../../config/api';
import '../styles/CustomersPage.css';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('userToken');
        
        const response = await fetch(`${API_CONFIG.API_URL}/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });

        const data = await response.json();

        if (data.success) {
          console.log('Raw user data from backend:', data.data);
          // Map the API response to match the table structure
          const mappedCustomers = data.data.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || 'N/A',
            role: user.role || 'customer',
            joined: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : 'N/A',
            isAdmin: user.isAdmin || false
          }));
          console.log('Mapped customers:', mappedCustomers);
          setCustomers(mappedCustomers);
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
      }
    };

    fetchCustomers();
  }, []);

  // CRUD Functions
  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', password: '', role: 'customer' });
    setShowModal(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      password: '',
      role: customer.role || 'customer'
    });
    setShowModal(true);
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('userToken');
        const response = await fetch(`${API_CONFIG.API_URL}/users/${customerId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });

        if (response.ok) {
          setCustomers(customers.filter(c => c.id !== customerId));
          alert('Customer deleted successfully');
        } else {
          alert('Failed to delete customer');
        }
      } catch (err) {
        console.error('Error deleting customer:', err);
        alert('Error deleting customer');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('userToken');
      const url = editingCustomer 
        ? `${API_CONFIG.API_URL}/users/${editingCustomer.id}`
        : `${API_CONFIG.API_URL}/users`;
      
      const method = editingCustomer ? 'PUT' : 'POST';
      const payload = editingCustomer 
        ? { name: formData.name, email: formData.email, phone: formData.phone, role: formData.role }
        : { name: formData.name, email: formData.email, phone: formData.phone, password: formData.password, role: formData.role };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        console.log('Created user data from backend:', data.data);
        if (editingCustomer) {
          // Update existing customer
          setCustomers(customers.map(c => 
            c.id === editingCustomer.id 
              ? { ...c, ...data.data }
              : c
          ));
          alert('Customer updated successfully');
        } else {
          // Add new customer
          const newCustomer = {
            id: data.data._id,
            name: data.data.name,
            email: data.data.email,
            phone: data.data.phone || 'N/A',
            role: data.data.role || 'customer',
            joined: data.data.createdAt ? new Date(data.data.createdAt).toISOString().split('T')[0] : 'N/A',
            isAdmin: data.data.isAdmin || false
          };
          console.log('New customer to add:', newCustomer);
          setCustomers([...customers, newCustomer]);
          alert('Customer created successfully');
        }
        setShowModal(false);
        setFormData({ name: '', email: '', phone: '', password: '', role: 'customer' });
      } else {
        alert(data.error || 'Operation failed');
      }
    } catch (err) {
      console.error('Error saving customer:', err);
      alert('Error saving customer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="customers-page">
      <header className="customers-header">
        <h2>Customers</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleAddCustomer}>
            + Add Customer
          </button>
        </div>
      </header>

      <table className="customers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Orders</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.email}</td>
              <td>{customer.phone}</td>
              <td>
                <span className={`role-badge ${customer.role}`}>
                  {customer.role?.charAt(0).toUpperCase() + customer.role?.slice(1) || 'Customer'}
                </span>
              </td>
              <td>{customer.joined}</td>
              <td>{customer.orders}</td>
              <td>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button 
                    className="btn btn-small btn-outline" 
                    onClick={() => handleEditCustomer(customer)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-small btn-danger" 
                    onClick={() => handleDeleteCustomer(customer.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Customer Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="delivery_partner">Delivery Partner</option>
                </select>
              </div>
              {!editingCustomer && (
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingCustomer}
                  />
                </div>
              )}
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : (editingCustomer ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
