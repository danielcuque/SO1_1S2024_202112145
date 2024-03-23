const Redis = require('ioredis');

const client = new Redis({
    host: '10.246.157.227',
    port: 6379,
});

client.on('error', (err) => {
    console.error('Error de conexión a Redis:', err);
});

client.on('connect', () => {
    console.log('Conexión a Redis establecida correctamente');
});

async function publicarMensaje() {
    try {
        const mensaje = JSON.stringify({ "msg": "Hola a todos" });
        const canal = 'test';


        await client.publish(canal, mensaje);
        console.log('Mensaje publicado correctamente en el canal', canal);
    } catch (error) {
        console.error('Error al publicar el mensaje:', error);
    }
}

setInterval(publicarMensaje, 5000);