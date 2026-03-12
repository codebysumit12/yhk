import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../../config/api';
import '../styles/CustomersPage.css';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('userToken');
        
        const response = await fetch(`${API_CONFIG.API_URL}/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });

        const data = await response.json();

        if (data.success) {
          // Map the API response to match the table structure
          const mappedCustomers = data.data.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            joined: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : 'N/A',
            isAdmin: user.isAdmin || false
          }));
          setCustomers(mappedCustomers);
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="customers-page">
      <header className="customers-header">
        <h2>Customers</h2>
        <input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </header>

      <table className="customers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Joined</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.email}</td>
              <td>{customer.joined}</td>
              <td>{customer.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomersPage;
