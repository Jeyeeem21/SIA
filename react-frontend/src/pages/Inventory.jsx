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
  RefreshCw,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import ViewModal from '../components/ViewModal';
import EditModal from '../components/EditModal';
import Pagination from '../components/Pagination';
import { inventoryAPI } from '../services/api';

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

  // Fetch data from API
  useEffect(() => {
    fetchInventory();
  }, []);

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
        <div className="overflow-x-auto">
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
