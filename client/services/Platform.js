'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

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

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _wavesAudio = require('waves-audio');

var _client = require('../core/client');

var _client2 = _interopRequireDefault(_client);

var _mobileDetect = require('mobile-detect');

var _mobileDetect2 = _interopRequireDefault(_mobileDetect);

var _screenfull = require('screenfull');

var _screenfull2 = _interopRequireDefault(_screenfull);

var _SegmentedView = require('../views/SegmentedView');

var _SegmentedView2 = _interopRequireDefault(_SegmentedView);

var _Service2 = require('../core/Service');

var _Service3 = _interopRequireDefault(_Service2);

var _serviceManager = require('../core/serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Definition of a feature to test.
 *
 * @typedef {Object} module:soundworks/client.Platform~definition
 * @property {String} id - Id of the definition.
 * @property {Function} check - A function that should return `true` if the
 *  feature is available on the platform, `false` otherwise.
 * @property {Function} [startHook] - A function returning a `Promise` to be
 *  executed on start (for example to ask access to microphone or geolocation).
 *  The returned promise should be resolved on `true` is the process succeded or
 *  `false` is the precess failed (e.g. permission not granted).
 * @property {Function} [interactionHook] - A function returning a Promiseto be
 *  executed on the first interaction (i.e. `click` or `touchstart`) of the user
 *  with application (for example, to initialize AudioContext on iOS devices).
 *  The returned promise should be resolved on `true` is the process succeded or
 *  `false` is the precess failed (e.g. permission not granted).
 */
var defaultDefinitions = [{
  id: 'web-audio',
  check: function check() {
    return !!_wavesAudio.audioContext;
  },
  interactionHook: function interactionHook() {
    if (!_client2.default.platform.isMobile) return _promise2.default.resolve(true);

    var g = _wavesAudio.audioContext.createGain();
    g.connect(_wavesAudio.audioContext.destination);
    g.gain.value = 0.000000001; // -180dB ?

    var o = _wavesAudio.audioContext.createOscillator();
    o.connect(g);
    o.frequency.value = 20;
    o.start(0);

    // prevent android to stop audio by keeping the oscillator active
    if (_client2.default.platform.os !== 'android') o.stop(_wavesAudio.audioContext.currentTime + 0.01);

    return _promise2.default.resolve(true);
  }
}, {
  // @note: `touch` feature workaround
  // cf. http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
  id: 'mobile-device',
  check: function check() {
    return _client2.default.platform.isMobile;
  }
}, {
  id: 'audio-input',
  check: function check() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    return !!navigator.getUserMedia;
  },
  startHook: function startHook() {
    return new _promise2.default(function (resolve, reject) {
      navigator.getUserMedia({ audio: true }, function (stream) {
        stream.getAudioTracks()[0].stop();
        resolve(true);
      }, function (err) {
        resolve(false);
        throw err;
      });
    });
  }
}, {
  id: 'full-screen',
  check: function check() {
    // functionnality that cannot brake the application
    return true;
  },
  interactionHook: function interactionHook() {
    if (_screenfull2.default.enabled) _screenfull2.default.request();

    return _promise2.default.resolve(true);
  }
}, {
  id: 'geolocation',
  check: function check() {
    return !!navigator.geolocation.getCurrentPosition;
  },
  startHook: function startHook() {
    return new _promise2.default(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(function (position) {
        // populate client with first value
        var coords = position.coords;
        _client2.default.coordinates = [coords.latitude, coords.longitude];
        _client2.default.geoposition = position;

        resolve(true);
      }, function (err) {
        resolve(false);
        throw err;
      }, {});
    });
  }
}, {
  id: 'geolocation-mock',
  check: function check() {
    return true;
  },
  startHook: function startHook() {
    var lat = Math.random() * 360 - 180;
    var lng = Math.random() * 180 - 90;
    _client2.default.coordinates = [lat, lng];
    return _promise2.default.resolve(true);
  }
}, {
  // adapted from https://github.com/richtr/NoSleep.js/blob/master/NoSleep.js
  // warning: cause 150% cpu use in chrome desktop...
  id: 'wake-lock',
  check: function check() {
    // functionnality that cannot brake the application
    return true;
  },
  interactionHook: function interactionHook() {
    if (_client2.default.platform.os === 'ios') {
      setInterval(function () {
        window.location = window.location;
        setTimeout(window.stop, 0);
      }, 30000);
    } else {
      var medias = {
        webm: "data:video/webm;base64,GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSalmQCgq17FAAw9CQE2AQAZ3aGFtbXlXQUAGd2hhbW15RIlACECPQAAAAAAAFlSua0AxrkAu14EBY8WBAZyBACK1nEADdW5khkAFVl9WUDglhohAA1ZQOIOBAeBABrCBCLqBCB9DtnVAIueBAKNAHIEAAIAwAQCdASoIAAgAAUAmJaQAA3AA/vz0AAA=",
        mp4: "data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAAG21kYXQAAAGzABAHAAABthADAowdbb9/AAAC6W1vb3YAAABsbXZoZAAAAAB8JbCAfCWwgAAAA+gAAAAAAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIVdHJhawAAAFx0a2hkAAAAD3wlsIB8JbCAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAIAAAACAAAAAABsW1kaWEAAAAgbWRoZAAAAAB8JbCAfCWwgAAAA+gAAAAAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAAVxtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEcc3RibAAAALhzdHNkAAAAAAAAAAEAAACobXA0dgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAIAAgASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAFJlc2RzAAAAAANEAAEABDwgEQAAAAADDUAAAAAABS0AAAGwAQAAAbWJEwAAAQAAAAEgAMSNiB9FAEQBFGMAAAGyTGF2YzUyLjg3LjQGAQIAAAAYc3R0cwAAAAAAAAABAAAAAQAAAAAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAAAEwAAAAEAAAAUc3RjbwAAAAAAAAABAAAALAAAAGB1ZHRhAAAAWG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAAK2lsc3QAAAAjqXRvbwAAABtkYXRhAAAAAQAAAABMYXZmNTIuNzguMw=="
      };

      var $video = document.createElement('video');
      $video.setAttribute('loop', '');

      for (var type in medias) {
        var dataURI = medias[type];
        var $source = document.createElement('source');
        $source.src = dataURI;
        $source.type = 'video/' + type;

        $video.appendChild($source);
      }

      $video.play();
    }

    return _promise2.default.resolve(true);
  }
}];

var defaultViewTemplate = '\n<% if (isCompatible === false) { %>\n  <div class="section-top"></div>\n  <div class="section-center flex-center">\n    <p><%= errorCompatibleMessage %></p>\n  </div>\n  <div class="section-bottom"></div>\n<% } else if (resolvedHooks === false) { %>\n  <div class="section-top"></div>\n  <div class="section-center flex-center">\n    <p><%= errorHooksMessage %></p>\n  </div>\n  <div class="section-bottom"></div>\n<% } else { %>\n  <div class="section-top flex-middle"></div>\n  <div class="section-center flex-center">\n      <p class="big">\n        <%= intro %>\n        <br />\n        <b><%= globals.appName %></b>\n      </p>\n  </div>\n  <div class="section-bottom flex-middle">\n    <% if (checking === true) { %>\n    <p class="small soft-blink"><%= checkingMessage %></p>\n    <% } else if (resolvedHooks === true) { %>\n    <p class="small soft-blink"><%= instructions %></p>\n    <% } %>\n  </div>\n<% } %>';

var defaultViewContent = {
  isCompatible: null,
  resolvedHooks: null,
  checking: false,
  intro: 'Welcome to',
  instructions: 'Touch the screen to join!',
  checkingMessage: 'Please wait while checking compatiblity',
  errorCompatibleMessage: 'Sorry,<br />Your device is not compatible with the application.',
  errorHooksMessage: 'Sorry,<br />The application didn\'t obtain the necessary authorizations.'
};

var SERVICE_ID = 'service:platform';

