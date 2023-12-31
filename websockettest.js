import mempoolJS from "@mempool/mempool.js";

const init = async () => {
  
  const { bitcoin: { websocket } } = mempoolJS({
    hostname: 'mempool.space',
    network: 'testnet'
  });

  const ws = websocket.initServer({
    options: ["blocks", "stats", "mempool-blocks", "live-2h-chart"],
  });

  ws.on("message", function incoming(data) {
    const res = JSON.parse(data.toString());
    if (res.block) {
      console.log(res.block);
    }
    if (res.mempoolInfo) {
      console.log(res.mempoolInfo);
    }
    if (res.transactions) {
      console.log(res.transactions);
    }
    if (res["mempool-blocks"]) {
      console.log(res["mempool-blocks"]);
    }
  });
    
};

init();