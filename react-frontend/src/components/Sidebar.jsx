import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePrefetch } from '../hooks/usePrefetch';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  FileText,
  Warehouse,
  LogOut,
  Menu,
  User,
  Bell,
  ChevronDown,
  Tag,
  Building2
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProductsSubmenu, setShowProductsSubmenu] = useState(false);
  const location = useLocation();
  const userMenuRef = useRef(null);
  
  // Prefetch hook for instant navigation
  const { 
    prefetchDashboard, 
    prefetchProducts, 
    prefetchInventory, 
    prefetchOrders, 
    prefetchCategories,
    prefetchStaff,
    prefetchRentals,
    prefetchReports
  } = usePrefetch();

  // Get user initials
  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', color: 'text-cyan-400' },
    { 
      icon: Package, 
      label: 'Products', 
      path: '/products', 
      color: 'text-teal-400',
      hasSubmenu: true,
      submenu: [
        { icon: Tag, label: 'Categories', path: '/categories', color: 'text-teal-300' }
      ]
    },
    { icon: Warehouse, label: 'Inventory', path: '/inventory', color: 'text-emerald-400' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders', color: 'text-amber-400' },
    { icon: Users, label: 'Staff', path: '/staff', color: 'text-rose-400' },
    { icon: Building2, label: 'Rentals', path: '/rentals', color: 'text-indigo-400' },
    // { icon: Users, label: 'Customers', path: '/customers', color: 'text-rose-400' }, // Hidden - customer_name is now optional in orders
    { icon: BarChart3, label: 'Reports', path: '/reports', color: 'text-violet-400' },
    // { icon: FileText, label: 'Invoices', path: '/invoices', color: 'text-orange-400' }, // Hidden
    { icon: Settings, label: 'Settings', path: '/settings', color: 'text-slate-400' },
  ];

  const isActive = (path) => location.pathname === path;
  
  // Auto-open submenu if on submenu page
  useEffect(() => {
    if (location.pathname === '/categories') {
      setShowProductsSubmenu(true);
    }
  }, [location.pathname]);

  return (
    <div
      className={`${
        isCollapsed ? 'w-20' : 'w-72'
      } bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white h-screen transition-all duration-300 ease-in-out flex flex-col shadow-2xl relative`}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-teal-600/10 pointer-events-none"></div>
      
      {/* Header */}
      <div className="relative flex items-center justify-between p-5 border-b border-slate-700/50 flex-shrink-0">
        <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center w-full' : 'opacity-100'}`}>
          <div className="bg-gradient-to-br from-cyan-500 to-teal-600 p-2 rounded-lg shadow-lg flex-shrink-0">
            <Menu className="w-5 h-5" />
          </div>
          <div className={`ml-3 transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            <h1 className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              InvenTrack
            </h1>
            <p className="text-xs text-slate-400">Manage Everything</p>
          </div>
        </div>
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-all duration-200 hover:scale-110 active:scale-95 relative z-10"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg z-20"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 px-3 relative overflow-y-auto sidebar-scroll">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const hasSubmenu = item.hasSubmenu;
            const isSubmenuOpen = hasSubmenu && showProductsSubmenu;
            
            return (
              <li key={item.path} style={{ animationDelay: `${index * 50}ms` }}>
                {/* Main menu item */}
                <div className="relative">
                  <div className="flex items-center gap-1">
                    <Link
                      to={item.path}
                      onClick={(e) => {
                        // If it has submenu, open it automatically
                        if (hasSubmenu && !isCollapsed) {
                          setShowProductsSubmenu(true);
                        }
                      }}
                      onMouseEnter={() => {
                        // Prefetch data on hover for instant navigation
                        if (item.path === '/dashboard') prefetchDashboard();
                        else if (item.path === '/products') prefetchProducts();
                        else if (item.path === '/inventory') prefetchInventory();
                        else if (item.path === '/orders') prefetchOrders();
                        else if (item.path === '/staff') prefetchStaff();
                        else if (item.path === '/rentals') prefetchRentals();
                        else if (item.path === '/reports') prefetchReports();
                      }}
                      className={`group relative flex items-center flex-1 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/30 scale-105'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white hover:scale-105 active:scale-95'
                      }`}
                      title={isCollapsed ? item.label : ''}
                    >
                      {/* Active indicator */}
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                      )}
                      
                      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : item.color} transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                      
                      <span
                        className={`ml-4 font-medium transition-all duration-300 ${
                          isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                        }`}
                      >
                        {item.label}
                      </span>

                      {/* Hover glow effect */}
                      {!active && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-600/0 to-teal-600/0 group-hover:from-cyan-600/10 group-hover:to-teal-600/10 transition-all duration-300"></div>
                      )}
                    </Link>

                    {/* Submenu toggle button - separate from Link */}
                    {hasSubmenu && !isCollapsed && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowProductsSubmenu(!showProductsSubmenu);
                        }}
                        className={`p-3 rounded-lg transition-all duration-200 ${
                          active 
                            ? 'text-white hover:bg-white/20' 
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                        }`}
                      >
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isSubmenuOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Submenu */}
                  {hasSubmenu && isSubmenuOpen && !isCollapsed && (
                    <ul className="mt-2 ml-4 space-y-1 border-l-2 border-slate-700 pl-4">
                      {item.submenu.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const subActive = isActive(subItem.path);
                        
                        return (
                          <li key={subItem.path}>
                            <Link
                              to={subItem.path}
                              onMouseEnter={() => {
                                // Prefetch submenu data on hover
                                if (subItem.path === '/products') prefetchProducts();
                                else if (subItem.path === '/categories') prefetchCategories();
                              }}
                              className={`group relative flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                                subActive
                                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
                                  : 'text-slate-400 hover:bg-slate-800/30 hover:text-white'
                              }`}
                            >
                              <SubIcon className={`w-4 h-4 flex-shrink-0 ${subActive ? 'text-white' : subItem.color}`} />
                              <span className="ml-3 text-sm font-medium">{subItem.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="relative p-4 border-t border-slate-700/50 flex-shrink-0 mt-auto" ref={userMenuRef}>
        <div 
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`flex items-center p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all duration-200 cursor-pointer group relative ${isCollapsed ? 'justify-center' : ''}`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-200">
            <span className="text-sm font-bold">{getUserInitials()}</span>
          </div>
          <div
            className={`ml-3 transition-all duration-300 ${
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            }`}
          >
            <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-400">{user?.role === 'admin' ? 'Administrator' : user?.role || 'User'}</p>
          </div>
          {!isCollapsed && (
            <ChevronRight className={`ml-auto w-4 h-4 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-90' : ''}`} />
          )}
        </div>

        {/* User Menu Dropdown */}
        {showUserMenu && (
          <div className={`absolute ${isCollapsed ? 'left-full ml-2 bottom-4' : 'left-4 right-4 bottom-20'} bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-50 animate-fade-in`}>
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <span className="text-base font-bold">{getUserInitials()}</span>
                </div>
                {!isCollapsed && (
                  <div>
                    <p className="text-sm font-bold text-white">{user?.name || 'User'}</p>
                    <p className="text-xs text-slate-400">{user?.email || 'user@example.com'}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="py-2">
              <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-700/50 transition-colors text-left group">
                <User className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                <span className="text-sm text-slate-300 group-hover:text-white">My Profile</span>
              </button>
              <Link to="/settings" className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-700/50 transition-colors text-left group">
                <Settings className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                <span className="text-sm text-slate-300 group-hover:text-white">Settings</span>
              </Link>
              <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-700/50 transition-colors text-left group">
                <Bell className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                <span className="text-sm text-slate-300 group-hover:text-white">Notifications</span>
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
  );
};

export default Sidebar;
