import api from './config';

export const getUsers = async (role = null) => {
  const params = role ? { role } : {};
  const { data } = await api.get('/admin/usuarios', { params });
  return data;
};

export const getUser = async (id) => {
  const { data } = await api.get(`/admin/usuarios/${id}`);
  return data;
};

export const createUser = async (userData) => {
  const { data } = await api.post('/admin/usuarios', userData);
  return data;
};

export const updateUser = async (id, userData) => {
  const { data } = await api.put(`/admin/usuarios/${id}`, userData);
  return data;
};

export const deleteUser = async (id) => {
  await api.delete(`/admin/usuarios/${id}`);
  return id;
};