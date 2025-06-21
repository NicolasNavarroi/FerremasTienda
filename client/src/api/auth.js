// src/api/auth.js
import api from './config';

export const login = async (credentials) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return {
      ...data,
      isAdmin: data.user.tipo === 1,
      isEmployee: data.user.tipo === 2,
      isClient: data.user.tipo === 3
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const registerEmployee = async (employeeData) => {
  try {
    const { data } = await api.post('/admin/trabajadores', employeeData);
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? {
    ...user,
    isAdmin: user.tipo === 1,
    isEmployee: user.tipo === 2,
    isClient: user.tipo === 3
  } : null;
};