/**
 * Interface for the client `'platform'` service.
 *
 * The `platform` services is responsible for giving general informations
 * about the user's device as well as checking availability and providing hooks
 * in order to initialize the features required by the application (audio,
 * microphone, etc.).
 * If one of the required definitions is not available, a view is created with
 * an error message and `client.compatible` is set to `false`.
 *
 * Available built-in definitions are:
 * - 'web-audio'
 * - 'mobile-device': only-accept mobile devices in the application (based on
 *   User-Agent sniffing)
 * - 'audio-input': Android Only
 * - 'full-screen': Android Only, this feature won't block the application if
 *   not available.
 * - 'geolocation': check if the navigator supports geolocation. The `coordinates`
 *   and `geoposition` of the `client` are populated when the plaform service
 *   resolves. (if no update of the coordinates are needed in the application,
 *   requiring geolocation feature without using the Geolocation service should
 *   suffice).
 * - 'wake-lock': deprecated, use with caution, has been observed consumming
 *   150% cpu in chrome desktop.
 *
 * _<span class="warning">__WARNING__</span> This class should never be
 * instanciated manually_
 *
 * @param {Object} options
 * @param {Array<String>|String} options.features - Id(s) of the feature(s)
 *  required by the application. Available build-in features are:
 *  - 'web-audio'
 *  - 'mobile-device': only accept mobile devices (recognition based User-Agent)
 *  - 'audio-input': Android only
 *  - 'full-screen': Android only
 *  - 'wake-lock': deprecated, this feature should be used with caution as
 *    it has been observed to use 150% of cpu in chrome desktop.
 *
 * <!--
 * Warning: when setting `showDialog` option to `false`, unexpected behaviors
 * might occur because most of the features require an interaction or a
 * confirmation from the user in order to be initialized correctly.
 * -->
 *
 * @memberof module:soundworks/client
 * @example
 * // inside the experience constructor
 * this.platform = this.require('platform', { features: 'web-audio' });
 *
 * @see {@link module:soundworks/client.client#platform}
 */

