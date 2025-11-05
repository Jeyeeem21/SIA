import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  Calendar, 
  Printer, 
  Search,
  Package,
  AlertCircle,
  ShoppingBag,
  XCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { reportsAPI } from '../services/api';
import Pagination from '../components/Pagination';

const Reports = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [salesPeriod, setSalesPeriod] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [activeTab, setActiveTab] = useState('completed'); // 'completed', 'incomplete', 'all'
  const [startDate, setStartDate] = useState(
    // Default to 3 months ago to show historical completed orders
    new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Colors for pie chart (top 5 only)
  const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#14b8a6', '#f43f5e'];

  // Fetch initial data (charts, inventory cards) - only on mount
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getReports({
        start_date: startDate,
        end_date: endDate,
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch only transaction table data - for date filter changes
  const fetchTransactions = async () => {
    try {
      setTableLoading(true);
      const response = await reportsAPI.getReports({
        start_date: startDate,
        end_date: endDate,
      });
      // Only update transactions, keep charts/inventory data
      setReportData(prev => ({
        ...prev,
        transactions: response.data.transactions
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setTableLoading(false);
    }
  };

  // Fetch all data on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Handle export functions
  const handleExport = (type) => {
    const transactions = getTransactionsByTab();
    
    if (type === 'print') {
      window.print();
    } else if (type === 'pdf') {
      alert('PDF export will be available in the next update. For now, use Print (Ctrl+P) and select "Save as PDF"');
    } else if (type === 'excel') {
      // Create CSV format
      const headers = ['Order Number', 'Date', 'Customer', 'Service Type', 'Amount', 'Status'];
      const csvContent = [
        headers.join(','),
        ...transactions.map(t => [
          t.order_number,
          t.date,
          t.customer_name || 'Walk-in',
          t.service_type,
          t.total_amount,
          t.status
        ].join(','))
      ].join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reports_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  // Separate transactions by completion status
  const getCompletedTransactions = () => {
    if (!reportData?.transactions) return [];
    return reportData.transactions.filter(t => t.status === 'Completed');
  };

  const getIncompleteTransactions = () => {
    if (!reportData?.transactions) return [];
    return reportData.transactions.filter(t => t.status !== 'Completed');
  };

  // Get transactions based on active tab
  const getTransactionsByTab = () => {
    if (activeTab === 'completed') return getCompletedTransactions();
    if (activeTab === 'incomplete') return getIncompleteTransactions();
    return reportData?.transactions || [];
  };

  // Filter and sort transactions
  const getFilteredTransactions = () => {
    let filtered = getTransactionsByTab().filter(transaction => 
      transaction.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.service_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort
    filtered.sort((a, b) => {
      let compareA, compareB;
      
      switch(sortBy) {
        case 'date':
          compareA = new Date(a.date);
          compareB = new Date(b.date);
          break;
        case 'amount':
          compareA = a.total_amount;
          compareB = b.total_amount;
          break;
        case 'customer':
          compareA = a.customer_name.toLowerCase();
          compareB = b.customer_name.toLowerCase();
          break;
        case 'status':
          compareA = a.status.toLowerCase();
          compareB = b.status.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });

    return filtered;
  };

  // Pagination
  const getPaginatedData = () => {
    const filtered = getFilteredTransactions();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(getFilteredTransactions().length / itemsPerPage);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/20 min-h-full print:bg-white print:p-4">
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            .print\\:block {
              display: block !important;
            }
          }
        `}
      </style>
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-800 to-teal-900 bg-clip-text text-transparent mb-2 print:text-slate-900">
          Reports and Analytics
        </h1>
        <p className="text-slate-600 print:text-slate-700">Generate data-driven insights for better decision-making.</p>
        <p className="text-sm text-slate-500 mt-2 no-print">
          View automatically generated reports for daily, weekly, and monthly summaries. 
          Export data to PDF or Excel for record-keeping and analysis.
        </p>
        <p className="hidden print:block text-sm text-slate-700 mt-2">
          Report Generated: {new Date().toLocaleString()} | Date Range: {startDate} to {endDate}
        </p>
      </div>

      {/* Inventory Report Cards - At the Top */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-cyan-200">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-cyan-600" />
            <div className="text-sm font-semibold text-cyan-700">Total Items</div>
          </div>
          <div className="text-3xl font-bold text-cyan-900">
            {reportData?.inventory_stats?.total_items || 0}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-teal-200">
          <div className="flex items-center justify-between mb-2">
            <ShoppingBag className="w-8 h-8 text-teal-600" />
            <div className="text-sm font-semibold text-teal-700">Available</div>
          </div>
          <div className="text-3xl font-bold text-teal-900">
            {reportData?.inventory_stats?.available || 0}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-amber-600" />
            <div className="text-sm font-semibold text-amber-700">Low Stock</div>
          </div>
          <div className="text-3xl font-bold text-amber-900">
            {reportData?.inventory_stats?.low_stock || 0}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-rose-200">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-8 h-8 text-rose-600" />
            <div className="text-sm font-semibold text-rose-700">Out of Stock</div>
          </div>
          <div className="text-3xl font-bold text-rose-900">
            {reportData?.inventory_stats?.out_of_stock || 0}
          </div>
        </div>
      </div>

      {/* Line Chart - Full Width with Period Toggle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 mb-6 no-print">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Sales Overview</h2>
            <p className="text-sm text-slate-500">
              {salesPeriod === 'daily' && `Daily sales for ${new Date(startDate).toLocaleString('default', { month: 'long', year: 'numeric' })}`}
              {salesPeriod === 'weekly' && `Weekly sales for ${new Date(startDate).toLocaleString('default', { month: 'long', year: 'numeric' })}`}
              {salesPeriod === 'monthly' && `Monthly sales for ${new Date(startDate).getFullYear()}`}
            </p>
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
          <LineChart data={
            salesPeriod === 'daily' ? (reportData?.daily_sales || []).map(item => ({ name: item.label, revenue: item.revenue, orders: item.orders })) :
            salesPeriod === 'weekly' ? (reportData?.weekly_sales || []).map(item => ({ name: item.label, revenue: item.revenue, orders: item.orders })) :
            (reportData?.monthly_sales || []).map(item => ({ name: item.label, revenue: item.revenue, orders: item.orders }))
          }>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={3} name="Revenue (₱)" dot={{ r: 4 }} />
            <Line type="monotone" dataKey="orders" stroke="#14b8a6" strokeWidth={3} name="Orders" dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart (75%) and Pie Chart (25%) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6 no-print">
        {/* Bar Chart - 75% width */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Top Products by Revenue</h2>
              <p className="text-sm text-slate-500">Best performing products</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={330}>
            <BarChart data={reportData?.top_products || []} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
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
              <Bar dataKey="revenue" fill="url(#colorGradient)" radius={[10, 10, 0, 0]} name="Revenue (₱)" />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - 25% width */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Services</h2>
              <p className="text-xs text-slate-500">Distribution</p>
            </div>
            <Calendar className="w-6 h-6 text-violet-600" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={reportData?.service_distribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(reportData?.service_distribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {(reportData?.service_distribution || []).map((service, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <div className="flex-1 truncate">{service.name}</div>
                <div className="font-bold">{service.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6 no-print">
        <button 
          onClick={() => handleExport('excel')}
          className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export to CSV
        </button>
        <button 
          onClick={() => handleExport('pdf')}
          className="px-6 py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-semibold hover:border-rose-600 hover:text-rose-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export to PDF
        </button>
        <button 
          onClick={() => handleExport('print')}
          className="px-6 py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-semibold hover:border-violet-600 hover:text-violet-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Printer className="w-5 h-5" />
          Print Report
        </button>
        <button 
          onClick={() => fetchInitialData()}
          disabled={loading}
          className="px-6 py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-semibold hover:border-cyan-600 hover:text-cyan-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-5 h-5" />
          {loading ? 'Loading...' : 'Refresh All'}
        </button>
      </div>

      {/* Transactions Table with Search, Sort, Pagination */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Transaction History</h2>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => {
              setActiveTab('completed');
              setCurrentPage(1);
            }}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'completed'
                ? 'border-b-2 border-teal-600 text-teal-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Completed Orders</span>
              <span className="ml-2 px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full">
                {getCompletedTransactions().length}
              </span>
            </div>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('incomplete');
              setCurrentPage(1);
            }}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'incomplete'
                ? 'border-b-2 border-amber-600 text-amber-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Pending/In Progress</span>
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                {getIncompleteTransactions().length}
              </span>
            </div>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('all');
              setCurrentPage(1);
            }}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'all'
                ? 'border-b-2 border-cyan-600 text-cyan-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>All Transactions</span>
              <span className="ml-2 px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs rounded-full">
                {reportData?.transactions?.length || 0}
              </span>
            </div>
          </button>
        </div>

        {/* Summary Stats for Active Tab */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-200">
            <div className="text-sm text-teal-700 font-semibold mb-1">Total Orders</div>
            <div className="text-2xl font-bold text-teal-900">{getTransactionsByTab().length}</div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
            <div className="text-sm text-emerald-700 font-semibold mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-emerald-900">
              ₱{getTransactionsByTab().reduce((sum, t) => sum + parseFloat(t.total_amount), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-700 font-semibold mb-1">Average Order Value</div>
            <div className="text-2xl font-bold text-blue-900">
              ₱{getTransactionsByTab().length > 0 
                ? (getTransactionsByTab().reduce((sum, t) => sum + parseFloat(t.total_amount), 0) / getTransactionsByTab().length).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
                : '0.00'}
            </div>
          </div>
        </div>
        
        {/* Search, Date Filters, and Sort Controls */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6 no-print">
          {/* Search Bar */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order, customer, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Apply Filters Button */}
          <div>
            <button
              onClick={fetchTransactions}
              disabled={tableLoading}
              className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tableLoading ? 'Loading...' : 'Apply Filters'}
            </button>
          </div>

          {/* Sort By */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="customer">Customer</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Table Loading Overlay */}
        {tableLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              <span className="text-slate-600 font-medium">Updating transactions...</span>
            </div>
          </div>
        )}

        {/* Table */}
        {!tableLoading && (
          <>
        {/* Mobile Card View */}
        <div className="block md:hidden p-4 space-y-4">
          {getPaginatedData().length === 0 ? (
            <div className="text-center py-12">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                activeTab === 'completed' ? 'bg-teal-100' : 
                activeTab === 'incomplete' ? 'bg-amber-100' : 'bg-slate-100'
              }`}>
                {activeTab === 'completed' ? (
                  <CheckCircle className="w-8 h-8 text-teal-600" />
                ) : activeTab === 'incomplete' ? (
                  <Clock className="w-8 h-8 text-amber-600" />
                ) : (
                  <FileText className="w-8 h-8 text-slate-600" />
                )}
              </div>
              <p className="text-slate-600 font-medium mb-2">
                {activeTab === 'completed' && 'No completed orders found'}
                {activeTab === 'incomplete' && 'No pending or in-progress orders'}
                {activeTab === 'all' && 'No transactions found'}
              </p>
              <p className="text-sm text-slate-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Transactions will appear here once orders are placed'}
              </p>
            </div>
          ) : (
            getPaginatedData().map((transaction, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{transaction.order_number}</h3>
                    <p className="text-sm text-slate-600">{transaction.customer_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    transaction.status === 'Completed' ? 'bg-teal-100 text-teal-700' :
                    transaction.status === 'In Progress' ? 'bg-cyan-100 text-cyan-700' :
                    transaction.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {transaction.status}
                  </span>
                </div>

                <div className="bg-white rounded-lg p-3 space-y-2">
                  <div className="text-sm">
                    <span className="text-slate-600">Service:</span>
                    <span className="ml-2 font-medium text-slate-900">{transaction.service_type}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-600">Items:</span>
                    <div className="mt-1 space-y-1">
                      {transaction.items && transaction.items.length > 0 ? (
                        transaction.items.map((item, idx) => (
                          <div key={idx} className="text-xs text-slate-700">
                            • {item.product_name} <span className="text-slate-500">(x{item.quantity})</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs">No items</span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600">Total:</span>
                    <span className="font-bold text-lg text-slate-900">₱{transaction.total_amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  {transaction.date} • {transaction.time}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          {getPaginatedData().length === 0 ? (
            <div className="text-center py-12">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                activeTab === 'completed' ? 'bg-teal-100' : 
                activeTab === 'incomplete' ? 'bg-amber-100' : 'bg-slate-100'
              }`}>
                {activeTab === 'completed' ? (
                  <CheckCircle className="w-8 h-8 text-teal-600" />
                ) : activeTab === 'incomplete' ? (
                  <Clock className="w-8 h-8 text-amber-600" />
                ) : (
                  <FileText className="w-8 h-8 text-slate-600" />
                )}
              </div>
              <p className="text-slate-600 font-medium mb-2">
                {activeTab === 'completed' && 'No completed orders found'}
                {activeTab === 'incomplete' && 'No pending or in-progress orders'}
                {activeTab === 'all' && 'No transactions found'}
              </p>
              <p className="text-sm text-slate-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Transactions will appear here once orders are placed'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Order #</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Items</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Service</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Amount</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {getPaginatedData().map((transaction, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {transaction.order_number}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {transaction.customer_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div className="space-y-1">
                      {transaction.items && transaction.items.length > 0 ? (
                        transaction.items.map((item, idx) => (
                          <div key={idx} className="text-xs">
                            {item.product_name} <span className="text-slate-500">(x{item.quantity})</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs">No items</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {transaction.service_type}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-right text-slate-900">
                    ₱{transaction.total_amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      transaction.status === 'Completed' ? 'bg-teal-100 text-teal-700' :
                      transaction.status === 'In Progress' ? 'bg-cyan-100 text-cyan-700' :
                      transaction.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <div>{transaction.date}</div>
                    <div className="text-xs text-slate-500">{transaction.time}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
        </>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={getFilteredTransactions().length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newValue) => {
            setItemsPerPage(newValue);
            setCurrentPage(1); // Reset to first page when changing items per page
          }}
        />
      </div>
    </div>
  );
};

export default Reports;
