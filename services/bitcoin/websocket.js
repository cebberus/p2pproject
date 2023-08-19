const WebSocket = require('ws');

const TESTNET_ADDRESS = 'mu9ZhfsRtqitpoEDK3bkTyvhPyQEqTpGUf';

const init = () => {
    const ws = new WebSocket('wss://ws.blockchain.info/inv');
    
    ws.on('open', () => {
        console.log("WebSocket connection established.");
        ws.send(JSON.stringify({
            "op": "addr_sub",
            "addr": TESTNET_ADDRESS
        }));
    });

    ws.on('message', (data) => {
        const res = JSON.parse(data);
        console.log(res);
        if (res.op === "utx") {
            const outputs = res.x.out;
            const inputs = res.x.inputs;
            for (let output of outputs) {
                if (output.addr === TESTNET_ADDRESS) {
                    console.log(`Received BTC: ${output.value / 100000000} to address ${TESTNET_ADDRESS}`);
                }
            }
            for (let input of inputs) {
                if (input.prev_out.addr === TESTNET_ADDRESS) {
                    console.log(`Sent BTC: ${input.prev_out.value / 100000000} from address ${TESTNET_ADDRESS}`);
                }
            }
        }
    });

    ws.on('close', () => {
        console.log("WebSocket connection closed.");
    });

    ws.on('error', (error) => {
        console.error("WebSocket error:", error);
    });
}

init();







