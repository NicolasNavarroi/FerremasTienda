import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import './Landing.css'; // Asegúrate de tener este archivo con estilos

export const HomePage = () => {
  const { user } = useAuth();

  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    const fullText = ' ¡Bienvenidos a Ferremas!';
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(prev => prev + fullText.charAt(index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="landing-page">
      <Navbar />

      <section className="hero">
        <div className="hero-content">
          <h1>{typedText}<span className="cursor">|</span></h1>
          <p>Tu ferretería de confianza con productos de calidad y atención profesional.</p>

          {!user && (
            <div className="auth-buttons">
              <a href="/login" className="btn-primary">Iniciar sesión</a>
              <a href="/register" className="btn-secondary">Registrarse</a>
            </div>
          )}
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <span className="icon">🛠️</span>
          <h3>Herramientas de calidad</h3>
          <p>Marcas reconocidas y materiales certificados.</p>
        </div>
        <div className="feature">
          <span className="icon">🚚</span>
          <h3>Entregas rápidas</h3>
          <p>Envíos seguros a todo el país en tiempo récord.</p>
        </div>
        <div className="feature">
          <span className="icon">📞</span>
          <h3>Asistencia profesional</h3>
          <p>Expertos que te asesoran en cada paso.</p>
        </div>
      </section>

      <section className="cta-section">
        <h2>Explora nuestro catálogo</h2>
        <p>Encuentra justo lo que necesitas para tus proyectos.</p>
        <a href="/products" className="btn-primary">Ver productos</a>
      </section>
    </div>
  );
};
