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
  // Existing code for saving a message
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