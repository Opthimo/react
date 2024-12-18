const zmq = require('zeromq');

// ZeroMQ Request Socket erstellen
const socket = new zmq.Request();

(async () => {
    try {
        console.log('Connecting to ZeroMQ server...');
        // Verbinde mit dem ZeroMQ-Server auf Port 33406
        await socket.connect('tcp://localhost:33406');
        console.log('Connected to ZeroMQ server on port 33406');

        // Sende eine Testnachricht an den ZeroMQ-Server
        console.log('Sending message...');
        await socket.send(JSON.stringify({ type: 'test', message: 'Hello from ZeroMQ Client' }));

        // Auf Antwort vom ZeroMQ-Server warten
        const [reply] = await socket.receive();
        console.log('Received reply:', reply.toString());
    } catch (error) {
        console.error('Error communicating with ZeroMQ server:', error.message);
    } finally {
        socket.close();
    }
})();
