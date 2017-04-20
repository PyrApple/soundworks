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

var _Scene2 = require('../core/Scene');

var _Scene3 = _interopRequireDefault(_Scene2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SCENE_ID = 'basic-shared-controller';

var BasicSharedController = function (_Scene) {
  (0, _inherits3.default)(BasicSharedController, _Scene);

  function BasicSharedController(clientType) {
    (0, _classCallCheck3.default)(this, BasicSharedController);

    var _this = (0, _possibleConstructorReturn3.default)(this, (BasicSharedController.__proto__ || (0, _getPrototypeOf2.default)(BasicSharedController)).call(this, SCENE_ID, clientType));

    _this._errorReporter = _this.require('error-reporter');

    /**
     * Instance of the server-side `shared-params` service.
     * @type {module:soundworks/server.SharedParams}
     * @name sharedParams
     * @instance
     * @memberof module:soundworks/server.SharedParams
     */
    _this.sharedParams = _this.require('shared-params');
    return _this;
  }

  return BasicSharedController;
}(_Scene3.default);

exports.default = BasicSharedController;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJhc2ljU2hhcmVkQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6WyJTQ0VORV9JRCIsIkJhc2ljU2hhcmVkQ29udHJvbGxlciIsImNsaWVudFR5cGUiLCJfZXJyb3JSZXBvcnRlciIsInJlcXVpcmUiLCJzaGFyZWRQYXJhbXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7O0FBRUEsSUFBTUEsV0FBVyx5QkFBakI7O0lBRXFCQyxxQjs7O0FBQ25CLGlDQUFZQyxVQUFaLEVBQXdCO0FBQUE7O0FBQUEsb0tBQ2hCRixRQURnQixFQUNORSxVQURNOztBQUd0QixVQUFLQyxjQUFMLEdBQXNCLE1BQUtDLE9BQUwsQ0FBYSxnQkFBYixDQUF0Qjs7QUFFQTs7Ozs7OztBQU9BLFVBQUtDLFlBQUwsR0FBb0IsTUFBS0QsT0FBTCxDQUFhLGVBQWIsQ0FBcEI7QUFac0I7QUFhdkI7Ozs7O2tCQWRrQkgscUIiLCJmaWxlIjoiQmFzaWNTaGFyZWRDb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNjZW5lIGZyb20gJy4uL2NvcmUvU2NlbmUnO1xuXG5jb25zdCBTQ0VORV9JRCA9ICdiYXNpYy1zaGFyZWQtY29udHJvbGxlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2ljU2hhcmVkQ29udHJvbGxlciBleHRlbmRzIFNjZW5lIHtcbiAgY29uc3RydWN0b3IoY2xpZW50VHlwZSkge1xuICAgIHN1cGVyKFNDRU5FX0lELCBjbGllbnRUeXBlKTtcblxuICAgIHRoaXMuX2Vycm9yUmVwb3J0ZXIgPSB0aGlzLnJlcXVpcmUoJ2Vycm9yLXJlcG9ydGVyJyk7XG5cbiAgICAvKipcbiAgICAgKiBJbnN0YW5jZSBvZiB0aGUgc2VydmVyLXNpZGUgYHNoYXJlZC1wYXJhbXNgIHNlcnZpY2UuXG4gICAgICogQHR5cGUge21vZHVsZTpzb3VuZHdvcmtzL3NlcnZlci5TaGFyZWRQYXJhbXN9XG4gICAgICogQG5hbWUgc2hhcmVkUGFyYW1zXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL3NlcnZlci5TaGFyZWRQYXJhbXNcbiAgICAgKi9cbiAgICB0aGlzLnNoYXJlZFBhcmFtcyA9IHRoaXMucmVxdWlyZSgnc2hhcmVkLXBhcmFtcycpO1xuICB9XG59XG4iXX0=