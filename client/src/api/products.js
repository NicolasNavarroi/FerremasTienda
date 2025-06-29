  import api from './config';

  export const getProducts = async (filters = {}) => {
    try {
      console.log("Enviando solicitud con filtros:", filters);
      const response = await api.get('/productos', { params: filters });
      console.log("Respuesta recibida:", response);
      
      // Manejar diferentes formatos de respuesta
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data && Array.isArray(response.data.productos)) {
        return response.data.productos;
      }
      
      throw new Error("Formato de respuesta inesperado");
    } catch (error) {
      console.error("Error en getProducts:", error);
      throw error.response?.data || { 
        error: 'Error al obtener productos',
        details: error.message 
      };
    }
  };

  export const getProductById = async (id) => {
    try {
      const response = await api.get(`/productos/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error en getProductById:", error);
      throw error.response?.data || { error: 'Error al obtener producto' };
    }
  };

  export const createProduct = async (productData) => {
    try {
      // Si hay imagen, usamos FormData
      const formData = new FormData();
      
      Object.keys(productData).forEach(key => {
        if (key === 'imagen' && productData[key]) {
          formData.append('imagen', productData[key]);
        } else {
          formData.append(key, productData[key]);
        }
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      const response = await api.post('/productos', formData, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al crear producto' };
    }
  };

  export const updateProduct = async (id, productData) => {
    try {
      // Si hay imagen, usamos FormData
      const formData = new FormData();
      
      Object.keys(productData).forEach(key => {
        if (key === 'imagen' && productData[key]) {
          formData.append('imagen', productData[key]);
        } else {
          formData.append(key, productData[key]);
        }
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      const response = await api.put(`/productos/${id}`, formData, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al actualizar producto' };
    }
  };

  export const deleteProduct = async (id) => {
    try {
      const response = await api.delete(`/productos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al eliminar producto' };
    }
  };

  export const updateStock = async (id, cantidad) => {
    try {
      const response = await api.patch(`/productos/${id}/stock`, { cantidad });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al actualizar stock' };
    }
  };