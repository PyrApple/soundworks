'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _client = require('./client');

var _client2 = _interopRequireDefault(_client);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _Signal = require('./Signal');

var _Signal2 = _interopRequireDefault(_Signal);

var _SignalAll = require('./SignalAll');

var _SignalAll2 = _interopRequireDefault(_SignalAll);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _debug2.default)('soundworks:serviceManager');

var _instances = {};
var _ctors = {};

/**
 * Factory and initialisation manager for the services.
 * Lazy instanciate an instance of the given type and retrieve it on each call.
 */
var serviceManager = {
  /**
   * Initialize the manager.
   */
  init: function init() {
    var _this = this;

    log('init');
    this._requiredSignals = new _SignalAll2.default();
    this._requiredSignals.addObserver(function () {
      return _this.ready();
    });

    this.signals = {};
    this.signals.start = new _Signal2.default();
    this.signals.ready = new _Signal2.default();
  },


  /**
   * Sends the signal required by all services to start.
   */
  start: function start() {
    log('start');

    var networkedServices = [];

    this.signals.start.set(true);

    if (!this._requiredSignals.length) this.ready();
  },


  /**
   * Mark the services as ready. This signal is observed by {@link Experience}
   * instances and trigger their `start`.
   */
  ready: function ready() {
    log('ready');
    this.signals.ready.set(true);
  },


  // reset() {
  //   this.signals.start.set(false);
  //   this.signals.ready.set(false);
  // },

  /**
   * Returns an instance of a service with options to be applied to its constructor.
   * @param {String} id - The id of the service.
   * @param {Object} options - Options to pass to the service constructor.
   */
  require: function require(id) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    id = 'service:' + id;

    if (!_ctors[id]) throw new Error('Service "' + id + '" is not defined');

    var instance = _instances[id];

    if (!instance) {
      // throw an error if manager already started
      if (this.signals.start.get() === true) throw new Error('Service "' + id + '" required after application start');

      instance = new _ctors[id]();
      // add the instance ready signal as required for the manager
      this._requiredSignals.add(instance.signals.ready);
      // store instance
      _instances[id] = instance;
    }

    instance.configure(options);
    return instance;
  },


  /**
   * Register a service with a given id.
   * @param {String} id - The id of the service.
   * @param {Function} ctor - The constructor of the service.
   */
  register: function register(id, ctor) {
    _ctors[id] = ctor;
  },
  getRequiredServices: function getRequiredServices() {
    return (0, _keys2.default)(_instances);
  }
};

