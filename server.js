//server.js
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ecc = require('tiny-secp256k1');
const bitcoin = require('bitcoinjs-lib');
const ECPairFactory = require('ecpair');
const { BIP32Factory } = require('bip32');
const bip39 = require('bip39');
const bip32 = BIP32Factory(ecc);
const testnet = bitcoin.networks.testnet;
const ECPair = ECPairFactory.ECPairFactory(ecc);
const { verifyDataWithForm} = require('./services/verificationidentity/verificationService');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');




const CounterSchema = new mongoose.Schema({
  name: String,
  value: Number,
});

const Counter = mongoose.model('Counter', CounterSchema);



const app = express();
// Middleware
app.use(bodyParser.json({ limit: '50mb' })); // Aumenta el límite aquí
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use('/components', express.static('components'));
app.use('/components/assets', express.static(path.join(__dirname, 'components/assets')));



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
mongoose.connection.once('open', async () => {
  console.log('Connected to MongoDB');

  // Verificar si el contador ya existe
  let counter = await Counter.findOne({ name: 'walletAddressCounter' });
  if (!counter) {
    counter = new Counter({ name: 'walletAddressCounter', value: 1 });
    await counter.save();
  }
});


// Definir esquema y modelo
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  verificationStatus: { type: String, enum: ['no verificado', 'verificado', 'en revisión'], default: 'no verificado' }, // Cambio aquí
  nombreDeUsuario: {type: String, unique: true, required: true},
  avatar: {type: String, default: 'components/assets/avatars/avatar1.jpg'}
});
const User = mongoose.model('User', UserSchema);

async function generarNombreDeUsuario() {
  const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let resultado;
  let userExists = true;

  while (userExists) {
    resultado = 'user-';
    for (let i = 0; i < 7; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    // Verificar si el nombre de usuario ya existe
    userExists = await User.findOne({ nombreDeUsuario: resultado });
  }

  return resultado;
}


/////////////////////////////////ENDPOINTS TEMPORALES/////////////////////////////////


/////////////////////////////////ENDPOINTS TEMPORALES/////////////////////////////////


const VerificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  personalData: Object,
  residenceData: Object,
  documentData: Object,
  documentUploadData: Object,
  declarationsData: Object,
});
const Verification = mongoose.model('Verification', VerificationSchema);


const WalletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  address: String,
  balance: Number, // Este es el saldo en la blockchain
  virtualBalance: Number,
  addressIndex: Number, // Este es el saldo "virtual" en la plataforma
});

const Wallet = mongoose.model('Wallet', WalletSchema);





const ExternalTransactionSchema = new mongoose.Schema({
  TxID: {type: String, required: true},
  fromWallet: { type: String, required: true }, // Dirección de la billetera
  toWallet: { type: String, required: true }, // Dirección de la billetera
  amount: Number,
  date: { type: Date, default: Date.now },
  status: String,
  type: { type: String, enum: ['deposit', 'withdrawal'], required: true }
});
const ExternalTransaction = mongoose.model('ExternalTransaction', ExternalTransactionSchema);



const InternalTransactionSchema = new mongoose.Schema({
  InTxID: {type: String, required: true},
  fromWallet: { type: String, required: true }, // Dirección de la billetera
  toWallet: { type: String, required: true }, // Dirección de la billetera
  amount: Number,
  date: { type: Date, default: Date.now },
  status: String,
  type: { type: String, enum: ['send', 'receive'], required: true }
});
const InternalTransaction = mongoose.model('InternalTransaction', InternalTransactionSchema);





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

  // Generar nombre de usuario
  const nombreDeUsuario = generarNombreDeUsuario();

  // Obtener la lista de avatares disponibles
  const avatarsDirectory = path.join(__dirname, 'components/assets/avatars');
  const avatarFiles = fs.readdirSync(avatarsDirectory);

  // Seleccionar un avatar al azar de la lista
  const randomAvatar = avatarFiles[Math.floor(Math.random() * avatarFiles.length)];
  const avatar = `components/assets/avatars/${randomAvatar}`;

  // Crear un nuevo usuario
  const user = new User({
    email,
    password: hashedPassword,
    verificationStatus: 'no verificado',
    nombreDeUsuario,
    avatar
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
  const token = jwt.sign({ userId: user._id }, 'SECRET_KEY', { expiresIn: '4h' });

  res.json({ token, userId: user._id, email: user.email, verificationStatus: user.verificationStatus }); // Cambio aquí
});




