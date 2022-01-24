import http from 'http';
import SocketIO from 'socket.io';
import express from 'express';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/'));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on('connection', (socket) => {
  socket['nickname'] = 'Anon';
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  socket.on('connect_with_nickname', (roomName, nickname, done) => {
    socket['nickname'] = nickname;
    socket.join(roomName);
    done();
    socket.to(roomName).emit('welcome', socket.nickname);
  });

  socket.on('enter_room', (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit('welcome', socket.nickname);
  });
  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit('bye', socket.nickname)
    );
  });
  socket.on('new_message', (msg, room, done) => {
    socket.to(room).emit('new_message', `${socket.nickname} : ${msg}`);
    done();
  });
  socket.on('nickname', (nickname) => (socket['nickname'] = nickname));
});

/*
const sockets = [];

wss.on('connection', (socket) => {
  sockets.push(socket);
  socket['nickname'] = 'Anon';
  console.log('Connected to Browser ✅');
  socket.on('close', onSocketClose);
  socket.on('message', (payload) => {
    const message = JSON.parse(payload);
    switch (message.type) {
      case 'new_message':
        sockets.forEach((aScoket) =>
          aScoket.send(`${socket.nickname}: ${message.payload}`)
        );
        break;
      case 'nickname':
        socket['nickname'] = message.payload;
        break;
    }
  });
});
*/

const handleListen = () => console.log('Listening on http://localhost:3000');
httpServer.listen(3000, handleListen);
