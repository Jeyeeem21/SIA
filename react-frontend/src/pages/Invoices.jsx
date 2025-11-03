import { useState } from 'react';
import { Search, Download, Eye, Send, FileText, DollarSign, Clock, CheckCircle, XCircle, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ViewModal from '../components/ViewModal';
import AddModal from '../components/AddModal';
import EditModal from '../components/EditModal';
import DeleteModal from '../components/DeleteModal';
import Pagination from '../components/Pagination';

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal states
  const [viewModal, setViewModal] = useState({ isOpen: false, data: null });
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

  // Sample invoices data (will be replaced with API)
  const [invoices, setInvoices] = useState([
    { id: 'INV-2025-001', customer: 'Juan Dela Cruz', studentId: '2021-12345', date: '2025-10-28', dueDate: '2025-11-04', amount: 350, status: 'paid', items: 3 },
    { id: 'INV-2025-002', customer: 'Maria Santos', studentId: '2022-23456', date: '2025-10-29', dueDate: '2025-11-05', amount: 120, status: 'pending', items: 1 },
    { id: 'INV-2025-003', customer: 'Pedro Garcia', studentId: 'FAC-001', date: '2025-10-27', dueDate: '2025-11-03', amount: 890, status: 'paid', items: 5 },
    { id: 'INV-2025-004', customer: 'Anna Reyes', studentId: '2023-34567', date: '2025-10-30', dueDate: '2025-11-06', amount: 250, status: 'pending', items: 2 },
    { id: 'INV-2025-005', customer: 'Carlos Lopez', studentId: 'STAFF-045', date: '2025-10-26', dueDate: '2025-11-02', amount: 450, status: 'overdue', items: 4 },
    { id: 'INV-2025-006', customer: 'Sofia Ramos', studentId: '2021-45678', date: '2025-10-29', dueDate: '2025-11-05', amount: 670, status: 'paid', items: 6 },
    { id: 'INV-2025-007', customer: 'Miguel Torres', studentId: '2022-56789', date: '2025-10-28', dueDate: '2025-11-04', amount: 180, status: 'pending', items: 2 },
    { id: 'INV-2025-008', customer: 'Elena Cruz', studentId: 'FAC-012', date: '2025-10-25', dueDate: '2025-11-01', amount: 550, status: 'overdue', items: 3 },
  ]);

  // Modal configurations
  const invoiceFields = [
    { key: 'customer', label: 'Customer Name', type: 'text', required: true },
    { key: 'studentId', label: 'Student/Employee ID', type: 'text', required: true },
    { key: 'date', label: 'Invoice Date', type: 'date', required: true },
    { key: 'dueDate', label: 'Due Date', type: 'date', required: true },
    { key: 'amount', label: 'Total Amount (₱)', type: 'number', required: true },
    { key: 'items', label: 'Number of Items', type: 'number', required: true }
  ];

  const viewFields = [
    { key: 'id', label: 'Invoice Number' },
    { key: 'customer', label: 'Customer Name' },
    { key: 'studentId', label: 'Student/Employee ID' },
    { key: 'date', label: 'Invoice Date' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'amount', label: 'Total Amount', render: (v) => `₱${parseFloat(v).toLocaleString()}` },
    { key: 'items', label: 'Number of Items' },
    { key: 'status', label: 'Payment Status', render: (v) => v.toUpperCase() }
  ];

  // Modal handlers
  const handleView = (invoice) => {
    setViewModal({ isOpen: true, data: invoice });
  };

  const handleAdd = (formData) => {
    const newInvoice = {
      id: `INV-2025-${String(invoices.length + 1).padStart(3, '0')}`,
      ...formData,
      status: 'pending'
    };
    setInvoices([...invoices, newInvoice]);
    toast.success('Invoice created successfully!');
  };

  const handleEdit = (formData) => {
    setInvoices(invoices.map(inv => inv.id === formData.id ? formData : inv));
    toast.success('Invoice updated successfully!');
  };

  const handleDelete = () => {
    setInvoices(invoices.filter(inv => inv.id !== deleteModal.id));
    toast.success('Invoice deleted successfully!');
  };

  const handleDownload = (invoiceId) => {
    toast.success(`Downloading invoice ${invoiceId}...`);
  };

  const handleSend = (invoiceId) => {
    toast.success(`Invoice ${invoiceId} sent via email!`);
  };

  const stats = [
    { label: 'Total Invoices', value: '156', icon: FileText, color: 'bg-gradient-to-br from-cyan-500 to-cyan-600' },
    { label: 'Paid', value: '89', icon: CheckCircle, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
    { label: 'Pending', value: '52', icon: Clock, color: 'bg-gradient-to-br from-amber-500 to-amber-600' },
    { label: 'Overdue', value: '15', icon: XCircle, color: 'bg-gradient-to-br from-rose-500 to-rose-600' },
  ];

  const statusOptions = ['all', 'paid', 'pending', 'overdue'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'overdue': return 'bg-rose-100 text-rose-700 border-rose-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
            Invoice Management
          </h1>
          <p className="text-slate-600 mt-1">Track and manage all invoices and payments</p>
        </div>
        <button 
          onClick={() => setAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices by ID, customer, or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <div className="px-4 py-3 bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 rounded-lg">
            <p className="text-sm text-slate-600">Total Amount</p>
            <p className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
              ₱{totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Student/Staff ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-600" />
                      <span className="font-mono text-sm font-semibold text-slate-900">{invoice.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-xs font-semibold shadow-md">
                        {invoice.customer.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-slate-900">{invoice.customer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm">{invoice.studentId}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{invoice.date}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{invoice.dueDate}</td>
                  <td className="px-6 py-4 text-slate-600">{invoice.items} items</td>
                  <td className="px-6 py-4 font-bold text-slate-900">₱{invoice.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleView(invoice)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" 
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditModal({ isOpen: true, data: invoice })}
                        className="p-2 hover:bg-cyan-50 text-cyan-600 rounded-lg transition-colors" 
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDownload(invoice.id)}
                        className="p-2 hover:bg-teal-50 text-teal-600 rounded-lg transition-colors" 
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleSend(invoice.id)}
                        className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors" 
                        title="Send"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteModal({ isOpen: true, id: invoice.id, name: invoice.id })}
                        className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors" 
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredInvoices.length}
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
        title="Invoice Details"
        data={viewModal.data}
        fields={viewFields}
      />

      <AddModal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        title="Create New Invoice"
        fields={invoiceFields}
        onSubmit={handleAdd}
      />

      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, data: null })}
        title="Edit Invoice"
        fields={invoiceFields}
        data={editModal.data}
        onSubmit={handleEdit}
      />

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice?"
        itemName={deleteModal.name}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Invoices;
