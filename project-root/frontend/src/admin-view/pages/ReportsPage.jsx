import React, { useState, useEffect } from 'react';
import { API_CONFIG, authHeaders } from '../../config/api';
import './reports-page.css';

const API_URL = API_CONFIG.API_URL;

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('today');
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  console.log('🔑 Reports token:', token);
  console.log('👤 Reports user:', user);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        console.log('🔍 Starting Reports data fetch...');
        console.log('🔑 Token being used:', token ? 'Present' : 'Missing');
        
        const [ordersRes, itemsRes] = await Promise.all([
          fetch(`${API_URL}/orders`, {
            headers: authHeaders()
          }),
          fetch(`${API_URL}/items`, {
            headers: authHeaders()
          })
        ]);

        console.log('📥 Orders response status:', ordersRes.status);
        console.log('📥 Items response status:', itemsRes.status);

        const ordersData = await ordersRes.json();
        const itemsData = await itemsRes.json();

        console.log('📊 Orders data:', ordersData);
        console.log('📊 Items data:', itemsData);

        if (ordersData.success) {
          console.log('✅ Setting orders:', ordersData.data?.length || 0, 'orders');
          setOrders(ordersData.data || []);
        } else {
          console.log('❌ Orders API failed:', ordersData);
        }
        
        if (itemsData.success) {
          console.log('✅ Setting items:', itemsData.data?.length || 0, 'items');
          setItems(itemsData.data || []);
        } else {
          console.log('❌ Items API failed:', itemsData);
        }
      } catch (error) {
        console.error('❌ Error fetching reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      console.log('❌ No token available for Reports API');
      setLoading(false);
    }
  }, [dateRange, token]);

  // Filter orders by date range
  const getFilteredOrders = () => {
    console.log('🔍 Filtering orders for date range:', dateRange);
    console.log('📊 Total orders before filter:', orders.length);
    
    const now = new Date();
    const filtered = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      console.log('📅 Order date:', orderDate, 'vs now:', now);
      
      switch (dateRange) {
        case 'today':
          const isToday = orderDate.toDateString() === now.toDateString();
          console.log('📅 Is today?', isToday);
          return isToday;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const isThisWeek = orderDate >= weekAgo;
          console.log('📅 Is this week?', isThisWeek, 'orderDate >= weekAgo?', orderDate, '>=', weekAgo);
          return isThisWeek;
        case 'month':
          const isThisMonth = orderDate.getMonth() === now.getMonth() && 
                 orderDate.getFullYear() === now.getFullYear();
          console.log('📅 Is this month?', isThisMonth);
          return isThisMonth;
        case 'year':
          const isThisYear = orderDate.getFullYear() === now.getFullYear();
          console.log('📅 Is this year?', isThisYear);
          return isThisYear;
        case 'all':
          console.log('📅 All orders - returning true');
          return true;
        default:
          console.log('📅 Default - returning true');
          return true;
      }
    });
    
    console.log('📊 Orders after filter:', filtered.length);
    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  // Calculate metrics
  const totalRevenue = filteredOrders.reduce((sum, order) => 
    sum + (order.pricing?.total || 0), 0
  );
  
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const deliveredOrders = filteredOrders.filter(o => o.status === 'delivered').length;
  const cancelledOrders = filteredOrders.filter(o => o.status === 'cancelled').length;
  const pendingOrders = filteredOrders.filter(o => 
    ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery'].includes(o.status)
  ).length;

  // Order status breakdown
  const statusBreakdown = {
    pending: filteredOrders.filter(o => o.status === 'pending').length,
    confirmed: filteredOrders.filter(o => o.status === 'confirmed').length,
    preparing: filteredOrders.filter(o => o.status === 'preparing').length,
    ready: filteredOrders.filter(o => o.status === 'ready').length,
    'out-for-delivery': filteredOrders.filter(o => o.status === 'out-for-delivery').length,
    delivered: filteredOrders.filter(o => o.status === 'delivered').length,
    cancelled: filteredOrders.filter(o => o.status === 'cancelled').length,
  };

  // Order type breakdown
  const orderTypeBreakdown = {
    delivery: filteredOrders.filter(o => o.orderType === 'delivery').length,
    takeaway: filteredOrders.filter(o => o.orderType === 'takeaway').length,
    'dine_in': filteredOrders.filter(o => o.orderType === 'dine_in').length,
  };

  // Payment method breakdown
  const paymentBreakdown = {
    online: filteredOrders.filter(o => o.paymentMethod === 'online').length,
    cash: filteredOrders.filter(o => o.paymentMethod === 'cash').length,
    card: filteredOrders.filter(o => o.paymentMethod === 'card').length,
    upi: filteredOrders.filter(o => o.paymentMethod === 'upi').length,
  };

  // Best selling items
  const itemStats = {};
  filteredOrders.forEach(order => {
    order.orderItems?.forEach(item => {
      if (itemStats[item.name]) {
        itemStats[item.name].quantity += item.quantity;
        itemStats[item.name].revenue += item.subtotal || (item.price * item.quantity);
      } else {
        itemStats[item.name] = {
          quantity: item.quantity,
          revenue: item.subtotal || (item.price * item.quantity)
        };
      }
    });
  });

  const bestSellingItems = Object.entries(itemStats)
    .sort(([,a], [,b]) => b.quantity - a.quantity)
    .slice(0, 10)
    .map(([name, data]) => ({
      name,
      quantity: data.quantity,
      revenue: data.revenue
    }));

  // Peak hours analysis
  const hourlyOrders = Array(24).fill(0);
  filteredOrders.forEach(order => {
    const hour = new Date(order.createdAt).getHours();
    hourlyOrders[hour]++;
  });
  const peakHour = hourlyOrders.indexOf(Math.max(...hourlyOrders));

  // Daily revenue for last 7 days
  const last7DaysRevenue = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayRevenue = orders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString();
      })
      .reduce((sum, order) => sum + (order.pricing?.total || 0), 0);
    
    last7DaysRevenue.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: dayRevenue
    });
  }

  // Export to CSV
  const exportToCSV = () => {
    const csvData = [
      ['Order ID', 'Customer', 'Date', 'Total', 'Status', 'Payment Method'],
      ...filteredOrders.map(order => [
        order.orderNumber,
        order.customer?.name || 'Guest',
        new Date(order.createdAt).toLocaleDateString(),
        order.pricing?.total || 0,
        order.status,
        order.paymentMethod
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_report_${dateRange}.csv`;
    a.click();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'sales', label: 'Sales', icon: '💰' },
    { id: 'orders', label: 'Orders', icon: '📋' },
    { id: 'menu', label: 'Menu Performance', icon: '🍽️' },
    { id: 'customers', label: 'Customers', icon: '👥' },
  ];

  if (loading) {
    return (
      <div className="reports-page">
        <div className="loading">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h2>📊 Business Reports</h2>
          <p>Comprehensive analytics and insights</p>
        </div>
        <div className="header-actions">
          <select 
            className="date-range-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
          <button className="export-btn" onClick={exportToCSV}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="reports-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="reports-content">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Key Metrics */}
            <div className="metrics-grid">
              <div className="metric-card revenue">
                <div className="metric-icon">💰</div>
                <div className="metric-details">
                  <span className="metric-label">Total Revenue</span>
                  <span className="metric-value">₹{totalRevenue.toLocaleString()}</span>
                </div>
              </div>
              <div className="metric-card orders">
                <div className="metric-icon">📋</div>
                <div className="metric-details">
                  <span className="metric-label">Total Orders</span>
                  <span className="metric-value">{totalOrders}</span>
                </div>
              </div>
              <div className="metric-card avg">
                <div className="metric-icon">📊</div>
                <div className="metric-details">
                  <span className="metric-label">Avg Order Value</span>
                  <span className="metric-value">₹{Math.round(avgOrderValue)}</span>
                </div>
              </div>
              <div className="metric-card peak">
                <div className="metric-icon">⏰</div>
                <div className="metric-details">
                  <span className="metric-label">Peak Hour</span>
                  <span className="metric-value">{peakHour}:00</span>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="charts-row">
              {/* Daily Revenue Chart */}
              <div className="chart-card">
                <h3>📈 Daily Revenue (Last 7 Days)</h3>
                <div className="bar-chart">
                  {last7DaysRevenue.map((data, index) => {
                    const maxRevenue = Math.max(...last7DaysRevenue.map(d => d.revenue));
                    const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div key={index} className="bar-wrapper">
                        <div 
                          className="bar"
                          style={{ height: `${Math.max(height, 5)}%` }}
                          title={`₹${data.revenue}`}
                        ></div>
                        <span className="bar-label">{data.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Status Breakdown */}
              <div className="chart-card">
                <h3>📊 Order Status Breakdown</h3>
                <div className="status-breakdown">
                  {Object.entries(statusBreakdown).map(([status, count]) => (
                    <div key={status} className="status-item">
                      <div className="status-bar-wrapper">
                        <div className="status-label">{status}</div>
                        <div className="status-bar">
                          <div 
                            className={`status-fill ${status}`}
                            style={{ width: `${totalOrders > 0 ? (count / totalOrders) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <div className="status-count">{count}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SALES TAB */}
        {activeTab === 'sales' && (
          <div className="sales-tab">
            <div className="sales-grid">
              {/* Revenue Breakdown */}
              <div className="report-card">
                <h3>💰 Revenue Breakdown</h3>
                <div className="breakdown-list">
                  <div className="breakdown-item">
                    <span>Food & Beverages</span>
                    <strong>₹{totalRevenue.toLocaleString()}</strong>
                  </div>
                  <div className="breakdown-item">
                    <span>Delivery Fees</span>
                    <strong>₹{filteredOrders.reduce((sum, o) => sum + (o.pricing?.deliveryFee || 0), 0)}</strong>
                  </div>
                  <div className="breakdown-item">
                    <span>Taxes</span>
                    <strong>₹{filteredOrders.reduce((sum, o) => sum + (o.pricing?.tax || 0), 0)}</strong>
                  </div>
                  <div className="breakdown-item">
                    <span>Discounts</span>
                    <strong className="discount">-₹{filteredOrders.reduce((sum, o) => sum + (o.pricing?.discount || 0), 0)}</strong>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="report-card">
                <h3>💳 Payment Methods</h3>
                <div className="payment-breakdown">
                  {Object.entries(paymentBreakdown).map(([method, count]) => (
                    <div key={method} className="payment-item">
                      <div className="payment-method">{method.toUpperCase()}</div>
                      <div className="payment-count">{count} orders</div>
                      <div className="payment-percentage">
                        {totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Type Analysis */}
              <div className="report-card">
                <h3>🛵 Order Type Analysis</h3>
                <div className="order-type-chart">
                  {Object.entries(orderTypeBreakdown).map(([type, count]) => (
                    <div key={type} className="order-type-item">
                      <div className="order-type-icon">
                        {type === 'delivery' ? '🚚' : type === 'takeaway' ? '🛍️' : '🍽️'}
                      </div>
                      <div className="order-type-label">{type.replace('_', ' ').toUpperCase()}</div>
                      <div className="order-type-value">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="orders-tab">
            <div className="orders-stats-grid">
              <div className="stat-box delivered">
                <h4>✅ Delivered</h4>
                <p className="stat-number">{deliveredOrders}</p>
                <span className="stat-percent">
                  {totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0}%
                </span>
              </div>
              <div className="stat-box pending">
                <h4>⏳ Pending</h4>
                <p className="stat-number">{pendingOrders}</p>
                <span className="stat-percent">
                  {totalOrders > 0 ? Math.round((pendingOrders / totalOrders) * 100) : 0}%
                </span>
              </div>
              <div className="stat-box cancelled">
                <h4>❌ Cancelled</h4>
                <p className="stat-number">{cancelledOrders}</p>
                <span className="stat-percent">
                  {totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0}%
                </span>
              </div>
              <div className="stat-box total">
                <h4>📊 Total</h4>
                <p className="stat-number">{totalOrders}</p>
                <span className="stat-percent">100%</span>
              </div>
            </div>

            {/* Peak Hours */}
            <div className="report-card">
              <h3>⏰ Peak Hours Analysis</h3>
              <div className="peak-hours-chart">
                {hourlyOrders.map((count, hour) => {
                  const maxCount = Math.max(...hourlyOrders);
                  const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  return (
                    <div key={hour} className="hour-bar">
                      <div 
                        className={`hour-fill ${hour === peakHour ? 'peak' : ''}`}
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`${hour}:00 - ${count} orders`}
                      ></div>
                      <span className="hour-label">{hour}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MENU PERFORMANCE TAB */}
        {activeTab === 'menu' && (
          <div className="menu-tab">
            <div className="report-card">
              <h3>🏆 Best Selling Items</h3>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Item Name</th>
                    <th>Quantity Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {bestSellingItems.map((item, index) => (
                    <tr key={index}>
                      <td className="rank">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && `#${index + 1}`}
                      </td>
                      <td className="item-name">{item.name}</td>
                      <td>{item.quantity}</td>
                      <td className="revenue">₹{Math.round(item.revenue).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Category Performance */}
            <div className="report-card">
              <h3>📁 Category Performance</h3>
              <div className="category-stats">
                <div className="category-item">
                  <span>Total Items</span>
                  <strong>{items.length}</strong>
                </div>
                <div className="category-item">
                  <span>Available Items</span>
                  <strong>{items.filter(i => i.isAvailable).length}</strong>
                </div>
                <div className="category-item">
                  <span>Featured Items</span>
                  <strong>{items.filter(i => i.isFeatured).length}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="customers-tab">
            <div className="customer-stats-grid">
              <div className="customer-stat">
                <h4>Total Customers</h4>
                <p className="big-number">
                  {new Set(filteredOrders.map(o => o.customer?.email || o.customer?.phone).filter(Boolean)).size}
                </p>
              </div>
              <div className="customer-stat">
                <h4>New Customers</h4>
                <p className="big-number">
                  {filteredOrders.filter(o => {
                    const customerOrders = filteredOrders.filter(order => 
                      order.customer?.email === o.customer?.email || 
                      order.customer?.phone === o.customer?.phone
                    );
                    return customerOrders.length === 1;
                  }).length}
                </p>
              </div>
              <div className="customer-stat">
                <h4>Returning Customers</h4>
                <p className="big-number">
                  {new Set(
                    filteredOrders
                      .filter(o => {
                        const customerOrders = filteredOrders.filter(order => 
                          order.customer?.email === o.customer?.email || 
                          order.customer?.phone === o.customer?.phone
                        );
                        return customerOrders.length > 1;
                      })
                      .map(o => o.customer?.email || o.customer?.phone)
                  ).size}
                </p>
              </div>
            </div>

            {/* Top Customers */}
            <div className="report-card">
              <h3>👑 Top Customers</h3>
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    filteredOrders.reduce((acc, order) => {
                      const key = order.customer?.name || 'Guest';
                      if (!acc[key]) {
                        acc[key] = { orders: 0, spent: 0 };
                      }
                      acc[key].orders++;
                      acc[key].spent += order.pricing?.total || 0;
                      return acc;
                    }, {})
                  )
                    .sort(([,a], [,b]) => b.spent - a.spent)
                    .slice(0, 10)
                    .map(([name, data], index) => (
                      <tr key={index}>
                        <td>{name}</td>
                        <td>{data.orders}</td>
                        <td>₹{Math.round(data.spent).toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
