const { spawn } = require('child_process');
const http = require('http');

async function runDebug() {
    console.log('Starting server...');
    const server = spawn('node', ['src/server.js'], { cwd: './' });

    server.stdout.on('data', (data) => {
        console.log(`[SERVER STDOUT]: ${data.toString()}`);
    });

    server.stderr.on('data', (data) => {
        console.error(`[SERVER STDERR]: ${data.toString()}`);
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('Sending test request...');
    const userData = JSON.stringify({
        nombre: 'Test User',
        email: 'test' + Date.now() + '@example.com',
        contraseña: 'Password123!',
        rol: 'TURISTA',
        telefono: '+593987654321',
        fecha_nacimiento: '1990-01-01'
    });

    const options = {
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': userData.length
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log('Request Status:', res.statusCode);
            console.log('Request Body:', data);
            setTimeout(() => {
                server.kill();
                process.exit(0);
            }, 2000);
        });
    });

    req.on('error', (e) => {
        console.error('Request error:', e.message);
        server.kill();
        process.exit(1);
    });

    req.write(userData);
    req.end();

    // Kill after timeout
    setTimeout(() => {
        console.log('Timeout reached, killing server.');
        server.kill();
        process.exit(1);
    }, 10000);
}

runDebug();