var Platform = function (_Service) {
  (0, _inherits3.default)(Platform, _Service);

  function Platform() {
    (0, _classCallCheck3.default)(this, Platform);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Platform.__proto__ || (0, _getPrototypeOf2.default)(Platform)).call(this, SERVICE_ID, false));

    var defaults = {
      showDialog: true,
      viewCtor: _SegmentedView2.default,
      viewPriority: 10
    };

    _this.configure(defaults);

    _this._defaultViewTemplate = defaultViewTemplate;
    _this._defaultViewContent = defaultViewContent;

    _this._requiredFeatures = new _set2.default();
    _this._featureDefinitions = {};

    defaultDefinitions.forEach(function (def) {
      return _this.addFeatureDefinition(def);
    });
    return _this;
  }

  /** @private */


  (0, _createClass3.default)(Platform, [{
    key: 'configure',
    value: function configure(options) {
      if (options.features) {
        var features = options.features;

        if (typeof features === 'string') features = [features];

        this.requireFeature.apply(this, (0, _toConsumableArray3.default)(features));
        delete options.features;
      }

      (0, _get3.default)(Platform.prototype.__proto__ || (0, _getPrototypeOf2.default)(Platform.prototype), 'configure', this).call(this, options);
    }

    /** @private */

  }, {
    key: 'init',
    value: function init() {
      this._defineAudioFileExtention();
      this._definePlatform();

      this.viewCtor = this.options.viewCtor;
      this.view = this.createView();
    }

    /** @private */

  }, {
    key: 'start',
    value: function start() {
      var _this2 = this;

      (0, _get3.default)(Platform.prototype.__proto__ || (0, _getPrototypeOf2.default)(Platform.prototype), 'start', this).call(this);

      if (!this.hasStarted) this.init();

      // ### algorithm
      // check required features
      // if (false)
      //   show 'sorry' screen
      // else
      //   show 'welcome' screen
      //   execute start hook (promise)
      //   if (promise === true)
      //     show touch to start
      //     bind events
      //   if (promise === false)
      //     show 'sorry' screen

      // resolve required features from the application
      _client2.default.compatible = this._checkRequiredFeatures();

      if (!_client2.default.compatible) {
        this.view.content.isCompatible = false;
        this.show();
      } else {
        this.view.content.isCompatible = true;
        this.view.content.checking = true;
        this.show();

        // execute start hook
        var startHooks = this._getHooks('startHook');
        var startPromises = startHooks.map(function (hook) {
          return hook();
        });

        _promise2.default.all(startPromises).then(function (results) {
          // if one of the start hook failed
          var resolved = true;
          results.forEach(function (bool) {
            return resolved = resolved && bool;
          });

          _this2.view.content.resolvedHooks = resolved;
          _this2.view.content.checking = false;
          _this2.view.render();

          if (resolved) {
            _this2.view.installEvents({
              touchstart: _this2._onInteraction('touch'),
              mousedown: _this2._onInteraction('mouse')
            });
          }
        }).catch(function (err) {
          return console.error(err.stack);
        });
      }
    }

    /** @private */

  }, {
    key: 'stop',
    value: function stop() {
      this.hide();
      (0, _get3.default)(Platform.prototype.__proto__ || (0, _getPrototypeOf2.default)(Platform.prototype), 'stop', this).call(this);
    }

    /**
     * Add a new feature definition or override an existing one.
     *
     * @param {module:soundworks/client.Platform~definition} obj - Definition of
     *  the feature.
     */

  }, {
    key: 'addFeatureDefinition',
    value: function addFeatureDefinition(obj) {
      this._featureDefinitions[obj.id] = obj;
    }

    /**
     * Require features for the application.
     *
     * @param {...String} features - Id(s) of the feature(s) to be required.
     * @private
     */

  }, {
    key: 'requireFeature',
    value: function requireFeature() {
      var _this3 = this;

      for (var _len = arguments.length, features = Array(_len), _key = 0; _key < _len; _key++) {
        features[_key] = arguments[_key];
      }

      features.forEach(function (id) {
        return _this3._requiredFeatures.add(id);
      });
    }

    /**
     * Execute `interactions` hooks from the `platform` service.
     * Also activate the media according to the `options`.
     *
     * @private
     */

  }, {
    key: '_onInteraction',
    value: function _onInteraction(type) {
      var _this4 = this;

      return function (e) {
        e.preventDefault();
        e.stopPropagation();

        _client2.default.platform.interaction = type;
        // execute interaction hooks from the platform
        var interactionHooks = _this4._getHooks('interactionHook');
        var interactionPromises = interactionHooks.map(function (hook) {
          return hook();
        });

        _promise2.default.all(interactionPromises).then(function (results) {
          var resolved = true;
          results.forEach(function (bool) {
            return resolved = resolved && bool;
          });

          if (resolved) {
            _this4.ready();
          } else {
            _this4.view.content.resolvedHooks = resolved;
            _this4.view.render();
          }
        }).catch(function (err) {
          return console.error(err.stack);
        });
      };
    }

    /**
     * Execute all `check` functions defined in the required features.
     *
     * @return {Boolean} - `true` if all checks pass, `false` otherwise.
     * @private
     */

  }, {
    key: '_checkRequiredFeatures',
    value: function _checkRequiredFeatures() {
      var _this5 = this;

      var result = true;

      this._requiredFeatures.forEach(function (feature) {
        var checkFunction = _this5._featureDefinitions[feature].check;

        if (!(typeof checkFunction === 'function')) throw new Error('No check function defined for ' + feature + ' feature');

        result = result && checkFunction();
      });

      return result;
    }

    /** @private */

  }, {
    key: '_getHooks',
    value: function _getHooks(type) {
      var _this6 = this;

      var hooks = [];

      this._requiredFeatures.forEach(function (feature) {
        var hook = _this6._featureDefinitions[feature][type];

        if (hook) hooks.push(hook);
      });

      return hooks;
    }

    /**
     * Populate `client.platform` with the prefered audio file extention
     * for the platform.
     *
     * @private
     */

  }, {
    key: '_defineAudioFileExtention',
    value: function _defineAudioFileExtention() {
      var a = document.createElement('audio');
      // http://diveintohtml5.info/everything.html
      if (!!(a.canPlayType && a.canPlayType('audio/mpeg;'))) _client2.default.platform.audioFileExt = '.mp3';else if (!!(a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"'))) _client2.default.platform.audioFileExt = '.ogg';else _client2.default.platform.audioFileExt = '.wav';
    }

    /**
     * Populate `client.platform` with the os name.
     *
     * @private
     */

  }, {
    key: '_definePlatform',
    value: function _definePlatform() {
      var ua = window.navigator.userAgent;
      var md = new _mobileDetect2.default(ua);

      _client2.default.platform.isMobile = md.mobile() !== null; // true if phone or tablet
      _client2.default.platform.os = function () {
        var os = md.os();

        if (os === 'AndroidOS') return 'android';else if (os === 'iOS') return 'ios';else return 'other';
      }();
    }
  }]);
  return Platform;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, Platform);

exports.default = Platform;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXRmb3JtLmpzIl0sIm5hbWVzIjpbImRlZmF1bHREZWZpbml0aW9ucyIsImlkIiwiY2hlY2siLCJpbnRlcmFjdGlvbkhvb2siLCJwbGF0Zm9ybSIsImlzTW9iaWxlIiwicmVzb2x2ZSIsImciLCJjcmVhdGVHYWluIiwiY29ubmVjdCIsImRlc3RpbmF0aW9uIiwiZ2FpbiIsInZhbHVlIiwibyIsImNyZWF0ZU9zY2lsbGF0b3IiLCJmcmVxdWVuY3kiLCJzdGFydCIsIm9zIiwic3RvcCIsImN1cnJlbnRUaW1lIiwibmF2aWdhdG9yIiwiZ2V0VXNlck1lZGlhIiwid2Via2l0R2V0VXNlck1lZGlhIiwibW96R2V0VXNlck1lZGlhIiwibXNHZXRVc2VyTWVkaWEiLCJzdGFydEhvb2siLCJyZWplY3QiLCJhdWRpbyIsInN0cmVhbSIsImdldEF1ZGlvVHJhY2tzIiwiZXJyIiwiZW5hYmxlZCIsInJlcXVlc3QiLCJnZW9sb2NhdGlvbiIsImdldEN1cnJlbnRQb3NpdGlvbiIsInBvc2l0aW9uIiwiY29vcmRzIiwiY29vcmRpbmF0ZXMiLCJsYXRpdHVkZSIsImxvbmdpdHVkZSIsImdlb3Bvc2l0aW9uIiwibGF0IiwiTWF0aCIsInJhbmRvbSIsImxuZyIsInNldEludGVydmFsIiwid2luZG93IiwibG9jYXRpb24iLCJzZXRUaW1lb3V0IiwibWVkaWFzIiwid2VibSIsIm1wNCIsIiR2aWRlbyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInNldEF0dHJpYnV0ZSIsInR5cGUiLCJkYXRhVVJJIiwiJHNvdXJjZSIsInNyYyIsImFwcGVuZENoaWxkIiwicGxheSIsImRlZmF1bHRWaWV3VGVtcGxhdGUiLCJkZWZhdWx0Vmlld0NvbnRlbnQiLCJpc0NvbXBhdGlibGUiLCJyZXNvbHZlZEhvb2tzIiwiY2hlY2tpbmciLCJpbnRybyIsImluc3RydWN0aW9ucyIsImNoZWNraW5nTWVzc2FnZSIsImVycm9yQ29tcGF0aWJsZU1lc3NhZ2UiLCJlcnJvckhvb2tzTWVzc2FnZSIsIlNFUlZJQ0VfSUQiLCJQbGF0Zm9ybSIsImRlZmF1bHRzIiwic2hvd0RpYWxvZyIsInZpZXdDdG9yIiwidmlld1ByaW9yaXR5IiwiY29uZmlndXJlIiwiX2RlZmF1bHRWaWV3VGVtcGxhdGUiLCJfZGVmYXVsdFZpZXdDb250ZW50IiwiX3JlcXVpcmVkRmVhdHVyZXMiLCJfZmVhdHVyZURlZmluaXRpb25zIiwiZm9yRWFjaCIsImRlZiIsImFkZEZlYXR1cmVEZWZpbml0aW9uIiwib3B0aW9ucyIsImZlYXR1cmVzIiwicmVxdWlyZUZlYXR1cmUiLCJfZGVmaW5lQXVkaW9GaWxlRXh0ZW50aW9uIiwiX2RlZmluZVBsYXRmb3JtIiwidmlldyIsImNyZWF0ZVZpZXciLCJoYXNTdGFydGVkIiwiaW5pdCIsImNvbXBhdGlibGUiLCJfY2hlY2tSZXF1aXJlZEZlYXR1cmVzIiwiY29udGVudCIsInNob3ciLCJzdGFydEhvb2tzIiwiX2dldEhvb2tzIiwic3RhcnRQcm9taXNlcyIsIm1hcCIsImhvb2siLCJhbGwiLCJ0aGVuIiwicmVzdWx0cyIsInJlc29sdmVkIiwiYm9vbCIsInJlbmRlciIsImluc3RhbGxFdmVudHMiLCJ0b3VjaHN0YXJ0IiwiX29uSW50ZXJhY3Rpb24iLCJtb3VzZWRvd24iLCJjYXRjaCIsImNvbnNvbGUiLCJlcnJvciIsInN0YWNrIiwiaGlkZSIsIm9iaiIsImFkZCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImludGVyYWN0aW9uIiwiaW50ZXJhY3Rpb25Ib29rcyIsImludGVyYWN0aW9uUHJvbWlzZXMiLCJyZWFkeSIsInJlc3VsdCIsImZlYXR1cmUiLCJjaGVja0Z1bmN0aW9uIiwiRXJyb3IiLCJob29rcyIsInB1c2giLCJhIiwiY2FuUGxheVR5cGUiLCJhdWRpb0ZpbGVFeHQiLCJ1YSIsInVzZXJBZ2VudCIsIm1kIiwibW9iaWxlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFB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QUFPeEksUUFBUCxDQUFnQmEsRUFBaEIsR0FBc0IsWUFBVztBQUMvQixZQUFNQSxLQUFLMEgsR0FBRzFILEVBQUgsRUFBWDs7QUFFQSxZQUFJQSxPQUFPLFdBQVgsRUFDRSxPQUFPLFNBQVAsQ0FERixLQUVLLElBQUlBLE9BQU8sS0FBWCxFQUNILE9BQU8sS0FBUCxDQURHLEtBR0gsT0FBTyxPQUFQO0FBQ0gsT0FUb0IsRUFBckI7QUFVRDs7Ozs7QUFHSCx5QkFBZTRILFFBQWYsQ0FBd0JyRSxVQUF4QixFQUFvQ0MsUUFBcEM7O2tCQUVlQSxRIiwiZmlsZSI6IlBsYXRmb3JtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYXVkaW9Db250ZXh0IH0gZnJvbSAnd2F2ZXMtYXVkaW8nO1xuaW1wb3J0IGNsaWVudCBmcm9tICcuLi9jb3JlL2NsaWVudCc7XG5pbXBvcnQgTW9iaWxlRGV0ZWN0IGZyb20gJ21vYmlsZS1kZXRlY3QnO1xuaW1wb3J0IHNjcmVlbmZ1bGwgZnJvbSAnc2NyZWVuZnVsbCc7XG5pbXBvcnQgU2VnbWVudGVkVmlldyBmcm9tICcuLi92aWV3cy9TZWdtZW50ZWRWaWV3JztcbmltcG9ydCBTZXJ2aWNlIGZyb20gJy4uL2NvcmUvU2VydmljZSc7XG5pbXBvcnQgc2VydmljZU1hbmFnZXIgZnJvbSAnLi4vY29yZS9zZXJ2aWNlTWFuYWdlcic7XG5cbi8qKlxuICogRGVmaW5pdGlvbiBvZiBhIGZlYXR1cmUgdG8gdGVzdC5cbiAqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuUGxhdGZvcm1+ZGVmaW5pdGlvblxuICogQHByb3BlcnR5IHtTdHJpbmd9IGlkIC0gSWQgb2YgdGhlIGRlZmluaXRpb24uXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBjaGVjayAtIEEgZnVuY3Rpb24gdGhhdCBzaG91bGQgcmV0dXJuIGB0cnVlYCBpZiB0aGVcbiAqICBmZWF0dXJlIGlzIGF2YWlsYWJsZSBvbiB0aGUgcGxhdGZvcm0sIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gW3N0YXJ0SG9va10gLSBBIGZ1bmN0aW9uIHJldHVybmluZyBhIGBQcm9taXNlYCB0byBiZVxuICogIGV4ZWN1dGVkIG9uIHN0YXJ0IChmb3IgZXhhbXBsZSB0byBhc2sgYWNjZXNzIHRvIG1pY3JvcGhvbmUgb3IgZ2VvbG9jYXRpb24pLlxuICogIFRoZSByZXR1cm5lZCBwcm9taXNlIHNob3VsZCBiZSByZXNvbHZlZCBvbiBgdHJ1ZWAgaXMgdGhlIHByb2Nlc3Mgc3VjY2VkZWQgb3JcbiAqICBgZmFsc2VgIGlzIHRoZSBwcmVjZXNzIGZhaWxlZCAoZS5nLiBwZXJtaXNzaW9uIG5vdCBncmFudGVkKS5cbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IFtpbnRlcmFjdGlvbkhvb2tdIC0gQSBmdW5jdGlvbiByZXR1cm5pbmcgYSBQcm9taXNldG8gYmVcbiAqICBleGVjdXRlZCBvbiB0aGUgZmlyc3QgaW50ZXJhY3Rpb24gKGkuZS4gYGNsaWNrYCBvciBgdG91Y2hzdGFydGApIG9mIHRoZSB1c2VyXG4gKiAgd2l0aCBhcHBsaWNhdGlvbiAoZm9yIGV4YW1wbGUsIHRvIGluaXRpYWxpemUgQXVkaW9Db250ZXh0IG9uIGlPUyBkZXZpY2VzKS5cbiAqICBUaGUgcmV0dXJuZWQgcHJvbWlzZSBzaG91bGQgYmUgcmVzb2x2ZWQgb24gYHRydWVgIGlzIHRoZSBwcm9jZXNzIHN1Y2NlZGVkIG9yXG4gKiAgYGZhbHNlYCBpcyB0aGUgcHJlY2VzcyBmYWlsZWQgKGUuZy4gcGVybWlzc2lvbiBub3QgZ3JhbnRlZCkuXG4gKi9cbmNvbnN0IGRlZmF1bHREZWZpbml0aW9ucyA9IFtcbiAge1xuICAgIGlkOiAnd2ViLWF1ZGlvJyxcbiAgICBjaGVjazogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gISFhdWRpb0NvbnRleHQ7XG4gICAgfSxcbiAgICBpbnRlcmFjdGlvbkhvb2s6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFjbGllbnQucGxhdGZvcm0uaXNNb2JpbGUpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cbiAgICAgIGNvbnN0IGcgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgZy5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICBnLmdhaW4udmFsdWUgPSAwLjAwMDAwMDAwMTsgLy8gLTE4MGRCID9cblxuICAgICAgY29uc3QgbyA9IGF1ZGlvQ29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgICBvLmNvbm5lY3QoZyk7XG4gICAgICBvLmZyZXF1ZW5jeS52YWx1ZSA9IDIwO1xuICAgICAgby5zdGFydCgwKTtcblxuICAgICAgLy8gcHJldmVudCBhbmRyb2lkIHRvIHN0b3AgYXVkaW8gYnkga2VlcGluZyB0aGUgb3NjaWxsYXRvciBhY3RpdmVcbiAgICAgIGlmIChjbGllbnQucGxhdGZvcm0ub3MgIT09ICdhbmRyb2lkJylcbiAgICAgICAgby5zdG9wKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuICAgIH1cbiAgfSxcbiAge1xuICAgIC8vIEBub3RlOiBgdG91Y2hgIGZlYXR1cmUgd29ya2Fyb3VuZFxuICAgIC8vIGNmLiBodHRwOi8vd3d3LnN0dWNveC5jb20vYmxvZy95b3UtY2FudC1kZXRlY3QtYS10b3VjaHNjcmVlbi9cbiAgICBpZDogJ21vYmlsZS1kZXZpY2UnLFxuICAgIGNoZWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjbGllbnQucGxhdGZvcm0uaXNNb2JpbGU7XG4gICAgfVxuICB9LFxuICB7XG4gICAgaWQ6ICdhdWRpby1pbnB1dCcsXG4gICAgY2hlY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IChcbiAgICAgICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSB8fFxuICAgICAgICBuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhIHx8XG4gICAgICAgIG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEgfHxcbiAgICAgICAgbmF2aWdhdG9yLm1zR2V0VXNlck1lZGlhXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gISFuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhO1xuICAgIH0sXG4gICAgc3RhcnRIb29rOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSh7IGF1ZGlvOiB0cnVlIH0sIGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgICAgIHN0cmVhbS5nZXRBdWRpb1RyYWNrcygpWzBdLnN0b3AoKTtcbiAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAge1xuICAgIGlkOiAnZnVsbC1zY3JlZW4nLFxuICAgIGNoZWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGZ1bmN0aW9ubmFsaXR5IHRoYXQgY2Fubm90IGJyYWtlIHRoZSBhcHBsaWNhdGlvblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBpbnRlcmFjdGlvbkhvb2soKSB7XG4gICAgICBpZiAoc2NyZWVuZnVsbC5lbmFibGVkKVxuICAgICAgICBzY3JlZW5mdWxsLnJlcXVlc3QoKTtcblxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcbiAgICB9XG4gIH0sXG4gIHtcbiAgICBpZDogJ2dlb2xvY2F0aW9uJyxcbiAgICBjaGVjazogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gISFuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uO1xuICAgIH0sXG4gICAgc3RhcnRIb29rOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbigocG9zaXRpb24pID0+IHtcbiAgICAgICAgICAvLyBwb3B1bGF0ZSBjbGllbnQgd2l0aCBmaXJzdCB2YWx1ZVxuICAgICAgICAgIGNvbnN0IGNvb3JkcyA9IHBvc2l0aW9uLmNvb3JkcztcbiAgICAgICAgICBjbGllbnQuY29vcmRpbmF0ZXMgPSBbY29vcmRzLmxhdGl0dWRlLCBjb29yZHMubG9uZ2l0dWRlXTtcbiAgICAgICAgICBjbGllbnQuZ2VvcG9zaXRpb24gPSBwb3NpdGlvbjtcblxuICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0sIHt9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAge1xuICAgIGlkOiAnZ2VvbG9jYXRpb24tbW9jaycsXG4gICAgY2hlY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBzdGFydEhvb2s6IGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbGF0ID0gTWF0aC5yYW5kb20oKSAqIDM2MCAtIDE4MDtcbiAgICAgIGNvbnN0IGxuZyA9IE1hdGgucmFuZG9tKCkgKiAxODAgLSA5MDtcbiAgICAgIGNsaWVudC5jb29yZGluYXRlcyA9IFtsYXQsIGxuZ107XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuICAgIH1cbiAgfSxcbiAge1xuICAgIC8vIGFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vcmljaHRyL05vU2xlZXAuanMvYmxvYi9tYXN0ZXIvTm9TbGVlcC5qc1xuICAgIC8vIHdhcm5pbmc6IGNhdXNlIDE1MCUgY3B1IHVzZSBpbiBjaHJvbWUgZGVza3RvcC4uLlxuICAgIGlkOiAnd2FrZS1sb2NrJyxcbiAgICBjaGVjazogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBmdW5jdGlvbm5hbGl0eSB0aGF0IGNhbm5vdCBicmFrZSB0aGUgYXBwbGljYXRpb25cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgaW50ZXJhY3Rpb25Ib29rOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChjbGllbnQucGxhdGZvcm0ub3MgPT09ICdpb3MnKSB7XG4gICAgICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSB3aW5kb3cubG9jYXRpb247XG4gICAgICAgICAgc2V0VGltZW91dCh3aW5kb3cuc3RvcCwgMCk7XG4gICAgICAgIH0sIDMwMDAwKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG1lZGlhcyA9IHtcbiAgICAgICAgICB3ZWJtOiBcImRhdGE6dmlkZW8vd2VibTtiYXNlNjQsR2tYZm8wQWdRb2FCQVVMM2dRRkM4b0VFUXZPQkNFS0NRQVIzWldKdFFvZUJBa0tGZ1FJWVU0Qm5RSTBWU2FsbVFDZ3ExN0ZBQXc5Q1FFMkFRQVozYUdGdGJYbFhRVUFHZDJoaGJXMTVSSWxBQ0VDUFFBQUFBQUFBRmxTdWEwQXhya0F1MTRFQlk4V0JBWnlCQUNLMW5FQURkVzVraGtBRlZsOVdVRGdsaG9oQUExWlFPSU9CQWVCQUJyQ0JDTHFCQ0I5RHRuVkFJdWVCQUtOQUhJRUFBSUF3QVFDZEFTb0lBQWdBQVVBbUphUUFBM0FBL3Z6MEFBQT1cIixcbiAgICAgICAgICBtcDQ6IFwiZGF0YTp2aWRlby9tcDQ7YmFzZTY0LEFBQUFIR1owZVhCcGMyOXRBQUFDQUdsemIyMXBjMjh5YlhBME1RQUFBQWhtY21WbEFBQUFHMjFrWVhRQUFBR3pBQkFIQUFBQnRoQURBb3dkYmI5L0FBQUM2VzF2YjNZQUFBQnNiWFpvWkFBQUFBQjhKYkNBZkNXd2dBQUFBK2dBQUFBQUFBRUFBQUVBQUFBQUFBQUFBQUFBQUFBQkFBQUFBQUFBQUFBQUFBQUFBQUFBQVFBQUFBQUFBQUFBQUFBQUFBQUFRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFJQUFBSVZkSEpoYXdBQUFGeDBhMmhrQUFBQUQzd2xzSUI4SmJDQUFBQUFBUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJBQUFBQUFBQUFBQUFBQUFBQUFBQUFRQUFBQUFBQUFBQUFBQUFBQUFBUUFBQUFBQUlBQUFBQ0FBQUFBQUJzVzFrYVdFQUFBQWdiV1JvWkFBQUFBQjhKYkNBZkNXd2dBQUFBK2dBQUFBQVZjUUFBQUFBQUMxb1pHeHlBQUFBQUFBQUFBQjJhV1JsQUFBQUFBQUFBQUFBQUFBQVZtbGtaVzlJWVc1a2JHVnlBQUFBQVZ4dGFXNW1BQUFBRkhadGFHUUFBQUFCQUFBQUFBQUFBQUFBQUFBa1pHbHVaZ0FBQUJ4a2NtVm1BQUFBQUFBQUFBRUFBQUFNZFhKc0lBQUFBQUVBQUFFY2MzUmliQUFBQUxoemRITmtBQUFBQUFBQUFBRUFBQUNvYlhBMGRnQUFBQUFBQUFBQkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBSUFBZ0FTQUFBQUVnQUFBQUFBQUFBQVFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQmovL3dBQUFGSmxjMlJ6QUFBQUFBTkVBQUVBQkR3Z0VRQUFBQUFERFVBQUFBQUFCUzBBQUFHd0FRQUFBYldKRXdBQUFRQUFBQUVnQU1TTmlCOUZBRVFCRkdNQUFBR3lUR0YyWXpVeUxqZzNMalFHQVFJQUFBQVljM1IwY3dBQUFBQUFBQUFCQUFBQUFRQUFBQUFBQUFBY2MzUnpZd0FBQUFBQUFBQUJBQUFBQVFBQUFBRUFBQUFCQUFBQUZITjBjM29BQUFBQUFBQUFFd0FBQUFFQUFBQVVjM1JqYndBQUFBQUFBQUFCQUFBQUxBQUFBR0IxWkhSaEFBQUFXRzFsZEdFQUFBQUFBQUFBSVdoa2JISUFBQUFBQUFBQUFHMWthWEpoY0hCc0FBQUFBQUFBQUFBQUFBQUFLMmxzYzNRQUFBQWpxWFJ2YndBQUFCdGtZWFJoQUFBQUFRQUFBQUJNWVhabU5USXVOemd1TXc9PVwiXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgJHZpZGVvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndmlkZW8nKTtcbiAgICAgICAgJHZpZGVvLnNldEF0dHJpYnV0ZSgnbG9vcCcsICcnKTtcblxuICAgICAgICBmb3IgKGxldCB0eXBlIGluIG1lZGlhcykge1xuICAgICAgICAgIGNvbnN0IGRhdGFVUkkgPSBtZWRpYXNbdHlwZV07XG4gICAgICAgICAgY29uc3QgJHNvdXJjZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NvdXJjZScpO1xuICAgICAgICAgICRzb3VyY2Uuc3JjID0gZGF0YVVSSTtcbiAgICAgICAgICAkc291cmNlLnR5cGUgPSBgdmlkZW8vJHt0eXBlfWA7XG5cbiAgICAgICAgICAkdmlkZW8uYXBwZW5kQ2hpbGQoJHNvdXJjZSk7XG4gICAgICAgIH1cblxuICAgICAgICAkdmlkZW8ucGxheSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuICAgIH1cbiAgfVxuXTtcblxuXG5jb25zdCBkZWZhdWx0Vmlld1RlbXBsYXRlID0gYFxuPCUgaWYgKGlzQ29tcGF0aWJsZSA9PT0gZmFsc2UpIHsgJT5cbiAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wXCI+PC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlciBmbGV4LWNlbnRlclwiPlxuICAgIDxwPjwlPSBlcnJvckNvbXBhdGlibGVNZXNzYWdlICU+PC9wPlxuICA8L2Rpdj5cbiAgPGRpdiBjbGFzcz1cInNlY3Rpb24tYm90dG9tXCI+PC9kaXY+XG48JSB9IGVsc2UgaWYgKHJlc29sdmVkSG9va3MgPT09IGZhbHNlKSB7ICU+XG4gIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcFwiPjwvZGl2PlxuICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj5cbiAgICA8cD48JT0gZXJyb3JIb29rc01lc3NhZ2UgJT48L3A+XG4gIDwvZGl2PlxuICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1ib3R0b21cIj48L2Rpdj5cbjwlIH0gZWxzZSB7ICU+XG4gIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcCBmbGV4LW1pZGRsZVwiPjwvZGl2PlxuICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj5cbiAgICAgIDxwIGNsYXNzPVwiYmlnXCI+XG4gICAgICAgIDwlPSBpbnRybyAlPlxuICAgICAgICA8YnIgLz5cbiAgICAgICAgPGI+PCU9IGdsb2JhbHMuYXBwTmFtZSAlPjwvYj5cbiAgICAgIDwvcD5cbiAgPC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbSBmbGV4LW1pZGRsZVwiPlxuICAgIDwlIGlmIChjaGVja2luZyA9PT0gdHJ1ZSkgeyAlPlxuICAgIDxwIGNsYXNzPVwic21hbGwgc29mdC1ibGlua1wiPjwlPSBjaGVja2luZ01lc3NhZ2UgJT48L3A+XG4gICAgPCUgfSBlbHNlIGlmIChyZXNvbHZlZEhvb2tzID09PSB0cnVlKSB7ICU+XG4gICAgPHAgY2xhc3M9XCJzbWFsbCBzb2Z0LWJsaW5rXCI+PCU9IGluc3RydWN0aW9ucyAlPjwvcD5cbiAgICA8JSB9ICU+XG4gIDwvZGl2PlxuPCUgfSAlPmA7XG5cbmNvbnN0IGRlZmF1bHRWaWV3Q29udGVudCA9IHtcbiAgaXNDb21wYXRpYmxlOiBudWxsLFxuICByZXNvbHZlZEhvb2tzOiBudWxsLFxuICBjaGVja2luZzogZmFsc2UsXG4gIGludHJvOiAnV2VsY29tZSB0bycsXG4gIGluc3RydWN0aW9uczogJ1RvdWNoIHRoZSBzY3JlZW4gdG8gam9pbiEnLFxuICBjaGVja2luZ01lc3NhZ2U6ICdQbGVhc2Ugd2FpdCB3aGlsZSBjaGVja2luZyBjb21wYXRpYmxpdHknLFxuICBlcnJvckNvbXBhdGlibGVNZXNzYWdlOiAnU29ycnksPGJyIC8+WW91ciBkZXZpY2UgaXMgbm90IGNvbXBhdGlibGUgd2l0aCB0aGUgYXBwbGljYXRpb24uJyxcbiAgZXJyb3JIb29rc01lc3NhZ2U6IGBTb3JyeSw8YnIgLz5UaGUgYXBwbGljYXRpb24gZGlkbid0IG9idGFpbiB0aGUgbmVjZXNzYXJ5IGF1dGhvcml6YXRpb25zLmAsXG59O1xuXG5jb25zdCBTRVJWSUNFX0lEID0gJ3NlcnZpY2U6cGxhdGZvcm0nO1xuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIGNsaWVudCBgJ3BsYXRmb3JtJ2Agc2VydmljZS5cbiAqXG4gKiBUaGUgYHBsYXRmb3JtYCBzZXJ2aWNlcyBpcyByZXNwb25zaWJsZSBmb3IgZ2l2aW5nIGdlbmVyYWwgaW5mb3JtYXRpb25zXG4gKiBhYm91dCB0aGUgdXNlcidzIGRldmljZSBhcyB3ZWxsIGFzIGNoZWNraW5nIGF2YWlsYWJpbGl0eSBhbmQgcHJvdmlkaW5nIGhvb2tzXG4gKiBpbiBvcmRlciB0byBpbml0aWFsaXplIHRoZSBmZWF0dXJlcyByZXF1aXJlZCBieSB0aGUgYXBwbGljYXRpb24gKGF1ZGlvLFxuICogbWljcm9waG9uZSwgZXRjLikuXG4gKiBJZiBvbmUgb2YgdGhlIHJlcXVpcmVkIGRlZmluaXRpb25zIGlzIG5vdCBhdmFpbGFibGUsIGEgdmlldyBpcyBjcmVhdGVkIHdpdGhcbiAqIGFuIGVycm9yIG1lc3NhZ2UgYW5kIGBjbGllbnQuY29tcGF0aWJsZWAgaXMgc2V0IHRvIGBmYWxzZWAuXG4gKlxuICogQXZhaWxhYmxlIGJ1aWx0LWluIGRlZmluaXRpb25zIGFyZTpcbiAqIC0gJ3dlYi1hdWRpbydcbiAqIC0gJ21vYmlsZS1kZXZpY2UnOiBvbmx5LWFjY2VwdCBtb2JpbGUgZGV2aWNlcyBpbiB0aGUgYXBwbGljYXRpb24gKGJhc2VkIG9uXG4gKiAgIFVzZXItQWdlbnQgc25pZmZpbmcpXG4gKiAtICdhdWRpby1pbnB1dCc6IEFuZHJvaWQgT25seVxuICogLSAnZnVsbC1zY3JlZW4nOiBBbmRyb2lkIE9ubHksIHRoaXMgZmVhdHVyZSB3b24ndCBibG9jayB0aGUgYXBwbGljYXRpb24gaWZcbiAqICAgbm90IGF2YWlsYWJsZS5cbiAqIC0gJ2dlb2xvY2F0aW9uJzogY2hlY2sgaWYgdGhlIG5hdmlnYXRvciBzdXBwb3J0cyBnZW9sb2NhdGlvbi4gVGhlIGBjb29yZGluYXRlc2BcbiAqICAgYW5kIGBnZW9wb3NpdGlvbmAgb2YgdGhlIGBjbGllbnRgIGFyZSBwb3B1bGF0ZWQgd2hlbiB0aGUgcGxhZm9ybSBzZXJ2aWNlXG4gKiAgIHJlc29sdmVzLiAoaWYgbm8gdXBkYXRlIG9mIHRoZSBjb29yZGluYXRlcyBhcmUgbmVlZGVkIGluIHRoZSBhcHBsaWNhdGlvbixcbiAqICAgcmVxdWlyaW5nIGdlb2xvY2F0aW9uIGZlYXR1cmUgd2l0aG91dCB1c2luZyB0aGUgR2VvbG9jYXRpb24gc2VydmljZSBzaG91bGRcbiAqICAgc3VmZmljZSkuXG4gKiAtICd3YWtlLWxvY2snOiBkZXByZWNhdGVkLCB1c2Ugd2l0aCBjYXV0aW9uLCBoYXMgYmVlbiBvYnNlcnZlZCBjb25zdW1taW5nXG4gKiAgIDE1MCUgY3B1IGluIGNocm9tZSBkZXNrdG9wLlxuICpcbiAqIF88c3BhbiBjbGFzcz1cIndhcm5pbmdcIj5fX1dBUk5JTkdfXzwvc3Bhbj4gVGhpcyBjbGFzcyBzaG91bGQgbmV2ZXIgYmVcbiAqIGluc3RhbmNpYXRlZCBtYW51YWxseV9cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtBcnJheTxTdHJpbmc+fFN0cmluZ30gb3B0aW9ucy5mZWF0dXJlcyAtIElkKHMpIG9mIHRoZSBmZWF0dXJlKHMpXG4gKiAgcmVxdWlyZWQgYnkgdGhlIGFwcGxpY2F0aW9uLiBBdmFpbGFibGUgYnVpbGQtaW4gZmVhdHVyZXMgYXJlOlxuICogIC0gJ3dlYi1hdWRpbydcbiAqICAtICdtb2JpbGUtZGV2aWNlJzogb25seSBhY2NlcHQgbW9iaWxlIGRldmljZXMgKHJlY29nbml0aW9uIGJhc2VkIFVzZXItQWdlbnQpXG4gKiAgLSAnYXVkaW8taW5wdXQnOiBBbmRyb2lkIG9ubHlcbiAqICAtICdmdWxsLXNjcmVlbic6IEFuZHJvaWQgb25seVxuICogIC0gJ3dha2UtbG9jayc6IGRlcHJlY2F0ZWQsIHRoaXMgZmVhdHVyZSBzaG91bGQgYmUgdXNlZCB3aXRoIGNhdXRpb24gYXNcbiAqICAgIGl0IGhhcyBiZWVuIG9ic2VydmVkIHRvIHVzZSAxNTAlIG9mIGNwdSBpbiBjaHJvbWUgZGVza3RvcC5cbiAqXG4gKiA8IS0tXG4gKiBXYXJuaW5nOiB3aGVuIHNldHRpbmcgYHNob3dEaWFsb2dgIG9wdGlvbiB0byBgZmFsc2VgLCB1bmV4cGVjdGVkIGJlaGF2aW9yc1xuICogbWlnaHQgb2NjdXIgYmVjYXVzZSBtb3N0IG9mIHRoZSBmZWF0dXJlcyByZXF1aXJlIGFuIGludGVyYWN0aW9uIG9yIGFcbiAqIGNvbmZpcm1hdGlvbiBmcm9tIHRoZSB1c2VyIGluIG9yZGVyIHRvIGJlIGluaXRpYWxpemVkIGNvcnJlY3RseS5cbiAqIC0tPlxuICpcbiAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnRcbiAqIEBleGFtcGxlXG4gKiAvLyBpbnNpZGUgdGhlIGV4cGVyaWVuY2UgY29uc3RydWN0b3JcbiAqIHRoaXMucGxhdGZvcm0gPSB0aGlzLnJlcXVpcmUoJ3BsYXRmb3JtJywgeyBmZWF0dXJlczogJ3dlYi1hdWRpbycgfSk7XG4gKlxuICogQHNlZSB7QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LmNsaWVudCNwbGF0Zm9ybX1cbiAqL1xuY2xhc3MgUGxhdGZvcm0gZXh0ZW5kcyBTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoU0VSVklDRV9JRCwgZmFsc2UpO1xuXG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgICBzaG93RGlhbG9nOiB0cnVlLFxuICAgICAgdmlld0N0b3I6IFNlZ21lbnRlZFZpZXcsXG4gICAgICB2aWV3UHJpb3JpdHk6IDEwLFxuICAgIH07XG5cbiAgICB0aGlzLmNvbmZpZ3VyZShkZWZhdWx0cyk7XG5cbiAgICB0aGlzLl9kZWZhdWx0Vmlld1RlbXBsYXRlID0gZGVmYXVsdFZpZXdUZW1wbGF0ZTtcbiAgICB0aGlzLl9kZWZhdWx0Vmlld0NvbnRlbnQgPSBkZWZhdWx0Vmlld0NvbnRlbnQ7XG5cbiAgICB0aGlzLl9yZXF1aXJlZEZlYXR1cmVzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX2ZlYXR1cmVEZWZpbml0aW9ucyA9IHt9O1xuXG4gICAgZGVmYXVsdERlZmluaXRpb25zLmZvckVhY2goKGRlZikgPT4gdGhpcy5hZGRGZWF0dXJlRGVmaW5pdGlvbihkZWYpKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBjb25maWd1cmUob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLmZlYXR1cmVzKSB7XG4gICAgICBsZXQgZmVhdHVyZXMgPSBvcHRpb25zLmZlYXR1cmVzO1xuXG4gICAgICBpZiAodHlwZW9mIGZlYXR1cmVzID09PSAnc3RyaW5nJylcbiAgICAgICAgZmVhdHVyZXMgPSBbZmVhdHVyZXNdO1xuXG4gICAgICB0aGlzLnJlcXVpcmVGZWF0dXJlKC4uLmZlYXR1cmVzKTtcbiAgICAgIGRlbGV0ZSBvcHRpb25zLmZlYXR1cmVzO1xuICAgIH1cblxuICAgIHN1cGVyLmNvbmZpZ3VyZShvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBpbml0KCkge1xuICAgIHRoaXMuX2RlZmluZUF1ZGlvRmlsZUV4dGVudGlvbigpO1xuICAgIHRoaXMuX2RlZmluZVBsYXRmb3JtKCk7XG5cbiAgICB0aGlzLnZpZXdDdG9yID0gdGhpcy5vcHRpb25zLnZpZXdDdG9yO1xuICAgIHRoaXMudmlldyA9IHRoaXMuY3JlYXRlVmlldygpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHN0YXJ0KCkge1xuICAgIHN1cGVyLnN0YXJ0KCk7XG5cbiAgICBpZiAoIXRoaXMuaGFzU3RhcnRlZClcbiAgICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgLy8gIyMjIGFsZ29yaXRobVxuICAgIC8vIGNoZWNrIHJlcXVpcmVkIGZlYXR1cmVzXG4gICAgLy8gaWYgKGZhbHNlKVxuICAgIC8vICAgc2hvdyAnc29ycnknIHNjcmVlblxuICAgIC8vIGVsc2VcbiAgICAvLyAgIHNob3cgJ3dlbGNvbWUnIHNjcmVlblxuICAgIC8vICAgZXhlY3V0ZSBzdGFydCBob29rIChwcm9taXNlKVxuICAgIC8vICAgaWYgKHByb21pc2UgPT09IHRydWUpXG4gICAgLy8gICAgIHNob3cgdG91Y2ggdG8gc3RhcnRcbiAgICAvLyAgICAgYmluZCBldmVudHNcbiAgICAvLyAgIGlmIChwcm9taXNlID09PSBmYWxzZSlcbiAgICAvLyAgICAgc2hvdyAnc29ycnknIHNjcmVlblxuXG4gICAgLy8gcmVzb2x2ZSByZXF1aXJlZCBmZWF0dXJlcyBmcm9tIHRoZSBhcHBsaWNhdGlvblxuICAgIGNsaWVudC5jb21wYXRpYmxlID0gdGhpcy5fY2hlY2tSZXF1aXJlZEZlYXR1cmVzKCk7XG5cbiAgICBpZiAoIWNsaWVudC5jb21wYXRpYmxlKSB7XG4gICAgICB0aGlzLnZpZXcuY29udGVudC5pc0NvbXBhdGlibGUgPSBmYWxzZTtcbiAgICAgIHRoaXMuc2hvdygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnZpZXcuY29udGVudC5pc0NvbXBhdGlibGUgPSB0cnVlO1xuICAgICAgdGhpcy52aWV3LmNvbnRlbnQuY2hlY2tpbmcgPSB0cnVlO1xuICAgICAgdGhpcy5zaG93KCk7XG5cbiAgICAgIC8vIGV4ZWN1dGUgc3RhcnQgaG9va1xuICAgICAgY29uc3Qgc3RhcnRIb29rcyA9IHRoaXMuX2dldEhvb2tzKCdzdGFydEhvb2snKTtcbiAgICAgIGNvbnN0IHN0YXJ0UHJvbWlzZXMgPSBzdGFydEhvb2tzLm1hcChob29rID0+IGhvb2soKSk7XG5cbiAgICAgIFByb21pc2UuYWxsKHN0YXJ0UHJvbWlzZXMpLnRoZW4oKHJlc3VsdHMpID0+IHtcbiAgICAgICAgLy8gaWYgb25lIG9mIHRoZSBzdGFydCBob29rIGZhaWxlZFxuICAgICAgICBsZXQgcmVzb2x2ZWQgPSB0cnVlO1xuICAgICAgICByZXN1bHRzLmZvckVhY2goKGJvb2wpID0+IHJlc29sdmVkID0gcmVzb2x2ZWQgJiYgYm9vbCk7XG5cbiAgICAgICAgdGhpcy52aWV3LmNvbnRlbnQucmVzb2x2ZWRIb29rcyA9IHJlc29sdmVkO1xuICAgICAgICB0aGlzLnZpZXcuY29udGVudC5jaGVja2luZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnZpZXcucmVuZGVyKCk7XG5cbiAgICAgICAgaWYgKHJlc29sdmVkKSB7XG4gICAgICAgICAgdGhpcy52aWV3Lmluc3RhbGxFdmVudHMoe1xuICAgICAgICAgICAgdG91Y2hzdGFydDogdGhpcy5fb25JbnRlcmFjdGlvbigndG91Y2gnKSxcbiAgICAgICAgICAgIG1vdXNlZG93bjogdGhpcy5fb25JbnRlcmFjdGlvbignbW91c2UnKSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSkuY2F0Y2goKGVycikgPT4gY29uc29sZS5lcnJvcihlcnIuc3RhY2spKTtcbiAgICB9XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgc3RvcCgpIHtcbiAgICB0aGlzLmhpZGUoKTtcbiAgICBzdXBlci5zdG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgbmV3IGZlYXR1cmUgZGVmaW5pdGlvbiBvciBvdmVycmlkZSBhbiBleGlzdGluZyBvbmUuXG4gICAqXG4gICAqIEBwYXJhbSB7bW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlBsYXRmb3JtfmRlZmluaXRpb259IG9iaiAtIERlZmluaXRpb24gb2ZcbiAgICogIHRoZSBmZWF0dXJlLlxuICAgKi9cbiAgYWRkRmVhdHVyZURlZmluaXRpb24ob2JqKSB7XG4gICAgdGhpcy5fZmVhdHVyZURlZmluaXRpb25zW29iai5pZF0gPSBvYmo7XG4gIH1cblxuICAvKipcbiAgICogUmVxdWlyZSBmZWF0dXJlcyBmb3IgdGhlIGFwcGxpY2F0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gey4uLlN0cmluZ30gZmVhdHVyZXMgLSBJZChzKSBvZiB0aGUgZmVhdHVyZShzKSB0byBiZSByZXF1aXJlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJlcXVpcmVGZWF0dXJlKC4uLmZlYXR1cmVzKSB7XG4gICAgZmVhdHVyZXMuZm9yRWFjaCgoaWQpID0+IHRoaXMuX3JlcXVpcmVkRmVhdHVyZXMuYWRkKGlkKSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIGBpbnRlcmFjdGlvbnNgIGhvb2tzIGZyb20gdGhlIGBwbGF0Zm9ybWAgc2VydmljZS5cbiAgICogQWxzbyBhY3RpdmF0ZSB0aGUgbWVkaWEgYWNjb3JkaW5nIHRvIHRoZSBgb3B0aW9uc2AuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfb25JbnRlcmFjdGlvbih0eXBlKSB7XG4gICAgcmV0dXJuIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICBjbGllbnQucGxhdGZvcm0uaW50ZXJhY3Rpb24gPSB0eXBlO1xuICAgICAgLy8gZXhlY3V0ZSBpbnRlcmFjdGlvbiBob29rcyBmcm9tIHRoZSBwbGF0Zm9ybVxuICAgICAgY29uc3QgaW50ZXJhY3Rpb25Ib29rcyA9IHRoaXMuX2dldEhvb2tzKCdpbnRlcmFjdGlvbkhvb2snKTtcbiAgICAgIGNvbnN0IGludGVyYWN0aW9uUHJvbWlzZXMgPSBpbnRlcmFjdGlvbkhvb2tzLm1hcCgoaG9vaykgPT4gaG9vaygpKTtcblxuICAgICAgUHJvbWlzZS5hbGwoaW50ZXJhY3Rpb25Qcm9taXNlcykudGhlbigocmVzdWx0cykgPT4ge1xuICAgICAgICBsZXQgcmVzb2x2ZWQgPSB0cnVlO1xuICAgICAgICByZXN1bHRzLmZvckVhY2goKGJvb2wpID0+IHJlc29sdmVkID0gcmVzb2x2ZWQgJiYgYm9vbCk7XG5cbiAgICAgICAgaWYgKHJlc29sdmVkKSB7XG4gICAgICAgICAgdGhpcy5yZWFkeSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMudmlldy5jb250ZW50LnJlc29sdmVkSG9va3MgPSByZXNvbHZlZDtcbiAgICAgICAgICB0aGlzLnZpZXcucmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICAgIH0pLmNhdGNoKChlcnIpID0+IGNvbnNvbGUuZXJyb3IoZXJyLnN0YWNrKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGUgYWxsIGBjaGVja2AgZnVuY3Rpb25zIGRlZmluZWQgaW4gdGhlIHJlcXVpcmVkIGZlYXR1cmVzLlxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufSAtIGB0cnVlYCBpZiBhbGwgY2hlY2tzIHBhc3MsIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2NoZWNrUmVxdWlyZWRGZWF0dXJlcygpIHtcbiAgICBsZXQgcmVzdWx0ID0gdHJ1ZTtcblxuICAgIHRoaXMuX3JlcXVpcmVkRmVhdHVyZXMuZm9yRWFjaCgoZmVhdHVyZSkgPT4ge1xuICAgICAgY29uc3QgY2hlY2tGdW5jdGlvbiA9IHRoaXMuX2ZlYXR1cmVEZWZpbml0aW9uc1tmZWF0dXJlXS5jaGVjaztcblxuICAgICAgaWYgKCEodHlwZW9mIGNoZWNrRnVuY3Rpb24gPT09ICdmdW5jdGlvbicpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIGNoZWNrIGZ1bmN0aW9uIGRlZmluZWQgZm9yICR7ZmVhdHVyZX0gZmVhdHVyZWApO1xuXG4gICAgICByZXN1bHQgPSByZXN1bHQgJiYgY2hlY2tGdW5jdGlvbigpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfZ2V0SG9va3ModHlwZSkge1xuICAgIGNvbnN0IGhvb2tzID0gW107XG5cbiAgICB0aGlzLl9yZXF1aXJlZEZlYXR1cmVzLmZvckVhY2goKGZlYXR1cmUpID0+IHtcbiAgICAgIGNvbnN0IGhvb2sgPSB0aGlzLl9mZWF0dXJlRGVmaW5pdGlvbnNbZmVhdHVyZV1bdHlwZV07XG5cbiAgICAgIGlmIChob29rKVxuICAgICAgICBob29rcy5wdXNoKGhvb2spO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGhvb2tzO1xuICB9XG5cbiAgLyoqXG4gICAqIFBvcHVsYXRlIGBjbGllbnQucGxhdGZvcm1gIHdpdGggdGhlIHByZWZlcmVkIGF1ZGlvIGZpbGUgZXh0ZW50aW9uXG4gICAqIGZvciB0aGUgcGxhdGZvcm0uXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZGVmaW5lQXVkaW9GaWxlRXh0ZW50aW9uKCkge1xuICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuICAgIC8vIGh0dHA6Ly9kaXZlaW50b2h0bWw1LmluZm8vZXZlcnl0aGluZy5odG1sXG4gICAgaWYgKCEhKGEuY2FuUGxheVR5cGUgJiYgYS5jYW5QbGF5VHlwZSgnYXVkaW8vbXBlZzsnKSkpXG4gICAgICBjbGllbnQucGxhdGZvcm0uYXVkaW9GaWxlRXh0ID0gJy5tcDMnO1xuICAgIGVsc2UgaWYgKCEhKGEuY2FuUGxheVR5cGUgJiYgYS5jYW5QbGF5VHlwZSgnYXVkaW8vb2dnOyBjb2RlY3M9XCJ2b3JiaXNcIicpKSlcbiAgICAgIGNsaWVudC5wbGF0Zm9ybS5hdWRpb0ZpbGVFeHQgPSAnLm9nZyc7XG4gICAgZWxzZVxuICAgICAgY2xpZW50LnBsYXRmb3JtLmF1ZGlvRmlsZUV4dCA9ICcud2F2JztcbiAgfVxuXG4gIC8qKlxuICAgKiBQb3B1bGF0ZSBgY2xpZW50LnBsYXRmb3JtYCB3aXRoIHRoZSBvcyBuYW1lLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2RlZmluZVBsYXRmb3JtKCkge1xuICAgIGNvbnN0IHVhID0gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnRcbiAgICBjb25zdCBtZCA9IG5ldyBNb2JpbGVEZXRlY3QodWEpO1xuXG4gICAgY2xpZW50LnBsYXRmb3JtLmlzTW9iaWxlID0gKG1kLm1vYmlsZSgpICE9PSBudWxsKTsgLy8gdHJ1ZSBpZiBwaG9uZSBvciB0YWJsZXRcbiAgICBjbGllbnQucGxhdGZvcm0ub3MgPSAoZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBvcyA9IG1kLm9zKCk7XG5cbiAgICAgIGlmIChvcyA9PT0gJ0FuZHJvaWRPUycpXG4gICAgICAgIHJldHVybiAnYW5kcm9pZCc7XG4gICAgICBlbHNlIGlmIChvcyA9PT0gJ2lPUycpXG4gICAgICAgIHJldHVybiAnaW9zJztcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuICdvdGhlcic7XG4gICAgfSkoKTtcbiAgfVxufVxuXG5zZXJ2aWNlTWFuYWdlci5yZWdpc3RlcihTRVJWSUNFX0lELCBQbGF0Zm9ybSk7XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXRmb3JtO1xuIl19