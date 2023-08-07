const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb://localhost:27017/mydatabase"; // Asegúrate de que esta cadena coincida con la de MongoDB Compass
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  if (err) {
    console.error('Error conectando a MongoDB:', err);
  } else {
    console.log('Conectado exitosamente a MongoDB');
  }
  client.close();
});
