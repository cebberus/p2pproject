const mempoolJS = require("@mempool/mempool.js");
const trackedAddresses = ["tb1qhsa0mwu93mzg7lppzm4x8excmvfr2ss6yn8pn4", "n4CTPkh7ZigBG6rT7x116z6ardzrioHTJu"];

const init = async () => {
  
  const { bitcoin: { websocket } } = mempoolJS({
    hostname: 'mempool.space',
    network: 'testnet'
  });

  const ws = websocket.initServer({
    options: ["stats"]
  });

  ws.on("message", function incoming(data) {
    const res = JSON.parse(data.toString());
    console.log(res);
  
    // Si hay transacciones en el mensaje
    /*if (res.transactions) {
      for (const tx of res.transactions) {
        console.log(tx);
        // Verificar si alguna de las direcciones rastreadas está involucrada en la transacción
        const involvedAddresses = tx.vin.concat(tx.vout).map(v => v.addr).filter(addr => trackedAddresses.includes(addr));
        
        if (involvedAddresses.length > 0) {
          console.log(`Transacción ${tx.txid} involucra las direcciones: ${involvedAddresses.join(", ")}`);
          // Aquí puedes agregar lógica adicional para manejar estas transacciones
        }
      }
    }*/
  });
    
};

init();