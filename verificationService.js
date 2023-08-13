const axios = require('axios');
const { createWorker } = require('tesseract.js');
const fs = require('fs');
const { preprocessImage } = require('./utils/preprocessImage');

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

const extractTextFromImages = async (token) => {
  try {
    const worker = await createWorker({
      logger: m => console.log(m)
    });
    await worker.loadLanguage('spa');
    await worker.initialize('spa');

    const response = await axios.get('http://localhost:3001/formData', {
      headers: { 'Authorization': token },
    });
    const { frontImage, backImage, selfieImage } = response.data.documentUploadInformation;

    // Decodificar las imágenes desde Base64
    const frontImageBuffer = Buffer.from(frontImage.split(',')[1], 'base64');
    const backImageBuffer = Buffer.from(backImage.split(',')[1], 'base64');
    const selfieImageBuffer = Buffer.from(selfieImage.split(',')[1], 'base64');

    const preprocessedFrontImageBuffer = await preprocessImage(frontImageBuffer);
    const preprocessedBackImageBuffer = await preprocessImage(backImageBuffer);
    const preprocessedSelfieImageBuffer = await preprocessImage(selfieImageBuffer);

    // Guardar las imágenes en archivos temporales
    fs.writeFileSync('preprocessedFrontImage.png', preprocessedFrontImageBuffer);
    fs.writeFileSync('preprocessedBackImage.png', preprocessedBackImageBuffer);
    fs.writeFileSync('preprocessedSelfieImage.png', preprocessedSelfieImageBuffer);

    // Utilizar Tesseract para extraer el texto de las imágenes
    const { data: frontImageText } = await worker.recognize('preprocessedFrontImage.png');
    const { data: backImageText } = await worker.recognize('preprocessedBackImage.png');
    const { data: selfieImageText } = await worker.recognize('preprocessedSelfieImage.png');
    await worker.terminate();

    // Devolver los textos extraídos
    return { frontImageText: frontImageText.text, backImageText: backImageText.text, selfieImageText: selfieImageText.text };
  } catch (error) {
    console.error('Ocurrió un error durante la extracción de texto:', error);
    throw error;
  }
};

module.exports = { loginAndGetToken, extractTextFromImages };
