'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _osc = require('osc');

var _osc2 = _interopRequireDefault(_osc);

var _Service2 = require('../core/Service');

var _Service3 = _interopRequireDefault(_Service2);

var _serviceManager = require('../core/serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _debug2.default)('soundworks:osc');
var SERVICE_ID = 'service:osc';

/**
 * Interface for the server `'osc'` service.
 *
 * This server-only service provides support for OSC communications with an extenal
 * software (e.g. Max). The configuration of the service (url and port) should be
 * defined in the server configuration, cf. {@link module:soundworks/server.envConfig}.
 *
 * The service currently only supports UDP protocol.
 *
 * @memberof module:soundworks/server
 * @example
 * // inside the experience constructor
 * this.osc = this.require('osc');
 * // when the experience has started, listen to incoming message
 * this.osc.receive('/osc/channel1', (values) => {
 *   // do something with `values`
 * });
 * // send a message
 * this.osc.send('/osc/channel2', [0.618, true]);
 */

var Osc = function (_Service) {
  (0, _inherits3.default)(Osc, _Service);

  /** _<span class="warning">__WARNING__</span> This class should never be instanciated manually_ */
  function Osc() {
    (0, _classCallCheck3.default)(this, Osc);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Osc.__proto__ || (0, _getPrototypeOf2.default)(Osc)).call(this, SERVICE_ID));

    var defaults = {
      configItem: 'osc'
    };

    _this.configure(defaults);

    _this._listeners = [];
    _this._sharedConfig = _this.require('shared-config');

    _this._onMessage = _this._onMessage.bind(_this);
    return _this;
  }

  /** @private */


  (0, _createClass3.default)(Osc, [{
    key: 'start',
    value: function start() {
      var oscConfig = this._sharedConfig.get(this.options.configItem);

      if (this.oscConfig === null) throw new Error('"service:osc": server.config.' + configItem + ' is not defined');

      this.osc = new _osc2.default.UDPPort({
        // This is the port we're listening on.
        localAddress: oscConfig.receiveAddress,
        localPort: oscConfig.receivePort,
        // This is the port we use to send messages.
        remoteAddress: oscConfig.sendAddress,
        remotePort: oscConfig.sendPort
      });

      this.osc.on('ready', function () {
        var receive = oscConfig.receiveAddress + ':' + oscConfig.receivePort;
        var send = oscConfig.sendAddress + ':' + oscConfig.sendPort;

        log('[OSC over UDP] Receiving on ' + receive);
        log('[OSC over UDP] Sending on ' + send);
      });

      this.osc.on('message', this._onMessage);
      this.osc.open();
    }

    /**
     * Apply all the listeners according to the address of the message.
     * @private
     */

  }, {
    key: '_onMessage',
    value: function _onMessage(msg) {
      this._listeners.forEach(function (listener) {
        if (msg.address === listener.address) listener.callback.apply(listener, (0, _toConsumableArray3.default)(msg.args));
      });

      log.apply(undefined, ['message - address "' + msg.address + '"'].concat((0, _toConsumableArray3.default)(msg.args)));
    }

    /**
     * Send an OSC message.
     * @param {String} address - Address of the OSC message.
     * @param {Array} args - Arguments of the OSC message.
     * @param {String} [url=null] - URL to send the OSC message to (if not specified,
     *  uses the port defined in the OSC configuration of the {@link server}).
     * @param {Number} [port=null]- Port to send the message to (if not specified,
     *  uses the port defined in the OSC configuration of the {@link server}).
     */

  }, {
    key: 'send',
    value: function send(address, args) {
      var url = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var port = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

      var msg = { address: address, args: args };

      try {
        if (url && port) this.osc.send(msg, url, port);else this.osc.send(msg); // use defaults (as defined in the config)
      } catch (e) {
        console.log('Error while sending OSC message:', e);
      }

      log.apply(undefined, ['send - address "' + address + '"'].concat((0, _toConsumableArray3.default)(args)));
    }

    /**
     * Register callbacks for OSC mesages. The server listens to OSC messages
     * at the address and port defined in the configuration of the {@link server}.
     * @param {String} address - Wildcard of the OSC message.
     * @param {Function} callback - Callback function to be executed when an OSC
     *  message is received at the given address.
     */

  }, {
    key: 'receive',
    value: function receive(address, callback) {
      var listener = { address: address, callback: callback };
      this._listeners.push(listener);
    }

    /**
     * @todo - implement
     * @private
     */

  }, {
    key: 'removeListener',
    value: function removeListener(address, callback) {}
  }]);
  return Osc;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, Osc);

