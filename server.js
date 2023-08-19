//server.js
const axios = require('axios');
const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
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
const { verifyDataWithForm} = require('./services/verificationidentity/verificationService');
const { isValidAddress, getSourceWalletForVirtualFunds } = require('./services/bitcoin/walletService');




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
});
const User = mongoose.model('User', UserSchema);


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
  userId: String,
  address: String,
  privateKey: String,
  balance: Number, // Este es el saldo en la blockchain
  virtualBalance: Number, // Este es el saldo "virtual" en la plataforma
});

const Wallet = mongoose.model('Wallet', WalletSchema);


const TransactionSchema = new mongoose.Schema({
  fromWallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
  toWallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
  amount: Number,
  date: { type: Date, default: Date.now },
  status: String,
  type: { type: String, enum: ['send','receive', 'deposit', 'withdrawal'] } // Nuevo campo
});

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
    verificationStatus: 'no verificado', // Cambio aquí
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

  res.json({ token, userId: user._id, email: user.email, verificationStatus: user.verificationStatus }); // Cambio aquí
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

//const { SocksProxyAgent } = require('socks-proxy-agent');
// Configura el agente proxy para Tor
//const torProxy = 'socks5h://127.0.0.1:9150';
//const agent = new SocksProxyAgent(torProxy);

//const ws = new WebSocket('ws://otcuzuilswqjx7rs3kmkemuw6ulxkxcbinqqj7t6p77pafcgfv5nbvad.onion/api/v1/ws', { agent: agent });
const WebSocket = require('ws');

const serverWS = () => {
  const ws = new WebSocket('wss://ws.blockchain.info/inv');

  ws.on('open', async () => {
    console.log('WebSocket connection established.');
    const allWallets = await Wallet.find({});
    for (let wallet of allWallets) {
        ws.send(JSON.stringify({ "op": "addr_sub", "addr": wallet.address }));
    }
  });

  ws.on('message', async (data) => {
    const res = JSON.parse(data);
    console.log("Received data:", res);

    if (res.op === 'utx') {
        for (let tx of res.x.out) {
            const wallet = await Wallet.findOne({ address: tx.addr });
            if (wallet) {
                wallet.balance += tx.value / 100000000; // Convertir satoshis a BTC
                await wallet.save();

                const newTransaction = new Transaction({
                    fromWallet: res.x.inputs[0].prev_out.addr,
                    toWallet: wallet._id,
                    amount: tx.value / 100000000,
                    status: 'completed',
                    type: 'deposit'
                });
                await newTransaction.save();
                console.log(`La billetera con dirección ${wallet.address} ha recibido ${tx.value / 100000000} BTC.`);
            }
        }
    }
  });

  ws.on('close', async () => {
    console.log('WebSocket connection closed.');
    await sleep(60000);
    serverWS();
  });

  return ws;
};

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

// Inicializa la conexión WebSocket
serverWS();

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
    const child = root.derivePath(`m/44'/0'/0'/0/${counter.value}`);
    const { address } = bitcoin.payments.p2pkh({ pubkey: child.publicKey, network: testnet });
    const wallet = new Wallet({
        userId: userId,
        address: address,
        privateKey: child.toWIF(),
        balance: 0,
        virtualBalance: 0,
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
  const { senderAddress, recipientAddress, amount } = req.body;
  const senderWallet = senderAddress ? await Wallet.findOne({ address: senderAddress }) : await Wallet.findOne({ userId: req.user.userId });
  if (!senderWallet) {
    return res.status(404).json({ error: 'Billetera del remitente no encontrada' });
  }
  const recipientWallet = await Wallet.findOne({ address: recipientAddress });
  if (!recipientWallet) {
    return res.status(400).json({ error: 'La dirección del destinatario no pertenece a un usuario de la plataforma' });
  }
  const totalBalance = senderWallet.balance + senderWallet.virtualBalance;
  if (totalBalance < amount) {
    return res.status(400).json({ error: 'Fondos insuficientes en la billetera del remitente' });
  }
  if (senderWallet.balance >= amount) {
    senderWallet.balance -= amount;
    recipientWallet.virtualBalance += amount;
  } else {
    const amountFromBlockchain = senderWallet.balance;
    const amountFromVirtual = amount - amountFromBlockchain;
    senderWallet.balance = 0;
    senderWallet.virtualBalance -= amountFromVirtual;
    recipientWallet.virtualBalance += amount;
  }
  await senderWallet.save();
  await recipientWallet.save();

  // Transacción para el remitente
  const sendTransaction = new Transaction({
    fromWallet: senderWallet._id,
    toWallet: recipientWallet._id,
    amount: amount,
    status: 'completed',
    type: 'send' // Es una transacción de envío
  });
  await sendTransaction.save();

  // Transacción para el destinatario
  const receiveTransaction = new Transaction({
    fromWallet: senderWallet._id,
    toWallet: recipientWallet._id,
    amount: amount,
    status: 'completed',
    type: 'receive' // Es una transacción de recepción
  });
  await receiveTransaction.save();

  res.json({ message: 'Transacción completada con éxito', sender: senderWallet.address, recipient: recipientWallet.address });
});


