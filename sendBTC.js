const bitcoin = require("bitcoinjs-lib");
const axios = require('axios');
const ECPairFactory = require('ecpair');
const ecc = require('tiny-secp256k1');

const ECPair = ECPairFactory.ECPairFactory(ecc);
const testnet = bitcoin.networks.testnet;

async function sendAllFunds() {
    const senderAddress = "mwRH4zmfTmoNu12JaVHnoEK2WdtYFTcxPp";
    const senderPrivateKey = "cPS5Hwu5oTmCFxTopavByYYN4MbHQ4cqoR4F7nugG5oKapoN3NcU";
    const recipientAddress = "tb1qhsa0mwu93mzg7lppzm4x8excmvfr2ss6yn8pn4";

    try {
        // Obtener UTXOs (Unspent Transaction Outputs) de la dirección del remitente
        const utxosResponse = await axios.get(`https://blockstream.info/testnet/api/address/${senderAddress}/utxo`);
        const utxos = utxosResponse.data;

        const psbt = new bitcoin.Psbt({ network: testnet });
        let totalInput = 0;

        // Agregar todos los UTXOs como entradas
        for (const utxo of utxos) {
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                nonWitnessUtxo: Buffer.from((await axios.get(`https://blockstream.info/testnet/api/tx/${utxo.txid}/hex`)).data, 'hex')
            });
            totalInput += utxo.value;
        }

        const txfee = 200;  // Establecer una tarifa de transacción
        const sendAmount = totalInput - txfee;

        // Agregar la dirección del destinatario como salida con el monto total menos las tarifas
        psbt.addOutput({
            address: recipientAddress,
            value: sendAmount
        });

        // Firmar todas las entradas con la clave privada del remitente
        const keyPair = ECPair.fromWIF(senderPrivateKey, testnet);
        for (let i = 0; i < utxos.length; i++) {
            psbt.signInput(i, keyPair);
        }

        // Finalizar y construir la transacción
        psbt.finalizeAllInputs();
        const tx = psbt.extractTransaction().toHex();

        // Transmitir la transacción a la red
        const broadcastResponse = await axios.post('https://blockstream.info/testnet/api/tx', tx);
        console.log("Transaction ID:", broadcastResponse.data);
    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
            console.error("Response headers:", error.response.headers);
        }
    }
}

sendAllFunds();
