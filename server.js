const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ecc = require('tiny-secp256k1');
const bitcoin = require('bitcoinjs-lib');
const { BIP32Factory } = require('bip32');
const bip39 = require('bip39');

const bip32 = BIP32Factory(ecc);
const testnet = bitcoin.networks.testnet;


const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Middleware para verificar el token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'Token requerido' });
  jwt.verify(token, 'SECRET_KEY', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// Conexión a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/P2PProjectDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Comprobar conexión
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

// Definir esquema y modelo
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  isVerified: { type: Boolean, default: false }, // Campo de verificación
});

const User = mongoose.model('User', UserSchema);

const WalletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  address: String,
  privateKey: String, // Asegúrate de almacenar esto de forma segura
  balance: Number,
});

const TransactionSchema = new mongoose.Schema({
  fromWallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
  toWallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
  amount: Number,
  date: Date,
  status: String, // Ejemplo: 'pending', 'confirmed'
});

const Wallet = mongoose.model('Wallet', WalletSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);

// Ruta de registro
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Comprobar si el usuario ya existe
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
  }

  // Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear un nuevo usuario
  const user = new User({
    email,
    password: hashedPassword,
    isVerified: false,
  });

  // Guardar el usuario en la base de datos
  await user.save();

  res.status(201).json({ message: 'Usuario registrado con éxito' });
});

// Ruta de inicio de sesión
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Buscar usuario por correo electrónico
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Correo electrónico o contraseña incorrectos' });
  }

  // Comprobar la contraseña
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: 'Correo electrónico o contraseña incorrectos' });
  }

  // Crear un token JWT
  const token = jwt.sign({ userId: user._id }, 'SECRET_KEY', { expiresIn: '1h' });

  res.json({ token, userId: user._id, email: user.email, isVerified: user.isVerified });
});

app.post('/logout', verifyToken, (req, res) => {
  // Aquí puedes invalidar el token si estás usando una lista negra de tokens o alguna otra lógica
  // Por ahora, simplemente responderemos con un mensaje de éxito
  console.log('Logout request received'); // Agregar esta línea
  res.json({ message: 'Sesión cerrada con éxito' });
});


app.get('/dashboard', verifyToken, (req, res) => {
  res.json({ message: 'Bienvenido al dashboard', user: req.user });
});

app.post('/verify', verifyToken, async (req, res) => {
  const { userId } = req.user;
  const verificationData = req.body; // Aquí puedes tomar los datos del formulario de verificación
  // Aquí puedes manejar la lógica para validar los datos de verificación
  // Actualizar el campo isVerified del usuario
  await User.findByIdAndUpdate(userId, { isVerified: true });
  // Opcionalmente, puedes guardar los datos de verificación en otra colección
  res.json({ message: 'Cuenta verificada con éxito' });
});

app.post('/wallet', verifyToken, async (req, res) => {
  // Generar una semilla aleatoria de 32 bytes
  const seed = crypto.randomBytes(32);

  // Crea un nodo raíz a partir de la semilla
  const root = bip32.fromSeed(seed, testnet);

  // Deriva una clave a partir del nodo raíz (puedes ajustar la ruta según tus necesidades)
  const child = root.derivePath("m/44'/0'/0'/0/0");

  // Crea una dirección a partir de la clave pública
  const { address } = bitcoin.payments.p2pkh({ pubkey: child.publicKey, network: testnet });

  const wallet = new Wallet({
    userId: req.user.userId,
    address: address,
    privateKey: child.toWIF(), // Asegúrate de almacenar esto de forma segura
    balance: 0,
  });

  wallet.save().then(() => res.json({ message: 'Billetera creada con éxito', address: address }));
});

// Iniciar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
