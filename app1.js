const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Initialize MySQL connection (using a library like 'mysql2' or 'mysql')
const mysql = require('mysql2');
const dbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'P@ssw0rd',
  database: 'warehouse',
});

// WebSockets connections array
const connections = [];

wss.on('connection', (ws) => {
  connections.push(ws);

  ws.on('close', () => {
    // Remove closed connections
    const index = connections.indexOf(ws);
    if (index !== -1) {
      connections.splice(index, 1);
    }
  });
});

// MySQL listener for database changes
const watchDatabaseChanges = () => {
  const query = 'SELECT * FROM your_table_to_watch_for_changes';
  const changeStream = dbConnection.query(query, { timeout: 0, enableCursors: true });

  changeStream.on('result', (row) => {
    // Emit the changed data to all connected WebSocket clients
    const jsonData = JSON.stringify(row);
    connections.forEach((ws) => {
      ws.send(jsonData);
    });
  });

  changeStream.on('end', () => {
    // Handle end/error if needed
  });

  changeStream.on('error', (err) => {
    // Handle end/error if needed
  });
};
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index1.html');
});

// Start the server and begin watching for database changes
server.listen(3000, () => {
  console.log('Server started on port 3000');
  watchDatabaseChanges();
});
