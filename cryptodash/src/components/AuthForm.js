import React, { useState } from 'react';
import axios from 'axios';
import './AuthForm.css';
import logo from '../assets/logo.svg';
import eyeBlock from '../assets/eye-block.png';
import eye from '../assets/eye.png';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showLoginErrorPopup, setShowLoginErrorPopup] = useState(false);
  const [showRegisterSuccessPopup, setShowRegisterSuccessPopup] = useState(false);



  const toggleForm = (formType) => {
    if (formType === 'login') {
      setIsLogin(true);
    } else if (formType === 'register') {
      setIsLogin(false);
    }
  };
  
  const navigate = useNavigate();

  const loginUser = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3001/login', { email, password });
      const token = response.data.token; // Asume que el token se envía en la respuesta
      const userEmail = response.data.email; // Recupera el correo electrónico desde la respuesta
      const verificationStatus = response.data.verificationStatus; // Recupera el estado de verificación
      localStorage.setItem('authToken', token); // Guarda el token en el almacenamiento local
      localStorage.setItem('userEmail', userEmail); // Almacena el correo electrónico en el almacenamiento local
      localStorage.setItem('verificationStatus', verificationStatus);
      navigate('/dashboard');
    } catch (error) {
      setShowLoginErrorPopup(true);
    }
  };

  const registerUser = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3001/register', { email, password });
      setShowRegisterSuccessPopup(true); // Muestra el popup de registro exitoso
      loginUser(email, password); // Inicia sesión con los datos registrados
    } catch (error) {
      setErrorMessage('Error al registrar. Inténtalo de nuevo.');
    }
  };
  



  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    registerUser(registerEmail, registerPassword);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    loginUser(loginEmail, loginPassword);
  };

  const handleInputChange = (e, inputType) => {
    const value = e.target.value;
    if (inputType === 'loginEmail') {
      setLoginEmail(value);
    } else if (inputType === 'loginPassword') {
      setLoginPassword(value);
    } else if (inputType === 'registerEmail') {
      setRegisterEmail(value);
    } else if (inputType === 'registerPassword') {
      setRegisterPassword(value);
      validatePassword(value); // Llama a la función de validación aquí
    } else if (inputType === 'confirmPassword') {
      setConfirmPassword(value);
    }
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (password.length < 8 || !hasUpperCase || !hasSpecialChar || !hasNumber) {
      setPasswordError('La clave debe tener 8 caracteres mínimo, 1 mayúscula, 1 carácter especial y 1 número.');
    } else {
      setPasswordError('');
    }
  };

  

  // Calcula si el botón de inicio de sesión debe estar deshabilitado
  const isLoginButtonDisabled = isLogin && (loginEmail === '' || loginPassword === '');
  const isPasswordMismatch = registerPassword !== confirmPassword;
  // Calcula si el botón de registro debe estar deshabilitado
  const isRegisterButtonDisabled = !isLogin && (
    registerEmail === '' ||
    registerPassword === '' ||
    confirmPassword === '' ||
    isPasswordMismatch ||
    !acceptTerms
  );

  return (
    <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit}>
      <div className="auth-page-container">
        <div className="return-to-home">
          <a href="/">Regresar al inicio</a> {/* Enlace para regresar al inicio */}
        </div>
        <div className="auth-logo-container">
          <img src={logo} alt="React Logo" />
          {/* Otro contenido a la izquierda del formulario aquí */}
        </div>
        <div className="form-container-log">
          <div className="inner-form-container-log">
            <div className="form-header-log">
            <button type="button" className={isLogin ? 'active' : ''} onClick={() => toggleForm('login')}>Iniciar Sesión</button>
            <button type="button" className={!isLogin ? 'active' : ''} onClick={() => toggleForm('register')}>Registrarse</button>

            </div>
            <div className="form-content-log">
              {isLogin ? (
                <div id="login-form" className="form">
                  <div className="email-container">
                      <input
                      type="email"
                      placeholder="Correo electrónico"
                      value={loginEmail}
                      onChange={(e) => handleInputChange(e, 'loginEmail')}
                      />
                  </div>
                  <div className="password-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Contraseña"
                      value={loginPassword}
                      onChange={(e) => handleInputChange(e, 'loginPassword')}
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
                    <button className="login-button" disabled={isLoginButtonDisabled}>Iniciar Sesión</button>
                  </div>
                </div>
              ) : (
                <div id="register-form" className="form">
                  <div className="email-container">
                    <input
                      type="email"
                      placeholder="Correo electrónico"
                      value={registerEmail}
                      onChange={(e) => handleInputChange(e, 'registerEmail')}
                    />
                  </div>
                  <div className="password-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Contraseña"
                      value={registerPassword}
                      onChange={(e) => handleInputChange(e, 'registerPassword')}
                    />
                    <img
                      src={showPassword ? eye : eyeBlock}
                      alt="Toggle Password Visibility"
                      className="password-toggle-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </div>
                  {passwordError && <div className="password-error">{passwordError}</div>} {/* Muestra el mensaje de error aquí */}
                  <div className="password-container">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repetir Contraseña"
                      value={confirmPassword}
                      onChange={(e) => handleInputChange(e, 'confirmPassword')}
                    />
                    <img
                      src={showConfirmPassword ? eye : eyeBlock}
                      alt="Toggle Password Visibility"
                      className="password-toggle-icon"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  </div>
                  {isPasswordMismatch && <div className="password-mismatch-error">Las contraseñas no coinciden</div>}
                  <div className="terms-container">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={() => setAcceptTerms(!acceptTerms)}
                    />
                    <label>Al registrarse acepta los <a href="/terms">términos de servicio</a> y la <a href="/privacy">política de privacidad</a></label>
                  </div>
                  <div className="register-button-container">
                    <button className="register-button" disabled={isRegisterButtonDisabled}>Registrarse</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
        {errorMessage && <div className="error-message-log">{errorMessage}</div>}
        {showLoginErrorPopup && (
          <div className="login-error-popup">
            <div className="login-error-popup-content">
              <p>Los datos ingresados no son correctos.</p>
              <a href="/forgot-password">Recuperar contraseña</a>
              <div className="login-error-popup-button">
                <button onClick={() => setShowLoginErrorPopup(false)}>Reintentar</button>
              </div>
            </div>
          </div>
        )}
        {showRegisterSuccessPopup && (
          <div className="login-error-popup">
            <div className="login-error-popup-content">
              <p>Registro exitoso</p>
              <div className="login-error-popup-button">
                <button onClick={() => setShowRegisterSuccessPopup(false)}>Aceptar</button>
              </div>
            </div>
          </div>
        )}
    </form>
  );
};

export default AuthForm;



