/**
 * RENTAL PROPERTY MANAGEMENT SYSTEM
 * 
 * Purpose: Manage school properties rented to external entities (canteen operators, 
 * boarding house owners, photocopy centers, bookstores, parking spaces, etc.)
 * 
 * System Architecture:
 * ==================
 * 
 * 5 Main Modules (Tabs):
 * 
 * 1. PROPERTIES - Manage all rentable spaces
 *    - Track location, size, monthly rate
 *    - Status: Occupied, Vacant, Under Maintenance
 *    - View which tenant is currently renting
 *    - Example: School Canteen (150 sqm, ₱15,000/month)
 * 
 * 2. TENANTS - Manage renters/lessees
 *    - Personal & business information
 *    - Contact details (phone, email)
 *    - Track security deposits paid
 *    - View rental history and contract status
 *    - Example: Maria Santos (Santos Canteen Services)
 * 
 * 3. CONTRACTS - Manage lease agreements
 *    - Contract duration (start/end dates)
 *    - Monthly rent amount & security deposit
 *    - Payment due dates & terms
 *    - Auto-alerts: 60 days before expiration
 *    - Status: Active, Expired, Terminated
 *    - Example: RNT-2025-001 (1 year contract)
 * 
 * 4. PAYMENTS - Track rental payments
 *    - Monthly rent collection
 *    - Payment methods (Cash, Bank, GCash)
 *    - Status: Paid, Pending, Overdue
 *    - Late fee calculation (5% default)
 *    - Payment history and receipts
 *    - Example: November 2025 rent - ₱15,000 (Paid)
 * 
 * 5. MAINTENANCE - Manage repair requests
 *    - Tenants report issues (leaks, broken locks, AC problems)
 *    - Priority levels: Low, Medium, High, Critical
 *    - Status: Pending, In Progress, Completed
 *    - Assign to maintenance staff
 *    - Track repair costs
 *    - Example: Leaking faucet (Medium priority, In Progress)
 * 
 * Key Features:
 * =============
 * ✅ Tab-based navigation (Properties, Tenants, Contracts, Payments, Maintenance)
 * ✅ Search across all data
 * ✅ Filter by status
 * ✅ Pagination for large datasets
 * ✅ Mobile responsive (cards on mobile, tables on desktop)
 * ✅ Real-time statistics dashboard
 * ✅ Table-only reload (no full page refresh when switching tabs)
 * ✅ Loading indicators during data fetch
 * 
 * Performance Optimization:
 * ========================
 * - Initial load: Fetches all data once (fetchAllData)
 * - Tab switches: Only shows loading on table area (fetchTableData)
 * - Statistics cards remain static during tab changes
 * - No full page refresh when clicking tabs or buttons
 * 
 * Data Flow:
 * ==========
 * 1. Page loads → fetchAllData() runs once → sets all mock data
 * 2. User clicks tab → fetchTableData() shows spinner on table only
 * 3. Data already in state → just re-render with different data
 * 4. Search/Filter → instant client-side filtering (no API call)
 * 
 * Current State: FRONTEND COMPLETE with mock data
 * Next Steps: Connect to Laravel backend API (rentalsAPI)
 */

