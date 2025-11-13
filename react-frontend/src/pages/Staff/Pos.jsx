import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { settingsAPI, authAPI, ordersAPI } from '../../services/api';
import AddOrderModal from '../../components/AddOrderModal';
import { useProducts } from '../../hooks/useProducts';
import { useInventory } from '../../hooks/useInventory';
import { useOrders, useCreateOrder, useTodaysOrders, useSearchOrder, useVoidOrder } from '../../hooks/useOrders';
import { LoadingBar, CardGridSkeleton } from '../../components/LoadingStates';

const Pos = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  
  // React Query hooks
  const { data: products = [], isLoading } = useProducts();
  const { data: inventory = [] } = useInventory();
  const { data: todaysOrders = [] } = useTodaysOrders();
  const createOrderMutation = useCreateOrder();
  const voidOrderMutation = useVoidOrder();
  
  // UI state
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', contact: '' });
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenuPos, setShowUserMenuPos] = useState(false);
  const userMenuRefPos = useRef(null);
  
  // Payment modal state (like Orders.jsx)
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    payment_method: 'Cash',
    amount: 0,
    reference_number: ''
  });
  
  // Quantity input refs for auto-focus
  const quantityInputRefs = useRef({});
  const lastAddedProductRef = useRef(null);
  
  // Barcode scanner and amount input refs
  const barcodeInputRef = useRef(null);
  const amountInputRef = useRef(null);
  
  // Search and void modal state
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

  // Open payment modal and set default amount to total
  const handleOpenPaymentModal = useCallback(() => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setPaymentForm({
      payment_method: 'Cash',
      amount: total,
      reference_number: ''
    });
    setPaymentModal(true);
    
    // Focus amount input after modal opens
    setTimeout(() => {
      if (amountInputRef.current) {
        amountInputRef.current.focus();
        amountInputRef.current.select();
      }
    }, 100);
  }, [cart]);

  // Auto-focus barcode scanner on mount
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Refocus scanner when cart changes (after adding/removing items)
  useEffect(() => {
    if (barcodeInputRef.current && !paymentModal) {
      barcodeInputRef.current.focus();
    }
  }, [cart.length, paymentModal]);

  // Close user menu when clicking outside (POS header)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRefPos.current && !userMenuRefPos.current.contains(e.target)) {
        setShowUserMenuPos(false);
      }
      
      // Refocus scanner when clicking outside cart items (but not on buttons/inputs)
      const clickedElement = e.target;
      const isButton = clickedElement.tagName === 'BUTTON' || clickedElement.closest('button');
      const isInput = clickedElement.tagName === 'INPUT' || clickedElement.closest('input');
      const isModal = clickedElement.closest('[role="dialog"]') || clickedElement.closest('.fixed.inset-0');
      
      if (!isButton && !isInput && !isModal && barcodeInputRef.current && !paymentModal) {
        setTimeout(() => {
          if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
          }
        }, 0);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [paymentModal]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl + Arrow Down - Navigate to next product quantity in cart
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowDown' && cart.length > 0) {
        e.preventDefault();
        
        const activeElement = document.activeElement;
        const isBarcodeInput = activeElement === barcodeInputRef.current;
        const isQuantityInput = activeElement && activeElement.classList.contains('quantity-input');
        
        if (isBarcodeInput || !isQuantityInput) {
          // Focus first cart item
          const firstProductId = cart[0].product_id;
          const firstInput = quantityInputRefs.current[firstProductId];
          if (firstInput) {
            firstInput.focus();
            firstInput.select();
          }
        } else if (isQuantityInput) {
          // Navigate to next item
          const currentProductId = activeElement.dataset.productId;
          const currentIndex = cart.findIndex(item => item.product_id.toString() === currentProductId);
          
          if (currentIndex >= 0 && currentIndex < cart.length - 1) {
            const nextProductId = cart[currentIndex + 1].product_id;
            const nextInput = quantityInputRefs.current[nextProductId];
            if (nextInput) {
              nextInput.focus();
              nextInput.select();
            }
          } else {
            // Last item, go back to scanner
            if (barcodeInputRef.current) {
              barcodeInputRef.current.focus();
            }
          }
        }
      }
      
      // Ctrl + Arrow Up - Navigate to previous product quantity in cart
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowUp' && cart.length > 0) {
        e.preventDefault();
        
        const activeElement = document.activeElement;
        const isQuantityInput = activeElement && activeElement.classList.contains('quantity-input');
        
        if (isQuantityInput) {
          const currentProductId = activeElement.dataset.productId;
          const currentIndex = cart.findIndex(item => item.product_id.toString() === currentProductId);
          
          if (currentIndex > 0) {
            // Navigate to previous item
            const prevProductId = cart[currentIndex - 1].product_id;
            const prevInput = quantityInputRefs.current[prevProductId];
            if (prevInput) {
              prevInput.focus();
              prevInput.select();
            }
          } else {
            // First item, go back to scanner
            if (barcodeInputRef.current) {
              barcodeInputRef.current.focus();
            }
          }
        }
      }
      
      // Ctrl+Q or Cmd+Q - Focus last added item's quantity
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        
        if (lastAddedProductRef.current) {
          const input = quantityInputRefs.current[lastAddedProductRef.current];
          if (input) {
            input.focus();
            input.select();
            toast.success('Quantity input focused!', { duration: 1000 });
          }
        } else if (cart.length > 0) {
          // If no last added, focus the first item in cart
          const firstProductId = cart[0].product_id;
          const input = quantityInputRefs.current[firstProductId];
          if (input) {
            input.focus();
            input.select();
            toast.success('Quantity input focused!', { duration: 1000 });
          }
        } else {
          toast.error('Cart is empty');
        }
      }
      
      // Ctrl+Enter - Process payment (open payment modal)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (cart.length > 0) {
          handleOpenPaymentModal();
        } else {
          toast.error('Cart is empty');
        }
      }
      
      // Ctrl+B - Refocus barcode scanner
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (barcodeInputRef.current) {
          barcodeInputRef.current.focus();
          barcodeInputRef.current.select();
          toast.success('Barcode scanner focused!', { duration: 1000 });
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [cart, handleOpenPaymentModal]);

  const handleAuthSubmit = async () => {
    if (!authCredentials.email || !authCredentials.password) {
      toast.error('Please enter email and password');
      return;
    }

    // Save order reference before clearing
    const orderToVoid = authModal.order;
    
    // Close auth modal immediately for faster response
    setAuthModal({ isOpen: false, order: null });
    setAuthCredentials({ email: '', password: '' });

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
      setVoidModal({ isOpen: true, order: orderToVoid, reason: '' });
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

    // Close modal immediately for faster response
    const orderId = voidModal.order.order_id;
    const reason = voidModal.reason;
    setVoidModal({ isOpen: false, order: null, reason: '' });
    setVoidOrderNumber('');

    voidOrderMutation.mutate({
      id: orderId,
      reason: reason
    });
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

  // Get inventory quantity for a product (original stock from backend)
  const getInventoryQuantity = (productId) => {
    const inventoryItem = inventory.find(item => item.product_id === productId);
    return inventoryItem ? inventoryItem.quantity : 0;
  };

  // Get REAL-TIME available stock (inventory - cart quantity) - INSTANT UPDATES!
  const getAvailableStock = useCallback((productId) => {
    const inventoryQty = getInventoryQuantity(productId);
    const cartItem = cart.find(item => item.product_id === productId);
    const cartQty = cartItem ? cartItem.quantity : 0;
    return Math.max(0, inventoryQty - cartQty);
  }, [inventory, cart]);

  // Check if product is low on stock or out of stock - REAL-TIME with cart consideration
  const getStockStatus = useCallback((productId) => {
    const availableQty = getAvailableStock(productId);
    const inventoryItem = inventory.find(item => item.product_id === productId);
    
    if (!inventoryItem) return { status: 'unknown', color: 'bg-gray-100 text-gray-700' };

    if (availableQty <= 0) return { status: 'out-of-stock', color: 'bg-red-100 text-red-700' };
    if (inventoryItem.status === 'low' || availableQty <= 5) return { status: 'low-stock', color: 'bg-amber-100 text-amber-700' };
    return { status: 'available', color: 'bg-green-100 text-green-700' };
  }, [inventory, cart, getAvailableStock]);

  const addToCart = useCallback((product) => {
    const inventoryQty = getInventoryQuantity(product.product_id);
    
    if (inventoryQty <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    let shouldAdd = true;
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product_id === product.product_id);
      
      if (existingItem) {
        // Check if we can add more (inventory - current cart quantity)
        if (existingItem.quantity >= inventoryQty) {
          shouldAdd = false;
          setTimeout(() => {
            toast.error('Not enough stock available');
          }, 0);
          return prevCart;
        }
        
        return prevCart.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, {
          product_id: product.product_id,
          product_name: product.product_name,
          price: product.price,
          quantity: 1
        }];
      }
    });

    if (shouldAdd) {
      // Store last added product for auto-focus
      lastAddedProductRef.current = product.product_id;
      
      // Show notification AFTER render completes
      setTimeout(() => {
        toast.success(`${product.product_name} added to cart`);
      }, 0);
      
      // Refocus barcode scanner
      setTimeout(() => {
        if (barcodeInputRef.current) {
          barcodeInputRef.current.focus();
        }
      }, 100);
    }
  }, [getInventoryQuantity]);

  // Global barcode buffer - allows scanning even when editing quantities
  useEffect(() => {
    let barcodeBuffer = '';
    let bufferTimeout;
    let lastKeyTime = 0;
    let keyCount = 0;

    const handleGlobalKeyDown = (e) => {
      // Ignore if modal is open or if user is typing in textarea
      if (paymentModal || showReceipt || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;
      
      // Detect barcode scanner by fast typing speed
      // Barcode scanners type VERY fast (usually < 30ms between keys)
      const isFastTyping = timeDiff < 30 && barcodeBuffer.length > 0;
      
      // Count consecutive fast keypresses
      if (isFastTyping) {
        keyCount++;
      } else if (timeDiff > 100) {
        // Reset if there's a longer pause (manual typing)
        keyCount = 0;
      }
      
      // Definitely a scanner if we have 3+ consecutive fast keys
      const isDefinitelyScanner = keyCount >= 3;

      if (e.key === 'Enter' && barcodeBuffer.length > 0) {
        const isQuantityInput = document.activeElement?.classList.contains('quantity-input');
        const isLongBarcode = barcodeBuffer.length >= 8;
        
        // Process as barcode if:
        // 1. Definitely from scanner (3+ fast consecutive keys) OR
        // 2. Long barcode (8+ digits) OR
        // 3. Not in quantity input
        if (isDefinitelyScanner || isLongBarcode || !isQuantityInput) {
          e.preventDefault();
          e.stopPropagation();
          
          // If in quantity input, clear it first
          if (isQuantityInput && document.activeElement) {
            document.activeElement.value = '';
          }
          
          // Process the barcode
          toast.dismiss();
          
          const product = products.find(p => 
            p.barcode === barcodeBuffer || 
            p.product_id.toString() === barcodeBuffer
          );
          
          if (product) {
            if (product.status !== 'active') {
              toast.error(`Product not available - "${product.product_name}" is inactive`);
            } else {
              const inventoryQty = getInventoryQuantity(product.product_id);
              if (inventoryQty <= 0) {
                toast.error(`Product not enough stocks - "${product.product_name}" is out of stock`);
              } else {
                addToCart(product);
              }
            }
          } else if (isLongBarcode || isDefinitelyScanner) {
            toast.error(`Product with barcode "${barcodeBuffer}" not found`);
          }
          
          // Clear buffer
          barcodeBuffer = '';
          keyCount = 0;
          if (barcodeInputRef.current) {
            barcodeInputRef.current.value = '';
          }
        } else {
          // Short manual entry in quantity input
          barcodeBuffer = '';
          keyCount = 0;
        }
      } else if (/^[0-9]$/.test(e.key)) {
        const isQuantityInput = document.activeElement?.classList.contains('quantity-input');
        
        // If scanner detected and in quantity input, prevent the number from entering
        if ((isDefinitelyScanner || isFastTyping) && isQuantityInput) {
          e.preventDefault();
          e.stopPropagation();
        }
        
        // Add to buffer
        barcodeBuffer += e.key;
        lastKeyTime = currentTime;
        
        // Update barcode input display
        if (barcodeInputRef.current && !isQuantityInput) {
          barcodeInputRef.current.value = barcodeBuffer;
        } else if (barcodeInputRef.current && isQuantityInput && (isDefinitelyScanner || isFastTyping)) {
          // Show in barcode input even when quantity is focused (if scanner detected)
          barcodeInputRef.current.value = barcodeBuffer;
        }
        
        // Clear buffer after inactivity
        clearTimeout(bufferTimeout);
        bufferTimeout = setTimeout(() => {
          barcodeBuffer = '';
          keyCount = 0;
        }, 100);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, true);
      clearTimeout(bufferTimeout);
    };
  }, [products, paymentModal, showReceipt, addToCart, getInventoryQuantity]);

  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
    
    // Show toast after state update
    setTimeout(() => {
      toast.success('Item removed from cart');
    }, 0);
  }, []);

  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // Check real-time available stock from inventory
    const totalInventoryStock = getInventoryQuantity(productId);
    
    if (newQuantity > totalInventoryStock) {
      toast.error(`Not enough stock! Only ${totalInventoryStock} available`);
      return;
    }

    setCart(prevCart => {
      // Update cart INSTANTLY
      return prevCart.map(item =>
        item.product_id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  }, [inventory]);

  // Calculate total INSTANTLY with useMemo - updates automatically when cart changes
  const calculateTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

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

  // Handle barcode scan
  const handleBarcodeScan = (e) => {
    if (e.key === 'Enter') {
      const barcode = e.target.value.trim();
      if (!barcode) return;
      
      // Dismiss all existing toasts before showing new one
      toast.dismiss();
      
      // Find product by barcode - search in ALL products (not just active/filtered)
      const product = products.find(p => 
        p.barcode === barcode || 
        p.product_id.toString() === barcode
      );
      
      if (product) {
        // Check if product is active
        if (product.status !== 'active') {
          toast.error(`Product not available - "${product.product_name}" is inactive`);
          e.target.value = '';
          return;
        }
        
        // Check if product has stock
        const inventoryQty = getInventoryQuantity(product.product_id);
        if (inventoryQty <= 0) {
          toast.error(`Product not enough stocks - "${product.product_name}" is out of stock`);
          e.target.value = '';
          return;
        }
        
        addToCart(product);
        e.target.value = ''; // Clear barcode input
        
        // Focus amount input after adding product
        setTimeout(() => {
          if (amountInputRef.current) {
            amountInputRef.current.focus();
          }
        }, 100);
      } else {
        toast.error(`Product with barcode "${barcode}" not found`);
        e.target.value = '';
      }
    }
  };

  const processPayment = async () => {
    // Validate payment form
    if (!paymentForm.payment_method) {
      toast.error('Please select a payment method');
      return;
    }
    
    if (paymentForm.amount < calculateTotal) {
      toast.error('Payment amount is insufficient');
      return;
    }
    
    if (paymentForm.payment_method === 'GCash' && !paymentForm.reference_number) {
      toast.error('Please enter GCash reference number');
      return;
    }

    // Validate that all cart items have valid products
    for (const item of cart) {
      const productExists = products.find(p => p.product_id == item.product_id);
      if (!productExists) {
        toast.error(`Product ${item.product_name} is no longer available`);
        return;
      }
    }

    // Calculate change
    const changeAmount = paymentForm.amount - calculateTotal;

    // Get unique categories from cart items for the notes
    const cartCategories = [...new Set(cart.map(item => {
      const product = products.find(p => p.product_id == item.product_id);
      return product?.category?.category_name || 'Other';
    }))];
    const categoryNames = cartCategories.join(', ');

    // Prepare order data
    const orderData = {
      customer_name: customer.name || 'Walk-in Customer',
      notes: `POS Transaction - Categories: ${categoryNames} - Payment: ${paymentForm.payment_method} ₱${paymentForm.amount} (Change: ₱${changeAmount.toFixed(2)}) - ${new Date().toLocaleString()}`,
      order_items: cart.map(item => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.price),
        notes: null
      })),
      payment: {
        payment_method: paymentForm.payment_method,
        amount: paymentForm.amount,
        reference_number: paymentForm.reference_number || null,
        notes: `POS Payment - Change: ₱${changeAmount.toFixed(2)}`
      }
    };

    // Save cart data before clearing
    const cartSnapshot = [...cart];
    const customerSnapshot = { ...customer };
    const totalSnapshot = calculateTotal;
    const changeSnapshot = changeAmount;
    const paymentMethodSnapshot = paymentForm.payment_method;
    const paymentAmountSnapshot = paymentForm.amount;

    // Generate temporary order number for INSTANT receipt display
    const tempOrderNumber = 'ORD-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4);

    // SHOW RECEIPT IMMEDIATELY with temp order number
    const tempReceipt = {
      id: tempOrderNumber,
      order_id: null,
      date: new Date().toLocaleString(),
      customer: customerSnapshot.name || 'Walk-in Customer',
      items: cartSnapshot,
      total: totalSnapshot,
      paymentMethod: paymentMethodSnapshot,
      paymentAmount: paymentAmountSnapshot,
      change: changeSnapshot,
      isTemp: true // Flag to show it's processing
    };

    // Close payment modal and show receipt INSTANTLY (0ms)
    setPaymentModal(false);
    setReceiptData(tempReceipt);
    setShowReceipt(true);
    
    // Reset form immediately (instant UI response)
    setPaymentForm({ payment_method: 'Cash', amount: 0, reference_number: '' });
    setCart([]);
    setCustomer({ name: '', contact: '' });

    // Then submit order in background and update receipt with real ID
    createOrderMutation.mutate(orderData, {
      onSuccess: (response) => {
        // Extract order data from response
        const orderData = response.data || response;
        
        // Update receipt with REAL order number (seamless transition)
        const finalReceipt = {
          ...tempReceipt,
          id: orderData.order_number || tempOrderNumber,
          order_id: orderData.order_id,
          isTemp: false
        };
        
        // Update receipt with real data (user already sees it)
        setReceiptData(finalReceipt);
        
        // DON'T force refresh - let 1-second background refetch handle it naturally
        // This prevents stock from flickering back to old values
        // The background refetch will show updated stock within 1 second automatically
      },
      onError: (error) => {
        // Hide receipt and show error
        setShowReceipt(false);
        toast.error('Order failed: ' + (error.response?.data?.message || error.message));
      }
    });
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
      {/* NO LoadingBar - instant POS updates from cache */}
      {/* Top bar - matching sidebar styling */}
      <div className="mb-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              MinSU Business Center
            </h2>
            <p className="text-xs text-slate-400">Point of Sale (Real-time updates)</p>
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
          <div className="text-2xl font-bold text-slate-900">₱{calculateTotal.toFixed(2)}</div>
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
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
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
              
              {/* Barcode Scanner Input */}
              <div className="relative">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="Scan barcode or type product ID..."
                  onKeyDown={handleBarcodeScan}
                  className="w-full pl-10 pr-4 py-2 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 focus:outline-none text-slate-900 bg-cyan-50"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
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

            {/* Product Grid - NO LOADING STATE, instant from cache */}
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
                        src={product.product_image || product.image || '/api/placeholder/100/100'} 
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
                          Stock: {getAvailableStock(product.product_id)}
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
                        disabled={getAvailableStock(product.product_id) <= 0}
                        className={`p-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                          getAvailableStock(product.product_id) <= 0
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
                    {item.product_image && (
                      <img src={item.product_image} alt={item.product_name || item.name} className="w-10 h-10 object-cover rounded mr-3" />
                    )}
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
                        ref={(el) => quantityInputRefs.current[item.product_id] = el}
                        type="number"
                        min="1"
                        value={item.quantity}
                        className="quantity-input w-12 text-center font-semibold border border-slate-300 rounded px-1 py-0.5 focus:border-cyan-500 focus:outline-none text-sm"
                        data-product-id={item.product_id}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 1) {
                            updateQuantity(item.product_id, value);
                          }
                        }}
                        onBlur={(e) => {
                          // If empty or invalid on blur, revert to 1
                          const value = parseInt(e.target.value);
                          if (isNaN(value) || value < 1) {
                            updateQuantity(item.product_id, 1);
                          }
                        }}
                      />
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        disabled={item.quantity >= getInventoryQuantity(item.product_id)}
                        className={`p-1 rounded ${
                          item.quantity >= getInventoryQuantity(item.product_id)
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
                  <span className="text-cyan-600">₱{calculateTotal.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Quick Action */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-600" />
              Payment
            </h3>
            <div className="space-y-4">
              <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-700">Cart Total:</span>
                  <span className="text-2xl font-bold text-cyan-600">₱{calculateTotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-slate-500">Click Process Payment to select payment method</p>
              </div>
              
              <button
                onClick={handleOpenPaymentModal}
                disabled={cart.length === 0}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Process Payment (Ctrl+Enter)
              </button>
              
              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="font-semibold text-slate-700 mb-2">⌨️ Keyboard Shortcuts:</p>
                <p><kbd className="px-1.5 py-0.5 bg-white rounded text-xs font-mono border">Scan + Enter</kbd> Add to cart (works anywhere!)</p>
                <p><kbd className="px-1.5 py-0.5 bg-white rounded text-xs font-mono border">Ctrl+B</kbd> Focus scanner</p>
                <p><kbd className="px-1.5 py-0.5 bg-white rounded text-xs font-mono border">Ctrl+↓/↑</kbd> Navigate cart items</p>
                <p><kbd className="px-1.5 py-0.5 bg-white rounded text-xs font-mono border">Ctrl+Q</kbd> Focus quantity</p>
                <p><kbd className="px-1.5 py-0.5 bg-white rounded text-xs font-mono border">Ctrl+Enter</kbd> Process payment</p>
              </div>
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
                onClick={() => {
                  setShowReceipt(false);
                  // Refocus scanner after closing receipt
                  setTimeout(() => {
                    if (barcodeInputRef.current) {
                      barcodeInputRef.current.focus();
                    }
                  }, 100);
                }}
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
                  {receiptData.items.map((item, index) => (
                    <div key={`receipt-item-${item.product_id}-${index}`} className="flex justify-between text-sm">
                      <span>{item.name || item.product_name} x{item.quantity}</span>
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

      {/* Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Process Payment</h2>
                  <p className="text-cyan-100 text-sm">Total: ₱{calculateTotal.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => {
                    setPaymentModal(false);
                    // Refocus scanner when closing modal
                    setTimeout(() => {
                      if (barcodeInputRef.current) {
                        barcodeInputRef.current.focus();
                      }
                    }, 100);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                processPayment();
              }}
              className="p-6 space-y-4"
            >
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

              {/* Total Amount (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Total Amount
                </label>
                <input
                  type="text"
                  value={`₱${calculateTotal.toFixed(2)}`}
                  readOnly
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl text-slate-900 bg-slate-50 cursor-not-allowed font-bold text-lg"
                />
              </div>

              {/* Amount Paid */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Amount Paid <span className="text-red-500">*</span>
                </label>
                <input
                  ref={amountInputRef}
                  type="number"
                  step="0.01"
                  value={paymentForm.amount || ''}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none text-slate-900 bg-white"
                  placeholder="Enter amount"
                  required
                />
                {paymentForm.amount > calculateTotal && (
                  <p className="text-sm text-amber-600 mt-2">
                    Change: ₱{(paymentForm.amount - calculateTotal).toFixed(2)}
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
                    required={paymentForm.payment_method === 'GCash'}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentModal(false);
                    // Refocus scanner when canceling
                    setTimeout(() => {
                      if (barcodeInputRef.current) {
                        barcodeInputRef.current.focus();
                      }
                    }, 100);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Complete Payment
                </button>
              </div>
              
              <p className="text-xs text-slate-500 text-center">
                Press <kbd className="px-2 py-1 bg-slate-200 rounded text-xs font-mono">Enter</kbd> to submit
              </p>
            </form>
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