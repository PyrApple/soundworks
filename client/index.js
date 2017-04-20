'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.viewport = exports.View = exports.TouchSurface = exports.SquaredView = exports.SpaceView = exports.SelectView = exports.SegmentedView = exports.RenderingGroup = exports.Renderer = exports.CanvasView = exports.SyncScheduler = exports.Sync = exports.SharedRecorder = exports.SharedParams = exports.SharedConfig = exports.RawSocket = exports.Platform = exports.Placer = exports.Network = exports.MotionInput = exports.MetricScheduler = exports.Locator = exports.Language = exports.Geolocation = exports.FileSystem = exports.ErrorReporter = exports.Checkin = exports.Auth = exports.AudioScheduler = exports.AudioBufferManager = exports.Survey = exports.Experience = exports.BasicSharedController = exports.SignalAll = exports.Signal = exports.serviceManager = exports.Service = exports.Scene = exports.Process = exports.client = exports.Activity = exports.version = exports.audioContext = exports.audio = undefined;

var _wavesAudio = require('waves-audio');

Object.defineProperty(exports, 'audioContext', {
  enumerable: true,
  get: function get() {
    return _wavesAudio.audioContext;
  }
});

var _Activity = require('./core/Activity');

Object.defineProperty(exports, 'Activity', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Activity).default;
  }
});

var _client = require('./core/client');

Object.defineProperty(exports, 'client', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_client).default;
  }
});

var _Process = require('./core/Process');

Object.defineProperty(exports, 'Process', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Process).default;
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

var _Signal = require('./core/Signal');

Object.defineProperty(exports, 'Signal', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Signal).default;
  }
});

var _SignalAll = require('./core/SignalAll');

Object.defineProperty(exports, 'SignalAll', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SignalAll).default;
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

var _AudioScheduler = require('./services/AudioScheduler');

Object.defineProperty(exports, 'AudioScheduler', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_AudioScheduler).default;
  }
});

var _Auth = require('./services/Auth');

Object.defineProperty(exports, 'Auth', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Auth).default;
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

var _Language = require('./services/Language');

Object.defineProperty(exports, 'Language', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Language).default;
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

var _MotionInput = require('./services/MotionInput');

Object.defineProperty(exports, 'MotionInput', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_MotionInput).default;
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

var _Platform = require('./services/Platform');

Object.defineProperty(exports, 'Platform', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Platform).default;
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

var _CanvasView = require('./views/CanvasView');

Object.defineProperty(exports, 'CanvasView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_CanvasView).default;
  }
});

var _Renderer = require('./views/Renderer');

Object.defineProperty(exports, 'Renderer', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Renderer).default;
  }
});

var _RenderingGroup = require('./views/RenderingGroup');

Object.defineProperty(exports, 'RenderingGroup', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_RenderingGroup).default;
  }
});

var _SegmentedView = require('./views/SegmentedView');

Object.defineProperty(exports, 'SegmentedView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SegmentedView).default;
  }
});

var _SelectView = require('./views/SelectView');

Object.defineProperty(exports, 'SelectView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SelectView).default;
  }
});

var _SpaceView = require('./views/SpaceView');

Object.defineProperty(exports, 'SpaceView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SpaceView).default;
  }
});

var _SquaredView = require('./views/SquaredView');

Object.defineProperty(exports, 'SquaredView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SquaredView).default;
  }
});

var _TouchSurface = require('./views/TouchSurface');

Object.defineProperty(exports, 'TouchSurface', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_TouchSurface).default;
  }
});

var _View = require('./views/View');

Object.defineProperty(exports, 'View', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_View).default;
  }
});

var _viewport = require('./views/viewport');

Object.defineProperty(exports, 'viewport', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_viewport).default;
  }
});

var _audio = _interopRequireWildcard(_wavesAudio);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audio = exports.audio = _audio; /**
                                     * Client-side entry point of the *soundworks* framework.
                                     *
                                     * @module soundworks/client
                                     * @example
                                     * import * as soundworks from 'soundworks/client';
                                     */

// export * as audio from 'waves-audio';


// version (cf. bin/javascripts)
var version = exports.version = '1.1.1';

