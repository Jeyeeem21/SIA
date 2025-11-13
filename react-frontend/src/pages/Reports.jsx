import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import Pagination from '../components/Pagination';
import PageLoadingSpinner from '../components/PageLoadingSpinner';

const Reports = () => {
  const queryClient = useQueryClient();
  
  // State management
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

  // React Query - Fetch reports data from cache, invalidate on order changes
  const { data: reportData, isLoading: loading } = useQuery({
    queryKey: queryKeys.reports({ start_date: startDate, end_date: endDate }),
    queryFn: async () => {
      const response = await reportsAPI.getReports({
        start_date: startDate,
        end_date: endDate,
      });
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute cache - reports change less frequently
    refetchInterval: false, // NO auto refetch - invalidate on order changes instead
    refetchOnWindowFocus: false, // Use cache
    refetchOnMount: false, // Use cache
    refetchIntervalInBackground: false,
  });

  // Listen to order changes and invalidate reports
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey?.[0] === 'orders') {
        // When orders change, refresh reports immediately
        queryClient.invalidateQueries({ queryKey: queryKeys.reports });
      }
    });
    
    return () => unsubscribe();
  }, [queryClient]);

  // Calculate totals for export
  const calculateExportTotals = (transactions) => {
    const productTotals = {};
    let grandTotal = 0;

    transactions.forEach(t => {
      grandTotal += parseFloat(t.total_amount);
      t.items.forEach(item => {
        if (!productTotals[item.product_name]) {
          productTotals[item.product_name] = 0;
        }
        productTotals[item.product_name] += item.quantity;
      });
    });

    return { productTotals, grandTotal };
  };

  // Handle export functions
  const handleExport = (type) => {
    const transactions = getTransactionsByTab();
    const { productTotals, grandTotal } = calculateExportTotals(transactions);
    
    if (type === 'print') {
      // Create printable content with proper table structure
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Reports - ${activeTab}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 15mm; font-size: 10pt; }
            h1 { color: #0891b2; border-bottom: 2px solid #0891b2; padding-bottom: 8px; margin-bottom: 10px; font-size: 18pt; }
            .summary { margin-bottom: 15px; font-size: 9pt; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #333; padding: 6px 4px; text-align: left; vertical-align: top; font-size: 8pt; }
            th { background-color: #0891b2; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f5f5f5; }
            .product-item { margin: 2px 0; line-height: 1.3; }
            .totals-section { margin-top: 20px; padding: 10px; background-color: #f0f9ff; border: 2px solid #0891b2; page-break-inside: avoid; }
            .totals-section h3 { color: #0891b2; margin-bottom: 8px; font-size: 11pt; }
            .totals-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
            .total-item { padding: 4px; background: white; border: 1px solid #0891b2; font-size: 8pt; }
            .grand-total { padding: 8px; background-color: #0891b2; color: white; font-size: 12pt; font-weight: bold; text-align: center; }
            @page { size: landscape; margin: 10mm; }
            @media print {
              body { padding: 5mm; }
            }
          </style>
        </head>
        <body>
          <h1>Transaction Report - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div class="summary">
            <strong>Date Range:</strong> ${startDate} to ${endDate} &nbsp;|&nbsp; 
            <strong>Total Transactions:</strong> ${transactions.length}
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 8%;">Order #</th>
                <th style="width: 7%;">Date</th>
                <th style="width: 6%;">Time</th>
                <th style="width: 10%;">Customer</th>
                <th style="width: 35%;">Products</th>
                <th style="width: 10%;">Category</th>
                <th style="width: 8%;">Amount</th>
                <th style="width: 8%;">Payment</th>
                <th style="width: 8%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(t => `
                <tr>
                  <td>${t.order_number}</td>
                  <td>${t.date}</td>
                  <td>${t.time}</td>
                  <td>${t.customer_name || 'Walk-in'}</td>
                  <td>
                    ${t.items.map((item, idx) => 
                      `<div class="product-item">${idx + 1}. ${item.product_name} (x${item.quantity}) - ₱${(item.quantity * item.unit_price).toFixed(2)}</div>`
                    ).join('')}
                  </td>
                  <td>${t.service_type}</td>
                  <td>₱${parseFloat(t.total_amount).toFixed(2)}</td>
                  <td>${t.payment_method || 'N/A'}</td>
                  <td>${t.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals-section">
            <h3>📊 Summary Totals</h3>
            <div class="totals-grid">
              ${Object.entries(productTotals).map(([product, qty]) => 
                `<div class="total-item"><strong>${product}:</strong> ${qty} units</div>`
              ).join('')}
            </div>
            <div class="grand-total">
              GRAND TOTAL: ₱${grandTotal.toFixed(2)}
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 300);
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
      } else {
        toast.error('Please allow popups to print');
      }
      
    } else if (type === 'pdf') {
      // Direct PDF download using jsPDF - NO PRINT DIALOG!
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // Add title
      doc.setFontSize(18);
      doc.setTextColor(8, 145, 178);
      doc.text(`Transaction Report - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`, 14, 15);
      
      // Add summary info
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(`Date Range: ${startDate} to ${endDate}  |  Total Transactions: ${transactions.length}`, 14, 22);
      
      // Prepare table data (using PHP instead of peso symbol for PDF compatibility)
      const tableData = transactions.map(t => [
        t.order_number,
        t.date,
        t.time,
        t.customer_name || 'Walk-in',
        t.items.map((item, idx) => `${idx + 1}. ${item.product_name} (x${item.quantity}) - PHP${(item.quantity * item.unit_price).toFixed(2)}`).join('\n'),
        t.service_type,
        `PHP${parseFloat(t.total_amount).toFixed(2)}`,
        t.payment_method || 'N/A',
        t.status
      ]);
      
      // Add table using autoTable
      autoTable(doc, {
        startY: 28,
        head: [['Order #', 'Date', 'Time', 'Customer', 'Products', 'Category', 'Amount', 'Payment', 'Status']],
        body: tableData,
        styles: {
          fontSize: 7,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [8, 145, 178],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'left'
        },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 20 },
          2: { cellWidth: 18 },
          3: { cellWidth: 25 },
          4: { cellWidth: 80 },
          5: { cellWidth: 25 },
          6: { cellWidth: 20 },
          7: { cellWidth: 22 },
          8: { cellWidth: 18 }
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 14, right: 14 }
      });
      
      // Add totals section
      const finalY = doc.lastAutoTable.finalY + 10;
      
      doc.setFillColor(240, 249, 255);
      doc.rect(14, finalY, 270, 5 + (Object.keys(productTotals).length * 5) + 12, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(8, 145, 178);
      doc.text('Summary Totals', 16, finalY + 4);
      
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      let yPos = finalY + 10;
      Object.entries(productTotals).forEach(([product, qty]) => {
        doc.text(`${product}: ${qty} units`, 16, yPos);
        yPos += 5;
      });
      
      // Grand total
      doc.setFillColor(8, 145, 178);
      doc.rect(14, yPos + 2, 270, 8, 'F');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(`GRAND TOTAL: PHP${grandTotal.toFixed(2)}`, doc.internal.pageSize.width / 2, yPos + 7, { align: 'center' });
      
      // Save PDF directly
      doc.save(`reports_${activeTab}_${startDate}_to_${endDate}.pdf`);
      toast.success('PDF downloaded successfully!');
      
    } else if (type === 'csv') {
      // Create CSV with products on new lines in same cell and proper column widths
      const columnWidths = {
        orderNumber: 18,
        date: 12,
        time: 10,
        customer: 20,
        products: 60,
        category: 18,
        amount: 12,
        payment: 15,
        status: 12
      };
      
      // Helper function to pad strings to specific width
      const padString = (str, width) => {
        const strValue = String(str || '');
        return strValue.length > width ? strValue.substring(0, width - 3) + '...' : strValue.padEnd(width);
      };
      
      // Create header row
      const headers = [
        padString('Order Number', columnWidths.orderNumber),
        padString('Date', columnWidths.date),
        padString('Time', columnWidths.time),
        padString('Customer', columnWidths.customer),
        padString('Products', columnWidths.products),
        padString('Category', columnWidths.category),
        padString('Amount', columnWidths.amount),
        padString('Payment Method', columnWidths.payment),
        padString('Status', columnWidths.status)
      ];
      
      // Create data rows
      const rows = transactions.map(t => {
        const productsText = t.items.map((item, idx) => 
          `${idx + 1}. ${item.product_name} (x${item.quantity}) - ₱${(item.quantity * item.unit_price).toFixed(2)}`
        ).join(' | ');
        
        return [
          padString(t.order_number, columnWidths.orderNumber),
          padString(t.date, columnWidths.date),
          padString(t.time, columnWidths.time),
          padString(t.customer_name || 'Walk-in', columnWidths.customer),
          padString(productsText, columnWidths.products),
          padString(t.service_type, columnWidths.category),
          padString('₱' + parseFloat(t.total_amount).toFixed(2), columnWidths.amount),
          padString(t.payment_method || 'N/A', columnWidths.payment),
          padString(t.status, columnWidths.status)
        ];
      });
      
      // Add separator
      const separator = [
        '='.repeat(columnWidths.orderNumber),
        '='.repeat(columnWidths.date),
        '='.repeat(columnWidths.time),
        '='.repeat(columnWidths.customer),
        '='.repeat(columnWidths.products),
        '='.repeat(columnWidths.category),
        '='.repeat(columnWidths.amount),
        '='.repeat(columnWidths.payment),
        '='.repeat(columnWidths.status)
      ];
      
      // Add summary totals
      const summaryRows = [];
      summaryRows.push(['']); // Empty row
      summaryRows.push([padString('SUMMARY TOTALS', 80)]);
      summaryRows.push(['']); // Empty row
      summaryRows.push([padString('Product', 40), padString('Total Quantity', 20)]);
      summaryRows.push(['-'.repeat(40), '-'.repeat(20)]);
      
      Object.entries(productTotals).forEach(([product, qty]) => {
        summaryRows.push([padString(product, 40), padString(qty + ' units', 20)]);
      });
      
      summaryRows.push(['']); // Empty row
      summaryRows.push([padString('GRAND TOTAL:', 40), padString('₱' + grandTotal.toFixed(2), 20)]);
      
      // Build CSV content
      const csvContent = [
        headers.join(','),
        separator.join(','),
        ...rows.map(row => row.join(',')),
        separator.join(','),
        ...summaryRows.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reports_${activeTab}_${startDate}_to_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('CSV file with totals downloaded successfully!');
    }
  };

  // Separate transactions by completion status
  const getCompletedTransactions = () => {
    if (!reportData?.transactions) return [];
    return reportData.transactions.filter(t => t.status === 'Completed');
  };

  const getIncompleteTransactions = () => {
    if (!reportData?.transactions) return [];
    return reportData.transactions.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled');
  };

  const getCancelledTransactions = () => {
    if (!reportData?.transactions) return [];
    return reportData.transactions.filter(t => t.status === 'Cancelled');
  };

  // Get transactions based on active tab
  const getTransactionsByTab = () => {
    if (activeTab === 'completed') return getCompletedTransactions();
    if (activeTab === 'incomplete') return getIncompleteTransactions();
    if (activeTab === 'cancelled') return getCancelledTransactions();
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
        <PageLoadingSpinner message="Loading reports..." />
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
              <h2 className="text-lg font-bold text-slate-900">Categories</h2>
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

      {/* Action Buttons - Right Aligned */}
      <div className="flex justify-end gap-3 mb-6 no-print">
        <button 
          onClick={() => handleExport('pdf')}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Save as PDF
        </button>
        <button 
          onClick={() => handleExport('print')}
          className="px-5 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Print Report
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
              setActiveTab('cancelled');
              setCurrentPage(1);
            }}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'cancelled'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              <span>Cancelled</span>
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                {getCancelledTransactions().length}
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

        {/* Summary Stats - from backend (Completed orders only) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-200">
            <div className="text-sm text-teal-700 font-semibold mb-1">Total Orders</div>
            <div className="text-2xl font-bold text-teal-900">{reportData?.summary_stats?.total_orders || 0}</div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
            <div className="text-sm text-emerald-700 font-semibold mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-emerald-900">
              ₱{(reportData?.summary_stats?.total_revenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-700 font-semibold mb-1">Average Order Value</div>
            <div className="text-2xl font-bold text-blue-900">
              ₱{(reportData?.summary_stats?.average_order_value || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
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
              placeholder="Search by order, customer, or category..."
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

        {/* Table - Real-time updates without loading overlay */}
        {/* Mobile Card View */}
        <div className="block md:hidden p-4 space-y-4">
          {getPaginatedData().length === 0 ? (
            <div className="text-center py-12">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                activeTab === 'completed' ? 'bg-teal-100' : 
                activeTab === 'incomplete' ? 'bg-amber-100' :
                activeTab === 'cancelled' ? 'bg-red-100' : 'bg-slate-100'
              }`}>
                {activeTab === 'completed' ? (
                  <CheckCircle className="w-8 h-8 text-teal-600" />
                ) : activeTab === 'incomplete' ? (
                  <Clock className="w-8 h-8 text-amber-600" />
                ) : activeTab === 'cancelled' ? (
                  <XCircle className="w-8 h-8 text-red-600" />
                ) : (
                  <FileText className="w-8 h-8 text-slate-600" />
                )}
              </div>
              <p className="text-slate-600 font-medium mb-2">
                {activeTab === 'completed' && 'No completed orders found'}
                {activeTab === 'incomplete' && 'No pending or in-progress orders'}
                {activeTab === 'cancelled' && 'No cancelled orders'}
                {activeTab === 'all' && 'No transactions found'}
              </p>
              <p className="text-sm text-slate-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Transactions will appear here once orders are placed'}
              </p>
            </div>
          ) : (
            getPaginatedData().map((transaction) => (
              <div key={`mobile-transaction-${transaction.order_id}`} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
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
                    <span className="text-slate-600">Category:</span>
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
                activeTab === 'incomplete' ? 'bg-amber-100' :
                activeTab === 'cancelled' ? 'bg-red-100' : 'bg-slate-100'
              }`}>
                {activeTab === 'completed' ? (
                  <CheckCircle className="w-8 h-8 text-teal-600" />
                ) : activeTab === 'incomplete' ? (
                  <Clock className="w-8 h-8 text-amber-600" />
                ) : activeTab === 'cancelled' ? (
                  <XCircle className="w-8 h-8 text-red-600" />
                ) : (
                  <FileText className="w-8 h-8 text-slate-600" />
                )}
              </div>
              <p className="text-slate-600 font-medium mb-2">
                {activeTab === 'completed' && 'No completed orders found'}
                {activeTab === 'incomplete' && 'No pending or in-progress orders'}
                {activeTab === 'cancelled' && 'No cancelled orders'}
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date/Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700" style={{ maxWidth: '250px' }}>Products</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Category</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Amount</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Payment</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {getPaginatedData().map((transaction) => (
                <tr key={`transaction-${transaction.order_id}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {transaction.order_number}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <div className="font-medium">{transaction.date}</div>
                    <div className="text-xs text-slate-500">{transaction.time}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {transaction.customer_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700" style={{ maxWidth: '250px', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                    <div className="space-y-1">
                      {transaction.items && transaction.items.length > 0 ? (
                        transaction.items.map((item, idx) => (
                          <div key={`item-${transaction.order_id}-${idx}`} className="text-xs leading-relaxed">
                            <span className="font-medium">{idx + 1}.</span> {item.product_name} <span className="text-slate-500">(x{item.quantity}) - ₱{(item.quantity * item.unit_price).toFixed(2)}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs">No items</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700" style={{ wordWrap: 'break-word' }}>
                    {transaction.service_type}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-right text-slate-900">
                    ₱{parseFloat(transaction.total_amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-slate-700">
                    {transaction.payment_method || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      transaction.status === 'Completed' ? 'bg-teal-100 text-teal-700' :
                      transaction.status === 'In Progress' ? 'bg-cyan-100 text-cyan-700' :
                      transaction.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

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
