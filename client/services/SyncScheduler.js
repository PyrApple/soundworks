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

var _serviceManager = require('../core/serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

var _wavesAudio = require('waves-audio');

var audio = _interopRequireWildcard(_wavesAudio);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audioScheduler = audio.getScheduler();

var SyncTimeSchedulingQueue = function (_audio$SchedulingQueu) {
  (0, _inherits3.default)(SyncTimeSchedulingQueue, _audio$SchedulingQueu);

  function SyncTimeSchedulingQueue(sync, scheduler) {
    (0, _classCallCheck3.default)(this, SyncTimeSchedulingQueue);

    var _this = (0, _possibleConstructorReturn3.default)(this, (SyncTimeSchedulingQueue.__proto__ || (0, _getPrototypeOf2.default)(SyncTimeSchedulingQueue)).call(this));

    _this.sync = sync;
    _this.scheduler = scheduler;
    _this.scheduler.add(_this, Infinity);
    _this.nextSyncTime = Infinity;

    // call this.resync in sync callback
    _this.resync = _this.resync.bind(_this);
    _this.sync.addListener(_this.resync);
    return _this;
  }

  (0, _createClass3.default)(SyncTimeSchedulingQueue, [{
    key: 'advanceTime',
    value: function advanceTime(audioTime) {
      var nextSyncTime = (0, _get3.default)(SyncTimeSchedulingQueue.prototype.__proto__ || (0, _getPrototypeOf2.default)(SyncTimeSchedulingQueue.prototype), 'advanceTime', this).call(this, this.nextSyncTime);
      var nextAudioTime = this.sync.getAudioTime(nextSyncTime);

      this.nextSyncTime = nextSyncTime;

      return nextAudioTime;
    }
  }, {
    key: 'resetTime',
    value: function resetTime(syncTime) {
      if (syncTime === undefined) syncTime = this.sync.getSyncTime();

      this.nextSyncTime = syncTime;

      var audioTime = this.sync.getAudioTime(syncTime);
      this.master.resetEngineTime(this, audioTime);
    }
  }, {
    key: 'resync',
    value: function resync() {
      if (this.nextSyncTime !== Infinity) {
        var nextAudioTime = this.sync.getAudioTime(this.nextSyncTime);
        this.master.resetEngineTime(this, nextAudioTime);
      } else {
        this.master.resetEngineTime(this, Infinity);
      }
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.sync.getSyncTime(this.scheduler.currentTime);
    }
  }]);
  return SyncTimeSchedulingQueue;
}(audio.SchedulingQueue);

var SERVICE_ID = 'service:sync-scheduler';

/**
 * Interface for the client `'sync-scheduler'` service.
 *
 * The `sync-scheduler` provides a scheduler synchronised among all client using the
 * [`sync`]{@link module:soundworks/client.Sync} service.
 *
 * While this service has no direct server counterpart, its dependency on the
 * [`sync`]{@link module:soundworks/client.Sync} service which requires the
 * existence of a server.
 *
 * @param {Object} options
 * @param {Number} [options.period] - Period of the scheduler (defauts to
 *  current value).
 * @param {Number} [options.lookahead] - Lookahead of the scheduler (defauts
 *  to current value).
 *
 * @memberof module:soundworks/client
 * @see [`wavesAudio.Scheduler`]{@link http://wavesjs.github.io/audio/#audio-scheduler}
 * @see [`platform` service]{@link module:soundworks/client.Platform}
 * @see [`sync` service]{@link module:soundworks/client.Sync}
 *
 * @example
 * // inside the experience constructor
 * this.syncScheduler = this.require('scheduler');
 *
 * // when the experience has started
 * const nextSyncTime = this.syncScheduler.current + 2;
 * this.syncScheduler.add(timeEngine, nextSyncTime);
 */

var SyncScheduler = function (_Service) {
  (0, _inherits3.default)(SyncScheduler, _Service);

  /** _<span class="warning">__WARNING__</span> This class should never be instanciated manually_ */
  function SyncScheduler() {
    (0, _classCallCheck3.default)(this, SyncScheduler);

    // initialize sync option
    var _this2 = (0, _possibleConstructorReturn3.default)(this, (SyncScheduler.__proto__ || (0, _getPrototypeOf2.default)(SyncScheduler)).call(this, SERVICE_ID, false));

    _this2._sync = null;
    _this2._syncedQueue = null;

    // init audio time based scheduler, sync service, and queue
    _this2._platform = _this2.require('platform', { features: 'web-audio' });
    _this2._sync = _this2.require('sync');
    _this2._syncedQueue = null;
    return _this2;
  }

  /** @private */


  (0, _createClass3.default)(SyncScheduler, [{
    key: 'start',
    value: function start() {
      (0, _get3.default)(SyncScheduler.prototype.__proto__ || (0, _getPrototypeOf2.default)(SyncScheduler.prototype), 'start', this).call(this);

      if (!this.hasStarted) this.init();

      this._syncedQueue = new SyncTimeSchedulingQueue(this._sync, audioScheduler);

      this.ready();
    }
  }, {
    key: 'getSyncTimeAtAudioTime',


    /**
     * Get sync time corresponding to given audio time.
     * @param  {Number} audioTime - audio time.
     * @return {Number} - sync time corresponding to given audio time.
     */
    value: function getSyncTimeAtAudioTime(audioTime) {
      return this._sync.getSyncTime(audioTime);
    }

    /**
     * Get audio time corresponding to given sync time.
     * @param  {Number} syncTime - sync time.
     * @return {Number} - audio time corresponding to given sync time.
     */

  }, {
    key: 'getAudioTimeAtSyncTime',
    value: function getAudioTimeAtSyncTime(syncTime) {
      return this._sync.getAudioTime(syncTime);
    }

    /**
     * Call a function at a given time.
     *
     * @param {Function} fun - Function to be deferred.
     * @param {Number} time - The time at which the function should be executed.
     * @param {Boolean} [lookahead=false] - Defines whether the function is called
     *  anticipated (e.g. for audio events) or precisely at the given time (default).
     */

  }, {
    key: 'defer',
    value: function defer(fun, time) {
      var lookahead = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      var scheduler = this._syncedQueue;
      var schedulerService = this;
      var engine = void 0;

      if (lookahead) {
        scheduler.defer(fun, time);
      } else {
        engine = {
          advanceTime: function advanceTime(time) {
            var delta = schedulerService.deltaTime;

            if (delta > 0) setTimeout(fun, 1000 * delta, time); // bridge scheduler lookahead with timeout
            else fun(time);
          }
        };

        scheduler.add(engine, time); // add without checks
      }
    }

    /**
     * Add a time engine to the queue.
     *
     * @param {Function} engine - Engine to schedule.
     * @param {Number} time - The time at which the function should be executed.
     */

  }, {
    key: 'add',
    value: function add(engine, time) {
      this._syncedQueue.add(engine, time);
    }

    /**
     * Remove the given engine from the queue.
     *
     * @param {Function} engine - Engine to remove from the scheduler.
     */

  }, {
    key: 'remove',
    value: function remove(engine) {
      this._syncedQueue.remove(engine);
    }

    /**
     * Remove all scheduled functions and time engines from the scheduler.
     */

  }, {
    key: 'clear',
    value: function clear() {
      this._syncedQueue.clear();
    }
  }, {
    key: 'audioTime',
    get: function get() {
      return audioScheduler.currentTime;
    }

    /**
     * Current sync time of the scheduler.
     */

  }, {
    key: 'syncTime',
    get: function get() {
      return this._syncedQueue.currentTime;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this._syncScheduler.currentTime;
    }

    /**
     * Difference between the scheduler's logical audio time and the `currentTime`
     * of the audio context.
     */

  }, {
    key: 'deltaTime',
    get: function get() {
      return audioScheduler.currentTime - audio.audioContext.currentTime;
    }
  }]);
  return SyncScheduler;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, SyncScheduler);

exports.default = SyncScheduler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlN5bmNTY2hlZHVsZXIuanMiXSwibmFtZXMiOlsiYXVkaW8iLCJhdWRpb1NjaGVkdWxlciIsImdldFNjaGVkdWxlciIsIlN5bmNUaW1lU2NoZWR1bGluZ1F1ZXVlIiwic3luYyIsInNjaGVkdWxlciIsImFkZCIsIkluZmluaXR5IiwibmV4dFN5bmNUaW1lIiwicmVzeW5jIiwiYmluZCIsImFkZExpc3RlbmVyIiwiYXVkaW9UaW1lIiwibmV4dEF1ZGlvVGltZSIsImdldEF1ZGlvVGltZSIsInN5bmNUaW1lIiwidW5kZWZpbmVkIiwiZ2V0U3luY1RpbWUiLCJtYXN0ZXIiLCJyZXNldEVuZ2luZVRpbWUiLCJjdXJyZW50VGltZSIsIlNjaGVkdWxpbmdRdWV1ZSIsIlNFUlZJQ0VfSUQiLCJTeW5jU2NoZWR1bGVyIiwiX3N5bmMiLCJfc3luY2VkUXVldWUiLCJfcGxhdGZvcm0iLCJyZXF1aXJlIiwiZmVhdHVyZXMiLCJoYXNTdGFydGVkIiwiaW5pdCIsInJlYWR5IiwiZnVuIiwidGltZSIsImxvb2thaGVhZCIsInNjaGVkdWxlclNlcnZpY2UiLCJlbmdpbmUiLCJkZWZlciIsImFkdmFuY2VUaW1lIiwiZGVsdGEiLCJkZWx0YVRpbWUiLCJzZXRUaW1lb3V0IiwicmVtb3ZlIiwiY2xlYXIiLCJfc3luY1NjaGVkdWxlciIsImF1ZGlvQ29udGV4dCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7Ozs7OztBQUNaLElBQU1DLGlCQUFpQkQsTUFBTUUsWUFBTixFQUF2Qjs7SUFFTUMsdUI7OztBQUNKLG1DQUFZQyxJQUFaLEVBQWtCQyxTQUFsQixFQUE2QjtBQUFBOztBQUFBOztBQUczQixVQUFLRCxJQUFMLEdBQVlBLElBQVo7QUFDQSxVQUFLQyxTQUFMLEdBQWlCQSxTQUFqQjtBQUNBLFVBQUtBLFNBQUwsQ0FBZUMsR0FBZixRQUF5QkMsUUFBekI7QUFDQSxVQUFL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QVQsRUFBZTtBQUMxQixnQkFBTU0sUUFBUUosaUJBQWlCSyxTQUEvQjs7QUFFQSxnQkFBR0QsUUFBUSxDQUFYLEVBQ0VFLFdBQVdULEdBQVgsRUFBZ0IsT0FBT08sS0FBdkIsRUFBOEJOLElBQTlCLEVBREYsQ0FDdUM7QUFEdkMsaUJBR0VELElBQUlDLElBQUo7QUFDSDtBQVJNLFNBQVQ7O0FBV0E1QixrQkFBVUMsR0FBVixDQUFjOEIsTUFBZCxFQUFzQkgsSUFBdEIsRUFaSyxDQVl3QjtBQUM5QjtBQUNGOztBQUVEOzs7Ozs7Ozs7d0JBTUlHLE0sRUFBUUgsSSxFQUFNO0FBQ2hCLFdBQUtSLFlBQUwsQ0FBa0JuQixHQUFsQixDQUFzQjhCLE1BQXRCLEVBQThCSCxJQUE5QjtBQUNEOztBQUVEOzs7Ozs7OzsyQkFLT0csTSxFQUFRO0FBQ2IsV0FBS1gsWUFBTCxDQUFrQmlCLE1BQWxCLENBQXlCTixNQUF6QjtBQUNEOztBQUVEOzs7Ozs7NEJBR1E7QUFDTixXQUFLWCxZQUFMLENBQWtCa0IsS0FBbEI7QUFDRDs7O3dCQWhHZTtBQUNkLGFBQU8xQyxlQUFlbUIsV0FBdEI7QUFDRDs7QUFFRDs7Ozs7O3dCQUdlO0FBQ2IsYUFBTyxLQUFLSyxZQUFMLENBQWtCTCxXQUF6QjtBQUNEOzs7d0JBRWlCO0FBQ2hCLGFBQU8sS0FBS3dCLGNBQUwsQ0FBb0J4QixXQUEzQjtBQUNEOztBQUVEOzs7Ozs7O3dCQUlnQjtBQUNkLGFBQU9uQixlQUFlbUIsV0FBZixHQUE2QnBCLE1BQU02QyxZQUFOLENBQW1CekIsV0FBdkQ7QUFDRDs7Ozs7QUE4RUgseUJBQWUwQixRQUFmLENBQXdCeEIsVUFBeEIsRUFBb0NDLGFBQXBDOztrQkFFZUEsYSIsImZpbGUiOiJTeW5jU2NoZWR1bGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNlcnZpY2UgZnJvbSAnLi4vY29yZS9TZXJ2aWNlJztcbmltcG9ydCBzZXJ2aWNlTWFuYWdlciBmcm9tICcuLi9jb3JlL3NlcnZpY2VNYW5hZ2VyJztcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJ3dhdmVzLWF1ZGlvJztcbmNvbnN0IGF1ZGlvU2NoZWR1bGVyID0gYXVkaW8uZ2V0U2NoZWR1bGVyKCk7XG5cbmNsYXNzIFN5bmNUaW1lU2NoZWR1bGluZ1F1ZXVlIGV4dGVuZHMgYXVkaW8uU2NoZWR1bGluZ1F1ZXVlIHtcbiAgY29uc3RydWN0b3Ioc3luYywgc2NoZWR1bGVyKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuc3luYyA9IHN5bmM7XG4gICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgdGhpcy5zY2hlZHVsZXIuYWRkKHRoaXMsIEluZmluaXR5KTtcbiAgICB0aGlzLm5leHRTeW5jVGltZSA9IEluZmluaXR5O1xuXG4gICAgLy8gY2FsbCB0aGlzLnJlc3luYyBpbiBzeW5jIGNhbGxiYWNrXG4gICAgdGhpcy5yZXN5bmMgPSB0aGlzLnJlc3luYy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc3luYy5hZGRMaXN0ZW5lcih0aGlzLnJlc3luYyk7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUgKCkge1xuICAgIHJldHVybiB0aGlzLnN5bmMuZ2V0U3luY1RpbWUodGhpcy5zY2hlZHVsZXIuY3VycmVudFRpbWUpO1xuICB9XG5cbiAgYWR2YW5jZVRpbWUoYXVkaW9UaW1lKSB7XG4gICAgY29uc3QgbmV4dFN5bmNUaW1lID0gc3VwZXIuYWR2YW5jZVRpbWUodGhpcy5uZXh0U3luY1RpbWUpO1xuICAgIGNvbnN0IG5leHRBdWRpb1RpbWUgPSB0aGlzLnN5bmMuZ2V0QXVkaW9UaW1lKG5leHRTeW5jVGltZSk7XG5cbiAgICB0aGlzLm5leHRTeW5jVGltZSA9IG5leHRTeW5jVGltZTtcblxuICAgIHJldHVybiBuZXh0QXVkaW9UaW1lO1xuICB9XG5cbiAgcmVzZXRUaW1lKHN5bmNUaW1lKSB7XG4gICAgaWYgKHN5bmNUaW1lID09PSB1bmRlZmluZWQpXG4gICAgICBzeW5jVGltZSA9IHRoaXMuc3luYy5nZXRTeW5jVGltZSgpO1xuXG4gICAgdGhpcy5uZXh0U3luY1RpbWUgPSBzeW5jVGltZTtcblxuICAgIGNvbnN0IGF1ZGlvVGltZSA9IHRoaXMuc3luYy5nZXRBdWRpb1RpbWUoc3luY1RpbWUpO1xuICAgIHRoaXMubWFzdGVyLnJlc2V0RW5naW5lVGltZSh0aGlzLCBhdWRpb1RpbWUpO1xuICB9XG5cbiAgcmVzeW5jKCkge1xuICAgIGlmICh0aGlzLm5leHRTeW5jVGltZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgIGNvbnN0IG5leHRBdWRpb1RpbWUgPSB0aGlzLnN5bmMuZ2V0QXVkaW9UaW1lKHRoaXMubmV4dFN5bmNUaW1lKTtcbiAgICAgIHRoaXMubWFzdGVyLnJlc2V0RW5naW5lVGltZSh0aGlzLCBuZXh0QXVkaW9UaW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5tYXN0ZXIucmVzZXRFbmdpbmVUaW1lKHRoaXMsIEluZmluaXR5KTtcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgU0VSVklDRV9JRCA9ICdzZXJ2aWNlOnN5bmMtc2NoZWR1bGVyJztcblxuLyoqXG4gKiBJbnRlcmZhY2UgZm9yIHRoZSBjbGllbnQgYCdzeW5jLXNjaGVkdWxlcidgIHNlcnZpY2UuXG4gKlxuICogVGhlIGBzeW5jLXNjaGVkdWxlcmAgcHJvdmlkZXMgYSBzY2hlZHVsZXIgc3luY2hyb25pc2VkIGFtb25nIGFsbCBjbGllbnQgdXNpbmcgdGhlXG4gKiBbYHN5bmNgXXtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuU3luY30gc2VydmljZS5cbiAqXG4gKiBXaGlsZSB0aGlzIHNlcnZpY2UgaGFzIG5vIGRpcmVjdCBzZXJ2ZXIgY291bnRlcnBhcnQsIGl0cyBkZXBlbmRlbmN5IG9uIHRoZVxuICogW2BzeW5jYF17QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlN5bmN9IHNlcnZpY2Ugd2hpY2ggcmVxdWlyZXMgdGhlXG4gKiBleGlzdGVuY2Ugb2YgYSBzZXJ2ZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wZXJpb2RdIC0gUGVyaW9kIG9mIHRoZSBzY2hlZHVsZXIgKGRlZmF1dHMgdG9cbiAqICBjdXJyZW50IHZhbHVlKS5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5sb29rYWhlYWRdIC0gTG9va2FoZWFkIG9mIHRoZSBzY2hlZHVsZXIgKGRlZmF1dHNcbiAqICB0byBjdXJyZW50IHZhbHVlKS5cbiAqXG4gKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50XG4gKiBAc2VlIFtgd2F2ZXNBdWRpby5TY2hlZHVsZXJgXXtAbGluayBodHRwOi8vd2F2ZXNqcy5naXRodWIuaW8vYXVkaW8vI2F1ZGlvLXNjaGVkdWxlcn1cbiAqIEBzZWUgW2BwbGF0Zm9ybWAgc2VydmljZV17QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlBsYXRmb3JtfVxuICogQHNlZSBbYHN5bmNgIHNlcnZpY2Vde0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5TeW5jfVxuICpcbiAqIEBleGFtcGxlXG4gKiAvLyBpbnNpZGUgdGhlIGV4cGVyaWVuY2UgY29uc3RydWN0b3JcbiAqIHRoaXMuc3luY1NjaGVkdWxlciA9IHRoaXMucmVxdWlyZSgnc2NoZWR1bGVyJyk7XG4gKlxuICogLy8gd2hlbiB0aGUgZXhwZXJpZW5jZSBoYXMgc3RhcnRlZFxuICogY29uc3QgbmV4dFN5bmNUaW1lID0gdGhpcy5zeW5jU2NoZWR1bGVyLmN1cnJlbnQgKyAyO1xuICogdGhpcy5zeW5jU2NoZWR1bGVyLmFkZCh0aW1lRW5naW5lLCBuZXh0U3luY1RpbWUpO1xuICovXG5jbGFzcyBTeW5jU2NoZWR1bGVyIGV4dGVuZHMgU2VydmljZSB7XG4gIC8qKiBfPHNwYW4gY2xhc3M9XCJ3YXJuaW5nXCI+X19XQVJOSU5HX188L3NwYW4+IFRoaXMgY2xhc3Mgc2hvdWxkIG5ldmVyIGJlIGluc3RhbmNpYXRlZCBtYW51YWxseV8gKi9cbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKFNFUlZJQ0VfSUQsIGZhbHNlKTtcblxuICAgIC8vIGluaXRpYWxpemUgc3luYyBvcHRpb25cbiAgICB0aGlzLl9zeW5jID0gbnVsbDtcbiAgICB0aGlzLl9zeW5jZWRRdWV1ZSA9IG51bGw7XG5cbiAgICAvLyBpbml0IGF1ZGlvIHRpbWUgYmFzZWQgc2NoZWR1bGVyLCBzeW5jIHNlcnZpY2UsIGFuZCBxdWV1ZVxuICAgIHRoaXMuX3BsYXRmb3JtID0gdGhpcy5yZXF1aXJlKCdwbGF0Zm9ybScsIHsgZmVhdHVyZXM6ICd3ZWItYXVkaW8nIH0pO1xuICAgIHRoaXMuX3N5bmMgPSB0aGlzLnJlcXVpcmUoJ3N5bmMnKTtcbiAgICB0aGlzLl9zeW5jZWRRdWV1ZSA9IG51bGw7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTtcblxuICAgIGlmICghdGhpcy5oYXNTdGFydGVkKVxuICAgICAgdGhpcy5pbml0KCk7XG5cbiAgICB0aGlzLl9zeW5jZWRRdWV1ZSA9IG5ldyBTeW5jVGltZVNjaGVkdWxpbmdRdWV1ZSh0aGlzLl9zeW5jLCBhdWRpb1NjaGVkdWxlcik7XG5cbiAgICB0aGlzLnJlYWR5KCk7XG4gIH1cblxuICBnZXQgYXVkaW9UaW1lKCkge1xuICAgIHJldHVybiBhdWRpb1NjaGVkdWxlci5jdXJyZW50VGltZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDdXJyZW50IHN5bmMgdGltZSBvZiB0aGUgc2NoZWR1bGVyLlxuICAgKi9cbiAgZ2V0IHN5bmNUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9zeW5jZWRRdWV1ZS5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fc3luY1NjaGVkdWxlci5jdXJyZW50VGltZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaWZmZXJlbmNlIGJldHdlZW4gdGhlIHNjaGVkdWxlcidzIGxvZ2ljYWwgYXVkaW8gdGltZSBhbmQgdGhlIGBjdXJyZW50VGltZWBcbiAgICogb2YgdGhlIGF1ZGlvIGNvbnRleHQuXG4gICAqL1xuICBnZXQgZGVsdGFUaW1lKCkge1xuICAgIHJldHVybiBhdWRpb1NjaGVkdWxlci5jdXJyZW50VGltZSAtIGF1ZGlvLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgc3luYyB0aW1lIGNvcnJlc3BvbmRpbmcgdG8gZ2l2ZW4gYXVkaW8gdGltZS5cbiAgICogQHBhcmFtICB7TnVtYmVyfSBhdWRpb1RpbWUgLSBhdWRpbyB0aW1lLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gc3luYyB0aW1lIGNvcnJlc3BvbmRpbmcgdG8gZ2l2ZW4gYXVkaW8gdGltZS5cbiAgICovXG4gIGdldFN5bmNUaW1lQXRBdWRpb1RpbWUoYXVkaW9UaW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX3N5bmMuZ2V0U3luY1RpbWUoYXVkaW9UaW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYXVkaW8gdGltZSBjb3JyZXNwb25kaW5nIHRvIGdpdmVuIHN5bmMgdGltZS5cbiAgICogQHBhcmFtICB7TnVtYmVyfSBzeW5jVGltZSAtIHN5bmMgdGltZS5cbiAgICogQHJldHVybiB7TnVtYmVyfSAtIGF1ZGlvIHRpbWUgY29ycmVzcG9uZGluZyB0byBnaXZlbiBzeW5jIHRpbWUuXG4gICAqL1xuICBnZXRBdWRpb1RpbWVBdFN5bmNUaW1lKHN5bmNUaW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX3N5bmMuZ2V0QXVkaW9UaW1lKHN5bmNUaW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIGEgZnVuY3Rpb24gYXQgYSBnaXZlbiB0aW1lLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW4gLSBGdW5jdGlvbiB0byBiZSBkZWZlcnJlZC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgLSBUaGUgdGltZSBhdCB3aGljaCB0aGUgZnVuY3Rpb24gc2hvdWxkIGJlIGV4ZWN1dGVkLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtsb29rYWhlYWQ9ZmFsc2VdIC0gRGVmaW5lcyB3aGV0aGVyIHRoZSBmdW5jdGlvbiBpcyBjYWxsZWRcbiAgICogIGFudGljaXBhdGVkIChlLmcuIGZvciBhdWRpbyBldmVudHMpIG9yIHByZWNpc2VseSBhdCB0aGUgZ2l2ZW4gdGltZSAoZGVmYXVsdCkuXG4gICAqL1xuICBkZWZlcihmdW4sIHRpbWUsIGxvb2thaGVhZCA9IGZhbHNlKSB7XG4gICAgY29uc3Qgc2NoZWR1bGVyID0gdGhpcy5fc3luY2VkUXVldWU7XG4gICAgY29uc3Qgc2NoZWR1bGVyU2VydmljZSA9IHRoaXM7XG4gICAgbGV0IGVuZ2luZTtcblxuICAgIGlmKGxvb2thaGVhZCkge1xuICAgICAgc2NoZWR1bGVyLmRlZmVyKGZ1biwgdGltZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVuZ2luZSA9IHtcbiAgICAgICAgYWR2YW5jZVRpbWU6IGZ1bmN0aW9uKHRpbWUpIHtcbiAgICAgICAgICBjb25zdCBkZWx0YSA9IHNjaGVkdWxlclNlcnZpY2UuZGVsdGFUaW1lO1xuXG4gICAgICAgICAgaWYoZGVsdGEgPiAwKVxuICAgICAgICAgICAgc2V0VGltZW91dChmdW4sIDEwMDAgKiBkZWx0YSwgdGltZSk7IC8vIGJyaWRnZSBzY2hlZHVsZXIgbG9va2FoZWFkIHdpdGggdGltZW91dFxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZ1bih0aW1lKTtcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIHNjaGVkdWxlci5hZGQoZW5naW5lLCB0aW1lKTsgLy8gYWRkIHdpdGhvdXQgY2hlY2tzXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHRpbWUgZW5naW5lIHRvIHRoZSBxdWV1ZS5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZW5naW5lIC0gRW5naW5lIHRvIHNjaGVkdWxlLlxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSAtIFRoZSB0aW1lIGF0IHdoaWNoIHRoZSBmdW5jdGlvbiBzaG91bGQgYmUgZXhlY3V0ZWQuXG4gICAqL1xuICBhZGQoZW5naW5lLCB0aW1lKSB7XG4gICAgdGhpcy5fc3luY2VkUXVldWUuYWRkKGVuZ2luZSwgdGltZSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBnaXZlbiBlbmdpbmUgZnJvbSB0aGUgcXVldWUuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGVuZ2luZSAtIEVuZ2luZSB0byByZW1vdmUgZnJvbSB0aGUgc2NoZWR1bGVyLlxuICAgKi9cbiAgcmVtb3ZlKGVuZ2luZSkge1xuICAgIHRoaXMuX3N5bmNlZFF1ZXVlLnJlbW92ZShlbmdpbmUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgc2NoZWR1bGVkIGZ1bmN0aW9ucyBhbmQgdGltZSBlbmdpbmVzIGZyb20gdGhlIHNjaGVkdWxlci5cbiAgICovXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuX3N5bmNlZFF1ZXVlLmNsZWFyKCk7XG4gIH1cbn1cblxuc2VydmljZU1hbmFnZXIucmVnaXN0ZXIoU0VSVklDRV9JRCwgU3luY1NjaGVkdWxlcik7XG5cbmV4cG9ydCBkZWZhdWx0IFN5bmNTY2hlZHVsZXI7XG4iXX0=