// core
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbImF1ZGlvQ29udGV4dCIsImRlZmF1bHQiLCJfYXVkaW8iLCJhdWRpbyIsInZlcnNpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFTQTs7Ozs7dUJBRVNBLFk7Ozs7Ozs7Ozs2Q0FNQUMsTzs7Ozs7Ozs7OzJDQUNBQSxPOzs7Ozs7Ozs7NENBQ0FBLE87Ozs7Ozs7OzswQ0FDQUEsTzs7Ozs7Ozs7OzRDQUNBQSxPOzs7Ozs7Ozs7bURBQ0FBLE87Ozs7Ozs7OzsyQ0FDQUEsTzs7Ozs7Ozs7OzhDQUNBQSxPOzs7Ozs7Ozs7MERBR0FBLE87Ozs7Ozs7OzsrQ0FDQUEsTzs7Ozs7Ozs7OzJDQUNBQSxPOzs7Ozs7Ozs7dURBR0FBLE87Ozs7Ozs7OzttREFDQUEsTzs7Ozs7Ozs7O3lDQUNBQSxPOzs7Ozs7Ozs7NENBQ0FBLE87Ozs7Ozs7OztrREFDQUEsTzs7Ozs7Ozs7OytDQUNBQSxPOzs7Ozs7Ozs7Z0RBQ0FBLE87Ozs7Ozs7Ozs2Q0FDQUEsTzs7Ozs7Ozs7OzRDQUNBQSxPOzs7Ozs7Ozs7b0RBQ0FBLE87Ozs7Ozs7OztnREFDQUEsTzs7Ozs7Ozs7OzRDQUNBQSxPOzs7Ozs7Ozs7MkNBQ0FBLE87Ozs7Ozs7Ozs2Q0FDQUEsTzs7Ozs7Ozs7OzhDQUNBQSxPOzs7Ozs7Ozs7aURBQ0FBLE87Ozs7Ozs7OztpREFDQUEsTzs7Ozs7Ozs7O21EQUNBQSxPOzs7Ozs7Ozs7eUNBQ0FBLE87Ozs7Ozs7OztrREFDQUEsTzs7Ozs7Ozs7OytDQUdBQSxPOzs7Ozs7Ozs7NkNBQ0FBLE87Ozs7Ozs7OzttREFDQUEsTzs7Ozs7Ozs7O2tEQUNBQSxPOzs7Ozs7Ozs7K0NBQ0FBLE87Ozs7Ozs7Ozs4Q0FDQUEsTzs7Ozs7Ozs7O2dEQUNBQSxPOzs7Ozs7Ozs7aURBQ0FBLE87Ozs7Ozs7Ozt5Q0FDQUEsTzs7Ozs7Ozs7OzZDQUNBQSxPOzs7O0lBdERHQyxNOzs7Ozs7QUFDTCxJQUFNQyx3QkFBUUQsTUFBZCxDLENBVlA7Ozs7Ozs7O0FBUUE7OztBQUtBO0FBQ08sSUFBTUUsNEJBQVUsV0FBaEI7O0FBRVAiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENsaWVudC1zaWRlIGVudHJ5IHBvaW50IG9mIHRoZSAqc291bmR3b3JrcyogZnJhbWV3b3JrLlxuICpcbiAqIEBtb2R1bGUgc291bmR3b3Jrcy9jbGllbnRcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbiAqL1xuXG4vLyBleHBvcnQgKiBhcyBhdWRpbyBmcm9tICd3YXZlcy1hdWRpbyc7XG5pbXBvcnQgKiBhcyBfYXVkaW8gZnJvbSAnd2F2ZXMtYXVkaW8nO1xuZXhwb3J0IGNvbnN0IGF1ZGlvID0gX2F1ZGlvO1xuZXhwb3J0IHsgYXVkaW9Db250ZXh0IH0gZnJvbSAnd2F2ZXMtYXVkaW8nO1xuXG4vLyB2ZXJzaW9uIChjZi4gYmluL2phdmFzY3JpcHRzKVxuZXhwb3J0IGNvbnN0IHZlcnNpb24gPSAnJXZlcnNpb24lJztcblxuLy8gY29yZVxuZXhwb3J0IHsgZGVmYXVsdCBhcyBBY3Rpdml0eSB9IGZyb20gJy4vY29yZS9BY3Rpdml0eSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIGNsaWVudCB9IGZyb20gJy4vY29yZS9jbGllbnQnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBQcm9jZXNzIH0gZnJvbSAnLi9jb3JlL1Byb2Nlc3MnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTY2VuZSB9IGZyb20gJy4vY29yZS9TY2VuZSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFNlcnZpY2UgfSBmcm9tICcuL2NvcmUvU2VydmljZSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIHNlcnZpY2VNYW5hZ2VyIH0gZnJvbSAnLi9jb3JlL3NlcnZpY2VNYW5hZ2VyJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2lnbmFsIH0gZnJvbSAnLi9jb3JlL1NpZ25hbCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFNpZ25hbEFsbCB9IGZyb20gJy4vY29yZS9TaWduYWxBbGwnO1xuXG4vLyBzY2VuZXNcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQmFzaWNTaGFyZWRDb250cm9sbGVyIH0gZnJvbSAnLi9zY2VuZXMvQmFzaWNTaGFyZWRDb250cm9sbGVyJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgRXhwZXJpZW5jZSB9IGZyb20gJy4vc2NlbmVzL0V4cGVyaWVuY2UnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTdXJ2ZXkgfSBmcm9tICcuL3NjZW5lcy9TdXJ2ZXknO1xuXG4vLyBzZXJ2aWNlc1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBBdWRpb0J1ZmZlck1hbmFnZXIgfSBmcm9tICcuL3NlcnZpY2VzL0F1ZGlvQnVmZmVyTWFuYWdlcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIEF1ZGlvU2NoZWR1bGVyIH0gZnJvbSAnLi9zZXJ2aWNlcy9BdWRpb1NjaGVkdWxlcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIEF1dGggfSBmcm9tICcuL3NlcnZpY2VzL0F1dGgnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBDaGVja2luIH0gZnJvbSAnLi9zZXJ2aWNlcy9DaGVja2luJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgRXJyb3JSZXBvcnRlciB9IGZyb20gJy4vc2VydmljZXMvRXJyb3JSZXBvcnRlcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIEZpbGVTeXN0ZW0gfSBmcm9tICcuL3NlcnZpY2VzL0ZpbGVTeXN0ZW0nO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBHZW9sb2NhdGlvbiB9IGZyb20gJy4vc2VydmljZXMvR2VvbG9jYXRpb24nO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBMYW5ndWFnZSB9IGZyb20gJy4vc2VydmljZXMvTGFuZ3VhZ2UnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBMb2NhdG9yIH0gZnJvbSAnLi9zZXJ2aWNlcy9Mb2NhdG9yJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgTWV0cmljU2NoZWR1bGVyIH0gZnJvbSAnLi9zZXJ2aWNlcy9NZXRyaWNTY2hlZHVsZXInO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBNb3Rpb25JbnB1dCB9IGZyb20gJy4vc2VydmljZXMvTW90aW9uSW5wdXQnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBOZXR3b3JrIH0gZnJvbSAnLi9zZXJ2aWNlcy9OZXR3b3JrJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUGxhY2VyIH0gZnJvbSAnLi9zZXJ2aWNlcy9QbGFjZXInO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBQbGF0Zm9ybSB9IGZyb20gJy4vc2VydmljZXMvUGxhdGZvcm0nO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBSYXdTb2NrZXQgfSBmcm9tICcuL3NlcnZpY2VzL1Jhd1NvY2tldCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFNoYXJlZENvbmZpZyB9IGZyb20gJy4vc2VydmljZXMvU2hhcmVkQ29uZmlnJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2hhcmVkUGFyYW1zIH0gZnJvbSAnLi9zZXJ2aWNlcy9TaGFyZWRQYXJhbXMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTaGFyZWRSZWNvcmRlciB9IGZyb20gJy4vc2VydmljZXMvU2hhcmVkUmVjb3JkZXInO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTeW5jIH0gZnJvbSAnLi9zZXJ2aWNlcy9TeW5jJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU3luY1NjaGVkdWxlciB9IGZyb20gJy4vc2VydmljZXMvU3luY1NjaGVkdWxlcic7XG5cbi8vIHZpZXdzXG5leHBvcnQgeyBkZWZhdWx0IGFzIENhbnZhc1ZpZXcgfSBmcm9tICcuL3ZpZXdzL0NhbnZhc1ZpZXcnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBSZW5kZXJlciB9IGZyb20gJy4vdmlld3MvUmVuZGVyZXInO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBSZW5kZXJpbmdHcm91cCB9IGZyb20gJy4vdmlld3MvUmVuZGVyaW5nR3JvdXAnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTZWdtZW50ZWRWaWV3IH0gZnJvbSAnLi92aWV3cy9TZWdtZW50ZWRWaWV3JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2VsZWN0VmlldyB9IGZyb20gJy4vdmlld3MvU2VsZWN0Vmlldyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFNwYWNlVmlldyB9IGZyb20gJy4vdmlld3MvU3BhY2VWaWV3JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU3F1YXJlZFZpZXcgfSBmcm9tICcuL3ZpZXdzL1NxdWFyZWRWaWV3JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVG91Y2hTdXJmYWNlIH0gZnJvbSAnLi92aWV3cy9Ub3VjaFN1cmZhY2UnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWaWV3IH0gZnJvbSAnLi92aWV3cy9WaWV3JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgdmlld3BvcnQgfSBmcm9tICcuL3ZpZXdzL3ZpZXdwb3J0JztcbiJdfQ==