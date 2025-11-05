import { useState, useEffect, useRef } from 'react';
import { Users, Plus, Edit, Trash2, Key, X, Search, UserCheck, UserX, Mail, Phone, Shield, MapPin, Calendar, Briefcase } from 'lucide-react';
import { staffAPI } from '../services/api';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Modal states
  const [showStepOneModal, setShowStepOneModal] = useState(false); // Step 1: Staff Info
  const [showStepTwoModal, setShowStepTwoModal] = useState(false); // Step 2: Account Creation
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [tempStaffInfo, setTempStaffInfo] = useState(null); // Store staff info between steps
  
  // Form state for Step 1 (Staff Info)
  const [staffInfoForm, setStaffInfoForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: '',
  });

  // Form state for Step 2 (Account Creation)
  const [accountForm, setAccountForm] = useState({
    password: '',
    confirm_password: '',
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: '',
    position: '',
    status: 'active',
  });
  
  const [resetPassword, setResetPassword] = useState('');
  
  // Validation states
  const [emailError, setEmailError] = useState('');
  const [emailChecking, setEmailChecking] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  
  // Debounce timer
  const emailDebounceTimer = useRef(null);

  // Fetch staff on mount
  useEffect(() => {
    fetchStaff();
    
    // Cleanup debounce timer on unmount
    return () => {
      if (emailDebounceTimer.current) {
        clearTimeout(emailDebounceTimer.current);
      }
    };
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await staffAPI.getAll();
      console.log('Staff API Full Response:', response);
      console.log('Response.data:', response.data);
      console.log('Response.data.staff:', response.data?.staff);
      
      // Axios wraps response in data property
      const staffData = response.data?.staff || response.staff || [];
      console.log('Setting staff data:', staffData);
      setStaff(staffData);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to fetch staff');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  // Email validation with debounce
  const validateEmail = (email, userId = null) => {
    // Clear previous timer
    if (emailDebounceTimer.current) {
      clearTimeout(emailDebounceTimer.current);
    }

    // Don't validate empty email
    if (!email || email.trim() === '') {
      setEmailError('');
      setEmailChecking(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
      setEmailChecking(false);
      return;
    }

    // Set checking state immediately
    setEmailChecking(true);
    setEmailError('');

    // Debounce the API call
    emailDebounceTimer.current = setTimeout(async () => {
      try {
        const response = await staffAPI.checkEmail(email, userId);
        console.log('Email check full response:', response);
        console.log('Email:', email, 'StaffInfoId:', userId);
        
        // Axios wraps the response in a 'data' property
        const result = response.data;
        console.log('Available:', result.available);
        
        if (result.available === false) {
          setEmailError('Email already taken');
        } else {
          setEmailError('');
        }
      } catch (error) {
        console.error('Error checking email:', error);
        // On error, don't block the form
        setEmailError('');
      } finally {
        setEmailChecking(false);
      }
    }, 500); // Wait 500ms after user stops typing
  };

  // Phone validation
  const validatePhone = (phone) => {
    if (!phone) {
      setPhoneError('');
      return true;
    }

    const phoneRegex = /^(09|\+639)\d{9}$|^09\d{2}-\d{3}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError('Invalid phone format (e.g., 0912-345-6789)');
      return false;
    }

    setPhoneError('');
    return true;
  };

  // Reset forms
  const resetStaffInfoForm = () => {
    setStaffInfoForm({
      full_name: '',
      email: '',
      phone: '',
      address: '',
      date_of_birth: '',
      gender: '',
    });
    setEmailError('');
    setPhoneError('');
  };

  const resetAccountForm = () => {
    setAccountForm({
      password: '',
      confirm_password: '',
    });
  };

  // Step 1: Handle staff info submission
  const handleStaffInfoSubmit = async (e) => {
    e.preventDefault();
    
    // Wait for email checking to complete
    if (emailChecking) {
      toast.error('Please wait for email validation to complete');
      return;
    }
    
    if (emailError) {
      toast.error('Please use a different email address');
      return;
    }
    
    if (staffInfoForm.phone && !validatePhone(staffInfoForm.phone)) {
      toast.error('Please fix phone number format');
      return;
    }

    try {
      // Save staff information with position='Staff (read only)'
      const staffData = {
        ...staffInfoForm,
        position: 'Staff'
      };
      const response = await staffAPI.saveStaffInfo(staffData);
      toast.success('Staff information saved successfully!');
      setTempStaffInfo(response.data.staff_info);
      setShowStepOneModal(false);
      setShowStepTwoModal(true);
    } catch (error) {
      console.error('Error saving staff info:', error);
      toast.error(error.response?.data?.message || 'Failed to save staff information');
    }
  };

  // Step 2: Handle account creation
  const handleAccountCreation = async (e) => {
    e.preventDefault();

    if (accountForm.password !== accountForm.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (accountForm.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      await staffAPI.createStaffAccount(tempStaffInfo.id, { password: accountForm.password });
      toast.success('Staff account created successfully!');
      setShowStepTwoModal(false);
      setTempStaffInfo(null);
      resetStaffInfoForm();
      resetAccountForm();
      fetchStaff();
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error(error.response?.data?.message || 'Failed to create account');
    }
  };

  // Handle edit staff
  const handleEditStaff = async (e) => {
    e.preventDefault();
    
    // Wait for email checking to complete
    if (emailChecking) {
      toast.error('Please wait for email validation to complete');
      return;
    }
    
    if (emailError) {
      toast.error('Please use a different email address');
      return;
    }
    
    if (editForm.phone && !validatePhone(editForm.phone)) {
      toast.error('Please fix phone number format');
      return;
    }

    try {
      await staffAPI.updateStaffInfo(selectedStaff.id, editForm);
      toast.success('Staff information updated successfully');
      setShowEditModal(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (error) {
      console.error('Error updating staff:', error);
      toast.error(error.response?.data?.message || 'Failed to update staff information');
    }
  };

  // Handle delete staff
  const handleDeleteStaff = async () => {
    try {
      await staffAPI.deleteStaff(selectedStaff.id);
      toast.success('Staff member deleted successfully');
      setShowDeleteModal(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error(error.response?.data?.message || 'Failed to delete staff member');
    }
  };

  // Handle reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (resetPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      await staffAPI.resetPassword(selectedStaff.user_id, resetPassword);
      toast.success('Password reset successfully');
      setShowResetPasswordModal(false);
      setSelectedStaff(null);
      setResetPassword('');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  // Open edit modal
  const openEditModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setEditForm({
      full_name: staffMember.full_name,
      email: staffMember.email,
      phone: staffMember.phone || '',
      address: staffMember.address || '',
      date_of_birth: staffMember.date_of_birth || '',
      gender: staffMember.gender || '',
      position: staffMember.position || '',
      status: staffMember.status,
    });
    setEmailError('');
    setPhoneError('');
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setShowDeleteModal(true);
  };

  // Open reset password modal
  const openResetPasswordModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setResetPassword('');
    setShowResetPasswordModal(true);
  };

  // Filter and paginate staff
  const filteredStaff = staff.filter(member =>
    member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  // Debug logs
  console.log('Staff state:', staff);
  console.log('Staff length:', staff.length);
  console.log('Filtered staff:', filteredStaff);
  console.log('Current staff:', currentStaff);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-br from-cyan-600 to-teal-600 p-2 md:p-3 rounded-xl shadow-lg">
            <Users className="w-5 h-5 md:w-7 md:h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-800 to-teal-900 bg-clip-text text-transparent">
              Staff Management
            </h1>
            <p className="text-sm md:text-base text-slate-600 mt-1">Manage your staff members</p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 md:gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-sm md:text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => {
              resetStaffInfoForm();
              resetAccountForm();
              setShowStepOneModal(true);
            }}
            className="w-full md:w-auto bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            Add Staff Member
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-6">
          <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-3 md:p-4 rounded-xl border border-cyan-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs md:text-sm">Total Staff</p>
                <p className="text-xl md:text-2xl font-bold text-slate-900">{staff.length}</p>
              </div>
              <Users className="w-6 h-6 md:w-8 md:h-8 text-cyan-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 md:p-4 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs md:text-sm">Active Staff</p>
                <p className="text-xl md:text-2xl font-bold text-slate-900">{staff.filter(s => s.status === 'active').length}</p>
              </div>
              <UserCheck className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 md:p-4 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs md:text-sm">Inactive Staff</p>
                <p className="text-xl md:text-2xl font-bold text-slate-900">{staff.filter(s => s.status === 'inactive').length}</p>
              </div>
              <UserX className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table/Cards */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent"></div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">
              {searchQuery ? 'No staff members found matching your search' : 'No staff members yet'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden p-4 space-y-4">
              {currentStaff.map((member) => (
                <div key={member.id} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center text-white font-semibold">
                        {member.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{member.full_name}</p>
                        {member.user_id ? (
                          <span className="text-xs text-emerald-600 flex items-center gap-1">
                            <UserCheck className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600 flex items-center gap-1">
                            <UserX className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.position && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Briefcase className="w-4 h-4 flex-shrink-0 text-cyan-500" />
                        <span className="font-medium">{member.position}</span>
                      </div>
                    )}
                  </div>

                  {/* Status & Role */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      member.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : member.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {member.status}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                      <Shield className="w-3 h-3 inline mr-1" />
                      Staff
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => openEditModal(member)}
                      className="flex-1 px-3 py-2 text-cyan-600 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    {member.user_id && (
                      <button
                        onClick={() => openResetPasswordModal(member)}
                        className="flex-1 px-3 py-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Key className="w-4 h-4" />
                        Reset
                      </button>
                    )}
                    <button
                      onClick={() => openDeleteModal(member)}
                      className="px-3 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Staff Member</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center text-white font-semibold">
                            {member.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{member.full_name}</p>
                            {member.user_id ? (
                              <span className="text-xs text-emerald-600 flex items-center gap-1">
                                <UserCheck className="w-3 h-3" /> Account Active
                              </span>
                            ) : (
                              <span className="text-xs text-amber-600 flex items-center gap-1">
                                <UserX className="w-3 h-3" /> Pending Account
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="w-4 h-4" />
                            {member.email}
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="w-4 h-4" />
                              {member.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {member.position ? (
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Briefcase className="w-4 h-4 text-cyan-500" />
                            <span className="font-medium">{member.position}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            member.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : member.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {member.status}
                          </span>
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                            <Shield className="w-3 h-3 inline mr-1" />
                            Staff
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(member)}
                            className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {member.user_id && (
                            <button
                              onClick={() => openResetPasswordModal(member)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Reset Password"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openDeleteModal(member)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
            {totalPages > 1 && (
              <div className="border-t border-slate-200 px-6 py-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Step 1: Staff Information Modal */}
      <Modal
        isOpen={showStepOneModal}
        onClose={() => {
          setShowStepOneModal(false);
          resetStaffInfoForm();
        }}
        title="Add Staff Member"
        subtitle="Step 1 of 2: Staff Information"
        size="md"
        icon={<Users className="w-6 h-6" />}
      >
        <form onSubmit={handleStaffInfoSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={staffInfoForm.full_name}
                    onChange={(e) => setStaffInfoForm({ ...staffInfoForm, full_name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email * {emailChecking && <span className="text-xs text-slate-500">(checking...)</span>}
                  </label>
                  <input
                    type="email"
                    value={staffInfoForm.email}
                    onChange={(e) => {
                      setStaffInfoForm({ ...staffInfoForm, email: e.target.value });
                      validateEmail(e.target.value);
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      emailError ? 'border-rose-500' : 'border-slate-300'
                    }`}
                    required
                  />
                  {emailError && (
                    <p className="text-xs text-rose-600 mt-1">{emailError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={staffInfoForm.phone}
                    onChange={(e) => {
                      setStaffInfoForm({ ...staffInfoForm, phone: e.target.value });
                      validatePhone(e.target.value);
                    }}
                    placeholder="0912-345-6789"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      phoneError ? 'border-rose-500' : 'border-slate-300'
                    }`}
                  />
                  {phoneError && (
                    <p className="text-xs text-rose-600 mt-1">{phoneError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={staffInfoForm.date_of_birth}
                    onChange={(e) => setStaffInfoForm({ ...staffInfoForm, date_of_birth: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                  <select
                    value={staffInfoForm.gender}
                    onChange={(e) => setStaffInfoForm({ ...staffInfoForm, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Position</label>
                  <input
                    type="text"
                    value="Staff"
                    disabled
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                  <textarea
                    value={staffInfoForm.address}
                    onChange={(e) => setStaffInfoForm({ ...staffInfoForm, address: e.target.value })}
                    rows="2"
                    placeholder="Complete address"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowStepOneModal(false);
                    resetStaffInfoForm();
                  }}
                  className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailChecking || !!emailError}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  Next: Create Account
                </button>
              </div>
            </form>
      </Modal>

      {/* Step 2: Create Account Modal */}
      <Modal
        isOpen={showStepTwoModal && tempStaffInfo}
        onClose={() => {
          setShowStepTwoModal(false);
          setTempStaffInfo(null);
          resetAccountForm();
        }}
        title="Create Account"
        subtitle="Step 2 of 2: Account Setup"
        size="sm"
        icon={<Key className="w-6 h-6" />}
      >
        {tempStaffInfo && (
          <div>
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-700 mb-2">
                Creating account for: <span className="font-semibold text-cyan-700">{tempStaffInfo.full_name}</span>
              </p>
              <p className="text-xs text-slate-600 mb-1">
                <Mail className="w-3 h-3 inline mr-1" />
                {tempStaffInfo.email}
              </p>
              <p className="text-xs text-slate-600">
                <Shield className="w-3 h-3 inline mr-1" />
                Role: Staff 
              </p>
            </div>

              <form onSubmit={handleAccountCreation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password *</label>
                  <input
                    type="password"
                    value={accountForm.password}
                    onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    minLength={8}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Minimum 8 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password *</label>
                  <input
                    type="password"
                    value={accountForm.confirm_password}
                    onChange={(e) => setAccountForm({ ...accountForm, confirm_password: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    minLength={8}
                    required
                  />
                  {accountForm.confirm_password && accountForm.password !== accountForm.confirm_password && (
                    <p className="text-xs text-rose-600 mt-1">Passwords do not match</p>
                  )}
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStepTwoModal(false);
                      setShowStepOneModal(true);
                    }}
                    className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={accountForm.password !== accountForm.confirm_password}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
        )}
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        isOpen={showEditModal && selectedStaff}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStaff(null);
        }}
        title="Edit Staff Member"
        subtitle={`Update information for ${selectedStaff?.full_name || ''}`}
        size="md"
        icon={<Edit className="w-6 h-6" />}
      >
        <form onSubmit={handleEditStaff} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email * {emailChecking && <span className="text-xs text-slate-500">(checking...)</span>}
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => {
                      setEditForm({ ...editForm, email: e.target.value });
                      validateEmail(e.target.value, selectedStaff?.id);
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      emailError ? 'border-rose-500' : 'border-slate-300'
                    }`}
                    required
                  />
                  {emailError && (
                    <p className="text-xs text-rose-600 mt-1">{emailError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => {
                      setEditForm({ ...editForm, phone: e.target.value });
                      validatePhone(e.target.value);
                    }}
                    placeholder="0912-345-6789"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      phoneError ? 'border-rose-500' : 'border-slate-300'
                    }`}
                  />
                  {phoneError && (
                    <p className="text-xs text-rose-600 mt-1">{phoneError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={editForm.date_of_birth}
                    onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Position</label>
                  <input
                    type="text"
                    value={editForm.position || 'Staff'}
                    disabled
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status *</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                  <textarea
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                    placeholder="Street, Barangay, City, Province"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedStaff(null);
                  }}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  Update Staff Member
                </button>
              </div>
            </form>
      </Modal>

      {/* Delete Staff Modal */}
      {selectedStaff && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedStaff(null);
          }}
          onConfirm={handleDeleteStaff}
          title="Delete Staff Member"
          message="Are you sure you want to delete"
          itemName={selectedStaff.full_name}
          confirmText="Delete"
          type="danger"
          icon={<Trash2 className="w-8 h-8 text-rose-600" />}
        />
      )}

      {/* Reset Password Modal */}
      {selectedStaff && (
        <Modal
          isOpen={showResetPasswordModal}
          onClose={() => {
            setShowResetPasswordModal(false);
            setSelectedStaff(null);
            setResetPassword('');
          }}
          title="Reset Password"
          subtitle={`Reset password for ${selectedStaff.full_name}`}
          size="sm"
          icon={<Key className="w-6 h-6" />}
        >
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-slate-600 text-sm">
              Reset password for <span className="font-semibold">{selectedStaff.full_name}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">New Password *</label>
              <input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                minLength={8}
                required
              />
              <p className="text-xs text-slate-500 mt-1">Minimum 8 characters</p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setSelectedStaff(null);
                  setResetPassword('');
                }}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                Reset Password
              </button>
            </div>
          </form>

        </Modal>
      )}
    </div>
  );
}

export default Staff;
