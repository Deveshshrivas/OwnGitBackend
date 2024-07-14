require('dotenv').config(); // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// MongoDB connection using MONGODB_URI from .env
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Message model
const messageSchema = new mongoose.Schema({
  text: String,
  user: String,
}, { timestamps: true });
const Message = mongoose.model('Message', messageSchema);

// Express and Socket.IO setup
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Enable CORS for the frontend origin
const cors = require('cors');

// If you want to allow requests from any origin
app.use(cors());

// If you want to restrict requests to a specific origin
app.use(cors({
  origin: 'https://frontentofowngit-e9b53ab21da8.herokuapp.com/'
}));

app.use(bodyParser.json());

// POST endpoint for messages
app.post('/message', async (req, res) => {
  try {
    if (typeof req.body.text !== 'string' || !req.body.text.trim() || typeof req.body.user !== 'string' || !req.body.user.trim()) {
      return res.status(400).send('Message text and user are required and must be non-empty strings');
    }

    const message = new Message(req.body);
    const savedMessage = await message.save();
    io.emit('chat message', savedMessage); // Emit the saved message to all clients
    res.status(201).send('Message saved');
  } catch (err) {
    res.status(500).send('Error saving message');
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Server listening
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});