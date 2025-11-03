import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Package, DollarSign, Tag, TrendingUp, Eye, Scan } from 'lucide-react';
import toast from 'react-hot-toast';
import useBarcodeScanner from '../hooks/useBarcodeScanner';
import ViewModal from '../components/ViewModal';
import AddModal from '../components/AddModal';
import EditModal from '../components/EditModal';
import DeleteModal from '../components/DeleteModal';
import Pagination from '../components/Pagination';
import { productsAPI, categoriesAPI } from '../services/api';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  
  // Modal states
  const [viewModal, setViewModal] = useState({ isOpen: false, data: null });
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

  // Products and categories from API
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Barcode Scanner Handler - Must be defined before hook
  const handleBarcodeScan = async (barcode) => {
    if (!barcode || barcode.trim() === '') return;
    
    try {
      // Search for product by barcode
      const foundProduct = products.find(p => 
        p.barcode === barcode
      );

      if (foundProduct) {
        // Product found - open view modal
        setViewModal({ isOpen: true, data: foundProduct });
        toast.success(`Product found: ${foundProduct.product_name}`);
      } else {
        // Product not found - save barcode and open add modal
        setScannedBarcode(barcode);
        setAddModal(true);
        toast(`No product found with barcode: ${barcode}`, {
          icon: 'ℹ️',
        });
      }
    } catch (error) {
      toast.error('Error processing barcode');
      console.error('Barcode scan error:', error);
    }
  };

  // Barcode Scanner Hook - Always active
  useBarcodeScanner(handleBarcodeScan, true, 3);

  // Fetch products and categories from API
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'bg-gradient-to-br from-cyan-500 to-cyan-600' },
    { label: 'Active Products', value: products.filter(p => p.status === 'active').length, icon: TrendingUp, color: 'bg-gradient-to-br from-teal-500 to-teal-600' },
    { label: 'Total Value', value: `₱${products.reduce((sum, p) => sum + (parseFloat(p.price) * (p.inventory?.quantity || 0)), 0).toLocaleString()}`, icon: DollarSign, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
    { label: 'Categories', value: categories.length, icon: Tag, color: 'bg-gradient-to-br from-amber-500 to-amber-600' },
  ];

  // Build category options dynamically from fetched categories (only active)
  const categoryOptions = categories
    .filter(cat => cat.status === 'active')
    .map(cat => ({
      value: cat.category_id,
      label: cat.category_name
    }));

  // Modal field configurations
  const productFields = [
    { key: 'product_name', label: 'Product Name', type: 'text', required: true, placeholder: 'Enter unique product name' },
    { key: 'barcode', label: 'Barcode', type: 'text', required: false, placeholder: 'Optional barcode number', defaultValue: scannedBarcode },
    { key: 'category_id', label: 'Category', type: 'select', required: true, 
      options: categoryOptions
    },
    { key: 'price', label: 'Selling Price (₱)', type: 'number', required: true, placeholder: '0.00' },
    { key: 'cost', label: 'Cost Price (₱)', type: 'number', required: false, placeholder: '0.00' },
    { key: 'unit', label: 'Unit', type: 'select', required: true,
      options: [
        { value: 'piece', label: 'Piece' },
        { value: 'ream', label: 'Ream' },
        { value: 'yard', label: 'Yard' },
        { value: 'set', label: 'Set' },
        { value: 'pack', label: 'Pack' }
      ]
    },
    { key: 'description', label: 'Description', type: 'textarea', fullWidth: true, rows: 3, placeholder: 'Product description...' }
  ];

  const viewFields = [
    { key: 'product_name', label: 'Product Name' },
    { key: 'barcode', label: 'Barcode', render: (value) => value || 'N/A' },
    { key: 'category', label: 'Category', render: (value) => value?.category_name || 'N/A' },
    { key: 'price', label: 'Selling Price', render: (value) => `₱${parseFloat(value).toLocaleString()}` },
    { key: 'cost', label: 'Cost Price', render: (value) => value ? `₱${parseFloat(value).toLocaleString()}` : 'N/A' },
    { key: 'unit', label: 'Unit' },
    { key: 'inventory', label: 'Current Stock', render: (value) => `${value?.quantity || 0} units` },
    { key: 'status', label: 'Status', render: (value) => value.toUpperCase() },
    { key: 'description', label: 'Description' }
  ];

  // Modal handlers
  const handleView = (product) => {
    setViewModal({ isOpen: true, data: product });
  };

  const handleAdd = async (formData) => {
    try {
      await productsAPI.create(formData);
      await fetchProducts();
      toast.success('Product added successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product');
      console.error('Error adding product:', error);
    }
  };

  const handleEdit = async (formData) => {
    try {
      await productsAPI.update(formData.product_id, formData);
      await fetchProducts();
      toast.success('Product updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product');
      console.error('Error updating product:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await productsAPI.delete(deleteModal.id);
      await fetchProducts();
      toast.success('Product deleted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
      console.error('Error deleting product:', error);
    }
  };

  const openEditModal = (product) => {
    setEditModal({ isOpen: true, data: product });
  };

  const openDeleteModal = (product) => {
    setDeleteModal({ isOpen: true, id: product.product_id, name: product.product_name });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'low': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'out': return 'bg-rose-100 text-rose-700 border-rose-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'In Stock';
      case 'low': return 'Low Stock';
      case 'out': return 'Out of Stock';
      default: return 'Unknown';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || product.category_id === parseInt(filterCategory);
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
            Products Management
          </h1>
          <p className="text-slate-600 mt-1">Manage your product catalog and pricing</p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <Scan className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="text-emerald-600 font-medium">Barcode Scanner Always Active</span>
          </div>
        </div>
        <button 
          onClick={() => {
            setScannedBarcode('');
            setAddModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Add New Product
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
              placeholder="Search products by name or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.category_id} value={category.category_id}>
                {category.category_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Barcode
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Stock
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
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No products found
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                <tr key={product.product_id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-cyan-600" />
                      </div>
                      <span className="font-medium text-slate-900">{product.product_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm">{product.barcode || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {product.category?.category_name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">₱{parseFloat(product.price).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${(product.inventory?.quantity || 0) < 10 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {product.inventory?.quantity || 0} units
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                      {getStatusText(product.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleView(product)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" 
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openEditModal(product)}
                        className="p-2 hover:bg-cyan-50 text-cyan-600 rounded-lg transition-colors" 
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(product)}
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
          totalItems={filteredProducts.length}
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
        title="Product Details"
        data={viewModal.data}
        fields={viewFields}
      />

      <AddModal
        isOpen={addModal}
        onClose={() => {
          setAddModal(false);
          setScannedBarcode(''); // Clear scanned barcode when modal closes
        }}
        title="Add New Product"
        fields={productFields}
        onSubmit={handleAdd}
      />

      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, data: null })}
        title="Edit Product"
        fields={productFields}
        data={editModal.data}
        onSubmit={handleEdit}
      />

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        itemName={deleteModal.name}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Products;
