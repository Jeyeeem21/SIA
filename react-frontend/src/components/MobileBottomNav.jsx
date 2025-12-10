import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tag,
  Warehouse,
  ShoppingCart,
  Users,
  Building2,
  BarChart3,
  Settings
} from 'lucide-react';

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', color: 'text-cyan-500' },
    { icon: Package, label: 'Products', path: '/products', color: 'text-teal-500' },
    { icon: Tag, label: 'Categories', path: '/categories', color: 'text-blue-500' },
    { icon: Warehouse, label: 'Inventory', path: '/inventory', color: 'text-emerald-500' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders', color: 'text-amber-500' },
    { icon: Users, label: 'Staff', path: '/staff', color: 'text-rose-500' },
    { icon: Building2, label: 'Rentals', path: '/rentals', color: 'text-indigo-500' },
    // { icon: GraduationCap, label: 'Toga Rentals', path: '/toga-rentals', color: 'text-purple-500' }, // Hidden for admin
    { icon: BarChart3, label: 'Reports', path: '/reports', color: 'text-violet-500' },
    { icon: Settings, label: 'Settings', path: '/settings', color: 'text-slate-500' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                active
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon
                className={`w-6 h-6 ${active ? item.color : 'text-slate-500'}`}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;