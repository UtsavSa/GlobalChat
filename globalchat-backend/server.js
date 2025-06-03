// server.js
const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',       // allow all origins for simplicity
    methods: ['GET', 'POST']
  }
});

// Optional: enable CORS for REST endpoints if you add them
app.use(cors());
app.use(express.json());

// Path to your JSON file that will store chat history
const chatFilePath = path.join(__dirname, 'chats.json');
let chatMessages = [];

// Load existing messages from the JSON file at startup
try {
  const rawData = fs.readFileSync(chatFilePath, 'utf8');
  chatMessages = JSON.parse(rawData);
} catch (error) {
  console.log('No existing chats.json found or error reading file. Starting fresh.');
  chatMessages = [];
}
const userSockets = {};
// Handle new connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send previous chats to the new user
  socket.emit('previousChats', chatMessages);

  socket.on('register', (username) => {
    userSockets[username] = socket.id;
    console.log(`Registered: ${username} => ${socket.id}`)
  });

  // Listen for new chat messages
  socket.on('newMessage', (message) => {
    console.log('New message:', message);
    
    // Add new message to chat history in memory
    chatMessages.push(message);

    // Broadcast the new message to all connected clients
    io.emit('messageReceived', message);

    // Persist the updated chats to JSON file
    fs.writeFile(chatFilePath, JSON.stringify(chatMessages, null, 2), (err) => {
      if (err) {
        console.error('Error writing chats to file:', err);
      }
    });
  });

    socket.on('signal', ({ to, from, data }) => {
    const targetSocketId = userSockets[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('signal', { from, data });
      console.log(`📤 Forwarded signal from ${from} to ${to}`);
    } else {
      console.warn(`⚠️ Could not find socket for ${to}`);
    }
  });

  socket.on('requestPreviousChats', () => {
  console.log(`📤 Resending previousChats to ${socket.id}`);
  socket.emit('previousChats', chatMessages);
});


  // 🧹 Cleanup on disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    for (const username in userSockets) {
      if (userSockets[username] === socket.id) {
        console.log(`❌ Removed mapping for ${username}`);
        delete userSockets[username];
        break;
      }
    }
  });
});
//----- need it for ngrok ----
// Serve Angular frontend from dist/browser folder
// app.use(express.static(path.join(__dirname, 'dist', 'browser')));

// // Fallback route: send index.html for Angular routing
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist', 'browser', 'index.html'));
// });


// only when using localhost
// app.get('/', (req, res) => {
//   res.send('Backend is working and reacheable. ')
// });


// Serve Angular frontend
app.use(express.static(path.join(__dirname, 'public/browser')));

// Redirect all other routes to index.html (for Angular routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/browser', 'index.html'));
});

// Start the server
const PORT = 3300;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
