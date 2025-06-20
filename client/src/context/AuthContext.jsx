import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    loading: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const user = authApi.getCurrentUser();
      setAuthState({
        user,
        loading: false
      });
    };
    initializeAuth();
  }, []);

  const login = async (credentials) => {
  try {
    const response = await authApi.login(credentials);
    setAuthState({
      user: response.user,
      loading: false
    });
    
    // Redirigir según rol después de login exitoso
    if (response.user.tipo === 1) {
      navigate('/admin/usermanagement');
    } else if (response.user.tipo === 2) {
      navigate('/employee/productmanagement');
    } else {
      navigate('/profile');
    }
    
    return response;
  } catch (error) {
    setAuthState(prev => ({ ...prev, loading: false }));
    throw error;
  }
};

  const logout = () => {
    authApi.logout();
    setAuthState({
      user: null,
      loading: false
    });
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      isAdmin: authState.user?.tipo === 1,
      isEmployee: authState.user?.tipo === 2,
      isClient: authState.user?.tipo === 3
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);