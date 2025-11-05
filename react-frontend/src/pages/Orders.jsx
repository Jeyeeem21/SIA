import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Eye,
  Pencil,
  CheckCircle,
  Clock,
  Package,
  XCircle,
  Trash2,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import ViewModal from '../components/ViewModal';
import DeleteModal from '../components/DeleteModal';
import Pagination from '../components/Pagination';
import { ordersAPI, productsAPI } from '../services/api';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [viewModal, setViewModal] = useState({ isOpen: false, data: null });
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, data: null });
  const [completeModal, setCompleteModal] = useState({ isOpen: false, order: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

  // Data from API
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  // Order form state
  const [orderForm, setOrderForm] = useState({
    customer_name: '',
    service_type: 'Printing',
    notes: '',
    preferred_pickup_date: new Date().toISOString().split('T')[0],
    order_items: []
  });

  // Current order item being added
  const [currentItem, setCurrentItem] = useState({
    product_id: '',
    quantity: 1,
    unit_price: 0,
    notes: ''
  });

  // Edit order item state
  const [editCurrentItem, setEditCurrentItem] = useState({
    product_id: '',
    quantity: 1,
    unit_price: 0,
    notes: ''
  });

  // Fetch data from API
  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Service type options
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    payment_method: 'Cash',
    amount: 0,
    reference_number: '',
    notes: ''
  });

  const serviceTypes = [
    'Printing',
    'ID Creation',
    'Tela Purchase',
    'Lamination',
    'Document Binding',
    'Uniform',
    'Other'
  ];

  const paymentMethods = ['Cash', 'GCash'];

  // Add item to order
  const addItemToOrder = () => {
    if (!currentItem.product_id || currentItem.quantity <= 0) {
      toast.error('Please select a product and enter valid quantity');
      return;
    }

    const product = products.find(p => p.product_id == currentItem.product_id);
    if (!product) return;

    const newItem = {
      ...currentItem,
      product_name: product.product_name,
      sku: product.sku,
      unit_price: currentItem.unit_price || product.price
    };

    setOrderForm({
      ...orderForm,
      order_items: [...orderForm.order_items, newItem]
    });

    setCurrentItem({
      product_id: '',
      quantity: 1,
      unit_price: 0,
      notes: ''
    });

    toast.success('Product added to order');
  };

  const removeItemFromOrder = (index) => {
    setOrderForm({
      ...orderForm,
      order_items: orderForm.order_items.filter((_, i) => i !== index)
    });
    toast.success('Product removed from order');
  };

  const calculateTotal = () => {
    return orderForm.order_items.reduce((total, item) => {
      return total + (item.quantity * item.unit_price);
    }, 0);
  };

  const handleProductSelect = (productId) => {
    const product = products.find(p => p.product_id == productId);
    if (product) {
      setCurrentItem({
        ...currentItem,
        product_id: productId,
        unit_price: product.price
      });
    }
  };

  const handleSubmitOrder = async () => {
    if (orderForm.order_items.length === 0) {
      toast.error('Please add at least one product to the order');
      return;
    }

    try {
      await ordersAPI.create(orderForm);
      await fetchOrders();
      setAddModal(false);
      setOrderForm({
        customer_name: '',
        service_type: 'Printing',
        notes: '',
        preferred_pickup_date: new Date().toISOString().split('T')[0],
        order_items: []
      });
      toast.success('Order created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
      console.error('Error creating order:', error);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.update(orderId, { status: newStatus });
      await fetchOrders();
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await ordersAPI.delete(deleteModal.id);
      await fetchOrders();
      setDeleteModal({ isOpen: false, id: null, name: '' });
      toast.success('Order deleted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete order');
      console.error('Error deleting order:', error);
    }
  };

  const handleOpenCompleteModal = (order) => {
    setCompleteModal({ isOpen: true, order });
    setPaymentForm({
      payment_method: 'Cash',
      amount: order.total_amount,
      reference_number: '',
      notes: ''
    });
  };

  const handleCompleteOrder = async () => {
    if (!paymentForm.payment_method) {
      toast.error('Please select a payment method');
      return;
    }

    if (paymentForm.payment_method === 'GCash' && !paymentForm.reference_number) {
      toast.error('Please enter GCash reference number');
      return;
    }

    try {
      console.log('Payment form data being sent:', paymentForm);
      await ordersAPI.complete(completeModal.order.order_id, paymentForm);
      await fetchOrders();
      setCompleteModal({ isOpen: false, order: null });
      toast.success('Order completed and payment recorded!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete order');
      console.error('Error completing order:', error);
    }
  };

  const addItemToEditOrder = () => {
    if (!editCurrentItem.product_id || editCurrentItem.quantity <= 0) {
      toast.error('Please select a product and enter valid quantity');
      return;
    }

    const product = products.find(p => p.product_id == editCurrentItem.product_id);
    if (!product) return;

    const newItem = {
      product_id: editCurrentItem.product_id,
      quantity: editCurrentItem.quantity,
      unit_price: editCurrentItem.unit_price || product.price,
      notes: editCurrentItem.notes,
      product: product
    };

    setEditModal({
      ...editModal,
      data: {
        ...editModal.data,
        order_items: [...(editModal.data.order_items || []), newItem]
      }
    });

    setEditCurrentItem({
      product_id: '',
      quantity: 1,
      unit_price: 0,
      notes: ''
    });

    toast.success('Product added to order');
  };

  const removeItemFromEditOrder = (index) => {
    const updatedItems = editModal.data.order_items.filter((_, i) => i !== index);
    setEditModal({
      ...editModal,
      data: {
        ...editModal.data,
        order_items: updatedItems
      }
    });
    toast.success('Product removed from order');
  };

  const handleEditProductSelect = (productId) => {
    const product = products.find(p => p.product_id == productId);
    if (product) {
      setEditCurrentItem({
        ...editCurrentItem,
        product_id: productId,
        unit_price: product.price
      });
    }
  };

  const calculateEditTotal = () => {
    return (editModal.data?.order_items || []).reduce((total, item) => {
      return total + (item.quantity * item.unit_price);
    }, 0);
  };

  const handleEditOrder = async () => {
    if (!editModal.data.order_items || editModal.data.order_items.length === 0) {
      toast.error('Order must have at least one product');
      return;
    }

    try {
      await ordersAPI.update(editModal.data.order_id, {
        customer_name: editModal.data.customer_name,
        service_type: editModal.data.service_type,
        status: editModal.data.status,
        notes: editModal.data.notes,
        preferred_pickup_date: editModal.data.preferred_pickup_date,
        order_items: editModal.data.order_items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          notes: item.notes
        }))
      });
      await fetchOrders();
      setEditModal({ isOpen: false, data: null });
      toast.success('Order updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order');
      console.error('Error updating order:', error);
    }
  };

  const viewFields = [
    { key: 'order_number', label: 'Order Number' },
    { key: 'customer_name', label: 'Customer Name', render: (v) => v || 'Walk-in Customer' },
    { key: 'service_type', label: 'Service Type' },
    { key: 'order_items', label: 'Products', render: (items) => items?.map(item => 
      `${item.product?.product_name} (x${item.quantity})`
    ).join(', ') || 'N/A' },
    { key: 'total_amount', label: 'Total Amount', render: (v) => `₱${parseFloat(v).toLocaleString()}` },
    { key: 'status', label: 'Order Status' },
    { key: 'notes', label: 'Notes', render: (v) => v || 'N/A' },
    { key: 'created_at', label: 'Order Date', render: (v) => new Date(v).toLocaleString() }
  ];

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
      'In Progress': Package,
      'Cancelled': XCircle
    };
    return icons[status] || Clock;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    inProgress: orders.filter(o => o.status === 'In Progress').length,
    completed: orders.filter(o => o.status === 'Completed').length,
    totalRevenue: orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0)
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/20 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-800 to-teal-900 bg-clip-text text-transparent mb-2">
          Order and Transaction Management
        </h1>
        <p className="text-slate-600">Handle customer requests and service orders.</p>
        <div className="flex items-start gap-2 mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-teal-900 font-medium">Active Orders Only</p>
            <p className="text-teal-700">This page shows pending, in-progress, and cancelled orders. Completed orders are archived in the <span className="font-semibold">Reports</span> page for historical analysis.</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-all">
          <ShoppingCart className="w-8 h-8 text-cyan-600 mb-2" />
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <p className="text-sm font-semibold text-slate-600">Active Orders</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-all">
          <Clock className="w-8 h-8 text-amber-600 mb-2" />
          <div className="text-2xl font-bold text-slate-900">{stats.pending}</div>
          <p className="text-sm font-semibold text-slate-600">Pending</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-all">
          <Package className="w-8 h-8 text-cyan-600 mb-2" />
          <div className="text-2xl font-bold text-slate-900">{stats.inProgress}</div>
          <p className="text-sm font-semibold text-slate-600">In Progress</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-600 to-teal-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all">
          <div className="text-sm font-semibold mb-1">Today's Revenue</div>
          <div className="text-3xl font-bold">₱{stats.totalRevenue.toFixed(2)}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-600 focus:outline-none transition-colors"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-600" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-600 focus:outline-none transition-colors bg-white"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              <button 
                onClick={() => setAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add New Order
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-slate-400">Loading orders...</div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden p-4 space-y-4">
              {paginatedOrders.length === 0 ? (
                <div className="text-center text-slate-500 py-12">No orders found</div>
              ) : (
                paginatedOrders.map((order) => (
                  <div key={order.order_id} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{order.order_number}</h3>
                        <p className="text-sm text-slate-600">{order.customer_name || 'Walk-in'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'Completed' ? 'bg-teal-100 text-teal-700' :
                        order.status === 'In Progress' ? 'bg-cyan-100 text-cyan-700' :
                        order.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="bg-white rounded-lg p-3 space-y-2">
                      <div className="text-sm">
                        <span className="text-slate-600">Service:</span>
                        <span className="ml-2 font-medium text-slate-900">{order.service_type}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-600">Items:</span>
                        <div className="mt-1 space-y-1">
                          {order.order_items && order.order_items.length > 0 ? (
                            order.order_items.map((item, idx) => (
                              <div key={idx} className="text-xs text-slate-700">
                                • {item.product?.product_name || 'Unknown Product'} <span className="text-slate-500">(x{item.quantity})</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs">No items</span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm pt-2 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-slate-600">Total:</span>
                        <span className="font-bold text-lg text-slate-900">₱{parseFloat(order.total_amount).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })} • {new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                      <button 
                        onClick={() => setViewModal({ isOpen: true, data: order })}
                        className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                        <>
                          <button 
                            onClick={() => setEditModal({ isOpen: true, data: order })}
                            className="flex-1 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                          {(order.status === 'Pending' || order.status === 'In Progress') && (
                            <button 
                              onClick={() => handleOpenCompleteModal(order)}
                              className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => setDeleteModal({ isOpen: true, id: order.order_id, name: order.order_number })}
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
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
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedOrders.map((order) => {
                    return (
                      <tr key={order.order_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {order.order_number}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {order.customer_name || 'Walk-in'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          <div className="space-y-1">
                            {order.order_items && order.order_items.length > 0 ? (
                              order.order_items.map((item, idx) => (
                                <div key={idx} className="text-xs">
                                  {item.product?.product_name || 'Unknown Product'} <span className="text-slate-500">(x{item.quantity})</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-slate-400 text-xs">No items</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {order.service_type}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-right text-slate-900">
                          ₱{parseFloat(order.total_amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'Completed' ? 'bg-teal-100 text-teal-700' :
                            order.status === 'In Progress' ? 'bg-cyan-100 text-cyan-700' :
                            order.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          <div>{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
                          <div className="text-xs text-slate-500">{new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setViewModal({ isOpen: true, data: order })}
                          className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                          <>
                            <button 
                              onClick={() => setEditModal({ isOpen: true, data: order })}
                              className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                              title="Edit Order"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {(order.status === 'Pending' || order.status === 'In Progress') && (
                              <button 
                                onClick={() => handleOpenCompleteModal(order)}
                                className="p-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
                                title="Complete & Pay"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => setDeleteModal({ isOpen: true, id: order.order_id, name: order.order_number })}
                              className="p-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredOrders.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(value);
            setCurrentPage(1);
          }}
        />
      </>
      )}
    </div>

      {/* Add Order Modal - Custom Form */}
      {addModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 flex flex-col">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-4 rounded-t-2xl flex-shrink-0">
              <h2 className="text-2xl font-bold">Create New Order</h2>
            </div>
            
            <div className="p-6 space-y-6 flex-1">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Customer Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderForm.customer_name}
                    onChange={(e) => setOrderForm({ ...orderForm, customer_name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white placeholder:text-slate-400"
                    placeholder="Walk-in customer if empty"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Preferred Pickup Date
                  </label>
                  <input
                    type="date"
                    value={orderForm.preferred_pickup_date}
                    onChange={(e) => setOrderForm({ ...orderForm, preferred_pickup_date: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white"
                    style={{ colorScheme: 'light' }}
                  />
                </div>
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Service Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={orderForm.service_type}
                  onChange={(e) => setOrderForm({ ...orderForm, service_type: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white"
                  style={{ color: '#0f172a' }}
                >
                  {serviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Add Products Section */}
              <div className="border-2 border-amber-200 rounded-xl p-4 bg-amber-50">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Add Products to Order</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Product <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={currentItem.product_id}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white"
                      style={{ color: '#0f172a' }}
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product.product_id} value={product.product_id}>
                          {product.product_name} - ₱{product.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white"
                      style={{ color: '#0f172a' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Unit Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentItem.unit_price}
                      onChange={(e) => setCurrentItem({ ...currentItem, unit_price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white"
                      style={{ color: '#0f172a' }}
                    />
                  </div>
                </div>

                <button
                  onClick={addItemToOrder}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>

              {/* Order Items List */}
              {orderForm.order_items.length > 0 && (
                <div className="border-2 border-slate-200 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {orderForm.order_items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{item.product_name}</p>
                          <p className="text-sm text-slate-600">
                            {item.quantity} × ₱{item.unit_price.toLocaleString()} = ₱{(item.quantity * item.unit_price).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItemFromOrder(index)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t-2 border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-slate-900">Total Amount:</span>
                      <span className="text-2xl font-bold text-amber-600">
                        ₱{calculateTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white placeholder:text-slate-400"
                  placeholder="Add any special instructions..."
                  style={{ color: '#0f172a' }}
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3 border-t border-slate-200 flex-shrink-0">
              <button
                onClick={() => {
                  setAddModal(false);
                  setOrderForm({
                    customer_name: '',
                    service_type: 'Printing',
                    notes: '',
                    preferred_pickup_date: new Date().toISOString().split('T')[0],
                    order_items: []
                  });
                }}
                className="px-6 py-2.5 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={orderForm.order_items.length === 0}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      <ViewModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, data: null })}
        title="Order Details"
        data={viewModal.data}
        fields={viewFields}
      />

      {/* Edit Order Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-4 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Edit Order - {editModal.data?.order_number}</h2>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={editModal.data?.customer_name || ''}
                    onChange={(e) => setEditModal({ 
                      ...editModal, 
                      data: { ...editModal.data, customer_name: e.target.value } 
                    })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white"
                    placeholder="Walk-in customer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Preferred Pickup Date
                  </label>
                  <input
                    type="date"
                    value={editModal.data?.preferred_pickup_date || ''}
                    onChange={(e) => setEditModal({ 
                      ...editModal, 
                      data: { ...editModal.data, preferred_pickup_date: e.target.value } 
                    })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Service Type
                </label>
                <select
                  value={editModal.data?.service_type || ''}
                  onChange={(e) => setEditModal({ 
                    ...editModal, 
                    data: { ...editModal.data, service_type: e.target.value } 
                  })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white"
                >
                  {serviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Order Status
                </label>
                <select
                  value={editModal.data?.status || ''}
                  onChange={(e) => setEditModal({ 
                    ...editModal, 
                    data: { ...editModal.data, status: e.target.value } 
                  })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Add Product to Order */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200">
                <label className="block text-sm font-bold text-amber-800 mb-3">
                  Add Product to Order
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <select
                      value={editCurrentItem.product_id}
                      onChange={(e) => handleEditProductSelect(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white"
                    >
                      <option value="">Select a product...</option>
                      {products.map(product => (
                        <option key={product.product_id} value={product.product_id}>
                          {product.product_name} - ₱{parseFloat(product.price).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      value={editCurrentItem.quantity}
                      onChange={(e) => setEditCurrentItem({ ...editCurrentItem, quantity: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white"
                      placeholder="Qty"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addItemToEditOrder}
                  className="mt-3 w-full px-4 py-2 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add to Order
                </button>
              </div>

              {/* Order Items List - Editable */}
              <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Order Items ({editModal.data?.order_items?.length || 0})
                </label>
                {(!editModal.data?.order_items || editModal.data.order_items.length === 0) ? (
                  <p className="text-slate-500 text-center py-4">No items in order</p>
                ) : (
                  <div className="space-y-2">
                    {editModal.data.order_items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                        <div>
                          <p className="font-semibold text-slate-900">{item.product?.product_name}</p>
                          <p className="text-sm text-slate-600">
                            {item.quantity} × ₱{parseFloat(item.unit_price).toLocaleString()} = ₱{(item.quantity * item.unit_price).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItemFromEditOrder(index)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 pt-3 border-t-2 border-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700">Total Amount:</span>
                    <span className="text-xl font-bold text-amber-600">
                      ₱{calculateEditTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={editModal.data?.notes || ''}
                  onChange={(e) => setEditModal({ 
                    ...editModal, 
                    data: { ...editModal.data, notes: e.target.value } 
                  })}
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 bg-white"
                  placeholder="Order notes..."
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3 border-t border-slate-200">
              <button
                onClick={() => setEditModal({ isOpen: false, data: null })}
                className="px-6 py-2.5 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleEditOrder}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Update Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Order / Payment Modal */}
      {completeModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-4 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Complete Order & Process Payment</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-600">Order Number:</span>
                  <span className="text-lg font-bold text-slate-900">{completeModal.order?.order_number}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-600">Total Amount:</span>
                  <span className="text-2xl font-bold text-teal-600">
                    ₱{parseFloat(completeModal.order?.total_amount || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, payment_method: 'Cash' })}
                    className={`px-6 py-4 border-2 rounded-xl font-semibold transition-all ${
                      paymentForm.payment_method === 'Cash'
                        ? 'border-teal-600 bg-teal-50 text-teal-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, payment_method: 'GCash' })}
                    className={`px-6 py-4 border-2 rounded-xl font-semibold transition-all ${
                      paymentForm.payment_method === 'GCash'
                        ? 'border-teal-600 bg-teal-50 text-teal-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    📱 GCash
                  </button>
                </div>
              </div>

              {/* Amount Paid */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Amount Paid <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none text-slate-900 bg-white"
                  placeholder="Enter amount"
                />
                {paymentForm.amount > completeModal.order?.total_amount && (
                  <p className="text-sm text-amber-600 mt-2">
                    Change: ₱{(paymentForm.amount - completeModal.order?.total_amount).toFixed(2)}
                  </p>
                )}
              </div>

              {/* GCash Reference Number */}
              {paymentForm.payment_method === 'GCash' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    GCash Reference Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={paymentForm.reference_number}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none text-slate-900 bg-white"
                    placeholder="Enter GCash reference number"
                  />
                </div>
              )}

              {/* Payment Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none text-slate-900 bg-white"
                  placeholder="Add payment notes..."
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3 border-t border-slate-200">
              <button
                onClick={() => setCompleteModal({ isOpen: false, order: null })}
                className="px-6 py-2.5 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteOrder}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Complete Order & Record Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone and will return the items to inventory."
        itemName={deleteModal.name}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Orders;
