const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config(); // Load environment variables from .env file

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => {
        console.log("MongoDB connection error:", err);
        process.exit(1); // Exit the process if cannot connect to MongoDB
    });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        // Removed methods restriction to allow for Socket.IO's default behavior
        credentials: true
    }
});

app.use(express.json());
app.use(cors()); // Enable CORS with default options

const messageSchema = new mongoose.Schema({
    user: String,
    time: { type: Date, default: Date.now },
    text: String,
});

const Message = mongoose.model('Message', messageSchema);

// POST route for saving new messages
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
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});