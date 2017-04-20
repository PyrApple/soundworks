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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SERVICE_ID = 'service:geolocation';

/**
 * Interface for the server `'geolocation'` service.
 *
 * The `'geolocation'` service allows to retrieve the latitude and longitude
 * of the client using `gps`. The current values are store into the
 * `client.coordinates` member.
 *
 * __*The service must be used with its [client-side counterpart]{@link module:soundworks/client.Geolocation}*__
 *
 * @memberof module:soundworks/server
 * @example
 */

var Geolocation = function (_Service) {
  (0, _inherits3.default)(Geolocation, _Service);

  function Geolocation() {
    (0, _classCallCheck3.default)(this, Geolocation);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Geolocation.__proto__ || (0, _getPrototypeOf2.default)(Geolocation)).call(this, SERVICE_ID));

    var defaults = {};
    _this.configure(defaults);
    return _this;
  }

  (0, _createClass3.default)(Geolocation, [{
    key: 'start',
    value: function start() {
      (0, _get3.default)(Geolocation.prototype.__proto__ || (0, _getPrototypeOf2.default)(Geolocation.prototype), 'start', this).call(this);
    }
  }, {
    key: 'connect',
    value: function connect(client) {
      this.receive(client, 'geoposition', this._onGeoposition(client));
    }
  }, {
    key: '_onGeoposition',
    value: function _onGeoposition(client) {
      var _this2 = this;

      return function (position) {
        var coords = position.coords;
        client.coordinates = [coords.latitude, coords.longitude];
        client.geoposition = position;

        _this2.emit('geoposition', client, client.coordinates, client.geoposition);
      };
    }
  }]);
  return Geolocation;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, Geolocation);