app.get('/api/getUserInfo', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Buscar información del usuario en la base de datos
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Enviar la información del usuario como respuesta
    res.status(200).json({
      userId: user._id,
      email: user.email,
      verificationStatus: user.verificationStatus,
      nombreDeUsuario: user.nombreDeUsuario, // Agregado aquí
      avatar: user.avatar // Agregado aquí
    });
  } catch (error) {
    console.error('Error al obtener la información del usuario:', error);
    res.status(500).json({ message: 'Error al obtener la información del usuario' });
  }
});

app.get('/api/avatars', verifyToken, (req, res) => {
  const avatarsDirectory = path.join(__dirname, 'components/assets/avatars');

  fs.readdir(avatarsDirectory, (err, files) => {
      if (err) {
          console.error('Error al leer el directorio de avatares:', err);
          res.status(500).json({ message: 'Error interno del servidor' });
          return;
      }

      // Construye las URLs de los avatares
      const avatars = files.map(file => `http://localhost:3001/components/assets/avatars/${file}`);
      res.json(avatars);
  });
});


app.put('/api/updateProfileUsername', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nombreDeUsuario } = req.body;

    // Actualizar la información del usuario en la base de datos
    await User.findByIdAndUpdate(userId, { nombreDeUsuario});

    res.status(200).json({ message: 'Perfil actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    res.status(500).json({ message: 'Error al actualizar el perfil' });
  }
});

app.put('/api/updateProfileAvatar', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { avatar } = req.body;

    // Actualizar la información del usuario en la base de datos
    await User.findByIdAndUpdate(userId, { avatar });

    res.status(200).json({ message: 'Perfil actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    res.status(500).json({ message: 'Error al actualizar el perfil' });
  }
});

// Ruta para verificar la validez del token
app.get('/api/checkTokenValidity', verifyToken, (req, res) => {
  // Si el middleware verifyToken no envió un error, entonces el token es válido
  res.status(200).json({ valid: true });
});



app.post('/logout', verifyToken, (req, res) => {
  // Aquí puedes invalidar el token si estás usando una lista negra de tokens o alguna otra lógica
  // Por ahora, simplemente responderemos con un mensaje de éxito
  console.log('Logout request received'); // Agregar esta línea
  res.json({ message: 'Sesión cerrada con éxito' });
});

app.post('/api/saveUserData', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const verificationData = req.body;
  const verification = new Verification({
    userId,
    ...verificationData,
  });

  await verification.save();
  await User.findByIdAndUpdate(userId, { verificationStatus: 'en revisión' });

  res.status(201).json({ message: 'Datos guardados con éxito' });
});

// Ruta para eliminar los datos de verificación del usuario
app.delete('/api/deleteUserData', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Eliminar los datos de verificación asociados con el usuario
    await Verification.findOneAndDelete({ userId });

    // Actualizar el estado de verificación del usuario a "no verificado"
    await User.findByIdAndUpdate(userId, { verificationStatus: 'no verificado' });

    res.status(200).json({ message: 'Datos de verificación eliminados con éxito' });
  } catch (error) {
    console.error('Error al eliminar los datos de verificación:', error);
    res.status(500).json({ message: 'Error al eliminar los datos de verificación' });
  }
});



app.get('/api/verificationStatus', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const user = await User.findById(userId);
  res.json({ status: user.verificationStatus });
});


