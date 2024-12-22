import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { args } from './args';

/*
Arguments examples:
--debugger-url=ws://localhost:9222/devtools/browser/0a3c7f7f-8b7d-4b0a-8b0a-8b7d4b0a8b0a
--debugger-port=9223
*/

if (!args['debugger-url']) {
    process.exit(1);
}

const inspectorUrl = String(args['debugger-url']);
const listenerPort = Number(args['debugger-port']) || 9283;

const server = createServer();
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', async (request, socket, head) => {
    // eslint-disable-next-line
    async function performAsyncOperations() {
        const client = new WebSocket(inspectorUrl);
        client.binaryType = 'arraybuffer';
        client.on('open', () => {
            wss.handleUpgrade(request, socket, head, (ws) => {
                client.on('message', (message) => ws.send(message.toString()));
                client.on('close', () => ws.close());

                ws.on('message', (message) => client.send(message.toString()));
                ws.on('close', () => client.close());
            });
        });
        client.on('close', () => {
            socket.destroy();
        });
    }

    await performAsyncOperations();
});

server.listen(listenerPort, () => {
    console.log(`Debugger on port ${listenerPort}, Be careful!`);
});

process.on('SIGINT', () => {
    server.close();
    process.exit(0);
});
