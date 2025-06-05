// server.js

const https = require("https");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");

const PORT = 3001;
const LOG_FILE = path.join(__dirname, 'server.log');

// SSL Certificate from Let's Encrypt
const sslOptions = {
  key: fs.readFileSync("/etc/letsencrypt/live/shiyaswebsite.com/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/shiyaswebsite.com/fullchain.pem")
};

// Create HTTPS server
const httpsServer = https.createServer(sslOptions);

// Initialize Socket.IO
const io = new Server(httpsServer, {
  cors: {
    origin: "https://shiyaswebsite.com",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Helper function for logging
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  console.log(line.trim());
  fs.appendFileSync(LOG_FILE, line);
}

// Pass Socket.IO instance and log function to external handler
require("./socket.js")(io, log);

// Start the server
httpsServer.listen(PORT, () => {
  log(`[START] Secure Socket.IO server running on port ${PORT}`);
});
