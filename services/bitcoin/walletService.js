//walletService.js
const axios = require('axios');
const bitcoin = require('bitcoinjs-lib');
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1');
const bip32 = BIP32Factory(ecc);
const testnet = bitcoin.networks.testnet;
const crypto = require('crypto');



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


module.exports = {
    isValidAddress,
    getSourceWalletsForVirtualFunds
};