app.get('/formData', verifyToken, async (req, res) => {
  const userId = req.user.userId;

  // Buscar en la colección de datos de verificación
  const verificationData = await Verification.findOne({ userId });

  if (!verificationData) {
    return res.status(404).json({ message: 'Datos no encontrados' });
  }

  const {
    personalData,
    residenceData,
    documentData,
    documentUploadData,
    declarationsData,
    pepDetails,
  } = verificationData;

  const response = {
    personalInformation: {
      nombres: personalData.nombres,
      apellidos: personalData.apellidos,
      paisNacimiento: personalData.paisNacimiento,
      fechaNacimiento: personalData.fechaNacimiento,
      sexo: personalData.sexo,
      profesion: personalData.profesion,
      estadoCivil: personalData.estadoCivil,
    },
    residenceInformation: {
      paisResidencia: residenceData.paisResidencia,
      RegionProvincia: residenceData.RegionProvincia,
      ciudad: residenceData.ciudad,
      direccionResidencia: residenceData.direccionResidencia,
      telefono: residenceData.telefono,
    },
    documentInformation: {
      tipoDocumento: documentData.tipoDocumento,
      rut: documentData.rut,
      paisEmisorDocumento: documentData.paisEmisorDocumento,
      fechaEmisionDocumento: documentData.fechaEmisionDocumento,
    },
    documentUploadInformation: {
      frontImage: documentUploadData.frontImage,
      backImage: documentUploadData.backImage,
      selfieImage: documentUploadData.selfieImage,
    },
    declarationsInformation: {
      isPEP: declarationsData.isPEP,
      isPEPYou: declarationsData.isPEPYou,
      declaration1: declarationsData.declaration1,
      declaration2: declarationsData.declaration2,
    },
    pepDetails: pepDetails,
  };

  res.json(response);
});


// Ruta para verificar los datos
app.post('/verify', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const token = req.headers['authorization'];

    // Llamar a verifyDataWithForm con userId y token
    const verificationResult = await verifyDataWithForm(token);

    // Si la verificación es exitosa, actualizar el estado de verificación del usuario a "verificado"
    // Si no es exitosa, actualizar el estado de verificación del usuario a "no verificado"
    const newVerificationStatus = verificationResult.success ? 'verificado' : 'no verificado';
    await User.findByIdAndUpdate(userId, { verificationStatus: newVerificationStatus });

    // Enviar el resultado de la verificación como respuesta
    res.status(200).json(verificationResult);
  } catch (error) {
    console.error('Ocurrió un error durante la verificación:', error);
    res.status(500).json({ message: 'Ocurrió un error durante la verificación' });
  }
});

//////////////////////////////////////////////////////////// BITCOIN OPERATIONS ///////////////////////////////////////////////////////////////////////////////////
async function getSourceWalletsForVirtualFunds(requiredAmount) {
  // Buscar todas las billeteras y ordenarlas por balance de mayor a menor
  const wallets = await Wallet.find({ balance: { $gt: 0 } }).sort({ balance: -1 });

  let totalAmount = 0;
  const selectedWallets = [];

  for (const wallet of wallets) {
      if (wallet.balance <= 0) {
          continue; // Ignorar billeteras sin saldo en la blockchain disponible
      }

      const amountToUse = Math.min(wallet.balance, requiredAmount - totalAmount);
      totalAmount += amountToUse;

      selectedWallets.push({
          address: wallet.address,
          amount: amountToUse
      });

      if (totalAmount >= requiredAmount) {
          break;
      }
  }

  if (totalAmount < requiredAmount) {
      // No hay suficientes fondos, manejar adecuadamente
      return null;
  }

  return selectedWallets;
}



function isValidAddress(address) {
  try {
      bitcoin.address.toOutputScript(address, testnet);
      return true;
  } catch (e) {
      return false;
  }
}

