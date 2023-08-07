import React from 'react';
import './Header.css'; // Importamos los estilos que crearemos en el siguiente paso
import logo from '../../assets/logo.svg';


function Header() {
  return (
    <header className="header-container">
      <div className="logo-container">
        {/* Aquí puedes insertar tu logo, por ejemplo: */}
        <img src={logo} alt="CryptoDash Logo" />
      </div>
      <nav className="nav-links">
        <a href="#nosotros">Nosotros</a>
        <a href="#Blog">Blog</a>
        <a href="#contacto">Contacto</a>
        <a href="#ayuda">Ayuda</a>
      </nav>
      <div className="auth-buttons">
        <button className="login-btn">Inicio de Sesión</button>
        <button className="register-btn">Registrarse</button>
      </div>
    </header>
  );
}

export default Header;
