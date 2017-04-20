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

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _Service2 = require('../core/Service');

var _Service3 = _interopRequireDefault(_Service2);

var _serviceManager = require('../core/serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

var _wavesAudio = require('waves-audio');

var audio = _interopRequireWildcard(_wavesAudio);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SERVICE_ID = 'service:audio-scheduler';

/**
 * Interface for the client `'audio-scheduler'` service.
 *
 * The `audio-scheduler` provides an access to the basic audio scheduler using the
 * scheduler provided by the [`wavesjs`]{@link https://github.com/wavesjs/audio}
 * library.
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
 *
 * @example
 * // inside the experience constructor
 * this.audioScheduler = this.require('audio-scheduler');
 *
 * // when the experience has started
 * const nextTime = this.audioScheduler.currentTime + 2;
 * this.audioScheduler.add(timeEngine, nextTime);
 */

var AudioScheduler = function (_Service) {
  (0, _inherits3.default)(AudioScheduler, _Service);

  /** _<span class="warning">__WARNING__</span> This class should never be instanciated manually_ */
  function AudioScheduler() {
    (0, _classCallCheck3.default)(this, AudioScheduler);

    var _this = (0, _possibleConstructorReturn3.default)(this, (AudioScheduler.__proto__ || (0, _getPrototypeOf2.default)(AudioScheduler)).call(this, SERVICE_ID, false));

    _this._platform = _this.require('platform', { features: 'web-audio' });

    // initialize sync option
    _this._sync = null;
    _this._syncedQueue = null;

    // get audio time based scheduler
    _this._scheduler = audio.getScheduler();

    var defaults = {
      lookahead: _this._scheduler.lookahead,
      period: _this._scheduler.period
    };

    // call super.configure (activate sync option only if required)
    (0, _get3.default)(AudioScheduler.prototype.__proto__ || (0, _getPrototypeOf2.default)(AudioScheduler.prototype), 'configure', _this).call(_this, defaults);
    return _this;
  }

  /**
   * Override default `configure` to configure the scheduler.
   *
   * @param {Object} options - The options to apply to the service.
   * @private
   */


  (0, _createClass3.default)(AudioScheduler, [{
    key: 'configure',
    value: function configure(options) {
      // check and set scheduler period option
      if (options.period !== undefined) {
        if (options.period > 0.010) this._scheduler.period = options.period;else throw new Error('Invalid scheduler period: ' + options.period);
      }

      // check and set scheduler lookahead option
      if (options.lookahead !== undefined) {
        if (options.lookahead > 0.010) this._scheduler.lookahead = options.lookahead;else throw new Error('Invalid scheduler lookahead: ' + options.lookahead);
      }

      (0, _get3.default)(AudioScheduler.prototype.__proto__ || (0, _getPrototypeOf2.default)(AudioScheduler.prototype), 'configure', this).call(this, options);
    }

    /** @private */

  }, {
    key: 'start',
    value: function start() {
      (0, _get3.default)(AudioScheduler.prototype.__proto__ || (0, _getPrototypeOf2.default)(AudioScheduler.prototype), 'start', this).call(this);

      if (!this.hasStarted) this.init();

      this.ready();
    }
  }, {
    key: 'defer',


    /**
     * Call a function at a given time.
     *
     * @param {Function} fun - Function to be deferred.
     * @param {Number} time - The time at which the function should be executed.
     * @param {Boolean} [lookahead=false] - Defines whether the function is called
     *  anticipated (e.g. for audio events) or precisely at the given time (default).
     */
    value: function defer(fun, time) {
      var lookahead = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      var scheduler = this._scheduler;
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
      this._scheduler.add(engine, time);
    }

    /**
     * Remove the given engine from the queue.
     *
     * @param {Function} engine - Engine to remove from the scheduler.
     */

  }, {
    key: 'remove',
    value: function remove(engine) {
      this._scheduler.remove(engine);
    }

    /**
     * Remove all scheduled functions and time engines (synchronized or not) from
     * the scheduler.
     */

  }, {
    key: 'clear',
    value: function clear() {
      this._scheduler.clear();
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return audioScheduler.currentTime;
    }

    /**
     * Current audio time of the scheduler.
     */

  }, {
    key: 'audioTime',
    get: function get() {
      return this._scheduler.currentTime;
    }

    /**
     * Difference between the scheduler's logical audio time and the `currentTime`
     * of the audio context.
     */

  }, {
    key: 'deltaTime',
    get: function get() {
      return this._scheduler.currentTime - audio.audioContext.currentTime;
    }
  }]);
  return AudioScheduler;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, AudioScheduler);

exports.default = AudioScheduler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1ZGlvU2NoZWR1bGVyLmpzIl0sIm5hbWVzIjpbImF1ZGlvIiwiU0VSVklDRV9JRCIsIkF1ZGlvU2NoZWR1bGVyIiwiX3BsYXRmb3JtIiwicmVxdWlyZSIsImZlYXR1cmVzIiwiX3N5bmMiLCJfc3luY2VkUXVldWUiLCJfc2NoZWR1bGVyIiwiZ2V0U2NoZWR1bGVyIiwiZGVmYXVsdHMiLCJsb29rYWhlYWQiLCJwZXJpb2QiLCJvcHRpb25zIiwidW5kZWZpbmVkIiwiRXJyb3IiLCJoYXNTdGFydGVkIiwiaW5pdCIsInJlYWR5IiwiZnVuIiwidGltZSIsInNjaGVkdWxlciIsInNjaGVkdWxlclNlcnZpY2UiLCJlbmdpbmUiLCJkZWZlciIsImFkdmFuY2VUaW1lIiwiZGVsdGEiLCJkZWx0YVRpbWUiLCJzZXRUaW1lb3V0IiwiYWRkIiwicmVtb3ZlIiwiY2xlYXIiLCJhdWRpb1NjaGVkdWxlciIsImN1cnJlbnRUaW1lIiwiYXVkaW9Db250ZXh0IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7Ozs7O0FBRVosSUFBTUMsYUFBYSx5QkFBbkI7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBeUJNQyxjOzs7QUFDSjtBQUNBLDRCQUFlO0FBQUE7O0FBQUEsc0pBQ1BELFVBRE8sRUFDSyxLQURMOztBQUdiLFVBQUtFLFNBQUwsR0FBaUIsTUFBS0MsT0FBTCxDQUFhLFVBQWIsRUFBeUIsRUFBRUMsVUFBVSxXQUFaLEVBQXpCLENBQWpCOztBQUVBO0FBQ0EsVUFBS0MsS0FBTCxHQUFhLElBQWI7QUFDQSxVQUFLQyxZQUFMLEdBQW9CLElBQXBCOztBQUVBO0FBQ0EsVUFBS0MsVUFBTCxHQUFrQlIsTUFBTVMsWUFBTixFQUFsQjs7QUFFQSxRQUFNQyxXQUFXO0FBQ2ZDLGlCQUFXLE1BQUtILFVBQUwsQ0FBZ0JHLFNBRFo7QUFFZkMsY0FBUSxNQUFLSixVQUFMLENBQWdCSTtBQUZULEtBQWpCOztBQUtBO0FBQ0Esc0pBQWdCRixRQUFoQjtBQWxCYTtBQW1CZDs7QUFFRDs7Ozs7Ozs7Ozs4QkFNVUcsTyxFQUFTO0FBQ2pCO0FBQ0EsVUFBSUEsUUFBUUQsTUFBUixLQUFtQkUsU0FBdkIsRUFBa0M7QUFDaEMsWUFBSUQsUUFBUUQsTUFBUixHQUFpQixLQUFyQixFQUNFLEtBQUtKLFVBQUwsQ0FBZ0JJLE1BQWhCLEdBQXlCQyxRQUFRRCxNQUFqQyxDQURGLEtBR0UsTUFBTSxJQUFJRyxLQUFKLGdDQUF1Q0YsUUFBUUQsTUFBL0MsQ0FBTjtBQUNIOztBQUVEO0FBQ0EsVUFBSUMsUUFBUUYsU0FBUixLQUFzQkcsU0FBMUIsRUFBcUM7QUFDbkMsWUFBSUQsUUFBUUYsU0FBUixHQUFvQixLQUF4QixFQUNFLEtBQUtILFVBQUwsQ0FBZ0JHLFNBQWhCLEdBQTRCRSxRQUFRRixTQUFwQyxDQURGLEtBR0UsTUFBTSxJQUFJSSxLQUFKLG1DQUEwQ0YsUUFBUUYsU0FBbEQsQ0FBTjtBQUNIOztBQUVELHNKQUFnQkUsT0FBaEI7QUFDRDs7QUFFRDs7Ozs0QkFDUTtBQUNOOztBQUVBLFVBQUksQ0FBQyxLQUFLRyxVQUFWLEVBQ0UsS0FBS0MsSUFBTDs7QUFFRixXQUFLQyxLQUFMO0FBQ0Q7Ozs7O0FBcUJEOzs7Ozs7OzswQkFRTUMsRyxFQUFLQyxJLEVBQXlCO0FBQUEsVUFBbkJULFNBQW1CLHVFQUFQLEtBQU87O0FBQ2xDLFVBQU1VLFlBQVksS0FBS2IsVUFBdkI7QUFDQSxVQUFNYyxtQkFBbUIsSUFBekI7QUFDQSxVQUFJQyxlQUFKOztBQUVBLFVBQUdaLFNBQUgsRUFBYztBQUNaVSxrQkFBVUcsS0FBVixDQUFnQkwsR0FBaEIsRUFBcUJDLElBQXJCO0FBQ0QsT0FGRCxNQUVPO0FBQ0xHLGlCQUFTO0FBQ1BFLHVCQUFhLHFCQUFTTCxJQUFULEVBQWU7QUFDMUIsZ0JBQU1NLFFBQVFKLGlCQUFpQkssU0FBL0I7O0FBRUEsZ0JBQUdELFFBQVEsQ0FBWCxFQUNFRSxXQUFXVCxHQUFYLEVBQWdCLE9BQU9PLEtBQXZCLEVBQThCTixJQUE5QixFQURGLENBQ3VDO0FBRHZDLGlCQUdFRCxJQUFJQyxJQUFKO0FBQ0g7QUFSTSxTQUFUOztBQVdBQyxrQkFBVVEsR0FBVixDQUFjTixNQUFkLEVBQXNCSCxJQUF0QixFQVpLLENBWXdCO0FBQzlCO0FBQ0Y7O0FBRUQ7Ozs7Ozs7Ozt3QkFNSUcsTSxFQUFRSCxJLEVBQU07QUFDaEIsV0FBS1osVUFBTCxDQUFnQnFCLEdBQWhCLENBQW9CTixNQUFwQixFQUE0QkgsSUFBNUI7QUFDRDs7QUFFRDs7Ozs7Ozs7MkJBS09HLE0sRUFBUTtBQUNiLFdBQUtmLFVBQUwsQ0FBZ0JzQixNQUFoQixDQUF1QlAsTUFBdkI7QUFDRDs7QUFFRDs7Ozs7Ozs0QkFJUTtBQUNOLFdBQUtmLFVBQUwsQ0FBZ0J1QixLQUFoQjtBQUNEOzs7d0JBM0VpQjtBQUNoQixhQUFPQyxlQUFlQyxXQUF0QjtBQUNEOztBQUVEOzs7Ozs7d0JBR2dCO0FBQ2QsYUFBTyxLQUFLekIsVUFBTCxDQUFnQnlCLFdBQXZCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7d0JBSWdCO0FBQ2QsYUFBTyxLQUFLekIsVUFBTCxDQUFnQnlCLFdBQWhCLEdBQThCakMsTUFBTWtDLFlBQU4sQ0FBbUJELFdBQXhEO0FBQ0Q7Ozs7O0FBNkRILHlCQUFlRSxRQUFmLENBQXdCbEMsVUFBeEIsRUFBb0NDLGNBQXBDOztrQkFFZUEsYyIsImZpbGUiOiJBdWRpb1NjaGVkdWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTZXJ2aWNlIGZyb20gJy4uL2NvcmUvU2VydmljZSc7XG5pbXBvcnQgc2VydmljZU1hbmFnZXIgZnJvbSAnLi4vY29yZS9zZXJ2aWNlTWFuYWdlcic7XG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICd3YXZlcy1hdWRpbyc7XG5cbmNvbnN0IFNFUlZJQ0VfSUQgPSAnc2VydmljZTphdWRpby1zY2hlZHVsZXInO1xuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIGNsaWVudCBgJ2F1ZGlvLXNjaGVkdWxlcidgIHNlcnZpY2UuXG4gKlxuICogVGhlIGBhdWRpby1zY2hlZHVsZXJgIHByb3ZpZGVzIGFuIGFjY2VzcyB0byB0aGUgYmFzaWMgYXVkaW8gc2NoZWR1bGVyIHVzaW5nIHRoZVxuICogc2NoZWR1bGVyIHByb3ZpZGVkIGJ5IHRoZSBbYHdhdmVzanNgXXtAbGluayBodHRwczovL2dpdGh1Yi5jb20vd2F2ZXNqcy9hdWRpb31cbiAqIGxpYnJhcnkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wZXJpb2RdIC0gUGVyaW9kIG9mIHRoZSBzY2hlZHVsZXIgKGRlZmF1dHMgdG9cbiAqICBjdXJyZW50IHZhbHVlKS5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5sb29rYWhlYWRdIC0gTG9va2FoZWFkIG9mIHRoZSBzY2hlZHVsZXIgKGRlZmF1dHNcbiAqICB0byBjdXJyZW50IHZhbHVlKS5cbiAqXG4gKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50XG4gKiBAc2VlIFtgd2F2ZXNBdWRpby5TY2hlZHVsZXJgXXtAbGluayBodHRwOi8vd2F2ZXNqcy5naXRodWIuaW8vYXVkaW8vI2F1ZGlvLXNjaGVkdWxlcn1cbiAqIEBzZWUgW2BwbGF0Zm9ybWAgc2VydmljZV17QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlBsYXRmb3JtfVxuICpcbiAqIEBleGFtcGxlXG4gKiAvLyBpbnNpZGUgdGhlIGV4cGVyaWVuY2UgY29uc3RydWN0b3JcbiAqIHRoaXMuYXVkaW9TY2hlZHVsZXIgPSB0aGlzLnJlcXVpcmUoJ2F1ZGlvLXNjaGVkdWxlcicpO1xuICpcbiAqIC8vIHdoZW4gdGhlIGV4cGVyaWVuY2UgaGFzIHN0YXJ0ZWRcbiAqIGNvbnN0IG5leHRUaW1lID0gdGhpcy5hdWRpb1NjaGVkdWxlci5jdXJyZW50VGltZSArIDI7XG4gKiB0aGlzLmF1ZGlvU2NoZWR1bGVyLmFkZCh0aW1lRW5naW5lLCBuZXh0VGltZSk7XG4gKi9cbmNsYXNzIEF1ZGlvU2NoZWR1bGVyIGV4dGVuZHMgU2VydmljZSB7XG4gIC8qKiBfPHNwYW4gY2xhc3M9XCJ3YXJuaW5nXCI+X19XQVJOSU5HX188L3NwYW4+IFRoaXMgY2xhc3Mgc2hvdWxkIG5ldmVyIGJlIGluc3RhbmNpYXRlZCBtYW51YWxseV8gKi9cbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKFNFUlZJQ0VfSUQsIGZhbHNlKTtcblxuICAgIHRoaXMuX3BsYXRmb3JtID0gdGhpcy5yZXF1aXJlKCdwbGF0Zm9ybScsIHsgZmVhdHVyZXM6ICd3ZWItYXVkaW8nIH0pO1xuXG4gICAgLy8gaW5pdGlhbGl6ZSBzeW5jIG9wdGlvblxuICAgIHRoaXMuX3N5bmMgPSBudWxsO1xuICAgIHRoaXMuX3N5bmNlZFF1ZXVlID0gbnVsbDtcblxuICAgIC8vIGdldCBhdWRpbyB0aW1lIGJhc2VkIHNjaGVkdWxlclxuICAgIHRoaXMuX3NjaGVkdWxlciA9IGF1ZGlvLmdldFNjaGVkdWxlcigpO1xuXG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgICBsb29rYWhlYWQ6IHRoaXMuX3NjaGVkdWxlci5sb29rYWhlYWQsXG4gICAgICBwZXJpb2Q6IHRoaXMuX3NjaGVkdWxlci5wZXJpb2QsXG4gICAgfTtcblxuICAgIC8vIGNhbGwgc3VwZXIuY29uZmlndXJlIChhY3RpdmF0ZSBzeW5jIG9wdGlvbiBvbmx5IGlmIHJlcXVpcmVkKVxuICAgIHN1cGVyLmNvbmZpZ3VyZShkZWZhdWx0cyk7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGUgZGVmYXVsdCBgY29uZmlndXJlYCB0byBjb25maWd1cmUgdGhlIHNjaGVkdWxlci5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBUaGUgb3B0aW9ucyB0byBhcHBseSB0byB0aGUgc2VydmljZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNvbmZpZ3VyZShvcHRpb25zKSB7XG4gICAgLy8gY2hlY2sgYW5kIHNldCBzY2hlZHVsZXIgcGVyaW9kIG9wdGlvblxuICAgIGlmIChvcHRpb25zLnBlcmlvZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAob3B0aW9ucy5wZXJpb2QgPiAwLjAxMClcbiAgICAgICAgdGhpcy5fc2NoZWR1bGVyLnBlcmlvZCA9IG9wdGlvbnMucGVyaW9kO1xuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgc2NoZWR1bGVyIHBlcmlvZDogJHtvcHRpb25zLnBlcmlvZH1gKTtcbiAgICB9XG5cbiAgICAvLyBjaGVjayBhbmQgc2V0IHNjaGVkdWxlciBsb29rYWhlYWQgb3B0aW9uXG4gICAgaWYgKG9wdGlvbnMubG9va2FoZWFkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChvcHRpb25zLmxvb2thaGVhZCA+IDAuMDEwKVxuICAgICAgICB0aGlzLl9zY2hlZHVsZXIubG9va2FoZWFkID0gb3B0aW9ucy5sb29rYWhlYWQ7XG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBzY2hlZHVsZXIgbG9va2FoZWFkOiAke29wdGlvbnMubG9va2FoZWFkfWApO1xuICAgIH1cblxuICAgIHN1cGVyLmNvbmZpZ3VyZShvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuXG4gICAgaWYgKCF0aGlzLmhhc1N0YXJ0ZWQpXG4gICAgICB0aGlzLmluaXQoKTtcblxuICAgIHRoaXMucmVhZHkoKTtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gYXVkaW9TY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICAvKipcbiAgICogQ3VycmVudCBhdWRpbyB0aW1lIG9mIHRoZSBzY2hlZHVsZXIuXG4gICAqL1xuICBnZXQgYXVkaW9UaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICAvKipcbiAgICogRGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBzY2hlZHVsZXIncyBsb2dpY2FsIGF1ZGlvIHRpbWUgYW5kIHRoZSBgY3VycmVudFRpbWVgXG4gICAqIG9mIHRoZSBhdWRpbyBjb250ZXh0LlxuICAgKi9cbiAgZ2V0IGRlbHRhVGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2NoZWR1bGVyLmN1cnJlbnRUaW1lIC0gYXVkaW8uYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGwgYSBmdW5jdGlvbiBhdCBhIGdpdmVuIHRpbWUuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1biAtIEZ1bmN0aW9uIHRvIGJlIGRlZmVycmVkLlxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSAtIFRoZSB0aW1lIGF0IHdoaWNoIHRoZSBmdW5jdGlvbiBzaG91bGQgYmUgZXhlY3V0ZWQuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2xvb2thaGVhZD1mYWxzZV0gLSBEZWZpbmVzIHdoZXRoZXIgdGhlIGZ1bmN0aW9uIGlzIGNhbGxlZFxuICAgKiAgYW50aWNpcGF0ZWQgKGUuZy4gZm9yIGF1ZGlvIGV2ZW50cykgb3IgcHJlY2lzZWx5IGF0IHRoZSBnaXZlbiB0aW1lIChkZWZhdWx0KS5cbiAgICovXG4gIGRlZmVyKGZ1biwgdGltZSwgbG9va2FoZWFkID0gZmFsc2UpIHtcbiAgICBjb25zdCBzY2hlZHVsZXIgPSB0aGlzLl9zY2hlZHVsZXI7XG4gICAgY29uc3Qgc2NoZWR1bGVyU2VydmljZSA9IHRoaXM7XG4gICAgbGV0IGVuZ2luZTtcblxuICAgIGlmKGxvb2thaGVhZCkge1xuICAgICAgc2NoZWR1bGVyLmRlZmVyKGZ1biwgdGltZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVuZ2luZSA9IHtcbiAgICAgICAgYWR2YW5jZVRpbWU6IGZ1bmN0aW9uKHRpbWUpIHtcbiAgICAgICAgICBjb25zdCBkZWx0YSA9IHNjaGVkdWxlclNlcnZpY2UuZGVsdGFUaW1lO1xuXG4gICAgICAgICAgaWYoZGVsdGEgPiAwKVxuICAgICAgICAgICAgc2V0VGltZW91dChmdW4sIDEwMDAgKiBkZWx0YSwgdGltZSk7IC8vIGJyaWRnZSBzY2hlZHVsZXIgbG9va2FoZWFkIHdpdGggdGltZW91dFxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZ1bih0aW1lKTtcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIHNjaGVkdWxlci5hZGQoZW5naW5lLCB0aW1lKTsgLy8gYWRkIHdpdGhvdXQgY2hlY2tzXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHRpbWUgZW5naW5lIHRvIHRoZSBxdWV1ZS5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZW5naW5lIC0gRW5naW5lIHRvIHNjaGVkdWxlLlxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSAtIFRoZSB0aW1lIGF0IHdoaWNoIHRoZSBmdW5jdGlvbiBzaG91bGQgYmUgZXhlY3V0ZWQuXG4gICAqL1xuICBhZGQoZW5naW5lLCB0aW1lKSB7XG4gICAgdGhpcy5fc2NoZWR1bGVyLmFkZChlbmdpbmUsIHRpbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0aGUgZ2l2ZW4gZW5naW5lIGZyb20gdGhlIHF1ZXVlLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBlbmdpbmUgLSBFbmdpbmUgdG8gcmVtb3ZlIGZyb20gdGhlIHNjaGVkdWxlci5cbiAgICovXG4gIHJlbW92ZShlbmdpbmUpIHtcbiAgICB0aGlzLl9zY2hlZHVsZXIucmVtb3ZlKGVuZ2luZSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCBzY2hlZHVsZWQgZnVuY3Rpb25zIGFuZCB0aW1lIGVuZ2luZXMgKHN5bmNocm9uaXplZCBvciBub3QpIGZyb21cbiAgICogdGhlIHNjaGVkdWxlci5cbiAgICovXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuX3NjaGVkdWxlci5jbGVhcigpO1xuICB9XG59XG5cbnNlcnZpY2VNYW5hZ2VyLnJlZ2lzdGVyKFNFUlZJQ0VfSUQsIEF1ZGlvU2NoZWR1bGVyKTtcblxuZXhwb3J0IGRlZmF1bHQgQXVkaW9TY2hlZHVsZXI7XG4iXX0=