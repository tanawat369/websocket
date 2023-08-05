const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mysql = require('mysql2');
const bodyparser = require('body-parser')

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(bodyparser.urlencoded({extended:true}))

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'P@ssw0rd',
  database: 'warehouse',
};

const connection = mysql.createConnection(dbConfig);

const pollInterval = 2000;
setInterval(() => {
  connection.query('SELECT * FROM stock order by Timestamp DESC Limit 10', (error, results) => {
    if (error) {
      console.error('Error fetching data:', error);
    } else {
      io.emit('data', results);
    }
  });
}, pollInterval);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/view', (req, res) => {
  connection.query(`SELECT * FROM stock WHERE ${req.body.Column} = "${req.body.where}" `, (error, results) => {
    if (error) {
      console.error('Error fetching data:', error);
    } else {
      const Rdata = results[1].Flow
      const mydata1 = {messege:Rdata}
      console.log(results)
      io.emit('mydata1', {message:Rdata});
    }
  });
});

function sendDataToClients() {
  const mydata = { message: 'Hello from the server!', timestamp: Date.now() };
  io.emit('mydata', mydata);
}

// Interval to send data to the clients every 5 seconds (for example)
setInterval(sendDataToClients, 5000);


connection.connect((error) => {
  if (error) {
    console.error('Error connecting to database:', error);
  } else {
    console.log('Connected to database');
  }
});

const PORT = 8088;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
