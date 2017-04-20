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

var SERVICE_ID = 'service:metric-scheduler';

/**
 * Interface for the server `'metric-scheduler'` service.
 *
 * @memberof module:soundworks/server
 * @example
 * // inside the experience constructor
 * this.metricScheduler = this.require('metric-scheduler');
 */

var MetricScheduler = function (_Service) {
  (0, _inherits3.default)(MetricScheduler, _Service);

  /** _<span class="warning">__WARNING__</span> This class should never be instanciated manually_ */
  function MetricScheduler() {
    (0, _classCallCheck3.default)(this, MetricScheduler);

    var _this = (0, _possibleConstructorReturn3.default)(this, (MetricScheduler.__proto__ || (0, _getPrototypeOf2.default)(MetricScheduler)).call(this, SERVICE_ID));

    _this._syncTime = 0;
    _this._metricPosition = 0;
    _this._tempo = 60; // tempo in beats per minute (BPM)
    _this._tempoUnit = 0.25; // tempo unit expressed in fractions of a whole note

    _this._nextSyncEvent = null;
    _this._nextSyncTime = Infinity;

    _this._syncScheduler = _this.require('sync-scheduler');

    _this._onRequest = _this._onRequest.bind(_this);
    return _this;
  }

  /** @private */


  (0, _createClass3.default)(MetricScheduler, [{
    key: 'configure',
    value: function configure(options) {
      if (options.tempo !== undefined) this._tempo = options.tempo;

      if (options.tempoUnit !== undefined) this._tempoUnit = options.tempoUnit;

      (0, _get3.default)(MetricScheduler.prototype.__proto__ || (0, _getPrototypeOf2.default)(MetricScheduler.prototype), 'configure', this).call(this, options);
    }

    /** @private */

  }, {
    key: 'start',
    value: function start() {
      (0, _get3.default)(MetricScheduler.prototype.__proto__ || (0, _getPrototypeOf2.default)(MetricScheduler.prototype), 'start', this).call(this);
    }

    /** @private */

  }, {
    key: '_resetSync',
    value: function _resetSync() {
      this._nextSyncEvent = null;
      this._nextSyncTime = Infinity;
    }

    /** @private */

  }, {
    key: '_setSync',
    value: function _setSync(syncTime, metricPosition, tempo, tempoUnit, event) {
      this._resetSync();

      if (syncTime <= this.syncTime) {
        this._syncTime = syncTime;
        this._metricPosition = metricPosition;
        this._tempo = tempo;
        this._tempoUnit = tempoUnit;
        this._metricSpeed = tempo * tempoUnit / 60;
      } else {
        this._nextSyncEvent = { syncTime: syncTime, metricPosition: metricPosition, tempo: tempo, tempoUnit: tempoUnit, event: event };
        this._nextSyncTime = syncTime;
      }

      this.broadcast(null, null, 'sync', syncTime, metricPosition, tempo, tempoUnit, event);
    }

    /** @private */

  }, {
    key: '_updateSync',
    value: function _updateSync() {
      if (this.syncTime >= this._nextSyncTime) {
        var _nextSyncEvent = this._nextSyncEvent,
            syncTime = _nextSyncEvent.syncTime,
            metricPosition = _nextSyncEvent.metricPosition,
            tempo = _nextSyncEvent.tempo,
            tempoUnit = _nextSyncEvent.tempoUnit;

        this._syncTime = syncTime;
        this._metricPosition = metricPosition;
        this._tempo = tempo;
        this._tempoUnit = tempoUnit;
        this._metricSpeed = tempo * tempoUnit / 60;
        this._nextSyncTime = Infinity;
      }
    }

    /** @private */

  }, {
    key: '_onRequest',
    value: function _onRequest(client) {
      var _this2 = this;

      return function () {
        _this2._updateSync();
        _this2.send(client, 'init', _this2._syncTime, _this2._metricPosition, _this2._tempo, _this2._tempoUnit);

        if (_this2._nextSyncTime < Infinity) {
          var _nextSyncEvent2 = _this2._nextSyncEvent,
              syncTime = _nextSyncEvent2.syncTime,
              metricPosition = _nextSyncEvent2.metricPosition,
              tempo = _nextSyncEvent2.tempo,
              tempoUnit = _nextSyncEvent2.tempoUnit,
              event = _nextSyncEvent2.event;

          _this2.send(client, 'sync', syncTime, metricPosition, tempo, tempoUnit, event);
        }
      };
    }
  }, {
    key: 'sync',
    value: function sync(syncTime, metricPosition, tempo, tempoUnit) {
      var event = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;

      this._setSync(syncTime, metricPosition, tempo, tempoUnit, event);
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.broadcast(null, null, 'clear');
    }
  }, {
    key: 'getMetricPositionAtSyncTime',


    /**
     * Get metric position corrsponding to a given sync time (regarding the current tempo).
     * @param  {Number} time - time
     * @return {Number} - metric position
     */
    value: function getMetricPositionAtSyncTime(syncTime) {
      this._updateSync();

      if (this._tempo > 0) return this._metricPosition + (syncTime - this._syncTime) * this._metricSpeed;

      return this._metricPosition;
    }

    /**
     * Get sync time corrsponding to a given metric position (regarding the current tempo).
     * @param  {Number} position - metric position
     * @return {Number} - time
     */

  }, {
    key: 'getSyncTimeAtMetricPosition',
    value: function getSyncTimeAtMetricPosition(metricPosition) {
      this._updateSync();

      var metricSpeed = this._metricSpeed;

      if (metricPosition < Infinity && metricSpeed > 0) return this._syncTime + (metricPosition - this._metricPosition) / metricSpeed;

      return Infinity;
    }

    /** @private */

  }, {
    key: 'connect',
    value: function connect(client) {
      (0, _get3.default)(MetricScheduler.prototype.__proto__ || (0, _getPrototypeOf2.default)(MetricScheduler.prototype), 'connect', this).call(this, client);
      this.receive(client, 'request', this._onRequest(client));
    }

    /** @private */

  }, {
    key: 'disconnect',
    value: function disconnect(client) {
      (0, _get3.default)(MetricScheduler.prototype.__proto__ || (0, _getPrototypeOf2.default)(MetricScheduler.prototype), 'disconnect', this).call(this, client);
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this._syncScheduler.currentTime;
    }
  }, {
    key: 'syncTime',
    get: function get() {
      return this._syncScheduler.currentTime;
    }
  }, {
    key: 'metricPosition',
    get: function get() {
      this._updateSync();

      if (this._tempo > 0) return this._metricPosition + (this.syncTime - this._syncTime) * this._metricSpeed;

      return this._metricPosition;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      return this.metricPosition;
    }

    /**
     * Current tempo.
     * @return {Number} - Tempo in BPM.
     */

  }, {
    key: 'tempo',
    get: function get() {
      this._updateSync();
      return this._tempo;
    }

    /**
     * Current tempo unit.
     * @return {Number} - Tempo unit in respect to whole note.
     */

  }, {
    key: 'tempoUnit',
    get: function get() {
      this._updateSync();
      return this._tempoUnit;
    }
  }]);
  return MetricScheduler;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, MetricScheduler);

