import api from './config';

export const getUsers = async () => {
  try {
    const { data } = await api.get('/admin/trabajadores');
    return data.trabajadores || data; // Adaptación para diferentes estructuras de respuesta
  } catch (error) {
    console.error('Error en getUsers:', error.response?.data || error.message);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const { data } = await api.post('/admin/trabajadores', {
      username: userData.username,
      email: userData.email,
      clave: userData.clave
    });
    return data;
  } catch (error) {
    console.error('Error en createUser:', error.response?.data || error.message);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const { data } = await api.put(`/admin/users/${id}`, userData);
    return data;
  } catch (error) {
    console.error('Error en updateUser:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    await api.delete(`/admin/users/${id}`);
    return id;
  } catch (error) {
    console.error('Error en deleteUser:', error.response?.data || error.message);
    throw error;
  }
};