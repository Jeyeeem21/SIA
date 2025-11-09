import { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  CreditCard,
  DollarSign,
  Receipt,
  User,
  Package,
  X,
  PlusCircle,
  TrendingUp,
  LogOut,
  ChevronDown,
  Settings,
  AlertTriangle,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { settingsAPI } from '../../services/api';
import AddOrderModal from '../../components/AddOrderModal';
import { productsAPI, inventoryAPI, ordersAPI, authAPI } from '../../services/api';

const Pos = () => {
  const { user, logout } = useAuth();
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', contact: '' });
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState([]);
  const [showUserMenuPos, setShowUserMenuPos] = useState(false);
  const userMenuRefPos = useRef(null);
  
  // Today's orders and void modal
  const [todaysOrders, setTodaysOrders] = useState([]);
  const [searchModal, setSearchModal] = useState({ isOpen: false, order: null });
  const [voidOrderNumber, setVoidOrderNumber] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [voidModal, setVoidModal] = useState({ isOpen: false, order: null, reason: '' });
  const [authModal, setAuthModal] = useState({ isOpen: false, order: null });
  const [authCredentials, setAuthCredentials] = useState({ email: '', password: '' });

  // Order form state for AddOrderModal
  const [orderForm, setOrderForm] = useState({
    customer_name: '',
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

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    fetchInventory();
    fetchTodaysOrders();
  }, []);

  // Close user menu when clicking outside (POS header)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRefPos.current && !userMenuRefPos.current.contains(e.target)) {
        setShowUserMenuPos(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const fetchInventory = async () => {
    try {
      const response = await inventoryAPI.getAll();
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const fetchTodaysOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      const today = new Date().toDateString();
      const filtered = response.data.filter(order => 
        new Date(order.created_at).toDateString() === today
      );
      setTodaysOrders(filtered);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleAuthSubmit = async () => {
    if (!authCredentials.email || !authCredentials.password) {
      toast.error('Please enter email and password');
      return;
    }

    try {
      // Authenticate admin user using authAPI (handles CORS properly)
      const response = await authAPI.login(authCredentials.email, authCredentials.password);
      const data = response.data;

      // Check if user is admin
      if (data.user?.role?.toLowerCase() !== 'admin') {
        toast.error('Only administrators can void orders');
        return;
      }

      // Authentication successful, show void modal
      toast.success('Authentication successful!');
      setAuthModal({ isOpen: false, order: null });
      setVoidModal({ isOpen: true, order: authModal.order, reason: '' });
      setAuthCredentials({ email: '', password: '' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid email or password';
      toast.error(errorMessage);
      console.error('Auth error:', error);
    }
  };

  const handleVoidOrder = async () => {
    if (!voidModal.reason || voidModal.reason.trim() === '') {
      toast.error('Please enter a reason for voiding the order');
      return;
    }

    try {
      await ordersAPI.voidOrder(voidModal.order.order_id, { void_reason: voidModal.reason });
      await fetchTodaysOrders();
      setVoidModal({ isOpen: false, order: null, reason: '' });
      setVoidOrderNumber('');
      toast.success(`Order ${voidModal.order.order_number} voided successfully and inventory restored!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to void order');
      console.error('Error voiding order:', error);
    }
  };

  const handleFindOrderToVoid = async () => {
    const orderNum = voidOrderNumber.trim();
    
    if (!orderNum) {
      setSearchModal(prev => ({ ...prev, order: null }));
      return;
    }

    setSearchLoading(true);
    
    try {
      // Search by order number - backend filters for Completed, not voided
      const response = await ordersAPI.searchByOrderNumber(orderNum);
      
      // Backend returns array
      const order = (Array.isArray(response.data) && response.data.length > 0) ? response.data[0] : null;
      
      if (!order) {
        toast.error(`Order ${orderNum} not found or not eligible for voiding (must be Completed, not voided)`);
        setSearchModal(prev => ({ ...prev, order: null }));
        return;
      }

      // Update modal with order
      setSearchModal({ isOpen: true, order: { ...order } });
      toast.success(`Found: ${order.order_number} - ${order.customer_name || 'Walk-in'}`);
    } catch (error) {
      toast.error('Failed to fetch order. Please check your connection.');
      console.error('Error fetching order:', error);
      setSearchModal(prev => ({ ...prev, order: null }));
    } finally {
      setSearchLoading(false);
    }
  };

  const handleProceedToVoid = () => {
    // Close search modal and show auth modal
    setAuthModal({ isOpen: true, order: searchModal.order });
    setSearchModal({ isOpen: false, order: null });
    setVoidOrderNumber('');
  };

  // Get inventory quantity for a product
  const getInventoryQuantity = (productId) => {
    const inventoryItem = inventory.find(item => item.product_id === productId);
    return inventoryItem ? inventoryItem.quantity : 0;
  };

  // Check if product is low on stock or out of stock
  const getStockStatus = (productId) => {
    const inventoryItem = inventory.find(item => item.product_id === productId);
    if (!inventoryItem) return { status: 'unknown', color: 'bg-gray-100 text-gray-700' };

    const quantity = inventoryItem.quantity;
    if (quantity <= 0) return { status: 'out-of-stock', color: 'bg-red-100 text-red-700' };
    if (inventoryItem.status === 'low') return { status: 'low-stock', color: 'bg-amber-100 text-amber-700' };
    return { status: 'available', color: 'bg-green-100 text-green-700' };
  };

  // Update inventory quantity locally
  const updateInventoryQuantity = (productId, quantityChange) => {
    setInventory(prevInventory =>
      prevInventory.map(item =>
        item.product_id === productId
          ? { ...item, quantity: Math.max(0, item.quantity + quantityChange) }
          : item
      )
    );
  };

  const addToCart = (product) => {
    const availableStock = getInventoryQuantity(product.product_id);
    if (availableStock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    const existingItem = cart.find(item => item.product_id === product.product_id);
    if (existingItem) {
      if (existingItem.quantity >= availableStock) {
        toast.error('Not enough stock available');
        return;
      }
      setCart(cart.map(item =>
        item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        ...product,
        quantity: 1,
        name: product.product_name // Ensure consistent naming
      }]);
    }

    // Update inventory (decrease by 1)
    updateInventoryQuantity(product.product_id, -1);
    toast.success(`${product.product_name} added to cart`);
  };

  const removeFromCart = (productId) => {
    const itemToRemove = cart.find(item => item.product_id === productId);
    if (itemToRemove) {
      // Update inventory (increase by the quantity being removed)
      updateInventoryQuantity(productId, itemToRemove.quantity);
    }
    setCart(cart.filter(item => item.product_id !== productId));
    toast.success('Item removed from cart');
  };

  const updateQuantity = (productId, newQuantity) => {
    const currentItem = cart.find(item => item.product_id === productId);
    if (!currentItem) return;

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const availableStock = getInventoryQuantity(productId) + currentItem.quantity; // Add back current cart quantity to get true available stock
    if (newQuantity > availableStock) {
      toast.error('Not enough stock available');
      return;
    }

    // Calculate the difference and update inventory
    const quantityDifference = newQuantity - currentItem.quantity;
    updateInventoryQuantity(productId, -quantityDifference);

    setCart(cart.map(item =>
      item.product_id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateChange = () => {
    return paymentAmount - calculateTotal();
  };

  // Functions for AddOrderModal
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

  const handleSubmitOrder = async () => {
    if (orderForm.order_items.length === 0) {
      toast.error('Please add at least one product to the order');
      return;
    }

    // Mock submission - in real app, call API
    toast.success('Order created successfully!');
    setAddModal(false);
    setOrderForm({
      customer_name: '',
      notes: '',
      preferred_pickup_date: new Date().toISOString().split('T')[0],
      order_items: []
    });
  };

  const processPayment = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    if (paymentAmount < calculateTotal()) {
      toast.error('Payment amount is insufficient');
      return;
    }

    try {
      // Validate that all cart items have valid products
      for (const item of cart) {
        const productExists = products.find(p => p.product_id == item.product_id);
        if (!productExists) {
          toast.error(`Product ${item.product_name} is no longer available`);
          return;
        }
      }

      // Get unique categories from cart items for the notes
      const cartCategories = [...new Set(cart.map(item => {
        const product = products.find(p => p.product_id == item.product_id);
        return product?.category?.category_name || 'Other';
      }))];
      const categoryNames = cartCategories.join(', ');

      // Prepare order data (service_type will be auto-filled from product category)
      const orderData = {
        customer_name: customer.name || 'Walk-in Customer',
        notes: `POS Transaction - Categories: ${categoryNames} - Payment: ${paymentMethod} ₱${paymentAmount} (Change: ₱${calculateChange()}) - ${new Date().toLocaleString()}`,
        order_items: cart.map(item => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.price),
          notes: null
        }))
      };

      // Create the order (this will automatically update inventory)
      let response;
      try {
        response = await ordersAPI.create(orderData);
      } catch (createError) {
        console.error('Error creating order:', createError);
        console.error('Create error response:', createError.response?.data);
        toast.error('Failed to create order. Please try again.');
        return;
      }

      // Mark the order as completed with payment details
      const orderId = response.data.order_id || response.data.id;
      try {
        await ordersAPI.complete(orderId, {
          payment_method: paymentMethod,
          amount: paymentAmount,
          reference_number: null,
          notes: `POS Payment - Change: ₱${calculateChange()}`
        });
      } catch (completeError) {
        console.error('Error completing order:', completeError);
        console.error('Complete error response:', completeError.response?.data);
        // Order was created but not completed - you might want to handle this
        toast.error('Order created but payment completion failed. Please contact support.');
        return; // Stop execution here
      }

      // Refresh inventory data and today's orders to reflect backend changes
      await fetchInventory();
      await fetchTodaysOrders();

      // Create receipt data
      const receipt = {
        id: response.data.order_number,
        order_id: response.data.id,
        date: new Date().toLocaleString(),
        customer: customer.name || 'Walk-in Customer',
        items: cart,
        total: calculateTotal(),
        paymentMethod,
        paymentAmount,
        change: calculateChange()
      };

      setReceiptData(receipt);
      setShowReceipt(true);

      // Reset cart and form
      setCart([]);
      setCustomer({ name: '', contact: '' });
      setPaymentAmount(0);
      setPaymentMethod('Cash');

      toast.success('Payment processed successfully! Order created.');
    } catch (error) {
      console.error('Error processing payment:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to process payment. Please try again.');
    }
  };

  // Define allowed categories
  const allowedCategories = [
    'Products',
    'ID Materials',
    'Printing Supplies',
    'Fabrics',
    'Lamination Materials',
    'Binding Materials',
    'Uniform Acc'
  ];

  // Get unique categories from products that are in the allowed list
  const availableCategories = Array.from(
    new Map(
      products
        .map(p => p.category)
        .filter(Boolean)
        .filter(category => allowedCategories.includes(category.category_name))
        .map(category => [category.category_id, category])
    ).values()
  );

  // Add "All" category at the beginning
  const categories = [
    { category_id: 'all', category_name: 'All' },
    ...availableCategories
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/20 min-h-full">
      {/* Top bar - matching sidebar styling */}
      <div className="mb-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              MinSU Business Center
            </h2>
            <p className="text-xs text-slate-400">Point of Sale</p>
          </div>
          <div className="relative" ref={userMenuRefPos}>
            <button
              onClick={() => setShowUserMenuPos(!showUserMenuPos)}
              className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all duration-200 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <span className="text-sm font-bold text-white">
                  {(user?.name || 'Staff').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">{user?.name || 'Staff User'}</p>
                <p className="text-xs text-slate-400">{user?.role || 'Staff'}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showUserMenuPos ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenuPos && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-50 animate-fade-in">
                <div className="p-4 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg">
                      <span className="text-base font-bold text-white">
                        {(user?.name || 'Staff').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{user?.name || 'Staff User'}</p>
                      <p className="text-xs text-slate-400">{user?.email || 'staff@minsu.com'}</p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-700/50 transition-colors text-left group">
                    <User className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                    <span className="text-sm text-slate-300 group-hover:text-white">My Profile</span>
                  </button>
                  <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-700/50 transition-colors text-left group">
                    <Settings className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                    <span className="text-sm text-slate-300 group-hover:text-white">Settings</span>
                  </button>
                </div>
                <div className="border-t border-slate-700 py-2">
                  <button 
                    onClick={logout}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-rose-500/10 transition-colors text-left group"
                  >
                    <LogOut className="w-4 h-4 text-rose-400 group-hover:text-rose-300 transition-colors" />
                    <span className="text-sm text-rose-400 group-hover:text-rose-300 font-medium">Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-800 to-teal-900 bg-clip-text text-transparent mb-2">
            Point of Sale
          </h1>
          <p className="text-slate-600">Process customer transactions efficiently.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setSearchModal({ isOpen: true, order: null })}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Void Order
          </button>
          <button
            onClick={() => setAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Add Custom Order
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-all">
          <ShoppingCart className="w-8 h-8 text-cyan-600 mb-2" />
          <div className="text-2xl font-bold text-slate-900">{cart.length}</div>
          <p className="text-sm font-semibold text-slate-600">Items in Cart</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-all">
          <DollarSign className="w-8 h-8 text-teal-600 mb-2" />
          <div className="text-2xl font-bold text-slate-900">₱{calculateTotal().toFixed(2)}</div>
          <p className="text-sm font-semibold text-slate-600">Cart Total</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-600 to-teal-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all">
          <TrendingUp className="w-8 h-8 mb-2" />
          <div className="text-2xl font-bold">
            {products.filter(product => {
              const categoryMatch = selectedCategory === 'All' ||
                (product.category && product.category.category_name === selectedCategory);
              const searchMatch = searchTerm === '' ||
                product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.category && product.category.category_name.toLowerCase().includes(searchTerm.toLowerCase()));
              return categoryMatch && searchMatch;
            }).length}
          </div>
          <p className="text-sm font-semibold">Available Products</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-cyan-600" />
                Products
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-10 py-2 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none text-slate-900 bg-white w-64"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Category Filter - Horizontal Scroll */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(category => (
                <button
                  key={category.category_id}
                  onClick={() => setSelectedCategory(category.category_name)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === category.category_name
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                  }`}
                >
                  {category.category_name}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-slate-400">Loading products...</div>
              </div>
            ) : (
              <div className="max-h-[87vh] overflow-y-auto pr-2 scrollbar-hide">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products
                  .filter(product => {
                    // Filter by category
                    const categoryMatch = selectedCategory === 'All' ||
                      (product.category && product.category.category_name === selectedCategory);

                    // Filter by search term
                    const searchMatch = searchTerm === '' ||
                      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (product.category && product.category.category_name.toLowerCase().includes(searchTerm.toLowerCase()));

                    return categoryMatch && searchMatch;
                  })
                  .map(product => (
                  <div key={product.product_id} className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-lg hover:border-cyan-300 transition-all duration-300 group">
                    <div className="relative overflow-hidden rounded-lg mb-3">
                      <img 
                        src={product.image || '/api/placeholder/100/100'} 
                        alt={product.product_name} 
                        className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{product.product_name}</h3>
                    <p className="text-sm text-slate-600 mb-2">{product.category?.category_name || 'Other'}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStockStatus(product.product_id).color}`}>
                          Stock: {getInventoryQuantity(product.product_id)}
                        </span>
                        {getStockStatus(product.product_id).status === 'low-stock' && (
                          <span className="text-xs text-amber-600 font-medium">Low Stock</span>
                        )}
                        {getStockStatus(product.product_id).status === 'out-of-stock' && (
                          <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-cyan-600">₱{parseFloat(product.price).toFixed(2)}</span>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={getInventoryQuantity(product.product_id) <= 0}
                        className={`p-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                          getInventoryQuantity(product.product_id) <= 0
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white hover:from-cyan-700 hover:to-teal-700'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cart and Checkout */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-600" />
              Customer Information
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Customer Name (Optional)"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none text-slate-900 bg-white"
              />
              <input
                type="text"
                placeholder="Contact Number (Optional)"
                value={customer.contact}
                onChange={(e) => setCustomer({ ...customer, contact: e.target.value })}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Cart */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-cyan-600" />
              Cart ({cart.length} items)
            </h3>
            {cart.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Cart is empty</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={`cart-item-${item.product_id}-${index}`} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{item.product_name || item.name}</p>
                      <p className="text-sm text-slate-600">₱{parseFloat(item.price).toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="text"
                        value={item.quantity}
                        onFocus={(e) => {
                          e.target.select();
                          // Store the original value for comparison
                          e.target.dataset.originalValue = e.target.value;
                        }}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty string or valid numbers
                          if (value === '' || /^\d+$/.test(value)) {
                            const newQuantity = value === '' ? 1 : parseInt(value);
                            if (newQuantity >= 1) {
                              updateQuantity(item.product_id, newQuantity);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          // If empty on blur, revert to 1
                          if (e.target.value === '') {
                            updateQuantity(item.product_id, 1);
                          }
                        }}
                        className="w-12 text-center font-semibold border border-slate-300 rounded px-1 py-0.5 focus:border-cyan-500 focus:outline-none text-sm"
                      />
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        disabled={getInventoryQuantity(item.product_id) <= 0}
                        className={`p-1 rounded ${
                          getInventoryQuantity(item.product_id) <= 0
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="p-1 bg-rose-200 text-rose-700 rounded hover:bg-rose-300 ml-2"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {cart.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-cyan-600">₱{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-600" />
              Payment
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none text-slate-900 bg-white"
                  disabled={cart.length === 0}
                >
                  <option value="Cash">Cash</option>
                  <option value="GCash">GCash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Amount Paid</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none text-slate-900 bg-white"
                  placeholder="Enter amount paid"
                  disabled={cart.length === 0}
                />
              </div>
              {paymentAmount >= calculateTotal() && cart.length > 0 && (
                <div className="text-sm text-green-600">
                  Change: ₱{calculateChange().toFixed(2)}
                </div>
              )}
              <button
                onClick={processPayment}
                disabled={cart.length === 0}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Process Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Order Modal */}
      {searchModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white p-6 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Find Order to Void</h2>
                    <p className="text-cyan-100 text-sm">Enter order number to view details</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSearchModal({ isOpen: false, order: null });
                    setVoidOrderNumber('');
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Search Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Order Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={voidOrderNumber}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      setVoidOrderNumber(value);
                      
                      // Clear previous order when typing
                      if (searchModal.order && value !== searchModal.order.order_number) {
                        setSearchModal(prev => ({ ...prev, order: null }));
                      }
                      
                      // Auto-search after user stops typing (1 second delay to be safe)
                      clearTimeout(window.searchTimeout);
                      window.searchTimeout = setTimeout(() => {
                        // Only search when format looks complete: ORD-YYYY-NNNN (at least 14 chars)
                        // This prevents searching partial numbers like "ORD-2025-001"
                        const trimmed = value.trim();
                        if (trimmed.length >= 14 && /^ORD-\d{4}-\d{4}/.test(trimmed)) {
                          handleFindOrderToVoid();
                        }
                      }, 1000);
                    }}
                    onKeyPress={(e) => {
                      // Allow manual search with Enter key
                      if (e.key === 'Enter') {
                        clearTimeout(window.searchTimeout);
                        handleFindOrderToVoid();
                      }
                    }}
                    placeholder="Type order number (e.g., ORD-2025-0010)"
                    className="w-full px-4 py-3 pr-12 border-2 border-slate-300 rounded-xl focus:border-cyan-500 focus:outline-none text-slate-900 bg-white font-medium uppercase"
                    autoFocus
                    disabled={searchLoading}
                  />
                  {searchLoading ? (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  <span className="font-semibold text-amber-600">Only Completed orders</span> can be voided • Auto-searches as you type
                </p>
              </div>

              {/* Order Details */}
              {searchModal.order && (
                <div className="border-2 border-slate-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-cyan-600" />
                    Order Details
                  </h3>

                  {/* Order Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-slate-500">Order ID</p>
                      <p className="text-base font-semibold text-slate-900">{searchModal.order.order_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Order Number</p>
                      <p className="text-base font-semibold text-slate-900">{searchModal.order.order_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Customer</p>
                      <p className="text-base font-semibold text-slate-900">{searchModal.order.customer_name || 'Walk-in'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Total Amount</p>
                      <p className="text-base font-semibold text-cyan-600">₱{parseFloat(searchModal.order.total_amount).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        searchModal.order.status === 'Completed' ? 'bg-teal-100 text-teal-700' :
                        searchModal.order.status === 'In Progress' ? 'bg-cyan-100 text-cyan-700' :
                        searchModal.order.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {searchModal.order.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Date</p>
                      <p className="text-base font-semibold text-slate-900">
                        {new Date(searchModal.order.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="text-sm font-bold text-slate-700 mb-3">Order Items ({searchModal.order.order_items?.length || 0})</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {searchModal.order.order_items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{item.product?.product_name || 'Product'}</p>
                            <p className="text-sm text-slate-500">Quantity: {item.quantity} × ₱{parseFloat(item.unit_price).toFixed(2)}</p>
                          </div>
                          <p className="font-bold text-slate-900">₱{parseFloat(item.subtotal).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons - Sticky Footer */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex-shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSearchModal({ isOpen: false, order: null });
                    setVoidOrderNumber('');
                  }}
                  className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-all"
                >
                  Cancel
                </button>
                {searchModal.order && (
                  <button
                    onClick={handleProceedToVoid}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    Proceed to Void
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Authentication Modal */}
      {authModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full my-8 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-6 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Admin Authentication Required</h2>
                  <p className="text-red-100 text-sm">Order: {authModal.order?.order_number}</p>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Security Check</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Voiding an order requires administrator approval. Please enter admin credentials to continue.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Admin Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={authCredentials.email}
                    onChange={(e) => setAuthCredentials({ ...authCredentials, email: e.target.value })}
                    placeholder="admin@example.com"
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleAuthSubmit()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={authCredentials.password}
                    onChange={(e) => setAuthCredentials({ ...authCredentials, password: e.target.value })}
                    placeholder="Enter admin password"
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                    onKeyPress={(e) => e.key === 'Enter' && handleAuthSubmit()}
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2 text-sm">Order to Void:</h4>
                  <div className="text-sm text-slate-700 space-y-1">
                    <p><strong>Order #:</strong> {authModal.order?.order_number}</p>
                    <p><strong>Customer:</strong> {authModal.order?.customer_name || 'Walk-in'}</p>
                    <p><strong>Total:</strong> ₱{parseFloat(authModal.order?.total_amount || 0).toFixed(2)}</p>
                    <p><strong>Status:</strong> <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      authModal.order?.status === 'Completed' ? 'bg-teal-100 text-teal-700' :
                      authModal.order?.status === 'In Progress' ? 'bg-cyan-100 text-cyan-700' :
                      authModal.order?.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>{authModal.order?.status}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Sticky Footer */}
            <div className="bg-slate-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3 border-t border-slate-200 flex-shrink-0">
              <button
                onClick={() => {
                  setAuthModal({ isOpen: false, order: null });
                  setAuthCredentials({ email: '', password: '' });
                }}
                className="px-6 py-2.5 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAuthSubmit}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Authenticate & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Void Order Modal */}
      {voidModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <X className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Void Order</h2>
                  <p className="text-orange-100 text-sm">Order: {voidModal.order?.order_number}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-slate-600 mb-4">
                Voiding this order will cancel it and restore all items back to inventory. Please provide a reason:
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Reason for Voiding <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={voidModal.reason}
                    onChange={(e) => setVoidModal({ ...voidModal, reason: e.target.value })}
                    placeholder="E.g., Customer cancelled, Wrong order, System error..."
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                    rows="3"
                    maxLength="500"
                  />
                  <p className="text-xs text-slate-500 mt-1">{voidModal.reason.length}/500 characters</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 mb-2 text-sm">Order Details:</h4>
                  <div className="text-sm text-amber-800 space-y-1">
                    <p><strong>Customer:</strong> {voidModal.order?.customer_name || 'Walk-in'}</p>
                    <p><strong>Items:</strong> {voidModal.order?.order_items?.length || 0} item(s)</p>
                    <p><strong>Total:</strong> ₱{parseFloat(voidModal.order?.total_amount || 0).toFixed(2)}</p>
                    <p><strong>Status:</strong> {voidModal.order?.status}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3 border-t border-slate-200">
              <button
                onClick={() => setVoidModal({ isOpen: false, order: null, reason: '' })}
                className="px-6 py-2.5 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleVoidOrder}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Void Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Receipt className="w-6 h-6" />
                Receipt
              </h2>
              <button
                onClick={() => setShowReceipt(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-slate-600">Receipt ID: {receiptData.id}</p>
                <p className="text-sm text-slate-600">{receiptData.date}</p>
              </div>
              <div className="border-t border-b border-slate-200 py-4">
                <p className="font-semibold text-slate-900">Customer: {receiptData.customer}</p>
                <div className="mt-2 space-y-1">
                  {receiptData.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>₱{receiptData.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Paid ({receiptData.paymentMethod}):</span>
                  <span>₱{receiptData.paymentAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Change:</span>
                  <span>₱{receiptData.change.toFixed(2)}</span>
                </div>
              </div>
              <div className="text-center text-sm text-slate-500">
                Thank you for your business!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Order Modal */}
      <AddOrderModal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        orderForm={orderForm}
        setOrderForm={setOrderForm}
        currentItem={currentItem}
        setCurrentItem={setCurrentItem}
        products={products}
        addItemToOrder={addItemToOrder}
        removeItemFromOrder={removeItemFromOrder}
        handleSubmitOrder={handleSubmitOrder}
      />
    </div>
  );
};

export default Pos;