const fetch = require('node-fetch');

async function testRegister() {
    const userData = {
        nombre: 'Test User',
        email: 'test' + Date.now() + '@example.com',
        contraseña: 'Password123!',
        rol: 'TURISTA',
        telefono: '+593987654321',
        fecha_nacimiento: '1990-01-01'
    };

    console.log('Testing registration with:', userData);

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        console.log('Status code:', response.status);
        console.log('Response body:', data);
    } catch (error) {
        console.error('Fetch error:', error.message);
    }
}

testRegister();
