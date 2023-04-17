'use strict';
var auth = require('../middleware/authenticated');
const messageController = require('../controllers/message');
var userSockets = [];

const socketMessage = (io) => {
  io.on("connection", (socket) => {
    console.log('Cliente conectado: ' + socket.id);

    socket.on('session_start', (data) => {

      var userSocketIndex = userSockets.findIndex(userSocket => userSocket.userID == data);

      //Si encontramos el registro.
      if (userSocketIndex != -1) {
        userSockets[userSocketIndex].socketID = socket.id;
      }
      //Si no encontramos el registro.
      else {
        userSockets.push({ userID: data, socketID: socket.id });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log('Cliente desconectado: ' + socket.id);
      var userSocketIndex = userSockets.findIndex(userSocket => userSocket.socketID == socket.id);
      if (userSocketIndex != -1) {
        userSockets.splice(userSocketIndex, 1);
      }
    });

    socket.on("newMessage", (token, message) => {

      var user = auth.ensureAuthSocket(token);
      if (user != '') {

        messageController.saveMessageSocket(user, message).then((result) => {
          if (result.error) {
            socket.emit("newMessageKO", result.message);
          }
          else {

            //Si todo ha ido bien, debemos informar a quien envió en mensaje y a quien lo recibe.
            var emitter = result.messageStored.emitter._id.toString();
            var receiver = result.messageStored.receiver._id.toString();

            //Buscamos el socket del emisor para ver si está conectado.
            var emitterSocket = userSockets.find(userSocket => userSocket.userID == emitter);
            if (emitterSocket != undefined) {
              socket.emit("newMessageOK", result.messageStored);
            }

            //Buscamos el socket del receptor para ver si está conectado.
            var receiverSocket = userSockets.find(userSocket => userSocket.userID == receiver);
            if (receiverSocket != undefined) {
              socket.to(receiverSocket.socketID).emit("newMessageOK", result.messageStored);
            }

          }
        });

      }
      else {
        socket.emit("newMessageKO", "Error de autenticación");
      }

    });

  });
}

module.exports = { socketMessage };