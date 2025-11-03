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
import { FileText, Download, TrendingUp, Calendar, Printer } from 'lucide-react';

const Reports = () => {
  const salesData = [
    { day: 'Mon', revenue: 1250, orders: 45 },
    { day: 'Tue', revenue: 1580, orders: 52 },
    { day: 'Wed', revenue: 1820, orders: 61 },
    { day: 'Thu', revenue: 1420, orders: 48 },
    { day: 'Fri', revenue: 2100, orders: 68 },
    { day: 'Sat', revenue: 980, orders: 32 },
    { day: 'Sun', revenue: 750, orders: 25 }
  ];

  const servicesData = [
    { name: 'Printing', value: 342, color: '#06b6d4' },
    { name: 'ID Creation', value: 128, color: '#8b5cf6' },
    { name: 'Tela Sales', value: 95, color: '#f59e0b' },
    { name: 'Lamination', value: 78, color: '#14b8a6' },
    { name: 'Binding', value: 54, color: '#f43f5e' }
  ];

  const monthlyData = [
    { month: 'Jan', sales: 45000 },
    { month: 'Feb', sales: 52000 },
    { month: 'Mar', sales: 48000 },
    { month: 'Apr', sales: 61000 },
    { month: 'May', sales: 55000 },
    { month: 'Jun', sales: 67000 }
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/20 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-800 to-teal-900 bg-clip-text text-transparent mb-2">
          Reports and Analytics
        </h1>
        <p className="text-slate-600">Generate data-driven insights for better decision-making.</p>
        <p className="text-sm text-slate-500 mt-2">
          View automatically generated reports for daily, weekly, and monthly summaries. 
          Export data to PDF or Excel for record-keeping and analysis.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Generate Report
        </button>
        <button className="px-6 py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-semibold hover:border-rose-600 hover:text-rose-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Download as PDF
        </button>
        <button className="px-6 py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-semibold hover:border-teal-600 hover:text-teal-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Download as Excel
        </button>
        <button className="px-6 py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-semibold hover:border-violet-600 hover:text-violet-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
          <Printer className="w-5 h-5" />
          Print Report
        </button>
      </div>

      {/* Report Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Report */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Sales Report</h2>
              <p className="text-sm text-slate-500">Weekly revenue and orders</p>
            </div>
            <TrendingUp className="w-8 h-8 text-cyan-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={3} name="Revenue (₱)" />
              <Line type="monotone" dataKey="orders" stroke="#14b8a6" strokeWidth={3} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Most Requested Services */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Most Requested Services</h2>
              <p className="text-sm text-slate-500">Service distribution this month</p>
            </div>
            <Calendar className="w-8 h-8 text-violet-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={servicesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {servicesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {servicesData.map((service, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: service.color }}></div>
                <div>
                  <div className="text-xs text-slate-600">{service.name}</div>
                  <div className="text-sm font-bold text-slate-900">{service.value} orders</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Performance Overview</h2>
            <p className="text-sm text-slate-500">Monthly sales trends (First Half 2025)</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
            />
            <Bar dataKey="sales" fill="url(#colorGradient)" radius={[10, 10, 0, 0]} />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Report Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Inventory Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-200">
            <div className="text-sm font-semibold text-cyan-700 mb-1">Total Items</div>
            <div className="text-3xl font-bold text-cyan-900">124</div>
          </div>
          <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
            <div className="text-sm font-semibold text-teal-700 mb-1">Available</div>
            <div className="text-3xl font-bold text-teal-900">98</div>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="text-sm font-semibold text-amber-700 mb-1">Low Stock</div>
            <div className="text-3xl font-bold text-amber-900">18</div>
          </div>
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
            <div className="text-sm font-semibold text-rose-700 mb-1">Out of Stock</div>
            <div className="text-3xl font-bold text-rose-900">8</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
