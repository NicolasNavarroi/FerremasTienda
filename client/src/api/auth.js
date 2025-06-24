// src/api/auth.js
import api from './config';
import axios from './config';

export const login = async (credentials) => {
  try {
    const { data } = await api.post('/auth/login', credentials);

    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return {
      token: data.token,
      user: data.user
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const register = async({username, email, password}) => {
  const res = await axios.post('/auth/register',{
    username,
    email,
    password
  });
  return res.data;
};

export const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('auth_token');
  return user && token ? { ...user, token } : null;
};

export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};
