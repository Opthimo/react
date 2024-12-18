const zmq = require('zeromq');
const WebSocket = require('ws');

// ZeroMQ Reply Socket erstellen
const zmqSocket = new zmq.Reply();

(async () => {
    try {
        await zmqSocket.bind('tcp://*:33406');
        console.log('ZeroMQ REP socket bound to port 33406');
    } catch (e) {
        console.error('Error binding socket:', e.message);
        return;
    }
})();

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
    ws.on('message', async message => {
        console.log('Received message from WebSocket client:', message);
        
        // Sende die Nachricht an ZeroMQ und warte auf die Antwort
        await zmqSocket.send(message);
        const [reply] = await zmqSocket.receive();

        try {
            const data = JSON.parse(reply.toString());
            
            // Filtern der Handdaten (Left und Right)
            const filteredData = Object.keys(data).reduce((acc, personId) => {
                const skeleton = data[personId];
                acc[personId] = {
                    HandLeft: skeleton.HandLeft || null,
                    HandRight: skeleton.HandRight || null,
                };
                return acc;
            }, {});

            ws.send(JSON.stringify(filteredData));  // Senden der gefilterten Handdaten an den WebSocket-Client
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    });
});
