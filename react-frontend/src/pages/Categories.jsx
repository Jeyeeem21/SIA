import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Tag, TrendingUp, Package, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import ViewModal from '../components/ViewModal';
import AddModal from '../components/AddModal';
import EditModal from '../components/EditModal';
import DeleteModal from '../components/DeleteModal';
import Pagination from '../components/Pagination';
import PageLoadingSpinner from '../components/PageLoadingSpinner';
import { categoriesAPI } from '../services/api';

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [viewModal, setViewModal] = useState({ isOpen: false, data: null });
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

  // Categories data from API
  const [categories, setCategories] = useState([]);

  // Fetch categories from API
  useEffect(() => {
    fetchCategories(true); // Show loading only on first load
    
    // Real-time polling every 1 second (no loading spinner)
    const interval = setInterval(() => fetchCategories(false), 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchCategories = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      if (showLoading) toast.error('Failed to fetch categories');
      console.error('Error fetching categories:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Categories', value: categories.length, icon: Layers, color: 'bg-gradient-to-br from-cyan-500 to-cyan-600' },
    { label: 'Active Categories', value: categories.filter(c => c.status === 'active').length, icon: TrendingUp, color: 'bg-gradient-to-br from-teal-500 to-teal-600' },
    { label: 'Total Products', value: categories.reduce((sum, c) => sum + (c.products_count || 0), 0), icon: Package, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
    { label: 'Inactive', value: categories.filter(c => c.status === 'inactive').length, icon: Tag, color: 'bg-gradient-to-br from-amber-500 to-amber-600' },
  ];

  // Modal field configurations
  const categoryFields = [
    { key: 'category_name', label: 'Category Name', type: 'text', required: true, placeholder: 'Enter category name' },
    { key: 'description', label: 'Description', type: 'textarea', required: false, fullWidth: true, rows: 3, placeholder: 'Category description (optional)' },
    { key: 'icon', label: 'Icon Name', type: 'text', required: false, placeholder: 'e.g., Printer, Package (optional)' },
    { key: 'status', label: 'Status', type: 'select', required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  ];

  const viewFields = [
    { key: 'category_name', label: 'Category Name' },
    { key: 'description', label: 'Description' },
    { key: 'icon', label: 'Icon Name' },
    { key: 'products_count', label: 'Number of Products' },
    { key: 'status', label: 'Status', render: (v) => v.toUpperCase() }
  ];

  // Modal handlers
  const handleView = (category) => {
    setViewModal({ isOpen: true, data: category });
  };

  const handleAdd = async (formData) => {
    try {
      const response = await categoriesAPI.create(formData);
      await fetchCategories();
      toast.success('Category added successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add category');
      console.error('Error adding category:', error);
    }
  };

  const handleEdit = async (formData) => {
    try {
      await categoriesAPI.update(formData.category_id, formData);
      await fetchCategories();
      toast.success('Category updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update category');
      console.error('Error updating category:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await categoriesAPI.delete(deleteModal.id);
      await fetchCategories();
      toast.success('Category deleted successfully!');
    } catch (error) {
      // Better error messages
      if (error.response?.status === 404) {
        toast.error('Category already deleted or not found');
        await fetchCategories(); // Refresh to remove from UI
      } else if (error.response?.status === 422) {
        toast.error(error.response?.data?.message || 'Cannot delete category');
      } else {
        toast.error('Failed to delete category');
      }
      console.error('Error deleting category:', error);
    }
  };

  const openEditModal = (category) => {
    setEditModal({ 
      isOpen: true, 
      data: {
        ...category,
        name: category.category_name
      }
    });
  };

  const openDeleteModal = (category) => {
    setDeleteModal({ 
      isOpen: true, 
      id: category.category_id, 
      name: category.category_name 
    });
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
      : 'bg-slate-100 text-slate-700 border-slate-300';
  };

  // Filter and pagination
  const filteredCategories = categories.filter(category =>
    category.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
            Categories Management
          </h1>
          <p className="text-slate-600 mt-1">Organize and manage product categories</p>
        </div>
        <button 
          onClick={() => setAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Add New Category
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

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Mobile Card View */}
        <div className="block md:hidden p-4 space-y-4">
          {loading ? (
            <PageLoadingSpinner message="Loading categories..." />
          ) : paginatedCategories.length === 0 ? (
            <div className="text-center text-slate-500 py-12">No categories found</div>
          ) : (
            paginatedCategories.map((category) => (
              <div key={category.category_id} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                    <Tag className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{category.category_name}</h3>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{category.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm">
                  <span className="text-slate-600">Products:</span>
                  <span className="font-semibold text-slate-900">{category.products_count || 0} items</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border flex-1 text-center ${getStatusColor(category.status)}`}>
                    {category.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <button 
                    onClick={() => handleView(category)}
                    className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button 
                    onClick={() => openEditModal(category)}
                    className="flex-1 px-3 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => openDeleteModal(category)}
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
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Icon
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Products
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
              {loading ? (
                <PageLoadingSpinner variant="table" colSpan={6} message="Loading categories..." />
              ) : paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No categories found
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((category) => (
                <tr key={category.category_id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center">
                        <Tag className="w-5 h-5 text-cyan-600" />
                      </div>
                      <span className="font-medium text-slate-900">{category.category_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                    {category.description}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {category.icon}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {category.products_count || 0} items
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(category.status)}`}>
                      {category.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleView(category)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" 
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openEditModal(category)}
                        className="p-2 hover:bg-cyan-50 text-cyan-600 rounded-lg transition-colors" 
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(category)}
                        className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors" 
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
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
          totalItems={filteredCategories.length}
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
        title="Category Details"
        data={viewModal.data}
        fields={viewFields}
      />

      <AddModal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        title="Add New Category"
        fields={categoryFields}
        onSubmit={handleAdd}
      />

      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, data: null })}
        title="Edit Category"
        fields={categoryFields}
        data={editModal.data}
        onSubmit={handleEdit}
      />

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        title="Delete Category"
        message="Are you sure you want to delete this category?"
        itemName={deleteModal.name}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Categories;
