const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

// MongoDB connection using environment variable
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN, // Use environment variable for CORS origin
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors({
    origin: process.env.CORS_ORIGIN, // Use environment variable for CORS origin
    credentials: true
}));
app.use(express.json());

const messageSchema = new mongoose.Schema({
    user: String,
    time: String,
    text: String,
});

const Message = mongoose.model('Message', messageSchema);

io.on('connection', (socket) => {
    console.log('a user connected');
    
    // Send all messages to the client, limited to the last 50 messages
    Message.find().sort({ _id: -1 }).limit(50).then(messages => {
        socket.emit('chat messages', messages.reverse());
    });

    // Listen for new messages
    socket.on('chat message', (msg) => {
        const message = new Message(msg);
        message.save().then(() => {
            io.emit('chat message', msg); // Emit the message to all clients
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const port = process.env.PORT || 3001; // Dynamic port configuration for Heroku