import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  FileText,
  DollarSign,
  Wrench,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { rentalsAPI } from '../services/api';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const Rentals = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('properties'); // 'properties', 'tenants', 'contracts', 'payments', 'maintenance'
  const [loading, setLoading] = useState(true); // Initial page load
  const [tableLoading, setTableLoading] = useState(false); // Table reload only
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Data States
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);

  // Modal States
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  
  // View Details Modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsType, setDetailsType] = useState(''); // 'property', 'tenant', 'contract', 'payment', 'maintenance'
  
  const [editingItem, setEditingItem] = useState(null);

  // Edit Property Modal State
  const [showEditPropertyModal, setShowEditPropertyModal] = useState(false);

  // Delete Property Modal State
  const [showDeletePropertyModal, setShowDeletePropertyModal] = useState(false);

  // Edit Tenant Modal State
  const [showEditTenantModal, setShowEditTenantModal] = useState(false);

  // Delete Tenant Modal State
  const [showDeleteTenantModal, setShowDeleteTenantModal] = useState(false);

  // Edit Contract Modal State
  const [showEditContractModal, setShowEditContractModal] = useState(false);

  // Delete Contract Modal State
  const [showDeleteContractModal, setShowDeleteContractModal] = useState(false);

  // Edit Payment Modal State
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);

  // Delete Payment Modal State
  const [showDeletePaymentModal, setShowDeletePaymentModal] = useState(false);

  // Edit Maintenance Modal State
  const [showEditMaintenanceModal, setShowEditMaintenanceModal] = useState(false);

  // Delete Maintenance Modal State
  const [showDeleteMaintenanceModal, setShowDeleteMaintenanceModal] = useState(false);

  // Form filtering states
  const [selectedContractProperty, setSelectedContractProperty] = useState('');
  const [selectedContractTenant, setSelectedContractTenant] = useState('');
  const [selectedPaymentTenant, setSelectedPaymentTenant] = useState('');
  const [selectedPaymentProperty, setSelectedPaymentProperty] = useState('');

  // Handle view details
  const handleViewDetails = (item, type) => {
    setSelectedItem(item);
    setDetailsType(type);
    setShowDetailsModal(true);
  };

  // Reset form states when modals close
  useEffect(() => {
    if (!showContractModal) {
      setSelectedContractProperty('');
      setSelectedContractTenant('');
    }
  }, [showContractModal]);

  useEffect(() => {
    if (!showPaymentModal) {
      setSelectedPaymentTenant('');
      setSelectedPaymentProperty('');
    }
  }, [showPaymentModal]);

  // Initial load - fetch all data once
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch all data (charts + table) - only on initial load
  const fetchAllData = async () => {
    console.log('Starting fetchAllData...');
    setLoading(true);
    try {
      // Fetch all data from API
      console.log('Making API calls...');
      const [propertiesRes, tenantsRes, contractsRes, paymentsRes, maintenanceRes] = await Promise.all([
        rentalsAPI.getProperties(),
        rentalsAPI.getTenants(),
        rentalsAPI.getContracts(),
        rentalsAPI.getPayments(),
        rentalsAPI.getMaintenanceRequests()
      ]);

      console.log('API calls completed:', {
        properties: propertiesRes.data?.length || 0,
        tenants: tenantsRes.data?.length || 0,
        contracts: contractsRes.data?.length || 0,
        payments: paymentsRes.data?.length || 0,
        maintenance: maintenanceRes.data?.length || 0
      });

      setProperties(propertiesRes.data || []);
      setTenants(tenantsRes.data || []);
      setContracts(contractsRes.data || []);
      setPayments(paymentsRes.data || []);
      setMaintenanceRequests(maintenanceRes.data || []);
      
      console.log('Data set successfully');
    } catch (error) {
      console.error('Error fetching rental data:', error);
      toast.error('Failed to load rental data from API. Using demo data.');
      
      // Fallback to demo data
      setProperties([
        { id: 1, name: 'School Canteen', type: 'Commercial', location: 'Ground Floor', size: '150 sqm', monthlyRate: 15000, status: 'Occupied', tenant: 'Maria Santos', contractEnd: '2025-12-31' },
        { id: 2, name: 'Photocopy Center', type: 'Commercial', location: '2nd Floor', size: '50 sqm', monthlyRate: 8000, status: 'Occupied', tenant: 'Juan dela Cruz', contractEnd: '2025-10-15' },
        { id: 3, name: 'Bookstore', type: 'Commercial', location: '3rd Floor', size: '80 sqm', monthlyRate: 12000, status: 'Vacant', tenant: null, contractEnd: null },
        { id: 4, name: 'Parking Space A', type: 'Commercial', location: 'Basement', size: '20 sqm', monthlyRate: 3000, status: 'Occupied', tenant: 'Pedro Garcia', contractEnd: '2025-11-30' },
        { id: 5, name: 'Boarding House', type: 'Residential', location: 'Annex Building', size: '200 sqm', monthlyRate: 25000, status: 'Under Maintenance', tenant: null, contractEnd: null }
      ]);
      
      setTenants([
        { id: 1, name: 'Maria Santos', businessName: 'Santos Canteen Services', contactNumber: '09123456789', email: 'maria@santos.com', propertyRented: 'School Canteen', contractStatus: 'Active', depositPaid: 15000, lastPayment: '2025-11-01' },
        { id: 2, name: 'Juan dela Cruz', businessName: 'Juan Photocopy', contactNumber: '09198765432', email: 'juan@photocopy.com', propertyRented: 'Photocopy Center', contractStatus: 'Active', depositPaid: 8000, lastPayment: '2025-11-01' },
        { id: 3, name: 'Pedro Garcia', businessName: 'Garcia Parking', contactNumber: '09234567890', email: 'pedro@garcia.com', propertyRented: 'Parking Space A', contractStatus: 'Active', depositPaid: 3000, lastPayment: '2025-10-15' }
      ]);
      
      setContracts([
        { id: 1, property: 'School Canteen', tenant: 'Maria Santos', startDate: '2025-01-01', endDate: '2025-12-31', monthlyRent: 15000, deposit: 15000, status: 'Active' },
        { id: 2, property: 'Photocopy Center', tenant: 'Juan dela Cruz', startDate: '2025-01-01', endDate: '2025-12-31', monthlyRent: 8000, deposit: 8000, status: 'Active' },
        { id: 3, property: 'Parking Space A', tenant: 'Pedro Garcia', startDate: '2025-01-01', endDate: '2025-12-31', monthlyRent: 3000, deposit: 3000, status: 'Active' }
      ]);
      
      setPayments([
        { id: 1, tenant: 'Maria Santos', property: 'School Canteen', amount: 15000, dueDate: '2025-11-01', paymentDate: '2025-11-01', status: 'Paid', method: 'Bank Transfer' },
        { id: 2, tenant: 'Juan dela Cruz', property: 'Photocopy Center', amount: 8000, dueDate: '2025-11-01', paymentDate: '2025-11-01', status: 'Paid', method: 'GCash' },
        { id: 3, tenant: 'Pedro Garcia', property: 'Parking Space A', amount: 3000, dueDate: '2025-11-01', paymentDate: null, status: 'Pending', method: null }
      ]);
      
      setMaintenanceRequests([
        { id: 1, requestNumber: 'MNT-2025-001', property: 'Boarding House', tenant: 'N/A', description: 'Leaking roof in room 5', priority: 'High', status: 'Pending', requestDate: '2025-11-01', assignedTo: null },
        { id: 2, requestNumber: 'MNT-2025-002', property: 'School Canteen', tenant: 'Maria Santos', description: 'Air conditioning not working', priority: 'Medium', status: 'In Progress', requestDate: '2025-10-28', assignedTo: 'Maintenance Team' }
      ]);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  // Fetch only table data - for tab changes (no loading screen, just table update)
  const fetchTableData = async () => {
    setTableLoading(true);
    try {
      // Fetch data based on active tab
      switch (activeTab) {
        case 'properties':
          const propertiesRes = await rentalsAPI.getProperties();
          setProperties(propertiesRes.data);
          break;
        case 'tenants':
          const tenantsRes = await rentalsAPI.getTenants();
          setTenants(tenantsRes.data);
          break;
        case 'contracts':
          const contractsRes = await rentalsAPI.getContracts();
          setContracts(contractsRes.data);
          break;
        case 'payments':
          const paymentsRes = await rentalsAPI.getPayments();
          setPayments(paymentsRes.data);
          break;
        case 'maintenance':
          const maintenanceRes = await rentalsAPI.getMaintenanceRequests();
          setMaintenanceRequests(maintenanceRes.data);
          break;
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
      toast.error('Failed to load data');
    } finally {
      setTableLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'occupied':
      case 'active':
      case 'paid':
      case 'completed':
        return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'vacant':
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'expired':
      case 'overdue':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'in progress':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-teal-100 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Calculate statistics
  const stats = {
    totalProperties: properties.length,
    occupiedProperties: properties.filter(p => p.status === 'Occupied').length,
    vacantProperties: properties.filter(p => p.status === 'Vacant').length,
    totalTenants: tenants.length,
    activeContracts: contracts.filter(c => c.status === 'Active').length,
    monthlyRevenue: properties
      .filter(p => p.status === 'Occupied')
      .reduce((sum, p) => sum + (parseFloat(p.monthlyRate) || 0), 0),
    pendingPayments: payments.filter(p => p.status === 'Pending').length,
    pendingMaintenance: maintenanceRequests.filter(m => m.status === 'Pending').length
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'properties':
        return properties;
      case 'tenants':
        return tenants;
      case 'contracts':
        return contracts;
      case 'payments':
        return payments;
      case 'maintenance':
        return maintenanceRequests;
      default:
        return [];
    }
  };

  // Filter and search data
  const getFilteredData = () => {
    let data = getCurrentData();

    // Apply search
    if (searchTerm) {
      data = data.filter(item => 
        Object.values(item).some(val => 
          val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply status filter
    if (filterStatus !== 'All') {
      data = data.filter(item => item.status === filterStatus);
    }

    return data;
  };

  // Pagination
  const getPaginatedData = () => {
    const filtered = getFilteredData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil(getFilteredData().length / itemsPerPage);

  // ==================== CRUD HANDLERS ====================

  // Property CRUD Handlers
  const handleCreateProperty = async (formData) => {
    try {
      await rentalsAPI.createProperty(formData);
      toast.success('Property created successfully!');
      setShowPropertyModal(false);
      fetchTableData(); // Only reload the table
    } catch (error) {
      console.error('Error creating property:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create property';
      toast.error(errorMessage);
    }
  };

  const handleEditProperty = async (formData) => {
    try {
      await rentalsAPI.updateProperty(editingItem.id, formData);
      toast.success('Property updated successfully!');
      setShowEditPropertyModal(false);
      setEditingItem(null);
      fetchTableData(); // Only reload the table
    } catch (error) {
      console.error('Error updating property:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update property';
      toast.error(errorMessage);
    }
  };

  const handleDeleteProperty = async () => {
    try {
      await rentalsAPI.deleteProperty(editingItem.id);
      toast.success('Property deleted successfully!');
      setShowDeletePropertyModal(false);
      setEditingItem(null);
      fetchTableData(); // Only reload the table
    } catch (error) {
      console.error('Error deleting property:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete property';
      toast.error(errorMessage);
    }
  };

  // Tenant CRUD Handlers
  const handleCreateTenant = async (formData) => {
    try {
      console.log('Creating tenant with data:', formData);
      await rentalsAPI.createTenant(formData);
      toast.success('Tenant created successfully!');
      setShowTenantModal(false);
      fetchTableData(); // Only reload the table
    } catch (error) {
      console.error('Error creating tenant:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to create tenant';
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach(err => toast.error(err[0]));
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleEditTenant = async (formData) => {
    try {
      await rentalsAPI.updateTenant(editingItem.id, formData);
      toast.success('Tenant updated successfully!');
      setShowEditTenantModal(false);
      setEditingItem(null);
      fetchTableData(); // Only reload the table
    } catch (error) {
      console.error('Error updating tenant:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update tenant';
      toast.error(errorMessage);
    }
  };

  const handleDeleteTenant = async () => {
    try {
      await rentalsAPI.deleteTenant(editingItem.id);
      toast.success('Tenant deleted successfully!');
      setShowDeleteTenantModal(false);
      setEditingItem(null);
      fetchTableData(); // Only reload the table
    } catch (error) {
      console.error('Error deleting tenant:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete tenant';
      toast.error(errorMessage);
    }
  };

  // Contract CRUD Handlers
  const handleCreateContract = async (formData) => {
    try {
      console.log('Sending contract data:', formData);
      await rentalsAPI.createContract(formData);
      toast.success('Contract created successfully!');
      setShowContractModal(false);
      fetchTableData(); // Only reload the table
    } catch (error) {
      console.error('Error creating contract:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to create contract';
      toast.error(errorMessage);
    }
  };

  const handleEditContract = async (formData) => {
    try {
      await rentalsAPI.updateContract(editingItem.id, formData);
      toast.success('Contract updated successfully!');
      setShowEditContractModal(false);
      setEditingItem(null);
      fetchTableData(); // Only reload the table
    } catch (error) {
      console.error('Error updating contract:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update contract';
      toast.error(errorMessage);
    }
  };

  const handleDeleteContract = async () => {
    try {
      await rentalsAPI.deleteContract(editingItem.id);
      toast.success('Contract deleted successfully!');
      setShowDeleteContractModal(false);
      setEditingItem(null);
      fetchTableData(); // Only reload the table
    } catch (error) {
      console.error('Error deleting contract:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete contract';
      toast.error(errorMessage);
    }
  };

  // Payment CRUD Handlers
  const handleCreatePayment = async (formData) => {
    try {
      await rentalsAPI.createPayment(formData);
      toast.success('Payment created successfully!');
      setShowPaymentModal(false);
      fetchTableData(); // Only reload the table
    } catch (error) {
      console.error('Error creating payment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create payment';
      toast.error(errorMessage);
    }
  };

  const handleEditPayment = async (formData) => {
    try {
      await rentalsAPI.updatePayment(editingItem.id, formData);
      toast.success('Payment updated successfully!');
      setShowEditPaymentModal(false);
      setEditingItem(null);
      fetchTableData(); // Only reload the table
    } catch (error) {
      console.error('Error updating payment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update payment';
      toast.error(errorMessage);
    }
  };

  const handleDeletePayment = async () => {
    try {
      await rentalsAPI.deletePayment(editingItem.id);
      toast.success('Payment deleted successfully!');
      setShowDeletePaymentModal(false);
      setEditingItem(null);
      fetchTableData(); // Only reload the table
    } catch (error) {
      console.error('Error deleting payment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete payment';
      toast.error(errorMessage);
    }
  };

  // Maintenance CRUD Handlers
  const handleCreateMaintenance = async (formData) => {
    try {
      await rentalsAPI.createMaintenanceRequest(formData);
      toast.success('Maintenance request created successfully!');
      setShowMaintenanceModal(false);
      fetchTableData(); // Only reload the table
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create maintenance request';
      toast.error(errorMessage);
    }
  };

  const handleEditMaintenance = async (formData) => {
    try {
      await rentalsAPI.updateMaintenanceRequest(editingItem.id, formData);
      toast.success('Maintenance request updated successfully!');
      setShowEditMaintenanceModal(false);
      setEditingItem(null);
      fetchTableData(); // Only reload the table
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update maintenance request';
      toast.error(errorMessage);
    }
  };

  const handleDeleteMaintenance = async () => {
    try {
      await rentalsAPI.deleteMaintenanceRequest(editingItem.id);
      toast.success('Maintenance request deleted successfully!');
      setShowDeleteMaintenanceModal(false);
      setEditingItem(null);
      fetchTableData(); // Only reload the table
    } catch (error) {
      console.error('Error deleting maintenance request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete maintenance request';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading rental data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/20 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-800 to-teal-900 bg-clip-text text-transparent mb-2">
          Rental Property Management
        </h1>
        <p className="text-slate-600">Manage school properties, tenants, contracts, and rental payments</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-cyan-200">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-8 h-8 text-cyan-600" />
            <span className="text-sm font-semibold text-cyan-700">Properties</span>
          </div>
          <div className="text-3xl font-bold text-cyan-900">{stats.totalProperties}</div>
          <div className="text-sm text-slate-500 mt-1">
            {stats.occupiedProperties} Occupied • {stats.vacantProperties} Vacant
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-teal-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-teal-600" />
            <span className="text-sm font-semibold text-teal-700">Tenants</span>
          </div>
          <div className="text-3xl font-bold text-teal-900">{stats.totalTenants}</div>
          <div className="text-sm text-slate-500 mt-1">
            {stats.activeContracts} Active Contracts
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-600 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8" />
            <span className="text-sm font-semibold">Monthly Revenue</span>
          </div>
          <div className="text-3xl font-bold">₱{stats.monthlyRevenue.toLocaleString()}</div>
          <div className="text-sm opacity-90 mt-1">From {stats.occupiedProperties} properties</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">Pending</span>
          </div>
          <div className="text-3xl font-bold text-amber-900">{stats.pendingPayments + stats.pendingMaintenance}</div>
          <div className="text-sm text-slate-500 mt-1">
            {stats.pendingPayments} Payments • {stats.pendingMaintenance} Maintenance
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 border border-slate-100">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setActiveTab('properties');
              setCurrentPage(1);
              setFilterStatus('All');
              fetchTableData(); // Only reload table, not whole page
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'properties'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-5 h-5" />
            Properties ({properties.length})
          </button>
          
          <button
            onClick={() => {
              setActiveTab('tenants');
              setCurrentPage(1);
              setFilterStatus('All');
              fetchTableData(); // Only reload table, not whole page
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'tenants'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-5 h-5" />
            Tenants ({tenants.length})
          </button>
          
          <button
            onClick={() => {
              setActiveTab('contracts');
              setCurrentPage(1);
              setFilterStatus('All');
              fetchTableData(); // Only reload table, not whole page
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'contracts'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-5 h-5" />
            Contracts ({contracts.length})
          </button>
          
          <button
            onClick={() => {
              setActiveTab('payments');
              setCurrentPage(1);
              setFilterStatus('All');
              fetchTableData(); // Only reload table, not whole page
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'payments'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            Payments ({payments.length})
          </button>
          
          <button
            onClick={() => {
              setActiveTab('maintenance');
              setCurrentPage(1);
              setFilterStatus('All');
              fetchTableData(); // Only reload table, not whole page
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'maintenance'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-5 h-5" />
            Maintenance ({maintenanceRequests.length})
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              {activeTab === 'properties' && (
                <>
                  <option value="Occupied">Occupied</option>
                  <option value="Vacant">Vacant</option>
                </>
              )}
              {activeTab === 'contracts' && (
                <>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                </>
              )}
              {activeTab === 'payments' && (
                <>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </>
              )}
              {activeTab === 'maintenance' && (
                <>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </>
              )}
            </select>
          </div>

          {/* Add Button */}
          <button
            onClick={() => {
              if (activeTab === 'properties') setShowPropertyModal(true);
              else if (activeTab === 'tenants') setShowTenantModal(true);
              else if (activeTab === 'contracts') setShowContractModal(true);
              else if (activeTab === 'payments') setShowPaymentModal(true);
              else if (activeTab === 'maintenance') setShowMaintenanceModal(true);
            }}
            className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add {activeTab === 'properties' ? 'Property' : activeTab === 'tenants' ? 'Tenant' : activeTab === 'contracts' ? 'Contract' : activeTab === 'payments' ? 'Payment' : 'Maintenance Request'}
          </button>
        </div>
      </div>


      {/* Table Loading Indicator */}
      {tableLoading && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 mb-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              <span className="text-slate-600 font-medium">Updating {activeTab}...</span>
            </div>
          </div>
        </div>
      )}

      {/* ADD PROPERTY MODAL (UNIFIED DESIGN) */}
      {showPropertyModal && (
        <Modal
          isOpen={showPropertyModal}
          onClose={() => setShowPropertyModal(false)}
          title="Add Property"
          subtitle="Enter property details below"
          icon={<Building2 className="w-6 h-6" />}
          size="md"
        >
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const propertyData = {
              name: formData.get('name'),
              type: formData.get('type'),
              location: formData.get('location'),
              size: formData.get('size'),
              monthly_rate: formData.get('monthly_rate'),
              status: formData.get('status')
            };
            handleCreateProperty(propertyData);
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property Name</label>
                <input name="name" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select name="type" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required>
                  <option value="Commercial">Commercial</option>
                  <option value="Residential">Residential</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input name="location" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Size (sqm)</label>
                <input name="size" type="number" min="1" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Rate (₱)</label>
                <input name="monthly_rate" type="number" min="0" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select name="status" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required>
                  <option value="Occupied">Occupied</option>
                  <option value="Vacant">Vacant</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={() => setShowPropertyModal(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">Add Property</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ADD TENANT MODAL (UNIFIED DESIGN) */}
      {showTenantModal && (
        <Modal
          isOpen={showTenantModal}
          onClose={() => setShowTenantModal(false)}
          title="Add Tenant"
          subtitle="Enter tenant details below"
          icon={<Users className="w-6 h-6" />}
          size="md"
        >
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const tenantData = {
              name: formData.get('name'),
              business_name: formData.get('business_name'),
              email: formData.get('email'),
              contact_number: formData.get('contact_number'),
              property_rented_id: formData.get('property_rented_id'),
              contract_status: formData.get('contract_status'),
              deposit_paid: formData.get('deposit_paid')
            };
            handleCreateTenant(tenantData);
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input name="name" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                <input name="business_name" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input name="email" type="email" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                <input name="contact_number" type="tel" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assign Property (Optional)</label>
                <select name="property_rented_id" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500">
                  <option value="">Select Available Property</option>
                  {properties
                    .filter(property => {
                      // Show only properties without active contracts (vacant/available)
                      return !contracts.some(c => 
                        c.propertyId == property.id && 
                        c.status === 'Active'
                      );
                    })
                    .map(property => (
                      <option key={property.id} value={property.id}>{property.name} - {property.location}</option>
                    ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Assign this tenant to an available property (optional)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Security Deposit (₱)</label>
                <input name="deposit_paid" type="number" min="0" step="0.01" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contract Status</label>
                <select name="contract_status" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={() => setShowTenantModal(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">Add Tenant</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ADD CONTRACT MODAL (UNIFIED DESIGN) */}
      {showContractModal && (
        <Modal
          isOpen={showContractModal}
          onClose={() => {
            setShowContractModal(false);
            console.log('Contract modal closed - Contracts data:', contracts);
          }}
          title="Add Contract"
          subtitle="Enter contract details below"
          icon={<FileText className="w-6 h-6" />}
          size="md"
        >
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const contractData = {
              contract_number: formData.get('contract_number'),
              property_id: formData.get('property_id'),
              tenant_id: formData.get('tenant_id'),
              start_date: formData.get('start_date'),
              end_date: formData.get('end_date'),
              monthly_rent: formData.get('monthly_rent'),
              deposit: formData.get('deposit'),
              status: formData.get('status')
            };
            handleCreateContract(contractData);
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contract Number</label>
                <input name="contract_number" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tenant</label>
                <select 
                  name="tenant_id" 
                  value={selectedContractTenant}
                  onChange={(e) => setSelectedContractTenant(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" 
                  required
                >
                  <option value="">Select Tenant</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property</label>
                <select 
                  name="property_id" 
                  value={selectedContractProperty}
                  onChange={(e) => setSelectedContractProperty(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" 
                  required
                >
                  <option value="">Select Property</option>
                  {properties
                    .filter(property => {
                      // Show only VACANT properties (no active contracts)
                      // A property can only be rented to ONE tenant at a time
                      const hasActiveContract = contracts.some(c => 
                        c.propertyId == property.id && 
                        c.status === 'Active'
                      );
                      console.log(`Property ${property.name} (ID: ${property.id}) - Has Active Contract: ${hasActiveContract}`);
                      return !hasActiveContract;
                    })
                    .map(property => (
                      <option key={property.id} value={property.id}>{property.name} - {property.location}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input name="start_date" type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <input name="end_date" type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Rent (₱)</label>
                <input name="monthly_rent" type="number" min="0" step="0.01" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Security Deposit (₱)</label>
                <input name="deposit" type="number" min="0" step="0.01" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select name="status" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={() => setShowContractModal(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">Add Contract</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ADD PAYMENT MODAL (UNIFIED DESIGN) */}
      {showPaymentModal && (
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Add Payment"
          subtitle="Enter payment details below"
          icon={<DollarSign className="w-6 h-6" />}
          size="md"
        >
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const paymentData = {
              tenant_id: formData.get('tenant_id'),
              property_id: formData.get('property_id'),
              amount: formData.get('amount'),
              month: formData.get('month'),
              method: formData.get('method'),
              payment_date: formData.get('payment_date'),
              status: formData.get('status')
            };
            handleCreatePayment(paymentData);
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Number (Auto-generated)</label>
                <input name="payment_number" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-100 text-slate-500 cursor-not-allowed" placeholder="Auto-generated" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tenant</label>
                <select 
                  name="tenant_id" 
                  value={selectedPaymentTenant}
                  onChange={(e) => setSelectedPaymentTenant(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" 
                  required
                >
                  <option value="">Select Tenant</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property</label>
                <select 
                  name="property_id" 
                  value={selectedPaymentProperty}
                  onChange={(e) => setSelectedPaymentProperty(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" 
                  required
                >
                  <option value="">Select Property</option>
                  {properties
                    .filter(property => {
                      if (!selectedPaymentTenant) return true; // Show all if no tenant selected
                      
                      // Show properties that the tenant is currently renting (active contracts)
                      return contracts.some(c => 
                        c.propertyId == property.id && 
                        c.tenantId == selectedPaymentTenant && 
                        c.status === 'Active'
                      );
                    })
                    .map(property => (
                      <option key={property.id} value={property.id}>{property.name} - {property.location}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₱)</label>
                <input name="amount" type="number" min="0" step="0.01" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Month Covered</label>
                <input name="month" type="text" placeholder="e.g., November 2025" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                <select name="method" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="GCash">GCash</option>
                  <option value="Check">Check</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
                <input 
                  name="payment_date" 
                  type="date" 
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select name="status" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">Add Payment</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ADD MAINTENANCE MODAL (UNIFIED DESIGN) */}
      {showMaintenanceModal && (
        <Modal
          isOpen={showMaintenanceModal}
          onClose={() => setShowMaintenanceModal(false)}
          title="Add Maintenance Request"
          subtitle="Enter maintenance request details below"
          icon={<Wrench className="w-6 h-6" />}
          size="md"
        >
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const maintenanceData = {
              property_id: formData.get('property_id'),
              tenant_id: formData.get('tenant_id'),
              issue: formData.get('issue'),
              priority: formData.get('priority'),
              status: formData.get('status'),
              date_reported: formData.get('date_reported'),
              assigned_to: formData.get('assigned_to')
            };
            handleCreateMaintenance(maintenanceData);
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Request Number (Auto-generated)</label>
                <input name="request_number" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-100 text-slate-500 cursor-not-allowed" placeholder="Auto-generated" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property</label>
                <select name="property_id" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required>
                  <option value="">Select Property</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>{property.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tenant</label>
                <select name="tenant_id" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500">
                  <option value="">Select Tenant (if applicable)</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select name="priority" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select name="status" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date Reported</label>
                <input name="date_reported" type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Issue Description</label>
                <textarea name="issue" rows="4" placeholder="Describe the maintenance issue in detail..." className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned To</label>
                <input name="assigned_to" type="text" placeholder="Staff member name" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={() => setShowMaintenanceModal(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">Add Request</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Content Area - Properties Tab */}
      {activeTab === 'properties' && !tableLoading && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Mobile Cards */}
          <div className="block md:hidden">
            {getPaginatedData().map((property) => (
              <div key={property.id} className="p-4 border-b border-slate-100 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg">{property.name}</h3>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border mt-2 ${getStatusColor(property.status)}`}>
                      {property.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{property.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{property.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">Size:</span>
                    <span className="text-slate-700 font-medium">{property.size}</span>
                  </div>
                  {property.tenant && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{property.tenant}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-lg font-bold text-cyan-600">₱{property.monthlyRate.toLocaleString()}/mo</div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewDetails(property, 'property')}
                      className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                      onClick={() => {
                        setEditingItem(property);
                        setShowEditPropertyModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      onClick={() => {
                        setEditingItem(property);
                        setShowDeletePropertyModal(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Monthly Rate</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Tenant</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getPaginatedData().map((property) => (
                  <tr key={property.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{property.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{property.type}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{property.location}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{property.size}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-cyan-600">₱{property.monthlyRate.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(property.status)}`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{property.tenant || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewDetails(property, 'property')}
                          className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => {
                            setEditingItem(property);
                            setShowEditPropertyModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          onClick={() => {
                            setEditingItem(property);
                            setShowDeletePropertyModal(true);
                          }}
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

          {/* Empty State */}
          {getPaginatedData().length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No properties found</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}

      {/* Tenants Tab - Shows all people/businesses renting properties */}
      {activeTab === 'tenants' && !tableLoading && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Mobile Cards */}
          <div className="block md:hidden">
            {getPaginatedData().map((tenant) => (
              <div key={tenant.id} className="p-4 border-b border-slate-100 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg">{tenant.name}</h3>
                    {tenant.businessName && (
                      <p className="text-sm text-slate-600">{tenant.businessName}</p>
                    )}
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border mt-2 ${getStatusColor(tenant.contractStatus)}`}>
                      {tenant.contractStatus}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{tenant.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{tenant.email}</span>
                  </div>
                  {tenant.propertyRented && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{tenant.propertyRented}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-sm">
                    <div className="font-semibold text-cyan-600">₱{tenant.depositPaid.toLocaleString()} deposit</div>
                    <div className="text-slate-500">Last: {tenant.lastPayment}</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewDetails(tenant, 'tenant')}
                      className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                      onClick={() => {
                        setEditingItem(tenant);
                        setShowEditTenantModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      onClick={() => {
                        setEditingItem(tenant);
                        setShowDeleteTenantModal(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Business</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Property</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Deposit</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Last Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getPaginatedData().map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{tenant.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{tenant.businessName}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">{tenant.contactNumber}</div>
                      <div className="text-xs text-slate-400">{tenant.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{tenant.propertyRented || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(tenant.contractStatus)}`}>
                        {tenant.contractStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">₱{tenant.depositPaid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{tenant.lastPayment}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewDetails(tenant, 'tenant')}
                          className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => {
                            setEditingItem(tenant);
                            setShowEditTenantModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          onClick={() => {
                            setEditingItem(tenant);
                            setShowDeleteTenantModal(true);
                          }}
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
          {getPaginatedData().length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No tenants found</p>
            </div>
          )}
        </div>
      )}

      {/* Contracts Tab - Shows all rental agreements */}
      {activeTab === 'contracts' && !tableLoading && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Mobile Cards */}
          <div className="block md:hidden">
            {getPaginatedData().map((contract) => (
              <div key={contract.id} className="p-4 border-b border-slate-100 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg">{contract.contractNumber}</h3>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border mt-2 ${getStatusColor(contract.status)}`}>
                      {contract.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{contract.property}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{contract.tenant}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{contract.startDate} to {contract.endDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-sm">
                    <div className="font-semibold text-cyan-600">₱{contract.monthlyRent.toLocaleString()}/mo</div>
                    <div className="text-slate-500">Deposit: ₱{contract.deposit.toLocaleString()}</div>
                    <div className={`font-semibold ${contract.daysRemaining < 60 ? 'text-amber-600' : 'text-teal-600'}`}>
                      {contract.daysRemaining > 0 ? `${contract.daysRemaining} days left` : 'Expired'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewDetails(contract, 'contract')}
                      className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                      onClick={() => {
                        setEditingItem(contract);
                        setShowEditContractModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      onClick={() => {
                        setEditingItem(contract);
                        setShowDeleteContractModal(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Contract #</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Property</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Tenant</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Period</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Monthly Rent</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Deposit</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Days Left</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getPaginatedData().map((contract) => (
                  <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{contract.contractNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{contract.property}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{contract.tenant}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {contract.startDate} to {contract.endDate}
                    </td>
                    <td className="px-6 py-4 font-semibold text-cyan-600">₱{contract.monthlyRent.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">₱{contract.deposit.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(contract.status)}`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-semibold ${contract.daysRemaining < 60 ? 'text-amber-600' : 'text-teal-600'}`}>
                        {contract.daysRemaining > 0 ? `${contract.daysRemaining} days` : 'Expired'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewDetails(contract, 'contract')}
                          className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => {
                            setEditingItem(contract);
                            setShowEditContractModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          onClick={() => {
                            setEditingItem(contract);
                            setShowDeleteContractModal(true);
                          }}
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
          {getPaginatedData().length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No contracts found</p>
            </div>
          )}
        </div>
      )}

      {/* Payments Tab - Shows all rent payments and billing */}
      {activeTab === 'payments' && !tableLoading && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Mobile Cards */}
          <div className="block md:hidden">
            {getPaginatedData().map((payment) => (
              <div key={payment.id} className="p-4 border-b border-slate-100 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg">{payment.paymentNumber}</h3>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border mt-2 ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{payment.tenant}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{payment.property}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{payment.month}</span>
                  </div>
                  {payment.paymentDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Paid: {payment.paymentDate}</span>
                    </div>
                  )}
                  {payment.method && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{payment.method}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-lg font-bold text-cyan-600">₱{payment.amount.toLocaleString()}</div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewDetails(payment, 'payment')}
                      className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                      onClick={() => {
                        setEditingItem(payment);
                        setShowEditPaymentModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      onClick={() => {
                        setEditingItem(payment);
                        setShowDeletePaymentModal(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {payment.status === 'Pending' && (
                      <button className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Payment #</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Tenant</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Property</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Month</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Payment Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getPaginatedData().map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{payment.paymentNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{payment.tenant}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{payment.property}</td>
                    <td className="px-6 py-4 font-semibold text-cyan-600">₱{payment.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{payment.month}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{payment.paymentDate || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{payment.method || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewDetails(payment, 'payment')}
                          className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => {
                            setEditingItem(payment);
                            setShowEditPaymentModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          onClick={() => {
                            setEditingItem(payment);
                            setShowDeletePaymentModal(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {payment.status === 'Pending' && (
                          <button className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {getPaginatedData().length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No payments found</p>
            </div>
          )}
        </div>
      )}

      {/* Maintenance Tab - Shows all maintenance requests and repairs */}
      {activeTab === 'maintenance' && !tableLoading && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Mobile Cards */}
          <div className="block md:hidden">
            {getPaginatedData().map((request) => (
              <div key={request.id} className="p-4 border-b border-slate-100 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg">{request.requestNumber}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{request.property}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{request.tenant}</span>
                  </div>
                  <div className="text-sm text-slate-600 max-w-xs">
                    <strong>Issue:</strong> {request.issue}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Reported: {request.dateReported}</span>
                  </div>
                  {request.assignedTo && (
                    <div className="flex items-center gap-2 text-sm">
                      <Wrench className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Assigned: {request.assignedTo}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-sm text-slate-500">
                    Maintenance Request
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewDetails(request, 'maintenance')}
                      className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                      onClick={() => {
                        setEditingItem(request);
                        setShowEditMaintenanceModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      onClick={() => {
                        setEditingItem(request);
                        setShowDeleteMaintenanceModal(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Request #</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Property</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Tenant</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Issue</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Date Reported</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Assigned To</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getPaginatedData().map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{request.requestNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{request.property}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{request.tenant}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{request.issue}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{request.dateReported}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{request.assignedTo || 'Unassigned'}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewDetails(request, 'maintenance')}
                          className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => {
                            setEditingItem(request);
                            setShowEditMaintenanceModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          onClick={() => {
                            setEditingItem(request);
                            setShowDeleteMaintenanceModal(true);
                          }}
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
          {getPaginatedData().length === 0 && (
            <div className="text-center py-12">
              <Wrench className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No maintenance requests found</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination - Shows for all tabs */}
      {getPaginatedData().length > 0 && !tableLoading && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={getFilteredData().length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(newValue) => {
              setItemsPerPage(newValue);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* DETAILS MODAL - Shows complete information for selected item */}
      {showDetailsModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-teal-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {detailsType === 'property' && 'Property Details'}
                    {detailsType === 'tenant' && 'Tenant Details'}
                    {detailsType === 'contract' && 'Contract Details'}
                    {detailsType === 'payment' && 'Payment Details'}
                    {detailsType === 'maintenance' && 'Maintenance Request Details'}
                  </h2>
                  <p className="text-cyan-100 text-sm mt-1">
                    Complete information and history
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedItem(null);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body - Property Details */}
            {detailsType === 'property' && (
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-600" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Property Name</label>
                      <p className="text-slate-900 font-semibold text-lg">{selectedItem.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Type</label>
                      <p className="text-slate-900 font-semibold">{selectedItem.type}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-slate-500 font-medium">Location</label>
                      <p className="text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {selectedItem.location}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Size</label>
                      <p className="text-slate-900 font-semibold">{selectedItem.size}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Status</label>
                      <p>
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedItem.status)}`}>
                          {selectedItem.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-teal-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-teal-600" />
                    Financial Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Monthly Rate</label>
                      <p className="text-2xl font-bold text-teal-600">₱{selectedItem.monthlyRate.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">per month</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Annual Revenue</label>
                      <p className="text-2xl font-bold text-slate-700">₱{(selectedItem.monthlyRate * 12).toLocaleString()}</p>
                      <p className="text-xs text-slate-500">projected yearly</p>
                    </div>
                  </div>
                </div>

                {/* Current Tenant Information */}
                {selectedItem.tenant && (
                  <div className="bg-cyan-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-cyan-600" />
                      Current Tenant
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-500 font-medium">Tenant Name</label>
                        <p className="text-slate-900 font-semibold">{selectedItem.tenant}</p>
                      </div>
                      <div>
                        <label className="text-sm text-slate-500 font-medium">Contract End Date</label>
                        <p className="text-slate-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {selectedItem.contractEnd}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                    Edit Property
                  </button>
                  <button className="px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:border-slate-400 transition-all">
                    View History
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body - Tenant Details */}
            {detailsType === 'tenant' && (
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Full Name</label>
                      <p className="text-slate-900 font-semibold text-lg">{selectedItem.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Business Name</label>
                      <p className="text-slate-900 font-semibold">{selectedItem.businessName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Contact Number</label>
                      <p className="text-slate-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {selectedItem.contactNumber}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Email Address</label>
                      <p className="text-slate-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {selectedItem.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contract Information */}
                <div className="bg-cyan-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-600" />
                    Contract Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Current Property</label>
                      <p className="text-slate-900 font-semibold">{selectedItem.propertyRented || 'No active rental'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Contract Status</label>
                      <p>
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedItem.contractStatus)}`}>
                          {selectedItem.contractStatus}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-teal-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-teal-600" />
                    Financial Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Security Deposit Paid</label>
                      <p className="text-2xl font-bold text-teal-600">₱{selectedItem.depositPaid.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Last Payment</label>
                      <p className="text-slate-900 font-semibold">{selectedItem.lastPayment}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                    Edit Tenant
                  </button>
                  <button className="px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:border-slate-400 transition-all">
                    Payment History
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body - Contract Details */}
            {detailsType === 'contract' && (
              <div className="p-6 space-y-6">
                {/* Contract Information */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-600" />
                    Contract Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm text-slate-500 font-medium">Contract Number</label>
                      <p className="text-slate-900 font-bold text-xl">{selectedItem.contractNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Property</label>
                      <p className="text-slate-900 font-semibold">{selectedItem.property}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Tenant</label>
                      <p className="text-slate-900 font-semibold">{selectedItem.tenant}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Start Date</label>
                      <p className="text-slate-900">{selectedItem.startDate}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">End Date</label>
                      <p className="text-slate-900">{selectedItem.endDate}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Status</label>
                      <p>
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedItem.status)}`}>
                          {selectedItem.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Days Remaining</label>
                      <p className={`font-bold text-lg ${selectedItem.daysRemaining < 60 ? 'text-amber-600' : 'text-teal-600'}`}>
                        {selectedItem.daysRemaining > 0 ? `${selectedItem.daysRemaining} days` : 'Expired'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Terms */}
                <div className="bg-teal-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-teal-600" />
                    Financial Terms
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Monthly Rent</label>
                      <p className="text-2xl font-bold text-teal-600">₱{selectedItem.monthlyRent.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Security Deposit</label>
                      <p className="text-2xl font-bold text-cyan-600">₱{selectedItem.deposit.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Total Contract Value</label>
                      <p className="text-2xl font-bold text-slate-700">
                        ₱{(selectedItem.monthlyRent * Math.ceil((new Date(selectedItem.endDate) - new Date(selectedItem.startDate)) / (1000 * 60 * 60 * 24 * 30))).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Warning if expiring soon */}
                {selectedItem.daysRemaining > 0 && selectedItem.daysRemaining < 60 && (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-amber-600" />
                      <div>
                        <p className="font-semibold text-amber-900">Contract Expiring Soon!</p>
                        <p className="text-sm text-amber-700">Contact tenant for renewal within {selectedItem.daysRemaining} days</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                    Renew Contract
                  </button>
                  <button className="px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:border-slate-400 transition-all">
                    Edit Terms
                  </button>
                  <button className="px-4 py-3 border-2 border-rose-300 text-rose-700 rounded-lg font-semibold hover:border-rose-400 transition-all">
                    Terminate
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body - Payment Details */}
            {detailsType === 'payment' && (
              <div className="p-6 space-y-6">
                {/* Payment Information */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-cyan-600" />
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm text-slate-500 font-medium">Payment Number</label>
                      <p className="text-slate-900 font-bold text-xl">{selectedItem.paymentNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Tenant</label>
                      <p className="text-slate-900 font-semibold">{selectedItem.tenant}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Property</label>
                      <p className="text-slate-900 font-semibold">{selectedItem.property}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Month Covered</label>
                      <p className="text-slate-900 font-semibold">{selectedItem.month}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Status</label>
                      <p>
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedItem.status)}`}>
                          {selectedItem.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amount Details */}
                <div className="bg-teal-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Amount Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-teal-200">
                      <span className="text-slate-600">Rental Amount</span>
                      <span className="text-xl font-bold text-slate-900">₱{selectedItem.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Total Amount</span>
                      <span className="text-3xl font-bold text-teal-600">₱{selectedItem.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method & Date */}
                <div className="bg-cyan-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Payment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Payment Method</label>
                      <p className="text-slate-900 font-semibold">{selectedItem.method || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Payment Date</label>
                      <p className="text-slate-900 font-semibold">{selectedItem.paymentDate || 'Not paid yet'}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {selectedItem.status === 'Pending' && (
                    <button className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                      Mark as Paid
                    </button>
                  )}
                  <button className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                    Download Receipt
                  </button>
                  <button className="px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:border-slate-400 transition-all">
                    Send Reminder
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body - Maintenance Details */}
            {detailsType === 'maintenance' && (
              <div className="p-6 space-y-6">
                {/* Request Information */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-cyan-600" />
                    Request Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm text-slate-500 font-medium">Request Number</label>
                      <p className="text-slate-900 font-bold text-xl">{selectedItem.requestNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Property</label>
                      <p className="text-slate-900 font-semibold">{selectedItem.property}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Tenant</label>
                      <p className="text-slate-900 font-semibold">{selectedItem.tenant}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Date Reported</label>
                      <p className="text-slate-900">{selectedItem.dateReported}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-medium">Assigned To</label>
                      <p className="text-slate-900">{selectedItem.assignedTo || 'Unassigned'}</p>
                    </div>
                  </div>
                </div>

                {/* Issue Details */}
                <div className="bg-amber-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Issue Description</h3>
                  <p className="text-slate-700 leading-relaxed">{selectedItem.issue}</p>
                </div>

                {/* Priority & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-rose-50 rounded-xl p-6">
                    <label className="text-sm text-slate-500 font-medium">Priority Level</label>
                    <p className="mt-2">
                      <span className={`inline-block px-4 py-2 text-sm font-bold rounded-full border-2 ${getPriorityColor(selectedItem.priority)}`}>
                        {selectedItem.priority} Priority
                      </span>
                    </p>
                  </div>
                  <div className="bg-teal-50 rounded-xl p-6">
                    <label className="text-sm text-slate-500 font-medium">Current Status</label>
                    <p className="mt-2">
                      <span className={`inline-block px-4 py-2 text-sm font-bold rounded-full border-2 ${getStatusColor(selectedItem.status)}`}>
                        {selectedItem.status}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {selectedItem.status === 'Pending' && (
                    <button className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                      Assign Staff
                    </button>
                  )}
                  {selectedItem.status === 'In Progress' && (
                    <button className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                      Mark as Completed
                    </button>
                  )}
                  <button className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:border-slate-400 transition-all">
                    Update Status
                  </button>
                  <button className="px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:border-slate-400 transition-all">
                    Add Notes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT PROPERTY MODAL */}
      {showEditPropertyModal && editingItem && (
        <Modal
          isOpen={showEditPropertyModal}
          onClose={() => setShowEditPropertyModal(false)}
          title="Edit Property"
          subtitle="Update property information"
          icon={<Building2 className="w-6 h-6" />}
          size="md"
        >
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const propertyData = {
              name: formData.get('name'),
              type: formData.get('type'),
              location: formData.get('location'),
              size: formData.get('size'),
              monthly_rate: formData.get('monthly_rate'),
              status: formData.get('status')
            };
            handleEditProperty(propertyData);
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Property Name</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={editingItem.name || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Enter property name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Property Type</label>
                <select name="type" defaultValue={editingItem.type || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" required>
                  <option value="Commercial">Commercial</option>
                  <option value="Residential">Residential</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                <input
                  name="location"
                  type="text"
                  defaultValue={editingItem.location || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Enter location details"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Size (sqm)</label>
                <input
                  name="size"
                  type="number"
                  defaultValue={editingItem.size || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="0"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Monthly Rate (₱)</label>
                <input
                  name="monthly_rate"
                  type="number"
                  defaultValue={editingItem.monthlyRate || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select name="status" defaultValue={editingItem.status || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" required>
                  <option value="Occupied">Occupied</option>
                  <option value="Vacant">Vacant</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowEditPropertyModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Update Property
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE PROPERTY MODAL */}
      {showDeletePropertyModal && editingItem && (
        <Modal
          isOpen={showDeletePropertyModal}
          onClose={() => setShowDeletePropertyModal(false)}
          title="Delete Property"
          subtitle="Are you sure you want to delete this property?"
          icon={<AlertTriangle className="w-6 h-6" />}
          size="sm"
        >
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-rose-900">Warning</h4>
                  <p className="text-rose-700 text-sm mt-1">This action cannot be undone. This will permanently delete the property and remove all associated data.</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="font-semibold text-slate-900 mb-2">Property Details:</h5>
              <p className="text-slate-700"><strong>Name:</strong> {editingItem.name}</p>
              <p className="text-slate-700"><strong>Address:</strong> {editingItem.address}</p>
              <p className="text-slate-700"><strong>Status:</strong> {editingItem.status}</p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowDeletePropertyModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProperty()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Delete Property
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT TENANT MODAL */}
      {showEditTenantModal && editingItem && (
        <Modal
          isOpen={showEditTenantModal}
          onClose={() => setShowEditTenantModal(false)}
          title="Edit Tenant"
          subtitle="Update tenant information"
          icon={<Users className="w-6 h-6" />}
          size="md"
        >
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const tenantData = {
              name: formData.get('name'),
              business_name: formData.get('business_name'),
              email: formData.get('email'),
              contact_number: formData.get('contact_number'),
              property_rented_id: formData.get('property_rented_id'),
              contract_status: formData.get('contract_status'),
              deposit_paid: formData.get('deposit_paid')
            };
            handleEditTenant(tenantData);
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={editingItem.name || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Business Name (Optional)</label>
                <input
                  name="business_name"
                  type="text"
                  defaultValue={editingItem.businessName || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Number</label>
                <input
                  name="contact_number"
                  type="tel"
                  defaultValue={editingItem.contactNumber || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Enter contact number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editingItem.email || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Deposit Paid (₱)</label>
                <input
                  name="deposit_paid"
                  type="number"
                  defaultValue={editingItem.depositPaid || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Assigned Property</label>
                <select name="property_rented_id" defaultValue={editingItem.propertyRentedId || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors">
                  <option value="">Select Available Property</option>
                  {properties
                    .filter(property => {
                      // Show vacant properties OR the current property assigned to this tenant
                      return !contracts.some(c => 
                        c.propertyId == property.id && 
                        c.status === 'Active'
                      ) || property.id == editingItem.propertyRentedId;
                    })
                    .map(property => (
                      <option key={property.id} value={property.id}>{property.name} - {property.location}</option>
                    ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Change property assignment for this tenant</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contract Status</label>
                <select name="contract_status" defaultValue={editingItem.contractStatus || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" required>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowEditTenantModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Update Tenant
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE TENANT MODAL */}
      {showDeleteTenantModal && editingItem && (
        <Modal
          isOpen={showDeleteTenantModal}
          onClose={() => setShowDeleteTenantModal(false)}
          title="Delete Tenant"
          subtitle="Are you sure you want to delete this tenant?"
          icon={<AlertTriangle className="w-6 h-6" />}
          size="sm"
        >
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-rose-900">Warning</h4>
                  <p className="text-rose-700 text-sm mt-1">This action cannot be undone. This will permanently delete the tenant and remove all associated rental records.</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="font-semibold text-slate-900 mb-2">Tenant Details:</h5>
              <p className="text-slate-700"><strong>Name:</strong> {editingItem.name}</p>
              {editingItem.businessName && <p className="text-slate-700"><strong>Business:</strong> {editingItem.businessName}</p>}
              <p className="text-slate-700"><strong>Contact:</strong> {editingItem.contactNumber}</p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowDeleteTenantModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTenant()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Delete Tenant
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT CONTRACT MODAL */}
      {showEditContractModal && editingItem && (
        <Modal
          isOpen={showEditContractModal}
          onClose={() => setShowEditContractModal(false)}
          title="Edit Contract"
          subtitle="Update rental contract details"
          icon={<FileText className="w-6 h-6" />}
          size="md"
        >
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const contractData = {
              contract_number: formData.get('contract_number'),
              property_id: formData.get('property_id'),
              tenant_id: formData.get('tenant_id'),
              start_date: formData.get('start_date'),
              end_date: formData.get('end_date'),
              monthly_rent: formData.get('monthly_rent'),
              deposit: formData.get('deposit'),
              status: formData.get('status')
            };
            handleEditContract(contractData);
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contract Number</label>
                <input
                  name="contract_number"
                  type="text"
                  defaultValue={editingItem.contractNumber || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Enter contract number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tenant</label>
                <select name="tenant_id" defaultValue={editingItem.tenantId || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" required>
                  <option value="">Select Tenant</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Property</label>
                <select name="property_id" defaultValue={editingItem.propertyId || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" required>
                  <option value="">Select Property</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>{property.name} - {property.location}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Monthly Rent (₱)</label>
                <input
                  name="monthly_rent"
                  type="number"
                  defaultValue={editingItem.monthlyRent || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Deposit (₱)</label>
                <input
                  name="deposit"
                  type="number"
                  defaultValue={editingItem.deposit || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select name="status" defaultValue={editingItem.status || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" required>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                <input
                  name="start_date"
                  type="date"
                  defaultValue={editingItem.startDate || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                <input
                  name="end_date"
                  type="date"
                  defaultValue={editingItem.endDate || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowEditContractModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Update Contract
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONTRACT MODAL */}
      {showDeleteContractModal && editingItem && (
        <Modal
          isOpen={showDeleteContractModal}
          onClose={() => setShowDeleteContractModal(false)}
          title="Delete Contract"
          subtitle="Are you sure you want to delete this rental contract?"
          icon={<AlertTriangle className="w-6 h-6" />}
          size="sm"
        >
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-rose-900">Warning</h4>
                  <p className="text-rose-700 text-sm mt-1">This action cannot be undone. This will permanently delete the rental contract and all associated payment records.</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="font-semibold text-slate-900 mb-2">Contract Details:</h5>
              <p className="text-slate-700"><strong>Contract #:</strong> {editingItem.contractNumber}</p>
              <p className="text-slate-700"><strong>Property:</strong> {editingItem.property}</p>
              <p className="text-slate-700"><strong>Tenant:</strong> {editingItem.tenant}</p>
              <p className="text-slate-700"><strong>Monthly Rent:</strong> ₱{editingItem.monthlyRent?.toLocaleString()}</p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowDeleteContractModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteContract()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Delete Contract
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT PAYMENT MODAL */}
      {showEditPaymentModal && editingItem && (
        <Modal
          isOpen={showEditPaymentModal}
          onClose={() => setShowEditPaymentModal(false)}
          title="Edit Payment"
          subtitle="Update payment information"
          icon={<DollarSign className="w-6 h-6" />}
          size="md"
        >
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const paymentData = {
              payment_number: formData.get('payment_number'),
              tenant_id: formData.get('tenant_id'),
              property_id: formData.get('property_id'),
              amount: formData.get('amount'),
              month: formData.get('month'),
              status: formData.get('status'),
              payment_date: formData.get('payment_date'),
              method: formData.get('method')
            };
            handleEditPayment(paymentData);
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Number (Read-only)</label>
                <input
                  name="payment_number"
                  type="text"
                  defaultValue={editingItem.paymentNumber || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                  placeholder="Payment number"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tenant</label>
                <select name="tenant_id" defaultValue={editingItem.tenantId || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" required>
                  <option value="">Select Tenant</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Property</label>
                <select name="property_id" defaultValue={editingItem.propertyId || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" required>
                  <option value="">Select Property</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>{property.name} - {property.location}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Amount (₱)</label>
                <input
                  name="amount"
                  type="number"
                  defaultValue={editingItem.amount || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Month</label>
                <input
                  name="month"
                  type="text"
                  defaultValue={editingItem.month || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="e.g., January 2024"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select name="status" defaultValue={editingItem.status || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" required>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Date</label>
                <input
                  name="payment_date"
                  type="date"
                  defaultValue={editingItem.paymentDate || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                <select name="method" defaultValue={editingItem.method || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors">
                  <option value="">Select method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="GCash">GCash</option>
                  <option value="Check">Check</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowEditPaymentModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Update Payment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE PAYMENT MODAL */}
      {showDeletePaymentModal && editingItem && (
        <Modal
          isOpen={showDeletePaymentModal}
          onClose={() => setShowDeletePaymentModal(false)}
          title="Delete Payment"
          subtitle="Are you sure you want to delete this payment record?"
          icon={<AlertTriangle className="w-6 h-6" />}
          size="sm"
        >
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-rose-900">Warning</h4>
                  <p className="text-rose-700 text-sm mt-1">This action cannot be undone. This will permanently delete the payment record from the system.</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="font-semibold text-slate-900 mb-2">Payment Details:</h5>
              <p className="text-slate-700"><strong>Payment #:</strong> {editingItem.paymentNumber}</p>
              <p className="text-slate-700"><strong>Tenant:</strong> {editingItem.tenant}</p>
              <p className="text-slate-700"><strong>Month:</strong> {editingItem.month}</p>
              <p className="text-slate-700"><strong>Amount:</strong> ₱{editingItem.amount?.toLocaleString()}</p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowDeletePaymentModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePayment()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Delete Payment
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT MAINTENANCE MODAL */}
      {showEditMaintenanceModal && editingItem && (
        <Modal
          isOpen={showEditMaintenanceModal}
          onClose={() => setShowEditMaintenanceModal(false)}
          title="Edit Maintenance Request"
          subtitle="Update maintenance request details"
          icon={<Wrench className="w-6 h-6" />}
          size="md"
        >
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const maintenanceData = {
              request_number: formData.get('request_number'),
              property_id: formData.get('property_id'),
              tenant_id: formData.get('tenant_id'),
              issue: formData.get('issue'),
              priority: formData.get('priority'),
              status: formData.get('status'),
              date_reported: formData.get('date_reported'),
              assigned_to: formData.get('assigned_to')
            };
            handleEditMaintenance(maintenanceData);
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Request Number (Read-only)</label>
                <input
                  name="request_number"
                  type="text"
                  defaultValue={editingItem.requestNumber || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                  placeholder="Request number"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Property</label>
                <select name="property_id" defaultValue={editingItem.propertyId || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" required>
                  <option value="">Select Property</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>{property.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tenant</label>
                <select name="tenant_id" defaultValue={editingItem.tenantId || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors">
                  <option value="">Select Tenant (Optional)</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                <select name="priority" defaultValue={editingItem.priority || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" required>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select name="status" defaultValue={editingItem.status || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" required>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Assigned To</label>
                <input
                  name="assigned_to"
                  type="text"
                  defaultValue={editingItem.assignedTo || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Enter staff name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Date Reported</label>
                <input
                  name="date_reported"
                  type="date"
                  defaultValue={editingItem.dateReported || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Issue Description</label>
                <textarea
                  name="issue"
                  defaultValue={editingItem.issue || ''}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors resize-none"
                  placeholder="Describe the maintenance issue"
                  required
                ></textarea>
              </div>
            </div>
            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowEditMaintenanceModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Update Request
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE MAINTENANCE MODAL */}
      {showDeleteMaintenanceModal && editingItem && (
        <Modal
          isOpen={showDeleteMaintenanceModal}
          onClose={() => setShowDeleteMaintenanceModal(false)}
          title="Delete Maintenance Request"
          subtitle="Are you sure you want to delete this maintenance request?"
          icon={<AlertTriangle className="w-6 h-6" />}
          size="sm"
        >
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-rose-900">Warning</h4>
                  <p className="text-rose-700 text-sm mt-1">This action cannot be undone. This will permanently delete the maintenance request from the system.</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="font-semibold text-slate-900 mb-2">Request Details:</h5>
              <p className="text-slate-700"><strong>Request #:</strong> {editingItem.requestNumber}</p>
              <p className="text-slate-700"><strong>Property:</strong> {editingItem.property}</p>
              <p className="text-slate-700"><strong>Tenant:</strong> {editingItem.tenant}</p>
              <p className="text-slate-700"><strong>Priority:</strong> {editingItem.priority}</p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowDeleteMaintenanceModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMaintenance()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Delete Request
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Rentals;
