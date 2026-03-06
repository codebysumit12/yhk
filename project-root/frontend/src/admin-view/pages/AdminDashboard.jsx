import React from 'react';
import AdminLayout from '../layout/AdminLayout';

const AdminDashboard = () => {
  // Sample stats data
  const stats = [
    { label: 'Total Orders', value: '1,234', change: '+12%', up: true, icon: '📋', type: 'orange' },
    { label: 'Revenue', value: '$45,678', change: '+8%', up: true, icon: '💰', type: 'green' },
    { label: 'Customers', value: '8,901', change: '+5%', up: true, icon: '👥', type: 'blue' },
    { label: 'Cancelled', value: '23', change: '-2%', up: false, icon: '❌', type: 'red' },
  ];

  // Sample orders data
  const orders = [
    { id: '#ORD-001', customer: 'John Doe', items: '2x Chicken Biryani, 1x Coke', total: '$24.99', status: 'preparing' },
    { id: '#ORD-002', customer: 'Jane Smith', items: '1x Paneer Tikka, 2x Naan', total: '$18.50', status: 'ready' },
    { id: '#ORD-003', customer: 'Mike Johnson', items: '3x Veg Fried Rice', total: '$15.00', status: 'delivering' },
    { id: '#ORD-004', customer: 'Sarah Williams', items: '1x Fish Curry, 1x Rice', total: '$22.00', status: 'cancelled' },
  ];

  // Sample popular items
  const popularItems = [
    { name: 'Chicken Biryani', orders: 234, revenue: '$4,680' },
    { name: 'Paneer Tikka', orders: 189, revenue: '$2,835' },
    { name: 'Veg Fried Rice', orders: 156, revenue: '$1,560' },
    { name: 'Fish Curry', orders: 123, revenue: '$2,214' },
  ];

  // Sample activity
  const activities = [
    { text: 'New order #ORD-001 received', time: '2 min ago', color: '#22c55e' },
    { text: 'Order #ORD-002 marked as ready', time: '5 min ago', color: '#0ea5e9' },
    { text: 'Customer John Doe registered', time: '15 min ago', color: '#22c55e' },
    { text: 'Order #ORD-003 out for delivery', time: '20 min ago', color: '#0ea5e9' },
  ];

  // Chart data
  const chartData = [40, 65, 45, 80, 55, 90, 70];

  return (
    <AdminLayout>
      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.type}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className={`stat-change ${stat.up ? 'up' : 'down'}`}>
              {stat.up ? '↑' : '↓'} {stat.change} from last month
            </div>
          </div>
        ))}
      </div>

      {/* Lower Grid */}
      <div className="lower-grid">
        {/* Orders Table */}
        <div className="admin-card">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <button className="view-all">View All</button>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><span className="order-id">{order.id}</span></td>
                  <td>{order.customer}</td>
                  <td>{order.items}</td>
                  <td>{order.total}</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column */}
        <div className="right-col">
          {/* Popular Items */}
          <div className="admin-card">
            <div className="card-header">
              <h3>Popular Items</h3>
              <button className="view-all">View All</button>
            </div>
            {popularItems.map((item, index) => (
              <div key={index} className="popular-item">
                <div className="item-emoji">🍽️</div>
                <div className="item-info">
                  <p>{item.name}</p>
                  <span>{item.orders} orders</span>
                </div>
                <div className="item-revenue">
                  <p>{item.revenue}</p>
                  <span>revenue</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mini Chart */}
          <div className="admin-card">
            <div className="card-header">
              <h3>Weekly Orders</h3>
            </div>
            <div className="mini-chart">
              <div className="chart-bars">
                {chartData.map((height, index) => (
                  <div 
                    key={index} 
                    className={`bar ${index === 5 ? 'active' : ''}`}
                    style={{ height: `${height}%` }}
                  ></div>
                ))}
              </div>
              <div className="chart-labels">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="admin-card">
            <div className="card-header">
              <h3>Recent Activity</h3>
            </div>
            {activities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-dot" style={{ background: activity.color }}></div>
                <div>
                  <div className="a-text">{activity.text}</div>
                  <div className="a-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
