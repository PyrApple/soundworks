'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Service2 = require('../core/Service');

var _Service3 = _interopRequireDefault(_Service2);

var _helpers = require('../../utils/helpers');

var _serviceManager = require('../core/serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SERVICE_ID = 'service:audio-buffer-manager';

/**
 * Interface for the server `'audio-buffer-manager'` service.
 *
 * @memberof module:soundworks/server
 * @example
 * // inside the experience constructor
 * this.audioBufferManager = this.require('audio-buffer-manager');
 */

var AudioBufferManager = function (_Service) {
  (0, _inherits3.default)(AudioBufferManager, _Service);

  /** _<span class="warning">__WARNING__</span> This class should never be instanciated manually_ */
  function AudioBufferManager() {
    (0, _classCallCheck3.default)(this, AudioBufferManager);

    var _this = (0, _possibleConstructorReturn3.default)(this, (AudioBufferManager.__proto__ || (0, _getPrototypeOf2.default)(AudioBufferManager)).call(this, SERVICE_ID));

    _this._fileSystem = _this.require('file-system');
    return _this;
  }

  return AudioBufferManager;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, AudioBufferManager);

exports.default = AudioBufferManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1ZGlvQnVmZmVyTWFuYWdlci5qcyJdLCJuYW1lcyI6WyJTRVJWSUNFX0lEIiwiQXVkaW9CdWZmZXJNYW5hZ2VyIiwiX2ZpbGVTeXN0ZW0iLCJyZXF1aXJlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxhQUFhLDhCQUFuQjs7QUFFQTs7Ozs7Ozs7O0lBUU1DLGtCOzs7QUFDSjtBQUNBLGdDQUFjO0FBQUE7O0FBQUEsOEpBQ05ELFVBRE07O0FBR1osVUFBS0UsV0FBTCxHQUFtQixNQUFLQyxPQUFMLENBQWEsYUFBYixDQUFuQjtBQUhZO0FBSWI7Ozs7O0FBR0gseUJBQWVDLFFBQWYsQ0FBd0JKLFVBQXhCLEVBQW9DQyxrQkFBcEM7O2tCQUVlQSxrQiIsImZpbGUiOiJBdWRpb0J1ZmZlck1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU2VydmljZSBmcm9tICcuLi9jb3JlL1NlcnZpY2UnO1xuaW1wb3J0IHsgZ2V0T3B0IH0gZnJvbSAnLi4vLi4vdXRpbHMvaGVscGVycyc7XG5pbXBvcnQgc2VydmljZU1hbmFnZXIgZnJvbSAnLi4vY29yZS9zZXJ2aWNlTWFuYWdlcic7XG5cbmNvbnN0IFNFUlZJQ0VfSUQgPSAnc2VydmljZTphdWRpby1idWZmZXItbWFuYWdlcic7XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUgc2VydmVyIGAnYXVkaW8tYnVmZmVyLW1hbmFnZXInYCBzZXJ2aWNlLlxuICpcbiAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9zZXJ2ZXJcbiAqIEBleGFtcGxlXG4gKiAvLyBpbnNpZGUgdGhlIGV4cGVyaWVuY2UgY29uc3RydWN0b3JcbiAqIHRoaXMuYXVkaW9CdWZmZXJNYW5hZ2VyID0gdGhpcy5yZXF1aXJlKCdhdWRpby1idWZmZXItbWFuYWdlcicpO1xuICovXG5jbGFzcyBBdWRpb0J1ZmZlck1hbmFnZXIgZXh0ZW5kcyBTZXJ2aWNlIHtcbiAgLyoqIF88c3BhbiBjbGFzcz1cIndhcm5pbmdcIj5fX1dBUk5JTkdfXzwvc3Bhbj4gVGhpcyBjbGFzcyBzaG91bGQgbmV2ZXIgYmUgaW5zdGFuY2lhdGVkIG1hbnVhbGx5XyAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihTRVJWSUNFX0lEKTtcblxuICAgIHRoaXMuX2ZpbGVTeXN0ZW0gPSB0aGlzLnJlcXVpcmUoJ2ZpbGUtc3lzdGVtJyk7XG4gIH1cbn1cblxuc2VydmljZU1hbmFnZXIucmVnaXN0ZXIoU0VSVklDRV9JRCwgQXVkaW9CdWZmZXJNYW5hZ2VyKTtcblxuZXhwb3J0IGRlZmF1bHQgQXVkaW9CdWZmZXJNYW5hZ2VyO1xuIl19