import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useAuth } from '../contexts/AuthContext';


const MainLayout = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar - Only for Admins */}
      {isAdmin && (
        <div className="hidden md:block">
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto overflow-x-hidden ${isAdmin ? 'md:pb-0' : ''} pb-16 md:pb-0`}>
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation - Only for Admins */}
      {isAdmin && (
        <div className="md:hidden">
          <MobileBottomNav />
        </div>
      )}
    </div>
  );
};

export default MainLayout;
