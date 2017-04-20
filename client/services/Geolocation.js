'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

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

var _client = require('../core/client');

var _client2 = _interopRequireDefault(_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SERVICE_ID = 'service:geolocation';
var geolocation = navigator.geolocation;

function geopositionToJson(geoposition) {
  return {
    timestamp: geoposition.timestamp,
    coords: {
      accuracy: geoposition.coords.accuracy,
      altitude: geoposition.coords.altitude,
      altitudeAccuracy: geoposition.coords.altitudeAccuracy,
      heading: geoposition.coords.heading,
      latitude: geoposition.coords.latitude,
      longitude: geoposition.coords.longitude,
      speed: geoposition.coords.speed
    }
  };
}

function getRandomGeoposition() {
  return {
    timestamp: new Date().getTime(),
    coords: {
      accuracy: 10,
      altitude: 10,
      altitudeAccuracy: 10,
      heading: 0,
      latitude: Math.random() * 180 - 90,
      longitude: Math.random() * 360 - 180,
      speed: 1
    }
  };
}

// this is quite a large update...
function updateRandomGeoposition(geoposition) {
  geoposition.timestamp = new Date().getTime();
  geoposition.coords.latitude += Math.random() * 1e-4 - 1e-4 / 2;
  geoposition.coords.longitude += Math.random() * 1e-4 - 1e-4 / 2;
}

/**
 * Interface for the client `'geolocation'` service.
 *
 * The `'geolocation'` service allows to retrieve the latitude and longitude
 * of the client using `gps`. The current values are store into the
 * `client.coordinates` member.
 *
 * __*The service must be used with its [server-side counterpart]{@link module:soundworks/server.Geolocation}*__
 *
 * @param {Object} options - Override default options.
 * @param {'start'|'stop'} [options.state='start'] - Default state when the
 *  service is launched.
 * @param {Boolean} [options.enableHighAccuracy=true] - Define if the application
 *  would like to receive the best possible results (cf. [https://dev.w3.org/geo/api/spec-source.html#high-accuracy](https://dev.w3.org/geo/api/spec-source.html#high-accuracy)).
 *
 * @memberof module:soundworks/client
 * @example
 */

var Geolocation = function (_Service) {
  (0, _inherits3.default)(Geolocation, _Service);

  /** _<span class="warning">__WARNING__</span> This class should never be instanciated manually_ */
  function Geolocation() {
    (0, _classCallCheck3.default)(this, Geolocation);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Geolocation.__proto__ || (0, _getPrototypeOf2.default)(Geolocation)).call(this, SERVICE_ID, true));

    var defaults = {
      state: 'start',
      enableHighAccuracy: true
    };

    _this.platform = _this.require('platform');

    _this._onSuccess = _this._onSuccess.bind(_this);
    _this._onError = _this._onError.bind(_this);
    _this._watchId = null;
    _this.state = null;
    return _this;
  }

  (0, _createClass3.default)(Geolocation, [{
    key: 'configure',
    value: function configure(options) {
      var _options = (0, _assign2.default)({}, this.defaults, options);

      if (!this.options.feature) {
        var feature = 'geolocation';

        if (options.bypass !== undefined && options.bypass === true) feature = 'geolocation-mock';

        console.log(feature);
        this.options.feature = feature;
        this.platform.requireFeature(feature);
      }

      (0, _get3.default)(Geolocation.prototype.__proto__ || (0, _getPrototypeOf2.default)(Geolocation.prototype), 'configure', this).call(this, options);
    }

    /** @private */

  }, {
    key: 'start',
    value: function start() {
      (0, _get3.default)(Geolocation.prototype.__proto__ || (0, _getPrototypeOf2.default)(Geolocation.prototype), 'start', this).call(this);

      if (!this.hasStarted) this.init();

      // console.log('here');
      if (this.options.feature === 'geolocation-mock') {
        var geoposition = getRandomGeoposition();
        this._updateClient(geoposition);
      }

      // only sync values retrieved from `platform` with server before getting ready
      this.emit('geoposition', _client2.default.geoposition);
      this.send('geoposition', geopositionToJson(_client2.default.geoposition));
      this.ready();

      this.setState(this.options.state);
    }

    /**
     * Set the state of the service.
     *
     * @param {'start'|'stop'} String - New state of the service.
     */

  }, {
    key: 'setState',
    value: function setState(state) {
      if (this.state !== state) {
        this.state = state;

        if (this.state === 'start') this._startWatch();else this._stopWatch();
      }
    }

    /**
     * Resume the refresh of the position.
     * @private
     */

  }, {
    key: '_startWatch',
    value: function _startWatch() {
      var _this2 = this;

      if (this.options.debug === false) {
        this._watchId = geolocation.watchPosition(this._onSuccess, this._onError, this.options);
      } else {
        this._watchId = setInterval(function () {
          updateRandomGeoposition(_client2.default.geoposition);
          _this2._onSuccess(_client2.default.geoposition);
        }, 3000);
      }
    }

    /**
     * Pause the refresh of the position.
     * @private
     */

  }, {
    key: '_stopWatch',
    value: function _stopWatch() {
      if (this.options.debug === false) navigator.geolocation.clearWatch(this._watchId);else clearInterval(this._watchId);
    }

    /** @private */

  }, {
    key: '_onSuccess',
    value: function _onSuccess(geoposition) {
      this._updateClient(geoposition);
      this.emit('geoposition', geoposition);
      this.send('geoposition', geopositionToJson(geoposition));
    }

    /** @private */

  }, {
    key: '_updateClient',
    value: function _updateClient(geoposition) {
      var coords = geoposition.coords;
      _client2.default.coordinates = [coords.latitude, coords.longitude];
      _client2.default.geoposition = geoposition;
    }

    /** @private */

  }, {
    key: '_onError',
    value: function _onError(err) {
      console.error(err.stack);
    }
  }]);
  return Geolocation;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, Geolocation);

