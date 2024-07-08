const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

// MongoDB connection
mongoose.connect('mongodb+srv://deveshshrivas060:Gq7mmeGubT8twoD8@cluster0.w8nmlpu.mongodb.net/OwnGit_Dev_ChatRoom')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Ensure this matches the client-side URL
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors({
    origin: "http://localhost:3000", // Match this with the client-side URL
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

server.listen(3001, () => {
    console.log('listening on *:3001');
});