'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

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

var _SegmentedView = require('../views/SegmentedView');

var _SegmentedView2 = _interopRequireDefault(_SegmentedView);

var _Service2 = require('../core/Service');

var _Service3 = _interopRequireDefault(_Service2);

var _serviceManager = require('../core/serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SERVICE_ID = 'service:raw-socket';

var defaultViewTemplate = '\n<div class="section-top"></div>\n<div class="section-center flex-center">\n  <p class="soft-blink"><%= wait %></p>\n</div>\n<div class="section-bottom"></div>\n';

var defaultViewContent = {
  wait: 'Opening socket,<br />stand by&hellip;'
};

/**
 * Interface for the `raw-socket` service.
 *
 * This service creates an additionnal native socket with its binary type set
 * to `arraybuffer` and focused on performances.
 * It allows the transfert of `TypedArray` data wrapped with a minimal channel
 * mechanism (up to 256 channels).
 *
 * __*The service must be used with its [server-side counterpart]{@link module:soundworks/server.RawSocket}*__
 *
 * @memberof module:soundworks/client
 */

var RawSocket = function (_Service) {
  (0, _inherits3.default)(RawSocket, _Service);

  function RawSocket() {
    (0, _classCallCheck3.default)(this, RawSocket);

    var _this = (0, _possibleConstructorReturn3.default)(this, (RawSocket.__proto__ || (0, _getPrototypeOf2.default)(RawSocket)).call(this, SERVICE_ID, true));

    var defaults = {
      viewCtor: _SegmentedView2.default,
      viewPriority: 5
    };

    _this.configure(defaults);

    _this._defaultViewTemplate = defaultViewTemplate;
    _this._defaultViewContent = defaultViewContent;

    /**
     * Listeners for the incomming messages.
     *
     * @type {Object<String, Set<Function>>}
     * @name _listeners
     * @memberof module:soundworks/server.RawSocket
     * @instance
     * @private
     */
    _this._listeners = {};

    _this._protocol = null;
    _this._onReceiveConnectionInfos = _this._onReceiveConnectionInfos.bind(_this);
    _this._onReceiveAcknoledgement = _this._onReceiveAcknoledgement.bind(_this);
    _this._onMessage = _this._onMessage.bind(_this);
    return _this;
  }

  /** @private */


  (0, _createClass3.default)(RawSocket, [{
    key: 'init',
    value: function init() {
      this.viewCtor = this.options.viewCtor;
      this.view = this.createView();
    }

    /** @private */

  }, {
    key: 'start',
    value: function start() {
      (0, _get3.default)(RawSocket.prototype.__proto__ || (0, _getPrototypeOf2.default)(RawSocket.prototype), 'start', this).call(this);

      if (!this.hasStarted) this.init();

      this.show();

      (0, _get3.default)(RawSocket.prototype.__proto__ || (0, _getPrototypeOf2.default)(RawSocket.prototype), 'send', this).call(this, 'request');
      (0, _get3.default)(RawSocket.prototype.__proto__ || (0, _getPrototypeOf2.default)(RawSocket.prototype), 'receive', this).call(this, 'infos', this._onReceiveConnectionInfos);
    }

    /** @private */

  }, {
    key: 'stop',
    value: function stop() {
      this.hide();
      (0, _get3.default)(RawSocket.prototype.__proto__ || (0, _getPrototypeOf2.default)(RawSocket.prototype), 'stop', this).call(this);
    }

    /**
     * Method executed when the service receive connection informations from the
     * server.
     *
     * @param {Number} port - Port on which open the new socket.
     * @param {Object} protocol - User-defined protocol to be used in raw socket
     *  exchanges.
     * @param {Number} token - Unique token to retrieve in the first message to
     *  identy the client server-side, allow to match the socket with its
     *  corresponding client.
     *
     * @private
     */

  }, {
    key: '_onReceiveConnectionInfos',
    value: function _onReceiveConnectionInfos(port, protocol, token) {
      var _this2 = this;

      this._protocol = protocol;
      this._channels = protocol.map(function (entry) {
        return entry.channel;
      });

      this.removeListener('connection-infos', this._onReceiveConnectionInfos);

      var socketProtocol = window.location.protocol.replace(/^http?/, 'ws');
      var socketHostname = window.location.hostname;
      var url = socketProtocol + '//' + socketHostname + ':' + port;

      this.socket = new WebSocket(url);
      this.socket.binaryType = 'arraybuffer';
      // send token back to the server and wait for acknoledgement
      var data = new Uint32Array(1);
      data[0] = token;

      this.socket.addEventListener('open', function () {
        _this2.send('service:handshake', data);
      });

      this.socket.addEventListener('message', this._onReceiveAcknoledgement);
    }

    /**
     * Callback executed when the server acknoledges the matching between a
     * client and a socket.
     *
     * @private
     */

  }, {
    key: '_onReceiveAcknoledgement',
    value: function _onReceiveAcknoledgement(e) {
      var index = new Uint8Array(e.data)[0];
      var _protocol$index = this._protocol[index],
          channel = _protocol$index.channel,
          type = _protocol$index.type;

      // ignore incomming messages that could occur if
      // acknoledgement was not yet received

      if (channel === 'service:handshake-ack') {
        this.socket.removeEventListener('message', this._onReceiveAcknoledgement);
        this.socket.addEventListener('message', this._onMessage);
        this.ready();
      }
    }

    /**
     * Callback function of the socket `message` event. Unwrap the channel and
     * the data contained in the payload and execute the registered callback.
     *
     * @private
     */

  }, {
    key: '_onMessage',
    value: function _onMessage(e) {
      var index = new Uint8Array(e.data)[0];

      if (!this._protocol[index]) throw new Error('Invalid protocol index: ' + index);

      var _protocol$index2 = this._protocol[index],
          channel = _protocol$index2.channel,
          type = _protocol$index2.type;

      var viewCtor = window[type + 'Array'];
      var data = new viewCtor(e.data, viewCtor.BYTES_PER_ELEMENT);
      var callbacks = this._listeners[channel];

      if (callbacks) callbacks.forEach(function (callback) {
        return callback(data);
      });
    }

    /**
     * Register a callback to be executed when receiving a message on a specific
     * channel.
     *
     * @param {String} channel - Channel of the message.
     * @param {Function} callback - Callback function.
     */

  }, {
    key: 'receive',
    value: function receive(channel, callback) {
      var listeners = this._listeners;

      if (!listeners[channel]) listeners[channel] = new _set2.default();

      listeners[channel].add(callback);
    }

    /**
     * Send data on a specific channel.
     *
     * @param {String} channel - Channel of the message.
     * @param {TypedArray} data - Data.
     */

  }, {
    key: 'send',
    value: function send(channel, data) {
      var index = this._channels.indexOf(channel);

      if (index === -1) throw new Error('Undefined channel "' + channel + '"');

      var type = this._protocol[index].type;

      var viewCtor = window[type + 'Array'];
      var size = data ? 1 + data.length : 1;
      var view = new viewCtor(size);

      var channelView = new Uint8Array(viewCtor.BYTES_PER_ELEMENT);
      channelView[0] = index;
      // populate buffer
      view.set(new viewCtor(channelView.buffer), 0);

      if (data) view.set(data, 1);

      this.socket.send(view.buffer);
    }
  }]);
  return RawSocket;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, RawSocket);

exports.default = RawSocket;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJhd1NvY2tldC5qcyJdLCJuYW1lcyI6WyJTRVJWSUNFX0lEIiwiZGVmYXVsdFZpZXdUZW1wbGF0ZSIsImRlZmF1bHRWaWV3Q29udGVudCIsIndhaXQiLCJSYXdTb2NrZXQiLCJkZWZhdWx0cyIsInZpZXdDdG9yIiwidmlld1ByaW9yaXR5IiwiY29uZmlndXJlIiwiX2RlZmF1bHRWaWV3VGVtcGxhdGUiLCJfZGVmYXVsdFZpZXdDb250ZW50IiwiX2xpc3RlbmVycyIsIl9wcm90b2NvbCIsIl9vblJlY2VpdmVDb25uZWN0aW9uSW5mb3MiLCJiaW5kIiwiX29uUmVjZWl2ZUFja25vbGVkZ2VtZW50IiwiX29uTWVzc2FnZSIsIm9wdGlvbnMiLCJ2aWV3IiwiY3JlYXRlVmlldyIsImhhc1N0YXJ0ZWQiLCJpbml0Iiwic2hvdyIsImhpZGUiLCJwb3J0IiwicHJvdG9jb2wiLCJ0b2tlbiIsIl9jaGFubmVscyIsIm1hcCIsImVudHJ5IiwiY2hhbm5lbCIsInJlbW92ZUxpc3RlbmVyIiwic29ja2V0UHJvdG9jb2wiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInJlcGxhY2UiLCJzb2NrZXRIb3N0bmFtZSIsImhvc3RuYW1lIiwidXJsIiwic29ja2V0IiwiV2ViU29ja2V0IiwiYmluYXJ5VHlwZSIsImRhdGEiLCJVaW50MzJBcnJheSIsImFkZEV2ZW50TGlzdGVuZXIiLCJzZW5kIiwiZSIsImluZGV4IiwiVWludDhBcnJheSIsInR5cGUiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVhZHkiLCJFcnJvciIsIkJZVEVTX1BFUl9FTEVNRU5UIiwiY2FsbGJhY2tzIiwiZm9yRWFjaCIsImNhbGxiYWNrIiwibGlzdGVuZXJzIiwiYWRkIiwiaW5kZXhPZiIsInNpemUiLCJsZW5ndGgiLCJjaGFubmVsVmlldyIsInNldCIsImJ1ZmZlciIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7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O0FBQ2xCLFVBQU1LLFFBQVEsS0FBS3BCLFNBQUwsQ0FBZWdDLE9BQWYsQ0FBdUI3QixPQUF2QixDQUFkOztBQUVBLFVBQUlpQixVQUFVLENBQUMsQ0FBZixFQUNFLE1BQU0sSUFBSUssS0FBSix5QkFBZ0N0QixPQUFoQyxPQUFOOztBQUpnQixVQU1WbUIsSUFOVSxHQU1ELEtBQUtyQyxTQUFMLENBQWVtQyxLQUFmLENBTkMsQ0FNVkUsSUFOVTs7QUFPbEIsVUFBTTNDLFdBQVcyQixPQUFVZ0IsSUFBVixXQUFqQjtBQUNBLFVBQU1XLE9BQU9sQixPQUFPLElBQUlBLEtBQUttQixNQUFoQixHQUF5QixDQUF0QztBQUNBLFVBQU0zQyxPQUFPLElBQUlaLFFBQUosQ0FBYXNELElBQWIsQ0FBYjs7QUFFQSxVQUFNRSxjQUFjLElBQUlkLFVBQUosQ0FBZTFDLFNBQVMrQyxpQkFBeEIsQ0FBcEI7QUFDQVMsa0JBQVksQ0FBWixJQUFpQmYsS0FBakI7QUFDQTtBQUNBN0IsV0FBSzZDLEdBQUwsQ0FBUyxJQUFJekQsUUFBSixDQUFhd0QsWUFBWUUsTUFBekIsQ0FBVCxFQUEyQyxDQUEzQzs7QUFFQSxVQUFJdEIsSUFBSixFQUNFeEIsS0FBSzZDLEdBQUwsQ0FBU3JCLElBQVQsRUFBZSxDQUFmOztBQUVGLFdBQUtILE1BQUwsQ0FBWU0sSUFBWixDQUFpQjNCLEtBQUs4QyxNQUF0QjtBQUNEOzs7OztBQUdILHlCQUFlQyxRQUFmLENBQXdCakUsVUFBeEIsRUFBb0NJLFNBQXBDOztrQkFFZUEsUyIsImZpbGUiOiJSYXdTb2NrZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU2VnbWVudGVkVmlldyBmcm9tICcuLi92aWV3cy9TZWdtZW50ZWRWaWV3JztcbmltcG9ydCBTZXJ2aWNlIGZyb20gJy4uL2NvcmUvU2VydmljZSc7XG5pbXBvcnQgc2VydmljZU1hbmFnZXIgZnJvbSAnLi4vY29yZS9zZXJ2aWNlTWFuYWdlcic7XG5cbmNvbnN0IFNFUlZJQ0VfSUQgPSAnc2VydmljZTpyYXctc29ja2V0JztcblxuY29uc3QgZGVmYXVsdFZpZXdUZW1wbGF0ZSA9IGBcbjxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcFwiPjwvZGl2PlxuPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtY2VudGVyXCI+XG4gIDxwIGNsYXNzPVwic29mdC1ibGlua1wiPjwlPSB3YWl0ICU+PC9wPlxuPC9kaXY+XG48ZGl2IGNsYXNzPVwic2VjdGlvbi1ib3R0b21cIj48L2Rpdj5cbmA7XG5cbmNvbnN0IGRlZmF1bHRWaWV3Q29udGVudCA9IHtcbiAgd2FpdDogYE9wZW5pbmcgc29ja2V0LDxiciAvPnN0YW5kIGJ5JmhlbGxpcDtgLFxufTtcblxuLyoqXG4gKiBJbnRlcmZhY2UgZm9yIHRoZSBgcmF3LXNvY2tldGAgc2VydmljZS5cbiAqXG4gKiBUaGlzIHNlcnZpY2UgY3JlYXRlcyBhbiBhZGRpdGlvbm5hbCBuYXRpdmUgc29ja2V0IHdpdGggaXRzIGJpbmFyeSB0eXBlIHNldFxuICogdG8gYGFycmF5YnVmZmVyYCBhbmQgZm9jdXNlZCBvbiBwZXJmb3JtYW5jZXMuXG4gKiBJdCBhbGxvd3MgdGhlIHRyYW5zZmVydCBvZiBgVHlwZWRBcnJheWAgZGF0YSB3cmFwcGVkIHdpdGggYSBtaW5pbWFsIGNoYW5uZWxcbiAqIG1lY2hhbmlzbSAodXAgdG8gMjU2IGNoYW5uZWxzKS5cbiAqXG4gKiBfXypUaGUgc2VydmljZSBtdXN0IGJlIHVzZWQgd2l0aCBpdHMgW3NlcnZlci1zaWRlIGNvdW50ZXJwYXJ0XXtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9zZXJ2ZXIuUmF3U29ja2V0fSpfX1xuICpcbiAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnRcbiAqL1xuY2xhc3MgUmF3U29ja2V0IGV4dGVuZHMgU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKFNFUlZJQ0VfSUQsIHRydWUpO1xuXG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgICB2aWV3Q3RvcjogU2VnbWVudGVkVmlldyxcbiAgICAgIHZpZXdQcmlvcml0eTogNSxcbiAgICB9O1xuXG4gICAgdGhpcy5jb25maWd1cmUoZGVmYXVsdHMpO1xuXG4gICAgdGhpcy5fZGVmYXVsdFZpZXdUZW1wbGF0ZSA9IGRlZmF1bHRWaWV3VGVtcGxhdGU7XG4gICAgdGhpcy5fZGVmYXVsdFZpZXdDb250ZW50ID0gZGVmYXVsdFZpZXdDb250ZW50O1xuXG4gICAgLyoqXG4gICAgICogTGlzdGVuZXJzIGZvciB0aGUgaW5jb21taW5nIG1lc3NhZ2VzLlxuICAgICAqXG4gICAgICogQHR5cGUge09iamVjdDxTdHJpbmcsIFNldDxGdW5jdGlvbj4+fVxuICAgICAqIEBuYW1lIF9saXN0ZW5lcnNcbiAgICAgKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3Mvc2VydmVyLlJhd1NvY2tldFxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fbGlzdGVuZXJzID0ge307XG5cbiAgICB0aGlzLl9wcm90b2NvbCA9IG51bGw7XG4gICAgdGhpcy5fb25SZWNlaXZlQ29ubmVjdGlvbkluZm9zID0gdGhpcy5fb25SZWNlaXZlQ29ubmVjdGlvbkluZm9zLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25SZWNlaXZlQWNrbm9sZWRnZW1lbnQgPSB0aGlzLl9vblJlY2VpdmVBY2tub2xlZGdlbWVudC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uTWVzc2FnZSA9IHRoaXMuX29uTWVzc2FnZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGluaXQoKSB7XG4gICAgdGhpcy52aWV3Q3RvciA9IHRoaXMub3B0aW9ucy52aWV3Q3RvcjtcbiAgICB0aGlzLnZpZXcgPSB0aGlzLmNyZWF0ZVZpZXcoKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuXG4gICAgaWYgKCF0aGlzLmhhc1N0YXJ0ZWQpXG4gICAgICB0aGlzLmluaXQoKTtcblxuICAgIHRoaXMuc2hvdygpO1xuXG4gICAgc3VwZXIuc2VuZCgncmVxdWVzdCcpO1xuICAgIHN1cGVyLnJlY2VpdmUoJ2luZm9zJywgdGhpcy5fb25SZWNlaXZlQ29ubmVjdGlvbkluZm9zKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBzdG9wKCkge1xuICAgIHRoaXMuaGlkZSgpO1xuICAgIHN1cGVyLnN0b3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgZXhlY3V0ZWQgd2hlbiB0aGUgc2VydmljZSByZWNlaXZlIGNvbm5lY3Rpb24gaW5mb3JtYXRpb25zIGZyb20gdGhlXG4gICAqIHNlcnZlci5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvcnQgLSBQb3J0IG9uIHdoaWNoIG9wZW4gdGhlIG5ldyBzb2NrZXQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwcm90b2NvbCAtIFVzZXItZGVmaW5lZCBwcm90b2NvbCB0byBiZSB1c2VkIGluIHJhdyBzb2NrZXRcbiAgICogIGV4Y2hhbmdlcy5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRva2VuIC0gVW5pcXVlIHRva2VuIHRvIHJldHJpZXZlIGluIHRoZSBmaXJzdCBtZXNzYWdlIHRvXG4gICAqICBpZGVudHkgdGhlIGNsaWVudCBzZXJ2ZXItc2lkZSwgYWxsb3cgdG8gbWF0Y2ggdGhlIHNvY2tldCB3aXRoIGl0c1xuICAgKiAgY29ycmVzcG9uZGluZyBjbGllbnQuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfb25SZWNlaXZlQ29ubmVjdGlvbkluZm9zKHBvcnQsIHByb3RvY29sLCB0b2tlbikge1xuICAgIHRoaXMuX3Byb3RvY29sID0gcHJvdG9jb2w7XG4gICAgdGhpcy5fY2hhbm5lbHMgPSBwcm90b2NvbC5tYXAoKGVudHJ5KSA9PiBlbnRyeS5jaGFubmVsKTtcblxuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIoJ2Nvbm5lY3Rpb24taW5mb3MnLCB0aGlzLl9vblJlY2VpdmVDb25uZWN0aW9uSW5mb3MpO1xuXG4gICAgY29uc3Qgc29ja2V0UHJvdG9jb2wgPSB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wucmVwbGFjZSgvXmh0dHA/LywgJ3dzJyk7XG4gICAgY29uc3Qgc29ja2V0SG9zdG5hbWUgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWU7XG4gICAgY29uc3QgdXJsID0gYCR7c29ja2V0UHJvdG9jb2x9Ly8ke3NvY2tldEhvc3RuYW1lfToke3BvcnR9YDtcblxuICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldCh1cmwpO1xuICAgIHRoaXMuc29ja2V0LmJpbmFyeVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICAgIC8vIHNlbmQgdG9rZW4gYmFjayB0byB0aGUgc2VydmVyIGFuZCB3YWl0IGZvciBhY2tub2xlZGdlbWVudFxuICAgIGNvbnN0IGRhdGEgPSBuZXcgVWludDMyQXJyYXkoMSk7XG4gICAgZGF0YVswXSA9IHRva2VuO1xuXG4gICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsICgpID0+IHtcbiAgICAgIHRoaXMuc2VuZCgnc2VydmljZTpoYW5kc2hha2UnLCBkYXRhKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLl9vblJlY2VpdmVBY2tub2xlZGdlbWVudCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgZXhlY3V0ZWQgd2hlbiB0aGUgc2VydmVyIGFja25vbGVkZ2VzIHRoZSBtYXRjaGluZyBiZXR3ZWVuIGFcbiAgICogY2xpZW50IGFuZCBhIHNvY2tldC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9vblJlY2VpdmVBY2tub2xlZGdlbWVudChlKSB7XG4gICAgY29uc3QgaW5kZXggPSBuZXcgVWludDhBcnJheShlLmRhdGEpWzBdO1xuICAgIGNvbnN0IHsgY2hhbm5lbCwgdHlwZSB9ID0gdGhpcy5fcHJvdG9jb2xbaW5kZXhdO1xuXG4gICAgLy8gaWdub3JlIGluY29tbWluZyBtZXNzYWdlcyB0aGF0IGNvdWxkIG9jY3VyIGlmXG4gICAgLy8gYWNrbm9sZWRnZW1lbnQgd2FzIG5vdCB5ZXQgcmVjZWl2ZWRcbiAgICBpZiAoY2hhbm5lbCA9PT0gJ3NlcnZpY2U6aGFuZHNoYWtlLWFjaycpwqB7XG4gICAgICB0aGlzLnNvY2tldC5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5fb25SZWNlaXZlQWNrbm9sZWRnZW1lbnQpO1xuICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuX29uTWVzc2FnZSk7XG4gICAgICB0aGlzLnJlYWR5KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZ1bmN0aW9uIG9mIHRoZSBzb2NrZXQgYG1lc3NhZ2VgIGV2ZW50LiBVbndyYXAgdGhlIGNoYW5uZWwgYW5kXG4gICAqIHRoZSBkYXRhIGNvbnRhaW5lZCBpbiB0aGUgcGF5bG9hZCBhbmQgZXhlY3V0ZSB0aGUgcmVnaXN0ZXJlZCBjYWxsYmFjay5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9vbk1lc3NhZ2UoZSkge1xuICAgIGNvbnN0IGluZGV4ID0gbmV3IFVpbnQ4QXJyYXkoZS5kYXRhKVswXTtcblxuICAgIGlmICghdGhpcy5fcHJvdG9jb2xbaW5kZXhdKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHByb3RvY29sIGluZGV4OiAke2luZGV4fWApO1xuXG4gICAgY29uc3QgeyBjaGFubmVsLCB0eXBlIH0gPSB0aGlzLl9wcm90b2NvbFtpbmRleF07XG4gICAgY29uc3Qgdmlld0N0b3IgPSB3aW5kb3dbYCR7dHlwZX1BcnJheWBdO1xuICAgIGNvbnN0IGRhdGEgPSBuZXcgdmlld0N0b3IoZS5kYXRhLCB2aWV3Q3Rvci5CWVRFU19QRVJfRUxFTUVOVCk7XG4gICAgY29uc3QgY2FsbGJhY2tzID0gdGhpcy5fbGlzdGVuZXJzW2NoYW5uZWxdO1xuXG4gICAgaWYgKGNhbGxiYWNrcylcbiAgICAgIGNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFjaykgPT4gY2FsbGJhY2soZGF0YSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgY2FsbGJhY2sgdG8gYmUgZXhlY3V0ZWQgd2hlbiByZWNlaXZpbmcgYSBtZXNzYWdlIG9uIGEgc3BlY2lmaWNcbiAgICogY2hhbm5lbC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNoYW5uZWwgLSBDaGFubmVsIG9mIHRoZSBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIENhbGxiYWNrIGZ1bmN0aW9uLlxuICAgKi9cbiAgcmVjZWl2ZShjaGFubmVsLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblxuICAgIGlmICghbGlzdGVuZXJzW2NoYW5uZWxdKVxuICAgICAgbGlzdGVuZXJzW2NoYW5uZWxdID0gbmV3IFNldCgpO1xuXG4gICAgbGlzdGVuZXJzW2NoYW5uZWxdLmFkZChjYWxsYmFjayk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBkYXRhIG9uIGEgc3BlY2lmaWMgY2hhbm5lbC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNoYW5uZWwgLSBDaGFubmVsIG9mIHRoZSBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge1R5cGVkQXJyYXl9IGRhdGEgLSBEYXRhLlxuICAgKi9cbiAgc2VuZChjaGFubmVsLCBkYXRhKSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLl9jaGFubmVscy5pbmRleE9mKGNoYW5uZWwpO1xuXG4gICAgaWYgKGluZGV4ID09PSAtMSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5kZWZpbmVkIGNoYW5uZWwgXCIke2NoYW5uZWx9XCJgKTtcblxuICAgIGNvbnN0IHsgdHlwZSB9ID0gdGhpcy5fcHJvdG9jb2xbaW5kZXhdO1xuICAgIGNvbnN0IHZpZXdDdG9yID0gd2luZG93W2Ake3R5cGV9QXJyYXlgXTtcbiAgICBjb25zdCBzaXplID0gZGF0YSA/IDEgKyBkYXRhLmxlbmd0aCA6IDE7XG4gICAgY29uc3QgdmlldyA9IG5ldyB2aWV3Q3RvcihzaXplKTtcblxuICAgIGNvbnN0IGNoYW5uZWxWaWV3ID0gbmV3IFVpbnQ4QXJyYXkodmlld0N0b3IuQllURVNfUEVSX0VMRU1FTlQpO1xuICAgIGNoYW5uZWxWaWV3WzBdID0gaW5kZXg7XG4gICAgLy8gcG9wdWxhdGUgYnVmZmVyXG4gICAgdmlldy5zZXQobmV3IHZpZXdDdG9yKGNoYW5uZWxWaWV3LmJ1ZmZlciksIDApO1xuXG4gICAgaWYgKGRhdGEpXG4gICAgICB2aWV3LnNldChkYXRhLCAxKTtcblxuICAgIHRoaXMuc29ja2V0LnNlbmQodmlldy5idWZmZXIpO1xuICB9XG59XG5cbnNlcnZpY2VNYW5hZ2VyLnJlZ2lzdGVyKFNFUlZJQ0VfSUQsIFJhd1NvY2tldCk7XG5cbmV4cG9ydCBkZWZhdWx0IFJhd1NvY2tldDtcbiJdfQ==