exports.default = serviceManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcnZpY2VNYW5hZ2VyLmpzIl0sIm5hbWVzIjpbImxvZyIsIl9pbnN0YW5jZXMiLCJfY3RvcnMiLCJzZXJ2aWNlTWFuYWdlciIsImluaXQiLCJfcmVxdWlyZWRTaWduYWxzIiwiYWRkT2JzZXJ2ZXIiLCJyZWFkeSIsInNpZ25hbHMiLCJzdGFydCIsIm5ldHdvcmtlZFNlcnZpY2VzIiwic2V0IiwibGVuZ3RoIiwicmVxdWlyZSIsImlkIiwib3B0aW9ucyIsIkVycm9yIiwiaW5zdGFuY2UiLCJnZXQiLCJhZGQiLCJjb25maWd1cmUiLCJyZWdpc3RlciIsImN0b3IiLCJnZXRSZXF1aXJlZFNlcnZpY2VzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLElBQU1BLE1BQU0scUJBQU0sMkJBQU4sQ0FBWjs7QUFFQSxJQUFNQyxhQUFhLEVBQW5CO0FBQ0EsSUFBTUMsU0FBUyxFQUFmOztBQUVBOzs7O0FBSUEsSUFBTUMsaUJBQWlCO0FBQ3JCOzs7QUFHQUMsTUFKcUIsa0JBSWQ7QUFBQTs7QUFDTEosUUFBSSxNQUFKO0FBQ0EsU0FBS0ssZ0JBQUwsR0FBd0IseUJBQXhCO0FBQ0EsU0FBS0EsZ0JBQUwsQ0FBc0JDLFdBQXRCLENBQWtDO0FBQUEsYUFBTSxNQUFLQyxLQUFMLEVBQU47QUFBQSxLQUFsQzs7QUFFQSxTQUFLQyxPQUFMLEdBQWUsRUFBZjtBQUNBLFNBQUtBLE9BQUwsQ0FBYUMsS0FBYixHQUFxQixzQkFBckI7QUFDQSxTQUFLRCxPQUFMLENBQWFELEtBQWIsR0FBcUIsc0JBQXJCO0FBQ0QsR0Fab0I7OztBQWNyQjs7O0FBR0FFLE9BakJxQixtQkFpQmI7QUFDTlQsUUFBSSxPQUFKOztBQUVBLFFBQU1VLG9CQUFvQixFQUExQjs7QUFFQSxTQUFLRixPQUFMLENBQWFDLEtBQWIsQ0FBbUJFLEdBQW5CLENBQXVCLElBQXZCOztBQUVBLFFBQUksQ0FBQyxLQUFLTixnQkFBTCxDQUFzQk8sTUFBM0IsRUFDRSxLQUFLTCxLQUFMO0FBQ0gsR0ExQm9COzs7QUE0QnJCOzs7O0FBSUFBLE9BaENxQixtQkFnQ2I7QUFDTlAsUUFBSSxPQUFKO0FBQ0EsU0FBS1EsT0FBTCxDQUFhRCxLQUFiLENBQW1CSSxHQUFuQixDQUF1QixJQUF2QjtBQUNELEdBbkNvQjs7O0FBcUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7QUFLQUUsU0EvQ3FCLG1CQStDYkMsRUEvQ2EsRUErQ0s7QUFBQSxRQUFkQyxPQUFjLHVFQUFKLEVBQUk7O0FBQ3hCRCxTQUFLLGFBQWFBLEVBQWxCOztBQUVBLFFBQUksQ0FBQ1osT0FBT1ksRUFBUCxDQUFMLEVBQ0UsTUFBTSxJQUFJRSxLQUFKLGVBQXNCRixFQUF0QixzQkFBTjs7QUFFRixRQUFJRyxXQUFXaEIsV0FBV2EsRUFBWCxDQUFmOztBQUVBLFFBQUksQ0FBQ0csUUFBTCxFQUFlO0FBQ2I7QUFDQSxVQUFJLEtBQUtULE9BQUwsQ0FBYUMsS0FBYixDQUFtQlMsR0FBbkIsT0FBNkIsSUFBakMsRUFDRSxNQUFNLElBQUlGLEtBQUosZUFBc0JGLEVBQXRCLHdDQUFOOztBQUVGRyxpQkFBVyxJQUFJZixPQUFPWSxFQUFQLENBQUosRUFBWDtBQUNBO0FBQ0EsV0FBS1QsZ0JBQUwsQ0FBc0JjLEdBQXRCLENBQTBCRixTQUFTVCxPQUFULENBQWlCRCxLQUEzQztBQUNBO0FBQ0FOLGlCQUFXYSxFQUFYLElBQWlCRyxRQUFqQjtBQUNEOztBQUVEQSxhQUFTRyxTQUFULENBQW1CTCxPQUFuQjtBQUNBLFdBQU9FLFFBQVA7QUFDRCxHQXJFb0I7OztBQXVFckI7Ozs7O0FBS0FJLFVBNUVxQixvQkE0RVpQLEVBNUVZLEVBNEVSUSxJQTVFUSxFQTRFRjtBQUNqQnBCLFdBQU9ZLEVBQVAsSUFBYVEsSUFBYjtBQUNELEdBOUVvQjtBQWlGckJDLHFCQWpGcUIsaUNBaUZDO0FBQ3BCLFdBQU8sb0JBQVl0QixVQUFaLENBQVA7QUFDRDtBQW5Gb0IsQ0FBdkI7O2tCQXNGZUUsYyIsImZpbGUiOiJzZXJ2aWNlTWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjbGllbnQgZnJvbSAnLi9jbGllbnQnO1xuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCBTaWduYWwgZnJvbSAnLi9TaWduYWwnO1xuaW1wb3J0IFNpZ25hbEFsbCBmcm9tICcuL1NpZ25hbEFsbCc7XG5cbmNvbnN0IGxvZyA9IGRlYnVnKCdzb3VuZHdvcmtzOnNlcnZpY2VNYW5hZ2VyJyk7XG5cbmNvbnN0IF9pbnN0YW5jZXMgPSB7fTtcbmNvbnN0IF9jdG9ycyA9IHt9O1xuXG4vKipcbiAqIEZhY3RvcnkgYW5kIGluaXRpYWxpc2F0aW9uIG1hbmFnZXIgZm9yIHRoZSBzZXJ2aWNlcy5cbiAqIExhenkgaW5zdGFuY2lhdGUgYW4gaW5zdGFuY2Ugb2YgdGhlIGdpdmVuIHR5cGUgYW5kIHJldHJpZXZlIGl0IG9uIGVhY2ggY2FsbC5cbiAqL1xuY29uc3Qgc2VydmljZU1hbmFnZXIgPSB7XG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHRoZSBtYW5hZ2VyLlxuICAgKi9cbiAgaW5pdCgpIHtcbiAgICBsb2coJ2luaXQnKTtcbiAgICB0aGlzLl9yZXF1aXJlZFNpZ25hbHMgPSBuZXcgU2lnbmFsQWxsKCk7XG4gICAgdGhpcy5fcmVxdWlyZWRTaWduYWxzLmFkZE9ic2VydmVyKCgpID0+IHRoaXMucmVhZHkoKSk7XG5cbiAgICB0aGlzLnNpZ25hbHMgPSB7fTtcbiAgICB0aGlzLnNpZ25hbHMuc3RhcnQgPSBuZXcgU2lnbmFsKCk7XG4gICAgdGhpcy5zaWduYWxzLnJlYWR5ID0gbmV3IFNpZ25hbCgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBTZW5kcyB0aGUgc2lnbmFsIHJlcXVpcmVkIGJ5IGFsbCBzZXJ2aWNlcyB0byBzdGFydC5cbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIGxvZygnc3RhcnQnKTtcblxuICAgIGNvbnN0IG5ldHdvcmtlZFNlcnZpY2VzID0gW107XG5cbiAgICB0aGlzLnNpZ25hbHMuc3RhcnQuc2V0KHRydWUpO1xuXG4gICAgaWYgKCF0aGlzLl9yZXF1aXJlZFNpZ25hbHMubGVuZ3RoKVxuICAgICAgdGhpcy5yZWFkeSgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBNYXJrIHRoZSBzZXJ2aWNlcyBhcyByZWFkeS4gVGhpcyBzaWduYWwgaXMgb2JzZXJ2ZWQgYnkge0BsaW5rIEV4cGVyaWVuY2V9XG4gICAqIGluc3RhbmNlcyBhbmQgdHJpZ2dlciB0aGVpciBgc3RhcnRgLlxuICAgKi9cbiAgcmVhZHkoKSB7XG4gICAgbG9nKCdyZWFkeScpO1xuICAgIHRoaXMuc2lnbmFscy5yZWFkeS5zZXQodHJ1ZSk7XG4gIH0sXG5cbiAgLy8gcmVzZXQoKSB7XG4gIC8vICAgdGhpcy5zaWduYWxzLnN0YXJ0LnNldChmYWxzZSk7XG4gIC8vICAgdGhpcy5zaWduYWxzLnJlYWR5LnNldChmYWxzZSk7XG4gIC8vIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gaW5zdGFuY2Ugb2YgYSBzZXJ2aWNlIHdpdGggb3B0aW9ucyB0byBiZSBhcHBsaWVkIHRvIGl0cyBjb25zdHJ1Y3Rvci5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSBzZXJ2aWNlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE9wdGlvbnMgdG8gcGFzcyB0byB0aGUgc2VydmljZSBjb25zdHJ1Y3Rvci5cbiAgICovXG4gIHJlcXVpcmUoaWQsIG9wdGlvbnMgPSB7fSkge1xuICAgIGlkID0gJ3NlcnZpY2U6JyArIGlkO1xuXG4gICAgaWYgKCFfY3RvcnNbaWRdKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBTZXJ2aWNlIFwiJHtpZH1cIiBpcyBub3QgZGVmaW5lZGApO1xuXG4gICAgbGV0IGluc3RhbmNlID0gX2luc3RhbmNlc1tpZF07XG5cbiAgICBpZiAoIWluc3RhbmNlKSB7XG4gICAgICAvLyB0aHJvdyBhbiBlcnJvciBpZiBtYW5hZ2VyIGFscmVhZHkgc3RhcnRlZFxuICAgICAgaWYgKHRoaXMuc2lnbmFscy5zdGFydC5nZXQoKSA9PT0gdHJ1ZSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTZXJ2aWNlIFwiJHtpZH1cIiByZXF1aXJlZCBhZnRlciBhcHBsaWNhdGlvbiBzdGFydGApO1xuXG4gICAgICBpbnN0YW5jZSA9IG5ldyBfY3RvcnNbaWRdKCk7XG4gICAgICAvLyBhZGQgdGhlIGluc3RhbmNlIHJlYWR5IHNpZ25hbCBhcyByZXF1aXJlZCBmb3IgdGhlIG1hbmFnZXJcbiAgICAgIHRoaXMuX3JlcXVpcmVkU2lnbmFscy5hZGQoaW5zdGFuY2Uuc2lnbmFscy5yZWFkeSk7XG4gICAgICAvLyBzdG9yZSBpbnN0YW5jZVxuICAgICAgX2luc3RhbmNlc1tpZF0gPSBpbnN0YW5jZTtcbiAgICB9XG5cbiAgICBpbnN0YW5jZS5jb25maWd1cmUob3B0aW9ucyk7XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIHNlcnZpY2Ugd2l0aCBhIGdpdmVuIGlkLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHNlcnZpY2UuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGN0b3IgLSBUaGUgY29uc3RydWN0b3Igb2YgdGhlIHNlcnZpY2UuXG4gICAqL1xuICByZWdpc3RlcihpZCwgY3Rvcikge1xuICAgIF9jdG9yc1tpZF0gPSBjdG9yO1xuICB9LFxuXG5cbiAgZ2V0UmVxdWlyZWRTZXJ2aWNlcygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoX2luc3RhbmNlcyk7XG4gIH0sXG59O1xuXG5leHBvcnQgZGVmYXVsdCBzZXJ2aWNlTWFuYWdlcjtcblxuIl19