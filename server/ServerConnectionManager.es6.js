var server = require('./ioServer');
var EventEmitter = require('events').EventEmitter;

'use strict';

class ServerConnectionManager extends EventEmitter {
  constructor() {
    server.io.of('/play').on('connection', (socket) => {
      console.log('Global connection on socket \'' + socket.id + '\'');
      this.emit('connected', socket);

      socket.on('disconnect', () => {
        this.emit('disconnected', socket);
      });
    });
  }
}

module.exports = ServerConnectionManager;

// TODO: handle /admin.html page