const WebSocket = require('ws');
const trackWS = () => {
  const ws = new WebSocket('wss://mempool.space/testnet/api/v1/ws');
  const interval = setInterval(function ping() {
    ws.ping();
  }, 20000);

  ws.on('open', function open() {
    console.log('ws opened');
    trackExistingWallets();
  });

  ws.on('close', async function close() {
    console.log('ws closed');
    clearInterval(interval);
    ws.terminate();
    await sleep(60000);
    trackWS();
  });

  return ws;
};

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const ws = trackWS();
ws.on('message', async function incoming(data) {
  try {
    const res = JSON.parse(data.toString());
    console.log(JSON.stringify(res, null, 3));

    if (res["address-transactions"] && res["address-transactions"][0]) {
      // Verificar transacciones entrantes
      if (res["address-transactions"][0].vout) {
        for (let vout of res["address-transactions"][0].vout) {
          const wallet = await Wallet.findOne({ address: vout.scriptpubkey_address });
          if (wallet) {
            // Actualizar el balance de la billetera
            wallet.balance += vout.value;
            await wallet.save();
            console.log(`Balance actualizado para la dirección ${vout.scriptpubkey_address}. Nuevo balance: ${wallet.balance}`);
            
            const fromWalletAddress = res["address-transactions"][0].vin && res["address-transactions"][0].vin[0] ? res["address-transactions"][0].vin[0].prevout.scriptpubkey_address : null; // Asumiendo un solo input por simplicidad
            const fromWallet = fromWalletAddress ? await Wallet.findOne({ address: fromWalletAddress }) : null;

            const extTransaction = new ExternalTransaction({
              TxID: res["address-transactions"][0].txid,
              fromWallet: fromWallet ? fromWallet.address : fromWalletAddress, // Usar la dirección directamente
              toWallet: wallet.address, // Usar la dirección directamente
              amount: vout.value,
              status: "completed",
              type: "deposit"
            });
            await extTransaction.save();
          }
        }
      }

      // Verificar transacciones salientes
      if (res["address-transactions"][0].vin) {
        for (let vin of res["address-transactions"][0].vin) {
          const wallet = await Wallet.findOne({ address: vin.prevout.scriptpubkey_address });
          if (wallet) {
            // Actualizar el balance de la billetera
            wallet.balance -= vin.prevout.value;
            await wallet.save();
            console.log(`Balance actualizado para la dirección ${vin.prevout.scriptpubkey_address} debido a una transacción saliente. Nuevo balance: ${wallet.balance}`);
            
            const toWalletAddress = res["address-transactions"][0].vout && res["address-transactions"][0].vout[0] ? res["address-transactions"][0].vout[0].scriptpubkey_address : null; // Asumiendo un solo output por simplicidad
            const toWallet = toWalletAddress ? await Wallet.findOne({ address: toWalletAddress }) : null;

            const extTransaction = new ExternalTransaction({
              TxID: res["address-transactions"][0].txid,
              fromWallet: wallet.address, // Usar la dirección directamente
              toWallet: toWallet ? toWallet.address : toWalletAddress, // Usar la dirección directamente
              amount: vin.prevout.value,
              status: "completed",
              type: "withdrawal"
            });
            await extTransaction.save();
          }
        }
      }
    }
  } catch (error) {
    console.error("Error al procesar el mensaje del WebSocket:", error);
  }
});



const trackExistingWallets = async () => {
  try {
    const allWallets = await Wallet.find({});
    const addresses = allWallets.map(wallet => wallet.address);
    addresses.forEach(address => {
      ws.send(JSON.stringify({ 'track-address': address }));
    });
    console.log("Rastreando direcciones existentes:", addresses);
  } catch (error) {
    console.error("Error al rastrear direcciones existentes:", error);
  }
};

// El resto de tu código sigue igual...

const MASTER_SEED_PHRASE = 'genre near parrot vocal demand basic slice leader portion begin favorite change';
const seed = bip39.mnemonicToSeedSync(MASTER_SEED_PHRASE);

app.post('/api/createwallet', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const existingWallet = await Wallet.findOne({ userId });
  if (existingWallet) {
      return res.status(400).json({ message: 'El usuario ya tiene una billetera creada' });
  }
  const root = bip32.fromSeed(seed, testnet);
  const counter = await Counter.findOne({ name: 'walletAddressCounter' });
  const addressIndex = counter.value;
  const child = root.derivePath(`m/44'/0'/0'/0/${addressIndex}`);
  const { address } = bitcoin.payments.p2pkh({ pubkey: child.publicKey, network: testnet });
  const wallet = new Wallet({
      userId: userId,
      address: address,
      balance: 0,
      virtualBalance: 0,
      addressIndex: addressIndex,
  });
  await wallet.save();
  counter.value += 1;
  await counter.save();

  // Rastrea la nueva dirección con el WebSocket de Blockchain.com
  ws.send(JSON.stringify({ "op": "addr_sub", "addr": address }));

  res.json({ message: 'Billetera creada con éxito', address: address });
});


