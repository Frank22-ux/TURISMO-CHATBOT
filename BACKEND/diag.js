const http = require('http');

const userData = JSON.stringify({
    nombre: 'Test User',
    email: 'test' + Date.now() + '@example.com',
    contraseña: 'Password123!',
    rol: 'TURISTA',
    telefono: '+593987654321',
    fecha_nacimiento: '1990-01-01'
});

const options = {
    hostname: 'localhost',
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
        console.log('Status:', res.statusCode);
        console.log('Body:', data);
    });
});

req.on('error', (e) => {
    console.error('Request error:', e.message);
});

req.write(userData);
req.end();
