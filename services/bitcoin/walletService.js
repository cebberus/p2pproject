//walletService.js
const axios = require('axios');
const bitcoin = require('bitcoinjs-lib');
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1');
const bip32 = BIP32Factory(ecc);
const testnet = bitcoin.networks.testnet;
const crypto = require('crypto');

async function getSourceWalletForVirtualFunds(userId) {
    // Buscar todas las transacciones donde el usuario es el destinatario
    const transactions = await Transaction.find({ toWallet: userId }).sort({ date: -1 }); // Ordenar por fecha descendente

    // Aquí puedes implementar la lógica para determinar de qué billetera provienen los fondos virtuales.
    // Por ejemplo, podrías simplemente tomar la billetera de la transacción más reciente.
    if (transactions.length > 0) {
        return transactions[0].fromWallet;
    } else {
        // Si no hay transacciones, devolver null o manejar de otra manera
        return null;
    }
}


function isValidAddress(address) {
    try {
        bitcoin.address.toOutputScript(address, testnet);
        return true;
    } catch (e) {
        return false;
    }
}

async function hasSufficientFunds(address, requiredAmount) {
    try {
        const response = await axios.get(`https://mempool.space/testnet/api/address/${address}`);
        const balance = response.data.chain_stats.funded_txo_sum - response.data.chain_stats.spent_txo_sum;
        return balance >= requiredAmount;
    } catch (e) {
        console.error("Error checking balance:", e);
        return false;
    }
}

async function broadcastTransaction(rawTx) {
    try {
        const response = await axios.post('https://mempool.space/testnet/api/tx', { tx: rawTx });
        return response.data;
    } catch (e) {
        console.error("Error broadcasting transaction:", e);
        throw e;
    }
}

module.exports = {
    isValidAddress,
    hasSufficientFunds,
    broadcastTransaction,
    getSourceWalletForVirtualFunds
};
