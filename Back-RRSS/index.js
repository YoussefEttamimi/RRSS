'use strict';

const mongoose = require('mongoose');
const app = require('./app');
const http = require('http');
const socketIO = require('socket.io');
const websocket = require('./webSocket/message');

const port = 3800;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://db:27017/curso_mean_social')
    .then(() => {
        console.log("Se ha conectado a la base de datos");

        // Crear servidor HTTP
        const server = http.createServer(app);

        // Inicializar Socket.IO
        const io = require("socket.io")(server, {
            cors: { origin: "http://localhost:4200" }
        });

        websocket.socketMessage(io);

        // Iniciar servidor
        server.listen(port, () => {
            console.log(`Servidor corriendo en puerto ${port}`);
        });
    })
    .catch(err => console.log(err));
