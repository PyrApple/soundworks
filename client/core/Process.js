'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _events = require('events');

var _Signal = require('./Signal');

var _Signal2 = _interopRequireDefault(_Signal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A process defines the simpliest unit of the framework.
 * It is defined by a signal `active` and 2 methods: `start` and `stop`.
 *
 * @memberof module:soundworks/client
 */
var Process = function (_EventEmitter) {
  (0, _inherits3.default)(Process, _EventEmitter);

  function Process(id) {
    (0, _classCallCheck3.default)(this, Process);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Process.__proto__ || (0, _getPrototypeOf2.default)(Process)).call(this));

    if (id === undefined) throw new Error('Undefined id for process ' + _this.constructor.name);

    /**
     * Name of the process.
     * @type {String}
     */
    _this.id = id;

    /**
     * Signals defining the process state.
     * @type {Object}
     */
    _this.signals = {};
    _this.signals.active = new _Signal2.default();
    return _this;
  }

  /**
   * Start the process.
   */


  (0, _createClass3.default)(Process, [{
    key: 'start',
    value: function start() {
      this.signals.active.set(true);
    }

    /**
     * Stop the process.
     */

  }, {
    key: 'stop',
    value: function stop() {
      this.signals.active.set(false);
    }
  }]);
  return Process;
}(_events.EventEmitter);

exports.default = Process;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlByb2Nlc3MuanMiXSwibmFtZXMiOlsiUHJvY2VzcyIsImlkIiwidW5kZWZpbmVkIiwiRXJyb3IiLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJzaWduYWxzIiwiYWN0aXZlIiwic2V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOzs7Ozs7QUFFQTs7Ozs7O0lBTU1BLE87OztBQUNKLG1CQUFZQyxFQUFaLEVBQWdCO0FBQUE7O0FBQUE7O0FBR2QsUUFBSUEsT0FBT0MsU0FBWCxFQUNFLE1BQU0sSUFBSUMsS0FBSiwrQkFBc0MsTUFBS0MsV0FBTCxDQUFpQkMsSUFBdkQsQ0FBTjs7QUFFRjs7OztBQUlBLFVBQUtKLEVBQUwsR0FBVUEsRUFBVjs7QUFFQTs7OztBQUlBLFVBQUtLLE9BQUwsR0FBZSxFQUFmO0FBQ0EsVUFBS0EsT0FBTCxDQUFhQyxNQUFiLEdBQXNCLHNCQUF0QjtBQWpCYztBQWtCZjs7QUFFRDs7Ozs7Ozs0QkFHUTtBQUNOLFdBQUtELE9BQUwsQ0FBYUMsTUFBYixDQUFvQkMsR0FBcEIsQ0FBd0IsSUFBeEI7QUFDRDs7QUFFRDs7Ozs7OzJCQUdPO0FBQ0wsV0FBS0YsT0FBTCxDQUFhQyxNQUFiLENBQW9CQyxHQUFwQixDQUF3QixLQUF4QjtBQUNEOzs7OztrQkFHWVIsTyIsImZpbGUiOiJQcm9jZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCBTaWduYWwgZnJvbSAnLi9TaWduYWwnO1xuXG4vKipcbiAqIEEgcHJvY2VzcyBkZWZpbmVzIHRoZSBzaW1wbGllc3QgdW5pdCBvZiB0aGUgZnJhbWV3b3JrLlxuICogSXQgaXMgZGVmaW5lZCBieSBhIHNpZ25hbCBgYWN0aXZlYCBhbmQgMiBtZXRob2RzOiBgc3RhcnRgIGFuZCBgc3RvcGAuXG4gKlxuICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudFxuICovXG5jbGFzcyBQcm9jZXNzIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgY29uc3RydWN0b3IoaWQpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgaWYgKGlkID09PSB1bmRlZmluZWQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZGVmaW5lZCBpZCBmb3IgcHJvY2VzcyAke3RoaXMuY29uc3RydWN0b3IubmFtZX1gKTtcblxuICAgIC8qKlxuICAgICAqIE5hbWUgb2YgdGhlIHByb2Nlc3MuXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLmlkID0gaWQ7XG5cbiAgICAvKipcbiAgICAgKiBTaWduYWxzIGRlZmluaW5nIHRoZSBwcm9jZXNzIHN0YXRlLlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5zaWduYWxzID0ge307XG4gICAgdGhpcy5zaWduYWxzLmFjdGl2ZSA9IG5ldyBTaWduYWwoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCB0aGUgcHJvY2Vzcy5cbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuc2lnbmFscy5hY3RpdmUuc2V0KHRydWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgdGhlIHByb2Nlc3MuXG4gICAqL1xuICBzdG9wKCkge1xuICAgIHRoaXMuc2lnbmFscy5hY3RpdmUuc2V0KGZhbHNlKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQcm9jZXNzO1xuIl19