import { useState, useEffect, memo, useMemo } from 'react';
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
  TrendingDown,
  Calendar,
  CalendarDays,
  CalendarRange,
  X,
  AlertCircle,
  Building2,
  Users,
  FileText,
  Home
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from 'recharts';
import { useDashboard } from '../hooks/useDashboard';
import { LoadingBar, StatsCardSkeleton } from '../components/LoadingStates';
import { useQuery } from '@tanstack/react-query';
import { salesAnalyticsAPI, rentalsAPI } from '../services/api';
import toast from 'react-hot-toast';

// Memoized Stats Card Component - prevents unnecessary re-renders
const StatsCard = memo(({ stat, index }) => {
  const Icon = stat.icon;
  const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
  
  return (
    <div 
      key={index} 
      className="group relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden border border-slate-100"
      style={{ animationDelay: `${index * 100}ms` }}
    >
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
});

StatsCard.displayName = 'StatsCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [salesPeriod, setSalesPeriod] = useState('daily'); // 'daily', 'weekly', 'monthly'
  
  // React Query hooks - REALTIME updates every second
  const { data: dashboardData, isLoading } = useDashboard();
  const { data: salesAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['salesAnalytics'],
    queryFn: async () => {
      const response = await salesAnalyticsAPI.getOverview();
      return response.data;
    },
    // Uses global config: refetchInterval: 1000 (every second)
  });
  
  // Fetch Rentals Stats
  const { data: rentalsStats, isLoading: rentalsLoading } = useQuery({
    queryKey: ['rentalStats'],
    queryFn: async () => {
      const response = await rentalsAPI.getStats();
      return response.data;
    },
  });
  
  // Low stock notification state
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  // Check for low stock every 10 seconds, show for 5 seconds
  useEffect(() => {
    if (!dashboardData?.low_stock_items || dashboardData.low_stock_items.length === 0) {
      setShowNotification(false);
      return;
    }

    let hideTimer;
    let cycleTimer;

    // Function to show and cycle notifications
    const cycleNotification = () => {
      setShowNotification(true);

      // Hide after 5 seconds and move to next item
      hideTimer = setTimeout(() => {
        setShowNotification(false);
        setCurrentNotificationIndex((prev) => 
          (prev + 1) % dashboardData.low_stock_items.length
        );
      }, 5000);
    };

    // Show first notification immediately
    cycleNotification();

    // Then cycle every 10 seconds
    cycleTimer = setInterval(cycleNotification, 10000);

    return () => {
      clearTimeout(hideTimer);
      clearInterval(cycleTimer);
    };
  }, [dashboardData]);

  if (isLoading || !dashboardData) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/20 min-h-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-800 to-teal-900 bg-clip-text text-transparent mb-2">
            Dashboard Overview
          </h1>
          <p className="text-slate-600">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
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

  // Inventory status data (from backend stats)
  const inventoryData = [
    { name: 'Available', value: dashboardData.stats.available_count || 0, color: '#14b8a6' },
    { name: 'Low Stock', value: dashboardData.stats.low_stock_count || 0, color: '#f59e0b' },
    { name: 'Out of Stock', value: dashboardData.stats.out_of_stock_count || 0, color: '#ef4444' },
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
      {/* NO LoadingBar - instant dashboard updates from cache */}
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-800 to-teal-900 bg-clip-text text-transparent">
              Business Center Dashboard
            </h1>
            <p className="text-slate-600 mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
              Real-time overview of daily operations (auto-refreshes every 30s).
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
        {stats.map((stat, index) => (
          <StatsCard key={index} stat={stat} index={index} />
        ))}
      </div>

      {/* Sales Analytics - Daily, Monthly, Yearly */}
      {!analyticsLoading && salesAnalytics && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-cyan-600" />
              Sales Performance & Growth Rate
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daily Sales */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Daily</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Today's Sales</p>
                  <p className="text-3xl font-bold text-slate-900">
                    ₱{salesAnalytics.daily.today.total_sales.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {salesAnalytics.daily.today.total_orders} orders
                  </p>
                </div>

                <div className="border-t border-blue-200 pt-4">
                  <p className="text-sm text-slate-600 mb-1">Yesterday</p>
                  <p className="text-xl font-semibold text-slate-700">
                    ₱{salesAnalytics.daily.yesterday.total_sales.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {salesAnalytics.daily.yesterday.total_orders} orders
                  </p>
                </div>

                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  salesAnalytics.daily.trend === 'up' 
                    ? 'bg-emerald-100 border border-emerald-200' 
                    : salesAnalytics.daily.trend === 'down'
                    ? 'bg-rose-100 border border-rose-200'
                    : 'bg-slate-100 border border-slate-200'
                }`}>
                  {salesAnalytics.daily.trend === 'up' ? (
                    <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                  ) : salesAnalytics.daily.trend === 'down' ? (
                    <ArrowDownRight className="w-5 h-5 text-rose-600" />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-slate-600" />
                  )}
                  <div className="flex-1">
                    <p className={`text-lg font-bold ${
                      salesAnalytics.daily.trend === 'up' 
                        ? 'text-emerald-700' 
                        : salesAnalytics.daily.trend === 'down'
                        ? 'text-rose-700'
                        : 'text-slate-700'
                    }`}>
                      {salesAnalytics.daily.growth_rate > 0 ? '+' : ''}
                      {salesAnalytics.daily.growth_rate}%
                    </p>
                    <p className="text-xs text-slate-600">vs yesterday</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Sales */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <CalendarDays className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Monthly</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">This Month</p>
                  <p className="text-3xl font-bold text-slate-900">
                    ₱{salesAnalytics.monthly.current.total_sales.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {salesAnalytics.monthly.current.total_orders} orders
                  </p>
                </div>

                <div className="border-t border-purple-200 pt-4">
                  <p className="text-sm text-slate-600 mb-1">Last Month</p>
                  <p className="text-xl font-semibold text-slate-700">
                    ₱{salesAnalytics.monthly.previous.total_sales.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {salesAnalytics.monthly.previous.total_orders} orders
                  </p>
                </div>

                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  salesAnalytics.monthly.trend === 'up' 
                    ? 'bg-emerald-100 border border-emerald-200' 
                    : salesAnalytics.monthly.trend === 'down'
                    ? 'bg-rose-100 border border-rose-200'
                    : 'bg-slate-100 border border-slate-200'
                }`}>
                  {salesAnalytics.monthly.trend === 'up' ? (
                    <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                  ) : salesAnalytics.monthly.trend === 'down' ? (
                    <ArrowDownRight className="w-5 h-5 text-rose-600" />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-slate-600" />
                  )}
                  <div className="flex-1">
                    <p className={`text-lg font-bold ${
                      salesAnalytics.monthly.trend === 'up' 
                        ? 'text-emerald-700' 
                        : salesAnalytics.monthly.trend === 'down'
                        ? 'text-rose-700'
                        : 'text-slate-700'
                    }`}>
                      {salesAnalytics.monthly.growth_rate > 0 ? '+' : ''}
                      {salesAnalytics.monthly.growth_rate}%
                    </p>
                    <p className="text-xs text-slate-600">vs last month</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Yearly Sales */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-amber-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-amber-100 p-3 rounded-xl">
                  <CalendarRange className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-sm font-semibold text-amber-600 uppercase tracking-wide">Yearly</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">This Year</p>
                  <p className="text-3xl font-bold text-slate-900">
                    ₱{salesAnalytics.yearly.current.total_sales.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {salesAnalytics.yearly.current.total_orders} orders
                  </p>
                </div>

                <div className="border-t border-amber-200 pt-4">
                  <p className="text-sm text-slate-600 mb-1">Last Year</p>
                  <p className="text-xl font-semibold text-slate-700">
                    ₱{salesAnalytics.yearly.previous.total_sales.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {salesAnalytics.yearly.previous.total_orders} orders
                  </p>
                </div>

                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  salesAnalytics.yearly.trend === 'up' 
                    ? 'bg-emerald-100 border border-emerald-200' 
                    : salesAnalytics.yearly.trend === 'down'
                    ? 'bg-rose-100 border border-rose-200'
                    : 'bg-slate-100 border border-slate-200'
                }`}>
                  {salesAnalytics.yearly.trend === 'up' ? (
                    <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                  ) : salesAnalytics.yearly.trend === 'down' ? (
                    <ArrowDownRight className="w-5 h-5 text-rose-600" />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-slate-600" />
                  )}
                  <div className="flex-1">
                    <p className={`text-lg font-bold ${
                      salesAnalytics.yearly.trend === 'up' 
                        ? 'text-emerald-700' 
                        : salesAnalytics.yearly.trend === 'down'
                        ? 'text-rose-700'
                        : 'text-slate-700'
                    }`}>
                      {salesAnalytics.yearly.growth_rate > 0 ? '+' : ''}
                      {salesAnalytics.yearly.growth_rate}%
                    </p>
                    <p className="text-xs text-slate-600">vs last year</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <p className="text-sm text-slate-500 mb-1">Current stock overview</p>
          <div className="mb-3 p-3 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg border border-cyan-100">
            <p className="text-xs text-slate-600 mb-1">Total Items</p>
            <p className="text-2xl font-bold text-cyan-600">{dashboardData.stats.total_products}</p>
          </div>
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

      {/* Rentals Analytics Section */}
      {rentalsStats && (
        <>
          {/* Rentals Stats Cards - Matching Dashboard Style */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Rental Properties</h2>
                  <p className="text-sm text-slate-600">School property rental analytics</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/rentals')}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl text-sm font-medium hover:from-cyan-700 hover:to-teal-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/30"
              >
                Manage Rentals
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Properties Card */}
              <div className="group relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden border border-slate-100">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-teal-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-cyan-50 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Home className="w-7 h-7 text-cyan-600" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full bg-cyan-100 text-cyan-600">
                      {Math.round((rentalsStats.occupied_properties / rentalsStats.total_properties) * 100) || 0}%
                    </div>
                  </div>
                  <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Properties</h3>
                  <p className="text-3xl font-bold text-slate-900 group-hover:scale-105 transition-transform duration-300">
                    {rentalsStats.total_properties}
                  </p>
                  <div className="text-sm text-slate-500 mt-2">
                    {rentalsStats.occupied_properties} Occupied • {rentalsStats.vacant_properties} Vacant
                  </div>
                </div>
              </div>

              {/* Active Tenants Card */}
              <div className="group relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden border border-slate-100">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-teal-50 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-7 h-7 text-teal-600" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full bg-teal-100 text-teal-600">
                      <ArrowUpRight className="w-4 h-4" />
                      Active
                    </div>
                  </div>
                  <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Active Tenants</h3>
                  <p className="text-3xl font-bold text-slate-900 group-hover:scale-105 transition-transform duration-300">
                    {rentalsStats.total_tenants}
                  </p>
                  <div className="text-sm text-slate-500 mt-2">
                    {rentalsStats.active_contracts} Active Contracts
                  </div>
                </div>
              </div>

              {/* Monthly Revenue Card */}
              <div className="group relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden border border-slate-100">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-emerald-50 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <DollarSign className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-600">
                      <ArrowUpRight className="w-4 h-4" />
                      Monthly
                    </div>
                  </div>
                  <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Monthly Revenue</h3>
                  <p className="text-3xl font-bold text-slate-900 group-hover:scale-105 transition-transform duration-300">
                    ₱{(rentalsStats.monthly_revenue || 0).toLocaleString()}
                  </p>
                  <div className="text-sm text-slate-500 mt-2">
                    From {rentalsStats.occupied_properties} properties
                  </div>
                </div>
              </div>

              {/* Pending Items Card */}
              <div className="group relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden border border-slate-100">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-amber-50 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <AlertTriangle className="w-7 h-7 text-amber-600" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-600">
                      <ArrowDownRight className="w-4 h-4" />
                      Pending
                    </div>
                  </div>
                  <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Pending Tasks</h3>
                  <p className="text-3xl font-bold text-slate-900 group-hover:scale-105 transition-transform duration-300">
                    {(rentalsStats.pending_payments || 0) + (rentalsStats.pending_maintenance || 0)}
                  </p>
                  <div className="text-sm text-slate-500 mt-2">
                    {rentalsStats.pending_payments} Payments • {rentalsStats.pending_maintenance} Maintenance
                  </div>
                </div>
              </div>
            </div>

            {/* Expiring Contracts Alert */}
            {rentalsStats.expiring_contracts > 0 && (
              <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-xl shadow-lg p-5 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-amber-900">
                      {rentalsStats.expiring_contracts} {rentalsStats.expiring_contracts === 1 ? 'Contract' : 'Contracts'} Expiring Soon
                    </h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Review and renew contracts expiring within 60 days to maintain occupancy rates
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('/rentals')}
                    className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 transition-all hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Review Now
                  </button>
                </div>
              </div>
            )}

            {/* Rental Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Property Status Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Home className="w-5 h-5 text-cyan-600" />
                  Property Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Occupied', value: rentalsStats.occupied_properties, color: '#14b8a6' },
                        { name: 'Vacant', value: rentalsStats.vacant_properties, color: '#94a3b8' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Occupied', value: rentalsStats.occupied_properties, color: '#14b8a6' },
                        { name: 'Vacant', value: rentalsStats.vacant_properties, color: '#94a3b8' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-slate-600">Occupied</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{rentalsStats.occupied_properties}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {Math.round((rentalsStats.occupied_properties / rentalsStats.total_properties) * 100)}% occupancy
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                      <span className="text-xs font-semibold text-slate-600">Vacant</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{rentalsStats.vacant_properties}</p>
                    <p className="text-xs text-slate-500 mt-1">Available to rent</p>
                  </div>
                </div>
              </div>

              {/* Revenue & Tasks Overview */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Revenue & Tasks Overview
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={[
                      {
                        name: 'Revenue',
                        value: rentalsStats.monthly_revenue / 1000,
                        color: '#10b981',
                      },
                      {
                        name: 'Payments',
                        value: rentalsStats.pending_payments * 2,
                        color: '#f59e0b',
                      },
                      {
                        name: 'Maintenance',
                        value: rentalsStats.pending_maintenance * 3,
                        color: '#f97316',
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value, name) => {
                        if (name === 'value') {
                          return [`${value.toFixed(1)}`, 'Value'];
                        }
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {[
                        { color: '#10b981' },
                        { color: '#f59e0b' },
                        { color: '#f97316' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Monthly</p>
                    <p className="text-lg font-bold text-emerald-600">₱{(rentalsStats.monthly_revenue / 1000).toFixed(1)}K</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-center">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Payments</p>
                    <p className="text-lg font-bold text-amber-600">{rentalsStats.pending_payments}</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 text-center">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Maintenance</p>
                    <p className="text-lg font-bold text-orange-600">{rentalsStats.pending_maintenance}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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

      {/* Low Stock Notifications - Bottom Right */}
      {showNotification && dashboardData?.low_stock_items && dashboardData.low_stock_items.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-slide-in">
          {(() => {
            const item = dashboardData.low_stock_items[currentNotificationIndex];
            return (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg shadow-xl p-4 transform transition-all duration-300 hover:shadow-2xl">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-amber-900 truncate">
                        Low Stock Alert
                      </h4>
                      <button
                        onClick={() => setShowNotification(false)}
                        className="flex-shrink-0 text-amber-600 hover:text-amber-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-amber-800 font-medium mb-2 truncate">
                      {item.product_name}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-amber-700">
                          <span className="font-semibold">{item.quantity}</span> units left
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-amber-700">
                          Min: <span className="font-semibold">{item.reorder_level}</span>
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date().toLocaleTimeString()}
                    </p>
                    {dashboardData.low_stock_items.length > 1 && (
                      <p className="text-xs text-amber-700 mt-2 font-medium">
                        {currentNotificationIndex + 1} of {dashboardData.low_stock_items.length} items
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
