import api from './config';

/**
 * Obtiene productos (versión para empleados - sin filtro de stock obligatorio)
 */
export const getProducts = async (filters = {}) => {
  try {
    const { data } = await api.get('/productos', { 
      params: {
        categoria: filters.category,
        marca: filters.brand,
        precioMin: filters.minPrice,
        precioMax: filters.maxPrice,
        stockMin: filters.stockMin // Filtro opcional
      }
    });
    return data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al obtener productos' };
  }
};

/**
 * Obtiene productos disponibles para clientes (filtra solo con stock)
 */
export const getAvailableProducts = async (filters = {}) => {
  try {
    const { data } = await api.get('/productos/clientes/disponibles', {
      params: {
        categoria: filters.category,
        marca: filters.brand,
        precioMin: filters.minPrice,
        precioMax: filters.maxPrice
        // stockMin: 1 ya está forzado en el backend
      }
    });
    return data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al obtener productos disponibles' };
  }
};

/**
 * Obtiene un producto por ID (común para ambos roles)
 */
export const getProductById = async (id) => {
  try {
    const { data } = await api.get(`/productos/${id}`);
    return data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al obtener producto' };
  }
};

/**
 * Obtiene detalles extendidos (historial de precios, etc.)
 */
export const getProductDetails = async (id) => {
  try {
    const { data } = await api.get(`/productos/${id}`, {
      params: {
        historial: true,
        sucursal: 1
      }
    });
    return data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al obtener detalles' };
  }
};