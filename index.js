require('dotenv').config(); // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const corsOptions = {
  origin: "*", // Corrected origin
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

const messageSchema = new mongoose.Schema({
  text: String,
  user: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// POST endpoint for saving a message
app.post('/message', async (req, res) => {
  app.post('/messages', async (req, res) => {
    try {
      // Step 1: Parse the request body
      const { user, text } = req.body;
  
      // Step 2: Validate the incoming data
      if (!user || !text) {
        return res.status(400).json({ message: 'Missing user or text in request body' });
      }
  
      // Assuming a maxLength for text
      if (text.length > 500) {
        return res.status(400).json({ message: 'Text exceeds maximum length of 500 characters' });
      }
  
      // Step 3: Save the message (pseudo-code, replace with your actual database logic)
      // const savedMessage = await database.saveMessage({ user, text });
      console.log(`Message received from ${user}: ${text}`); // Placeholder for actual save operation
  
      // Step 4: Send a response
      res.status(201).json({ message: 'Message received successfully' });
    } catch (error) {
      console.error('Error handling incoming message:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
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

io.on('connection', (socket) => {
  // Existing Socket.IO connection handling
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});