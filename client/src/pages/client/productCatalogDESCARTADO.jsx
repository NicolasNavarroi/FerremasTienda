  // src/pages/ProductCatalog.jsx
  import { useState, useEffect } from 'react';
  import { Link } from 'react-router-dom';
  import { getProducts } from '../api/products';
  import { FaSearch, FaFilter, FaShoppingCart, FaStar } from 'react-icons/fa';
  import { Navbar } from '../components/Navbar';
  import { useCart } from '../context/CartContexto'; // 👈 IMPORTANTE
  import "../styles/ProductCatalog.css";

  export const ProductCatalog = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
      category: '',
      minPrice: '',
      maxPrice: ''
    });

    const { addToCart } = useCart(); // 👈 USO DEL CONTEXTO

    useEffect(() => {
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts(filters);
      
      // Debug: Ver respuesta de la API
      console.log('API Response:', response);
      
      // Manejo robusto de la respuesta
      let productsData = [];
      if (Array.isArray(response)) {
        productsData = response;
      } else if (response && Array.isArray(response.data)) {
        productsData = response.data;
      } else {
        console.error('Formato de respuesta inesperado:', response);
      }

      const productsWithImages = productsData.map(product => ({
        ...product,
        imagen: product.imagen 
          ? `${process.env.VITE_API_URL.replace('/api/v1', '')}${product.imagen}`
          : '/placeholder-product.jpg'
      }));

      setProducts(productsWithImages);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, [filters]);

// Cambia handleSearch para usar el filtro del backend
const handleSearch = (e) => {
  e.preventDefault();
  setFilters(prev => ({ ...prev, search: searchTerm }));
  setSearchTerm(''); // Limpia el campo de búsqueda
};

    const filteredProducts = products.filter(product =>
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading">Cargando productos...</div>;

    return (
      <div className="product-page">
        <Navbar />

        <div className="catalog-container">
          <div className="catalog-header">
            <h1>Catálogo de Productos Version Nico</h1>

            <div className="search-filter-container">
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-wrapper">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button type="submit">Buscar</button>
              </form>

              <div className="filter-section">
                <button
                  className="filter-toggle"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter /> Filtros
                </button>

                {showFilters && (
                  <div className="filter-dropdown">
                    <div className="filter-group">
                      <label>Categoría:</label>
                      <select
                        value={filters.category}
                        onChange={(e) =>
                          setFilters({ ...filters, category: e.target.value })
                        }
                      >
                        <option value="">Todas</option>
                        <option value="Herramientas manuales">Herramientas</option>
                        <option value="Materiales eléctricos">Eléctricos</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Precio mínimo:</label>
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) =>
                          setFilters({ ...filters, minPrice: e.target.value })
                        }
                        placeholder="Mínimo"
                      />
                    </div>
                    <div className="filter-group">
                      <label>Precio máximo:</label>
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          setFilters({ ...filters, maxPrice: e.target.value })
                        }
                        placeholder="Máximo"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <div key={product.idProducto} className="product-card">
                  <Link to={`/products/${product.idProducto}`}>
                    <div className="product-image-container">
                      <img
                        src={product.imagen}
                        alt={product.nombre}
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>
                  </Link>

                  <div className="product-info">
                    <h3>{product.nombre}</h3>
                    <div className="product-meta">
                      <span className="product-category">{product.categoria}</span>
                      <div className="product-rating">
                        <FaStar className="star-icon" />
                        <span>4.5</span>
                      </div>
                    </div>
                    <div className="product-footer">
                      <span className="product-price">${product.precio.toLocaleString()}</span>
                      <button
                        className="add-to-cart"
                        onClick={() => addToCart(product)} // 👈 AHORA FUNCIONA
                      >
                        <FaShoppingCart />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>No se encontraron productos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
