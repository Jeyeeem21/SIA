import { useState } from 'react';
import { Search, Plus, Mail, Phone, MapPin, Edit, Trash2, UserCircle, Users, TrendingUp, DollarSign, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import ViewModal from '../components/ViewModal';
import AddModal from '../components/AddModal';
import EditModal from '../components/EditModal';
import DeleteModal from '../components/DeleteModal';
import Pagination from '../components/Pagination';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal states
  const [viewModal, setViewModal] = useState({ isOpen: false, data: null });
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

  // Sample customers data (will be replaced with API)
  const [customers, setCustomers] = useState([
    { id: 1, name: 'Juan Dela Cruz', email: 'juan.delacruz@student.minsu.edu.ph', phone: '0912-345-6789', type: 'Student', studentId: '2021-12345', totalOrders: 15, totalSpent: 3250, lastOrder: '2025-10-28' },
    { id: 2, name: 'Maria Santos', email: 'maria.santos@student.minsu.edu.ph', phone: '0923-456-7890', type: 'Student', studentId: '2022-23456', totalOrders: 8, totalSpent: 1890, lastOrder: '2025-10-29' },
    { id: 3, name: 'Pedro Garcia', email: 'pedro.garcia@minsu.edu.ph', phone: '0934-567-8901', type: 'Faculty', studentId: 'FAC-001', totalOrders: 22, totalSpent: 5670, lastOrder: '2025-10-30' },
    { id: 4, name: 'Anna Reyes', email: 'anna.reyes@student.minsu.edu.ph', phone: '0945-678-9012', type: 'Student', studentId: '2023-34567', totalOrders: 12, totalSpent: 2340, lastOrder: '2025-10-27' },
    { id: 5, name: 'Carlos Lopez', email: 'carlos.lopez@minsu.edu.ph', phone: '0956-789-0123', type: 'Staff', studentId: 'STAFF-045', totalOrders: 18, totalSpent: 4120, lastOrder: '2025-10-29' },
    { id: 6, name: 'Sofia Ramos', email: 'sofia.ramos@student.minsu.edu.ph', phone: '0967-890-1234', type: 'Student', studentId: '2021-45678', totalOrders: 25, totalSpent: 6780, lastOrder: '2025-10-30' },
    { id: 7, name: 'Miguel Torres', email: 'miguel.torres@student.minsu.edu.ph', phone: '0978-901-2345', type: 'Student', studentId: '2022-56789', totalOrders: 6, totalSpent: 1250, lastOrder: '2025-10-26' },
    { id: 8, name: 'Elena Cruz', email: 'elena.cruz@minsu.edu.ph', phone: '0989-012-3456', type: 'Faculty', studentId: 'FAC-012', totalOrders: 14, totalSpent: 3890, lastOrder: '2025-10-28' },
  ]);

  const stats = [
    { label: 'Total Customers', value: '342', icon: Users, color: 'bg-gradient-to-br from-cyan-500 to-cyan-600' },
    { label: 'Active This Month', value: '156', icon: TrendingUp, color: 'bg-gradient-to-br from-teal-500 to-teal-600' },
    { label: 'Total Revenue', value: '₱187,450', icon: DollarSign, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
    { label: 'New This Week', value: '12', icon: UserCircle, color: 'bg-gradient-to-br from-amber-500 to-amber-600' },
  ];

  const customerTypes = ['all', 'Student', 'Faculty', 'Staff'];

  // Modal field configurations
  const customerFields = [
    { key: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter full name' },
    { key: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'email@minsu.edu.ph' },
    { key: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: '0912-345-6789' },
    { key: 'type', label: 'User Type', type: 'select', required: true,
      options: [
        { value: 'Student', label: 'Student' },
        { value: 'Faculty', label: 'Faculty' },
        { value: 'Staff', label: 'Staff' }
      ]
    },
    { key: 'studentId', label: 'Student/Employee ID', type: 'text', required: true, placeholder: '2021-12345 or STAFF-XXX' }
  ];

  const viewFields = [
    { key: 'name', label: 'Full Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'type', label: 'User Type' },
    { key: 'studentId', label: 'Student/Employee ID' },
    { key: 'totalOrders', label: 'Total Orders' },
    { key: 'totalSpent', label: 'Total Spent', render: (value) => `₱${parseFloat(value).toLocaleString()}` },
    { key: 'lastOrder', label: 'Last Order Date' }
  ];

  // Modal handlers
  const handleView = (customer) => {
    setViewModal({ isOpen: true, data: customer });
  };

  const handleAdd = (formData) => {
    const newCustomer = {
      id: customers.length + 1,
      ...formData,
      totalOrders: 0,
      totalSpent: 0,
      lastOrder: new Date().toISOString().split('T')[0]
    };
    setCustomers([...customers, newCustomer]);
    toast.success('Customer added successfully!');
  };

  const handleEdit = (formData) => {
    setCustomers(customers.map(c => c.id === formData.id ? formData : c));
    toast.success('Customer updated successfully!');
  };

  const handleDelete = () => {
    setCustomers(customers.filter(c => c.id !== deleteModal.id));
    toast.success('Customer deleted successfully!');
  };

  const openEditModal = (customer) => {
    setEditModal({ isOpen: true, data: customer });
  };

  const openDeleteModal = (customer) => {
    setDeleteModal({ isOpen: true, id: customer.id, name: customer.name });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Student': return 'bg-cyan-100 text-cyan-700 border-cyan-300';
      case 'Faculty': return 'bg-violet-100 text-violet-700 border-violet-300';
      case 'Staff': return 'bg-amber-100 text-amber-700 border-amber-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || customer.type === filterType;
    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
            Customer Management
          </h1>
          <p className="text-slate-600 mt-1">Manage your customer database and relationships</p>
        </div>
        <button 
          onClick={() => setAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Add New Customer
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
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search customers by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer"
          >
            {customerTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Mobile Card View */}
        <div className="block md:hidden p-4 space-y-4">
          {paginatedCustomers.length === 0 ? (
            <div className="text-center text-slate-500 py-12">No customers found</div>
          ) : (
            paginatedCustomers.map((customer) => (
              <div key={customer.id} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white font-semibold shadow-lg flex-shrink-0">
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{customer.name}</h3>
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(customer.type)}`}>
                      {customer.type}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    <span className="font-mono">{customer.studentId}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-xs text-slate-600">Orders</div>
                    <div className="text-lg font-bold text-slate-900">{customer.totalOrders}</div>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-xs text-slate-600">Spent</div>
                    <div className="text-sm font-bold text-emerald-600">₱{customer.totalSpent.toLocaleString()}</div>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-xs text-slate-600">Last Order</div>
                    <div className="text-xs font-medium text-slate-900">{customer.lastOrder}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <button 
                    onClick={() => handleView(customer)}
                    className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button 
                    onClick={() => openEditModal(customer)}
                    className="flex-1 px-3 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => openDeleteModal(customer)}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  ID Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Last Order
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white font-semibold shadow-lg">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-slate-900">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(customer.type)}`}>
                      {customer.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm">{customer.studentId}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{customer.totalOrders}</td>
                  <td className="px-6 py-4 font-semibold text-emerald-600">₱{customer.totalSpent.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{customer.lastOrder}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleView(customer)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" 
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openEditModal(customer)}
                        className="p-2 hover:bg-cyan-50 text-cyan-600 rounded-lg transition-colors" 
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(customer)}
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
          totalItems={filteredCustomers.length}
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
        title="Customer Details"
        data={viewModal.data}
        fields={viewFields}
      />

      <AddModal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        title="Add New Customer"
        fields={customerFields}
        onSubmit={handleAdd}
      />

      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, data: null })}
        title="Edit Customer"
        fields={customerFields}
        data={editModal.data}
        onSubmit={handleEdit}
      />

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        title="Delete Customer"
        message="Are you sure you want to delete this customer?"
        itemName={deleteModal.name}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Customers;