exports.default = Osc;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk9zYy5qcyJdLCJuYW1lcyI6WyJsb2ciLCJTRVJWSUNFX0lEIiwiT3NjIiwiZGVmYXVsdHMiLCJjb25maWdJdGVtIiwiY29uZmlndXJlIiwiX2xpc3RlbmVycyIsIl9zaGFyZWRDb25maWciLCJyZXF1aXJlIiwiX29uTWVzc2FnZSIsImJpbmQiLCJvc2NDb25maWciLCJnZXQiLCJvcHRpb25zIiwiRXJyb3IiLCJvc2MiLCJVRFBQb3J0IiwibG9jYWxBZGRyZXNzIiwicmVjZWl2ZUFkZHJlc3MiLCJsb2NhbFBvcnQiLCJyZWNlaXZlUG9ydCIsInJlbW90ZUFkZHJlc3MiLCJzZW5kQWRkcmVzcyIsInJlbW90ZVBvcnQiLCJzZW5kUG9ydCIsIm9uIiwicmVjZWl2ZSIsInNlbmQiLCJvcGVuIiwibXNnIiwiZm9yRWFjaCIsImxpc3RlbmVyIiwiYWRkcmVzcyIsImNhbGxiYWNrIiwiYXJncyIsInVybCIsInBvcnQiLCJlIiwiY29uc29sZSIsInB1c2giLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUdBLElBQU1BLE1BQU0scUJBQU0sZ0JBQU4sQ0FBWjtBQUNBLElBQU1DLGFBQWEsYUFBbkI7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQW9CTUMsRzs7O0FBQ0o7QUFDQSxpQkFBYztBQUFBOztBQUFBLGdJQUNORCxVQURNOztBQUdaLFFBQU1FLFdBQVc7QUFDZkMsa0JBQVk7QUFERyxLQUFqQjs7QUFJQSxVQUFLQyxTQUFMLENBQWVGLFFBQWY7O0FBRUEsVUFBS0csVUFBTCxHQUFrQixFQUFsQjtBQUNBLFVBQUtDLGFBQUwsR0FBcUIsTUFBS0MsT0FBTCxDQUFhLGVBQWIsQ0FBckI7O0FBRUEsVUFBS0MsVUFBTCxHQUFrQixNQUFLQSxVQUFMLENBQWdCQyxJQUFoQixPQUFsQjtBQVpZO0FBYWI7O0FBRUQ7Ozs7OzRCQUNRO0FBQ04sVUFBTUMsWUFBWSxLQUFLSixhQUFMLENBQW1CSyxHQUFuQixDQUF1QixLQUFLQyxPQUFMLENBQWFULFVBQXBDLENBQWxCOztBQUVBLFVBQUksS0FBS08sU0FBTCxLQUFtQixJQUF2QixFQUNFLE1BQU0sSUFBSUcsS0FBSixtQ0FBMENWLFVBQTFDLHFCQUFOOztBQUVGLFdBQUtXLEdBQUwsR0FBVyxJQUFJLGNBQUlDLE9BQVIsQ0FBZ0I7QUFDekI7QUFDQUMsc0JBQWNOLFVBQVVPLGNBRkM7QUFHekJDLG1CQUFXUixVQUFVUyxXQUhJO0FBSXpCO0FBQ0FDLHVCQUFlVixVQUFVVyxXQUxBO0FBTXpCQyxvQkFBWVosVUFBVWE7QUFORyxPQUFoQixDQUFYOztBQVNBLFdBQUtULEdBQUwsQ0FBU1UsRUFBVCxDQUFZLE9BQVosRUFBcUIsWUFBTTtBQUN6QixZQUFNQyxVQUFhZixVQUFVTyxjQUF2QixTQUF5Q1AsVUFBVVMsV0FBekQ7QUFDQSxZQUFNTyxPQUFVaEIsVUFBVVcsV0FBcEIsU0FBbUNYLFVBQVVhLFFBQW5EOztBQUVBeEIsNkNBQW1DMEIsT0FBbkM7QUFDQTFCLDJDQUFpQzJCLElBQWpDO0FBQ0QsT0FORDs7QUFRQSxXQUFLWixHQUFMLENBQVNVLEVBQVQsQ0FBWSxTQUFaLEVBQXVCLEtBQUtoQixVQUE1QjtBQUNBLFdBQUtNLEdBQUwsQ0FBU2EsSUFBVDtBQUNEOztBQUVEOzs7Ozs7OytCQUlXQyxHLEVBQUs7QUFDZCxXQUFLdkIsVUFBTCxDQUFnQndCLE9BQWhCLENBQXdCLFVBQUNDLFFBQUQsRUFBYztBQUNwQyxZQUFJRixJQUFJRyxPQUFKLEtBQWdCRCxTQUFTQyxPQUE3QixFQUNFRCxTQUFTRSxRQUFULGtEQUFxQkosSUFBSUssSUFBekI7QUFDSCxPQUhEOztBQUtBbEMsb0RBQTBCNkIsSUFBSUcsT0FBOUIsZ0RBQTZDSCxJQUFJSyxJQUFqRDtBQUNEOztBQUVEOzs7Ozs7Ozs7Ozs7eUJBU0tGLE8sRUFBU0UsSSxFQUErQjtBQUFBLFVBQXpCQyxHQUF5Qix1RUFBbkIsSUFBbUI7QUFBQSxVQUFiQyxJQUFhLHVFQUFOLElBQU07O0FBQzNDLFVBQU1QLE1BQU0sRUFBRUcsZ0JBQUYsRUFBV0UsVUFBWCxFQUFaOztBQUVBLFVBQUk7QUFDRixZQUFJQyxPQUFPQyxJQUFYLEVBQ0UsS0FBS3JCLEdBQUwsQ0FBU1ksSUFBVCxDQUFjRSxHQUFkLEVBQW1CTSxHQUFuQixFQUF3QkMsSUFBeEIsRUFERixLQUdFLEtBQUtyQixHQUFMLENBQVNZLElBQVQsQ0FBY0UsR0FBZCxFQUpBLENBSW9CO0FBQ3ZCLE9BTEQsQ0FLRSxPQUFPUSxDQUFQLEVBQVU7QUFDVkMsZ0JBQVF0QyxHQUFSLENBQVksa0NBQVosRUFBZ0RxQyxDQUFoRDtBQUNEOztBQUVEckMsaURBQXVCZ0MsT0FBdkIsZ0RBQXNDRSxJQUF0QztBQUNEOztBQUVEOzs7Ozs7Ozs7OzRCQU9RRixPLEVBQVNDLFEsRUFBVTtBQUN6QixVQUFNRixXQUFXLEVBQUVDLGdCQUFGLEVBQVdDLGtCQUFYLEVBQWpCO0FBQ0EsV0FBSzNCLFVBQUwsQ0FBZ0JpQyxJQUFoQixDQUFxQlIsUUFBckI7QUFDRDs7QUFFRDs7Ozs7OzttQ0FJZUMsTyxFQUFTQyxRLEVBQVUsQ0FBRTs7Ozs7QUFHdEMseUJBQWVPLFFBQWYsQ0FBd0J2QyxVQUF4QixFQUFvQ0MsR0FBcEM7O2tCQUVlQSxHIiwiZmlsZSI6Ik9zYy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQgb3NjIGZyb20gJ29zYyc7XG5pbXBvcnQgU2VydmljZSBmcm9tICcuLi9jb3JlL1NlcnZpY2UnO1xuaW1wb3J0IHNlcnZpY2VNYW5hZ2VyIGZyb20gJy4uL2NvcmUvc2VydmljZU1hbmFnZXInO1xuXG5cbmNvbnN0IGxvZyA9IGRlYnVnKCdzb3VuZHdvcmtzOm9zYycpO1xuY29uc3QgU0VSVklDRV9JRCA9ICdzZXJ2aWNlOm9zYyc7XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUgc2VydmVyIGAnb3NjJ2Agc2VydmljZS5cbiAqXG4gKiBUaGlzIHNlcnZlci1vbmx5IHNlcnZpY2UgcHJvdmlkZXMgc3VwcG9ydCBmb3IgT1NDIGNvbW11bmljYXRpb25zIHdpdGggYW4gZXh0ZW5hbFxuICogc29mdHdhcmUgKGUuZy4gTWF4KS4gVGhlIGNvbmZpZ3VyYXRpb24gb2YgdGhlIHNlcnZpY2UgKHVybCBhbmQgcG9ydCkgc2hvdWxkIGJlXG4gKiBkZWZpbmVkIGluIHRoZSBzZXJ2ZXIgY29uZmlndXJhdGlvbiwgY2YuIHtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9zZXJ2ZXIuZW52Q29uZmlnfS5cbiAqXG4gKiBUaGUgc2VydmljZSBjdXJyZW50bHkgb25seSBzdXBwb3J0cyBVRFAgcHJvdG9jb2wuXG4gKlxuICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL3NlcnZlclxuICogQGV4YW1wbGVcbiAqIC8vIGluc2lkZSB0aGUgZXhwZXJpZW5jZSBjb25zdHJ1Y3RvclxuICogdGhpcy5vc2MgPSB0aGlzLnJlcXVpcmUoJ29zYycpO1xuICogLy8gd2hlbiB0aGUgZXhwZXJpZW5jZSBoYXMgc3RhcnRlZCwgbGlzdGVuIHRvIGluY29taW5nIG1lc3NhZ2VcbiAqIHRoaXMub3NjLnJlY2VpdmUoJy9vc2MvY2hhbm5lbDEnLCAodmFsdWVzKSA9PiB7XG4gKiAgIC8vIGRvIHNvbWV0aGluZyB3aXRoIGB2YWx1ZXNgXG4gKiB9KTtcbiAqIC8vIHNlbmQgYSBtZXNzYWdlXG4gKiB0aGlzLm9zYy5zZW5kKCcvb3NjL2NoYW5uZWwyJywgWzAuNjE4LCB0cnVlXSk7XG4gKi9cbmNsYXNzIE9zYyBleHRlbmRzIFNlcnZpY2Uge1xuICAvKiogXzxzcGFuIGNsYXNzPVwid2FybmluZ1wiPl9fV0FSTklOR19fPC9zcGFuPiBUaGlzIGNsYXNzIHNob3VsZCBuZXZlciBiZSBpbnN0YW5jaWF0ZWQgbWFudWFsbHlfICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKFNFUlZJQ0VfSUQpO1xuXG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgICBjb25maWdJdGVtOiAnb3NjJyxcbiAgICB9O1xuXG4gICAgdGhpcy5jb25maWd1cmUoZGVmYXVsdHMpO1xuXG4gICAgdGhpcy5fbGlzdGVuZXJzID0gW107XG4gICAgdGhpcy5fc2hhcmVkQ29uZmlnID0gdGhpcy5yZXF1aXJlKCdzaGFyZWQtY29uZmlnJyk7XG5cbiAgICB0aGlzLl9vbk1lc3NhZ2UgPSB0aGlzLl9vbk1lc3NhZ2UuYmluZCh0aGlzKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBzdGFydCgpIHtcbiAgICBjb25zdCBvc2NDb25maWcgPSB0aGlzLl9zaGFyZWRDb25maWcuZ2V0KHRoaXMub3B0aW9ucy5jb25maWdJdGVtKTtcblxuICAgIGlmICh0aGlzLm9zY0NvbmZpZyA9PT0gbnVsbClcbiAgICAgIHRocm93IG5ldyBFcnJvcihgXCJzZXJ2aWNlOm9zY1wiOiBzZXJ2ZXIuY29uZmlnLiR7Y29uZmlnSXRlbX0gaXMgbm90IGRlZmluZWRgKTtcblxuICAgIHRoaXMub3NjID0gbmV3IG9zYy5VRFBQb3J0KHtcbiAgICAgIC8vIFRoaXMgaXMgdGhlIHBvcnQgd2UncmUgbGlzdGVuaW5nIG9uLlxuICAgICAgbG9jYWxBZGRyZXNzOiBvc2NDb25maWcucmVjZWl2ZUFkZHJlc3MsXG4gICAgICBsb2NhbFBvcnQ6IG9zY0NvbmZpZy5yZWNlaXZlUG9ydCxcbiAgICAgIC8vIFRoaXMgaXMgdGhlIHBvcnQgd2UgdXNlIHRvIHNlbmQgbWVzc2FnZXMuXG4gICAgICByZW1vdGVBZGRyZXNzOiBvc2NDb25maWcuc2VuZEFkZHJlc3MsXG4gICAgICByZW1vdGVQb3J0OiBvc2NDb25maWcuc2VuZFBvcnQsXG4gICAgfSk7XG5cbiAgICB0aGlzLm9zYy5vbigncmVhZHknLCAoKSA9PiB7XG4gICAgICBjb25zdCByZWNlaXZlID0gYCR7b3NjQ29uZmlnLnJlY2VpdmVBZGRyZXNzfToke29zY0NvbmZpZy5yZWNlaXZlUG9ydH1gO1xuICAgICAgY29uc3Qgc2VuZCA9IGAke29zY0NvbmZpZy5zZW5kQWRkcmVzc306JHtvc2NDb25maWcuc2VuZFBvcnR9YDtcblxuICAgICAgbG9nKGBbT1NDIG92ZXIgVURQXSBSZWNlaXZpbmcgb24gJHtyZWNlaXZlfWApO1xuICAgICAgbG9nKGBbT1NDIG92ZXIgVURQXSBTZW5kaW5nIG9uICR7c2VuZH1gKTtcbiAgICB9KTtcblxuICAgIHRoaXMub3NjLm9uKCdtZXNzYWdlJywgdGhpcy5fb25NZXNzYWdlKTtcbiAgICB0aGlzLm9zYy5vcGVuKCk7XG4gIH1cblxuICAvKipcbiAgICogQXBwbHkgYWxsIHRoZSBsaXN0ZW5lcnMgYWNjb3JkaW5nIHRvIHRoZSBhZGRyZXNzIG9mIHRoZSBtZXNzYWdlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX29uTWVzc2FnZShtc2cpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIGlmIChtc2cuYWRkcmVzcyA9PT0gbGlzdGVuZXIuYWRkcmVzcylcbiAgICAgICAgbGlzdGVuZXIuY2FsbGJhY2soLi4ubXNnLmFyZ3MpO1xuICAgIH0pO1xuXG4gICAgbG9nKGBtZXNzYWdlIC0gYWRkcmVzcyBcIiR7bXNnLmFkZHJlc3N9XCJgLCAuLi5tc2cuYXJncyk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBhbiBPU0MgbWVzc2FnZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGFkZHJlc3MgLSBBZGRyZXNzIG9mIHRoZSBPU0MgbWVzc2FnZS5cbiAgICogQHBhcmFtIHtBcnJheX0gYXJncyAtIEFyZ3VtZW50cyBvZiB0aGUgT1NDIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbdXJsPW51bGxdIC0gVVJMIHRvIHNlbmQgdGhlIE9TQyBtZXNzYWdlIHRvIChpZiBub3Qgc3BlY2lmaWVkLFxuICAgKiAgdXNlcyB0aGUgcG9ydCBkZWZpbmVkIGluIHRoZSBPU0MgY29uZmlndXJhdGlvbiBvZiB0aGUge0BsaW5rIHNlcnZlcn0pLlxuICAgKiBAcGFyYW0ge051bWJlcn0gW3BvcnQ9bnVsbF0tIFBvcnQgdG8gc2VuZCB0aGUgbWVzc2FnZSB0byAoaWYgbm90IHNwZWNpZmllZCxcbiAgICogIHVzZXMgdGhlIHBvcnQgZGVmaW5lZCBpbiB0aGUgT1NDIGNvbmZpZ3VyYXRpb24gb2YgdGhlIHtAbGluayBzZXJ2ZXJ9KS5cbiAgICovXG4gIHNlbmQoYWRkcmVzcywgYXJncywgdXJsID0gbnVsbCwgcG9ydCA9IG51bGwpIHtcbiAgICBjb25zdCBtc2cgPSB7IGFkZHJlc3MsIGFyZ3MgfTtcblxuICAgIHRyeSB7XG4gICAgICBpZiAodXJsICYmIHBvcnQpXG4gICAgICAgIHRoaXMub3NjLnNlbmQobXNnLCB1cmwsIHBvcnQpO1xuICAgICAgZWxzZVxuICAgICAgICB0aGlzLm9zYy5zZW5kKG1zZyk7IC8vIHVzZSBkZWZhdWx0cyAoYXMgZGVmaW5lZCBpbiB0aGUgY29uZmlnKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdFcnJvciB3aGlsZSBzZW5kaW5nIE9TQyBtZXNzYWdlOicsIGUpO1xuICAgIH1cblxuICAgIGxvZyhgc2VuZCAtIGFkZHJlc3MgXCIke2FkZHJlc3N9XCJgLCAuLi5hcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBjYWxsYmFja3MgZm9yIE9TQyBtZXNhZ2VzLiBUaGUgc2VydmVyIGxpc3RlbnMgdG8gT1NDIG1lc3NhZ2VzXG4gICAqIGF0IHRoZSBhZGRyZXNzIGFuZCBwb3J0IGRlZmluZWQgaW4gdGhlIGNvbmZpZ3VyYXRpb24gb2YgdGhlIHtAbGluayBzZXJ2ZXJ9LlxuICAgKiBAcGFyYW0ge1N0cmluZ30gYWRkcmVzcyAtIFdpbGRjYXJkIG9mIHRoZSBPU0MgbWVzc2FnZS5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBDYWxsYmFjayBmdW5jdGlvbiB0byBiZSBleGVjdXRlZCB3aGVuIGFuIE9TQ1xuICAgKiAgbWVzc2FnZSBpcyByZWNlaXZlZCBhdCB0aGUgZ2l2ZW4gYWRkcmVzcy5cbiAgICovXG4gIHJlY2VpdmUoYWRkcmVzcywgY2FsbGJhY2spIHtcbiAgICBjb25zdCBsaXN0ZW5lciA9IHsgYWRkcmVzcywgY2FsbGJhY2sgfTtcbiAgICB0aGlzLl9saXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gIH1cblxuICAvKipcbiAgICogQHRvZG8gLSBpbXBsZW1lbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJlbW92ZUxpc3RlbmVyKGFkZHJlc3MsIGNhbGxiYWNrKSB7fVxufVxuXG5zZXJ2aWNlTWFuYWdlci5yZWdpc3RlcihTRVJWSUNFX0lELCBPc2MpO1xuXG5leHBvcnQgZGVmYXVsdCBPc2M7XG4iXX0=