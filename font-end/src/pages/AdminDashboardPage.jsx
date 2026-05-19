import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, ShoppingCart, Users, Box, TrendingUp, TrendingDown,
  Calendar, Clock, MoreHorizontal
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { orderApi } from '../api/orderApi';
import { userApi } from '../api/userApi';
import { menuItemApi } from '../api/menuItemApi';
import { useToast } from '../contexts/ToastContext';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  
  // Stats States
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0
  });

  // Chart Data
  const [revenueData, setRevenueData] = useState([]);
  
  // Lists
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [ordersRes, usersRes, productsRes] = await Promise.allSettled([
        orderApi.getOrders(),
        userApi.getAll(),
        menuItemApi.getAll()
      ]);

      // Process Orders
      let orders = [];
      if (ordersRes.status === 'fulfilled') {
        const resData = ordersRes.value.data;
        orders = resData?.data || resData?.content || resData || [];
      }

      // Process Users
      let users = [];
      if (usersRes.status === 'fulfilled') {
        const resData = usersRes.value.data;
        users = Array.isArray(resData) ? resData : (resData?.content || []);
      }

      // Process Products
      let products = [];
      if (productsRes.status === 'fulfilled') {
        const resData = productsRes.value.data;
        products = resData?.data || resData?.content || resData || [];
      }

      // Calculate Stats
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => {
        if (order.status !== 'CANCELLED' && order.paymentStatus === 'PAID') {
          return sum + (order.totalAmount || 0);
        }
        // Fallback for demo if few paid orders exist
        if (order.status === 'COMPLETED' || order.status === 'PENDING') {
           return sum + (order.totalAmount || 0);
        }
        return sum;
      }, 0);

      setStats({
        totalRevenue,
        totalOrders,
        totalUsers: users.length,
        totalProducts: products.length
      });

      // Prepare Chart Data (Last 7 days)
      const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          date: d.toISOString().split('T')[0], // YYYY-MM-DD
          displayDate: `${d.getDate()}/${d.getMonth() + 1}`,
          revenue: 0,
          orders: 0
        };
      });

      orders.forEach(order => {
        if (!order.createdAt) return;
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        const dayIndex = last7Days.findIndex(d => d.date === orderDate);
        if (dayIndex !== -1) {
          last7Days[dayIndex].orders += 1;
          if (order.status !== 'CANCELLED') {
            last7Days[dayIndex].revenue += (order.totalAmount || 0);
          }
        }
      });

      setRevenueData(last7Days);

      // Recent Orders (Top 5)
      const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentOrders(sortedOrders.slice(0, 5));

      // Recent Users (Top 5 - Only ROLE_USER)
      const customersOnly = users.filter(u => {
        let roleCode = null;
        if (u.role) {
          roleCode = typeof u.role === 'object' ? u.role.code : u.role;
        } else if (Array.isArray(u.roles) && u.roles.length > 0) {
          const adminRole = u.roles.find(r => (typeof r === 'object' ? r.code : r) === 'ROLE_ADMIN');
          const primary = adminRole || u.roles[0];
          roleCode = typeof primary === 'object' ? primary.code : primary;
        }
        return !roleCode || roleCode === 'ROLE_USER';
      });
      const sortedUsers = [...customersOnly].reverse();
      setRecentUsers(sortedUsers.slice(0, 5));

    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      toast.error("Không thể tải dữ liệu tổng quan.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ';
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    switch (s) {
      case 'PENDING': return <span className="status-badge warning">Chờ xác nhận</span>;
      case 'CONFIRMED': return <span className="status-badge info">Đã xác nhận</span>;
      case 'IN_PROGRESS': return <span className="status-badge info">Đang xử lý</span>;
      case 'READY': return <span className="status-badge info">Đang giao</span>;
      case 'COMPLETED': return <span className="status-badge success">Đã giao</span>;
      case 'CANCELLED': return <span className="status-badge error">Đã hủy</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Đang tổng hợp dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Tổng quan hệ thống</h1>
        </div>
        <div className="header-date">
          <Calendar size={18} />
          <span>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="stats-grid">
        <div className="stat-card-horizontal">
          <div className="stat-icon-circle orange">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Tổng doanh thu</div>
            <div className="stat-number" style={{ fontSize: '20px' }}>{formatPrice(stats.totalRevenue)}</div>
          </div>
        </div>

        <div className="stat-card-horizontal">
          <div className="stat-icon-circle" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
            <ShoppingCart size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Đơn hàng</div>
            <div className="stat-number">{stats.totalOrders.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card-horizontal">
          <div className="stat-icon-circle green">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Khách hàng</div>
            <div className="stat-number">{stats.totalUsers.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card-horizontal">
          <div className="stat-icon-circle" style={{ background: '#f3e8ff', color: '#a855f7' }}>
            <Box size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Sản phẩm</div>
            <div className="stat-number">{stats.totalProducts.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="charts-grid">
        <div className="chart-card main-chart">
          <div className="chart-header">
            <h3>Doanh thu 7 ngày gần nhất</h3>
          </div>
          <div className="chart-body" style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis 
                  tickFormatter={(val) => `${val / 1000}k`} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  dx={-10}
                />
                <Tooltip 
                  formatter={(value) => [formatPrice(value), "Doanh thu"]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card side-chart">
          <div className="chart-header">
            <h3>Đơn hàng theo ngày</h3>
          </div>
          <div className="chart-body" style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="orders" name="Số đơn hàng" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* LISTS ROW */}
      <div className="lists-grid">
        <div className="list-card">
          <div className="list-header">
            <h3>Đơn hàng gần đây</h3>
            <button className="btn-view-all" onClick={() => navigate('/admin/orders')}>Xem tất cả</button>
          </div>
          <div className="list-body table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>MÃ ĐƠN</th>
                  <th>KHÁCH HÀNG</th>
                  <th>TỔNG TIỀN</th>
                  <th>TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>Không có đơn hàng nào</td></tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{fontWeight: 600, color: '#334155'}}>#{order.id.toString().substring(0,6)}</td>
                      <td>
                        <div className="table-user-info">
                          <span className="name">{order.receiverName}</span>
                        </div>
                      </td>
                      <td style={{fontWeight: 600, color: '#0f172a'}}>{formatPrice(order.totalAmount)}</td>
                      <td>{getStatusBadge(order.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="list-card">
          <div className="list-header">
            <h3>Khách hàng mới</h3>
            <button className="btn-view-all" onClick={() => navigate('/admin/users')}>Xem tất cả</button>
          </div>
          <div className="list-body">
            <ul className="recent-users-list">
              {recentUsers.length === 0 ? (
                <div style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>Không có khách hàng nào</div>
              ) : (
                recentUsers.map(user => (
                  <li key={user.id} className="recent-user-item">
                    <div className="user-avatar">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="user-details">
                      <h4>{user.fullName || user.username || `User #${user.id}`}</h4>
                      <p>{user.email || user.phoneNumber || 'Khách hàng'}</p>
                    </div>
                    <div className="user-time">
                      Mới tham gia
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