exports.default = Geolocation;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdlb2xvY2F0aW9uLmpzIl0sIm5hbWVzIjpbIlNFUlZJQ0VfSUQiLCJnZW9sb2NhdGlvbiIsIm5hdmlnYXRvciIsImdlb3Bvc2l0aW9uVG9Kc29uIiwiZ2VvcG9zaXRpb24iLCJ0aW1lc3RhbXAiLCJjb29yZHMiLCJhY2N1cmFjeSIsImFsdGl0dWRlIiwiYWx0aXR1ZGVBY2N1cmFjeSIsImhlYWRpbmciLCJsYXRpdHVkZSIsImxvbmdpdHVkZSIsInNwZWVkIiwiZ2V0UmFuZG9tR2VvcG9zaXRpb24iLCJEYXRlIiwiZ2V0VGltZSIsIk1hdGgiLCJyYW5kb20iLCJ1cGRhdGVSYW5kb21HZW9wb3NpdGlvbiIsIkdlb2xvY2F0aW9uIiwiZGVmYXVsdHMiLCJzdGF0ZSIsImVuYWJsZUhpZ2hBY2N1cmFjeSIsInBsYXRmb3JtIiwicmVxdWlyZSIsIl9vblN1Y2Nlc3MiLCJiaW5kIiwiX29uRXJyb3IiLCJfd2F0Y2hJZCIsIm9wdGlvbnMiLCJfb3B0aW9ucyIsImZlYXR1cmUiLCJieXBhc3MiLCJ1bmRlZmluZWQiLCJjb25zb2xlIiwibG9nIiwicmVxdWlyZUZlYXR1cmUiLCJoYXNTdGFydGVkIiwiaW5pdCIsIl91cGRhdGVDbGllbnQiLCJlbWl0Iiwic2VuZCIsInJlYWR5Iiwic2V0U3RhdGUiLCJfc3RhcnRXYXRjaCIsIl9zdG9wV2F0Y2giLCJkZWJ1ZyIsIndhdGNoUG9zaXRpb24iLCJzZXRJbnRlcnZhbCIsImNsZWFyV2F0Y2giLCJjbGVhckludGVydmFsIiwiY29vcmRpbmF0ZXMiLCJlcnIiLCJlcnJvciIsInN0YWNrIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUdBLElBQU1BLGFBQWEscUJBQW5CO0FBQ0EsSUFBTUMsY0FBY0MsVUFBVUQsV0FBOUI7O0FBRUEsU0FBU0UsaUJBQVQsQ0FBMkJDLFdBQTNCLEVBQXdDO0FBQ3RDLFNBQU87QUFDTEMsZUFBV0QsWUFBWUMsU0FEbEI7QUFFTEMsWUFBUTtBQUNOQyxnQkFBVUgsWUFBWUUsTUFBWixDQUFtQkMsUUFEdkI7QUFFTkMsZ0JBQVVKLFlBQVlFLE1BQVosQ0FBbUJFLFFBRnZCO0FBR05DLHdCQUFrQkwsWUFBWUUsTUFBWixDQUFtQkcsZ0JBSC9CO0FBSU5DLGVBQVNOLFlBQVlFLE1BQVosQ0FBbUJJLE9BSnRCO0FBS05DLGdCQUFVUCxZQUFZRSxNQUFaLENBQW1CSyxRQUx2QjtBQU1OQyxpQkFBV1IsWUFBWUUsTUFBWixDQUFtQk0sU0FOeEI7QUFPTkMsYUFBT1QsWUFBWUUsTUFBWixDQUFtQk87QUFQcEI7QUFGSCxHQUFQO0FBWUQ7O0FBRUQsU0FBU0Msb0JBQVQsR0FBZ0M7QUFDOUIsU0FBTztBQUNMVCxlQUFXLElBQUlVLElBQUosR0FBV0MsT0FBWCxFQUROO0FBRUxWLFlBQVE7QUFDTkMsZ0JBQVUsRUFESjtBQUVOQyxnQkFBVSxFQUZKO0FBR05DLHdCQUFrQixFQUhaO0FBSU5DLGVBQVMsQ0FKSDtBQUtOQyxnQkFBVU0sS0FBS0MsTUFBTCxLQUFnQixHQUFoQixHQUFzQixFQUwxQjtBQU1OTixpQkFBV0ssS0FBS0MsTUFBTCxLQUFnQixHQUFoQixHQUFzQixHQU4zQjtBQU9OTCxhQUFPO0FBUEQ7QUFGSCxHQUFQO0FBWUQ7O0FBRUQ7QUFDQSxTQUFTTSx1QkFBVCxDQUFpQ2YsV0FBakMsRUFBOEM7QUFDNUNBLGNBQVlDLFNBQVosR0FBd0IsSUFBSVUsSUFBSixHQUFXQyxPQUFYLEVBQXhCO0FBQ0FaLGNBQVlFLE1BQVosQ0FBbUJLLFFBQW5CLElBQWdDTSxLQUFLQyxNQUFMLEtBQWdCLElBQWpCLEdBQTBCLE9BQU8sQ0FBaEU7QUFDQWQsY0FBWUUsTUFBWixDQUFtQk0sU0FBbkIsSUFBaUNLLEtBQUtDLE1BQUwsS0FBZ0IsSUFBakIsR0FBMEIsT0FBTyxDQUFqRTtBQUNEOztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBa0JNRSxXOzs7QUFDSjtBQUNBLHlCQUFjO0FBQUE7O0FBQUEsZ0pBQ05wQixVQURNLEVBQ00sSUFETjs7QUFHWixRQUFNcUIsV0FBVztBQUNmQyxhQUFPLE9BRFE7QUFFZkMsMEJBQW9CO0FBRkwsS0FBakI7O0FBTUEsVUFBS0MsUUFBTCxHQUFnQixNQUFLQyxPQUFMLENBQWEsVUFBYixDQUFoQjs7QUFFQSxVQUFLQyxVQUFMLEdBQWtCLE1BQUtBLFVBQUwsQ0FBZ0JDLElBQWhCLE9BQWxCO0FBQ0EsVUFBS0MsUUFBTCxHQUFnQixNQUFLQSxRQUFMLENBQWNELElBQWQsT0FBaEI7QUFDQSxVQUFLRSxRQUFMLEdBQWdCLElBQWhCO0FBQ0EsVUFBS1AsS0FBTCxHQUFhLElBQWI7QUFkWTtBQWViOzs7OzhCQUVTUSxPLEVBQVM7QUFDakIsVUFBTUMsV0FBVyxzQkFBYyxFQUFkLEVBQWtCLEtBQUtWLFFBQXZCLEVBQWlDUyxPQUFqQyxDQUFqQjs7QUFFQSxVQUFJLENBQUMsS0FBS0EsT0FBTCxDQUFhRSxPQUFsQixFQUEyQjtBQUN6QixZQUFJQSxVQUFVLGFBQWQ7O0FBRUEsWUFBSUYsUUFBUUcsTUFBUixLQUFtQkMsU0FBbkIsSUFBZ0NKLFFBQVFHLE1BQVIsS0FBbUIsSUFBdkQsRUFDRUQsVUFBVSxrQkFBVjs7QUFFRkcsZ0JBQVFDLEdBQVIsQ0FBWUosT0FBWjtBQUNBLGFBQUtGLE9BQUwsQ0FBYUUsT0FBYixHQUF1QkEsT0FBdkI7QUFDQSxhQUFLUixRQUFMLENBQWNhLGNBQWQsQ0FBNkJMLE9BQTdCO0FBQ0Q7O0FBRUQsZ0pBQWdCRixPQUFoQjtBQUNEOztBQUVEOzs7OzRCQUNRO0FBQ047O0FBRUEsVUFBSSxDQUFDLEtBQUtRLFVBQVYsRUFDRSxLQUFLQyxJQUFMOztBQUVGO0FBQ0EsVUFBSSxLQUFLVCxPQUFMLENBQWFFLE9BQWIsS0FBeUIsa0JBQTdCLEVBQWlEO0FBQy9DLFlBQU01QixjQUFjVSxzQkFBcEI7QUFDQSxhQUFLMEIsYUFBTCxDQUFtQnBDLFdBQW5CO0FBQ0Q7O0FBRUQ7QUFDQSxXQUFLcUMsSUFBTCxDQUFVLGFBQVYsRUFBeUIsaUJBQU9yQyxXQUFoQztBQUNBLFdBQUtzQyxJQUFMLENBQVUsYUFBVixFQUF5QnZDLGtCQUFrQixpQkFBT0MsV0FBekIsQ0FBekI7QUFDQSxXQUFLdUMsS0FBTDs7QUFFQSxXQUFLQyxRQUFMLENBQWMsS0FBS2QsT0FBTCxDQUFhUixLQUEzQjtBQUNEOztBQUVEOzs7Ozs7Ozs2QkFLU0EsSyxFQUFPO0FBQ2QsVUFBSSxLQUFLQSxLQUFMLEtBQWVBLEtBQW5CLEVBQTBCO0FBQ3hCLGFBQUtBLEtBQUwsR0FBYUEsS0FBYjs7QUFFQSxZQUFJLEtBQUtBLEtBQUwsS0FBZSxPQUFuQixFQUNFLEtBQUt1QixXQUFMLEdBREYsS0FHRSxLQUFLQyxVQUFMO0FBQ0g7QUFDRjs7QUFFRDs7Ozs7OztrQ0FJYztBQUFBOztBQUNaLFVBQUksS0FBS2hCLE9BQUwsQ0FBYWlCLEtBQWIsS0FBdUIsS0FBM0IsRUFBa0M7QUFDaEMsYUFBS2xCLFFBQUwsR0FBZ0I1QixZQUFZK0MsYUFBWixDQUEwQixLQUFLdEIsVUFBL0IsRUFBMkMsS0FBS0UsUUFBaEQsRUFBMEQsS0FBS0UsT0FBL0QsQ0FBaEI7QUFDRCxPQUZELE1BRU87QUFDTCxhQUFLRCxRQUFMLEdBQWdCb0IsWUFBWSxZQUFNO0FBQ2hDOUIsa0NBQXdCLGlCQUFPZixXQUEvQjtBQUNBLGlCQUFLc0IsVUFBTCxDQUFnQixpQkFBT3RCLFdBQXZCO0FBQ0QsU0FIZSxFQUdiLElBSGEsQ0FBaEI7QUFJRDtBQUNGOztBQUVEOzs7Ozs7O2lDQUlhO0FBQ1gsVUFBSSxLQUFLMEIsT0FBTCxDQUFhaUIsS0FBYixLQUF1QixLQUEzQixFQUNFN0MsVUFBVUQsV0FBVixDQUFzQmlELFVBQXRCLENBQWlDLEtBQUtyQixRQUF0QyxFQURGLEtBR0VzQixjQUFjLEtBQUt0QixRQUFuQjtBQUNIOztBQUVEOzs7OytCQUNXekIsVyxFQUFhO0FBQ3RCLFdBQUtvQyxhQUFMLENBQW1CcEMsV0FBbkI7QUFDQSxXQUFLcUMsSUFBTCxDQUFVLGFBQVYsRUFBeUJyQyxXQUF6QjtBQUNBLFdBQUtzQyxJQUFMLENBQVUsYUFBVixFQUF5QnZDLGtCQUFrQkMsV0FBbEIsQ0FBekI7QUFDRDs7QUFFRDs7OztrQ0FDY0EsVyxFQUFhO0FBQ3pCLFVBQU1FLFNBQVNGLFlBQVlFLE1BQTNCO0FBQ0EsdUJBQU84QyxXQUFQLEdBQXFCLENBQUM5QyxPQUFPSyxRQUFSLEVBQWtCTCxPQUFPTSxTQUF6QixDQUFyQjtBQUNBLHVCQUFPUixXQUFQLEdBQXFCQSxXQUFyQjtBQUNEOztBQUVEOzs7OzZCQUNTaUQsRyxFQUFLO0FBQ1psQixjQUFRbUIsS0FBUixDQUFjRCxJQUFJRSxLQUFsQjtBQUNEOzs7OztBQUdILHlCQUFlQyxRQUFmLENBQXdCeEQsVUFBeEIsRUFBb0NvQixXQUFwQzs7a0JBRWVBLFciLCJmaWxlIjoiR2VvbG9jYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU2VydmljZSBmcm9tICcuLi9jb3JlL1NlcnZpY2UnO1xuaW1wb3J0IHNlcnZpY2VNYW5hZ2VyIGZyb20gJy4uL2NvcmUvc2VydmljZU1hbmFnZXInO1xuaW1wb3J0IGNsaWVudCBmcm9tICcuLi9jb3JlL2NsaWVudCc7XG5cblxuY29uc3QgU0VSVklDRV9JRCA9ICdzZXJ2aWNlOmdlb2xvY2F0aW9uJztcbmNvbnN0IGdlb2xvY2F0aW9uID0gbmF2aWdhdG9yLmdlb2xvY2F0aW9uO1xuXG5mdW5jdGlvbiBnZW9wb3NpdGlvblRvSnNvbihnZW9wb3NpdGlvbikge1xuICByZXR1cm4ge1xuICAgIHRpbWVzdGFtcDogZ2VvcG9zaXRpb24udGltZXN0YW1wLFxuICAgIGNvb3Jkczoge1xuICAgICAgYWNjdXJhY3k6IGdlb3Bvc2l0aW9uLmNvb3Jkcy5hY2N1cmFjeSxcbiAgICAgIGFsdGl0dWRlOiBnZW9wb3NpdGlvbi5jb29yZHMuYWx0aXR1ZGUsXG4gICAgICBhbHRpdHVkZUFjY3VyYWN5OiBnZW9wb3NpdGlvbi5jb29yZHMuYWx0aXR1ZGVBY2N1cmFjeSxcbiAgICAgIGhlYWRpbmc6IGdlb3Bvc2l0aW9uLmNvb3Jkcy5oZWFkaW5nLFxuICAgICAgbGF0aXR1ZGU6IGdlb3Bvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSxcbiAgICAgIGxvbmdpdHVkZTogZ2VvcG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZSxcbiAgICAgIHNwZWVkOiBnZW9wb3NpdGlvbi5jb29yZHMuc3BlZWRcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UmFuZG9tR2VvcG9zaXRpb24oKSB7XG4gIHJldHVybiB7XG4gICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcbiAgICBjb29yZHM6IHtcbiAgICAgIGFjY3VyYWN5OiAxMCxcbiAgICAgIGFsdGl0dWRlOiAxMCxcbiAgICAgIGFsdGl0dWRlQWNjdXJhY3k6IDEwLFxuICAgICAgaGVhZGluZzogMCxcbiAgICAgIGxhdGl0dWRlOiBNYXRoLnJhbmRvbSgpICogMTgwIC0gOTAsXG4gICAgICBsb25naXR1ZGU6IE1hdGgucmFuZG9tKCkgKiAzNjAgLSAxODAsXG4gICAgICBzcGVlZDogMSxcbiAgICB9XG4gIH07XG59XG5cbi8vIHRoaXMgaXMgcXVpdGUgYSBsYXJnZSB1cGRhdGUuLi5cbmZ1bmN0aW9uIHVwZGF0ZVJhbmRvbUdlb3Bvc2l0aW9uKGdlb3Bvc2l0aW9uKSB7XG4gIGdlb3Bvc2l0aW9uLnRpbWVzdGFtcCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICBnZW9wb3NpdGlvbi5jb29yZHMubGF0aXR1ZGUgKz0gKE1hdGgucmFuZG9tKCkgKiAxZS00KSAtICgxZS00IC8gMik7XG4gIGdlb3Bvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGUgKz0gKE1hdGgucmFuZG9tKCkgKiAxZS00KSAtICgxZS00IC8gMik7XG59XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUgY2xpZW50IGAnZ2VvbG9jYXRpb24nYCBzZXJ2aWNlLlxuICpcbiAqIFRoZSBgJ2dlb2xvY2F0aW9uJ2Agc2VydmljZSBhbGxvd3MgdG8gcmV0cmlldmUgdGhlIGxhdGl0dWRlIGFuZCBsb25naXR1ZGVcbiAqIG9mIHRoZSBjbGllbnQgdXNpbmcgYGdwc2AuIFRoZSBjdXJyZW50IHZhbHVlcyBhcmUgc3RvcmUgaW50byB0aGVcbiAqIGBjbGllbnQuY29vcmRpbmF0ZXNgIG1lbWJlci5cbiAqXG4gKiBfXypUaGUgc2VydmljZSBtdXN0IGJlIHVzZWQgd2l0aCBpdHMgW3NlcnZlci1zaWRlIGNvdW50ZXJwYXJ0XXtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9zZXJ2ZXIuR2VvbG9jYXRpb259Kl9fXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZSBkZWZhdWx0IG9wdGlvbnMuXG4gKiBAcGFyYW0geydzdGFydCd8J3N0b3AnfSBbb3B0aW9ucy5zdGF0ZT0nc3RhcnQnXSAtIERlZmF1bHQgc3RhdGUgd2hlbiB0aGVcbiAqICBzZXJ2aWNlIGlzIGxhdW5jaGVkLlxuICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5lbmFibGVIaWdoQWNjdXJhY3k9dHJ1ZV0gLSBEZWZpbmUgaWYgdGhlIGFwcGxpY2F0aW9uXG4gKiAgd291bGQgbGlrZSB0byByZWNlaXZlIHRoZSBiZXN0IHBvc3NpYmxlIHJlc3VsdHMgKGNmLiBbaHR0cHM6Ly9kZXYudzMub3JnL2dlby9hcGkvc3BlYy1zb3VyY2UuaHRtbCNoaWdoLWFjY3VyYWN5XShodHRwczovL2Rldi53My5vcmcvZ2VvL2FwaS9zcGVjLXNvdXJjZS5odG1sI2hpZ2gtYWNjdXJhY3kpKS5cbiAqXG4gKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50XG4gKiBAZXhhbXBsZVxuICovXG5jbGFzcyBHZW9sb2NhdGlvbiBleHRlbmRzIFNlcnZpY2Uge1xuICAvKiogXzxzcGFuIGNsYXNzPVwid2FybmluZ1wiPl9fV0FSTklOR19fPC9zcGFuPiBUaGlzIGNsYXNzIHNob3VsZCBuZXZlciBiZSBpbnN0YW5jaWF0ZWQgbWFudWFsbHlfICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKFNFUlZJQ0VfSUQsIHRydWUpO1xuXG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgICBzdGF0ZTogJ3N0YXJ0JyxcbiAgICAgIGVuYWJsZUhpZ2hBY2N1cmFjeTogdHJ1ZSxcbiAgICAgIC8vIGJ5cGFzczogZmFsc2UsXG4gICAgfTtcblxuICAgIHRoaXMucGxhdGZvcm0gPSB0aGlzLnJlcXVpcmUoJ3BsYXRmb3JtJyk7XG5cbiAgICB0aGlzLl9vblN1Y2Nlc3MgPSB0aGlzLl9vblN1Y2Nlc3MuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vbkVycm9yID0gdGhpcy5fb25FcnJvci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3dhdGNoSWQgPSBudWxsO1xuICAgIHRoaXMuc3RhdGUgPSBudWxsO1xuICB9XG5cbiAgY29uZmlndXJlKG9wdGlvbnMpIHtcbiAgICBjb25zdCBfb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMuZmVhdHVyZSkge1xuICAgICAgbGV0IGZlYXR1cmUgPSAnZ2VvbG9jYXRpb24nO1xuXG4gICAgICBpZiAob3B0aW9ucy5ieXBhc3MgIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLmJ5cGFzcyA9PT0gdHJ1ZSlcbiAgICAgICAgZmVhdHVyZSA9ICdnZW9sb2NhdGlvbi1tb2NrJztcblxuICAgICAgY29uc29sZS5sb2coZmVhdHVyZSk7XG4gICAgICB0aGlzLm9wdGlvbnMuZmVhdHVyZSA9IGZlYXR1cmU7XG4gICAgICB0aGlzLnBsYXRmb3JtLnJlcXVpcmVGZWF0dXJlKGZlYXR1cmUpO1xuICAgIH1cblxuICAgIHN1cGVyLmNvbmZpZ3VyZShvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuXG4gICAgaWYgKCF0aGlzLmhhc1N0YXJ0ZWQpXG4gICAgICB0aGlzLmluaXQoKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKCdoZXJlJyk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5mZWF0dXJlID09PSAnZ2VvbG9jYXRpb24tbW9jaycpIHtcbiAgICAgIGNvbnN0IGdlb3Bvc2l0aW9uID0gZ2V0UmFuZG9tR2VvcG9zaXRpb24oKTtcbiAgICAgIHRoaXMuX3VwZGF0ZUNsaWVudChnZW9wb3NpdGlvbik7XG4gICAgfVxuXG4gICAgLy8gb25seSBzeW5jIHZhbHVlcyByZXRyaWV2ZWQgZnJvbSBgcGxhdGZvcm1gIHdpdGggc2VydmVyIGJlZm9yZSBnZXR0aW5nIHJlYWR5XG4gICAgdGhpcy5lbWl0KCdnZW9wb3NpdGlvbicsIGNsaWVudC5nZW9wb3NpdGlvbik7XG4gICAgdGhpcy5zZW5kKCdnZW9wb3NpdGlvbicsIGdlb3Bvc2l0aW9uVG9Kc29uKGNsaWVudC5nZW9wb3NpdGlvbikpO1xuICAgIHRoaXMucmVhZHkoKTtcblxuICAgIHRoaXMuc2V0U3RhdGUodGhpcy5vcHRpb25zLnN0YXRlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHN0YXRlIG9mIHRoZSBzZXJ2aWNlLlxuICAgKlxuICAgKiBAcGFyYW0geydzdGFydCd8J3N0b3AnfSBTdHJpbmcgLSBOZXcgc3RhdGUgb2YgdGhlIHNlcnZpY2UuXG4gICAqL1xuICBzZXRTdGF0ZShzdGF0ZSkge1xuICAgIGlmICh0aGlzLnN0YXRlICE9PSBzdGF0ZSkge1xuICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuXG4gICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ3N0YXJ0JylcbiAgICAgICAgdGhpcy5fc3RhcnRXYXRjaCgpO1xuICAgICAgZWxzZVxuICAgICAgICB0aGlzLl9zdG9wV2F0Y2goKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzdW1lIHRoZSByZWZyZXNoIG9mIHRoZSBwb3NpdGlvbi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zdGFydFdhdGNoKCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVidWcgPT09IGZhbHNlKSB7XG4gICAgICB0aGlzLl93YXRjaElkID0gZ2VvbG9jYXRpb24ud2F0Y2hQb3NpdGlvbih0aGlzLl9vblN1Y2Nlc3MsIHRoaXMuX29uRXJyb3IsIHRoaXMub3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3dhdGNoSWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIHVwZGF0ZVJhbmRvbUdlb3Bvc2l0aW9uKGNsaWVudC5nZW9wb3NpdGlvbik7XG4gICAgICAgIHRoaXMuX29uU3VjY2VzcyhjbGllbnQuZ2VvcG9zaXRpb24pO1xuICAgICAgfSwgMzAwMCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBhdXNlIHRoZSByZWZyZXNoIG9mIHRoZSBwb3NpdGlvbi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zdG9wV2F0Y2goKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZWJ1ZyA9PT0gZmFsc2UpXG4gICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uY2xlYXJXYXRjaCh0aGlzLl93YXRjaElkKTtcbiAgICBlbHNlXG4gICAgICBjbGVhckludGVydmFsKHRoaXMuX3dhdGNoSWQpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9vblN1Y2Nlc3MoZ2VvcG9zaXRpb24pIHtcbiAgICB0aGlzLl91cGRhdGVDbGllbnQoZ2VvcG9zaXRpb24pO1xuICAgIHRoaXMuZW1pdCgnZ2VvcG9zaXRpb24nLCBnZW9wb3NpdGlvbik7XG4gICAgdGhpcy5zZW5kKCdnZW9wb3NpdGlvbicsIGdlb3Bvc2l0aW9uVG9Kc29uKGdlb3Bvc2l0aW9uKSk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX3VwZGF0ZUNsaWVudChnZW9wb3NpdGlvbikge1xuICAgIGNvbnN0IGNvb3JkcyA9IGdlb3Bvc2l0aW9uLmNvb3JkcztcbiAgICBjbGllbnQuY29vcmRpbmF0ZXMgPSBbY29vcmRzLmxhdGl0dWRlLCBjb29yZHMubG9uZ2l0dWRlXTtcbiAgICBjbGllbnQuZ2VvcG9zaXRpb24gPSBnZW9wb3NpdGlvbjtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfb25FcnJvcihlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKGVyci5zdGFjayk7XG4gIH1cbn1cblxuc2VydmljZU1hbmFnZXIucmVnaXN0ZXIoU0VSVklDRV9JRCwgR2VvbG9jYXRpb24pO1xuXG5leHBvcnQgZGVmYXVsdCBHZW9sb2NhdGlvbjtcbiJdfQ==