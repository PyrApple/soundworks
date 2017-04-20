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

var _wavesAudio = require('waves-audio');

var _SegmentedView = require('../views/SegmentedView');

var _SegmentedView2 = _interopRequireDefault(_SegmentedView);

var _Service2 = require('../core/Service');

var _Service3 = _interopRequireDefault(_Service2);

var _serviceManager = require('../core/serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

var _client = require('sync/client');

var _client2 = _interopRequireDefault(_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SERVICE_ID = 'service:sync';

var defaultViewTemplate = '\n<div class="section-top"></div>\n<div class="section-center flex-center">\n  <p class="soft-blink"><%= wait %></p>\n</div>\n<div class="section-bottom"></div>\n';

var defaultViewContent = {
  wait: 'Clock syncing,<br />stand by&hellip;'
};

/**
 * Interface for the client `'sync'` service.
 *
 * The `sync` service synchronizes the local audio clock of the client with the
 * clock of the server (master clock). It internally relies on the `WebAudio`
 * clock and then requires the `platform` service to access this feature.
 *
 * __*The service must be used with its
 * [server-side counterpart]{@link module:soundworks/server.Sync}*__
 *
 * _<span class="warning">__WARNING__</span> This class should never be
 * instanciated manually_
 *
 * _Note:_ the service is based on
 * [`github.com/collective-soundworks/sync`](https://github.com/collective-soundworks/sync).
 *
 * @memberof module:soundworks/client
 *
 * @example
 * // inside the experience constructor
 * this.sync = this.require('sync');
 * // when the experience has started, translate the sync time in local time
 * const syncTime = this.sync.getSyncTime();
 * const localTime = this.sync.getAudioTime(syncTime);
 */

var Sync = function (_Service) {
  (0, _inherits3.default)(Sync, _Service);

  function Sync() {
    (0, _classCallCheck3.default)(this, Sync);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Sync.__proto__ || (0, _getPrototypeOf2.default)(Sync)).call(this, SERVICE_ID, true));

    var defaults = {
      viewCtor: _SegmentedView2.default,
      viewPriority: 3,
      useAudioTime: true
    };

    _this.configure(defaults);

    _this._defaultViewTemplate = defaultViewTemplate;
    _this._defaultViewContent = defaultViewContent;

    _this.require('platform', { features: 'web-audio' });

    _this._syncStatusReport = _this._syncStatusReport.bind(_this);
    _this._reportListeners = [];
    return _this;
  }

  /** @private */


  (0, _createClass3.default)(Sync, [{
    key: 'init',
    value: function init() {
      var getTime = this.options.useAudioTime ? function () {
        return _wavesAudio.audioContext.currentTime;
      } : function () {
        return new Date().getTime() * 0.001;
      };

      this._sync = new _client2.default(getTime);
      this._ready = false;

      this.viewCtor = this.options.viewCtor;
      this.view = this.createView();
    }

    /** @private */

  }, {
    key: 'start',
    value: function start() {
      (0, _get3.default)(Sync.prototype.__proto__ || (0, _getPrototypeOf2.default)(Sync.prototype), 'start', this).call(this);

      if (!this.hasStarted) this.init();

      this.show();
      this._sync.start(this.send, this.receive, this._syncStatusReport);
    }

    /** @private */

  }, {
    key: 'stop',
    value: function stop() {
      this.hide();
      (0, _get3.default)(Sync.prototype.__proto__ || (0, _getPrototypeOf2.default)(Sync.prototype), 'stop', this).call(this);
    }

    /**
     * Return the time in the local clock. If no arguments provided,
     * returns the current local time.
     * @param {Number} syncTime - Time from the sync clock (in _seconds_).
     * @return {Number} - Local time corresponding to the given
     *  `syncTime` (in _seconds_).
     */

  }, {
    key: 'getAudioTime',
    value: function getAudioTime(syncTime) {
      return this._sync.getLocalTime(syncTime);
    }
  }, {
    key: 'getLocaltime',
    value: function getLocaltime(syncTime) {
      return this._sync.getLocalTime(syncTime);
    }

    /**
     * Return the time in the sync clock. If no arguments provided,
     * returns the current sync time.
     * @param {Number} audioTime - Time from the local clock (in _seconds_).
     * @return {Number} - Sync time corresponding to the given
     *  `audioTime` (in _seconds_).
     */

  }, {
    key: 'getSyncTime',
    value: function getSyncTime(audioTime) {
      return this._sync.getSyncTime(audioTime);
    }

    /**
     * Add a callback function to the synchronization reports from the server.
     * @param {Function} callback
     */

  }, {
    key: 'addListener',
    value: function addListener(callback) {
      this._reportListeners.push(callback);
    }
  }, {
    key: '_syncStatusReport',
    value: function _syncStatusReport(channel, report) {
      if (channel === 'sync:status') {
        if (report.status === 'training' || report.status === 'sync') {
          this._reportListeners.forEach(function (callback) {
            return callback(report);
          });

          if (!this._ready) {
            this._ready = true;
            this.ready();
          }
        }
      }
    }
  }]);
  return Sync;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, Sync);

