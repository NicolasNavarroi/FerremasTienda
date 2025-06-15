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
          <Route path="/products" element={<ProductCatalog />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* HomePage accesible a todos */}
          <Route path="/" element={<HomePage />} />

          {/* Rutas protegidas con DashboardLayout */}
          <Route element={<PrivateRoute allowedRoles={[1, 2, 3]}><DashboardLayout /></PrivateRoute>}>
            {/* Rutas de Admin - CORREGIDO */}
            <Route path="/admin/usermanagement" element={
              <PrivateRoute allowedRoles={[1]}>
                <UserManagement />
              </PrivateRoute>
            } />
            {/* Rutas de Empleado - CORREGIDO */}
            <Route path="/employee/productmanagement" element={
              <PrivateRoute allowedRoles={[2]}>
                <ProductManagement />
              </PrivateRoute>
            } />
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