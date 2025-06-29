import api from './config';

/**
 * Servicio para manejar operaciones con categorías
 */

/**
 * Obtiene todas las categorías
 * @returns {Promise<Array>} Lista de categorías
 */
export const getCategories = async () => {
  try {
    const response = await api.get('/categorias');
    
    // Adaptación para diferentes formatos de respuesta
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data; // Si la respuesta viene en formato { data: [...] }
    } else if (Array.isArray(response.data)) {
      return response.data; // Si la respuesta viene directamente como array
    }
    
    throw new Error('Formato de respuesta inesperado');
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error.response?.data || { 
      error: 'Error al obtener categorías',
      details: error.message
    };
  }
};

/**
 * Obtiene una categoría por su ID
 * @param {number} id - ID de la categoría
 * @returns {Promise<Object>} Datos de la categoría
 */
export const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/categorias/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener categoría con ID ${id}:`, error);
    throw error.response?.data || {
      error: `Error al obtener categoría con ID ${id}`,
      details: error.message
    };
  }
};

// Nota: En tu backend actual, las categorías solo tienen operación de listado
// Si necesitas CRUD completo, deberías implementar estos métodos adicionales:

/**
 * Crea una nueva categoría (solo admin)
 * @param {Object} categoryData - Datos de la categoría
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/categorias', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error al crear categoría:', error);
    throw error.response?.data || {
      error: 'Error al crear categoría',
      details: error.message
    };
  }
};

/**
 * Actualiza una categoría existente (solo admin)
 * @param {number} id - ID de la categoría
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const updateCategory = async (id, updates) => {
  try {
    const response = await api.put(`/categorias/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar categoría con ID ${id}:`, error);
    throw error.response?.data || {
      error: `Error al actualizar categoría con ID ${id}`,
      details: error.message
    };
  }
};

/**
 * Elimina una categoría (solo admin)
 * @param {number} id - ID de la categoría
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categorias/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar categoría con ID ${id}:`, error);
    throw error.response?.data || {
      error: `Error al eliminar categoría con ID ${id}`,
      details: error.message
    };
  }
};