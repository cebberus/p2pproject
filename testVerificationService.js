const axios = require('axios');

const email = 'fco.quinteromunoz@gmail.com';
const password = 'B0nn3l3s123#';

const loginAndGetToken = async (email, password) => {
  try {
    const response = await axios.post('http://localhost:3001/login', { email, password });
    const token = response.data.token;
    return token;
  } catch (error) {
    console.error('Ocurrió un error durante el inicio de sesión:', error);
    throw error;
  }
};

const testVerification = async (token, verificationData) => {
  try {
    const response = await axios.post('http://localhost:3001/verify', verificationData, {
      headers: { 'Authorization': token },
    });
    console.log('Resultado de la verificación:', response.data);
  } catch (error) {
    console.error('Ocurrió un error durante la verificación:', error);
  }
};

// Datos de verificación (reemplaza esto con los datos reales)
const verificationData = {
  // Tus datos de verificación aquí
};

loginAndGetToken(email, password)
  .then(token => {
    console.log('Token obtenido:', token);
    return testVerification(token, verificationData);
  })
  .catch(error => {
    console.error('Ocurrió un error:', error);
  });


