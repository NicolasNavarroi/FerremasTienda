import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/auth';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    clave: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/usuarios/registrar', formData);
      if (response.data.success) {
        alert('¡Registro exitoso! Ahora puedes iniciar sesión');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar');
    }
  };

  return (
    <div className="register-container">
      <h2>Registro de Cliente</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username*"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
        />
        <input
          type="email"
          placeholder="Email*"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="Contraseña*"
          value={formData.clave}
          onChange={(e) => setFormData({...formData, clave: e.target.value})}
          required
          minLength="6"
        />
        <button type="submit">Registrarse</button>
      </form>

      <p>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
};