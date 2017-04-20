'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

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

var _Service2 = require('../core/Service');

var _Service3 = _interopRequireDefault(_Service2);

var _serviceManager = require('../core/serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

var _wavesAudio = require('waves-audio');

var audio = _interopRequireWildcard(_wavesAudio);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audioScheduler = audio.getScheduler();

var SERVICE_ID = 'service:metric-scheduler';

var EPSILON = 1e-12;

var SyncSchedulerHook = function (_audio$TimeEngine) {
  (0, _inherits3.default)(SyncSchedulerHook, _audio$TimeEngine);

  function SyncSchedulerHook(syncScheduler, metricScheduler) {
    (0, _classCallCheck3.default)(this, SyncSchedulerHook);

    var _this = (0, _possibleConstructorReturn3.default)(this, (SyncSchedulerHook.__proto__ || (0, _getPrototypeOf2.default)(SyncSchedulerHook)).call(this));

    _this.nextPosition = Infinity;
    _this.nextTime = Infinity;

    _this.syncScheduler = syncScheduler;
    _this.metricScheduler = metricScheduler;

    syncScheduler.add(_this, Infinity); // add hook to sync (master) scheduler
    return _this;
  }

  (0, _createClass3.default)(SyncSchedulerHook, [{
    key: 'advanceTime',
    value: function advanceTime(syncTime) {
      var metricScheduler = this.metricScheduler;
      var nextPosition = metricScheduler._advancePosition(syncTime, this.nextPosition, metricScheduler._metricSpeed);
      var nextTime = metricScheduler.getSyncTimeAtMetricPosition(nextPosition);

      this.nextPosition = nextPosition;
      this.nextTime = nextTime;

      return nextTime;
    }
  }, {
    key: 'reschedule',
    value: function reschedule() {
      var metricScheduler = this.metricScheduler;
      var nextPosition = metricScheduler._engineQueue.time;
      var syncTime = metricScheduler.getSyncTimeAtMetricPosition(nextPosition);

      if (syncTime !== this.nextTime) {
        this.nextPosition = nextPosition;
        this.nextTime = syncTime;

        this.resetTime(syncTime);
      }
    }
  }]);
  return SyncSchedulerHook;
}(audio.TimeEngine);

var SyncEventEngine = function (_audio$TimeEngine2) {
  (0, _inherits3.default)(SyncEventEngine, _audio$TimeEngine2);

  function SyncEventEngine(syncScheduler, metricScheduler) {
    (0, _classCallCheck3.default)(this, SyncEventEngine);

    var _this2 = (0, _possibleConstructorReturn3.default)(this, (SyncEventEngine.__proto__ || (0, _getPrototypeOf2.default)(SyncEventEngine)).call(this));

    _this2.syncScheduler = syncScheduler;
    _this2.metricScheduler = metricScheduler;

    _this2.syncTime = undefined;
    _this2.metricPosition = undefined;
    _this2.tempo = undefined;
    _this2.tempoUnit = undefined;
    _this2.event = undefined;

    syncScheduler.add(_this2, Infinity);
    return _this2;
  }

  (0, _createClass3.default)(SyncEventEngine, [{
    key: 'advanceTime',
    value: function advanceTime(syncTime) {
      this.metricScheduler._sync(this.syncTime, this.metricPosition, this.tempo, this.tempoUnit, this.event);
      return Infinity;
    }
  }, {
    key: 'set',
    value: function set(syncTime, metricPosition, tempo, tempoUnit, event) {
      this.syncTime = syncTime;
      this.metricPosition = metricPosition;
      this.tempo = tempo;
      this.tempoUnit = tempoUnit;
      this.event = event;

      this.resetTime(syncTime);
    }
  }, {
    key: 'reset',
    value: function reset(syncTime, metricPosition, tempo, tempoUnit, event) {
      this.syncTime = undefined;
      this.metricPosition = undefined;
      this.tempo = undefined;
      this.tempoUnit = undefined;
      this.event = undefined;

      this.resetTime(Infinity);
    }
  }]);
  return SyncEventEngine;
}(audio.TimeEngine);

var BeatEngine = function (_audio$TimeEngine3) {
  (0, _inherits3.default)(BeatEngine, _audio$TimeEngine3);

  function BeatEngine(metro) {
    (0, _classCallCheck3.default)(this, BeatEngine);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (BeatEngine.__proto__ || (0, _getPrototypeOf2.default)(BeatEngine)).call(this));

    _this3.metro = metro;
    audioScheduler.add(_this3, Infinity);
    return _this3;
  }

  // generate next beat


  (0, _createClass3.default)(BeatEngine, [{
    key: 'advanceTime',
    value: function advanceTime(audioTime) {
      var metro = this.metro;

      metro.beatCount++;

      var cont = metro.callback(metro.measureCount, metro.beatCount);

      if (cont === undefined || cont === true) {
        if (metro.beatCount >= metro.numBeats - 1) return Infinity;

        return audioTime + metro.beatPeriod;
      }

      metro.resetPosition(Infinity);
      return Infinity;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.metro = null;

      if (this.master) this.master.remove(this);
    }
  }]);
  return BeatEngine;
}(audio.TimeEngine);

var MetronomeEngine = function (_audio$TimeEngine4) {
  (0, _inherits3.default)(MetronomeEngine, _audio$TimeEngine4);

  function MetronomeEngine(startPosition, numBeats, beatLength, callback) {
    (0, _classCallCheck3.default)(this, MetronomeEngine);

    var _this4 = (0, _possibleConstructorReturn3.default)(this, (MetronomeEngine.__proto__ || (0, _getPrototypeOf2.default)(MetronomeEngine)).call(this));

    _this4.startPosition = startPosition;
    _this4.numBeats = numBeats;
    _this4.beatLength = beatLength;
    _this4.callback = callback;

    _this4.measureLength = numBeats * beatLength;
    _this4.beatPeriod = 0;
    _this4.measureCount = 0;
    _this4.beatCount = 0;

    if (numBeats > 1) _this4.beatEngine = new BeatEngine(_this4);
    return _this4;
  }

  // return position of next measure


  (0, _createClass3.default)(MetronomeEngine, [{
    key: 'syncSpeed',
    value: function syncSpeed(syncTime, metricPosition, metricSpeed) {
      if (metricSpeed <= 0 && this.beatEngine) this.beatEngine.resetTime(Infinity);
    }

    // return position of next measure

  }, {
    key: 'syncPosition',
    value: function syncPosition(syncTime, metricPosition, metricSpeed) {
      var startPosition = this.startPosition;

      if (this.beatEngine) this.beatEngine.resetTime(Infinity);

      // since we are anyway a little in advance, make sure that we don't skip
      // the start point due to rounding errors
      metricPosition -= EPSILON;

      this.beatPeriod = this.beatLength / metricSpeed;
      this.beatCount = 0;

      if (metricPosition >= startPosition) {
        var relativePosition = metricPosition - startPosition;
        var floatMeasures = relativePosition / this.measureLength;
        var measureCount = Math.ceil(floatMeasures);

        this.measureCount = measureCount - 1;
        return startPosition + measureCount * this.measureLength;
      }

      this.measureCount = -1;
      return startPosition;
    }

    // generate next measure

  }, {
    key: 'advancePosition',
    value: function advancePosition(syncTime, metricPosition, metricSpeed) {
      var audioTime = audioScheduler.currentTime;

      this.measureCount++;
      this.beatCount = 0;

      // whether metronome continues (default is true)
      var cont = this.callback(this.measureCount, 0);

      if (cont === undefined || cont === true) {
        if (this.beatEngine) this.beatEngine.resetTime(audioTime + this.beatPeriod);

        return metricPosition + this.measureLength;
      }

      if (this.beatEngine) this.beatEngine.resetTime(Infinity);

      return Infinity;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.beatEngine) this.beatEngine.destroy();

      if (this.master) this.master.remove(this);
    }
  }]);
  return MetronomeEngine;
}(audio.TimeEngine);

