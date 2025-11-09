import { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Edit,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CalendarDays,
  CalendarRange,
  ArrowRightLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import ViewModal from '../components/ViewModal';
import EditModal from '../components/EditModal';
import Pagination from '../components/Pagination';
import { inventoryAPI, productTransactionsAPI, ordersAPI } from '../services/api';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [viewModal, setViewModal] = useState({ isOpen: false, data: null });
  const [editModal, setEditModal] = useState({ isOpen: false, data: null });
  const [restockModal, setRestockModal] = useState({ isOpen: false, data: null });

  // Data from API
  const [inventory, setInventory] = useState([]);
  
  // Product Transactions & Growth Rates
  const [salesHistory, setSalesHistory] = useState([]);
  const [growthData, setGrowthData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  
  // Pagination for growth rates table
  const [growthPage, setGrowthPage] = useState(1);
  const [growthItemsPerPage, setGrowthItemsPerPage] = useState(10);
  
  // Pagination for sales history table
  const [salesPage, setSalesPage] = useState(1);
  const [salesItemsPerPage, setSalesItemsPerPage] = useState(10);

  // Fetch data from API
  useEffect(() => {
    fetchInventory();
    fetchSalesHistory(selectedPeriod);
    fetchGrowthRates(selectedPeriod);
  }, []);

  useEffect(() => {
    fetchSalesHistory(selectedPeriod);
    fetchGrowthRates(selectedPeriod);
  }, [selectedPeriod]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getAll();
      setInventory(response.data);
    } catch (error) {
      toast.error('Failed to fetch inventory');
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesHistory = async (period) => {
    try {
      setTransactionsLoading(true);
      const response = await ordersAPI.getSalesHistory({ period });
      setSalesHistory(response.data);
    } catch (error) {
      console.error('Error fetching sales history:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchGrowthRates = async (period) => {
    try {
      const response = await productTransactionsAPI.getGrowthRates(period);
      setGrowthData(response.data);
    } catch (error) {
      console.error('Error fetching growth rates:', error);
    }
  };

  // Edit fields (no quantity - use Restock for that!)
  const inventoryEditFields = [
    { key: 'product_name', label: 'Product', type: 'text', disabled: true, render: (item) => item.product?.product_name },
    { key: 'current_quantity', label: 'Current Stock', type: 'number', disabled: true, render: (item) => item.quantity },
    { key: 'reorder_level', label: 'Reorder Level', type: 'number', required: true, placeholder: '10' },
    { key: 'reorder_quantity', label: 'Reorder Quantity', type: 'number', required: true, placeholder: '50' },
  ];

  const restockFields = [
    { key: 'product_name', label: 'Product', type: 'text', disabled: true },
    { key: 'current_quantity', label: 'Current Stock', type: 'number', disabled: true },
    { key: 'restockQty', label: 'Restock Quantity', type: 'number', required: true, placeholder: 'Enter quantity to add' },
  ];

  const viewFields = [
    { key: 'inventory_id', label: 'Inventory ID' },
    { key: 'product', label: 'Product Name', render: (v) => v?.product_name || 'N/A' },
    { key: 'product', label: 'Category', render: (v) => v?.category?.category_name || 'N/A' },
    { key: 'quantity', label: 'Current Stock', render: (v) => `${v} units` },
    { key: 'reorder_level', label: 'Reorder Level', render: (v) => `${v} units` },
    { key: 'reorder_quantity', label: 'Reorder Quantity', render: (v) => `${v} units` },
    { key: 'status', label: 'Status', render: (v) => v.toUpperCase() },
    { key: 'last_restock_date', label: 'Last Restock Date' },
    { key: 'last_restock_quantity', label: 'Last Restock Qty', render: (v) => v ? `${v} units` : 'N/A' }
  ];

  // Modal handlers
  const handleView = (item) => {
    setViewModal({ isOpen: true, data: item });
  };

  const handleEdit = async (formData) => {
    try {
      // Only update reorder settings, keep current quantity
      const updateData = {
        quantity: editModal.data.quantity, // Keep current quantity
        reorder_level: formData.reorder_level,
        reorder_quantity: formData.reorder_quantity,
      };
      await inventoryAPI.update(formData.inventory_id, updateData);
      await fetchInventory();
      toast.success('Reorder settings updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update inventory');
      console.error('Error updating inventory:', error);
    }
  };

  const handleRestock = async (formData) => {
    try {
      await inventoryAPI.restock(restockModal.data.inventory_id, parseInt(formData.restockQty));
      await fetchInventory();
      toast.success(`Restocked ${formData.restockQty} units successfully!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restock');
      console.error('Error restocking:', error);
    }
  };

  const openRestockModal = (item) => {
    setRestockModal({ 
      isOpen: true, 
      data: { 
        ...item, 
        product_name: item.product?.product_name,
        current_quantity: item.quantity,
        restockQty: 0 
      } 
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'available': { label: 'Available', style: 'bg-teal-100 text-teal-700 border-teal-200', icon: CheckCircle },
      'low': { label: 'Low Stock', style: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle },
      'out': { label: 'Out of Stock', style: 'bg-rose-100 text-rose-700 border-rose-200', icon: XCircle }
    };
    
    const statusInfo = statusMap[status] || statusMap['available'];
    const Icon = statusInfo.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border ${statusInfo.style}`}>
        <Icon className="w-3.5 h-3.5" />
        {statusInfo.label}
      </span>
    );
  };

  const filteredInventory = inventory.filter(item =>
    item.product?.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product?.category?.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product?.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `INV-${item.inventory_id}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: inventory.length,
    available: inventory.filter(i => i.status === 'available').length,
    lowStock: inventory.filter(i => i.status === 'low').length,
    outOfStock: inventory.filter(i => i.status === 'out').length
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/20 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-800 to-teal-900 bg-clip-text text-transparent mb-2">
          Inventory Management
        </h1>
        <p className="text-slate-600">Monitor stock levels and manage supplies efficiently.</p>
        <p className="text-sm text-slate-500 mt-2">
          Keep track of available materials such as paper, ink, fabric rolls, and printing supplies. 
          Update inventory records instantly after every transaction.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-cyan-600" />
            <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
          </div>
          <p className="text-sm font-semibold text-slate-600">Total Items</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-teal-600" />
            <span className="text-2xl font-bold text-slate-900">{stats.available}</span>
          </div>
          <p className="text-sm font-semibold text-slate-600">Available</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
            <span className="text-2xl font-bold text-slate-900">{stats.lowStock}</span>
          </div>
          <p className="text-sm font-semibold text-slate-600">Low Stock</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-8 h-8 text-rose-600" />
            <span className="text-2xl font-bold text-slate-900">{stats.outOfStock}</span>
          </div>
          <p className="text-sm font-semibold text-slate-600">Out of Stock</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, category, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-600 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-semibold hover:border-cyan-600 hover:text-cyan-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {/* Mobile Card View */}
        <div className="block md:hidden p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center gap-2 py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600"></div>
              <span className="text-slate-600">Loading inventory...</span>
            </div>
          ) : paginatedInventory.length === 0 ? (
            <div className="text-center text-slate-500 py-12">No inventory items found</div>
          ) : (
            paginatedInventory.map((item) => (
              <div key={item.inventory_id} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">{item.product?.product_name || 'N/A'}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">INV-{item.inventory_id}</p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                <div className="bg-white rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Category:</span>
                    <span className="font-medium text-slate-900">{item.product?.category?.category_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Quantity:</span>
                    <span className={`font-bold ${item.quantity === 0 ? 'text-rose-600' : item.quantity <= item.reorder_level ? 'text-amber-600' : 'text-teal-600'}`}>
                      {item.quantity} units
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Unit Price:</span>
                    <span className="font-semibold text-slate-900">₱{parseFloat(item.product?.price || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <button 
                    onClick={() => handleView(item)}
                    className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button 
                    onClick={() => setEditModal({ isOpen: true, data: item })}
                    className="flex-1 px-3 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => openRestockModal(item)}
                    className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Product ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600"></div>
                      <span className="text-slate-600">Loading inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedInventory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No inventory items found
                  </td>
                </tr>
              ) : (
                paginatedInventory.map((item) => (
                  <tr key={item.inventory_id} className="hover:bg-cyan-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">INV-{item.inventory_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.product?.product_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
                        {item.product?.category?.category_name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${item.quantity === 0 ? 'text-rose-600' : item.quantity <= item.reorder_level ? 'text-amber-600' : 'text-teal-600'}`}>
                        {item.quantity} units
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">₱{parseFloat(item.product?.price || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handleView(item)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors" 
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button 
                          onClick={() => setEditModal({ isOpen: true, data: item })}
                          className="p-2 hover:bg-cyan-100 rounded-lg transition-colors" 
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-cyan-600" />
                        </button>
                        <button 
                          onClick={() => openRestockModal(item)}
                          className="p-2 hover:bg-teal-100 rounded-lg transition-colors" 
                          title="Restock"
                        >
                          <RefreshCw className="w-4 h-4 text-teal-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredInventory.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Product Transactions & Growth Rates Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <ArrowRightLeft className="w-7 h-7 text-cyan-600" />
              Product Transactions & Growth Analysis
            </h2>
            <p className="text-sm text-slate-600 mt-1">Track inventory in/out movements with growth rate analysis per product</p>
          </div>

          {/* Period Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod('daily')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                selectedPeriod === 'daily'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Daily
            </button>
            <button
              onClick={() => setSelectedPeriod('monthly')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                selectedPeriod === 'monthly'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Monthly
            </button>
            <button
              onClick={() => setSelectedPeriod('yearly')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                selectedPeriod === 'yearly'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-200'
                  : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
              }`}
            >
              <CalendarRange className="w-4 h-4" />
              Yearly
            </button>
          </div>
        </div>

        {/* Period Info */}
        {growthData && (
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 mb-6 border border-cyan-100">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-semibold text-slate-700">Current Period:</span>
                <span className="ml-2 text-cyan-700 font-bold">
                  {new Date(growthData.current_period.start).toLocaleDateString()} - {new Date(growthData.current_period.end).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Previous Period:</span>
                <span className="ml-2 text-slate-600 font-bold">
                  {new Date(growthData.previous_period.start).toLocaleDateString()} - {new Date(growthData.previous_period.end).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Growth Rates Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-slate-800 to-cyan-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Current IN</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Current OUT</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Net Movement</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Previous Net</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Growth Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {transactionsLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600"></div>
                      <span className="text-slate-600">Loading growth data...</span>
                    </div>
                  </td>
                </tr>
              ) : !growthData || !growthData.products || growthData.products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No transaction data available
                  </td>
                </tr>
              ) : (
                (() => {
                  const startIndex = (growthPage - 1) * growthItemsPerPage;
                  const paginatedGrowthData = growthData.products.slice(startIndex, startIndex + growthItemsPerPage);
                  return paginatedGrowthData.map((product) => (
                  <tr key={product.product_id} className="hover:bg-cyan-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">{product.product_name}</div>
                      <div className="text-xs text-slate-500">ID: {product.product_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-bold text-slate-900">{product.current_stock}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-lg">
                        +{product.current_in}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 text-sm font-bold rounded-lg">
                        -{product.current_out}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm font-bold ${product.current_net >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                        {product.current_net >= 0 ? '+' : ''}{product.current_net}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm font-semibold ${product.previous_net >= 0 ? 'text-slate-600' : 'text-slate-400'}`}>
                        {product.previous_net >= 0 ? '+' : ''}{product.previous_net}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${
                        product.trend === 'up'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : product.trend === 'down'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {product.trend === 'up' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : product.trend === 'down' ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : (
                          <TrendingUp className="w-4 h-4" />
                        )}
                        {product.growth_rate > 0 ? '+' : ''}{product.growth_rate}%
                      </div>
                    </td>
                  </tr>
                  ));
                })()
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination for Growth Rates */}
        {growthData && growthData.products && growthData.products.length > 0 && (
          <Pagination
            currentPage={growthPage}
            totalPages={Math.ceil(growthData.products.length / growthItemsPerPage)}
            totalItems={growthData.products.length}
            itemsPerPage={growthItemsPerPage}
            onPageChange={setGrowthPage}
            onItemsPerPageChange={(value) => {
              setGrowthItemsPerPage(value);
              setGrowthPage(1);
            }}
          />
        )}

        {/* Sales History - Products Purchased by Customers */}
        {salesHistory.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-600" />
              Sales History ({selectedPeriod === 'daily' ? 'Today' : selectedPeriod === 'monthly' ? 'This Month' : 'This Year'})
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Product</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase">Qty Sold</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase">Unit Price</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase">Subtotal</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase">Service</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase">Payment</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {(() => {
                    const startIndex = (salesPage - 1) * salesItemsPerPage;
                    const paginatedSales = salesHistory.slice(startIndex, startIndex + salesItemsPerPage);
                    return paginatedSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600">
                        {new Date(sale.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-cyan-600">
                        {sale.order_number}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-slate-900">
                        {sale.product_name}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-3 py-1 bg-rose-100 text-rose-700 text-sm font-bold rounded-lg">
                          {sale.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-center text-sm text-slate-600">
                        ₱{parseFloat(sale.unit_price || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-bold text-slate-900">
                        ₱{parseFloat(sale.subtotal || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-center">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                          {sale.service_type}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-center">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-700">
                          {sale.payment_method}
                        </span>
                      </td>
                    </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            
            {/* Pagination for Sales History */}
            <Pagination
              currentPage={salesPage}
              totalPages={Math.ceil(salesHistory.length / salesItemsPerPage)}
              totalItems={salesHistory.length}
              itemsPerPage={salesItemsPerPage}
              onPageChange={setSalesPage}
              onItemsPerPageChange={(value) => {
                setSalesItemsPerPage(value);
                setSalesPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <ViewModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, data: null })}
        title="Inventory Details"
        data={viewModal.data}
        fields={viewFields}
      />

      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, data: null })}
        title="Edit Reorder Settings"
        fields={inventoryEditFields}
        data={{
          ...editModal.data,
          product_name: editModal.data?.product?.product_name,
          current_quantity: editModal.data?.quantity
        }}
        onSubmit={handleEdit}
      />

      <EditModal
        isOpen={restockModal.isOpen}
        onClose={() => setRestockModal({ isOpen: false, data: null })}
        title="Restock Item"
        fields={restockFields}
        data={restockModal.data}
        onSubmit={handleRestock}
      />
    </div>
  );
};

export default Inventory;
