import { useState, useEffect } from 'react';
import "../../styles/HeroCarousel.css";

export const HeroCarousel = ({ user }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { id: 1, image: '/assets/images/carousel/hero1.jpg', title: 'Bienvenido a nuestra ferretería' },
    { id: 2, image: '/assets/images/carousel/hero2.png', title: 'Productos de calidad' },
    { id: 3, image: '/assets/images/carousel/hero3.jpg', title: 'Ofertas especiales' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="hero-carousel">
      <div 
        className="hero-background" 
        style={{ 
          backgroundImage: `url(${slides[currentSlide].image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>{slides[currentSlide].title}</h1>
          </div>
        </div>
      </div>
      
      <div className="carousel-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};