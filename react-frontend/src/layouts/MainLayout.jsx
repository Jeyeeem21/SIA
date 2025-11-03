import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';


const MainLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
