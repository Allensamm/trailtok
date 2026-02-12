const net = require('net');

function checkConnection(host, port) {
    console.log(`Checking connection to ${host}:${port}...`);
    const socket = new net.Socket();
    socket.setTimeout(5000);

    socket.on('connect', () => {
        console.log(`✓ Connected to ${host}:${port}`);
        socket.destroy();
    });

    socket.on('timeout', () => {
        console.log(`✗ Timeout connecting to ${host}:${port}`);
        socket.destroy();
    });

    socket.on('error', (err) => {
        console.log(`✗ Error connecting to ${host}:${port}: ${err.message}`);
    });

    socket.connect(port, host);
}

const host = 'aws-1-eu-west-1.pooler.supabase.com';
checkConnection(host, 6543);
checkConnection(host, 5432);
