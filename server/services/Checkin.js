'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isInteger = require('babel-runtime/core-js/number/is-integer');

var _isInteger2 = _interopRequireDefault(_isInteger);

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

var _helpers = require('../../utils/helpers');

var _serviceManager = require('../core/serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SERVICE_ID = 'service:checkin';

/**
 * Interface for the server `'checkin'` service.
 *
 * This service is one of the provided services aimed at identifying clients inside
 * the experience along with the [`'locator'`]{@link module:soundworks/server.Locator}
 * and [`'placer'`]{@link module:soundworks/server.Placer} services.
 *
 * The `'checkin'` service is the most simple among these services as the server
 * simply assigns a ticket to the client among the available ones. The ticket can
 * optionally be associated with coordinates or label according to the server
 * `setup` configuration.
 *
 * __*The service must be used with its [client-side counterpart]{@link module:soundworks/client.Checkin}*__
 *
 * @see {@link module:soundworks/server.Locator}
 * @see {@link module:soundworks/server.Placer}
 *
 * @param {Object} options
 * @param {Boolean}  [options.order='ascending'] - The order in which indices
 * are assigned. Currently supported values are:
 * - `'ascending'`: indices are assigned in ascending order
 * - `'random'`: indices are assigned in random order
 *
 * @memberof module:soundworks/server
 * @example
 * // inside the experience constructor
 * this.checkin = this.require('checkin');
 */

var Checkin = function (_Service) {
  (0, _inherits3.default)(Checkin, _Service);

  /** _<span class="warning">__WARNING__</span> This class should never be instanciated manually_ */
  function Checkin() {
    (0, _classCallCheck3.default)(this, Checkin);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Checkin.__proto__ || (0, _getPrototypeOf2.default)(Checkin)).call(this, SERVICE_ID));

    var defaults = {
      configItem: 'setup'
    };

    _this.configure(defaults);
    // use shared config service to share the setup
    _this._sharedConfig = _this.require('shared-config');
    return _this;
  }

  /** @private */


  (0, _createClass3.default)(Checkin, [{
    key: 'start',
    value: function start() {
      (0, _get3.default)(Checkin.prototype.__proto__ || (0, _getPrototypeOf2.default)(Checkin.prototype), 'start', this).call(this);
      var configItem = this.options.configItem;

      /**
       * Setup retrieved from the server configuration.
       * @type {Object}
       */
      this.setup = this._sharedConfig.get(configItem);

      if (this.setup === null) throw new Error('"' + SERVICE_ID + '": server.config.' + configItem + ' is not defined');

      /**
       * Maximum number of clients checked in (may limit or be limited by the
       * number of predefined labels and/or coordinates).
       * @type {Number}
       */
      this.capacity = (0, _helpers.getOpt)(this.setup && this.setup.capacity, Infinity, 1);

      /**
       * List of the clients checked in at their corresponding indices.
       * @type {Client[]}
       */
      this.clients = [];

      /** @private */
      this._availableIndices = []; // array of available indices
      this._nextAscendingIndex = 0; // next index when _availableIndices is empty

      var setup = this.options.setup;

      if (setup) {
        var numLabels = setup.labels ? setup.labels.length : Infinity;
        var numCoordinates = setup.coordinates ? setup.coordinates.length : Infinity;
        var numPositions = Math.min(numLabels, numCoordinates);

        if (this.capacity > numPositions) this.capacity = numPositions;
      }
    }

    /** @private */

  }, {
    key: '_getRandomIndex',
    value: function _getRandomIndex() {
      for (var i = this._nextAscendingIndex; i < this.capacity; i++) {
        this._availableIndices.push(i);
      }this._nextAscendingIndex = this.capacity;
      var numAvailable = this._availableIndices.length;

      if (numAvailable > 0) {
        var random = Math.floor(Math.random() * numAvailable);
        return this._availableIndices.splice(random, 1)[0];
      }

      return -1;
    }

    /** @private */

  }, {
    key: '_getAscendingIndex',
    value: function _getAscendingIndex() {
      if (this._availableIndices.length > 0) {
        this._availableIndices.sort(function (a, b) {
          return a - b;
        });

        return this._availableIndices.splice(0, 1)[0];
      } else if (this._nextAscendingIndex < this.capacity) {
        return this._nextAscendingIndex++;
      }

      return -1;
    }

    /** @private */

  }, {
    key: '_releaseIndex',
    value: function _releaseIndex(index) {
      if ((0, _isInteger2.default)(index)) this._availableIndices.push(index);
    }

    /** @private */

  }, {
    key: '_onRequest',
    value: function _onRequest(client) {
      var _this2 = this;

      return function (order) {
        var index = -1;

        if (order === 'random' && _this2.capacity !== Infinity) index = _this2._getRandomIndex();else // if (order === 'acsending')
          index = _this2._getAscendingIndex();

        client.index = index;

        if (index >= 0) {
          var setup = _this2.setup;
          var label = void 0;
          var coordinates = void 0;

          if (setup) {
            label = setup.labels ? setup.labels[index] : undefined;
            coordinates = setup.coordinates ? setup.coordinates[index] : undefined;

            client.label = label;

            if (client.coordinates === null) client.coordinates = coordinates;
          }

          _this2.clients[index] = client;
          _this2.send(client, 'position', index, label, coordinates);
        } else {
          _this2.send(client, 'unavailable');
        }
      };
    }

    /** @private */

  }, {
    key: 'connect',
    value: function connect(client) {
      (0, _get3.default)(Checkin.prototype.__proto__ || (0, _getPrototypeOf2.default)(Checkin.prototype), 'connect', this).call(this, client);

      this.receive(client, 'request', this._onRequest(client));
    }

    /** @private */

  }, {
    key: 'disconnect',
    value: function disconnect(client) {
      (0, _get3.default)(Checkin.prototype.__proto__ || (0, _getPrototypeOf2.default)(Checkin.prototype), 'disconnect', this).call(this, client);

      var index = client.index;

      if (index >= 0) {
        delete this.clients[index];
        this._releaseIndex(index);
      }
    }
  }]);
  return Checkin;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, Checkin);