exports.default = MetricScheduler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1ldHJpY1NjaGVkdWxlci5qcyJdLCJuYW1lcyI6WyJTRVJWSUNFX0lEIiwiTWV0cmljU2NoZWR1bGVyIiwiX3N5bmNUaW1lIiwiX21ldHJpY1Bvc2l0aW9uIiwiX3RlbXBvIiwiX3RlbXBvVW5pdCIsIl9uZXh0U3luY0V2ZW50IiwiX25leHRTeW5jVGltZSIsIkluZmluaXR5IiwiX3N5bmNTY2hlZHVsZXIiLCJyZXF1aXJlIiwiX29uUmVxdWVzdCIsImJpbmQiLCJvcHRpb25zIiwidGVtcG8iLCJ1bmRlZmluZWQiLCJ0ZW1wb1VuaXQiLCJzeW5jVGltZSIsIm1ldHJpY1Bvc2l0aW9uIiwiZXZlbnQiLCJfcmVzZXRTeW5jIiwiX21ldHJpY1NwZWVkIiwiYnJvYWRjYXN0IiwiY2xpZW50IiwiX3VwZGF0ZVN5bmMiLCJzZW5kIiwiX3NldFN5bmMiLCJtZXRyaWNTcGVlZCIsInJlY2VpdmUiLCJjdXJyZW50VGltZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxhQUFhLDBCQUFuQjs7QUFFQTs7Ozs7Ozs7O0lBUU1DLGU7OztBQUNKO0FBQ0EsNkJBQWM7QUFBQTs7QUFBQSx3SkFDTkQsVUFETTs7QUFHWixVQUFLRSxTQUFMLEdBQWlCLENBQWpCO0FBQ0EsVUFBS0MsZUFBTCxHQUF1QixDQUF2QjtBQUNBLFVBQUtDLE1BQUwsR0FBYyxFQUFkLENBTFksQ0FLTTtBQUNsQixVQUFLQyxVQUFMLEdBQWtCLElBQWxCLENBTlksQ0FNWTs7QUFFeEIsVUFBS0MsY0FBTCxHQUFzQixJQUF0QjtBQUNBLFVBQUtDLGFBQUwsR0FBcUJDLFFBQXJCOztBQUVBLFVBQUtDLGNBQUwsR0FBc0IsTUFBS0MsT0FBTCxDQUFhLGdCQUFiLENBQXRCOztBQUVBLFVBQUtDLFVBQUwsR0FBa0IsTUFBS0EsVUFBTCxDQUFnQkMsSUFBaEIsT0FBbEI7QUFiWTtBQWNiOztBQUVE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Q0FBQyxLQUFLYyxRQUFMLEdBQWdCLEtBQUtmLFNBQXRCLElBQW1DLEtBQUttQixZQUF0RTs7QUFFRixhQUFPLEtBQUtsQixlQUFaO0FBQ0Q7Ozt3QkFFcUI7QUFDcEIsYUFBTyxLQUFLZSxjQUFaO0FBQ0Q7O0FBRUQ7Ozs7Ozs7d0JBSVk7QUFDVixXQUFLTSxXQUFMO0FBQ0EsYUFBTyxLQUFLcEIsTUFBWjtBQUNEOztBQUVEOzs7Ozs7O3dCQUlnQjtBQUNkLFdBQUtvQixXQUFMO0FBQ0EsYUFBTyxLQUFLbkIsVUFBWjtBQUNEOzs7OztBQTRDSCx5QkFBZXlCLFFBQWYsQ0FBd0I5QixVQUF4QixFQUFvQ0MsZUFBcEM7O2tCQUVlQSxlIiwiZmlsZSI6Ik1ldHJpY1NjaGVkdWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTZXJ2aWNlIGZyb20gJy4uL2NvcmUvU2VydmljZSc7XG5pbXBvcnQgeyBnZXRPcHQgfSBmcm9tICcuLi8uLi91dGlscy9oZWxwZXJzJztcbmltcG9ydCBzZXJ2aWNlTWFuYWdlciBmcm9tICcuLi9jb3JlL3NlcnZpY2VNYW5hZ2VyJztcblxuY29uc3QgU0VSVklDRV9JRCA9ICdzZXJ2aWNlOm1ldHJpYy1zY2hlZHVsZXInO1xuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIHNlcnZlciBgJ21ldHJpYy1zY2hlZHVsZXInYCBzZXJ2aWNlLlxuICpcbiAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9zZXJ2ZXJcbiAqIEBleGFtcGxlXG4gKiAvLyBpbnNpZGUgdGhlIGV4cGVyaWVuY2UgY29uc3RydWN0b3JcbiAqIHRoaXMubWV0cmljU2NoZWR1bGVyID0gdGhpcy5yZXF1aXJlKCdtZXRyaWMtc2NoZWR1bGVyJyk7XG4gKi9cbmNsYXNzIE1ldHJpY1NjaGVkdWxlciBleHRlbmRzIFNlcnZpY2Uge1xuICAvKiogXzxzcGFuIGNsYXNzPVwid2FybmluZ1wiPl9fV0FSTklOR19fPC9zcGFuPiBUaGlzIGNsYXNzIHNob3VsZCBuZXZlciBiZSBpbnN0YW5jaWF0ZWQgbWFudWFsbHlfICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKFNFUlZJQ0VfSUQpO1xuXG4gICAgdGhpcy5fc3luY1RpbWUgPSAwO1xuICAgIHRoaXMuX21ldHJpY1Bvc2l0aW9uID0gMDtcbiAgICB0aGlzLl90ZW1wbyA9IDYwOyAvLyB0ZW1wbyBpbiBiZWF0cyBwZXIgbWludXRlIChCUE0pXG4gICAgdGhpcy5fdGVtcG9Vbml0ID0gMC4yNTsgLy8gdGVtcG8gdW5pdCBleHByZXNzZWQgaW4gZnJhY3Rpb25zIG9mIGEgd2hvbGUgbm90ZVxuXG4gICAgdGhpcy5fbmV4dFN5bmNFdmVudCA9IG51bGw7XG4gICAgdGhpcy5fbmV4dFN5bmNUaW1lID0gSW5maW5pdHk7XG5cbiAgICB0aGlzLl9zeW5jU2NoZWR1bGVyID0gdGhpcy5yZXF1aXJlKCdzeW5jLXNjaGVkdWxlcicpO1xuXG4gICAgdGhpcy5fb25SZXF1ZXN0ID0gdGhpcy5fb25SZXF1ZXN0LmJpbmQodGhpcyk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgY29uZmlndXJlKG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy50ZW1wbyAhPT0gdW5kZWZpbmVkKVxuICAgICAgdGhpcy5fdGVtcG8gPSBvcHRpb25zLnRlbXBvO1xuXG4gICAgaWYgKG9wdGlvbnMudGVtcG9Vbml0ICE9PSB1bmRlZmluZWQpXG4gICAgICB0aGlzLl90ZW1wb1VuaXQgPSBvcHRpb25zLnRlbXBvVW5pdDtcblxuICAgIHN1cGVyLmNvbmZpZ3VyZShvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9yZXNldFN5bmMoKSB7XG4gICAgdGhpcy5fbmV4dFN5bmNFdmVudCA9IG51bGw7XG4gICAgdGhpcy5fbmV4dFN5bmNUaW1lID0gSW5maW5pdHk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX3NldFN5bmMoc3luY1RpbWUsIG1ldHJpY1Bvc2l0aW9uLCB0ZW1wbywgdGVtcG9Vbml0LCBldmVudCkge1xuICAgIHRoaXMuX3Jlc2V0U3luYygpO1xuXG4gICAgaWYgKHN5bmNUaW1lIDw9IHRoaXMuc3luY1RpbWUpIHtcbiAgICAgIHRoaXMuX3N5bmNUaW1lID0gc3luY1RpbWU7XG4gICAgICB0aGlzLl9tZXRyaWNQb3NpdGlvbiA9IG1ldHJpY1Bvc2l0aW9uO1xuICAgICAgdGhpcy5fdGVtcG8gPSB0ZW1wbztcbiAgICAgIHRoaXMuX3RlbXBvVW5pdCA9IHRlbXBvVW5pdDtcbiAgICAgIHRoaXMuX21ldHJpY1NwZWVkID0gdGVtcG8gKiB0ZW1wb1VuaXQgLyA2MDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbmV4dFN5bmNFdmVudCA9IHsgc3luY1RpbWUsIG1ldHJpY1Bvc2l0aW9uLCB0ZW1wbywgdGVtcG9Vbml0LCBldmVudCB9O1xuICAgICAgdGhpcy5fbmV4dFN5bmNUaW1lID0gc3luY1RpbWU7XG4gICAgfVxuXG4gICAgdGhpcy5icm9hZGNhc3QobnVsbCwgbnVsbCwgJ3N5bmMnLCBzeW5jVGltZSwgbWV0cmljUG9zaXRpb24sIHRlbXBvLCB0ZW1wb1VuaXQsIGV2ZW50KTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfdXBkYXRlU3luYygpIHtcbiAgICBpZiAodGhpcy5zeW5jVGltZSA+PSB0aGlzLl9uZXh0U3luY1RpbWUpIHtcbiAgICAgIGNvbnN0IHsgc3luY1RpbWUsIG1ldHJpY1Bvc2l0aW9uLCB0ZW1wbywgdGVtcG9Vbml0IH0gPSB0aGlzLl9uZXh0U3luY0V2ZW50O1xuICAgICAgdGhpcy5fc3luY1RpbWUgPSBzeW5jVGltZTtcbiAgICAgIHRoaXMuX21ldHJpY1Bvc2l0aW9uID0gbWV0cmljUG9zaXRpb247XG4gICAgICB0aGlzLl90ZW1wbyA9IHRlbXBvO1xuICAgICAgdGhpcy5fdGVtcG9Vbml0ID0gdGVtcG9Vbml0O1xuICAgICAgdGhpcy5fbWV0cmljU3BlZWQgPSB0ZW1wbyAqIHRlbXBvVW5pdCAvIDYwO1xuICAgICAgdGhpcy5fbmV4dFN5bmNUaW1lID0gSW5maW5pdHk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9vblJlcXVlc3QoY2xpZW50KSB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHRoaXMuX3VwZGF0ZVN5bmMoKTtcbiAgICAgIHRoaXMuc2VuZChjbGllbnQsICdpbml0JywgdGhpcy5fc3luY1RpbWUsIHRoaXMuX21ldHJpY1Bvc2l0aW9uLCB0aGlzLl90ZW1wbywgdGhpcy5fdGVtcG9Vbml0KTtcblxuICAgICAgaWYgKHRoaXMuX25leHRTeW5jVGltZSA8IEluZmluaXR5KSB7XG4gICAgICAgIGNvbnN0IHsgc3luY1RpbWUsIG1ldHJpY1Bvc2l0aW9uLCB0ZW1wbywgdGVtcG9Vbml0LCBldmVudCB9ID0gdGhpcy5fbmV4dFN5bmNFdmVudDtcbiAgICAgICAgdGhpcy5zZW5kKGNsaWVudCwgJ3N5bmMnLCBzeW5jVGltZSwgbWV0cmljUG9zaXRpb24sIHRlbXBvLCB0ZW1wb1VuaXQsIGV2ZW50KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgc3luYyhzeW5jVGltZSwgbWV0cmljUG9zaXRpb24sIHRlbXBvLCB0ZW1wb1VuaXQsIGV2ZW50ID0gdW5kZWZpbmVkKSB7XG4gICAgdGhpcy5fc2V0U3luYyhzeW5jVGltZSwgbWV0cmljUG9zaXRpb24sIHRlbXBvLCB0ZW1wb1VuaXQsIGV2ZW50KTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuYnJvYWRjYXN0KG51bGwsIG51bGwsICdjbGVhcicpO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9zeW5jU2NoZWR1bGVyLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgZ2V0IHN5bmNUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9zeW5jU2NoZWR1bGVyLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgZ2V0IG1ldHJpY1Bvc2l0aW9uKCkge1xuICAgIHRoaXMuX3VwZGF0ZVN5bmMoKTtcblxuICAgIGlmICh0aGlzLl90ZW1wbyA+IDApXG4gICAgICByZXR1cm4gdGhpcy5fbWV0cmljUG9zaXRpb24gKyAodGhpcy5zeW5jVGltZSAtIHRoaXMuX3N5bmNUaW1lKSAqIHRoaXMuX21ldHJpY1NwZWVkO1xuXG4gICAgcmV0dXJuIHRoaXMuX21ldHJpY1Bvc2l0aW9uO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNQb3NpdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDdXJyZW50IHRlbXBvLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gVGVtcG8gaW4gQlBNLlxuICAgKi9cbiAgZ2V0IHRlbXBvKCkge1xuICAgIHRoaXMuX3VwZGF0ZVN5bmMoKTtcbiAgICByZXR1cm4gdGhpcy5fdGVtcG87XG4gIH1cblxuICAvKipcbiAgICogQ3VycmVudCB0ZW1wbyB1bml0LlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gVGVtcG8gdW5pdCBpbiByZXNwZWN0IHRvIHdob2xlIG5vdGUuXG4gICAqL1xuICBnZXQgdGVtcG9Vbml0KCkge1xuICAgIHRoaXMuX3VwZGF0ZVN5bmMoKTtcbiAgICByZXR1cm4gdGhpcy5fdGVtcG9Vbml0O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBtZXRyaWMgcG9zaXRpb24gY29ycnNwb25kaW5nIHRvIGEgZ2l2ZW4gc3luYyB0aW1lIChyZWdhcmRpbmcgdGhlIGN1cnJlbnQgdGVtcG8pLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHRpbWUgLSB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBtZXRyaWMgcG9zaXRpb25cbiAgICovXG4gIGdldE1ldHJpY1Bvc2l0aW9uQXRTeW5jVGltZShzeW5jVGltZSkge1xuICAgIHRoaXMuX3VwZGF0ZVN5bmMoKTtcblxuICAgIGlmICh0aGlzLl90ZW1wbyA+IDApXG4gICAgICByZXR1cm4gdGhpcy5fbWV0cmljUG9zaXRpb24gKyAoc3luY1RpbWUgLSB0aGlzLl9zeW5jVGltZSkgKiB0aGlzLl9tZXRyaWNTcGVlZDtcblxuICAgIHJldHVybiB0aGlzLl9tZXRyaWNQb3NpdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgc3luYyB0aW1lIGNvcnJzcG9uZGluZyB0byBhIGdpdmVuIG1ldHJpYyBwb3NpdGlvbiAocmVnYXJkaW5nIHRoZSBjdXJyZW50IHRlbXBvKS5cbiAgICogQHBhcmFtICB7TnVtYmVyfSBwb3NpdGlvbiAtIG1ldHJpYyBwb3NpdGlvblxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gdGltZVxuICAgKi9cbiAgZ2V0U3luY1RpbWVBdE1ldHJpY1Bvc2l0aW9uKG1ldHJpY1Bvc2l0aW9uKSB7XG4gICAgdGhpcy5fdXBkYXRlU3luYygpO1xuXG4gICAgY29uc3QgbWV0cmljU3BlZWQgPSB0aGlzLl9tZXRyaWNTcGVlZDtcblxuICAgIGlmIChtZXRyaWNQb3NpdGlvbiA8IEluZmluaXR5ICYmIG1ldHJpY1NwZWVkID4gMClcbiAgICAgIHJldHVybiB0aGlzLl9zeW5jVGltZSArIChtZXRyaWNQb3NpdGlvbiAtIHRoaXMuX21ldHJpY1Bvc2l0aW9uKSAvIG1ldHJpY1NwZWVkO1xuXG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGNvbm5lY3QoY2xpZW50KSB7XG4gICAgc3VwZXIuY29ubmVjdChjbGllbnQpO1xuICAgIHRoaXMucmVjZWl2ZShjbGllbnQsICdyZXF1ZXN0JywgdGhpcy5fb25SZXF1ZXN0KGNsaWVudCkpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGRpc2Nvbm5lY3QoY2xpZW50KSB7XG4gICAgc3VwZXIuZGlzY29ubmVjdChjbGllbnQpO1xuICB9XG59XG5cbnNlcnZpY2VNYW5hZ2VyLnJlZ2lzdGVyKFNFUlZJQ0VfSUQsIE1ldHJpY1NjaGVkdWxlcik7XG5cbmV4cG9ydCBkZWZhdWx0IE1ldHJpY1NjaGVkdWxlcjtcbiJdfQ==