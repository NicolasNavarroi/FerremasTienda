// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { ProductCatalog } from './pages/ProductCatalog';
import { ProductDetail } from './pages/ProductDetail';
import { ProfilePage } from './pages/client/ProfilePage';
import { PrivateRoute } from './components/PrivateRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { UserManagement } from './pages/admin/UserManagement';
import { ProductManagement } from './pages/employee/ProductManagement';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Rutas de catálogo (accesibles sin autenticación) */}
          <Route path="/products" element={<ProductCatalog />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* Rutas protegidas con dashboard */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<HomePage />} />
            
            {/* Rutas de Admin */}
            <Route path="/admin/users" element={
              <PrivateRoute allowedRoles={[1]}>
                <UserManagement />
              </PrivateRoute>
            } />
            
            {/* Rutas de Empleado */}
            <Route path="/employee/products" element={
              <PrivateRoute allowedRoles={[2]}>
                <ProductManagement />
              </PrivateRoute>
            } />
            
            {/* Rutas de Cliente */}
            <Route path="/profile" element={
              <PrivateRoute allowedRoles={[3]}>
                <ProfilePage />
              </PrivateRoute>
            }/>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;