var MetricScheduler = function (_Service) {
  (0, _inherits3.default)(MetricScheduler, _Service);

  function MetricScheduler() {
    (0, _classCallCheck3.default)(this, MetricScheduler);

    var _this5 = (0, _possibleConstructorReturn3.default)(this, (MetricScheduler.__proto__ || (0, _getPrototypeOf2.default)(MetricScheduler)).call(this, SERVICE_ID, true));

    _this5._syncScheduler = _this5.require('sync-scheduler');

    _this5._engineQueue = new audio.PriorityQueue();
    _this5._engineSet = new _set2.default();
    _this5._metronomeEngineMap = new _map2.default();

    _this5._tempo = 60; // tempo in beats per minute (BPM)
    _this5._tempoUnit = 0.25; // tempo unit expressed in fractions of a whole note
    _this5._metricSpeed = 0.25; // whole notes per second

    _this5._syncTime = 0;
    _this5._metricPosition = 0;

    _this5._syncSchedulerHook = null;
    _this5._syncEventEngine = null;

    _this5._listeners = new _map2.default();
    _this5._callingEventListeners = false;

    // const defaults = {};
    // this.configure(defaults);

    _this5._onInit = _this5._onInit.bind(_this5);
    _this5._onSync = _this5._onSync.bind(_this5);
    _this5._onClear = _this5._onClear.bind(_this5);
    return _this5;
  }

  (0, _createClass3.default)(MetricScheduler, [{
    key: 'start',
    value: function start() {
      (0, _get3.default)(MetricScheduler.prototype.__proto__ || (0, _getPrototypeOf2.default)(MetricScheduler.prototype), 'start', this).call(this);

      if (!this.hasStarted) this.init();

      this._syncSchedulerHook = new SyncSchedulerHook(this._syncScheduler, this);
      this._syncEventEngine = new SyncEventEngine(this._syncScheduler, this);

      this.send('request');
      this.receive('init', this._onInit);
      this.receive('clear', this._onClear);
      this.receive('sync', this._onSync);
    }
  }, {
    key: 'stop',
    value: function stop() {
      (0, _get3.default)(MetricScheduler.prototype.__proto__ || (0, _getPrototypeOf2.default)(MetricScheduler.prototype), 'stop', this).call(this);
    }
  }, {
    key: '_callEventListeners',
    value: function _callEventListeners(event) {
      var listeners = this._listeners.get(event);

      if (listeners) {
        this._callingEventListeners = true;

        var data = {
          syncTime: this._syncTime,
          metricPosition: this._metricPosition,
          tempo: this._tempo,
          tempoUnit: this._tempoUnit
        };

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = (0, _getIterator3.default)(listeners), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var callback = _step.value;

            callback(event, data);
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

        this._callingEventListeners = false;
      }
    }
  }, {
    key: '_rescheduleMetricEngines',
    value: function _rescheduleMetricEngines() {
      var syncTime = this.syncTime;
      var metricPosition = this.getMetricPositionAtSyncTime(syncTime);

      this._engineQueue.clear();

      if (this._metricSpeed > 0) {
        // position engines
        var metricSpeed = this._metricSpeed;
        var queue = this._engineQueue;

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = (0, _getIterator3.default)(this._engineSet), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var engine = _step2.value;

            var nextEnginePosition = engine.syncPosition(syncTime, metricPosition, metricSpeed);
            queue.insert(engine, nextEnginePosition);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      } else {
        // stop engines
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = (0, _getIterator3.default)(this._engineSet), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _engine = _step3.value;

            if (_engine.syncSpeed) _engine.syncSpeed(syncTime, metricPosition, 0);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }

      this._syncSchedulerHook.reschedule();
    }
  }, {
    key: '_clearEngines',
    value: function _clearEngines() {
      this._engineQueue.clear();
      this._engineSet.clear();

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = (0, _getIterator3.default)(this._metronomeEngineMap), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var _step4$value = (0, _slicedToArray3.default)(_step4.value, 2),
              key = _step4$value[0],
              engine = _step4$value[1];

          engine.destroy();
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      this._metronomeEngineMap.clear();

      this._syncSchedulerHook.reschedule();
    }
  }, {
    key: '_advancePosition',
    value: function _advancePosition(syncTime, metricPosition, metricSpeed) {
      var engine = this._engineQueue.head;
      var nextEnginePosition = engine.advancePosition(syncTime, metricPosition, metricSpeed);

      if (nextEnginePosition === undefined) this._engineSet.delete(engine);

      return this._engineQueue.move(engine, nextEnginePosition);
    }
  }, {
    key: '_sync',
    value: function _sync(syncTime, metricPosition, tempo, tempoUnit, event) {
      this._syncTime = syncTime;
      this._metricPosition = metricPosition;

      this._tempo = tempo;
      this._tempoUnit = tempoUnit;
      this._metricSpeed = tempo * tempoUnit / 60;

      if (event) this._callEventListeners(event);

      this._rescheduleMetricEngines();
    }
  }, {
    key: '_clearSyncEvent',
    value: function _clearSyncEvent() {
      this._syncEventEngine.reset();
    }
  }, {
    key: '_setSyncEvent',
    value: function _setSyncEvent(syncTime, metricPosition, tempo, tempoUnit, event) {
      this._clearSyncEvent();

      if (syncTime > this.syncTime) this._syncEventEngine.set(syncTime, metricPosition, tempo, tempoUnit, event);else this._sync(syncTime, metricPosition, tempo, tempoUnit, event);
    }
  }, {
    key: '_onInit',
    value: function _onInit(syncTime, metricPosition, tempo, tempoUnit) {
      this._sync(syncTime, metricPosition, tempo, tempoUnit);
      this.ready();
    }
  }, {
    key: '_onClear',
    value: function _onClear() {
      this._clearSyncEvent();
      this._clearEngines();
    }
  }, {
    key: '_onSync',
    value: function _onSync(syncTime, metricPosition, tempo, tempoUnit, event) {
      this._setSyncEvent(syncTime, metricPosition, tempo, tempoUnit, event);
    }
  }, {
    key: 'getMetricPositionAtAudioTime',


    /**
     * Get metric position corrsponding to a given audio time (regarding the current tempo).
     * @param  {Number} time - time
     * @return {Number} - metric position
     */
    value: function getMetricPositionAtAudioTime(audioTime) {
      if (this._tempo > 0) {
        var syncTime = this._syncScheduler.getSyncTimeAtAudioTime(audioTime);
        return this._metricPosition + (syncTime - this._syncTime) * this._metricSpeed;
      }

      return this._metricPosition;
    }

    /**
     * Get metric position corrsponding to a given sync time (regarding the current tempo).
     * @param  {Number} time - time
     * @return {Number} - metric position
     */

  }, {
    key: 'getMetricPositionAtSyncTime',
    value: function getMetricPositionAtSyncTime(syncTime) {
      if (this._tempo > 0) return this._metricPosition + (syncTime - this._syncTime) * this._metricSpeed;

      return this._metricPosition;
    }

    /**
     * Get sync time corresponding to a given metric position (regarding the current tempo).
     * @param  {Number} position - metric position
     * @return {Number} - sync time
     */

  }, {
    key: 'getSyncTimeAtMetricPosition',
    value: function getSyncTimeAtMetricPosition(metricPosition) {
      var metricSpeed = this._metricSpeed;

      if (metricPosition < Infinity && metricSpeed > 0) return this._syncTime + (metricPosition - this._metricPosition) / metricSpeed;

      return Infinity;
    }

    /**
     * Get audio time corresponding to a given metric position (regarding the current tempo).
     * @param  {Number} position - metric position
     * @return {Number} - audio time
     */

  }, {
    key: 'getAudioTimeAtMetricPosition',
    value: function getAudioTimeAtMetricPosition(metricPosition) {
      var metricSpeed = this._metricSpeed;

      if (metricPosition < Infinity && metricSpeed > 0) {
        var syncTime = this._syncTime + (metricPosition - this._metricPosition) / metricSpeed;
        return this._syncScheduler.getAudioTimeAtSyncTime(syncTime);
      }

      return Infinity;
    }
  }, {
    key: 'addEventListener',
    value: function addEventListener(event, callback) {
      var listeners = this._listeners.get(event);

      if (!listeners) {
        listeners = new _set2.default();
        this._listeners.set(event, listeners);
      }

      listeners.add(callback);
    }
  }, {
    key: 'removeEventListener',
    value: function removeEventListener(callback) {
      var listeners = this._listeners.get(event);

      if (listeners) listeners.remove(callback);
    }

    /**
     * Call a function at a given metric position.
     *
     * @param {Function} fun - Function to be deferred.
     * @param {Number} metricPosition - The metric position at which the function should be executed.
     * @param {Boolean} [lookahead=false] - Defines whether the function is called
     *  anticipated (e.g. for audio events) or precisely at the given time (default).
     */

  }, {
    key: 'addEvent',
    value: function addEvent(fun, metricPosition) {
      var lookahead = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      var schedulerService = this;
      var engine = {
        timeout: null,
        syncSpeed: function syncSpeed(time, position, speed) {
          if (speed === 0) clearTimeout(this.timeout);
        },
        syncPosition: function syncPosition(time, position, speed) {
          clearTimeout(this.timeout);

          if (metricPosition >= position) return metricPosition;

          return Infinity;
        },
        advancePosition: function advancePosition(time, position, speed) {
          var delta = schedulerService.deltaTime;

          if (delta > 0) this.timeout = setTimeout(fun, 1000 * delta, position); // bridge scheduler lookahead with timeout
          else fun(position);

          return Infinity;
        }
      };

      this.add(engine, metricPosition); // add without checks
    }
  }, {
    key: 'add',
    value: function add(engine) {
      var startPosition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.metricPosition;

      this._engineSet.add(engine);

      var metricPosition = Math.max(startPosition, this.metricPosition);

      // schedule engine
      if (!this._callingEventListeners && this._metricSpeed > 0) {
        var syncTime = this.syncTime;
        var nextEnginePosition = engine.syncPosition(syncTime, metricPosition, this._metricSpeed);

        this._engineQueue.insert(engine, nextEnginePosition);
        this._syncSchedulerHook.reschedule();
      }
    }
  }, {
    key: 'remove',
    value: function remove(engine) {
      var syncTime = this.syncTime;
      var metricPosition = this.getMetricPositionAtSyncTime(syncTime);

      // stop engine
      if (engine.syncSpeed) engine.syncSpeed(syncTime, metricPosition, 0);

      if (this._engineSet.delete(engine) && !this._callingEventListeners && this._metricSpeed > 0) {
        this._engineQueue.remove(engine);
        this._syncSchedulerHook.reschedule();
      }
    }

    /**
     * Add a periodic callback starting at a given metric position.
     * @param {Function} callback - callback function (cycle, beat)
     * @param {Integer} numBeats - number of beats (time signature numerator)
     * @param {Number} metricDiv - metric division of whole note (time signature denominator)
     * @param {Number} tempoScale - linear tempo scale factor (in respect to master tempo)
     * @param {Integer} startPosition - metric start position of the beat
     */

  }, {
    key: 'addMetronome',
    value: function addMetronome(callback) {
      var numBeats = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4;
      var metricDiv = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
      var tempoScale = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
      var startPosition = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

      var beatLength = 1 / (metricDiv * tempoScale);
      var engine = new MetronomeEngine(startPosition, numBeats, beatLength, callback);

      this._metronomeEngineMap.set(callback, engine);
      this.add(engine, startPosition);
    }

    /**
     * Remove periodic callback.
     * @param {Function} callback callback function
     */

  }, {
    key: 'removeMetronome',
    value: function removeMetronome(callback /*, endPosition */) {
      var engine = this._metronomeEngineMap.get(callback);

      if (engine) {
        this._metronomeEngineMap.delete(callback);
        this.remove(engine);
      }
    }
  }, {
    key: 'audioTime',
    get: function get() {
      return audioScheduler.currentTime;
    }
  }, {
    key: 'syncTime',
    get: function get() {
      return this._syncScheduler.syncTime;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this._syncScheduler.syncTime;
    }
  }, {
    key: 'metricPosition',
    get: function get() {
      if (this._tempo > 0) return this._metricPosition + (this._syncScheduler.syncTime - this._syncTime) * this._metricSpeed;

      return this._metricPosition;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      return this.metricPosition;
    }

    /**
     * Difference between the audio scheduler's logical audio time and the `currentTime`
     * of the audio context.
     */

  }, {
    key: 'deltaTime',
    get: function get() {
      return audioScheduler.currentTime - audio.audioContext.currentTime;
    }

    /**
     * Current tempo.
     * @return {Number} - Tempo in BPM.
     */

  }, {
    key: 'tempo',
    get: function get() {
      return this._tempo;
    }

    /**
     * Current tempo unit.
     * @return {Number} - Tempo unit in respect to whole note.
     */

  }, {
    key: 'tempoUnit',
    get: function get() {
      return this._tempoUnit;
    }
  }]);
  return MetricScheduler;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, MetricScheduler);