exports.default = Geolocation;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdlb2xvY2F0aW9uLmpzIl0sIm5hbWVzIjpbIlNFUlZJQ0VfSUQiLCJHZW9sb2NhdGlvbiIsImRlZmF1bHRzIiwiY29uZmlndXJlIiwiY2xpZW50IiwicmVjZWl2ZSIsIl9vbkdlb3Bvc2l0aW9uIiwicG9zaXRpb24iLCJjb29yZHMiLCJjb29yZGluYXRlcyIsImxhdGl0dWRlIiwibG9uZ2l0dWRlIiwiZ2VvcG9zaXRpb24iLCJlbWl0IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7OztBQUVBLElBQU1BLGFBQWEscUJBQW5COztBQUVBOzs7Ozs7Ozs7Ozs7O0lBWU1DLFc7OztBQUNKLHlCQUFjO0FBQUE7O0FBQUEsZ0pBQ05ELFVBRE07O0FBR1osUUFBTUUsV0FBVyxFQUFqQjtBQUNBLFVBQUtDLFNBQUwsQ0FBZUQsUUFBZjtBQUpZO0FBS2I7Ozs7NEJBRU87QUFDTjtBQUNEOzs7NEJBRU9FLE0sRUFBUTtBQUNkLFdBQUtDLE9BQUwsQ0FBYUQsTUFBYixFQUFxQixhQUFyQixFQUFvQyxLQUFLRSxjQUFMLENBQW9CRixNQUFwQixDQUFwQztBQUNEOzs7bUNBRWNBLE0sRUFBUTtBQUFBOztBQUNyQixhQUFPLFVBQUNHLFFBQUQsRUFBYztBQUNuQixZQUFNQyxTQUFTRCxTQUFTQyxNQUF4QjtBQUNBSixlQUFPSyxXQUFQLEdBQXFCLENBQUNELE9BQU9FLFFBQVIsRUFBa0JGLE9BQU9HLFNBQXpCLENBQXJCO0FBQ0FQLGVBQU9RLFdBQVAsR0FBcUJMLFFBQXJCOztBQUVBLGVBQUtNLElBQUwsQ0FBVSxhQUFWLEVBQXlCVCxNQUF6QixFQUFpQ0EsT0FBT0ssV0FBeEMsRUFBcURMLE9BQU9RLFdBQTVEO0FBQ0QsT0FORDtBQU9EOzs7OztBQUdILHlCQUFlRSxRQUFmLENBQXdCZCxVQUF4QixFQUFvQ0MsV0FBcEM7O2tCQUVlQSxXIiwiZmlsZSI6Ikdlb2xvY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNlcnZpY2UgZnJvbSAnLi4vY29yZS9TZXJ2aWNlJztcbmltcG9ydCBzZXJ2aWNlTWFuYWdlciBmcm9tICcuLi9jb3JlL3NlcnZpY2VNYW5hZ2VyJztcblxuY29uc3QgU0VSVklDRV9JRCA9ICdzZXJ2aWNlOmdlb2xvY2F0aW9uJztcblxuLyoqXG4gKiBJbnRlcmZhY2UgZm9yIHRoZSBzZXJ2ZXIgYCdnZW9sb2NhdGlvbidgIHNlcnZpY2UuXG4gKlxuICogVGhlIGAnZ2VvbG9jYXRpb24nYCBzZXJ2aWNlIGFsbG93cyB0byByZXRyaWV2ZSB0aGUgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZVxuICogb2YgdGhlIGNsaWVudCB1c2luZyBgZ3BzYC4gVGhlIGN1cnJlbnQgdmFsdWVzIGFyZSBzdG9yZSBpbnRvIHRoZVxuICogYGNsaWVudC5jb29yZGluYXRlc2AgbWVtYmVyLlxuICpcbiAqIF9fKlRoZSBzZXJ2aWNlIG11c3QgYmUgdXNlZCB3aXRoIGl0cyBbY2xpZW50LXNpZGUgY291bnRlcnBhcnRde0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5HZW9sb2NhdGlvbn0qX19cbiAqXG4gKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3Mvc2VydmVyXG4gKiBAZXhhbXBsZVxuICovXG5jbGFzcyBHZW9sb2NhdGlvbiBleHRlbmRzIFNlcnZpY2Uge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihTRVJWSUNFX0lEKTtcblxuICAgIGNvbnN0IGRlZmF1bHRzID0ge307XG4gICAgdGhpcy5jb25maWd1cmUoZGVmYXVsdHMpO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTtcbiAgfVxuXG4gIGNvbm5lY3QoY2xpZW50KSB7XG4gICAgdGhpcy5yZWNlaXZlKGNsaWVudCwgJ2dlb3Bvc2l0aW9uJywgdGhpcy5fb25HZW9wb3NpdGlvbihjbGllbnQpKTtcbiAgfVxuXG4gIF9vbkdlb3Bvc2l0aW9uKGNsaWVudCkge1xuICAgIHJldHVybiAocG9zaXRpb24pID0+IHtcbiAgICAgIGNvbnN0IGNvb3JkcyA9IHBvc2l0aW9uLmNvb3JkcztcbiAgICAgIGNsaWVudC5jb29yZGluYXRlcyA9IFtjb29yZHMubGF0aXR1ZGUsIGNvb3Jkcy5sb25naXR1ZGVdO1xuICAgICAgY2xpZW50Lmdlb3Bvc2l0aW9uID0gcG9zaXRpb247XG5cbiAgICAgIHRoaXMuZW1pdCgnZ2VvcG9zaXRpb24nLCBjbGllbnQsIGNsaWVudC5jb29yZGluYXRlcywgY2xpZW50Lmdlb3Bvc2l0aW9uKTtcbiAgICB9XG4gIH1cbn1cblxuc2VydmljZU1hbmFnZXIucmVnaXN0ZXIoU0VSVklDRV9JRCwgR2VvbG9jYXRpb24pO1xuXG5leHBvcnQgZGVmYXVsdCBHZW9sb2NhdGlvbjtcbiJdfQ==