exports.default = Sync;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlN5bmMuanMiXSwibmFtZXMiOlsiU0VSVklDRV9JRCIsImRlZmF1bHRWaWV3VGVtcGxhdGUiLCJkZWZhdWx0Vmlld0NvbnRlbnQiLCJ3YWl0IiwiU3luYyIsImRlZmF1bHRzIiwidmlld0N0b3IiLCJ2aWV3UHJpb3JpdHkiLCJ1c2VBdWRpb1RpbWUiLCJjb25maWd1cmUiLCJfZGVmYXVsdFZpZXdUZW1wbGF0ZSIsIl9kZWZhdWx0Vmlld0NvbnRlbnQiLCJyZXF1aXJlIiwiZmVhdHVyZXMiLCJfc3luY1N0YXR1c1JlcG9ydCIsImJpbmQiLCJfcmVwb3J0TGlzdGVuZXJzIiwiZ2V0VGltZSIsIm9wdGlvbnMiLCJjdXJyZW50VGltZSIsIkRhdGUiLCJfc3luYyIsIl9yZWFkeSIsInZpZXciLCJjcmVhdGVWaWV3IiwiaGFzU3RhcnRlZCIsImluaXQiLCJzaG93Iiwic3RhcnQiLCJzZW5kIiwicmVjZWl2ZSIsImhpZGUiLCJzeW5jVGltZSIsImdldExvY2FsVGltZSIsImF1ZGlvVGltZSIsImdldFN5bmNUaW1lIiwiY2FsbGJhY2siLCJwdXNoIiwiY2hhbm5lbCIsInJlcG9ydCIsInN0YXR1cyIsImZvckVhY2giLCJyZWFkeSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTUEsYUFBYSxjQUFuQjs7QUFFQSxJQUFNQywwTEFBTjs7QUFRQSxJQUFNQyxxQkFBcUI7QUFDekJDO0FBRHlCLENBQTNCOztBQUlBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQXlCTUMsSTs7O0FBQ0osa0JBQWM7QUFBQTs7QUFBQSxrSUFDTkosVUFETSxFQUNNLElBRE47O0FBR1osUUFBTUssV0FBVztBQUNmQyx1Q0FEZTtBQUVmQyxvQkFBYyxDQUZDO0FBR2ZDLG9CQUFjO0FBSEMsS0FBakI7O0FBT0EsVUFBS0MsU0FBTCxDQUFlSixRQUFmOztBQUVBLFVBQUtLLG9CQUFMLEdBQTRCVCxtQkFBNUI7QUFDQSxVQUFLVSxtQkFBTCxHQUEyQlQsa0JBQTNCOztBQUVBLFVBQUtVLE9BQUwsQ0FBYSxVQUFiLEVBQXlCLEVBQUVDLFVBQVUsV0FBWixFQUF6Qjs7QUFFQSxVQUFLQyxpQkFBTCxHQUF5QixNQUFLQSxpQkFBTCxDQUF1QkMsSUFBdkIsT0FBekI7QUFDQSxVQUFLQyxnQkFBTCxHQUF3QixFQUF4QjtBQWxCWTtBQW1CYjs7QUFFRDs7Ozs7MkJBQ087QUFDTCxVQUFNQyxVQUFVLEtBQUtDLE9BQUwsQ0FBYVYsWUFBYixHQUNkO0FBQUEsZUFBTSx5QkFBYVcsV0FBbkI7QUFBQSxPQURjLEdBRWQ7QUFBQSxlQUFPLElBQUlDLElBQUosR0FBV0gsT0FBWCxLQUF1QixLQUE5QjtBQUFBLE9BRkY7O0FBSUEsV0FBS0ksS0FBTCxHQUFhLHFCQUFlSixPQUFmLENBQWI7QUFDQSxXQUFLSyxNQUFMLEdBQWMsS0FBZDs7QUFFQSxXQUFLaEIsUUFBTCxHQUFnQixLQUFLWSxPQUFMLENBQWFaLFFBQTdCO0FBQ0EsV0FBS2lCLElBQUwsR0FBWSxLQUFLQyxVQUFMLEVBQVo7QUFDRDs7QUFFRDs7Ozs0QkFDUTtBQUNOOztBQUVBLFVBQUksQ0FBQyxLQUFLQyxVQUFWLEVBQ0UsS0FBS0MsSUFBTDs7QUFFRixXQUFLQyxJQUFMO0FBQ0EsV0FBS04sS0FBTCxDQUFXTyxLQUFYLENBQWlCLEtBQUtDLElBQXRCLEVBQTRCLEtBQUtDLE9BQWpDLEVBQTBDLEtBQUtoQixpQkFBL0M7QUFDRDs7QUFFRDs7OzsyQkFDTztBQUNMLFdBQUtpQixJQUFMO0FBQ0E7QUFDRDs7QUFFRDs7Ozs7Ozs7OztpQ0FPYUMsUSxFQUFVO0FBQ3JCLGFBQU8sS0FBS1gsS0FBTCxDQUFXWSxZQUFYLENBQXdCRCxRQUF4QixDQUFQO0FBQ0Q7OztpQ0FHWUEsUSxFQUFVO0FBQ3JCLGFBQU8sS0FBS1gsS0FBTCxDQUFXWSxZQUFYLENBQXdCRCxRQUF4QixDQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7Z0NBT1lFLFMsRUFBVztBQUNyQixhQUFPLEtBQUtiLEtBQUwsQ0FBV2MsV0FBWCxDQUF1QkQsU0FBdkIsQ0FBUDtBQUNEOztBQUVEOzs7Ozs7O2dDQUlZRSxRLEVBQVU7QUFDcEIsV0FBS3BCLGdCQUFMLENBQXNCcUIsSUFBdEIsQ0FBMkJELFFBQTNCO0FBQ0Q7OztzQ0FFaUJFLE8sRUFBU0MsTSxFQUFRO0FBQ2pDLFVBQUlELFlBQVksYUFBaEIsRUFBK0I7QUFDN0IsWUFBSUMsT0FBT0MsTUFBUCxLQUFrQixVQUFsQixJQUFnQ0QsT0FBT0MsTUFBUCxLQUFrQixNQUF0RCxFQUE4RDtBQUM1RCxlQUFLeEIsZ0JBQUwsQ0FBc0J5QixPQUF0QixDQUE4QixVQUFDTCxRQUFEO0FBQUEsbUJBQWVBLFNBQVNHLE1BQVQsQ0FBZjtBQUFBLFdBQTlCOztBQUVBLGNBQUksQ0FBQyxLQUFLakIsTUFBVixFQUFrQjtBQUNoQixpQkFBS0EsTUFBTCxHQUFjLElBQWQ7QUFDQSxpQkFBS29CLEtBQUw7QUFDRDtBQUNGO0FBQ0Y7QUFDRjs7Ozs7QUFJSCx5QkFBZUMsUUFBZixDQUF3QjNDLFVBQXhCLEVBQW9DSSxJQUFwQzs7a0JBRWVBLEkiLCJmaWxlIjoiU3luYy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGF1ZGlvQ29udGV4dCB9IGZyb20gJ3dhdmVzLWF1ZGlvJztcbmltcG9ydCBTZWdtZW50ZWRWaWV3IGZyb20gJy4uL3ZpZXdzL1NlZ21lbnRlZFZpZXcnO1xuaW1wb3J0IFNlcnZpY2UgZnJvbSAnLi4vY29yZS9TZXJ2aWNlJztcbmltcG9ydCBzZXJ2aWNlTWFuYWdlciBmcm9tICcuLi9jb3JlL3NlcnZpY2VNYW5hZ2VyJztcbmltcG9ydCBTeW5jTW9kdWxlIGZyb20gJ3N5bmMvY2xpZW50JztcblxuY29uc3QgU0VSVklDRV9JRCA9ICdzZXJ2aWNlOnN5bmMnO1xuXG5jb25zdCBkZWZhdWx0Vmlld1RlbXBsYXRlID0gYFxuPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wXCI+PC9kaXY+XG48ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj5cbiAgPHAgY2xhc3M9XCJzb2Z0LWJsaW5rXCI+PCU9IHdhaXQgJT48L3A+XG48L2Rpdj5cbjxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbVwiPjwvZGl2PlxuYDtcblxuY29uc3QgZGVmYXVsdFZpZXdDb250ZW50ID0ge1xuICB3YWl0OiBgQ2xvY2sgc3luY2luZyw8YnIgLz5zdGFuZCBieSZoZWxsaXA7YCxcbn07XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUgY2xpZW50IGAnc3luYydgIHNlcnZpY2UuXG4gKlxuICogVGhlIGBzeW5jYCBzZXJ2aWNlIHN5bmNocm9uaXplcyB0aGUgbG9jYWwgYXVkaW8gY2xvY2sgb2YgdGhlIGNsaWVudCB3aXRoIHRoZVxuICogY2xvY2sgb2YgdGhlIHNlcnZlciAobWFzdGVyIGNsb2NrKS4gSXQgaW50ZXJuYWxseSByZWxpZXMgb24gdGhlIGBXZWJBdWRpb2BcbiAqIGNsb2NrIGFuZCB0aGVuIHJlcXVpcmVzIHRoZSBgcGxhdGZvcm1gIHNlcnZpY2UgdG8gYWNjZXNzIHRoaXMgZmVhdHVyZS5cbiAqXG4gKiBfXypUaGUgc2VydmljZSBtdXN0IGJlIHVzZWQgd2l0aCBpdHNcbiAqIFtzZXJ2ZXItc2lkZSBjb3VudGVycGFydF17QGxpbmsgbW9kdWxlOnNvdW5kd29ya3Mvc2VydmVyLlN5bmN9Kl9fXG4gKlxuICogXzxzcGFuIGNsYXNzPVwid2FybmluZ1wiPl9fV0FSTklOR19fPC9zcGFuPiBUaGlzIGNsYXNzIHNob3VsZCBuZXZlciBiZVxuICogaW5zdGFuY2lhdGVkIG1hbnVhbGx5X1xuICpcbiAqIF9Ob3RlOl8gdGhlIHNlcnZpY2UgaXMgYmFzZWQgb25cbiAqIFtgZ2l0aHViLmNvbS9jb2xsZWN0aXZlLXNvdW5kd29ya3Mvc3luY2BdKGh0dHBzOi8vZ2l0aHViLmNvbS9jb2xsZWN0aXZlLXNvdW5kd29ya3Mvc3luYykuXG4gKlxuICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudFxuICpcbiAqIEBleGFtcGxlXG4gKiAvLyBpbnNpZGUgdGhlIGV4cGVyaWVuY2UgY29uc3RydWN0b3JcbiAqIHRoaXMuc3luYyA9IHRoaXMucmVxdWlyZSgnc3luYycpO1xuICogLy8gd2hlbiB0aGUgZXhwZXJpZW5jZSBoYXMgc3RhcnRlZCwgdHJhbnNsYXRlIHRoZSBzeW5jIHRpbWUgaW4gbG9jYWwgdGltZVxuICogY29uc3Qgc3luY1RpbWUgPSB0aGlzLnN5bmMuZ2V0U3luY1RpbWUoKTtcbiAqIGNvbnN0IGxvY2FsVGltZSA9IHRoaXMuc3luYy5nZXRBdWRpb1RpbWUoc3luY1RpbWUpO1xuICovXG5jbGFzcyBTeW5jIGV4dGVuZHMgU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKFNFUlZJQ0VfSUQsIHRydWUpO1xuXG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgICB2aWV3Q3RvcjogU2VnbWVudGVkVmlldyxcbiAgICAgIHZpZXdQcmlvcml0eTogMyxcbiAgICAgIHVzZUF1ZGlvVGltZTogdHJ1ZSxcbiAgICAgIC8vIEB0b2RvIC0gYWRkIG9wdGlvbnMgdG8gY29uZmlndXJlIHRoZSBzeW5jIHNlcnZpY2VcbiAgICB9O1xuXG4gICAgdGhpcy5jb25maWd1cmUoZGVmYXVsdHMpO1xuXG4gICAgdGhpcy5fZGVmYXVsdFZpZXdUZW1wbGF0ZSA9IGRlZmF1bHRWaWV3VGVtcGxhdGU7XG4gICAgdGhpcy5fZGVmYXVsdFZpZXdDb250ZW50ID0gZGVmYXVsdFZpZXdDb250ZW50O1xuXG4gICAgdGhpcy5yZXF1aXJlKCdwbGF0Zm9ybScsIHsgZmVhdHVyZXM6ICd3ZWItYXVkaW8nIH0pO1xuXG4gICAgdGhpcy5fc3luY1N0YXR1c1JlcG9ydCA9IHRoaXMuX3N5bmNTdGF0dXNSZXBvcnQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yZXBvcnRMaXN0ZW5lcnMgPSBbXTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBpbml0KCkge1xuICAgIGNvbnN0IGdldFRpbWUgPSB0aGlzLm9wdGlvbnMudXNlQXVkaW9UaW1lID9cbiAgICAgICgpID0+IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSA6XG4gICAgICAoKSA9PiAobmV3IERhdGUoKS5nZXRUaW1lKCkgKiAwLjAwMSk7XG5cbiAgICB0aGlzLl9zeW5jID0gbmV3IFN5bmNNb2R1bGUoZ2V0VGltZSk7XG4gICAgdGhpcy5fcmVhZHkgPSBmYWxzZTtcblxuICAgIHRoaXMudmlld0N0b3IgPSB0aGlzLm9wdGlvbnMudmlld0N0b3I7XG4gICAgdGhpcy52aWV3ID0gdGhpcy5jcmVhdGVWaWV3KCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTtcblxuICAgIGlmICghdGhpcy5oYXNTdGFydGVkKVxuICAgICAgdGhpcy5pbml0KCk7XG5cbiAgICB0aGlzLnNob3coKTtcbiAgICB0aGlzLl9zeW5jLnN0YXJ0KHRoaXMuc2VuZCwgdGhpcy5yZWNlaXZlLCB0aGlzLl9zeW5jU3RhdHVzUmVwb3J0KTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBzdG9wKCkge1xuICAgIHRoaXMuaGlkZSgpO1xuICAgIHN1cGVyLnN0b3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIHRpbWUgaW4gdGhlIGxvY2FsIGNsb2NrLiBJZiBubyBhcmd1bWVudHMgcHJvdmlkZWQsXG4gICAqIHJldHVybnMgdGhlIGN1cnJlbnQgbG9jYWwgdGltZS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHN5bmNUaW1lIC0gVGltZSBmcm9tIHRoZSBzeW5jIGNsb2NrIChpbiBfc2Vjb25kc18pLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gTG9jYWwgdGltZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlblxuICAgKiAgYHN5bmNUaW1lYCAoaW4gX3NlY29uZHNfKS5cbiAgICovXG4gIGdldEF1ZGlvVGltZShzeW5jVGltZSkge1xuICAgIHJldHVybiB0aGlzLl9zeW5jLmdldExvY2FsVGltZShzeW5jVGltZSk7XG4gIH1cblxuXG4gIGdldExvY2FsdGltZShzeW5jVGltZSkge1xuICAgIHJldHVybiB0aGlzLl9zeW5jLmdldExvY2FsVGltZShzeW5jVGltZSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSB0aW1lIGluIHRoZSBzeW5jIGNsb2NrLiBJZiBubyBhcmd1bWVudHMgcHJvdmlkZWQsXG4gICAqIHJldHVybnMgdGhlIGN1cnJlbnQgc3luYyB0aW1lLlxuICAgKiBAcGFyYW0ge051bWJlcn0gYXVkaW9UaW1lIC0gVGltZSBmcm9tIHRoZSBsb2NhbCBjbG9jayAoaW4gX3NlY29uZHNfKS5cbiAgICogQHJldHVybiB7TnVtYmVyfSAtIFN5bmMgdGltZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlblxuICAgKiAgYGF1ZGlvVGltZWAgKGluIF9zZWNvbmRzXykuXG4gICAqL1xuICBnZXRTeW5jVGltZShhdWRpb1RpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fc3luYy5nZXRTeW5jVGltZShhdWRpb1RpbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIHRoZSBzeW5jaHJvbml6YXRpb24gcmVwb3J0cyBmcm9tIHRoZSBzZXJ2ZXIuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAqL1xuICBhZGRMaXN0ZW5lcihjYWxsYmFjaykge1xuICAgIHRoaXMuX3JlcG9ydExpc3RlbmVycy5wdXNoKGNhbGxiYWNrKTtcbiAgfVxuXG4gIF9zeW5jU3RhdHVzUmVwb3J0KGNoYW5uZWwsIHJlcG9ydCkge1xuICAgIGlmIChjaGFubmVsID09PSAnc3luYzpzdGF0dXMnKSB7XG4gICAgICBpZiAocmVwb3J0LnN0YXR1cyA9PT0gJ3RyYWluaW5nJyB8fCByZXBvcnQuc3RhdHVzID09PSAnc3luYycpIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0TGlzdGVuZXJzLmZvckVhY2goKGNhbGxiYWNrKSA9PiAgY2FsbGJhY2socmVwb3J0KSk7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9yZWFkeSkge1xuICAgICAgICAgIHRoaXMuX3JlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLnJlYWR5KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxufVxuXG5zZXJ2aWNlTWFuYWdlci5yZWdpc3RlcihTRVJWSUNFX0lELCBTeW5jKTtcblxuZXhwb3J0IGRlZmF1bHQgU3luYztcbiJdfQ==