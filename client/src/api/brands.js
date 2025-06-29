import api from './config';

/**
 * Servicio para manejar operaciones con marcas
 */

/**
 * Obtiene todas las marcas
 * @returns {Promise<Array>} Lista de marcas
 */
export const getBrands = async () => {
  try {
    const response = await api.get('/marcas');
    
    // Adaptación para diferentes formatos de respuesta
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data; // Si la respuesta viene en formato { data: [...] }
    } else if (Array.isArray(response.data)) {
      return response.data; // Si la respuesta viene directamente como array
    }
    
    throw new Error('Formato de respuesta inesperado');
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    throw error.response?.data || { 
      error: 'Error al obtener marcas',
      details: error.message
    };
  }
};

/**
 * Obtiene una marca por su ID
 * @param {number} id - ID de la marca
 * @returns {Promise<Object>} Datos de la marca
 */
export const getBrandById = async (id) => {
  try {
    const response = await api.get(`/marcas/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener marca con ID ${id}:`, error);
    throw error.response?.data || {
      error: `Error al obtener marca con ID ${id}`,
      details: error.message
    };
  }
};

/**
 * Crea una nueva marca (solo admin)
 * @param {Object} brandData - Datos de la marca
 * @param {File} [logo] - Archivo de imagen del logo
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const createBrand = async (brandData, logo) => {
  try {
    const formData = new FormData();
    
    // Añadir datos al FormData
    Object.keys(brandData).forEach(key => {
      formData.append(key, brandData[key]);
    });
    
    // Añadir imagen si existe
    if (logo) {
      formData.append('logo', logo);
    }

    const response = await api.post('/marcas', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al crear marca:', error);
    throw error.response?.data || {
      error: 'Error al crear marca',
      details: error.message
    };
  }
};

/**
 * Actualiza una marca existente (solo admin)
 * @param {number} id - ID de la marca
 * @param {Object} updates - Campos a actualizar
 * @param {File} [newLogo] - Nuevo archivo de logo (opcional)
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const updateBrand = async (id, updates, newLogo) => {
  try {
    const formData = new FormData();
    
    // Añadir datos al FormData
    Object.keys(updates).forEach(key => {
      formData.append(key, updates[key]);
    });
    
    // Añadir nueva imagen si existe
    if (newLogo) {
      formData.append('logo', newLogo);
    }

    const response = await api.put(`/marcas/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar marca con ID ${id}:`, error);
    throw error.response?.data || {
      error: `Error al actualizar marca con ID ${id}`,
      details: error.message
    };
  }
};

/**
 * Elimina una marca (solo admin)
 * @param {number} id - ID de la marca
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const deleteBrand = async (id) => {
  try {
    const response = await api.delete(`/marcas/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar marca con ID ${id}:`, error);
    throw error.response?.data || {
      error: `Error al eliminar marca con ID ${id}`,
      details: error.message
    };
  }
};

/**
 * Carga inicial de logos (solo admin)
 * @param {File[]} logos - Array de archivos de logos
 * @returns {Promise<Object>} Resultados de la carga
 */
export const bulkUploadLogos = async (logos) => {
  try {
    const formData = new FormData();
    
    // Añadir cada logo al FormData
    logos.forEach((logo, index) => {
      formData.append(`logos`, logo);
    });

    const response = await api.post('/marcas/carga-inicial', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error en carga inicial de logos:', error);
    throw error.response?.data || {
      error: 'Error en carga inicial de logos',
      details: error.message
    };
  }
};