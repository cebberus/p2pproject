//App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './utils/ProtectedRoute';
import Home from './views/Home'; // Importa el componente Home
import AuthPage from './views/AuthPage';
import Dashboard from './views/Dashboard'; // Importa el componente Dashboard
import Enviar from './views/Enviar';
import Recibir from './views/Recibir';
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
          <Route path="/enviar" element={<ProtectedRoute><Enviar /></ProtectedRoute>} />
          <Route path="/recibir" element={<ProtectedRoute><Recibir /></ProtectedRoute>} />
          <Route path="/intercambiar" element={<ProtectedRoute><Intercambiar /></ProtectedRoute>} />
          <Route path="/verificationpage" element={<ProtectedRoute><FormDataProvider><VerificationPage /></FormDataProvider></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
