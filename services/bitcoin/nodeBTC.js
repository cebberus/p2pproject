//nodeBTC.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');

const TOR_PROXY = 'socks5h://127.0.0.1:9050';
const agent = new SocksProxyAgent(TOR_PROXY);

const BITCOIN_CORE_URL = 'http://dxvactmipoj2jhag3h3o64kdyksxrrfxj3rkwywpukkabw7rafp2hkid.onion:8332';
const BITCOIN_CORE_URL_TRACK_WALLET = 'http://dxvactmipoj2jhag3h3o64kdyksxrrfxj3rkwywpukkabw7rafp2hkid.onion:8332/wallet/tracking_wallet';

const username = process.env.BITCOIN_RPC_USERNAME;
const password = process.env.BITCOIN_RPC_PASSWORD;

const handleAxiosError = (error) => {
    if (error.response) {
        console.error(`Error ${error.response.status}: ${error.response.statusText}`);
        if (error.response.data) {
            console.error('Message:', error.response.data);
        }
    } else if (error.request) {
        console.error('No response received.');
    } else {
        console.error('Request configuration error:', error.message);
    }
    console.error('Endpoint:', error.config?.url);
    console.error('Method:', error.config?.method);
};


const registerAddressNode = async (address) => {
    // Primero, obtén el descriptor completo con checksum
    const descriptorData = {
        jsonrpc: '1.0',
        id: 'getdescriptorinfo',
        method: 'getdescriptorinfo',
        params: [`addr(${address})`]
    };

    try {
        const descriptorResponse = await axios.post(BITCOIN_CORE_URL_TRACK_WALLET, descriptorData, {
            httpAgent: agent,
            auth: {
                username: username,
                password: password
            },
            headers: {
                'Content-Type': 'text/plain'
            }
        });

        const fullDescriptor = descriptorResponse.data.result.descriptor;

        // Luego, usa el descriptor completo para importar la dirección
        const rpcData = {
            jsonrpc: '1.0',
            id: 'importdescriptors',
            method: 'importdescriptors',
            params: [[{  // Aquí es donde hacemos el cambio, envolviendo el objeto en un array
                desc: fullDescriptor,
                timestamp: "now",
                internal: false,
                watchonly: true

            }]]
        };

        const response = await axios.post(BITCOIN_CORE_URL_TRACK_WALLET, rpcData, {
            httpAgent: agent,
            auth: {
                username: username,
                password: password
            },
            headers: {
                'Content-Type': 'text/plain'
            }
        });

        return response.data;
    } catch (error) {
        handleAxiosError(error);
        return null;
    }
};




const getAddressInfo = async (address) => {
    const rpcData = {
        jsonrpc: '1.0',
        id: 'getaddressinfo',
        method: 'getaddressinfo',
        params: [address]
    };

    try {
        const response = await axios.post(BITCOIN_CORE_URL_TRACK_WALLET, rpcData, {
            httpAgent: agent,
            auth: {
                username: username,
                password: password
            },
            headers: {
                'Content-Type': 'text/plain'
            }
        });

        return response.data.result;
    } catch (error) {
        handleAxiosError(error);
        return null;
    }
};




const testRegisterAddressNode = async () => {
    const address = 'n4CTPkh7ZigBG6rT7x116z6ardzrioHTJu';  // La dirección que deseas probar
    const result = await registerAddressNode(address);
    console.log("Resultado de registerAddressNode:", result);
    if (result.result && result.result[0] && !result.result[0].success) {
        console.error("Detalles del error:", result.result[0].error);
    }
};



const testGetAddressInfo = async () => {
    const address = 'n4CTPkh7ZigBG6rT7x116z6ardzrioHTJu';  // Reemplaza 'tu_direccion_aqui' con la dirección que deseas probar

    const addressInfo = await getAddressInfo(address);
    console.log(addressInfo);
    if (addressInfo && addressInfo.iswatchonly) {
        console.log(`La dirección ${address} está siendo rastreada por el nodo.`);
    } else {
        console.log(`La dirección ${address} no está siendo rastreada por el nodo.`);
    }
};

const getListUnspent = async (address) => {
    const rpcData = {
        jsonrpc: '1.0',
        id: 'listunspent',
        method: 'listunspent',
        params: [1, 9999999, [address]]  // 1 y 9999999 son el rango de confirmaciones (desde 1 confirmación hasta 9999999 confirmaciones). Puedes ajustar estos números según tus necesidades.
    };

    try {
        const response = await axios.post(BITCOIN_CORE_URL_TRACK_WALLET, rpcData, {
            httpAgent: agent,
            auth: {
                username: username,
                password: password
            },
            headers: {
                'Content-Type': 'text/plain'
            }
        });

        return response.data.result;
    } catch (error) {
        handleAxiosError(error);
        return null;
    }
};
const testGetListUnspent = async () => {
    const address = 'n4CTPkh7ZigBG6rT7x116z6ardzrioHTJu';  // La dirección que deseas consultar
    const unspentTxns = await getListUnspent(address);
    console.log("Transacciones no gastadas para la dirección:", unspentTxns);
};

testGetListUnspent().catch(error => {
    console.error("Error en la ejecución:", error);
});

/*
testRegisterAddressNode().catch(error => {
    console.error("Error en la ejecución:", error);
});

testGetAddressInfo().catch(error => {
    console.error("Error en la ejecución:", error);
});*/



module.exports = {
    registerAddressNode
};