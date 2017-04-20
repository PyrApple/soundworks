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

var _ws = require('ws');

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

      this._wss = new _ws.Server({ server: server });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJhd1NvY2tldC5qcyJdLCJuYW1lcyI6WyJTRVJWSUNFX0lEIiwiYmFzZVByb3RvY29sIiwiY2hhbm5lbCIsInR5cGUiLCJjb3VudGVyIiwiUmF3U29ja2V0IiwiZGVmYXVsdHMiLCJjb25maWdJdGVtIiwiY29uZmlndXJlIiwiX3BvcnQiLCJfcHJvdG9jb2wiLCJfY2hhbm5lbHMiLCJfbGlzdGVuZXJzIiwiX3Rva2VuQ2xpZW50TWFwIiwiX2NsaWVudFNvY2tldE1hcCIsIl9zb2NrZXRDbGllbnRNYXAiLCJfc2hhcmVkQ29uZmlnIiwicmVxdWlyZSIsIl9vbkNvbm5lY3Rpb24iLCJiaW5kIiwib3B0aW9ucyIsInByb3RvY29sIiwiY29uY2F0IiwiZGVmIiwicHVzaCIsImNvbmZpZyIsImdldCIsInBvcnQiLCJBcnJheSIsImlzQXJyYXkiLCJtYXAiLCJ1c2VIdHRwcyIsImh0dHBTZXJ2ZXIiLCJjcmVhdGVTZXJ2ZXIiLCJydW5TZXJ2ZXIiLCJodHRwc0luZm9zIiwia2V5IiwiY2VydCIsInJlYWRGaWxlU3luYyIsImh0dHBzU2VydmVyIiwiY3JlYXRlQ2VydGlmaWNhdGUiLCJkYXlzIiwic2VsZlNpZ25lZCIsImVyciIsImtleXMiLCJzZXJ2aWNlS2V5IiwiY2VydGlmaWNhdGUiLCJzZXJ2ZXIiLCJsaXN0ZW4iLCJfd3NzIiwib24iLCJjbGllbnQiLCJ0b2tlbiIsInNldCIsInNvY2tldCIsImRlbGV0ZSIsImJ1ZmZlciIsIlVpbnQ4QXJyYXkiLCJpbmRleCIsIkVycm9yIiwidmlld0N0b3IiLCJnbG9iYWwiLCJkYXRhIiwiQllURVNfUEVSX0VMRU1FTlQiLCJfcGFpckNsaWVudFNvY2tldCIsIl9wcm9wYWdhdGVFdmVudCIsInNlbmQiLCJjbGllbnRMaXN0ZW5lcnMiLCJjYWxsYmFja3MiLCJmb3JFYWNoIiwiY2FsbGJhY2siLCJsaXN0ZW5lcnMiLCJoYXMiLCJhZGQiLCJpbmRleE9mIiwic2l6ZSIsImxlbmd0aCIsInZpZXciLCJjaGFubmVsVmlldyIs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SUFBM0I7QUFDSDtBQVBpRDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBUW5EOzs7OztBQUdILHlCQUFlbUIsUUFBZixDQUF3QmpGLFVBQXhCLEVBQW9DSyxTQUFwQzs7a0JBRWVBLFMiLCJmaWxlIjoiUmF3U29ja2V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHNlcnZlciBmcm9tICcuLi9jb3JlL3NlcnZlcic7XG5pbXBvcnQgU2VydmljZSBmcm9tICcuLi9jb3JlL1NlcnZpY2UnO1xuaW1wb3J0IHNlcnZpY2VNYW5hZ2VyIGZyb20gJy4uL2NvcmUvc2VydmljZU1hbmFnZXInO1xuaW1wb3J0IHsgU2VydmVyIGFzIFdlYlNvY2tldFNlcnZlciB9IGZyb20gJ3dzJztcbmltcG9ydCBodHRwIGZyb20gJ2h0dHAnO1xuaW1wb3J0IGh0dHBzIGZyb20gJ2h0dHBzJztcbmltcG9ydCBwZW0gZnJvbSAncGVtJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5cbmNvbnN0IFNFUlZJQ0VfSUQgPSAnc2VydmljZTpyYXctc29ja2V0JztcblxuXG4vKipcbiAqIFByb3RvY29sIGRlZmluZWQgaW4gY29uZmlndXJhdGlvbiBpcyBhZGRlZCB0byB0aGVzZSB0d28gZW50cnkgdGhhdCBtYW5hZ2VcbiAqIHRoZSBoYW5kc2hha2UgYXQgdGhlIGNyZWF0aW9uIG9mIHRoZSBzb2NrZXQuXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCBiYXNlUHJvdG9jb2wgPSBbXG4gIHsgY2hhbm5lbDogJ3NlcnZpY2U6aGFuZHNoYWtlJywgdHlwZTogJ1VpbnQzMicgfSxcbiAgeyBjaGFubmVsOiAnc2VydmljZTpoYW5kc2hha2UtYWNrJywgdHlwZTogJ1VpbnQ4JyB9LFxuXTtcblxuLyoqXG4gKiBDb3VudGVyIHRoYXQgY3JlYXRlIHRva2VucyBpbiBvcmRlciB0byBtYXRjaCBzb2NrZXRzIGFuZCBjbGllbnRzLlxuICogQHByaXZhdGVcbiAqL1xubGV0IGNvdW50ZXIgPSAwO1xuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIGByYXctc29ja2V0YCBzZXJ2aWNlLlxuICpcbiAqIFRoaXMgc2VydmljZSBjcmVhdGVzIGFuIGFkZGl0aW9ubmFsIG5hdGl2ZSBzb2NrZXQgd2l0aCBpdHMgYmluYXJ5IHR5cGUgc2V0XG4gKiB0byBgYXJyYXlidWZmZXJgIGFuZCBmb2N1c2VkIG9uIHBlcmZvcm1hbmNlcy5cbiAqIEl0IGFsbG93cyB0aGUgdHJhbnNmZXJ0IG9mIGBUeXBlZEFycmF5YCBkYXRhIHdyYXBwZWQgd2l0aCBhIG1pbmltYWwgY2hhbm5lbFxuICogbWVjaGFuaXNtICh1cCB0byAyNTYgY2hhbm5lbHMpLlxuICpcbiAqIFRoZSB1c2VyLWRlZmluZWQgcHJvdG9jb2wgbXVzdCBmb2xsb3cgdGhlIGNvbnZlbnRpb246XG4gKiBAZXhhbXBsZVxuICogY29uc3QgcHJvdG9jb2wgPSBbXG4gKiAgIHsgY2hhbm5lbDogJ215LWNoYW5uZWwnLCB0eXBlOiAnRmxvYXQzMicgfVxuICogICAvLyAuLi5cbiAqIF1cbiAqXG4gKiBXaGVyZSB0aGUgYGNoYW5uZWxgIGNhbiBiZSBhbnkgc3RyaW5nIGFuZCB0aGUgYHR5cGVgIGNhbiBiZSBpbnRlcnBvbGF0ZWRcbiAqIHRvIGFueSBgVHlwZWRBcnJheWAgYnkgY29uY2F0ZW5hdGluZyBgJ0FycmF5J2AgYXQgaXRzIGVuZC5cbiAqXG4gKiBfXypUaGUgc2VydmljZSBtdXN0IGJlIHVzZWQgd2l0aCBpdHMgW2NsaWVudC1zaWRlIGNvdW50ZXJwYXJ0XXtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuUmF3U29ja2V0fSpfX1xuICpcbiAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9zZXJ2ZXJcbiAqL1xuY2xhc3MgUmF3U29ja2V0IGV4dGVuZHMgU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKFNFUlZJQ0VfSUQpO1xuXG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgICBjb25maWdJdGVtOiAncmF3U29ja2V0JyxcbiAgICB9O1xuXG4gICAgdGhpcy5jb25maWd1cmUoZGVmYXVsdHMpO1xuXG4gICAgdGhpcy5fcG9ydCA9IG51bGw7XG4gICAgdGhpcy5fcHJvdG9jb2wgPSBudWxsO1xuICAgIHRoaXMuX2NoYW5uZWxzID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIExpc3RlbmVycyBmb3IgdGhlIGluY29tbWluZyBtZXNzYWdlcy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtNYXA8Y2xpZW50LCBTZXQ8RnVuY3Rpb24+Pn1cbiAgICAgKiBAbmFtZSBfbGlzdGVuZXJzXG4gICAgICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL3NlcnZlci5SYXdTb2NrZXRcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX2xpc3RlbmVycyA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuX3Rva2VuQ2xpZW50TWFwID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2NsaWVudFNvY2tldE1hcCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9zb2NrZXRDbGllbnRNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLl9wcm90b2NvbCA9IGJhc2VQcm90b2NvbDtcblxuICAgIC8vIHJldHJpZXZlIHNlcnZpY2UgY29uZmlnICsgdXNlSHR0cHNcbiAgICB0aGlzLl9zaGFyZWRDb25maWcgPSB0aGlzLnJlcXVpcmUoJ3NoYXJlZC1jb25maWcnKTtcblxuICAgIHRoaXMuX29uQ29ubmVjdGlvbiA9IHRoaXMuX29uQ29ubmVjdGlvbi5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29uZmlndXJlKG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5wcm90b2NvbClcbiAgICAgIHRoaXMuX3Byb3RvY29sID0gdGhpcy5fcHJvdG9jb2wuY29uY2F0KG9wdGlvbnMucHJvdG9jb2wpO1xuXG4gICAgc3VwZXIuY29uZmlndXJlKG9wdGlvbnMpO1xuICB9XG5cbiAgYWRkUHJvdG9jb2xEZWZpbml0aW9uKGRlZikge1xuICAgIHRoaXMuX3Byb3RvY29sLnB1c2goZGVmKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuXG4gICAgY29uc3QgY29uZmlnSXRlbSA9IHRoaXMub3B0aW9ucy5jb25maWdJdGVtO1xuICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuX3NoYXJlZENvbmZpZy5nZXQoY29uZmlnSXRlbSk7XG5cbiAgICB0aGlzLl9wb3J0ID0gY29uZmlnLnBvcnQ7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShjb25maWcucHJvdG9jb2wpKVxuICAgICAgdGhpcy5fcHJvdG9jb2wgPSB0aGlzLnByb3RvY29sLmNvbmNhdChjb25maWcucHJvdG9jb2wpO1xuXG4gICAgdGhpcy5fY2hhbm5lbHMgPSB0aGlzLl9wcm90b2NvbC5tYXAoKGRlZikgPT4gZGVmLmNoYW5uZWwpO1xuXG4gICAgLy8gY2hlY2sgaHR0cCAvIGh0dHBzIG1vZGVcbiAgICBsZXQgdXNlSHR0cHMgPSBzZXJ2ZXIuY29uZmlnLnVzZUh0dHBzO1xuXG4gICAgLy8gbGF1bmNoIGh0dHAocykgc2VydmVyXG4gICAgaWYgKCF1c2VIdHRwcykge1xuICAgICAgbGV0IGh0dHBTZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlcigpO1xuICAgICAgdGhpcy5ydW5TZXJ2ZXIoaHR0cFNlcnZlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGh0dHBzSW5mb3MgPSBzZXJ2ZXIuY29uZmlnLmh0dHBzSW5mb3M7XG5cbiAgICAgIC8vIHVzZSBnaXZlbiBjZXJ0aWZpY2F0ZVxuICAgICAgaWYgKGh0dHBzSW5mb3Mua2V5ICYmIGh0dHBzSW5mb3MuY2VydCkge1xuICAgICAgICBjb25zdCBrZXkgPSBmcy5yZWFkRmlsZVN5bmMoaHR0cHNJbmZvcy5rZXkpO1xuICAgICAgICBjb25zdCBjZXJ0ID0gZnMucmVhZEZpbGVTeW5jKGh0dHBzSW5mb3MuY2VydCk7XG5cbiAgICAgICAgbGV0IGh0dHBzU2VydmVyID0gaHR0cHMuY3JlYXRlU2VydmVyKHsga2V5OiBrZXksIGNlcnQ6IGNlcnQgfSk7XG4gICAgICAgIHRoaXMucnVuU2VydmVyKGh0dHBzU2VydmVyKTtcbiAgICAgIC8vIGdlbmVyYXRlIGNlcnRpZmljYXRlIG9uIHRoZSBmbHkgKGZvciBkZXZlbG9wbWVudCBwdXJwb3NlcylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBlbS5jcmVhdGVDZXJ0aWZpY2F0ZSh7IGRheXM6IDEsIHNlbGZTaWduZWQ6IHRydWUgfSwgKGVyciwga2V5cykgPT4ge1xuICAgICAgICAgIGxldCBodHRwc1NlcnZlciA9IGh0dHBzLmNyZWF0ZVNlcnZlcih7IGtleToga2V5cy5zZXJ2aWNlS2V5LCBjZXJ0OiBrZXlzLmNlcnRpZmljYXRlIH0pO1xuICAgICAgICAgIHRoaXMucnVuU2VydmVyKGh0dHBzU2VydmVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcnVuU2VydmVyKHNlcnZlcil7XG4gICAgc2VydmVyLmxpc3Rlbih0aGlzLl9wb3J0LCAoKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhTRVJWSUNFX0lELCAnOiBIdHRwcyBzZXJ2ZXIgbGlzdGVuaW5nIG9uIHBvcnQ6JywgdGhpcy5fcG9ydCk7XG4gICAgfSk7XG4gICAgXG4gICAgdGhpcy5fd3NzID0gbmV3IFdlYlNvY2tldFNlcnZlcih7IHNlcnZlcjogc2VydmVyIH0pO1xuICAgIHRoaXMuX3dzcy5vbignY29ubmVjdGlvbicsIHRoaXMuX29uQ29ubmVjdGlvbik7IFxuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGNvbm5lY3QoY2xpZW50KSB7XG4gICAgLy8gc2VuZCBpbmZvcyB0byBjcmVhdGUgdGhlIHNvY2tldCB0byB0aGUgY2xpZW50XG4gICAgc3VwZXIucmVjZWl2ZShjbGllbnQsICdyZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgY29uc3QgdG9rZW4gPSBjb3VudGVyICs9IDE7XG4gICAgICB0aGlzLl90b2tlbkNsaWVudE1hcC5zZXQodG9rZW4sIGNsaWVudCk7XG5cbiAgICAgIHN1cGVyLnNlbmQoY2xpZW50LCAnaW5mb3MnLCB0aGlzLl9wb3J0LCB0aGlzLl9wcm90b2NvbCwgdG9rZW4pO1xuICAgIH0pO1xuICB9XG5cbiAgZGlzY29uZWN0KGNsaWVudCkge1xuICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuX2NsaWVudFNvY2tldE1hcC5nZXQoY2xpZW50KTtcblxuICAgIHRoaXMuX2NsaWVudFNvY2tldE1hcC5kZWxldGUoY2xpZW50KTtcbiAgICB0aGlzLl9zb2NrZXRDbGllbnRNYXAuZGVsZXRlKHNvY2tldCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX29uQ29ubmVjdGlvbihzb2NrZXQpIHtcbiAgICBzb2NrZXQub24oJ21lc3NhZ2UnLCAoYnVmZmVyKSA9PiB7XG4gICAgICBidWZmZXIgPSBuZXcgVWludDhBcnJheShidWZmZXIpLmJ1ZmZlcjtcbiAgICAgIGNvbnN0IGluZGV4ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVswXTtcblxuICAgICAgaWYgKCF0aGlzLl9wcm90b2NvbFtpbmRleF0pXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBwcm90b2NvbCBpbmRleDogJHtpbmRleH0nKTtcblxuICAgICAgY29uc3QgeyBjaGFubmVsLCB0eXBlIH0gPSB0aGlzLl9wcm90b2NvbFtpbmRleF07XG4gICAgICBjb25zdCB2aWV3Q3RvciA9IGdsb2JhbFtgJHt0eXBlfUFycmF5YF07XG4gICAgICBjb25zdCBkYXRhID0gbmV3IHZpZXdDdG9yKGJ1ZmZlciwgdmlld0N0b3IuQllURVNfUEVSX0VMRU1FTlQpO1xuXG4gICAgICBpZiAoY2hhbm5lbCA9PT0gJ3NlcnZpY2U6aGFuZHNoYWtlJylcbiAgICAgICAgdGhpcy5fcGFpckNsaWVudFNvY2tldChzb2NrZXQsIGRhdGFbMF0pO1xuICAgICAgZWxzZVxuICAgICAgICB0aGlzLl9wcm9wYWdhdGVFdmVudChzb2NrZXQsIGNoYW5uZWwsIGRhdGEpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzc29jaWF0ZSB0aGUgc29ja2V0IHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgY2xpZW50IGFjY29yZGluZyB0byB0aGUgYHRva2VuYFxuICAgKlxuICAgKiBAcGFyYW0ge1NvY2tldH0gc29ja2V0IC0gU29ja2V0IHdoaWNoIHJlY2VpdmUgdGhlIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0b2tlbiAtIFRva2VuIHRvIG1hdGNoIHRoZSBjbGllbnQgYXNzb2NpYXRlZCB0byB0aGUgc29ja2V0LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3BhaXJDbGllbnRTb2NrZXQoc29ja2V0LCB0b2tlbikge1xuICAgIGNvbnN0IGNsaWVudCA9IHRoaXMuX3Rva2VuQ2xpZW50TWFwLmdldCh0b2tlbik7XG4gICAgdGhpcy5fY2xpZW50U29ja2V0TWFwLnNldChjbGllbnQsIHNvY2tldCk7XG4gICAgdGhpcy5fc29ja2V0Q2xpZW50TWFwLnNldChzb2NrZXQsIGNsaWVudCk7XG4gICAgdGhpcy5fdG9rZW5DbGllbnRNYXAuZGVsZXRlKHRva2VuKTtcblxuICAgIHRoaXMuc2VuZChjbGllbnQsICdzZXJ2aWNlOmhhbmRzaGFrZS1hY2snKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIGFsbCB0aGUgcmVnaXN0ZXJlZCBsaXN0ZW5lciBhc3NvY2lhdGVkIHRvIGEgY2xpZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge1NvY2tldH0gc29ja2V0IC0gU29ja2V0IHdoaWNoIHJlY2VpdmVkIHRoZSBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gY2hhbm5lbCAtIENoYW5uZWwgb2YgdGhlIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7VHlwZWRBcnJheX0gZGF0YSAtIFJlY2VpdmVkIGRhdGEuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcHJvcGFnYXRlRXZlbnQoc29ja2V0LCBjaGFubmVsLCBkYXRhKSB7XG4gICAgY29uc3QgY2xpZW50ID0gdGhpcy5fc29ja2V0Q2xpZW50TWFwLmdldChzb2NrZXQpO1xuICAgIGNvbnN0IGNsaWVudExpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycy5nZXQoY2xpZW50KTtcbiAgICBjb25zdCBjYWxsYmFja3MgPSBjbGllbnRMaXN0ZW5lcnNbY2hhbm5lbF07XG5cbiAgICBjYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2spID0+IGNhbGxiYWNrKGRhdGEpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGNhbGxiYWNrIGZ1bmN0aW9uIG9uIGEgc3BlY2lmaWMgY2hhbm5lbC5cbiAgICpcbiAgICogQHBhcmFtIHtjbGllbnR9IGNsaWVudCAtIENsaWVudCB0byBsaXN0ZW4gdGhlIG1lc3NhZ2UgZnJvbS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGNoYW5uZWwgLSBDaGFubmVsIG9mIHRoZSBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIENhbGxiYWNrIGZ1bmN0aW9uLlxuICAgKi9cbiAgcmVjZWl2ZShjbGllbnQsIGNoYW5uZWwsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuXG4gICAgaWYgKCFsaXN0ZW5lcnMuaGFzKGNsaWVudCkpXG4gICAgICBsaXN0ZW5lcnMuc2V0KGNsaWVudCwge30pO1xuXG4gICAgY29uc3QgY2xpZW50TGlzdGVuZXJzID0gbGlzdGVuZXJzLmdldChjbGllbnQpO1xuXG4gICAgaWYgKCFjbGllbnRMaXN0ZW5lcnNbY2hhbm5lbF0pXG4gICAgICBjbGllbnRMaXN0ZW5lcnNbY2hhbm5lbF0gPSBuZXcgU2V0KCk7XG5cbiAgICBjbGllbnRMaXN0ZW5lcnNbY2hhbm5lbF0uYWRkKGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIGRhdGEgdG8gYSBzcGVjaWZpYyBjbGllbnQsIG9uIGEgZ2l2ZW4gY2hhbm5lbC5cbiAgICpcbiAgICogQHBhcmFtIHtjbGllbnR9IGNsaWVudCAtIENsaWVudCB0byBzZW5kIHRoZSBtZXNzYWdlIHRvLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gY2hhbm5lbCAtIENoYW5uZWwgb2YgdGhlIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7VHlwZWRBcnJheX0gZGF0YSAtIERhdGEuXG4gICAqL1xuICBzZW5kKGNsaWVudCwgY2hhbm5lbCwgZGF0YSkge1xuICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuX2NsaWVudFNvY2tldE1hcC5nZXQoY2xpZW50KTtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuX2NoYW5uZWxzLmluZGV4T2YoY2hhbm5lbCk7XG5cbiAgICBpZiAoaW5kZXggPT09IC0xKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmRlZmluZWQgY2hhbm5lbCBcIiR7Y2hhbm5lbH1cImApO1xuXG4gICAgY29uc3QgeyB0eXBlIH0gPSB0aGlzLl9wcm90b2NvbFtpbmRleF07XG4gICAgY29uc3Qgdmlld0N0b3IgPSBnbG9iYWxbYCR7dHlwZX1BcnJheWBdO1xuICAgIGNvbnN0IHNpemUgPSBkYXRhID8gMSArIGRhdGEubGVuZ3RoIDogMTtcbiAgICBjb25zdCB2aWV3ID0gbmV3IHZpZXdDdG9yKHNpemUpO1xuXG4gICAgY29uc3QgY2hhbm5lbFZpZXcgPSBuZXcgVWludDhBcnJheSh2aWV3Q3Rvci5CWVRFU19QRVJfRUxFTUVOVCk7XG4gICAgY2hhbm5lbFZpZXdbMF0gPSBpbmRleDtcbiAgICAvLyBwb3B1bGF0ZSBmaW5hbCBidWZmZXJcbiAgICB2aWV3LnNldChuZXcgdmlld0N0b3IoY2hhbm5lbFZpZXcuYnVmZmVyKSwgMCk7XG5cbiAgICBpZiAoZGF0YSlcbiAgICAgIHZpZXcuc2V0KGRhdGEsIDEpO1xuXG4gICAgc29ja2V0LnNlbmQodmlldy5idWZmZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJyb2FkY2FzdCBkYXRhIHRvIHNldmVyYWwgY2xpZW50IGF0IG9uY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBjbGllbnRUeXBlIC0gVHlwZSBvciB0eXBlcyBvZiBjbGllbnQgdG8gc2VuZCB0aGVcbiAgICogIG1lc3NhZ2UgdG8uXG4gICAqIEBwYXJhbSB7Y2xpZW50fSBleGNsdWRlQ2xpZW50IC0gQ2xpZW50IHRvIGV4Y2x1ZGUgZnJvbSB0aGUgYnJvYWRjYXN0LlxuICAgKiBAcGFyYW0ge1N0cmluZ30gY2hhbm5lbCAtIENoYW5uZWwgb2YgdGhlIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7VHlwZWRBcnJheX0gZGF0YSAtIERhdGEuXG4gICAqL1xuICBicm9hZGNhc3QoY2xpZW50VHlwZSwgZXhjbHVkZUNsaWVudCwgY2hhbm5lbCwgZGF0YSkge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShjbGllbnRUeXBlKSlcbiAgICAgIGNsaWVudFR5cGUgPSBbY2xpZW50VHlwZV07XG5cbiAgICBmb3IgKGxldCBjbGllbnQgb2YgdGhpcy5fY2xpZW50U29ja2V0TWFwLmtleXMoKSkge1xuICAgICAgaWYgKGNsaWVudFR5cGUuaW5kZXhPZihjbGllbnQudHlwZSkgIT09IC0xICYmIGNsaWVudCAhPT0gZXhjbHVkZUNsaWVudClcbiAgICAgICAgdGhpcy5zZW5kKGNsaWVudCwgY2hhbm5lbCwgZGF0YSk7XG4gICAgfVxuICB9XG59XG5cbnNlcnZpY2VNYW5hZ2VyLnJlZ2lzdGVyKFNFUlZJQ0VfSUQsIFJhd1NvY2tldCk7XG5cbmV4cG9ydCBkZWZhdWx0IFJhd1NvY2tldDtcbiJdfQ==