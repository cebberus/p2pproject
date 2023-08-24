import React from 'react';
import './Banner1.css'; // Importamos los estilos que crearemos en el siguiente paso
import logo from '../../assets/btc-banner.jpg';

function Banner1() {
  return (
    <div className="banner-container">
      <div className="banner-content">
        <h1>El futuro de las criptomonedas en Chile</h1>
        <p>Intercambio P2P seguro y confiable Lorem ipsum dolor sit amet, 
          consectetur adipiscing elit. Duis quis mi nisi. In aliquet auctor tortor,
           quis consectetur eros dignissim non. Pellentesque condimentum orci id suscipit tincidunt.</p>
        <button className="cta-button">Comenzar ahora</button>
      </div>
      <div className="banner-image-container">
        <img src={logo} alt="Imagen de fondo del banner" className="banner-image" />
      </div>
    </div>
  );
}

  

export default Banner1;
