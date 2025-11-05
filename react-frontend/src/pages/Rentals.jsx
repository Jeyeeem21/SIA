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

  // Handle view details
  const handleViewDetails = (item, type) => {
    setSelectedItem(item);
    setDetailsType(type);
    setShowDetailsModal(true);
  };

  // Initial load - fetch all data once
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch all data (charts + table) - only on initial load
  const fetchAllData = async () => {
    setLoading(true);
    // Simulated API call - replace with actual rentalsAPI calls
    setTimeout(() => {
      // Initialize all mock data
      setProperties([
        {
          id: 1,
          name: 'School Canteen',
          type: 'Commercial',
          location: 'Ground Floor, Main Building',
          size: '150 sqm',
          monthlyRate: 15000,
          status: 'Occupied',
          tenant: 'Maria Santos',
          contractEnd: '2026-06-30'
        },
        {
          id: 2,
          name: 'Boarding House A',
          type: 'Residential',
          location: 'Behind Admin Building',
          size: '200 sqm (10 rooms)',
          monthlyRate: 25000,
          status: 'Occupied',
          tenant: 'Pedro Garcia',
          contractEnd: '2026-12-31'
        },
        {
          id: 3,
          name: 'Photocopy Center',
          type: 'Commercial',
          location: 'Library Building, 1st Floor',
          size: '50 sqm',
          monthlyRate: 8000,
          status: 'Vacant',
          tenant: null,
          contractEnd: null
        },
        {
          id: 4,
          name: 'School Bookstore',
          type: 'Commercial',
          location: 'Ground Floor, East Wing',
          size: '80 sqm',
          monthlyRate: 12000,
          status: 'Occupied',
          tenant: 'Ana Reyes',
          contractEnd: '2026-08-15'
        },
        {
          id: 5,
          name: 'Parking Space - North',
          type: 'Commercial',
          location: 'North Parking Area',
          size: '100 sqm (20 slots)',
          monthlyRate: 10000,
          status: 'Vacant',
          tenant: null,
          contractEnd: null
        }
      ]);

      setTenants([
        {
          id: 1,
          name: 'Maria Santos',
          businessName: 'Santos Canteen Services',
          contactNumber: '09171234567',
          email: 'maria.santos@gmail.com',
          propertyRented: 'School Canteen',
          contractStatus: 'Active',
          depositPaid: 30000,
          lastPayment: '2025-11-01'
        },
        {
          id: 2,
          name: 'Pedro Garcia',
          businessName: 'Garcia Boarding House',
          contactNumber: '09187654321',
          email: 'pedro.garcia@yahoo.com',
          propertyRented: 'Boarding House A',
          contractStatus: 'Active',
          depositPaid: 50000,
          lastPayment: '2025-11-01'
        },
        {
          id: 3,
          name: 'Ana Reyes',
          businessName: 'Reyes School Supplies',
          contactNumber: '09161112222',
          email: 'ana.reyes@gmail.com',
          propertyRented: 'School Bookstore',
          contractStatus: 'Active',
          depositPaid: 24000,
          lastPayment: '2025-11-01'
        },
        {
          id: 4,
          name: 'Carlos Mendoza',
          businessName: 'Mendoza Printing Services',
          contactNumber: '09173334444',
          email: 'carlos.m@hotmail.com',
          propertyRented: null,
          contractStatus: 'Inactive',
          depositPaid: 0,
          lastPayment: '2024-12-01'
        }
      ]);

      setContracts([
        {
          id: 1,
          contractNumber: 'RNT-2025-001',
          property: 'School Canteen',
          tenant: 'Maria Santos',
          startDate: '2025-07-01',
          endDate: '2026-06-30',
          monthlyRent: 15000,
          deposit: 30000,
          status: 'Active',
          daysRemaining: 238
        },
        {
          id: 2,
          contractNumber: 'RNT-2025-002',
          property: 'Boarding House A',
          tenant: 'Pedro Garcia',
          startDate: '2025-01-01',
          endDate: '2026-12-31',
          monthlyRent: 25000,
          deposit: 50000,
          status: 'Active',
          daysRemaining: 422
        },
        {
          id: 3,
          contractNumber: 'RNT-2025-003',
          property: 'School Bookstore',
          tenant: 'Ana Reyes',
          startDate: '2025-09-01',
          endDate: '2026-08-15',
          monthlyRent: 12000,
          deposit: 24000,
          status: 'Active',
          daysRemaining: 283
        },
        {
          id: 4,
          contractNumber: 'RNT-2024-015',
          property: 'Photocopy Center',
          tenant: 'Carlos Mendoza',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          monthlyRent: 8000,
          deposit: 16000,
          status: 'Expired',
          daysRemaining: -309
        }
      ]);

      setPayments([
        {
          id: 1,
          paymentNumber: 'PAY-2025-011',
          tenant: 'Maria Santos',
          property: 'School Canteen',
          amount: 15000,
          paymentDate: '2025-11-01',
          month: 'November 2025',
          method: 'Bank Transfer',
          status: 'Paid'
        },
        {
          id: 2,
          paymentNumber: 'PAY-2025-012',
          tenant: 'Pedro Garcia',
          property: 'Boarding House A',
          amount: 25000,
          paymentDate: '2025-11-01',
          month: 'November 2025',
          method: 'Cash',
          status: 'Paid'
        },
        {
          id: 3,
          paymentNumber: 'PAY-2025-013',
          tenant: 'Ana Reyes',
          property: 'School Bookstore',
          amount: 12000,
          paymentDate: '2025-11-01',
          month: 'November 2025',
          method: 'GCash',
          status: 'Paid'
        },
        {
          id: 4,
          paymentNumber: 'PAY-2025-014',
          tenant: 'Maria Santos',
          property: 'School Canteen',
          amount: 15000,
          paymentDate: null,
          month: 'December 2025',
          method: null,
          status: 'Pending'
        },
        {
          id: 5,
          paymentNumber: 'PAY-2025-015',
          tenant: 'Pedro Garcia',
          property: 'Boarding House A',
          amount: 25000,
          paymentDate: null,
          month: 'December 2025',
          method: null,
          status: 'Pending'
        },
        {
          id: 6,
          paymentNumber: 'PAY-2025-010',
          tenant: 'Maria Santos',
          property: 'School Canteen',
          amount: 15000,
          paymentDate: '2025-10-02',
          month: 'October 2025',
          method: 'Bank Transfer',
          status: 'Paid'
        },
        {
          id: 7,
          paymentNumber: 'PAY-2025-008',
          tenant: 'Pedro Garcia',
          property: 'Boarding House A',
          amount: 25000,
          paymentDate: '2025-09-30',
          month: 'September 2025',
          method: 'Cash',
          status: 'Overdue'
        }
      ]);

      setMaintenanceRequests([
        {
          id: 1,
          requestNumber: 'MNT-2025-015',
          property: 'School Canteen',
          tenant: 'Maria Santos',
          issue: 'Leaking faucet in kitchen area',
          priority: 'Medium',
          status: 'In Progress',
          dateReported: '2025-11-03',
          assignedTo: 'Juan Dela Cruz'
        },
        {
          id: 2,
          requestNumber: 'MNT-2025-016',
          property: 'Boarding House A',
          tenant: 'Pedro Garcia',
          issue: 'Broken door lock in Room 5',
          priority: 'High',
          status: 'Pending',
          dateReported: '2025-11-04',
          assignedTo: null
        },
        {
          id: 3,
          requestNumber: 'MNT-2025-017',
          property: 'School Bookstore',
          tenant: 'Ana Reyes',
          issue: 'Air conditioning not cooling properly',
          priority: 'High',
          status: 'Pending',
          dateReported: '2025-11-05',
          assignedTo: null
        },
        {
          id: 4,
          requestNumber: 'MNT-2025-014',
          property: 'Boarding House A',
          tenant: 'Pedro Garcia',
          issue: 'Water heater in Room 3 not working',
          priority: 'Medium',
          status: 'Completed',
          dateReported: '2025-10-28',
          assignedTo: 'Juan Dela Cruz'
        },
        {
          id: 5,
          requestNumber: 'MNT-2025-013',
          property: 'School Canteen',
          tenant: 'Maria Santos',
          issue: 'Exhaust fan making loud noise',
          priority: 'Low',
          status: 'Completed',
          dateReported: '2025-10-25',
          assignedTo: 'Roberto Santos'
        }
      ]);

      setLoading(false);
    }, 500);
  };

  // Fetch only table data - for tab changes (no loading screen, just table update)
  const fetchTableData = async () => {
    setTableLoading(true);
    // Simulated API call - would normally fetch based on activeTab
    setTimeout(() => {
      // Data is already in state, just trigger re-render
      // In real implementation, this would call specific API endpoint
      setTableLoading(false);
    }, 300);
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
      .reduce((sum, p) => sum + p.monthlyRate, 0),
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
          <form className="space-y-6" onSubmit={e => { e.preventDefault(); /* handle add property */ }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property Name</label>
                <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Size (sqm)</label>
                <input type="number" min="1" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Rate (₱)</label>
                <input type="number" min="0" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required>
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
          <form className="space-y-6" onSubmit={e => { e.preventDefault(); /* handle add tenant */ }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                <input type="tel" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea rows="3" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Security Deposit (₱)</label>
                <input type="number" min="0" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
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
          onClose={() => setShowContractModal(false)}
          title="Add Contract"
          subtitle="Enter contract details below"
          icon={<FileText className="w-6 h-6" />}
          size="md"
        >
          <form className="space-y-6" onSubmit={e => { e.preventDefault(); /* handle add contract */ }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contract Number</label>
                <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required>
                  <option value="">Select Property</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>{property.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tenant</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required>
                  <option value="">Select Tenant</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Rent (₱)</label>
                <input type="number" min="0" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Security Deposit (₱)</label>
                <input type="number" min="0" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
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
          <form className="space-y-6" onSubmit={e => { e.preventDefault(); /* handle add payment */ }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Number</label>
                <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tenant</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required>
                  <option value="">Select Tenant</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required>
                  <option value="">Select Property</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>{property.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₱)</label>
                <input type="number" min="0" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Month Covered</label>
                <input type="text" placeholder="e.g., November 2025" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="GCash">GCash</option>
                  <option value="Check">Check</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
                <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required>
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
          <form className="space-y-6" onSubmit={e => { e.preventDefault(); /* handle add maintenance */ }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Request Number</label>
                <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required>
                  <option value="">Select Property</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>{property.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tenant</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500">
                  <option value="">Select Tenant (if applicable)</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Issue Description</label>
                <textarea rows="4" placeholder="Describe the maintenance issue in detail..." className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" required></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned To</label>
                <input type="text" placeholder="Staff member name" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Cost (₱)</label>
                <input type="number" min="0" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500" />
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
                      <label className="text-sm text-slate-500 font-medium">Property Rented</label>
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
          <form className="space-y-6" onSubmit={e => { e.preventDefault(); /* handle edit property */ }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Property Name</label>
                <input
                  type="text"
                  defaultValue={editingItem.name || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Enter property name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Property Type</label>
                <select defaultValue={editingItem.type || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors">
                  <option value="">Select type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                <input
                  type="text"
                  defaultValue={editingItem.address || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Enter full address"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Monthly Rent (₱)</label>
                <input
                  type="number"
                  defaultValue={editingItem.monthlyRent || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select defaultValue={editingItem.status || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors">
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Under Maintenance</option>
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
                onClick={() => {
                  // handle delete property
                  setShowDeletePropertyModal(false);
                }}
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
          <form className="space-y-6" onSubmit={e => { e.preventDefault(); /* handle edit tenant */ }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={editingItem.name || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Business Name (Optional)</label>
                <input
                  type="text"
                  defaultValue={editingItem.businessName || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Number</label>
                <input
                  type="tel"
                  defaultValue={editingItem.contactNumber || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Enter contact number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={editingItem.email || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Enter email address"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Deposit Paid (₱)</label>
                <input
                  type="number"
                  defaultValue={editingItem.depositPaid || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="0.00"
                />
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
                onClick={() => {
                  // handle delete tenant
                  setShowDeleteTenantModal(false);
                }}
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
          <form className="space-y-6" onSubmit={e => { e.preventDefault(); /* handle edit contract */ }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contract Number</label>
                <input
                  type="text"
                  defaultValue={editingItem.contractNumber || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Enter contract number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Monthly Rent (₱)</label>
                <input
                  type="number"
                  defaultValue={editingItem.monthlyRent || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Deposit (₱)</label>
                <input
                  type="number"
                  defaultValue={editingItem.deposit || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select defaultValue={editingItem.status || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors">
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                <input
                  type="date"
                  defaultValue={editingItem.startDate || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                <input
                  type="date"
                  defaultValue={editingItem.endDate || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
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
                onClick={() => {
                  // handle delete contract
                  setShowDeleteContractModal(false);
                }}
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
          <form className="space-y-6" onSubmit={e => { e.preventDefault(); /* handle edit payment */ }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Number</label>
                <input
                  type="text"
                  defaultValue={editingItem.paymentNumber || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Enter payment number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Amount (₱)</label>
                <input
                  type="number"
                  defaultValue={editingItem.amount || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Month</label>
                <input
                  type="text"
                  defaultValue={editingItem.month || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="e.g., January 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select defaultValue={editingItem.status || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors">
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Date</label>
                <input
                  type="date"
                  defaultValue={editingItem.paymentDate || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                <select defaultValue={editingItem.method || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors">
                  <option value="">Select method</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="online">Online Payment</option>
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
                onClick={() => {
                  // handle delete payment
                  setShowDeletePaymentModal(false);
                }}
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
          <form className="space-y-6" onSubmit={e => { e.preventDefault(); /* handle edit maintenance */ }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Request Number</label>
                <input
                  type="text"
                  defaultValue={editingItem.requestNumber || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Enter request number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                <select defaultValue={editingItem.priority || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select defaultValue={editingItem.status || ''} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Assigned To</label>
                <input
                  type="text"
                  defaultValue={editingItem.assignedTo || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Enter staff name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Issue Description</label>
                <textarea
                  defaultValue={editingItem.issue || ''}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors resize-none"
                  placeholder="Describe the maintenance issue"
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
                onClick={() => {
                  // handle delete maintenance request
                  setShowDeleteMaintenanceModal(false);
                }}
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
