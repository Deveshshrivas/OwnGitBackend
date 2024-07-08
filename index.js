const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/chatApp', { useNewUrlParser: true, useUnifiedTopology: true });

// Define the Message model
const messageSchema = new mongoose.Schema({
  text: String,
  user: String,
}, { timestamps: true });
const Message = mongoose.model('Message', messageSchema);

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());

app.post('/message', (req, res) => {
    // Enhanced validation to check if text and user are strings
    if (typeof req.body.text !== 'string' || !req.body.text.trim() || typeof req.body.user !== 'string' || !req.body.user.trim()) {
        return res.status(400).send('Message text and user are required and must be non-empty strings');
    }

    const message = new Message(req.body);
    message.save()
        .then((savedMessage) => {
            io.emit('chat message', savedMessage); // Emit the saved message to all clients
            res.status(201).send('Message saved');
        })
        .catch(err => res.status(500).send('Error saving message'));
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});