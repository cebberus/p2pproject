import React from 'react';
import './Banner.css'; // Importamos los estilos que crearemos en el siguiente paso
import logo from '../assets/logo.svg';

function Banner() {
    return (
      <div className="banner-container">
        <div className="banner-content">
          <h1>El futuro de las criptomonedas en Chile</h1>
          <p>Intercambio P2P seguro y confiable</p>
          <button className="cta-button">Comenzar ahora</button>
        </div>
        <img src={logo} alt="Imagen de fondo del banner" className="banner-image" />
      </div>
    );
  }
  

export default Banner;
