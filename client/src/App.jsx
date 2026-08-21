import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import PLP from './pages/PLP';
import PDP from './pages/PDP';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Orders from './pages/Orders';

import OwnerDashboard from './pages/owner/OwnerDashboard';
import PackageForm from './pages/owner/PackageForm';
import ReceivedBookings from './pages/owner/ReceivedBookings';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/packages" element={<PLP />} />
          <Route path="/packages/:id" element={<PDP />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Tourist */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['tourist']}>
                <Orders />
              </ProtectedRoute>
            }
          />

          {/* Owner */}
          <Route
            path="/owner/packages"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/packages/new"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <PackageForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/packages/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <PackageForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/bookings"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <ReceivedBookings />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin/pending"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}
