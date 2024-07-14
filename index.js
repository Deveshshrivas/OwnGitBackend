require('dotenv').config(); // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// CORS options
const corsOptions = {
  origin: "*", // Allow all origins
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Message schema
const messageSchema = new mongoose.Schema({
  text: String,
  user: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// POST endpoint for saving a message
app.post('/messages', async (req, res) => {
  try {
    const { user, text } = req.body; // Parse the request body

    // Validate the incoming data
    if (!user || !text) {
      return res.status(400).json({ message: 'Missing user or text in request body' });
    }

    // Check text length
    if (text.length > 500) {
      return res.status(400).json({ message: 'Text exceeds maximum length of 500 characters' });
    }

    // Save the message
    const newMessage = new Message({ user, text });
    await newMessage.save();

    // Send a response
    res.status(201).json({ message: 'Message received successfully' });
  } catch (error) {
    console.error('Error handling incoming message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET endpoint for fetching messages
app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ timestamp: -1 }).limit(50); // Fetch the last 50 messages
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).send('Error fetching messages');
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});