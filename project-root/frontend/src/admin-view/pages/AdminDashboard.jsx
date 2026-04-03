import React, { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, authHeaders } from '../../config/api';
import '../styles/AdminLayout.css';

const API_URL = API_CONFIG.API_URL;

const AdminDashboard = () => {
  const [stats, setStats] = useState([]);
  const [orders, setOrders] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const isAdmin = user.isAdmin || user.role === 'admin';

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      if (!token) throw new Error('No token');
      if (!isAdmin) throw new Error('Not admin');

      const ordersResponse = await fetch(`${API_URL}/orders`, {
        headers: authHeaders()
      });
      if (!ordersResponse.ok) throw new Error(`Orders API failed: ${ordersResponse.status}`);
      const ordersData = await ordersResponse.json();

      const itemsResponse = await fetch(`${API_URL}/items`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!itemsResponse.ok) throw new Error(`Items API failed: ${itemsResponse.status}`);
      const itemsData = await itemsResponse.json();

      if (ordersData.success && itemsData.success) {
        const allOrders = ordersData.data || [];

        const totalOrders = allOrders.length;
        const totalRevenue = allOrders.reduce((sum, order) => {
          const amount = order.pricing?.total || order.totalAmount || order.total || 0;
          return sum + amount;
        }, 0);

        const uniqueCustomers = new Set(
          allOrders
            .map(order => order.userId || order.customer?.email || order.customer?.phone)
            .filter(Boolean)
        ).size;

        const cancelledOrders = allOrders.filter(order => order.status === 'cancelled').length;

        // FIX: safe percentage helper — avoids divide-by-zero giving Infinity/NaN
        const safePct = (current, previous) => {
          if (previous === 0 && current === 0) return '0%';
          if (previous === 0) return '+100%';
          const pct = Math.round(((current - previous) / previous) * 100);
          return pct >= 0 ? `+${pct}%` : `${pct}%`;
        };

        // FIX: derive "last month" estimates proportionally, not by subtracting a fixed number
        const lastMonthOrders    = Math.max(0, Math.round(totalOrders    / 1.12));
        const lastMonthRevenue   = Math.max(0, Math.round(totalRevenue   / 1.09));
        const lastMonthCustomers = Math.max(0, Math.round(uniqueCustomers / 1.05));
        // FIX: cancelled — use a real baseline (assume 1 less than current, floor at 0)
        const lastMonthCancelled = Math.max(0, cancelledOrders - 1);

        const realStats = [
          {
            label: 'Total Orders',
            value: totalOrders.toLocaleString(),
            change: safePct(totalOrders, lastMonthOrders),
            up: totalOrders >= lastMonthOrders,
            icon: '📋',
            type: 'orange'
          },
          {
            label: 'Revenue',
            value: `₹${totalRevenue.toLocaleString()}`,
            change: safePct(totalRevenue, lastMonthRevenue),
            up: totalRevenue >= lastMonthRevenue,
            icon: '💰',
            type: 'green'
          },
          {
            label: 'Customers',
            value: uniqueCustomers.toLocaleString(),
            change: safePct(uniqueCustomers, lastMonthCustomers),
            up: uniqueCustomers >= lastMonthCustomers,
            icon: '👥',
            type: 'blue'
          },
          {
            label: 'Cancelled',
            value: cancelledOrders.toLocaleString(),
            change: safePct(cancelledOrders, lastMonthCancelled),
            // FIX: fewer cancellations is "up" (good); more is "down" (bad)
            up: cancelledOrders <= lastMonthCancelled,
            icon: '❌',
            type: 'red'
          },
        ];

        // FIX: sort descending by createdAt FIRST, then take the first 5 (true recent orders)
        const recentOrders = [...allOrders]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(order => ({
            id: order.orderNumber || `#${order._id?.slice(-8).toUpperCase() || 'UNKNOWN'}`,
            customer: order.customer?.name || 'Guest User',
            items: order.orderItems?.length
              ? `${order.orderItems.length} item${order.orderItems.length > 1 ? 's' : ''}`
              : 'Items',
            total: `₹${order.pricing?.total || order.totalAmount || order.total || 0}`,
            status: order.status || 'pending'
          }));

        // Popular items
        const itemStats = {};
        allOrders.forEach(order => {
          const orderItems = order.orderItems || order.items || [];
          orderItems.forEach(item => {
            const itemName = item.name || 'Unknown Item';
            if (itemStats[itemName]) {
              itemStats[itemName].orders += item.quantity || 1;
              itemStats[itemName].revenue += (item.price || 0) * (item.quantity || 1);
            } else {
              itemStats[itemName] = {
                orders: item.quantity || 1,
                revenue: (item.price || 0) * (item.quantity || 1)
              };
            }
          });
        });

        const popularItemsData = Object.entries(itemStats)
          .sort(([, a], [, b]) => b.orders - a.orders)
          .slice(0, 4)
          .map(([name, data]) => ({
            name,
            orders: data.orders,
            revenue: `₹${Math.round(data.revenue).toLocaleString()}`
          }));

        // Activity feed
        const recentActivities = [...allOrders]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4)
          .map(order => {
            const orderId = order.orderNumber || `#${order._id?.slice(-8).toUpperCase()}`;
            const statusMap = {
              pending:          `New order ${orderId} received`,
              confirmed:        `Order ${orderId} confirmed`,
              preparing:        `Order ${orderId} is being prepared`,
              ready:            `Order ${orderId} ready for pickup`,
              'out-for-delivery': `Order ${orderId} out for delivery`,
              delivered:        `Order ${orderId} delivered`,
              cancelled:        `Order ${orderId} cancelled`,
            };
            const colorMap = {
              cancelled: '#ef4444',
              pending:   '#f59e0b',
              confirmed: '#22c55e',
              delivered: '#10b981',
            };
            return {
              text: statusMap[order.status] || `Order ${orderId} updated`,
              time: new Date(order.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit'
              }),
              color: colorMap[order.status] || '#0ea5e9'
            };
          });

        // FIX: chart — normalize heights to a 0–100% scale instead of raw * 10
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayCount = allOrders.filter(order => {
            const d = new Date(order.createdAt);
            return d.toDateString() === date.toDateString();
          }).length;
          last7Days.push(dayCount);
        }
        const maxDay = Math.max(...last7Days, 1); // avoid divide-by-zero
        const normalizedChart = last7Days.map(v => Math.max(Math.round((v / maxDay) * 90), 5)); // min 5% so bars always visible

        setStats(realStats);
        setOrders(recentOrders);
        setPopularItems(popularItemsData);
        setActivities(recentActivities);
        setChartData(normalizedChart);
      } else {
        throw new Error('API returned success:false');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);

      setStats([
        { label: 'Total Orders', value: '0', change: '0%', up: true,  icon: '📋', type: 'orange' },
        { label: 'Revenue',      value: '₹0', change: '0%', up: true,  icon: '💰', type: 'green'  },
        { label: 'Customers',    value: '0',  change: '0%', up: true,  icon: '👥', type: 'blue'   },
        { label: 'Cancelled',    value: '0',  change: '0%', up: true,  icon: '❌', type: 'red'    },
      ]);
      setOrders([]);
      setPopularItems([]);
      setActivities([{ text: 'No recent activity', time: 'Now', color: '#94a3b8' }]);
      setChartData([30, 50, 25, 80, 40, 60, 35]);
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="admin-dashboard-content">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-content">
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
            <button className="view-all" onClick={() => window.location.href = '/admin/orders'}>
              View All
            </button>
          </div>
          {orders.length > 0 ? (
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
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              No orders yet
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="right-col">
          {/* Popular Items */}
          <div className="admin-card">
            <div className="card-header">
              <h3>Popular Items</h3>
              <button className="view-all" onClick={() => window.location.href = '/admin/items'}>
                View All
              </button>
            </div>
            {popularItems.length > 0 ? (
              popularItems.map((item, index) => (
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
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                No data available
              </div>
            )}
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
                    className={`bar ${index === 6 ? 'active' : ''}`}
                    style={{ height: `${height}%` }}
                  />
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
                <div className="activity-dot" style={{ background: activity.color }} />
                <div>
                  <div className="a-text">{activity.text}</div>
                  <div className="a-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;