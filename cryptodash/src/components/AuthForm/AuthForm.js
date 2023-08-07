import React, { useState } from 'react';
import './AuthForm.css';
import logo from '../../assets/logo.svg';
import eyeBlock from '../../assets/eye-block.png';
import eye from '../../assets/eye.png';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleInputChange = (e, inputType) => {
    const value = e.target.value;
    if (inputType === 'email') {
      setEmail(value);
    } else {
      setPassword(value);
    }
    setIsButtonDisabled(!value || (inputType === 'email' ? !password : !email));
  };

  return (
    <div className="auth-page-container">
      <div className="auth-logo-container">
        <img src={logo} alt="React Logo" />
        {/* Otro contenido a la izquierda del formulario aquí */}
      </div>
      <div className="form-container">
        <div className="inner-form-container">
          <div className="form-header">
            <button className={isLogin ? 'active' : ''} onClick={toggleForm}>Iniciar Sesión</button>
            <button className={!isLogin ? 'active' : ''} onClick={toggleForm}>Registrarse</button>
          </div>
          <div className="form-content">
            {isLogin ? (
              <div id="login-form" className="form">
                <div className="email-container">
                    <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => handleInputChange(e, 'email')}
                    />
                </div>
                <div className="password-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => handleInputChange(e, 'password')}
                  />
                  <img
                    src={showPassword ? eye : eyeBlock}
                    alt="Toggle Password Visibility"
                    className="password-toggle-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
                <div className="forgot-container">
                    <a className="forgot-pass" href="/forgot-password">He olvidado mi contraseña</a>
                </div>
                <div className="login-button-container">
                    <button className="login-button" disabled={isButtonDisabled}>Iniciar Sesión</button>
                </div>
              </div>
            ) : (
              <div id="register-form" className="form">
                {/* Contenido del formulario de registro */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;



