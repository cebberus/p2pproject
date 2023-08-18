import React from 'react';
import './Header.css'; 
import logo from '../assets/logo.svg';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header-container">
      <div className="header-content">
        <div className="logo-container">
          <img src={logo} alt="CryptoDash Logo" />
        </div>
        <nav className="nav-links">
          <div className="nav-item"><a href="#nosotros">Nosotros</a></div>
          <div className="nav-item"><a href="#Blog">Blog</a></div>
          <div className="nav-item"><a href="#contacto">Contacto</a></div>
          <div className="nav-item"><a href="#ayuda">Ayuda</a></div>
        </nav>
        <div className="auth-buttons">
          <Link to="/auth" className="login-btn">Inicio de Sesión</Link>
          <Link to="/auth" className="register-btn">Registrarse</Link>
        </div>
      </div>
    </header>
  );
}

export default Header;