const withdrawalQueue = [];

app.post('/api/wallet/withdraw', verifyToken, async (req, res) => {
  const { externalAddress, amount } = req.body;
  if (!isValidAddress(externalAddress)) {
    return res.status(400).json({ error: 'Dirección externa inválida' });
  }
  const userWallet = await Wallet.findOne({ userId: req.user.userId });
  const totalBalance = userWallet.balance + userWallet.virtualBalance;
  if (totalBalance < amount) {
    return res.status(400).json({ error: 'Fondos insuficientes' });
  }
  if (userWallet.balance >= amount) {
    withdrawalQueue.push({
      userId: req.user.userId,
      externalAddress: externalAddress,
      amount: amount
    });
    res.json({ message: 'Retiro programado con éxito. Será procesado pronto.' });
  } else {
    const amountFromBlockchain = userWallet.balance;
    const amountFromVirtual = amount - amountFromBlockchain;
    const sourceWallet = await getSourceWalletForVirtualFunds(req.user.userId); // Obtener la billetera fuente de los fondos virtuales
    withdrawalQueue.push({
      userId: sourceWallet.userId, // Usar el ID del usuario fuente
      externalAddress: userWallet.address,
      amount: amountFromVirtual
    });
    withdrawalQueue.push({
      userId: req.user.userId,
      externalAddress: externalAddress,
      amount: amountFromBlockchain
    });
    res.json({ message: 'Retiro programado con éxito. Será procesado pronto.' });
  }
});

const PROCESS_INTERVAL = 300000;
setInterval(async () => {
  if (withdrawalQueue.length === 0) {
    return;
  }
  const withdrawal = withdrawalQueue.shift();
  const userWallet = await Wallet.findOne({ userId: withdrawal.userId });
  const txb = new bitcoin.TransactionBuilder(testnet);
  const txfee = 10000;
  const sendAmount = withdrawal.amount - txfee;
  const root = bip32.fromSeed(seed, testnet);
  const masterWalletAddress = bitcoin.payments.p2pkh({ pubkey: root.publicKey, network: testnet }).address;
  const masterWalletPrivateKey = root.toWIF();
  txb.addInput(masterWalletAddress, 0);
  txb.addOutput(withdrawal.externalAddress, sendAmount);
  const keyPair = bitcoin.ECPair.fromWIF(masterWalletPrivateKey, testnet);
  txb.sign(0, keyPair);
  const tx = txb.build().toHex();
  const response = await axios.post('https://api.blockcypher.com/v1/btc/test3/txs/push', {
    tx: tx
  });
  if (response.data.errors) {
    console.error("Error al transmitir la transacción:", response.data.errors);
    return;
  }

  // Crear transacción de retiro
  const withdrawalTransaction = new Transaction({
    fromWallet: userWallet._id,
    toWallet: withdrawal.externalAddress, // Dirección externa proporcionada por el usuario
    amount: withdrawal.amount,
    status: 'completed',
    type: 'withdrawal'
  });
  await withdrawalTransaction.save();

  if (withdrawal.externalAddress === userWallet.address) {
    userWallet.virtualBalance -= withdrawal.amount;
  } else {
    userWallet.balance -= withdrawal.amount;
  }
  await userWallet.save();
  console.log(`Retiro procesado con éxito para el usuario ${withdrawal.userId} a la dirección ${withdrawal.externalAddress}`);
}, PROCESS_INTERVAL);

// Esta función devuelve la billetera desde donde provienen los fondos virtuales




app.get('/api/wallet/transactions', verifyToken, async (req, res) => {
  try {
    const userWallet = await Wallet.findOne({ userId: req.user.userId });
    if (!userWallet) {
        return res.status(404).json({ error: 'Billetera no encontrada' });
    }

    // Obtener todas las transacciones relacionadas con la billetera del usuario
    const transactions = await Transaction.find({
        $or: [{ fromWallet: userWallet._id }, { toWallet: userWallet._id }]
    });

    // Si no se encuentran transacciones, devolver un array vacío
    res.json({ transactions: transactions || [] });
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    res.status(500).json({ error: `Error al obtener transacciones: ${error.message}` });
  }
});






// Iniciar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
