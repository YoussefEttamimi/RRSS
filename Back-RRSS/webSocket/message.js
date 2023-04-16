const io = require('../index');

const clients = new Map();

io.on('connection', (socket) => {
  console.log('A new client connected');

  socket.on('message', (data) => {
    console.log(`Received message: ${data}`);

    const message = JSON.parse(data);

    if (message.type === 'login') {
      // Add new client to clients Map
      clients.set(message.username, socket);
      console.log(`Client ${message.username} logged in`);
    } else if (message.type === 'message') {
      // Send message to recipient
      const recipientSocket = clients.get(message.recipient);
      if (recipientSocket) {
        const messageData = {
          type: 'message',
          sender: message.sender,
          text: message.text
        };
        recipientSocket.send(JSON.stringify(messageData));
        console.log(`Sent message to ${message.recipient}`);
      }
    }
  });

  io.on('close', () => {
    console.log('Client disconnected');
    // Remove client from clients Map
    clients.forEach((value, key) => {
      if (value === socket) {
        clients.delete(key);
        console.log(`Removed client ${key}`);
      }
    });
  });
});
