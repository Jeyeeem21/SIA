import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  Box,
  TrendingDown
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from 'recharts';
import { dashboardAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salesPeriod, setSalesPeriod] = useState('daily'); // 'daily', 'weekly', 'monthly'

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/20 min-h-full flex items-center justify-center">
        <div className="text-xl text-slate-600">Loading dashboard...</div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Today\'s Revenue',
      value: `₱${dashboardData.stats.today_revenue.toLocaleString()}`,
      change: `Total: ₱${dashboardData.stats.total_revenue.toLocaleString()}`,
      trend: 'up',
      icon: DollarSign,
      color: 'from-cyan-500 to-teal-600',
      textColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      title: 'Active Orders',
      value: dashboardData.stats.active_orders.toString(),
      change: `${dashboardData.orders_by_status.pending} Pending`,
      trend: 'up',
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Low Stock Alerts',
      value: dashboardData.stats.low_stock_count.toString(),
      change: 'Need restock',
      trend: 'down',
      icon: AlertTriangle,
      color: 'from-rose-500 to-red-600',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50'
    },
    {
      title: 'Total Products',
      value: dashboardData.stats.total_products.toString(),
      change: `${dashboardData.orders_by_status.completed} Completed`,
      trend: 'up',
      icon: Package,
      color: 'from-violet-500 to-purple-600',
      textColor: 'text-violet-600',
      bgColor: 'bg-violet-50'
    }
  ];

  // Sales data based on selected period
  let salesData = [];
  let periodDescription = '';
  
  if (salesPeriod === 'daily') {
    salesData = dashboardData.daily_sales.map(item => ({
      name: item.label,
      revenue: item.revenue,
      orders: item.orders,
    }));
    periodDescription = `Daily sales for ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`;
  } else if (salesPeriod === 'weekly') {
    salesData = dashboardData.weekly_sales.map(item => ({
      name: item.label,
      revenue: item.revenue,
      orders: item.orders,
    }));
    periodDescription = `Weekly sales for ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`;
  } else if (salesPeriod === 'monthly') {
    salesData = dashboardData.monthly_sales.map(item => ({
      name: item.label,
      revenue: item.revenue,
      orders: item.orders,
    }));
    periodDescription = `Monthly sales for ${new Date().getFullYear()}`;
  }

  // Inventory status data (calculated from stats)
  const inventoryData = [
    { name: 'In Stock', value: dashboardData.stats.total_products - dashboardData.stats.low_stock_count, color: '#14b8a6' },
    { name: 'Low Stock', value: dashboardData.stats.low_stock_count, color: '#f59e0b' },
  ];

  // Top products data
  const categoryData = dashboardData.top_products.map((product, index) => ({
    name: product.product_name,
    value: product.total_sold,
    color: ['#06b6d4', '#14b8a6', '#8b5cf6', '#f59e0b', '#f43f5e'][index % 5]
  }));

  // Recent orders
  const recentOrders = dashboardData.recent_orders.map(order => ({
    id: order.order_number,
    customer: order.customer_name || 'Walk-in',
    status: order.status,
    amount: `₱${parseFloat(order.total_amount).toLocaleString()}`,
    time: new Date(order.created_at).toLocaleString()
  }));

  // Low stock products
  const lowStockProducts = dashboardData.low_stock_items.map(item => ({
    name: item.product_name,
    stock: item.quantity,
    threshold: item.reorder_level,
  }));

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-teal-100 text-teal-700 border-teal-200',
      'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
      'In Progress': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'Cancelled': 'bg-rose-100 text-rose-700 border-rose-200'
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Completed': CheckCircle,
      'Pending': Clock,
      'In Progress': TrendingUp,
      'Cancelled': XCircle
    };
    return icons[status] || Clock;
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/20 min-h-full">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-800 to-teal-900 bg-clip-text text-transparent">
              Business Center Dashboard
            </h1>
            <p className="text-slate-600 mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
              Real-time overview of daily operations.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Last updated</p>
            <p className="text-lg font-semibold text-slate-700">Just now</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          
          return (
            <div 
              key={index} 
              className="group relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden border border-slate-100"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgColor} p-4 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${stat.textColor}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${
                    stat.trend === 'up' ? 'bg-teal-100 text-teal-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    <TrendIcon className="w-4 h-4" />
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-slate-900 group-hover:scale-105 transition-transform duration-300">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales Chart - Full Width */}
      <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Sales Overview</h2>
            <p className="text-sm text-slate-500 mt-1">{periodDescription}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setSalesPeriod('daily')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                salesPeriod === 'daily' 
                  ? 'bg-cyan-100 text-cyan-600' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Daily
            </button>
              <button 
                onClick={() => setSalesPeriod('weekly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  salesPeriod === 'weekly' 
                    ? 'bg-cyan-100 text-cyan-600' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Weekly
              </button>
              <button 
                onClick={() => setSalesPeriod('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  salesPeriod === 'monthly' 
                    ? 'bg-cyan-100 text-cyan-600' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
              />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₱)" />
              <Area type="monotone" dataKey="orders" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" name="Orders" />
            </AreaChart>
          </ResponsiveContainer>
      </div>

      {/* Bar Chart (75%) and Doughnut Chart (25%) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Top Products Performance - 75% width (3 columns) */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-2xl transition-all duration-300">
          <div className="mb-2">
            <h2 className="text-xl font-bold text-slate-900">Top Selling Products</h2>
            <p className="text-sm text-slate-500 mt-1">Best performing products by quantity sold</p>
          </div>
          <ResponsiveContainer width="100%" height={330}>
            <BarChart data={categoryData} margin={{ top: 10, right: 0, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                height={70}
                interval={0}
                tick={({ x, y, payload }) => {
                  const words = payload.value.split(' ');
                  return (
                    <g transform={`translate(${x},${y})`}>
                      {words.map((word, index) => (
                        <text
                          key={index}
                          x={0}
                          y={index * 11 + 8}
                          textAnchor="middle"
                          fill="#64748b"
                          fontSize={10}
                        >
                          {word}
                        </text>
                      ))}
                    </g>
                  );
                }}
              />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} name="Units Sold">
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory Status Pie Chart - 25% width (1 column) */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-2xl transition-all duration-300 flex flex-col">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Inventory Status</h2>
          <p className="text-sm text-slate-500 mb-4">Current stock overview</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={inventoryData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {inventoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {inventoryData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders and Low Stock Alert - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
                <p className="text-sm text-slate-500 mt-1">Latest customer transactions</p>
              </div>
              <button 
                onClick={() => navigate('/orders')}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg text-sm font-medium hover:from-cyan-700 hover:to-teal-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/30"
              >
                View All
              </button>
            </div>
          </div>
          
          {/* Mobile Card View */}
          <div className="block md:hidden p-4 space-y-3">
            {recentOrders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <div key={order.id} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">Order #{order.id}</span>
                    <button 
                      onClick={() => navigate('/orders')}
                      className="p-2 hover:bg-cyan-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 text-cyan-600" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {order.customer.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{order.customer}</div>
                      <div className="text-xs text-slate-500">{order.time}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border ${getStatusColor(order.status)}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {order.status}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{order.amount}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => {
                  const StatusIcon = getStatusIcon(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-blue-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {order.customer.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{order.customer}</div>
                            <div className="text-xs text-slate-500">{order.time}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border ${getStatusColor(order.status)}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{order.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => navigate('/orders')}
                          className="p-2 hover:bg-cyan-100 rounded-lg transition-colors"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4 text-cyan-600" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-300">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-rose-50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Low Stock Alert</h2>
                <p className="text-sm text-slate-500">Items need attention</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-rose-300 scrollbar-track-slate-100">
              {lowStockProducts.map((product, index) => (
                <div key={index} className="group relative border-l-4 border-rose-500 pl-4 py-3 rounded-r-lg bg-rose-50/50 hover:bg-rose-50 transition-all duration-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-rose-600 transition-colors">{product.name}</h3>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-slate-600">
                      Stock: <span className="font-bold text-rose-600 text-lg">{product.stock}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Min: <span className="font-semibold">{product.threshold}</span>
                    </div>
                  </div>
                  <div className="relative w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-rose-500 to-red-600 rounded-full transition-all duration-500 shadow-lg shadow-rose-500/50"
                      style={{ width: `${Math.min((product.stock / product.threshold) * 100, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/inventory')}
              className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-3 px-4 rounded-xl hover:from-cyan-700 hover:to-teal-700 transition-all text-sm font-bold shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <Box className="w-5 h-5" />
              Reorder Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
