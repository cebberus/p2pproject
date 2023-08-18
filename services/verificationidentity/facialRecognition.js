
const path = require('path');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const utilsPath = path.join(__dirname);
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const modelsPath = path.join(__dirname, '..','..', 'models');


const frontImagePath = path.join(utilsPath, 'frontImage.png');
const selfieImagePath = path.join(utilsPath, 'selfieImage.png');

const facialRecognition = async () => {
  try {
    // Cargar los modelos de face-api.js
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);

    // Leer las imágenes
    const frontImage = await canvas.loadImage(frontImagePath);
    const selfieImage = await canvas.loadImage(selfieImagePath);

    // Detectar las caras y sus características
    const frontFaceDescriptor = await faceapi.detectSingleFace(frontImage).withFaceLandmarks().withFaceDescriptor();
    const selfieFaceDescriptor = await faceapi.detectSingleFace(selfieImage).withFaceLandmarks().withFaceDescriptor();

    if (!frontFaceDescriptor || !selfieFaceDescriptor) {
      throw new Error('No se pudo detectar la cara en una o ambas imágenes');
    }

    // Calcular la distancia entre las descripciones de las caras
    const distance = faceapi.euclideanDistance(frontFaceDescriptor.descriptor, selfieFaceDescriptor.descriptor);

    // Devuelve true si la distancia es menor que un umbral, false en caso contrario
    return distance < 0.6; // Puedes ajustar este umbral según tus necesidades
  } catch (error) {
    console.error('Ocurrió un error durante el reconocimiento facial:', error);
    throw error;
  }
};

module.exports = { facialRecognition};

// Bloque de prueba
/*facialRecognition()
  .then((result) => {
    console.log('Resultado del reconocimiento facial:', result);
  })
  .catch((error) => {
    console.error('Error en la prueba:', error);
  });*/
