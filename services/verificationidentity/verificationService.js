const vision = require('@google-cloud/vision');
const axios = require('axios');
const path = require('path');
const utilsPath = path.join(__dirname);
const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, 'google-vision.json'),
});
const faceapi = require('face-api.js');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const fs = require('fs').promises;
const { facialRecognition} = require('./facialRecognition');


const frontImagePath = path.join(utilsPath, 'frontImage.png');
const backImagePath = path.join(utilsPath, 'backImage.png');
const selfieImagePath = path.join(utilsPath, 'selfieImage.png');

const extractTextFromImages = async (token) => {
  try {
    const response = await axios.get('http://localhost:3001/formData', {
      headers: { 'Authorization': token },
    });
    const { frontImage, backImage, selfieImage } = response.data.documentUploadInformation;

    const frontImageBuffer = Buffer.from(frontImage.split(',')[1], 'base64');
    const backImageBuffer = Buffer.from(backImage.split(',')[1], 'base64');
    const selfieImageBuffer = Buffer.from(selfieImage.split(',')[1], 'base64');

    await fs.writeFile(frontImagePath, frontImageBuffer);
    await fs.writeFile(backImagePath, backImageBuffer);
    await fs.writeFile(selfieImagePath, selfieImageBuffer);

    const [frontImageResult] = await client.textDetection(frontImagePath);
    const [backImageResult] = await client.textDetection(backImagePath);

    const frontImageText = frontImageResult.textAnnotations[0].description;
    const backImageText = backImageResult.textAnnotations[0].description;

    return { frontImageText, backImageText };
  } catch (error) {
    console.error('Ocurrió un error durante la extracción de texto:', error);
    throw error;
  }
};

const verifyDataWithForm = async (token) => {
  try {
    // Obtener los datos del formulario y las imágenes
    const response = await axios.get('http://localhost:3001/formData', {
      headers: { 'Authorization': token },
    });
    const extractedTexts = await extractTextFromImages(token);
    const formData = response.data;
    const personalData = formData.personalInformation;
    const documentData = formData.documentInformation;

    const frontImageText = extractedTexts.frontImageText.replace(/ñ/gi, 'n').replace(/\n/g, ' ').replace(/\s+/g, ' ').toUpperCase();
    const backImageText = extractedTexts.backImageText.replace(/ñ/gi, 'n').replace(/</g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').toUpperCase();
    const backImageWords = backImageText.split(' ');
    const apellidosArray = personalData.apellidos.replace(/ñ/gi, 'n').toUpperCase().split(' ');

    const matchResults = {
      isNameMatch: false,
      isLastNameMatch: false,
      isSexMatch: false,
      isDOBDayMatch: false,
      isDOBMonthMatch: false,
      isDOBYearMatch: false,
      isRutMatch: false,
      isBackNameMatch: false,
      isBackLastNameMatch: false
    };

    matchResults.isNameMatch = personalData.nombres.toUpperCase().split(' ').every(name => frontImageText.includes(name));
    matchResults.isLastNameMatch = apellidosArray.every(lastName => frontImageText.includes(lastName));
    matchResults.isSexMatch = (personalData.sexo === "Masculino" && frontImageText.includes("M")) || 
                              (personalData.sexo === "Femenino" && frontImageText.includes("F"));
    matchResults.isDOBDayMatch = frontImageText.includes(personalData.fechaNacimiento.split('/')[0]);
    const monthNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    const dobMonth = personalData.fechaNacimiento.split('/')[1];
    const dobMonthName = monthNames[parseInt(dobMonth, 10) - 1];
    matchResults.isDOBMonthMatch = frontImageText.includes(dobMonthName);
    matchResults.isDOBYearMatch = frontImageText.includes(personalData.fechaNacimiento.split('/')[2]);
    const cleanedFrontImageText = frontImageText.replace(/[.-]/g, '');
    matchResults.isRutMatch = cleanedFrontImageText.includes(documentData.rut);

    matchResults.isBackNameMatch = backImageText.includes(personalData.nombres.toUpperCase());
    matchResults.isBackLastNameMatch = apellidosArray.every(lastName => backImageWords.includes(lastName));

    const totalChecks = 9;
    const successfulChecks = Object.values(matchResults).filter(Boolean).length;
    const successRate = (successfulChecks / totalChecks) * 100;

    const isDataMatch = successRate >= 50;
    let facialRecognitionResult = false;
    if (isDataMatch) {
      // Llamar a la función de reconocimiento facial
      facialRecognitionResult = await facialRecognition();
    }

    // Devuelve true si isDataMatch y facialRecognitionResult son verdaderos, y false en caso contrario
    return { success: isDataMatch && facialRecognitionResult };

  } catch (error) {
    console.error('Ocurrió un error durante la verificación:', error);
    return { success: false };
  }
};

module.exports = { verifyDataWithForm};
