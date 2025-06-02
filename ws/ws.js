const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let clients = [];

wss.on('connection', ws => {
  console.log('Client connected');
  clients.push(ws);

  ws.on('message', msg => {
    const stringMsg = msg.toString();
    console.log('Received:', stringMsg);
    // Relay message to all other clients
    clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(stringMsg);
      }
    });
  });

  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
  });
});
