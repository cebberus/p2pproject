const sharp = require('sharp');

function preprocessImage(imageBuffer) {
  return sharp(imageBuffer)
    //.resize(800) // Redimensionar la imagen puede ayudar a Tesseract a reconocer caracteres más pequeños
    .grayscale() // Convertir a escala de grises elimina el color, que puede ser ruido
    //.normalize() // Normalizar la imagen puede mejorar el contraste
    //.threshold(127) // Aplicar un umbral puede ayudar a separar el texto del fondo
    //.blur(1) // Un ligero desenfoque puede reducir el ruido
    .toBuffer();
}

module.exports = { preprocessImage };