exports.default = MetricScheduler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1ldHJpY1NjaGVkdWxlci5qcyJdLCJuYW1lcyI6WyJhdWRpbyIsImF1ZGlvU2NoZWR1bGVyIiwiZ2V0U2NoZWR1bGVyIiwiU0VSVklDRV9JRCIsIkVQU0lMT04iLCJTeW5jU2NoZWR1bGVySG9vayIsInN5bmNTY2hlZHVsZXIiLCJtZXRyaWNTY2hlZHVsZXIiLCJuZXh0UG9zaXRpb24iLCJJbmZpbml0eSIsIm5leHRUaW1lIiwiYWRkIiwic3luY1RpbWUiLCJfYWR2YW5jZVBvc2l0aW9uIiwiX21ldHJpY1NwZWVkIiwiZ2V0U3luY1RpbWVBdE1ldHJpY1Bvc2l0aW9uIiwiX2VuZ2luZVF1ZXVlIiwidGltZSIsInJlc2V0VGltZSIsIlRpbWVFbmdpbmUiLCJTeW5jRXZlbnRFbmdpbmUiLCJ1bmRlZmluZWQiLCJtZXRyaWNQb3NpdGlvbiIsInRlbXBvIiwidGVtcG9Vbml0IiwiZXZlbnQiLCJfc3luYyIsIkJlYXRFbmdpbmUiLCJtZXRybyIsImF1ZGlvVGltZSIsImJlYXRDb3VudCIsImNvbnQiLCJjYWxsYmFjayIsIm1lYXN1cmVDb3VudCIsIm51bUJlYXRzIiwiYmVhdFBlcmlvZCIsInJlc2V0UG9zaXRpb24iLCJtYXN0ZXIiLCJyZW1vdmUiLCJNZXRyb25vbWVFbmdpbmUiLCJzdGFydFBvc2l0aW9uIiwiYmVhdExlbmd0aCIsIm1lYXN1cmVMZW5ndGgiLCJiZWF0RW5naW5lIiwibWV0cmljU3BlZWQiLCJyZWxhdGl2ZVBvc2l0aW9uIiwiZmxvYXRNZWFzdXJlcyIsIk1hdGgiLCJjZWlsIiwiY3VycmVudFRpbWUiLCJkZXN0cm95IiwiTWV0cmljU2NoZWR1bGVyIiwiX3N5bmNTY2hlZHVsZXIiLCJyZXF1aXJlIiwiUHJpb3JpdHlRdWV1ZSIsIl9lbmdpbmVTZXQiLCJfbWV0cm9ub21lRW5naW5lTWFwIiwiX3RlbXBvIiwiX3RlbXBvVW5pdCIsIl9zeW5jVGltZSIsIl9tZXRyaWNQb3NpdGlvbiIsIl9zeW5jU2NoZWR1bGVySG9vayIsIl9zeW5jRXZlbnRFbmdpbmUiLCJfbGlzdGVuZXJzIiwiX2NhbGxpbmdFdmVudExpc3RlbmVycyIsIl9vbkluaXQiLCJiaW5kIiwiX29uU3luYyIsIl9vbkNsZWFyIiwiaGFzU3RhcnRlZCIsImluaXQiLCJzZW5kIiwicmVjZWl2ZSIsImxpc3RlbmVycyIsImdldCIsImRhdGEiLCJnZXRNZXRyaWNQb3NpdGlvbkF0U3luY1RpbWUiLCJjbGVhciIsInF1ZXVlIiwiZW5naW5lIiwibmV4dEVuZ2luZVBvc2l0aW9uIiwic3luY1Bvc2l0aW9uIiwiaW5zZXJ0Iiwic3luY1NwZWVkIiwicmVzY2hlZHVsZSIsImtleSIsImhlYWQiLCJhZHZhbmNlUG9zaXRpb24iLCJkZWxldGUiLCJtb3ZlIiwiX2NhbGxFdmVudExpc3RlbmVycyIsIl9yZXNjaGVkdWxlTWV0cmljRW5naW5lcyIsInJlc2V0IiwiX2NsZWFyU3luY0V2ZW50Iiwic2V0IiwicmVhZHkiLCJfY2xlYXJFbmdpbmVzIiwiX3NldFN5bmNFdmVudCIsImdldFN5bmNUaW1lQXRBdWRpb1RpbWUiLCJnZXRBdWRpb1RpbWVBdFN5bmNUaW1lIiwiZnVuIiwibG9va2FoZWFkIiwic2NoZWR1bGVyU2VydmljZSIsInRpbWVvdXQiLCJwb3NpdGlvbiIsInNwZWVkIiwiY2xlYXJUaW1lb3V0IiwiZGVsdGEiLCJkZWx0YVRpbWUiLCJzZXRUaW1lb3V0IiwibWF4IiwibWV0cmljRGl2IiwidGVtcG9TY2FsZSIsImF1ZGlvQ29udGV4dCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOztJQUFZQSxLOzs7Ozs7QUFDWixJQUFNQyxpQkFBaUJELE1BQU1FLFlBQU4sRUFBdkI7O0FBRUEsSUFBTUMsYUFBYSwwQkFBbkI7O0FBRUEsSUFBTUMsVUFBVSxLQUFoQjs7SUFFTUMsaUI7OztBQUNKLDZCQUFZQyxhQUFaLEVBQTJCQyxlQUEzQixFQUE0QztBQUFBOztBQUFBOztBQUcx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LEVBQW9DZ0QsZUFBcEM7O2tCQUVlQSxlIiwiZmlsZSI6Ik1ldHJpY1NjaGVkdWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTZXJ2aWNlIGZyb20gJy4uL2NvcmUvU2VydmljZSc7XG5pbXBvcnQgc2VydmljZU1hbmFnZXIgZnJvbSAnLi4vY29yZS9zZXJ2aWNlTWFuYWdlcic7XG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICd3YXZlcy1hdWRpbyc7XG5jb25zdCBhdWRpb1NjaGVkdWxlciA9IGF1ZGlvLmdldFNjaGVkdWxlcigpO1xuXG5jb25zdCBTRVJWSUNFX0lEID0gJ3NlcnZpY2U6bWV0cmljLXNjaGVkdWxlcic7XG5cbmNvbnN0IEVQU0lMT04gPSAxZS0xMjtcblxuY2xhc3MgU3luY1NjaGVkdWxlckhvb2sgZXh0ZW5kcyBhdWRpby5UaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3Ioc3luY1NjaGVkdWxlciwgbWV0cmljU2NoZWR1bGVyKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMubmV4dFBvc2l0aW9uID0gSW5maW5pdHk7XG4gICAgdGhpcy5uZXh0VGltZSA9IEluZmluaXR5O1xuXG4gICAgdGhpcy5zeW5jU2NoZWR1bGVyID0gc3luY1NjaGVkdWxlcjtcbiAgICB0aGlzLm1ldHJpY1NjaGVkdWxlciA9IG1ldHJpY1NjaGVkdWxlcjtcblxuICAgIHN5bmNTY2hlZHVsZXIuYWRkKHRoaXMsIEluZmluaXR5KTsgLy8gYWRkIGhvb2sgdG8gc3luYyAobWFzdGVyKSBzY2hlZHVsZXJcbiAgfVxuXG4gIGFkdmFuY2VUaW1lKHN5bmNUaW1lKSB7XG4gICAgY29uc3QgbWV0cmljU2NoZWR1bGVyID0gdGhpcy5tZXRyaWNTY2hlZHVsZXI7XG4gICAgY29uc3QgbmV4dFBvc2l0aW9uID0gbWV0cmljU2NoZWR1bGVyLl9hZHZhbmNlUG9zaXRpb24oc3luY1RpbWUsIHRoaXMubmV4dFBvc2l0aW9uLCBtZXRyaWNTY2hlZHVsZXIuX21ldHJpY1NwZWVkKTtcbiAgICBjb25zdCBuZXh0VGltZSA9IG1ldHJpY1NjaGVkdWxlci5nZXRTeW5jVGltZUF0TWV0cmljUG9zaXRpb24obmV4dFBvc2l0aW9uKTtcblxuICAgIHRoaXMubmV4dFBvc2l0aW9uID0gbmV4dFBvc2l0aW9uO1xuICAgIHRoaXMubmV4dFRpbWUgPSBuZXh0VGltZTtcblxuICAgIHJldHVybiBuZXh0VGltZTtcbiAgfVxuXG4gIHJlc2NoZWR1bGUoKSB7XG4gICAgY29uc3QgbWV0cmljU2NoZWR1bGVyID0gdGhpcy5tZXRyaWNTY2hlZHVsZXI7XG4gICAgY29uc3QgbmV4dFBvc2l0aW9uID0gbWV0cmljU2NoZWR1bGVyLl9lbmdpbmVRdWV1ZS50aW1lO1xuICAgIGNvbnN0IHN5bmNUaW1lID0gbWV0cmljU2NoZWR1bGVyLmdldFN5bmNUaW1lQXRNZXRyaWNQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuXG4gICAgaWYgKHN5bmNUaW1lICE9PSB0aGlzLm5leHRUaW1lKSB7XG4gICAgICB0aGlzLm5leHRQb3NpdGlvbiA9IG5leHRQb3NpdGlvbjtcbiAgICAgIHRoaXMubmV4dFRpbWUgPSBzeW5jVGltZTtcblxuICAgICAgdGhpcy5yZXNldFRpbWUoc3luY1RpbWUpO1xuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBTeW5jRXZlbnRFbmdpbmUgZXh0ZW5kcyBhdWRpby5UaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3Ioc3luY1NjaGVkdWxlciwgbWV0cmljU2NoZWR1bGVyKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuc3luY1NjaGVkdWxlciA9IHN5bmNTY2hlZHVsZXI7XG4gICAgdGhpcy5tZXRyaWNTY2hlZHVsZXIgPSBtZXRyaWNTY2hlZHVsZXI7XG5cbiAgICB0aGlzLnN5bmNUaW1lID0gdW5kZWZpbmVkO1xuICAgIHRoaXMubWV0cmljUG9zaXRpb24gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy50ZW1wbyA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnRlbXBvVW5pdCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmV2ZW50ID0gdW5kZWZpbmVkO1xuXG4gICAgc3luY1NjaGVkdWxlci5hZGQodGhpcywgSW5maW5pdHkpO1xuICB9XG5cbiAgYWR2YW5jZVRpbWUoc3luY1RpbWUpIHtcbiAgICB0aGlzLm1ldHJpY1NjaGVkdWxlci5fc3luYyh0aGlzLnN5bmNUaW1lLCB0aGlzLm1ldHJpY1Bvc2l0aW9uLCB0aGlzLnRlbXBvLCB0aGlzLnRlbXBvVW5pdCwgdGhpcy5ldmVudCk7XG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG5cbiAgc2V0KHN5bmNUaW1lLCBtZXRyaWNQb3NpdGlvbiwgdGVtcG8sIHRlbXBvVW5pdCwgZXZlbnQpIHtcbiAgICB0aGlzLnN5bmNUaW1lID0gc3luY1RpbWU7XG4gICAgdGhpcy5tZXRyaWNQb3NpdGlvbiA9IG1ldHJpY1Bvc2l0aW9uO1xuICAgIHRoaXMudGVtcG8gPSB0ZW1wbztcbiAgICB0aGlzLnRlbXBvVW5pdCA9IHRlbXBvVW5pdDtcbiAgICB0aGlzLmV2ZW50ID0gZXZlbnQ7XG5cbiAgICB0aGlzLnJlc2V0VGltZShzeW5jVGltZSk7XG4gIH1cblxuICByZXNldChzeW5jVGltZSwgbWV0cmljUG9zaXRpb24sIHRlbXBvLCB0ZW1wb1VuaXQsIGV2ZW50KSB7XG4gICAgdGhpcy5zeW5jVGltZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLm1ldHJpY1Bvc2l0aW9uID0gdW5kZWZpbmVkO1xuICAgIHRoaXMudGVtcG8gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy50ZW1wb1VuaXQgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5ldmVudCA9IHVuZGVmaW5lZDtcblxuICAgIHRoaXMucmVzZXRUaW1lKEluZmluaXR5KTtcbiAgfVxufVxuXG5jbGFzcyBCZWF0RW5naW5lIGV4dGVuZHMgYXVkaW8uVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKG1ldHJvKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMubWV0cm8gPSBtZXRybztcbiAgICBhdWRpb1NjaGVkdWxlci5hZGQodGhpcywgSW5maW5pdHkpO1xuICB9XG5cbiAgLy8gZ2VuZXJhdGUgbmV4dCBiZWF0XG4gIGFkdmFuY2VUaW1lKGF1ZGlvVGltZSkge1xuICAgIGNvbnN0IG1ldHJvID0gdGhpcy5tZXRybztcblxuICAgIG1ldHJvLmJlYXRDb3VudCsrO1xuXG4gICAgY29uc3QgY29udCA9IG1ldHJvLmNhbGxiYWNrKG1ldHJvLm1lYXN1cmVDb3VudCwgbWV0cm8uYmVhdENvdW50KTtcblxuICAgIGlmIChjb250ID09PSB1bmRlZmluZWQgfHwgY29udCA9PT0gdHJ1ZSkge1xuICAgICAgaWYgKG1ldHJvLmJlYXRDb3VudCA+PSBtZXRyby5udW1CZWF0cyAtIDEpXG4gICAgICAgIHJldHVybiBJbmZpbml0eTtcblxuICAgICAgcmV0dXJuIGF1ZGlvVGltZSArIG1ldHJvLmJlYXRQZXJpb2Q7XG4gICAgfVxuXG4gICAgbWV0cm8ucmVzZXRQb3NpdGlvbihJbmZpbml0eSk7XG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLm1ldHJvID0gbnVsbDtcblxuICAgIGlmICh0aGlzLm1hc3RlcilcbiAgICAgIHRoaXMubWFzdGVyLnJlbW92ZSh0aGlzKTtcbiAgfVxufVxuXG5jbGFzcyBNZXRyb25vbWVFbmdpbmUgZXh0ZW5kcyBhdWRpby5UaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3Ioc3RhcnRQb3NpdGlvbiwgbnVtQmVhdHMsIGJlYXRMZW5ndGgsIGNhbGxiYWNrKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuc3RhcnRQb3NpdGlvbiA9IHN0YXJ0UG9zaXRpb247XG4gICAgdGhpcy5udW1CZWF0cyA9IG51bUJlYXRzO1xuICAgIHRoaXMuYmVhdExlbmd0aCA9IGJlYXRMZW5ndGg7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgdGhpcy5tZWFzdXJlTGVuZ3RoID0gbnVtQmVhdHMgKiBiZWF0TGVuZ3RoO1xuICAgIHRoaXMuYmVhdFBlcmlvZCA9IDA7XG4gICAgdGhpcy5tZWFzdXJlQ291bnQgPSAwO1xuICAgIHRoaXMuYmVhdENvdW50ID0gMDtcblxuICAgIGlmIChudW1CZWF0cyA+IDEpXG4gICAgICB0aGlzLmJlYXRFbmdpbmUgPSBuZXcgQmVhdEVuZ2luZSh0aGlzKTtcbiAgfVxuXG4gIC8vIHJldHVybiBwb3NpdGlvbiBvZiBuZXh0IG1lYXN1cmVcbiAgc3luY1NwZWVkKHN5bmNUaW1lLCBtZXRyaWNQb3NpdGlvbiwgbWV0cmljU3BlZWQpIHtcbiAgICBpZiAobWV0cmljU3BlZWQgPD0gMCAmJiB0aGlzLmJlYXRFbmdpbmUpXG4gICAgICB0aGlzLmJlYXRFbmdpbmUucmVzZXRUaW1lKEluZmluaXR5KTtcbiAgfVxuXG4gIC8vIHJldHVybiBwb3NpdGlvbiBvZiBuZXh0IG1lYXN1cmVcbiAgc3luY1Bvc2l0aW9uKHN5bmNUaW1lLCBtZXRyaWNQb3NpdGlvbiwgbWV0cmljU3BlZWQpIHtcbiAgICBjb25zdCBzdGFydFBvc2l0aW9uID0gdGhpcy5zdGFydFBvc2l0aW9uO1xuXG4gICAgaWYgKHRoaXMuYmVhdEVuZ2luZSlcbiAgICAgIHRoaXMuYmVhdEVuZ2luZS5yZXNldFRpbWUoSW5maW5pdHkpO1xuXG4gICAgLy8gc2luY2Ugd2UgYXJlIGFueXdheSBhIGxpdHRsZSBpbiBhZHZhbmNlLCBtYWtlIHN1cmUgdGhhdCB3ZSBkb24ndCBza2lwXG4gICAgLy8gdGhlIHN0YXJ0IHBvaW50IGR1ZSB0byByb3VuZGluZyBlcnJvcnNcbiAgICBtZXRyaWNQb3NpdGlvbiAtPSBFUFNJTE9OO1xuXG4gICAgdGhpcy5iZWF0UGVyaW9kID0gdGhpcy5iZWF0TGVuZ3RoIC8gbWV0cmljU3BlZWQ7XG4gICAgdGhpcy5iZWF0Q291bnQgPSAwO1xuXG4gICAgaWYgKG1ldHJpY1Bvc2l0aW9uID49IHN0YXJ0UG9zaXRpb24pIHtcbiAgICAgIGNvbnN0IHJlbGF0aXZlUG9zaXRpb24gPSBtZXRyaWNQb3NpdGlvbiAtIHN0YXJ0UG9zaXRpb247XG4gICAgICBjb25zdCBmbG9hdE1lYXN1cmVzID0gcmVsYXRpdmVQb3NpdGlvbiAvIHRoaXMubWVhc3VyZUxlbmd0aDtcbiAgICAgIGNvbnN0IG1lYXN1cmVDb3VudCA9IE1hdGguY2VpbChmbG9hdE1lYXN1cmVzKTtcblxuICAgICAgdGhpcy5tZWFzdXJlQ291bnQgPSBtZWFzdXJlQ291bnQgLSAxO1xuICAgICAgcmV0dXJuIHN0YXJ0UG9zaXRpb24gKyBtZWFzdXJlQ291bnQgKiB0aGlzLm1lYXN1cmVMZW5ndGg7XG4gICAgfVxuXG4gICAgdGhpcy5tZWFzdXJlQ291bnQgPSAtMTtcbiAgICByZXR1cm4gc3RhcnRQb3NpdGlvbjtcbiAgfVxuXG4gIC8vIGdlbmVyYXRlIG5leHQgbWVhc3VyZVxuICBhZHZhbmNlUG9zaXRpb24oc3luY1RpbWUsIG1ldHJpY1Bvc2l0aW9uLCBtZXRyaWNTcGVlZCkge1xuICAgIGNvbnN0IGF1ZGlvVGltZSA9IGF1ZGlvU2NoZWR1bGVyLmN1cnJlbnRUaW1lO1xuXG4gICAgdGhpcy5tZWFzdXJlQ291bnQrKztcbiAgICB0aGlzLmJlYXRDb3VudCA9IDA7XG5cbiAgICAvLyB3aGV0aGVyIG1ldHJvbm9tZSBjb250aW51ZXMgKGRlZmF1bHQgaXMgdHJ1ZSlcbiAgICBjb25zdCBjb250ID0gdGhpcy5jYWxsYmFjayh0aGlzLm1lYXN1cmVDb3VudCwgMCk7XG5cbiAgICBpZiAoY29udCA9PT0gdW5kZWZpbmVkIHx8IGNvbnQgPT09IHRydWUpIHtcbiAgICAgIGlmICh0aGlzLmJlYXRFbmdpbmUpXG4gICAgICAgIHRoaXMuYmVhdEVuZ2luZS5yZXNldFRpbWUoYXVkaW9UaW1lICsgdGhpcy5iZWF0UGVyaW9kKTtcblxuICAgICAgcmV0dXJuIG1ldHJpY1Bvc2l0aW9uICsgdGhpcy5tZWFzdXJlTGVuZ3RoO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmJlYXRFbmdpbmUpXG4gICAgICB0aGlzLmJlYXRFbmdpbmUucmVzZXRUaW1lKEluZmluaXR5KTtcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuYmVhdEVuZ2luZSlcbiAgICAgIHRoaXMuYmVhdEVuZ2luZS5kZXN0cm95KCk7XG5cbiAgICBpZiAodGhpcy5tYXN0ZXIpXG4gICAgICB0aGlzLm1hc3Rlci5yZW1vdmUodGhpcyk7XG4gIH1cbn1cblxuY2xhc3MgTWV0cmljU2NoZWR1bGVyIGV4dGVuZHMgU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKFNFUlZJQ0VfSUQsIHRydWUpO1xuXG4gICAgdGhpcy5fc3luY1NjaGVkdWxlciA9IHRoaXMucmVxdWlyZSgnc3luYy1zY2hlZHVsZXInKTtcblxuICAgIHRoaXMuX2VuZ2luZVF1ZXVlID0gbmV3IGF1ZGlvLlByaW9yaXR5UXVldWUoKTtcbiAgICB0aGlzLl9lbmdpbmVTZXQgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fbWV0cm9ub21lRW5naW5lTWFwID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5fdGVtcG8gPSA2MDsgLy8gdGVtcG8gaW4gYmVhdHMgcGVyIG1pbnV0ZSAoQlBNKVxuICAgIHRoaXMuX3RlbXBvVW5pdCA9IDAuMjU7IC8vIHRlbXBvIHVuaXQgZXhwcmVzc2VkIGluIGZyYWN0aW9ucyBvZiBhIHdob2xlIG5vdGVcbiAgICB0aGlzLl9tZXRyaWNTcGVlZCA9IDAuMjU7IC8vIHdob2xlIG5vdGVzIHBlciBzZWNvbmRcblxuICAgIHRoaXMuX3N5bmNUaW1lID0gMDtcbiAgICB0aGlzLl9tZXRyaWNQb3NpdGlvbiA9IDA7XG5cbiAgICB0aGlzLl9zeW5jU2NoZWR1bGVySG9vayA9IG51bGw7XG4gICAgdGhpcy5fc3luY0V2ZW50RW5naW5lID0gbnVsbDtcblxuICAgIHRoaXMuX2xpc3RlbmVycyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9jYWxsaW5nRXZlbnRMaXN0ZW5lcnMgPSBmYWxzZTtcblxuICAgIC8vIGNvbnN0IGRlZmF1bHRzID0ge307XG4gICAgLy8gdGhpcy5jb25maWd1cmUoZGVmYXVsdHMpO1xuXG4gICAgdGhpcy5fb25Jbml0ID0gdGhpcy5fb25Jbml0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25TeW5jID0gdGhpcy5fb25TeW5jLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25DbGVhciA9IHRoaXMuX29uQ2xlYXIuYmluZCh0aGlzKTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHN1cGVyLnN0YXJ0KCk7XG5cbiAgICBpZiAoIXRoaXMuaGFzU3RhcnRlZClcbiAgICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgdGhpcy5fc3luY1NjaGVkdWxlckhvb2sgPSBuZXcgU3luY1NjaGVkdWxlckhvb2sodGhpcy5fc3luY1NjaGVkdWxlciwgdGhpcyk7XG4gICAgdGhpcy5fc3luY0V2ZW50RW5naW5lID0gbmV3IFN5bmNFdmVudEVuZ2luZSh0aGlzLl9zeW5jU2NoZWR1bGVyLCB0aGlzKTtcblxuICAgIHRoaXMuc2VuZCgncmVxdWVzdCcpO1xuICAgIHRoaXMucmVjZWl2ZSgnaW5pdCcsIHRoaXMuX29uSW5pdCk7XG4gICAgdGhpcy5yZWNlaXZlKCdjbGVhcicsIHRoaXMuX29uQ2xlYXIpO1xuICAgIHRoaXMucmVjZWl2ZSgnc3luYycsIHRoaXMuX29uU3luYyk7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIHN1cGVyLnN0b3AoKTtcbiAgfVxuXG4gIF9jYWxsRXZlbnRMaXN0ZW5lcnMoZXZlbnQpIHtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMuZ2V0KGV2ZW50KTtcblxuICAgIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgIHRoaXMuX2NhbGxpbmdFdmVudExpc3RlbmVycyA9IHRydWU7XG5cbiAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIHN5bmNUaW1lOiB0aGlzLl9zeW5jVGltZSxcbiAgICAgICAgbWV0cmljUG9zaXRpb246IHRoaXMuX21ldHJpY1Bvc2l0aW9uLFxuICAgICAgICB0ZW1wbzogdGhpcy5fdGVtcG8sXG4gICAgICAgIHRlbXBvVW5pdDogdGhpcy5fdGVtcG9Vbml0LFxuICAgICAgfTtcblxuICAgICAgZm9yIChsZXQgY2FsbGJhY2sgb2YgbGlzdGVuZXJzKVxuICAgICAgICBjYWxsYmFjayhldmVudCwgZGF0YSk7XG5cbiAgICAgIHRoaXMuX2NhbGxpbmdFdmVudExpc3RlbmVycyA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIF9yZXNjaGVkdWxlTWV0cmljRW5naW5lcygpIHtcbiAgICBjb25zdCBzeW5jVGltZSA9IHRoaXMuc3luY1RpbWU7XG4gICAgY29uc3QgbWV0cmljUG9zaXRpb24gPSB0aGlzLmdldE1ldHJpY1Bvc2l0aW9uQXRTeW5jVGltZShzeW5jVGltZSk7XG5cbiAgICB0aGlzLl9lbmdpbmVRdWV1ZS5jbGVhcigpO1xuXG4gICAgaWYgKHRoaXMuX21ldHJpY1NwZWVkID4gMCkge1xuICAgICAgLy8gcG9zaXRpb24gZW5naW5lc1xuICAgICAgY29uc3QgbWV0cmljU3BlZWQgPSB0aGlzLl9tZXRyaWNTcGVlZDtcbiAgICAgIGNvbnN0IHF1ZXVlID0gdGhpcy5fZW5naW5lUXVldWU7XG5cbiAgICAgIGZvciAobGV0IGVuZ2luZSBvZiB0aGlzLl9lbmdpbmVTZXQpIHtcbiAgICAgICAgY29uc3QgbmV4dEVuZ2luZVBvc2l0aW9uID0gZW5naW5lLnN5bmNQb3NpdGlvbihzeW5jVGltZSwgbWV0cmljUG9zaXRpb24sIG1ldHJpY1NwZWVkKTtcbiAgICAgICAgcXVldWUuaW5zZXJ0KGVuZ2luZSwgbmV4dEVuZ2luZVBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9wqBcbiAgICBlbHNlIHtcbiAgICAgIC8vIHN0b3AgZW5naW5lc1xuICAgICAgZm9yIChsZXQgZW5naW5lIG9mIHRoaXMuX2VuZ2luZVNldCkge1xuICAgICAgICBpZihlbmdpbmUuc3luY1NwZWVkKVxuICAgICAgICAgIGVuZ2luZS5zeW5jU3BlZWQoc3luY1RpbWUsIG1ldHJpY1Bvc2l0aW9uLCAwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9zeW5jU2NoZWR1bGVySG9vay5yZXNjaGVkdWxlKCk7XG4gIH1cblxuICBfY2xlYXJFbmdpbmVzKCkge1xuICAgIHRoaXMuX2VuZ2luZVF1ZXVlLmNsZWFyKCk7XG4gICAgdGhpcy5fZW5naW5lU2V0LmNsZWFyKCk7XG5cbiAgICBmb3IgKGxldCBba2V5LCBlbmdpbmVdIG9mIHRoaXMuX21ldHJvbm9tZUVuZ2luZU1hcClcbiAgICAgIGVuZ2luZS5kZXN0cm95KCk7XG5cbiAgICB0aGlzLl9tZXRyb25vbWVFbmdpbmVNYXAuY2xlYXIoKTtcblxuICAgIHRoaXMuX3N5bmNTY2hlZHVsZXJIb29rLnJlc2NoZWR1bGUoKTtcbiAgfVxuXG4gIF9hZHZhbmNlUG9zaXRpb24oc3luY1RpbWUsIG1ldHJpY1Bvc2l0aW9uLCBtZXRyaWNTcGVlZCkge1xuICAgIGNvbnN0IGVuZ2luZSA9IHRoaXMuX2VuZ2luZVF1ZXVlLmhlYWQ7XG4gICAgY29uc3QgbmV4dEVuZ2luZVBvc2l0aW9uID0gZW5naW5lLmFkdmFuY2VQb3NpdGlvbihzeW5jVGltZSwgbWV0cmljUG9zaXRpb24sIG1ldHJpY1NwZWVkKTtcblxuICAgIGlmIChuZXh0RW5naW5lUG9zaXRpb24gPT09IHVuZGVmaW5lZClcbiAgICAgIHRoaXMuX2VuZ2luZVNldC5kZWxldGUoZW5naW5lKTtcblxuICAgIHJldHVybiB0aGlzLl9lbmdpbmVRdWV1ZS5tb3ZlKGVuZ2luZSwgbmV4dEVuZ2luZVBvc2l0aW9uKTtcbiAgfVxuXG4gIF9zeW5jKHN5bmNUaW1lLCBtZXRyaWNQb3NpdGlvbiwgdGVtcG8sIHRlbXBvVW5pdCwgZXZlbnQpIHtcbiAgICB0aGlzLl9zeW5jVGltZSA9IHN5bmNUaW1lO1xuICAgIHRoaXMuX21ldHJpY1Bvc2l0aW9uID0gbWV0cmljUG9zaXRpb247XG5cbiAgICB0aGlzLl90ZW1wbyA9IHRlbXBvO1xuICAgIHRoaXMuX3RlbXBvVW5pdCA9IHRlbXBvVW5pdDtcbiAgICB0aGlzLl9tZXRyaWNTcGVlZCA9IHRlbXBvICogdGVtcG9Vbml0IC8gNjA7XG5cbiAgICBpZiAoZXZlbnQpXG4gICAgICB0aGlzLl9jYWxsRXZlbnRMaXN0ZW5lcnMoZXZlbnQpO1xuXG4gICAgdGhpcy5fcmVzY2hlZHVsZU1ldHJpY0VuZ2luZXMoKTtcbiAgfVxuXG4gIF9jbGVhclN5bmNFdmVudCgpIHtcbiAgICB0aGlzLl9zeW5jRXZlbnRFbmdpbmUucmVzZXQoKTtcbiAgfVxuXG4gIF9zZXRTeW5jRXZlbnQoc3luY1RpbWUsIG1ldHJpY1Bvc2l0aW9uLCB0ZW1wbywgdGVtcG9Vbml0LCBldmVudCkge1xuICAgIHRoaXMuX2NsZWFyU3luY0V2ZW50KCk7XG5cbiAgICBpZiAoc3luY1RpbWUgPiB0aGlzLnN5bmNUaW1lKVxuICAgICAgdGhpcy5fc3luY0V2ZW50RW5naW5lLnNldChzeW5jVGltZSwgbWV0cmljUG9zaXRpb24sIHRlbXBvLCB0ZW1wb1VuaXQsIGV2ZW50KTtcbiAgICBlbHNlXG4gICAgICB0aGlzLl9zeW5jKHN5bmNUaW1lLCBtZXRyaWNQb3NpdGlvbiwgdGVtcG8sIHRlbXBvVW5pdCwgZXZlbnQpO1xuICB9XG5cbiAgX29uSW5pdChzeW5jVGltZSwgbWV0cmljUG9zaXRpb24sIHRlbXBvLCB0ZW1wb1VuaXQpIHtcbiAgICB0aGlzLl9zeW5jKHN5bmNUaW1lLCBtZXRyaWNQb3NpdGlvbiwgdGVtcG8sIHRlbXBvVW5pdCk7XG4gICAgdGhpcy5yZWFkeSgpO1xuICB9XG5cbiAgX29uQ2xlYXIoKSB7XG4gICAgdGhpcy5fY2xlYXJTeW5jRXZlbnQoKTtcbiAgICB0aGlzLl9jbGVhckVuZ2luZXMoKTtcbiAgfVxuXG4gIF9vblN5bmMoc3luY1RpbWUsIG1ldHJpY1Bvc2l0aW9uLCB0ZW1wbywgdGVtcG9Vbml0LCBldmVudCkge1xuICAgIHRoaXMuX3NldFN5bmNFdmVudChzeW5jVGltZSwgbWV0cmljUG9zaXRpb24sIHRlbXBvLCB0ZW1wb1VuaXQsIGV2ZW50KTtcbiAgfVxuXG4gIGdldCBhdWRpb1RpbWUoKSB7XG4gICAgcmV0dXJuIGF1ZGlvU2NoZWR1bGVyLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgZ2V0IHN5bmNUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9zeW5jU2NoZWR1bGVyLnN5bmNUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9zeW5jU2NoZWR1bGVyLnN5bmNUaW1lO1xuICB9XG5cbiAgZ2V0IG1ldHJpY1Bvc2l0aW9uKCkge1xuICAgIGlmICh0aGlzLl90ZW1wbyA+IDApXG4gICAgICByZXR1cm4gdGhpcy5fbWV0cmljUG9zaXRpb24gKyAodGhpcy5fc3luY1NjaGVkdWxlci5zeW5jVGltZSAtIHRoaXMuX3N5bmNUaW1lKSAqIHRoaXMuX21ldHJpY1NwZWVkO1xuXG4gICAgcmV0dXJuIHRoaXMuX21ldHJpY1Bvc2l0aW9uO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNQb3NpdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaWZmZXJlbmNlIGJldHdlZW4gdGhlIGF1ZGlvIHNjaGVkdWxlcidzIGxvZ2ljYWwgYXVkaW8gdGltZSBhbmQgdGhlIGBjdXJyZW50VGltZWBcbiAgICogb2YgdGhlIGF1ZGlvIGNvbnRleHQuXG4gICAqL1xuICBnZXQgZGVsdGFUaW1lKCkge1xuICAgIHJldHVybiBhdWRpb1NjaGVkdWxlci5jdXJyZW50VGltZSAtIGF1ZGlvLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDdXJyZW50IHRlbXBvLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gVGVtcG8gaW4gQlBNLlxuICAgKi9cbiAgZ2V0IHRlbXBvKCkge1xuICAgIHJldHVybiB0aGlzLl90ZW1wbztcbiAgfVxuXG4gIC8qKlxuICAgKiBDdXJyZW50IHRlbXBvIHVuaXQuXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBUZW1wbyB1bml0IGluIHJlc3BlY3QgdG8gd2hvbGUgbm90ZS5cbiAgICovXG4gIGdldCB0ZW1wb1VuaXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RlbXBvVW5pdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgbWV0cmljIHBvc2l0aW9uIGNvcnJzcG9uZGluZyB0byBhIGdpdmVuIGF1ZGlvIHRpbWUgKHJlZ2FyZGluZyB0aGUgY3VycmVudCB0ZW1wbykuXG4gICAqIEBwYXJhbSAge051bWJlcn0gdGltZSAtIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSAtIG1ldHJpYyBwb3NpdGlvblxuICAgKi9cbiAgZ2V0TWV0cmljUG9zaXRpb25BdEF1ZGlvVGltZShhdWRpb1RpbWUpIHtcbiAgICBpZiAodGhpcy5fdGVtcG8gPiAwKSB7XG4gICAgICBjb25zdCBzeW5jVGltZSA9IHRoaXMuX3N5bmNTY2hlZHVsZXIuZ2V0U3luY1RpbWVBdEF1ZGlvVGltZShhdWRpb1RpbWUpO1xuICAgICAgcmV0dXJuIHRoaXMuX21ldHJpY1Bvc2l0aW9uICsgKHN5bmNUaW1lIC0gdGhpcy5fc3luY1RpbWUpICogdGhpcy5fbWV0cmljU3BlZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX21ldHJpY1Bvc2l0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBtZXRyaWMgcG9zaXRpb24gY29ycnNwb25kaW5nIHRvIGEgZ2l2ZW4gc3luYyB0aW1lIChyZWdhcmRpbmcgdGhlIGN1cnJlbnQgdGVtcG8pLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHRpbWUgLSB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBtZXRyaWMgcG9zaXRpb25cbiAgICovXG4gIGdldE1ldHJpY1Bvc2l0aW9uQXRTeW5jVGltZShzeW5jVGltZSkge1xuICAgIGlmICh0aGlzLl90ZW1wbyA+IDApXG4gICAgICByZXR1cm4gdGhpcy5fbWV0cmljUG9zaXRpb24gKyAoc3luY1RpbWUgLSB0aGlzLl9zeW5jVGltZSkgKiB0aGlzLl9tZXRyaWNTcGVlZDtcblxuICAgIHJldHVybiB0aGlzLl9tZXRyaWNQb3NpdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgc3luYyB0aW1lIGNvcnJlc3BvbmRpbmcgdG8gYSBnaXZlbiBtZXRyaWMgcG9zaXRpb24gKHJlZ2FyZGluZyB0aGUgY3VycmVudCB0ZW1wbykuXG4gICAqIEBwYXJhbSAge051bWJlcn0gcG9zaXRpb24gLSBtZXRyaWMgcG9zaXRpb25cbiAgICogQHJldHVybiB7TnVtYmVyfSAtIHN5bmMgdGltZVxuICAgKi9cbiAgZ2V0U3luY1RpbWVBdE1ldHJpY1Bvc2l0aW9uKG1ldHJpY1Bvc2l0aW9uKSB7XG4gICAgY29uc3QgbWV0cmljU3BlZWQgPSB0aGlzLl9tZXRyaWNTcGVlZDtcblxuICAgIGlmIChtZXRyaWNQb3NpdGlvbiA8IEluZmluaXR5ICYmIG1ldHJpY1NwZWVkID4gMClcbiAgICAgIHJldHVybiB0aGlzLl9zeW5jVGltZSArIChtZXRyaWNQb3NpdGlvbiAtIHRoaXMuX21ldHJpY1Bvc2l0aW9uKSAvIG1ldHJpY1NwZWVkO1xuXG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhdWRpbyB0aW1lIGNvcnJlc3BvbmRpbmcgdG8gYSBnaXZlbiBtZXRyaWMgcG9zaXRpb24gKHJlZ2FyZGluZyB0aGUgY3VycmVudCB0ZW1wbykuXG4gICAqIEBwYXJhbSAge051bWJlcn0gcG9zaXRpb24gLSBtZXRyaWMgcG9zaXRpb25cbiAgICogQHJldHVybiB7TnVtYmVyfSAtIGF1ZGlvIHRpbWVcbiAgICovXG4gIGdldEF1ZGlvVGltZUF0TWV0cmljUG9zaXRpb24obWV0cmljUG9zaXRpb24pIHtcbiAgICBjb25zdCBtZXRyaWNTcGVlZCA9IHRoaXMuX21ldHJpY1NwZWVkO1xuXG4gICAgaWYgKG1ldHJpY1Bvc2l0aW9uIDwgSW5maW5pdHkgJiYgbWV0cmljU3BlZWQgPiAwKSB7XG4gICAgICBjb25zdCBzeW5jVGltZSA9IHRoaXMuX3N5bmNUaW1lICsgKG1ldHJpY1Bvc2l0aW9uIC0gdGhpcy5fbWV0cmljUG9zaXRpb24pIC8gbWV0cmljU3BlZWQ7XG4gICAgICByZXR1cm4gdGhpcy5fc3luY1NjaGVkdWxlci5nZXRBdWRpb1RpbWVBdFN5bmNUaW1lKHN5bmNUaW1lKTtcbiAgICB9XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICBhZGRFdmVudExpc3RlbmVyKGV2ZW50LCBjYWxsYmFjaykge1xuICAgIGxldCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMuZ2V0KGV2ZW50KTtcblxuICAgIGlmICghbGlzdGVuZXJzKSB7XG4gICAgICBsaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG4gICAgICB0aGlzLl9saXN0ZW5lcnMuc2V0KGV2ZW50LCBsaXN0ZW5lcnMpO1xuICAgIH1cblxuICAgIGxpc3RlbmVycy5hZGQoY2FsbGJhY2spO1xuICB9XG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcihjYWxsYmFjaykge1xuICAgIGxldCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMuZ2V0KGV2ZW50KTtcblxuICAgIGlmIChsaXN0ZW5lcnMpXG4gICAgICBsaXN0ZW5lcnMucmVtb3ZlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIGEgZnVuY3Rpb24gYXQgYSBnaXZlbiBtZXRyaWMgcG9zaXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1biAtIEZ1bmN0aW9uIHRvIGJlIGRlZmVycmVkLlxuICAgKiBAcGFyYW0ge051bWJlcn0gbWV0cmljUG9zaXRpb24gLSBUaGUgbWV0cmljIHBvc2l0aW9uIGF0IHdoaWNoIHRoZSBmdW5jdGlvbiBzaG91bGQgYmUgZXhlY3V0ZWQuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2xvb2thaGVhZD1mYWxzZV0gLSBEZWZpbmVzIHdoZXRoZXIgdGhlIGZ1bmN0aW9uIGlzIGNhbGxlZFxuICAgKiAgYW50aWNpcGF0ZWQgKGUuZy4gZm9yIGF1ZGlvIGV2ZW50cykgb3IgcHJlY2lzZWx5IGF0IHRoZSBnaXZlbiB0aW1lIChkZWZhdWx0KS5cbiAgICovXG4gIGFkZEV2ZW50KGZ1biwgbWV0cmljUG9zaXRpb24sIGxvb2thaGVhZCA9IGZhbHNlKSB7XG4gICAgY29uc3Qgc2NoZWR1bGVyU2VydmljZSA9IHRoaXM7XG4gICAgY29uc3QgZW5naW5lID0ge1xuICAgICAgdGltZW91dDogbnVsbCxcbiAgICAgIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICAgICAgaWYgKHNwZWVkID09PSAwKVxuICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuICAgICAgfSxcbiAgICAgIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG5cbiAgICAgICAgaWYgKG1ldHJpY1Bvc2l0aW9uID49IHBvc2l0aW9uKVxuICAgICAgICAgIHJldHVybiBtZXRyaWNQb3NpdGlvbjtcblxuICAgICAgICByZXR1cm4gSW5maW5pdHk7XG4gICAgICB9LFxuICAgICAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgICAgICBjb25zdCBkZWx0YSA9IHNjaGVkdWxlclNlcnZpY2UuZGVsdGFUaW1lO1xuXG4gICAgICAgIGlmIChkZWx0YSA+IDApXG4gICAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dChmdW4sIDEwMDAgKiBkZWx0YSwgcG9zaXRpb24pOyAvLyBicmlkZ2Ugc2NoZWR1bGVyIGxvb2thaGVhZCB3aXRoIHRpbWVvdXRcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZ1bihwb3NpdGlvbik7XG5cbiAgICAgICAgcmV0dXJuIEluZmluaXR5O1xuICAgICAgfSxcbiAgICB9O1xuXG4gICAgdGhpcy5hZGQoZW5naW5lLCBtZXRyaWNQb3NpdGlvbik7IC8vIGFkZCB3aXRob3V0IGNoZWNrc1xuICB9XG5cbiAgYWRkKGVuZ2luZSwgc3RhcnRQb3NpdGlvbiA9IHRoaXMubWV0cmljUG9zaXRpb24pIHtcbiAgICB0aGlzLl9lbmdpbmVTZXQuYWRkKGVuZ2luZSk7XG5cbiAgICBjb25zdCBtZXRyaWNQb3NpdGlvbiA9IE1hdGgubWF4KHN0YXJ0UG9zaXRpb24sIHRoaXMubWV0cmljUG9zaXRpb24pO1xuXG4gICAgLy8gc2NoZWR1bGUgZW5naW5lXG4gICAgaWYgKCF0aGlzLl9jYWxsaW5nRXZlbnRMaXN0ZW5lcnMgJiYgdGhpcy5fbWV0cmljU3BlZWQgPiAwKSB7XG4gICAgICBjb25zdCBzeW5jVGltZSA9IHRoaXMuc3luY1RpbWU7XG4gICAgICBjb25zdCBuZXh0RW5naW5lUG9zaXRpb24gPSBlbmdpbmUuc3luY1Bvc2l0aW9uKHN5bmNUaW1lLCBtZXRyaWNQb3NpdGlvbiwgdGhpcy5fbWV0cmljU3BlZWQpO1xuXG4gICAgICB0aGlzLl9lbmdpbmVRdWV1ZS5pbnNlcnQoZW5naW5lLCBuZXh0RW5naW5lUG9zaXRpb24pO1xuICAgICAgdGhpcy5fc3luY1NjaGVkdWxlckhvb2sucmVzY2hlZHVsZSgpO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZShlbmdpbmUpIHtcbiAgICBjb25zdCBzeW5jVGltZSA9IHRoaXMuc3luY1RpbWU7XG4gICAgY29uc3QgbWV0cmljUG9zaXRpb24gPSB0aGlzLmdldE1ldHJpY1Bvc2l0aW9uQXRTeW5jVGltZShzeW5jVGltZSk7XG5cbiAgICAvLyBzdG9wIGVuZ2luZVxuICAgIGlmIChlbmdpbmUuc3luY1NwZWVkKVxuICAgICAgZW5naW5lLnN5bmNTcGVlZChzeW5jVGltZSwgbWV0cmljUG9zaXRpb24sIDApO1xuXG4gICAgaWYgKHRoaXMuX2VuZ2luZVNldC5kZWxldGUoZW5naW5lKSAmJiAhdGhpcy5fY2FsbGluZ0V2ZW50TGlzdGVuZXJzICYmIHRoaXMuX21ldHJpY1NwZWVkID4gMCkge1xuICAgICAgdGhpcy5fZW5naW5lUXVldWUucmVtb3ZlKGVuZ2luZSk7XG4gICAgICB0aGlzLl9zeW5jU2NoZWR1bGVySG9vay5yZXNjaGVkdWxlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHBlcmlvZGljIGNhbGxiYWNrIHN0YXJ0aW5nIGF0IGEgZ2l2ZW4gbWV0cmljIHBvc2l0aW9uLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIGNhbGxiYWNrIGZ1bmN0aW9uIChjeWNsZSwgYmVhdClcbiAgICogQHBhcmFtIHtJbnRlZ2VyfSBudW1CZWF0cyAtIG51bWJlciBvZiBiZWF0cyAodGltZSBzaWduYXR1cmUgbnVtZXJhdG9yKVxuICAgKiBAcGFyYW0ge051bWJlcn0gbWV0cmljRGl2IC0gbWV0cmljIGRpdmlzaW9uIG9mIHdob2xlIG5vdGUgKHRpbWUgc2lnbmF0dXJlIGRlbm9taW5hdG9yKVxuICAgKiBAcGFyYW0ge051bWJlcn0gdGVtcG9TY2FsZSAtIGxpbmVhciB0ZW1wbyBzY2FsZSBmYWN0b3IgKGluIHJlc3BlY3QgdG8gbWFzdGVyIHRlbXBvKVxuICAgKiBAcGFyYW0ge0ludGVnZXJ9IHN0YXJ0UG9zaXRpb24gLSBtZXRyaWMgc3RhcnQgcG9zaXRpb24gb2YgdGhlIGJlYXRcbiAgICovXG4gIGFkZE1ldHJvbm9tZShjYWxsYmFjaywgbnVtQmVhdHMgPSA0LCBtZXRyaWNEaXYgPSA0LCB0ZW1wb1NjYWxlID0gMSwgc3RhcnRQb3NpdGlvbiA9IDApIHtcbiAgICBjb25zdCBiZWF0TGVuZ3RoID0gMSAvIChtZXRyaWNEaXYgKiB0ZW1wb1NjYWxlKTtcbiAgICBjb25zdCBlbmdpbmUgPSBuZXcgTWV0cm9ub21lRW5naW5lKHN0YXJ0UG9zaXRpb24sIG51bUJlYXRzLCBiZWF0TGVuZ3RoLCBjYWxsYmFjayk7XG5cbiAgICB0aGlzLl9tZXRyb25vbWVFbmdpbmVNYXAuc2V0KGNhbGxiYWNrLCBlbmdpbmUpO1xuICAgIHRoaXMuYWRkKGVuZ2luZSwgc3RhcnRQb3NpdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHBlcmlvZGljIGNhbGxiYWNrLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFjayBmdW5jdGlvblxuICAgKi9cbiAgcmVtb3ZlTWV0cm9ub21lKGNhbGxiYWNrIC8qLCBlbmRQb3NpdGlvbiAqLykge1xuICAgIGNvbnN0IGVuZ2luZSA9IHRoaXMuX21ldHJvbm9tZUVuZ2luZU1hcC5nZXQoY2FsbGJhY2spO1xuXG4gICAgaWYgKGVuZ2luZSkge1xuICAgICAgdGhpcy5fbWV0cm9ub21lRW5naW5lTWFwLmRlbGV0ZShjYWxsYmFjayk7XG4gICAgICB0aGlzLnJlbW92ZShlbmdpbmUpO1xuICAgIH1cbiAgfVxufVxuXG5zZXJ2aWNlTWFuYWdlci5yZWdpc3RlcihTRVJWSUNFX0lELCBNZXRyaWNTY2hlZHVsZXIpO1xuXG5leHBvcnQgZGVmYXVsdCBNZXRyaWNTY2hlZHVsZXI7XG4iXX0=