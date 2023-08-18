//App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './utils/ProtectedRoute';
import Home from './views/Home'; // Importa el componente Home
import AuthPage from './views/AuthPage';
import Dashboard from './views/Dashboard'; // Importa el componente Dashboard
import EnviarRecibir from './views/EnviarRecibir';
import DepositarRetirar from './views/DepositarRetirar';
import Intercambiar from './views/Intercambiar';
import VerificationPage from './views/VerificationPage';
import { FormDataProvider } from './components/forms/FormDataContext';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/Enviar-Recibir" element={<ProtectedRoute><EnviarRecibir /></ProtectedRoute>} />
          <Route path="/Depositar-Retirar" element={<ProtectedRoute><DepositarRetirar /></ProtectedRoute>} />
          <Route path="/intercambiar" element={<ProtectedRoute><Intercambiar /></ProtectedRoute>} />
          <Route path="/verificationpage" element={<ProtectedRoute><FormDataProvider><VerificationPage /></FormDataProvider></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
