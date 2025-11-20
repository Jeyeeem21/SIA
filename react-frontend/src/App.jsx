import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Orders from './pages/Orders'
import Reports from './pages/Reports'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Customers from './pages/Customers'
import Invoices from './pages/Invoices'
import Settings from './pages/Settings'
import Staff from './pages/Staff'
import Rentals from './pages/Rentals'
import TogaRentals from './pages/TogaRentals'
import Toast from './components/Toast'
import Pos from './pages/staff/Pos'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toast />
        <Routes>
          {/* Public Routes (No Sidebar) */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Staff POS Route */}
          <Route 
            path="/pos" 
            element={
              <ProtectedRoute>
                <Pos />
              </ProtectedRoute>
            } 
          />
        
          {/* Protected Admin Routes (With Sidebar) */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="orders" element={<Orders />} />
            <Route path="staff" element={<Staff />} />
            <Route path="customers" element={<Customers />} />
            <Route path="rentals" element={<Rentals />} />
            <Route path="toga-rentals" element={<TogaRentals />} />
            <Route path="reports" element={<Reports />} />
            {/* <Route path="invoices" element={<Invoices />} /> */}
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
