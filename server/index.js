'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Client = require('./core/Client');

Object.defineProperty(exports, 'Client', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Client).default;
  }
});

var _server = require('./core/server');

Object.defineProperty(exports, 'server', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_server).default;
  }
});

var _Activity = require('./core/Activity');

Object.defineProperty(exports, 'Activity', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Activity).default;
  }
});

var _Scene = require('./core/Scene');

Object.defineProperty(exports, 'Scene', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Scene).default;
  }
});

var _Service = require('./core/Service');

Object.defineProperty(exports, 'Service', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Service).default;
  }
});

var _serviceManager = require('./core/serviceManager');

Object.defineProperty(exports, 'serviceManager', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_serviceManager).default;
  }
});

var _sockets = require('./core/sockets');

Object.defineProperty(exports, 'sockets', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_sockets).default;
  }
});

var _BasicSharedController = require('./scenes/BasicSharedController');

Object.defineProperty(exports, 'BasicSharedController', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_BasicSharedController).default;
  }
});

var _Experience = require('./scenes/Experience');

Object.defineProperty(exports, 'Experience', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Experience).default;
  }
});

var _Survey = require('./scenes/Survey');

Object.defineProperty(exports, 'Survey', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Survey).default;
  }
});

var _AudioBufferManager = require('./services/AudioBufferManager');

Object.defineProperty(exports, 'AudioBufferManager', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_AudioBufferManager).default;
  }
});

var _Auth = require('./services/Auth');

Object.defineProperty(exports, 'Auth', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Auth).default;
  }
});

var _Osc = require('./services/Osc');

Object.defineProperty(exports, 'Osc', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Osc).default;
  }
});

var _Checkin = require('./services/Checkin');

Object.defineProperty(exports, 'Checkin', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Checkin).default;
  }
});

var _ErrorReporter = require('./services/ErrorReporter');

Object.defineProperty(exports, 'ErrorReporter', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ErrorReporter).default;
  }
});

var _FileSystem = require('./services/FileSystem');

Object.defineProperty(exports, 'FileSystem', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_FileSystem).default;
  }
});

var _Geolocation = require('./services/Geolocation');

Object.defineProperty(exports, 'Geolocation', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Geolocation).default;
  }
});

var _Locator = require('./services/Locator');

Object.defineProperty(exports, 'Locator', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Locator).default;
  }
});

var _MetricScheduler = require('./services/MetricScheduler');

Object.defineProperty(exports, 'MetricScheduler', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_MetricScheduler).default;
  }
});

var _Network = require('./services/Network');

Object.defineProperty(exports, 'Network', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Network).default;
  }
});

var _Placer = require('./services/Placer');

Object.defineProperty(exports, 'Placer', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Placer).default;
  }
});

var _RawSocket = require('./services/RawSocket');

Object.defineProperty(exports, 'RawSocket', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_RawSocket).default;
  }
});

var _SharedConfig = require('./services/SharedConfig');

Object.defineProperty(exports, 'SharedConfig', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SharedConfig).default;
  }
});

var _SharedParams = require('./services/SharedParams');

Object.defineProperty(exports, 'SharedParams', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SharedParams).default;
  }
});

var _SharedRecorder = require('./services/SharedRecorder');

Object.defineProperty(exports, 'SharedRecorder', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SharedRecorder).default;
  }
});

var _Sync = require('./services/Sync');

Object.defineProperty(exports, 'Sync', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Sync).default;
  }
});

var _SyncScheduler = require('./services/SyncScheduler');

Object.defineProperty(exports, 'SyncScheduler', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SyncScheduler).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Server-side entry point of the *soundworks* framework.
 *
 * @module soundworks/server
 * @example
 * import * as soundworks from 'soundworks/server';
 */

var version = exports.version = '1.1.1';

