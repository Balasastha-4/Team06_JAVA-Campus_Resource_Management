import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';
import Resources from './pages/Resources';
import Library from './pages/Library';
import DepartmentRequirements from './pages/DepartmentRequirements';
import Events from './pages/Events';
import Complaints from './pages/Complaints';
import Users from './pages/Users';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['STUDENT', 'STAFF', 'ADMIN', 'HOD']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/resources" element={
            <ProtectedRoute allowedRoles={['STUDENT', 'STAFF', 'ADMIN', 'HOD']}>
              <Resources />
            </ProtectedRoute>
          } />

          {/* Modified /library route and added /department/requirements */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'HOD', 'STAFF', 'STUDENT']} />}>
            <Route path="/library" element={<Library />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'HOD']} />}>
            <Route path="/department/requirements" element={<DepartmentRequirements />} />
          </Route>

          <Route path="/events" element={
            <ProtectedRoute allowedRoles={['STUDENT', 'STAFF', 'ADMIN', 'HOD']}>
              <Events />
            </ProtectedRoute>
          } />

          {/* Modified /complaints route */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'STAFF', 'ADMIN', 'HOD']} />}>
            <Route path="/complaints" element={<Complaints />} />
          </Route>

          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Users />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastContainer position="top-right" theme="colored" />
    </>
  );
}

export default App;