// Función para mostrar las direcciones rastreadas en la consola
app.get('/api/tracked-addresses', async (req, res) => {
    const allWallets = await Wallet.find({});
    const addresses = allWallets.map(wallet => wallet.address);
    console.log("Direcciones en seguimiento:", addresses);
    res.json({ addresses: addresses });
});

app.get('/api/wallet/address', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const wallet = await Wallet.findOne({ userId: userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Billetera no encontrada.' });
    } else {
      res.json(wallet);
    }
  }catch (error) {
    console.error('Error checking wallet adress', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/wallet/exist', verifyToken, async (req, res) => {
  try {
    // Suponiendo que el token de autenticación te da acceso al ID del usuario
    const userId = req.user.userId;
    const wallet = await Wallet.findOne({ userId: userId });
    if (wallet) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking wallet existence:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.get('/api/wallet/balance', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const wallet = await Wallet.findOne({ userId: userId });
    if (!wallet) {
      return res.status(404).json({ error: 'Billetera no encontrada' });
    }
    const totalBalance = wallet.balance + wallet.virtualBalance;
    res.json({ totalBalance: totalBalance });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: `Error al obtener el balance: ${error.message}` });
  }
});


app.post('/api/wallet/send-receive', verifyToken, async (req, res) => {
  const { senderAddress, recipientIdentifier, amount } = req.body;
  
  const senderWallet = senderAddress ? await Wallet.findOne({ address: senderAddress }) : await Wallet.findOne({ userId: req.user.userId });
  if (!senderWallet) {
    return res.status(404).json({ error: 'Billetera del remitente no encontrada' });
  }

  let recipientWallet;
  if (recipientIdentifier.includes('@')) { // Si es un correo
    const recipientUser = await User.findOne({ email: recipientIdentifier });
    recipientWallet = recipientUser ? await Wallet.findOne({ userId: recipientUser._id }) : null;
  } else {
    // Intenta encontrar por dirección de billetera
    recipientWallet = await Wallet.findOne({ address: recipientIdentifier });
    if (!recipientWallet) {
      // Si no se encuentra, intenta por nombre de usuario
      const recipientUser = await User.findOne({ nombreDeUsuario: recipientIdentifier });
      recipientWallet = recipientUser ? await Wallet.findOne({ userId: recipientUser._id }) : null;
    }
  }

  if (!recipientWallet) {
    return res.status(400).json({ error: 'El identificador del destinatario no pertenece a un usuario de la plataforma' });
  }

  const totalBalance = senderWallet.balance + senderWallet.virtualBalance;
  if (totalBalance >= amount) {
    senderWallet.virtualBalance -= amount;
    recipientWallet.virtualBalance += amount;
  } else {
    return res.status(400).json({ error: 'Fondos insuficientes en la billetera del remitente' });
  }

  await senderWallet.save();
  await recipientWallet.save();

  const InTxID = uuidv4(); // Genera el InTxID

  // Transacción para el remitente
  const sendTransaction = new InternalTransaction({
    InTxID: InTxID,
    fromWallet: senderWallet._id,
    toWallet: recipientWallet._id,
    amount: amount,
    status: 'completed',
    type: 'send'
  });
  await sendTransaction.save();

  // Transacción para el destinatario
  const receiveTransaction = new InternalTransaction({
    InTxID: InTxID,
    fromWallet: senderWallet._id,
    toWallet: recipientWallet._id,
    amount: amount,
    status: 'completed',
    type: 'receive'
  });
  await receiveTransaction.save();

  res.json({ message: 'Transacción completada con éxito', sender: senderWallet.address, recipient: recipientWallet.address });
});




const withdrawalQueue = [];
const APP_FEE = 200;
const txfee = 800;
const totalFee = APP_FEE + txfee;
const APP_WALLET_ADDRESS = 'tb1qhsa0mwu93mzg7lppzm4x8excmvfr2ss6yn8pn4';

