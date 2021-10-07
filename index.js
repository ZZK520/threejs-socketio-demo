const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const positions = new Map();
io.on("connection", socket => {
  //连接时，将客户端存储进服务器
  let message = {};
  message.id = socket.id;
  message.pos = {x:0,y:0,z:0};
  io.emit("marker2", message);
  positions.set(socket.id,message.pos );
  console.log('server socket.id connected', socket.id);
  console.log('positions', positions);
// 将服务器上存储的其他物体信息传送给客户端
  for (let i of positions.keys()) {
    let message = {};
    message.id = i;
    message.pos = positions.get(i);
    socket.emit("marker2", message);
    console.log(`marker2`);
  }
  // 接收到更新位置时传送过来的数据，更新服务器上对应物体位置数据，将对应物体的数据在服务器端更新
  socket.on("marker2", data => {
    let message = {};
    message.id = socket.id;
    message.pos = data;
    positions.set(socket.id, data);//接受客户端传送过来的位置，在服务器上端更新位置
    console.log('io emit');
    io.emit("marker2", message);//将该物体位置更新数据，广播给所有客户端
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});