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

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Service2 = require('../core/Service');

var _Service3 = _interopRequireDefault(_Service2);

var _helpers = require('../../utils/helpers');

var _serviceManager = require('../core/serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SERVICE_ID = 'service:sync-scheduler';

/**
 * Interface for the server `'sync-scheduler'` service.
 *
 * @memberof module:soundworks/server
 * @example
 * // inside the experience constructor
 * this.syncScheduler = this.require('sync-scheduler');
 */

var SyncScheduler = function (_Service) {
  (0, _inherits3.default)(SyncScheduler, _Service);

  /** _<span class="warning">__WARNING__</span> This class should never be instanciated manually_ */
  function SyncScheduler() {
    (0, _classCallCheck3.default)(this, SyncScheduler);

    var _this = (0, _possibleConstructorReturn3.default)(this, (SyncScheduler.__proto__ || (0, _getPrototypeOf2.default)(SyncScheduler)).call(this, SERVICE_ID));

    _this._sync = _this.require('sync');
    return _this;
  }

  /** @private */


  (0, _createClass3.default)(SyncScheduler, [{
    key: 'start',
    value: function start() {
      (0, _get3.default)(SyncScheduler.prototype.__proto__ || (0, _getPrototypeOf2.default)(SyncScheduler.prototype), 'start', this).call(this);
    }
  }, {
    key: 'connect',


    /** @private */
    value: function connect(client) {
      (0, _get3.default)(SyncScheduler.prototype.__proto__ || (0, _getPrototypeOf2.default)(SyncScheduler.prototype), 'connect', this).call(this, client);
    }

    /** @private */

  }, {
    key: 'disconnect',
    value: function disconnect(client) {
      (0, _get3.default)(SyncScheduler.prototype.__proto__ || (0, _getPrototypeOf2.default)(SyncScheduler.prototype), 'disconnect', this).call(this, client);
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this._sync.getSyncTime();
    }
  }, {
    key: 'syncTime',
    get: function get() {
      return this._sync.getSyncTime();
    }
  }]);
  return SyncScheduler;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, SyncScheduler);

exports.default = SyncScheduler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlN5bmNTY2hlZHVsZXIuanMiXSwibmFtZXMiOlsiU0VSVklDRV9JRCIsIlN5bmNTY2hlZHVsZXIiLCJfc3luYyIsInJlcXVpcmUiLCJjbGllbnQiLCJnZXRTeW5jVGltZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxhQUFhLHdCQUFuQjs7QUFHQTs7Ozs7Ozs7O0lBUU1DLGE7OztBQUNKO0FBQ0EsMkJBQWM7QUFBQTs7QUFBQSxvSkFDTkQsVUFETTs7QUFHWixVQUFLRSxLQUFMLEdBQWEsTUFBS0MsT0FBTCxDQUFhLE1BQWIsQ0FBYjtBQUhZO0FBSWI7O0FBRUQ7Ozs7OzRCQUNRO0FBQ047QUFDRDs7Ozs7QUFVRDs0QkFDUUMsTSxFQUFRO0FBQ2Qsa0pBQWNBLE1BQWQ7QUFDRDs7QUFFRDs7OzsrQkFDV0EsTSxFQUFRO0FBQ2pCLHFKQUFpQkEsTUFBakI7QUFDRDs7O3dCQWhCaUI7QUFDaEIsYUFBTyxLQUFLRixLQUFMLENBQVdHLFdBQVgsRUFBUDtBQUNEOzs7d0JBRWM7QUFDYixhQUFPLEtBQUtILEtBQUwsQ0FBV0csV0FBWCxFQUFQO0FBQ0Q7Ozs7O0FBYUgseUJBQWVDLFFBQWYsQ0FBd0JOLFVBQXhCLEVBQW9DQyxhQUFwQzs7a0JBRWVBLGEiLCJmaWxlIjoiU3luY1NjaGVkdWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTZXJ2aWNlIGZyb20gJy4uL2NvcmUvU2VydmljZSc7XG5pbXBvcnQgeyBnZXRPcHQgfSBmcm9tICcuLi8uLi91dGlscy9oZWxwZXJzJztcbmltcG9ydCBzZXJ2aWNlTWFuYWdlciBmcm9tICcuLi9jb3JlL3NlcnZpY2VNYW5hZ2VyJztcblxuY29uc3QgU0VSVklDRV9JRCA9ICdzZXJ2aWNlOnN5bmMtc2NoZWR1bGVyJztcblxuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIHNlcnZlciBgJ3N5bmMtc2NoZWR1bGVyJ2Agc2VydmljZS5cbiAqXG4gKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3Mvc2VydmVyXG4gKiBAZXhhbXBsZVxuICogLy8gaW5zaWRlIHRoZSBleHBlcmllbmNlIGNvbnN0cnVjdG9yXG4gKiB0aGlzLnN5bmNTY2hlZHVsZXIgPSB0aGlzLnJlcXVpcmUoJ3N5bmMtc2NoZWR1bGVyJyk7XG4gKi9cbmNsYXNzIFN5bmNTY2hlZHVsZXIgZXh0ZW5kcyBTZXJ2aWNlIHtcbiAgLyoqIF88c3BhbiBjbGFzcz1cIndhcm5pbmdcIj5fX1dBUk5JTkdfXzwvc3Bhbj4gVGhpcyBjbGFzcyBzaG91bGQgbmV2ZXIgYmUgaW5zdGFuY2lhdGVkIG1hbnVhbGx5XyAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihTRVJWSUNFX0lEKTtcblxuICAgIHRoaXMuX3N5bmMgPSB0aGlzLnJlcXVpcmUoJ3N5bmMnKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9zeW5jLmdldFN5bmNUaW1lKCk7XG4gIH1cblxuICBnZXQgc3luY1RpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3N5bmMuZ2V0U3luY1RpbWUoKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBjb25uZWN0KGNsaWVudCkge1xuICAgIHN1cGVyLmNvbm5lY3QoY2xpZW50KTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBkaXNjb25uZWN0KGNsaWVudCkge1xuICAgIHN1cGVyLmRpc2Nvbm5lY3QoY2xpZW50KTtcbiAgfVxufVxuXG5zZXJ2aWNlTWFuYWdlci5yZWdpc3RlcihTRVJWSUNFX0lELCBTeW5jU2NoZWR1bGVyKTtcblxuZXhwb3J0IGRlZmF1bHQgU3luY1NjaGVkdWxlcjtcbiJdfQ==