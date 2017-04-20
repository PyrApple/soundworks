'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _server = require('../core/server');

var _server2 = _interopRequireDefault(_server);

var _Service2 = require('../core/Service');

var _Service3 = _interopRequireDefault(_Service2);

var _serviceManager = require('../core/serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

var _uws = require('uws');

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _pem = require('pem');

var _pem2 = _interopRequireDefault(_pem);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SERVICE_ID = 'service:raw-socket';

/**
 * Protocol defined in configuration is added to these two entry that manage
 * the handshake at the creation of the socket.
 * @private
 */
var baseProtocol = [{ channel: 'service:handshake', type: 'Uint32' }, { channel: 'service:handshake-ack', type: 'Uint8' }];

/**
 * Counter that create tokens in order to match sockets and clients.
 * @private
 */
var counter = 0;

/**
 * Interface for the `raw-socket` service.
 *
 * This service creates an additionnal native socket with its binary type set
 * to `arraybuffer` and focused on performances.
 * It allows the transfert of `TypedArray` data wrapped with a minimal channel
 * mechanism (up to 256 channels).
 *
 * The user-defined protocol must follow the convention:
 * @example
 * const protocol = [
 *   { channel: 'my-channel', type: 'Float32' }
 *   // ...
 * ]
 *
 * Where the `channel` can be any string and the `type` can be interpolated
 * to any `TypedArray` by concatenating `'Array'` at its end.
 *
 * __*The service must be used with its [client-side counterpart]{@link module:soundworks/client.RawSocket}*__
 *
 * @memberof module:soundworks/server
 */

var RawSocket = function (_Service) {
  (0, _inherits3.default)(RawSocket, _Service);

  function RawSocket() {
    (0, _classCallCheck3.default)(this, RawSocket);

    var _this = (0, _possibleConstructorReturn3.default)(this, (RawSocket.__proto__ || (0, _getPrototypeOf2.default)(RawSocket)).call(this, SERVICE_ID));

    var defaults = {
      configItem: 'rawSocket'
    };

    _this.configure(defaults);

    _this._port = null;
    _this._protocol = null;
    _this._channels = null;

    /**
     * Listeners for the incomming messages.
     *
     * @type {Map<client, Set<Function>>}
     * @name _listeners
     * @memberof module:soundworks/server.RawSocket
     * @instance
     * @private
     */
    _this._listeners = new _map2.default();

    _this._tokenClientMap = new _map2.default();
    _this._clientSocketMap = new _map2.default();
    _this._socketClientMap = new _map2.default();

    _this._protocol = baseProtocol;

    // retrieve service config + useHttps
    _this._sharedConfig = _this.require('shared-config');

    _this._onConnection = _this._onConnection.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(RawSocket, [{
    key: 'configure',
    value: function configure(options) {
      if (options.protocol) this._protocol = this._protocol.concat(options.protocol);

      (0, _get3.default)(RawSocket.prototype.__proto__ || (0, _getPrototypeOf2.default)(RawSocket.prototype), 'configure', this).call(this, options);
    }
  }, {
    key: 'addProtocolDefinition',
    value: function addProtocolDefinition(def) {
      this._protocol.push(def);
    }

    /** @private */

  }, {
    key: 'start',
    value: function start() {
      var _this2 = this;

      (0, _get3.default)(RawSocket.prototype.__proto__ || (0, _getPrototypeOf2.default)(RawSocket.prototype), 'start', this).call(this);

      var configItem = this.options.configItem;
      var config = this._sharedConfig.get(configItem);

      this._port = config.port;

      if (Array.isArray(config.protocol)) this._protocol = this.protocol.concat(config.protocol);

      this._channels = this._protocol.map(function (def) {
        return def.channel;
      });

      // check http / https mode
      var useHttps = _server2.default.config.useHttps;

      // launch http(s) server
      if (!useHttps) {
        var httpServer = _http2.default.createServer();
        this.runServer(httpServer);
      } else {
        var httpsInfos = _server2.default.config.httpsInfos;

        // use given certificate
        if (httpsInfos.key && httpsInfos.cert) {
          var key = _fs2.default.readFileSync(httpsInfos.key);
          var cert = _fs2.default.readFileSync(httpsInfos.cert);

          var httpsServer = _https2.default.createServer({ key: key, cert: cert });
          this.runServer(httpsServer);
          // generate certificate on the fly (for development purposes)
        } else {
          _pem2.default.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
            var httpsServer = _https2.default.createServer({ key: keys.serviceKey, cert: keys.certificate });
            _this2.runServer(httpsServer);
          });
        }
      }
    }
  }, {
    key: 'runServer',
    value: function runServer(server) {
      server.listen(this._port, function () {
        // console.log(SERVICE_ID, ': Https server listening on port:', this._port);
      });

      this._wss = new _uws.Server({ server: server });
      this._wss.on('connection', this._onConnection);
    }

    /** @private */

  }, {
    key: 'connect',
    value: function connect(client) {
      var _this3 = this;

      // send infos to create the socket to the client
      (0, _get3.default)(RawSocket.prototype.__proto__ || (0, _getPrototypeOf2.default)(RawSocket.prototype), 'receive', this).call(this, client, 'request', function () {
        var token = counter += 1;
        _this3._tokenClientMap.set(token, client);

        (0, _get3.default)(RawSocket.prototype.__proto__ || (0, _getPrototypeOf2.default)(RawSocket.prototype), 'send', _this3).call(_this3, client, 'infos', _this3._port, _this3._protocol, token);
      });
    }
  }, {
    key: 'disconect',
    value: function disconect(client) {
      var socket = this._clientSocketMap.get(client);

      this._clientSocketMap.delete(client);
      this._socketClientMap.delete(socket);
    }

    /** @private */

  }, {
    key: '_onConnection',
    value: function _onConnection(socket) {
      var _this4 = this;

      socket.on('message', function (buffer) {
        buffer = new Uint8Array(buffer).buffer;
        var index = new Uint8Array(buffer)[0];

        if (!_this4._protocol[index]) throw new Error('Invalid protocol index: ${index}');

        var _protocol$index = _this4._protocol[index],
            channel = _protocol$index.channel,
            type = _protocol$index.type;

        var viewCtor = global[type + 'Array'];
        var data = new viewCtor(buffer, viewCtor.BYTES_PER_ELEMENT);

        if (channel === 'service:handshake') _this4._pairClientSocket(socket, data[0]);else _this4._propagateEvent(socket, channel, data);
      });
    }

    /**
     * Associate the socket with the corresponding client according to the `token`
     *
     * @param {Socket} socket - Socket which receive the message.
     * @param {Number} token - Token to match the client associated to the socket.
     * @private
     */

  }, {
    key: '_pairClientSocket',
    value: function _pairClientSocket(socket, token) {
      var client = this._tokenClientMap.get(token);
      this._clientSocketMap.set(client, socket);
      this._socketClientMap.set(socket, client);
      this._tokenClientMap.delete(token);

      this.send(client, 'service:handshake-ack');
    }

    /**
     * Call all the registered listener associated to a client.
     *
     * @param {Socket} socket - Socket which received the message.
     * @param {String} channel - Channel of the message.
     * @param {TypedArray} data - Received data.
     * @private
     */

  }, {
    key: '_propagateEvent',
    value: function _propagateEvent(socket, channel, data) {
      var client = this._socketClientMap.get(socket);
      var clientListeners = this._listeners.get(client);
      var callbacks = clientListeners[channel];

      callbacks.forEach(function (callback) {
        return callback(data);
      });
    }

    /**
     * Register a callback function on a specific channel.
     *
     * @param {client} client - Client to listen the message from.
     * @param {String} channel - Channel of the message.
     * @param {Function} callback - Callback function.
     */

  }, {
    key: 'receive',
    value: function receive(client, channel, callback) {
      var listeners = this._listeners;

      if (!listeners.has(client)) listeners.set(client, {});

      var clientListeners = listeners.get(client);

      if (!clientListeners[channel]) clientListeners[channel] = new _set2.default();

      clientListeners[channel].add(callback);
    }

    /**
     * Send data to a specific client, on a given channel.
     *
     * @param {client} client - Client to send the message to.
     * @param {String} channel - Channel of the message.
     * @param {TypedArray} data - Data.
     */

  }, {
    key: 'send',
    value: function send(client, channel, data) {
      var socket = this._clientSocketMap.get(client);
      var index = this._channels.indexOf(channel);

      if (index === -1) throw new Error('Undefined channel "' + channel + '"');

      var type = this._protocol[index].type;

      var viewCtor = global[type + 'Array'];
      var size = data ? 1 + data.length : 1;
      var view = new viewCtor(size);

      var channelView = new Uint8Array(viewCtor.BYTES_PER_ELEMENT);
      channelView[0] = index;
      // populate final buffer
      view.set(new viewCtor(channelView.buffer), 0);

      if (data) view.set(data, 1);

      socket.send(view.buffer);
    }

    /**
     * Broadcast data to several client at once.
     *
     * @param {String|Array} clientType - Type or types of client to send the
     *  message to.
     * @param {client} excludeClient - Client to exclude from the broadcast.
     * @param {String} channel - Channel of the message.
     * @param {TypedArray} data - Data.
     */

  }, {
    key: 'broadcast',
    value: function broadcast(clientType, excludeClient, channel, data) {
      if (!Array.isArray(clientType)) clientType = [clientType];

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(this._clientSocketMap.keys()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var client = _step.value;

          if (clientType.indexOf(client.type) !== -1 && client !== excludeClient) this.send(client, channel, data);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }]);
  return RawSocket;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, RawSocket);

exports.default = RawSocket;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJhd1NvY2tldC5qcyJdLCJuYW1lcyI6WyJTRVJWSUNFX0lEIiwiYmFzZVByb3RvY29sIiwiY2hhbm5lbCIsInR5cGUiLCJjb3VudGVyIiwiUmF3U29ja2V0IiwiZGVmYXVsdHMiLCJjb25maWdJdGVtIiwiY29uZmlndXJlIiwiX3BvcnQiLCJfcHJvdG9jb2wiLCJfY2hhbm5lbHMiLCJfbGlzdGVuZXJzIiwiX3Rva2VuQ2xpZW50TWFwIiwiX2NsaWVudFNvY2tldE1hcCIsIl9zb2NrZXRDbGllbnRNYXAiLCJfc2hhcmVkQ29uZmlnIiwicmVxdWlyZSIsIl9vbkNvbm5lY3Rpb24iLCJiaW5kIiwib3B0aW9ucyIsInByb3RvY29sIiwiY29uY2F0IiwiZGVmIiwicHVzaCIsImNvbmZpZyIsImdldCIsInBvcnQiLCJBcnJheSIsImlzQXJyYXkiLCJtYXAiLCJ1c2VIdHRwcyIsImh0dHBTZXJ2ZXIiLCJjcmVhdGVTZXJ2ZXIiLCJydW5TZXJ2ZXIiLCJodHRwc0luZm9zIiwia2V5IiwiY2VydCIsInJlYWRGaWxlU3luYyIsImh0dHBzU2VydmVyIiwiY3JlYXRlQ2VydGlmaWNhdGUiLCJkYXlzIiwic2VsZlNpZ25lZCIsImVyciIsImtleXMiLCJzZXJ2aWNlS2V5IiwiY2VydGlmaWNhdGUiLCJzZXJ2ZXIiLCJsaXN0ZW4iLCJfd3NzIiwib24iLCJjbGllbnQiLCJ0b2tlbiIsInNldCIsInNvY2tldCIsImRlbGV0ZSIsImJ1ZmZlciIsIlVpbnQ4QXJyYXkiLCJpbmRleCIsIkVycm9yIiwidmlld0N0b3IiLCJnbG9iYWwiLCJkYXRhIiwiQllURVNfUEVSX0VMRU1FTlQiLCJfcGFpckNsaWVudFNvY2tldCIsIl9wcm9wYWdhdGVFdmVudCIsInNlbmQiLCJjbGllbnRMaXN0ZW5lcnMiLCJjYWxsYmFja3MiLCJmb3JFYWNoIiwiY2FsbGJhY2siLCJsaXN0ZW5lcnMiLCJoYXMiLCJhZGQiLCJpbmRleE9mIiwic2l6ZSIsImxlbmd0aCIsInZpZXciLCJjaGFubmVsVmlldyIs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LElBQTNCO0FBQ0g7QUFQaUQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVFuRDs7Ozs7QUFHSCx5QkFBZW1CLFFBQWYsQ0FBd0JqRixVQUF4QixFQUFvQ0ssU0FBcEM7O2tCQUVlQSxTIiwiZmlsZSI6IlJhd1NvY2tldC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzZXJ2ZXIgZnJvbSAnLi4vY29yZS9zZXJ2ZXInO1xuaW1wb3J0IFNlcnZpY2UgZnJvbSAnLi4vY29yZS9TZXJ2aWNlJztcbmltcG9ydCBzZXJ2aWNlTWFuYWdlciBmcm9tICcuLi9jb3JlL3NlcnZpY2VNYW5hZ2VyJztcbmltcG9ydCB7IFNlcnZlciBhcyBXZWJTb2NrZXRTZXJ2ZXIgfSBmcm9tICd1d3MnO1xuaW1wb3J0IGh0dHAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IHBlbSBmcm9tICdwZW0nO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuY29uc3QgU0VSVklDRV9JRCA9ICdzZXJ2aWNlOnJhdy1zb2NrZXQnO1xuXG5cbi8qKlxuICogUHJvdG9jb2wgZGVmaW5lZCBpbiBjb25maWd1cmF0aW9uIGlzIGFkZGVkIHRvIHRoZXNlIHR3byBlbnRyeSB0aGF0IG1hbmFnZVxuICogdGhlIGhhbmRzaGFrZSBhdCB0aGUgY3JlYXRpb24gb2YgdGhlIHNvY2tldC5cbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IGJhc2VQcm90b2NvbCA9IFtcbiAgeyBjaGFubmVsOiAnc2VydmljZTpoYW5kc2hha2UnLCB0eXBlOiAnVWludDMyJyB9LFxuICB7IGNoYW5uZWw6ICdzZXJ2aWNlOmhhbmRzaGFrZS1hY2snLCB0eXBlOiAnVWludDgnIH0sXG5dO1xuXG4vKipcbiAqIENvdW50ZXIgdGhhdCBjcmVhdGUgdG9rZW5zIGluIG9yZGVyIHRvIG1hdGNoIHNvY2tldHMgYW5kIGNsaWVudHMuXG4gKiBAcHJpdmF0ZVxuICovXG5sZXQgY291bnRlciA9IDA7XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUgYHJhdy1zb2NrZXRgIHNlcnZpY2UuXG4gKlxuICogVGhpcyBzZXJ2aWNlIGNyZWF0ZXMgYW4gYWRkaXRpb25uYWwgbmF0aXZlIHNvY2tldCB3aXRoIGl0cyBiaW5hcnkgdHlwZSBzZXRcbiAqIHRvIGBhcnJheWJ1ZmZlcmAgYW5kIGZvY3VzZWQgb24gcGVyZm9ybWFuY2VzLlxuICogSXQgYWxsb3dzIHRoZSB0cmFuc2ZlcnQgb2YgYFR5cGVkQXJyYXlgIGRhdGEgd3JhcHBlZCB3aXRoIGEgbWluaW1hbCBjaGFubmVsXG4gKiBtZWNoYW5pc20gKHVwIHRvIDI1NiBjaGFubmVscykuXG4gKlxuICogVGhlIHVzZXItZGVmaW5lZCBwcm90b2NvbCBtdXN0IGZvbGxvdyB0aGUgY29udmVudGlvbjpcbiAqIEBleGFtcGxlXG4gKiBjb25zdCBwcm90b2NvbCA9IFtcbiAqICAgeyBjaGFubmVsOiAnbXktY2hhbm5lbCcsIHR5cGU6ICdGbG9hdDMyJyB9XG4gKiAgIC8vIC4uLlxuICogXVxuICpcbiAqIFdoZXJlIHRoZSBgY2hhbm5lbGAgY2FuIGJlIGFueSBzdHJpbmcgYW5kIHRoZSBgdHlwZWAgY2FuIGJlIGludGVycG9sYXRlZFxuICogdG8gYW55IGBUeXBlZEFycmF5YCBieSBjb25jYXRlbmF0aW5nIGAnQXJyYXknYCBhdCBpdHMgZW5kLlxuICpcbiAqIF9fKlRoZSBzZXJ2aWNlIG11c3QgYmUgdXNlZCB3aXRoIGl0cyBbY2xpZW50LXNpZGUgY291bnRlcnBhcnRde0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5SYXdTb2NrZXR9Kl9fXG4gKlxuICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL3NlcnZlclxuICovXG5jbGFzcyBSYXdTb2NrZXQgZXh0ZW5kcyBTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoU0VSVklDRV9JRCk7XG5cbiAgICBjb25zdCBkZWZhdWx0cyA9IHtcbiAgICAgIGNvbmZpZ0l0ZW06ICdyYXdTb2NrZXQnLFxuICAgIH07XG5cbiAgICB0aGlzLmNvbmZpZ3VyZShkZWZhdWx0cyk7XG5cbiAgICB0aGlzLl9wb3J0ID0gbnVsbDtcbiAgICB0aGlzLl9wcm90b2NvbCA9IG51bGw7XG4gICAgdGhpcy5fY2hhbm5lbHMgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogTGlzdGVuZXJzIGZvciB0aGUgaW5jb21taW5nIG1lc3NhZ2VzLlxuICAgICAqXG4gICAgICogQHR5cGUge01hcDxjbGllbnQsIFNldDxGdW5jdGlvbj4+fVxuICAgICAqIEBuYW1lIF9saXN0ZW5lcnNcbiAgICAgKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3Mvc2VydmVyLlJhd1NvY2tldFxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5fdG9rZW5DbGllbnRNYXAgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fY2xpZW50U29ja2V0TWFwID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3NvY2tldENsaWVudE1hcCA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuX3Byb3RvY29sID0gYmFzZVByb3RvY29sO1xuXG4gICAgLy8gcmV0cmlldmUgc2VydmljZSBjb25maWcgKyB1c2VIdHRwc1xuICAgIHRoaXMuX3NoYXJlZENvbmZpZyA9IHRoaXMucmVxdWlyZSgnc2hhcmVkLWNvbmZpZycpO1xuXG4gICAgdGhpcy5fb25Db25uZWN0aW9uID0gdGhpcy5fb25Db25uZWN0aW9uLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb25maWd1cmUob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLnByb3RvY29sKVxuICAgICAgdGhpcy5fcHJvdG9jb2wgPSB0aGlzLl9wcm90b2NvbC5jb25jYXQob3B0aW9ucy5wcm90b2NvbCk7XG5cbiAgICBzdXBlci5jb25maWd1cmUob3B0aW9ucyk7XG4gIH1cblxuICBhZGRQcm90b2NvbERlZmluaXRpb24oZGVmKSB7XG4gICAgdGhpcy5fcHJvdG9jb2wucHVzaChkZWYpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHN0YXJ0KCkge1xuICAgIHN1cGVyLnN0YXJ0KCk7XG5cbiAgICBjb25zdCBjb25maWdJdGVtID0gdGhpcy5vcHRpb25zLmNvbmZpZ0l0ZW07XG4gICAgY29uc3QgY29uZmlnID0gdGhpcy5fc2hhcmVkQ29uZmlnLmdldChjb25maWdJdGVtKTtcblxuICAgIHRoaXMuX3BvcnQgPSBjb25maWcucG9ydDtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KGNvbmZpZy5wcm90b2NvbCkpXG4gICAgICB0aGlzLl9wcm90b2NvbCA9IHRoaXMucHJvdG9jb2wuY29uY2F0KGNvbmZpZy5wcm90b2NvbCk7XG5cbiAgICB0aGlzLl9jaGFubmVscyA9IHRoaXMuX3Byb3RvY29sLm1hcCgoZGVmKSA9PiBkZWYuY2hhbm5lbCk7XG5cbiAgICAvLyBjaGVjayBodHRwIC8gaHR0cHMgbW9kZVxuICAgIGxldCB1c2VIdHRwcyA9IHNlcnZlci5jb25maWcudXNlSHR0cHM7XG5cbiAgICAvLyBsYXVuY2ggaHR0cChzKSBzZXJ2ZXJcbiAgICBpZiAoIXVzZUh0dHBzKSB7XG4gICAgICBsZXQgaHR0cFNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKCk7XG4gICAgICB0aGlzLnJ1blNlcnZlcihodHRwU2VydmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaHR0cHNJbmZvcyA9IHNlcnZlci5jb25maWcuaHR0cHNJbmZvcztcblxuICAgICAgLy8gdXNlIGdpdmVuIGNlcnRpZmljYXRlXG4gICAgICBpZiAoaHR0cHNJbmZvcy5rZXkgJiYgaHR0cHNJbmZvcy5jZXJ0KSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGZzLnJlYWRGaWxlU3luYyhodHRwc0luZm9zLmtleSk7XG4gICAgICAgIGNvbnN0IGNlcnQgPSBmcy5yZWFkRmlsZVN5bmMoaHR0cHNJbmZvcy5jZXJ0KTtcblxuICAgICAgICBsZXQgaHR0cHNTZXJ2ZXIgPSBodHRwcy5jcmVhdGVTZXJ2ZXIoeyBrZXk6IGtleSwgY2VydDogY2VydCB9KTtcbiAgICAgICAgdGhpcy5ydW5TZXJ2ZXIoaHR0cHNTZXJ2ZXIpO1xuICAgICAgLy8gZ2VuZXJhdGUgY2VydGlmaWNhdGUgb24gdGhlIGZseSAoZm9yIGRldmVsb3BtZW50IHB1cnBvc2VzKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGVtLmNyZWF0ZUNlcnRpZmljYXRlKHsgZGF5czogMSwgc2VsZlNpZ25lZDogdHJ1ZSB9LCAoZXJyLCBrZXlzKSA9PiB7XG4gICAgICAgICAgbGV0IGh0dHBzU2VydmVyID0gaHR0cHMuY3JlYXRlU2VydmVyKHsga2V5OiBrZXlzLnNlcnZpY2VLZXksIGNlcnQ6IGtleXMuY2VydGlmaWNhdGUgfSk7XG4gICAgICAgICAgdGhpcy5ydW5TZXJ2ZXIoaHR0cHNTZXJ2ZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBydW5TZXJ2ZXIoc2VydmVyKXtcbiAgICBzZXJ2ZXIubGlzdGVuKHRoaXMuX3BvcnQsICgpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFNFUlZJQ0VfSUQsICc6IEh0dHBzIHNlcnZlciBsaXN0ZW5pbmcgb24gcG9ydDonLCB0aGlzLl9wb3J0KTtcbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLl93c3MgPSBuZXcgV2ViU29ja2V0U2VydmVyKHsgc2VydmVyOiBzZXJ2ZXIgfSk7XG4gICAgdGhpcy5fd3NzLm9uKCdjb25uZWN0aW9uJywgdGhpcy5fb25Db25uZWN0aW9uKTsgXG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgY29ubmVjdChjbGllbnQpIHtcbiAgICAvLyBzZW5kIGluZm9zIHRvIGNyZWF0ZSB0aGUgc29ja2V0IHRvIHRoZSBjbGllbnRcbiAgICBzdXBlci5yZWNlaXZlKGNsaWVudCwgJ3JlcXVlc3QnLCAoKSA9PiB7XG4gICAgICBjb25zdCB0b2tlbiA9IGNvdW50ZXIgKz0gMTtcbiAgICAgIHRoaXMuX3Rva2VuQ2xpZW50TWFwLnNldCh0b2tlbiwgY2xpZW50KTtcblxuICAgICAgc3VwZXIuc2VuZChjbGllbnQsICdpbmZvcycsIHRoaXMuX3BvcnQsIHRoaXMuX3Byb3RvY29sLCB0b2tlbik7XG4gICAgfSk7XG4gIH1cblxuICBkaXNjb25lY3QoY2xpZW50KSB7XG4gICAgY29uc3Qgc29ja2V0ID0gdGhpcy5fY2xpZW50U29ja2V0TWFwLmdldChjbGllbnQpO1xuXG4gICAgdGhpcy5fY2xpZW50U29ja2V0TWFwLmRlbGV0ZShjbGllbnQpO1xuICAgIHRoaXMuX3NvY2tldENsaWVudE1hcC5kZWxldGUoc29ja2V0KTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfb25Db25uZWN0aW9uKHNvY2tldCkge1xuICAgIHNvY2tldC5vbignbWVzc2FnZScsIChidWZmZXIpID0+IHtcbiAgICAgIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcikuYnVmZmVyO1xuICAgICAgY29uc3QgaW5kZXggPSBuZXcgVWludDhBcnJheShidWZmZXIpWzBdO1xuXG4gICAgICBpZiAoIXRoaXMuX3Byb3RvY29sW2luZGV4XSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHByb3RvY29sIGluZGV4OiAke2luZGV4fScpO1xuXG4gICAgICBjb25zdCB7IGNoYW5uZWwsIHR5cGUgfSA9IHRoaXMuX3Byb3RvY29sW2luZGV4XTtcbiAgICAgIGNvbnN0IHZpZXdDdG9yID0gZ2xvYmFsW2Ake3R5cGV9QXJyYXlgXTtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXcgdmlld0N0b3IoYnVmZmVyLCB2aWV3Q3Rvci5CWVRFU19QRVJfRUxFTUVOVCk7XG5cbiAgICAgIGlmIChjaGFubmVsID09PSAnc2VydmljZTpoYW5kc2hha2UnKVxuICAgICAgICB0aGlzLl9wYWlyQ2xpZW50U29ja2V0KHNvY2tldCwgZGF0YVswXSk7XG4gICAgICBlbHNlXG4gICAgICAgIHRoaXMuX3Byb3BhZ2F0ZUV2ZW50KHNvY2tldCwgY2hhbm5lbCwgZGF0YSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQXNzb2NpYXRlIHRoZSBzb2NrZXQgd2l0aCB0aGUgY29ycmVzcG9uZGluZyBjbGllbnQgYWNjb3JkaW5nIHRvIHRoZSBgdG9rZW5gXG4gICAqXG4gICAqIEBwYXJhbSB7U29ja2V0fSBzb2NrZXQgLSBTb2NrZXQgd2hpY2ggcmVjZWl2ZSB0aGUgbWVzc2FnZS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRva2VuIC0gVG9rZW4gdG8gbWF0Y2ggdGhlIGNsaWVudCBhc3NvY2lhdGVkIHRvIHRoZSBzb2NrZXQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcGFpckNsaWVudFNvY2tldChzb2NrZXQsIHRva2VuKSB7XG4gICAgY29uc3QgY2xpZW50ID0gdGhpcy5fdG9rZW5DbGllbnRNYXAuZ2V0KHRva2VuKTtcbiAgICB0aGlzLl9jbGllbnRTb2NrZXRNYXAuc2V0KGNsaWVudCwgc29ja2V0KTtcbiAgICB0aGlzLl9zb2NrZXRDbGllbnRNYXAuc2V0KHNvY2tldCwgY2xpZW50KTtcbiAgICB0aGlzLl90b2tlbkNsaWVudE1hcC5kZWxldGUodG9rZW4pO1xuXG4gICAgdGhpcy5zZW5kKGNsaWVudCwgJ3NlcnZpY2U6aGFuZHNoYWtlLWFjaycpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGwgYWxsIHRoZSByZWdpc3RlcmVkIGxpc3RlbmVyIGFzc29jaWF0ZWQgdG8gYSBjbGllbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7U29ja2V0fSBzb2NrZXQgLSBTb2NrZXQgd2hpY2ggcmVjZWl2ZWQgdGhlIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjaGFubmVsIC0gQ2hhbm5lbCBvZiB0aGUgbWVzc2FnZS5cbiAgICogQHBhcmFtIHtUeXBlZEFycmF5fSBkYXRhIC0gUmVjZWl2ZWQgZGF0YS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9wcm9wYWdhdGVFdmVudChzb2NrZXQsIGNoYW5uZWwsIGRhdGEpIHtcbiAgICBjb25zdCBjbGllbnQgPSB0aGlzLl9zb2NrZXRDbGllbnRNYXAuZ2V0KHNvY2tldCk7XG4gICAgY29uc3QgY2xpZW50TGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzLmdldChjbGllbnQpO1xuICAgIGNvbnN0IGNhbGxiYWNrcyA9IGNsaWVudExpc3RlbmVyc1tjaGFubmVsXTtcblxuICAgIGNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFjaykgPT4gY2FsbGJhY2soZGF0YSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgY2FsbGJhY2sgZnVuY3Rpb24gb24gYSBzcGVjaWZpYyBjaGFubmVsLlxuICAgKlxuICAgKiBAcGFyYW0ge2NsaWVudH0gY2xpZW50IC0gQ2xpZW50IHRvIGxpc3RlbiB0aGUgbWVzc2FnZSBmcm9tLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gY2hhbm5lbCAtIENoYW5uZWwgb2YgdGhlIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gICAqL1xuICByZWNlaXZlKGNsaWVudCwgY2hhbm5lbCwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cbiAgICBpZiAoIWxpc3RlbmVycy5oYXMoY2xpZW50KSlcbiAgICAgIGxpc3RlbmVycy5zZXQoY2xpZW50LCB7fSk7XG5cbiAgICBjb25zdCBjbGllbnRMaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuZ2V0KGNsaWVudCk7XG5cbiAgICBpZiAoIWNsaWVudExpc3RlbmVyc1tjaGFubmVsXSlcbiAgICAgIGNsaWVudExpc3RlbmVyc1tjaGFubmVsXSA9IG5ldyBTZXQoKTtcblxuICAgIGNsaWVudExpc3RlbmVyc1tjaGFubmVsXS5hZGQoY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgZGF0YSB0byBhIHNwZWNpZmljIGNsaWVudCwgb24gYSBnaXZlbiBjaGFubmVsLlxuICAgKlxuICAgKiBAcGFyYW0ge2NsaWVudH0gY2xpZW50IC0gQ2xpZW50IHRvIHNlbmQgdGhlIG1lc3NhZ2UgdG8uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjaGFubmVsIC0gQ2hhbm5lbCBvZiB0aGUgbWVzc2FnZS5cbiAgICogQHBhcmFtIHtUeXBlZEFycmF5fSBkYXRhIC0gRGF0YS5cbiAgICovXG4gIHNlbmQoY2xpZW50LCBjaGFubmVsLCBkYXRhKSB7XG4gICAgY29uc3Qgc29ja2V0ID0gdGhpcy5fY2xpZW50U29ja2V0TWFwLmdldChjbGllbnQpO1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5fY2hhbm5lbHMuaW5kZXhPZihjaGFubmVsKTtcblxuICAgIGlmIChpbmRleCA9PT0gLTEpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZGVmaW5lZCBjaGFubmVsIFwiJHtjaGFubmVsfVwiYCk7XG5cbiAgICBjb25zdCB7IHR5cGUgfSA9IHRoaXMuX3Byb3RvY29sW2luZGV4XTtcbiAgICBjb25zdCB2aWV3Q3RvciA9IGdsb2JhbFtgJHt0eXBlfUFycmF5YF07XG4gICAgY29uc3Qgc2l6ZSA9IGRhdGEgPyAxICsgZGF0YS5sZW5ndGggOiAxO1xuICAgIGNvbnN0IHZpZXcgPSBuZXcgdmlld0N0b3Ioc2l6ZSk7XG5cbiAgICBjb25zdCBjaGFubmVsVmlldyA9IG5ldyBVaW50OEFycmF5KHZpZXdDdG9yLkJZVEVTX1BFUl9FTEVNRU5UKTtcbiAgICBjaGFubmVsVmlld1swXSA9IGluZGV4O1xuICAgIC8vIHBvcHVsYXRlIGZpbmFsIGJ1ZmZlclxuICAgIHZpZXcuc2V0KG5ldyB2aWV3Q3RvcihjaGFubmVsVmlldy5idWZmZXIpLCAwKTtcblxuICAgIGlmIChkYXRhKVxuICAgICAgdmlldy5zZXQoZGF0YSwgMSk7XG5cbiAgICBzb2NrZXQuc2VuZCh2aWV3LmJ1ZmZlcik7XG4gIH1cblxuICAvKipcbiAgICogQnJvYWRjYXN0IGRhdGEgdG8gc2V2ZXJhbCBjbGllbnQgYXQgb25jZS5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IGNsaWVudFR5cGUgLSBUeXBlIG9yIHR5cGVzIG9mIGNsaWVudCB0byBzZW5kIHRoZVxuICAgKiAgbWVzc2FnZSB0by5cbiAgICogQHBhcmFtIHtjbGllbnR9IGV4Y2x1ZGVDbGllbnQgLSBDbGllbnQgdG8gZXhjbHVkZSBmcm9tIHRoZSBicm9hZGNhc3QuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjaGFubmVsIC0gQ2hhbm5lbCBvZiB0aGUgbWVzc2FnZS5cbiAgICogQHBhcmFtIHtUeXBlZEFycmF5fSBkYXRhIC0gRGF0YS5cbiAgICovXG4gIGJyb2FkY2FzdChjbGllbnRUeXBlLCBleGNsdWRlQ2xpZW50LCBjaGFubmVsLCBkYXRhKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGNsaWVudFR5cGUpKVxuICAgICAgY2xpZW50VHlwZSA9IFtjbGllbnRUeXBlXTtcblxuICAgIGZvciAobGV0IGNsaWVudCBvZiB0aGlzLl9jbGllbnRTb2NrZXRNYXAua2V5cygpKSB7XG4gICAgICBpZiAoY2xpZW50VHlwZS5pbmRleE9mKGNsaWVudC50eXBlKSAhPT0gLTEgJiYgY2xpZW50ICE9PSBleGNsdWRlQ2xpZW50KVxuICAgICAgICB0aGlzLnNlbmQoY2xpZW50LCBjaGFubmVsLCBkYXRhKTtcbiAgICB9XG4gIH1cbn1cblxuc2VydmljZU1hbmFnZXIucmVnaXN0ZXIoU0VSVklDRV9JRCwgUmF3U29ja2V0KTtcblxuZXhwb3J0IGRlZmF1bHQgUmF3U29ja2V0O1xuIl19