exports.default = Checkin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNoZWNraW4uanMiXSwibmFtZXMiOlsiU0VSVklDRV9JRCIsIkNoZWNraW4iLCJkZWZhdWx0cyIsImNvbmZpZ0l0ZW0iLCJjb25maWd1cmUiLCJfc2hhcmVkQ29uZmlnIiwicmVxdWlyZSIsIm9wdGlvbnMiLCJzZXR1cCIsImdldCIsIkVycm9yIiwiY2FwYWNpdHkiLCJJbmZpbml0eSIsImNsaWVudHMiLCJfYXZhaWxhYmxlSW5kaWNlcyIsIl9uZXh0QXNjZW5kaW5nSW5kZXgiLCJudW1MYWJlbHMiLCJsYWJlbHMiLCJsZW5ndGgiLCJudW1Db29yZGluYXRlcyIsImNvb3JkaW5hdGVzIiwibnVtUG9zaXRpb25zIiwiTWF0aCIsIm1pbiIsImkiLCJwdXNoIiwibnVtQXZhaWxhYmxlIiwicmFuZG9tIiwiZmxvb3IiLCJzcGxpY2UiLCJzb3J0IiwiYSIsImIiLCJpbmRleCIsImNsaWVudCIsIm9yZGVyIiwiX2dldFJhbmRvbUluZGV4IiwiX2dldEFzY2VuZGluZ0luZGV4IiwibGFiZWwiLCJ1bmRlZmluZWQiLCJzZW5kIiwicmVjZWl2ZSIsIl9vblJlcXVlc3QiLCJfcmVsZWFzZUluZGV4IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxhQUFhLGlCQUFuQjs7QUFHQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUE0Qk1DLE87OztBQUNKO0FBQ0EscUJBQWM7QUFBQTs7QUFBQSx3SUFDTkQsVUFETTs7QUFHWixRQUFNRSxXQUFXO0FBQ2ZDLGtCQUFZO0FBREcsS0FBakI7O0FBSUEsVUFBS0MsU0FBTCxDQUFlRixRQUFmO0FBQ0E7QUFDQSxVQUFLRyxhQUFMLEdBQXFCLE1BQUtDLE9BQUwsQ0FBYSxlQUFiLENBQXJCO0FBVFk7QUFVYjs7QUFFRDs7Ozs7NEJBQ1E7QUFDTjtBQUNBLFVBQU1ILGFBQWEsS0FBS0ksT0FBTCxDQUFhSixV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O0FBQ0Q7QUFDRjs7Ozs7QUFHSCx5QkFBZVcsUUFBZixDQUF3QjVDLFVBQXhCLEVBQW9DQyxPQUFwQzs7a0JBRWVBLE8iLCJmaWxlIjoiQ2hlY2tpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTZXJ2aWNlIGZyb20gJy4uL2NvcmUvU2VydmljZSc7XG5pbXBvcnQgeyBnZXRPcHQgfSBmcm9tICcuLi8uLi91dGlscy9oZWxwZXJzJztcbmltcG9ydCBzZXJ2aWNlTWFuYWdlciBmcm9tICcuLi9jb3JlL3NlcnZpY2VNYW5hZ2VyJztcblxuY29uc3QgU0VSVklDRV9JRCA9ICdzZXJ2aWNlOmNoZWNraW4nO1xuXG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUgc2VydmVyIGAnY2hlY2tpbidgIHNlcnZpY2UuXG4gKlxuICogVGhpcyBzZXJ2aWNlIGlzIG9uZSBvZiB0aGUgcHJvdmlkZWQgc2VydmljZXMgYWltZWQgYXQgaWRlbnRpZnlpbmcgY2xpZW50cyBpbnNpZGVcbiAqIHRoZSBleHBlcmllbmNlIGFsb25nIHdpdGggdGhlIFtgJ2xvY2F0b3InYF17QGxpbmsgbW9kdWxlOnNvdW5kd29ya3Mvc2VydmVyLkxvY2F0b3J9XG4gKiBhbmQgW2AncGxhY2VyJ2Bde0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL3NlcnZlci5QbGFjZXJ9IHNlcnZpY2VzLlxuICpcbiAqIFRoZSBgJ2NoZWNraW4nYCBzZXJ2aWNlIGlzIHRoZSBtb3N0IHNpbXBsZSBhbW9uZyB0aGVzZSBzZXJ2aWNlcyBhcyB0aGUgc2VydmVyXG4gKiBzaW1wbHkgYXNzaWducyBhIHRpY2tldCB0byB0aGUgY2xpZW50IGFtb25nIHRoZSBhdmFpbGFibGUgb25lcy4gVGhlIHRpY2tldCBjYW5cbiAqIG9wdGlvbmFsbHkgYmUgYXNzb2NpYXRlZCB3aXRoIGNvb3JkaW5hdGVzIG9yIGxhYmVsIGFjY29yZGluZyB0byB0aGUgc2VydmVyXG4gKiBgc2V0dXBgIGNvbmZpZ3VyYXRpb24uXG4gKlxuICogX18qVGhlIHNlcnZpY2UgbXVzdCBiZSB1c2VkIHdpdGggaXRzIFtjbGllbnQtc2lkZSBjb3VudGVycGFydF17QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LkNoZWNraW59Kl9fXG4gKlxuICogQHNlZSB7QGxpbmsgbW9kdWxlOnNvdW5kd29ya3Mvc2VydmVyLkxvY2F0b3J9XG4gKiBAc2VlIHtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9zZXJ2ZXIuUGxhY2VyfVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge0Jvb2xlYW59ICBbb3B0aW9ucy5vcmRlcj0nYXNjZW5kaW5nJ10gLSBUaGUgb3JkZXIgaW4gd2hpY2ggaW5kaWNlc1xuICogYXJlIGFzc2lnbmVkLiBDdXJyZW50bHkgc3VwcG9ydGVkIHZhbHVlcyBhcmU6XG4gKiAtIGAnYXNjZW5kaW5nJ2A6IGluZGljZXMgYXJlIGFzc2lnbmVkIGluIGFzY2VuZGluZyBvcmRlclxuICogLSBgJ3JhbmRvbSdgOiBpbmRpY2VzIGFyZSBhc3NpZ25lZCBpbiByYW5kb20gb3JkZXJcbiAqXG4gKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3Mvc2VydmVyXG4gKiBAZXhhbXBsZVxuICogLy8gaW5zaWRlIHRoZSBleHBlcmllbmNlIGNvbnN0cnVjdG9yXG4gKiB0aGlzLmNoZWNraW4gPSB0aGlzLnJlcXVpcmUoJ2NoZWNraW4nKTtcbiAqL1xuY2xhc3MgQ2hlY2tpbiBleHRlbmRzIFNlcnZpY2Uge1xuICAvKiogXzxzcGFuIGNsYXNzPVwid2FybmluZ1wiPl9fV0FSTklOR19fPC9zcGFuPiBUaGlzIGNsYXNzIHNob3VsZCBuZXZlciBiZSBpbnN0YW5jaWF0ZWQgbWFudWFsbHlfICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKFNFUlZJQ0VfSUQpO1xuXG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgICBjb25maWdJdGVtOiAnc2V0dXAnLFxuICAgIH07XG5cbiAgICB0aGlzLmNvbmZpZ3VyZShkZWZhdWx0cyk7XG4gICAgLy8gdXNlIHNoYXJlZCBjb25maWcgc2VydmljZSB0byBzaGFyZSB0aGUgc2V0dXBcbiAgICB0aGlzLl9zaGFyZWRDb25maWcgPSB0aGlzLnJlcXVpcmUoJ3NoYXJlZC1jb25maWcnKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuICAgIGNvbnN0IGNvbmZpZ0l0ZW0gPSB0aGlzLm9wdGlvbnMuY29uZmlnSXRlbTtcblxuICAgIC8qKlxuICAgICAqIFNldHVwIHJldHJpZXZlZCBmcm9tIHRoZSBzZXJ2ZXIgY29uZmlndXJhdGlvbi5cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMuc2V0dXAgPSB0aGlzLl9zaGFyZWRDb25maWcuZ2V0KGNvbmZpZ0l0ZW0pO1xuXG4gICAgaWYgKHRoaXMuc2V0dXAgPT09IG51bGwpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHtTRVJWSUNFX0lEfVwiOiBzZXJ2ZXIuY29uZmlnLiR7Y29uZmlnSXRlbX0gaXMgbm90IGRlZmluZWRgKTtcblxuICAgIC8qKlxuICAgICAqIE1heGltdW0gbnVtYmVyIG9mIGNsaWVudHMgY2hlY2tlZCBpbiAobWF5IGxpbWl0IG9yIGJlIGxpbWl0ZWQgYnkgdGhlXG4gICAgICogbnVtYmVyIG9mIHByZWRlZmluZWQgbGFiZWxzIGFuZC9vciBjb29yZGluYXRlcykuXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmNhcGFjaXR5ID0gZ2V0T3B0KHRoaXMuc2V0dXAgJiYgdGhpcy5zZXR1cC5jYXBhY2l0eSwgSW5maW5pdHksIDEpO1xuXG4gICAgLyoqXG4gICAgICogTGlzdCBvZiB0aGUgY2xpZW50cyBjaGVja2VkIGluIGF0IHRoZWlyIGNvcnJlc3BvbmRpbmcgaW5kaWNlcy5cbiAgICAgKiBAdHlwZSB7Q2xpZW50W119XG4gICAgICovXG4gICAgdGhpcy5jbGllbnRzID0gW107XG5cbiAgICAvKiogQHByaXZhdGUgKi9cbiAgICB0aGlzLl9hdmFpbGFibGVJbmRpY2VzID0gW107IC8vIGFycmF5IG9mIGF2YWlsYWJsZSBpbmRpY2VzXG4gICAgdGhpcy5fbmV4dEFzY2VuZGluZ0luZGV4ID0gMDsgLy8gbmV4dCBpbmRleCB3aGVuIF9hdmFpbGFibGVJbmRpY2VzIGlzIGVtcHR5XG5cbiAgICBjb25zdCBzZXR1cCA9IHRoaXMub3B0aW9ucy5zZXR1cDtcblxuICAgIGlmIChzZXR1cCkge1xuICAgICAgY29uc3QgbnVtTGFiZWxzID0gc2V0dXAubGFiZWxzID8gc2V0dXAubGFiZWxzLmxlbmd0aCA6IEluZmluaXR5O1xuICAgICAgY29uc3QgbnVtQ29vcmRpbmF0ZXMgPSBzZXR1cC5jb29yZGluYXRlcyA/IHNldHVwLmNvb3JkaW5hdGVzLmxlbmd0aCA6IEluZmluaXR5O1xuICAgICAgY29uc3QgbnVtUG9zaXRpb25zID0gTWF0aC5taW4obnVtTGFiZWxzLCBudW1Db29yZGluYXRlcyk7XG5cbiAgICAgIGlmICh0aGlzLmNhcGFjaXR5ID4gbnVtUG9zaXRpb25zKVxuICAgICAgICB0aGlzLmNhcGFjaXR5ID0gbnVtUG9zaXRpb25zO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfZ2V0UmFuZG9tSW5kZXgoKSB7XG4gICAgZm9yIChsZXQgaSA9IHRoaXMuX25leHRBc2NlbmRpbmdJbmRleDsgaSA8IHRoaXMuY2FwYWNpdHk7IGkrKylcbiAgICAgIHRoaXMuX2F2YWlsYWJsZUluZGljZXMucHVzaChpKTtcblxuICAgIHRoaXMuX25leHRBc2NlbmRpbmdJbmRleCA9IHRoaXMuY2FwYWNpdHk7XG4gICAgY29uc3QgbnVtQXZhaWxhYmxlID0gdGhpcy5fYXZhaWxhYmxlSW5kaWNlcy5sZW5ndGg7XG5cbiAgICBpZiAobnVtQXZhaWxhYmxlID4gMCkge1xuICAgICAgY29uc3QgcmFuZG9tID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbnVtQXZhaWxhYmxlKTtcbiAgICAgIHJldHVybiB0aGlzLl9hdmFpbGFibGVJbmRpY2VzLnNwbGljZShyYW5kb20sIDEpWzBdO1xuICAgIH1cblxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfZ2V0QXNjZW5kaW5nSW5kZXgoKSB7XG4gICAgaWYgKHRoaXMuX2F2YWlsYWJsZUluZGljZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fYXZhaWxhYmxlSW5kaWNlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEgLSBiO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB0aGlzLl9hdmFpbGFibGVJbmRpY2VzLnNwbGljZSgwLCAxKVswXTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX25leHRBc2NlbmRpbmdJbmRleCA8IHRoaXMuY2FwYWNpdHkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9uZXh0QXNjZW5kaW5nSW5kZXgrKztcbiAgICB9XG5cbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX3JlbGVhc2VJbmRleChpbmRleCkge1xuICAgIGlmIChOdW1iZXIuaXNJbnRlZ2VyKGluZGV4KSlcbiAgICAgIHRoaXMuX2F2YWlsYWJsZUluZGljZXMucHVzaChpbmRleCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX29uUmVxdWVzdChjbGllbnQpIHtcbiAgICByZXR1cm4gKG9yZGVyKSA9PiB7XG4gICAgICBsZXQgaW5kZXggPSAtMTtcblxuICAgICAgaWYgKG9yZGVyID09PSAncmFuZG9tJyAmJiB0aGlzLmNhcGFjaXR5ICE9PSBJbmZpbml0eSlcbiAgICAgICAgaW5kZXggPSB0aGlzLl9nZXRSYW5kb21JbmRleCgpO1xuICAgICAgZWxzZSAvLyBpZiAob3JkZXIgPT09ICdhY3NlbmRpbmcnKVxuICAgICAgICBpbmRleCA9IHRoaXMuX2dldEFzY2VuZGluZ0luZGV4KCk7XG5cbiAgICAgIGNsaWVudC5pbmRleCA9IGluZGV4O1xuXG4gICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICBjb25zdCBzZXR1cCA9IHRoaXMuc2V0dXA7XG4gICAgICAgIGxldCBsYWJlbDtcbiAgICAgICAgbGV0IGNvb3JkaW5hdGVzO1xuXG4gICAgICAgIGlmIChzZXR1cCkge1xuICAgICAgICAgIGxhYmVsID0gc2V0dXAubGFiZWxzID8gc2V0dXAubGFiZWxzW2luZGV4XSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICBjb29yZGluYXRlcyA9IHNldHVwLmNvb3JkaW5hdGVzID8gc2V0dXAuY29vcmRpbmF0ZXNbaW5kZXhdIDogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgY2xpZW50LmxhYmVsID0gbGFiZWw7XG5cbiAgICAgICAgICBpZiAoY2xpZW50LmNvb3JkaW5hdGVzID09PSBudWxsKVxuICAgICAgICAgICAgY2xpZW50LmNvb3JkaW5hdGVzID0gY29vcmRpbmF0ZXM7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNsaWVudHNbaW5kZXhdID0gY2xpZW50O1xuICAgICAgICB0aGlzLnNlbmQoY2xpZW50LCAncG9zaXRpb24nLCBpbmRleCwgbGFiZWwsIGNvb3JkaW5hdGVzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2VuZChjbGllbnQsICd1bmF2YWlsYWJsZScpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgY29ubmVjdChjbGllbnQpIHtcbiAgICBzdXBlci5jb25uZWN0KGNsaWVudCk7XG5cbiAgICB0aGlzLnJlY2VpdmUoY2xpZW50LCAncmVxdWVzdCcsIHRoaXMuX29uUmVxdWVzdChjbGllbnQpKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBkaXNjb25uZWN0KGNsaWVudCkge1xuICAgIHN1cGVyLmRpc2Nvbm5lY3QoY2xpZW50KTtcblxuICAgIGNvbnN0IGluZGV4ID0gY2xpZW50LmluZGV4O1xuXG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIGRlbGV0ZSB0aGlzLmNsaWVudHNbaW5kZXhdO1xuICAgICAgdGhpcy5fcmVsZWFzZUluZGV4KGluZGV4KTtcbiAgICB9XG4gIH1cbn1cblxuc2VydmljZU1hbmFnZXIucmVnaXN0ZXIoU0VSVklDRV9JRCwgQ2hlY2tpbik7XG5cbmV4cG9ydCBkZWZhdWx0IENoZWNraW47XG4iXX0=