app.post('/api/wallet/withdraw', verifyToken, async (req, res) => {
  console.log("Solicitud de retiro iniciada para el usuario:", req.user.userId);

  const { externalAddress, amountbtc } = req.body;
  console.log("Dirección externa proporcionada:", externalAddress);

  if (!isValidAddress(externalAddress)) {
    return res.status(400).json({ error: 'Dirección externa inválida' });
  }
  const parsedAmountbtc = parseFloat(amountbtc);
  console.log("Cantidad de BTC solicitada para retiro:", parsedAmountbtc);
  if (isNaN(parsedAmountbtc)) {
      return res.status(400).json({ error: 'El valor de amountbtc no es un número válido'});
  }
  const amount = parsedAmountbtc * 100000000;
  const userWallet = await Wallet.findOne({ userId: req.user.userId });
  const totalBalance = userWallet.balance + userWallet.virtualBalance;
  console.log("Balance actual del usuario:", userWallet.balance);
  console.log("Balance virtual del usuario:", userWallet.virtualBalance);
  console.log("Balance total del usuario:", totalBalance);

  if (totalBalance < amount) {
    return res.status(400).json({ error: 'Fondos insuficientes' });
  }

  const withdrawal = {
    address: userWallet.address,
    externalAddress: externalAddress,
    amount: amount,
    inputs: []
  };

  if (userWallet.balance >= amount) {
    withdrawal.inputs.push({
      address: userWallet.address,
      amount: amount
    });
    withdrawalQueue.push(withdrawal);
    return res.json({ message: 'Retiro programado con éxito. Será procesado pronto.' });
  } else {
    const amountFromBlockchain = userWallet.balance;
    const amountFromVirtual = amount - amountFromBlockchain;
    const amountFromVirtualWithFee = amountFromVirtual + totalFee;
    userWallet.virtualBalance -= amountFromVirtualWithFee;
    await userWallet.save();
    
    if (amountFromBlockchain > 0 && userWallet.balance > 0) {
      withdrawal.inputs.push({
        address: userWallet.address,
        amount: amountFromBlockchain
      });
    }
    const sourceWallets = await getSourceWalletsForVirtualFunds(amountFromVirtual);
    console.log("Determinando la fuente de los fondos para el retiro...");
    let remainingAmount = amountFromVirtual;
    for (const wallet of sourceWallets) {
        if (wallet.amount <= remainingAmount) {
            withdrawal.inputs.push({
                address: wallet.address,
                amount: wallet.amount
            });
            remainingAmount -= wallet.amount;
        } else {
            // Si la billetera tiene más BTC de los que necesitamos, solo tomamos lo que necesitamos
            withdrawal.inputs.push({
                address: wallet.address,
                amount: remainingAmount
            });
            break; // Ya hemos alcanzado el monto requerido, por lo que podemos salir del bucle
        }
    }
    withdrawalQueue.push(withdrawal);
    return res.json({ message: 'Retiro programado con éxito. Será procesado pronto.' });
  }
});

function selectUtxos(utxos, targetAmount) {
  let selectedUtxos = [];
  let totalSelectedAmount = 0;

  // Ordena los UTXOs de menor a mayor
  const sortedUtxos = utxos.sort((a, b) => a.value - b.value);

  for (const utxo of sortedUtxos) {
    if (totalSelectedAmount >= targetAmount) {
      break;
    }
    selectedUtxos.push(utxo);
    totalSelectedAmount += utxo.value;
  }

  return { selectedUtxos, totalSelectedAmount };
}

