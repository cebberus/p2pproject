import React from 'react';
import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="parallax-layer">
        {/* Aquí puedes agregar contenido para la primera capa del efecto parallax */}
      </div>
      <div className="parallax-layer">
        {/* Aquí puedes agregar contenido para la segunda capa del efecto parallax */}
      </div>
      <div className="loading-text">Loading...</div>
    </div>
  );
};

export default Loading;
