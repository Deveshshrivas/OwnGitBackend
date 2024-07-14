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

// Express and Socket.IO setup
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Define CORS options if needed, or directly use the cors() middleware with specific options
const corsOptions = {
  origin: 'https://frontentofowngit-e9b53ab21da8.herokuapp.com/', // Your frontend application's origin
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Define the Message model according to your MongoDB schema
const messageSchema = new mongoose.Schema({
  text: String,
  user: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

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
    console.error('Error saving message:', err);
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