/* core */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbImRlZmF1bHQiLCJ2ZXJzaW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OzsyQ0FXU0EsTzs7Ozs7Ozs7OzJDQUNBQSxPOzs7Ozs7Ozs7NkNBQ0FBLE87Ozs7Ozs7OzswQ0FDQUEsTzs7Ozs7Ozs7OzRDQUNBQSxPOzs7Ozs7Ozs7bURBQ0FBLE87Ozs7Ozs7Ozs0Q0FDQUEsTzs7Ozs7Ozs7OzBEQUdBQSxPOzs7Ozs7Ozs7K0NBQ0FBLE87Ozs7Ozs7OzsyQ0FDQUEsTzs7Ozs7Ozs7O3VEQUdBQSxPOzs7Ozs7Ozs7eUNBQ0FBLE87Ozs7Ozs7Ozt3Q0FDQUEsTzs7Ozs7Ozs7OzRDQUNBQSxPOzs7Ozs7Ozs7a0RBQ0FBLE87Ozs7Ozs7OzsrQ0FDQUEsTzs7Ozs7Ozs7O2dEQUNBQSxPOzs7Ozs7Ozs7NENBQ0FBLE87Ozs7Ozs7OztvREFDQUEsTzs7Ozs7Ozs7OzRDQUNBQSxPOzs7Ozs7Ozs7MkNBQ0FBLE87Ozs7Ozs7Ozs4Q0FDQUEsTzs7Ozs7Ozs7O2lEQUNBQSxPOzs7Ozs7Ozs7aURBQ0FBLE87Ozs7Ozs7OzttREFDQUEsTzs7Ozs7Ozs7O3lDQUNBQSxPOzs7Ozs7Ozs7a0RBQ0FBLE87Ozs7OztBQXpDVDs7Ozs7Ozs7QUFRTyxJQUFNQyw0QkFBVSxXQUFoQjs7QUFFUCIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogU2VydmVyLXNpZGUgZW50cnkgcG9pbnQgb2YgdGhlICpzb3VuZHdvcmtzKiBmcmFtZXdvcmsuXG4gKlxuICogQG1vZHVsZSBzb3VuZHdvcmtzL3NlcnZlclxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9zZXJ2ZXInO1xuICovXG5cbmV4cG9ydCBjb25zdCB2ZXJzaW9uID0gJyV2ZXJzaW9uJSc7XG5cbi8qIGNvcmUgKi9cbmV4cG9ydCB7IGRlZmF1bHQgYXMgQ2xpZW50IH0gZnJvbSAnLi9jb3JlL0NsaWVudCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIHNlcnZlciB9IGZyb20gJy4vY29yZS9zZXJ2ZXInO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBBY3Rpdml0eSB9IGZyb20gJy4vY29yZS9BY3Rpdml0eSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFNjZW5lIH0gZnJvbSAnLi9jb3JlL1NjZW5lJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2VydmljZSB9IGZyb20gJy4vY29yZS9TZXJ2aWNlJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgc2VydmljZU1hbmFnZXIgfSBmcm9tICcuL2NvcmUvc2VydmljZU1hbmFnZXInO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBzb2NrZXRzIH0gZnJvbSAnLi9jb3JlL3NvY2tldHMnO1xuXG4vKiBzY2VuZXMgKi9cbmV4cG9ydCB7IGRlZmF1bHQgYXMgQmFzaWNTaGFyZWRDb250cm9sbGVyIH0gZnJvbSAnLi9zY2VuZXMvQmFzaWNTaGFyZWRDb250cm9sbGVyJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgRXhwZXJpZW5jZSB9IGZyb20gJy4vc2NlbmVzL0V4cGVyaWVuY2UnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTdXJ2ZXkgfSBmcm9tICcuL3NjZW5lcy9TdXJ2ZXknO1xuXG4vKiBzZXJ2aWNlcyAqL1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBBdWRpb0J1ZmZlck1hbmFnZXIgfSBmcm9tICcuL3NlcnZpY2VzL0F1ZGlvQnVmZmVyTWFuYWdlcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIEF1dGggfSBmcm9tICcuL3NlcnZpY2VzL0F1dGgnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBPc2MgfSBmcm9tICcuL3NlcnZpY2VzL09zYyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIENoZWNraW4gfSBmcm9tICcuL3NlcnZpY2VzL0NoZWNraW4nO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBFcnJvclJlcG9ydGVyIH0gZnJvbSAnLi9zZXJ2aWNlcy9FcnJvclJlcG9ydGVyJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgRmlsZVN5c3RlbSB9IGZyb20gJy4vc2VydmljZXMvRmlsZVN5c3RlbSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIEdlb2xvY2F0aW9uIH0gZnJvbSAnLi9zZXJ2aWNlcy9HZW9sb2NhdGlvbic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIExvY2F0b3IgfSBmcm9tICcuL3NlcnZpY2VzL0xvY2F0b3InO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBNZXRyaWNTY2hlZHVsZXIgfSBmcm9tICcuL3NlcnZpY2VzL01ldHJpY1NjaGVkdWxlcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIE5ldHdvcmsgfSBmcm9tICcuL3NlcnZpY2VzL05ldHdvcmsnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBQbGFjZXIgfSBmcm9tICcuL3NlcnZpY2VzL1BsYWNlcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFJhd1NvY2tldCB9IGZyb20gJy4vc2VydmljZXMvUmF3U29ja2V0JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2hhcmVkQ29uZmlnIH0gZnJvbSAnLi9zZXJ2aWNlcy9TaGFyZWRDb25maWcnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTaGFyZWRQYXJhbXMgfSBmcm9tICcuL3NlcnZpY2VzL1NoYXJlZFBhcmFtcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFNoYXJlZFJlY29yZGVyIH0gZnJvbSAnLi9zZXJ2aWNlcy9TaGFyZWRSZWNvcmRlcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFN5bmMgfSBmcm9tICcuL3NlcnZpY2VzL1N5bmMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTeW5jU2NoZWR1bGVyIH0gZnJvbSAnLi9zZXJ2aWNlcy9TeW5jU2NoZWR1bGVyJztcbiJdfQ==