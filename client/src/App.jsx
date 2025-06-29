  import { BrowserRouter, Routes, Route } from 'react-router-dom';
  import { AuthProvider } from './context/AuthContext';
  import { CartProvider } from "./context/CartContexto"; 
  import { LoginPage } from './pages/LoginPage';
  import { RegisterPage } from './pages/RegisterPage';
  import { HomePage } from './pages/HomePage';
  import { ProductCatalog } from './pages/ProductCatalog';
  import { ProductDetail } from './pages/ProductDetail';
  import CartPage from './pages/client/cartPage';
  import { ProfilePage } from './pages/client/ProfilePage';
  import PaymentResult from './pages/client/pagoExitoso';
  import { PrivateRoute } from './components/PrivateRoute';
  import { DashboardLayout } from './components/DashboardLayout';
  import { UserManagement } from './pages/admin/UserManagement';
  import { ProductManagement } from './pages/employee/ProductManagement';
  import { NewProductPage } from './pages/employee/NewProductPage';
  import { EditProductPage } from './pages/employee/EditProductPage';
  import { InventoryPage } from './pages/employee/InventoryPage';
  import { AdminStats } from './pages/admin/AdminStats';
  import { SalesMonitoring } from './pages/admin/SalesMonitoring';

  function App() {
    return (
      <BrowserRouter>
        <AuthProvider>
          <CartProvider> {/* Envuelve todo con CartProvider */}
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/products" element={<ProductCatalog />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/payment-result" element={<PaymentResult />} />


              {/* Rutas protegidas - Layout común */}
              <Route element={<PrivateRoute allowedRoles={[1, 2, 3]}><DashboardLayout /></PrivateRoute>}>
                {/* Rutas específicas para cada rol */}
                <Route path="/admin/usermanagement" element={
                  <PrivateRoute allowedRoles={[1]}>
                    <UserManagement />
                  </PrivateRoute>
                } />

                <Route path="/admin/stats" element={
                  <PrivateRoute allowedRoles={[1]}>
                    <AdminStats />
                  </PrivateRoute>
                } />
                
                <Route path="/admin/sales-monitoring" element={
                  <PrivateRoute allowedRoles={[1]}>
                    <SalesMonitoring />
                  </PrivateRoute>
                } />

                <Route path="/employee/productmanagement" element={
                  <PrivateRoute allowedRoles={[2]}>
                    <ProductManagement />
                  </PrivateRoute>
                } />

                <Route path="/employee/products/new" element={
                  <PrivateRoute allowedRoles={[2]}>
                    <NewProductPage />
                  </PrivateRoute>
                } />

                <Route path="/employee/products/edit/:id" element={
                  <PrivateRoute allowedRoles={[2]}>
                    <EditProductPage />
                  </PrivateRoute>
                } />

                <Route path="/employee/inventory" element={
                  <PrivateRoute allowedRoles={[2]}>
                    <InventoryPage />
                  </PrivateRoute>
                } />

                {/* Nueva ruta para el carrito (accesible para clientes - rol 3) */}
                <Route path="/cart" element={
                  <PrivateRoute allowedRoles={[3]}>
                    <CartPage />
                  </PrivateRoute>
                } />

                <Route path="/profile" element={
                  <PrivateRoute allowedRoles={[3]}>
                    <ProfilePage />
                  </PrivateRoute>
                } />
              </Route>
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  }

  export default App;