const PROCESS_INTERVAL = 10000;
setInterval(async () => {
  if (withdrawalQueue.length === 0) {
    return;
  }
  const withdrawal = withdrawalQueue.shift();
  const psbt = new bitcoin.Psbt({ network: testnet });
  console.log(withdrawal);

  let allSelectedUtxos = [];
  let totalSelectedAmount = 0;

  // 1. Añade todos los inputs:
  for (const input of withdrawal.inputs) {
    const userWallet = await Wallet.findOne({ address: input.address });

    // Obtener UTXOs de la dirección de la billetera del cliente
    const utxosResponse = await axios.get(`https://mempool.space/testnet/api/address/${userWallet.address}/utxo`);
    const utxos = utxosResponse.data;
    console.log("Total de UTXOs disponibles:", utxos.length);
    console.log("UTXOs disponibles para la dirección", userWallet.address, ":", utxos);

    // Selecciona un UTXO adecuado
    const { selectedUtxos, totalSelectedAmount: selectedAmount } = selectUtxos(utxos, withdrawal.amount + txfee - totalSelectedAmount);

    allSelectedUtxos = allSelectedUtxos.concat(selectedUtxos);
    totalSelectedAmount += selectedAmount;

    if (totalSelectedAmount >= withdrawal.amount + txfee) {
      break;
    }
  }

  if (totalSelectedAmount < withdrawal.amount + txfee) {
    console.error("No hay UTXOs suficientes para cubrir el monto del retiro y la comisión.");
    return;
  }

  for (const utxo of allSelectedUtxos) {
    if (!utxo) {
      console.error("Error: UTXO no definido.");
      continue;
    }

    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      nonWitnessUtxo: Buffer.from((await axios.get(`https://mempool.space/testnet/api/tx/${utxo.txid}/hex`)).data, 'hex')
    });
  }

  // 2. Añade todos los outputs:
  const sendAmount = totalSelectedAmount - txfee;
  psbt.addOutput({
    address: withdrawal.externalAddress,
    value: withdrawal.amount
  });

  psbt.addOutput({
    address: APP_WALLET_ADDRESS,
    value: APP_FEE
  });

  if (sendAmount > withdrawal.amount + APP_FEE) {
    // Si hay un cambio, devolverlo a la dirección original del usuario
    const userWallet = await Wallet.findOne({ address: withdrawal.address });
    psbt.addOutput({
      address: userWallet.address,
      value: sendAmount - withdrawal.amount - APP_FEE
    });
  }

  // 3. Firma todos los inputs:
  let inputIndex = 0;
  for (const input of withdrawal.inputs) {
    const inputWallet = await Wallet.findOne({ address: input.address });
    const addressIndex = inputWallet.addressIndex;

    // Derivar la clave privada de la semilla
    const root = bip32.fromSeed(seed, testnet);
    const path = `m/44'/0'/0'/0/${addressIndex}`;
    const child = root.derivePath(path);
    const keyPair = ECPair.fromPrivateKey(child.privateKey);

    psbt.signInput(inputIndex, keyPair);
    inputIndex++;
  }


  // 4. Finaliza y extrae la transacción:
  console.log("Finalizando PSBT...");
  psbt.finalizeAllInputs();
  const tx = psbt.extractTransaction().toHex();
  console.log("Transacción en formato hex:", tx);

  try {
    const response = await axios.post('https://mempool.space/testnet/api/tx', tx, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    console.log("Respuesta al enviar la transacción:", response.data);
  } catch (error) {
    console.error("Error al transmitir la transacción:", error.response.data);
    return;
  }
  
  console.log(`Retiro procesado con éxito para la dirección ${withdrawal.externalAddress}`);
}, PROCESS_INTERVAL);












app.get('/api/wallet/transactions', verifyToken, async (req, res) => {
  try {
    const userWallet = await Wallet.findOne({ userId: req.user.userId });
    if (!userWallet) {
        return res.status(404).json({ error: 'Billetera no encontrada' });
    }

    // Obtener todas las transacciones externas relacionadas con la billetera del usuario
    const externalTransactions = await ExternalTransaction.find({
        $or: [{ fromWallet: userWallet.address }, { toWallet: userWallet.address }]
    });

    // Obtener todas las transacciones internas relacionadas con la billetera del usuario
    const internalTransactions = await InternalTransaction.find({
        $or: [{ fromWallet: userWallet.address }, { toWallet: userWallet.address }]
    });

    // Combinar ambas listas de transacciones
    const allTransactions = [...externalTransactions, ...internalTransactions];

    // Si no se encuentran transacciones, devolver un array vacío
    res.json({ transactions: allTransactions || [] });
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    res.status(500).json({ error: `Error al obtener transacciones: ${error.message}` });
  }
});









// Iniciar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
