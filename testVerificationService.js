// testVerificationService.js
const verificationService = require('./verificationService');
const testVerificationService = async () => {
  try {
    // Datos de inicio de sesión (reemplaza estos valores con los datos reales)
    const email = 'fco.quinteromunoz@gmail.com';
    const password = 'B0nn3l3s123#';

    // Iniciar sesión y obtener el token
    const token = await verificationService.loginAndGetToken(email, password);
    console.log('Token obtenido:', token);

    // Extraer el texto de las imágenes
    const extractedTexts = await verificationService.extractTextFromImages(token);
    console.log('Textos extraídos:', extractedTexts);
  } catch (error) {
    console.error('Ocurrió un error durante la prueba:', error);
  }
};

// Ejecutar la prueba
testVerificationService();
