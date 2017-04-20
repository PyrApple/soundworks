'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _Signal = require('./Signal');

var _Signal2 = _interopRequireDefault(_Signal);

var _Activity = require('./Activity');

var _Activity2 = _interopRequireDefault(_Activity);

var _serviceManager = require('./serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

var _viewManager = require('./viewManager');

var _viewManager2 = _interopRequireDefault(_viewManager);

var _socket = require('./socket');

var _socket2 = _interopRequireDefault(_socket);

var _viewport = require('../views/viewport');

var _viewport2 = _interopRequireDefault(_viewport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Client side entry point for a `soundworks` application.
 *
 * This object hosts general informations about the user, as well as methods
 * to initialize and start the application.
 *
 * @memberof module:soundworks/client
 * @namespace
 *
 * @example
 * import * as soundworks from 'soundworks/client';
 * import MyExperience from './MyExperience';
 *
 * soundworks.client.init('player');
 * const myExperience = new MyExperience();
 * soundworks.client.start();
 */
var client = {
  /**
   * Unique id of the client, generated and retrieved by the server.
   *
   * @type {Number}
   */
  uuid: null,

  /**
   * The type of the client, this can generally be considered as the role of the
   * client in the application. This value is defined in the
   * [`client.init`]{@link module:soundworks/server.server~serverConfig} object
   * and defaults to `'player'`.
   *
   * @type {String}
   */
  type: null,

  /**
   * Configuration informations from the server configuration if any.
   *
   * @type {Object}
   * @see {@link module:soundworks/client.client~init}
   * @see {@link module:soundworks/client.SharedConfig}
   */
  config: {},

  /**
   * Array of optionnal parameters passed through the url
   *
   * @type {Array}
   */
  urlParams: null,

  /**
   * Information about the client platform. The properties are set by the
   * [`platform`]{@link module:soundworks/client.Platform} service.
   *
   * @type {Object}
   * @property {String} os - Operating system.
   * @property {Boolean} isMobile - Indicates whether the client is running on a
   *  mobile platform or not.
   * @property {String} audioFileExt - Audio file extension to use, depending on
   *  the platform.
   * @property {String} interaction - Type of interaction allowed by the
   *  viewport, `touch` or `mouse`
   *
   * @see {@link module:soundworks/client.Platform}
   */
  platform: {
    os: null,
    isMobile: null,
    audioFileExt: '',
    interaction: null
  },

  /**
   * Defines whether the user's device is compatible with the application
   * requirements.
   *
   * @type {Boolean}
   * @see {@link module:soundworks/client.Platform}
   */
  compatible: null,

  /**
   * Index (if any) given by a [`placer`]{@link module:soundworks/client.Placer}
   * or [`checkin`]{@link module:soundworks/client.Checkin} service.
   *
   * @type {Number}
   * @see {@link module:soundworks/client.Checkin}
   * @see {@link module:soundworks/client.Placer}
   */
  index: null,

  /**
   * Ticket label (if any) given by a [`placer`]{@link module:soundworks/client.Placer}
   * or [`checkin`]{@link module:soundworks/client.Checkin} service.
   *
   * @type {String}
   * @see {@link module:soundworks/client.Checkin}
   * @see {@link module:soundworks/client.Placer}
   */
  label: null,

  /**
   * Client coordinates (if any) given by a
   * [`locator`]{@link module:soundworks/client.Locator},
   * [`placer`]{@link module:soundworks/client.Placer} or
   * [`checkin`]{@link module:soundworks/client.Checkin} service.
   * (Format: `[x:Number, y:Number]`.)
   *
   * @type {Array<Number>}
   * @see {@link module:soundworks/client.Checkin}
   * @see {@link module:soundworks/client.Locator}
   * @see {@link module:soundworks/client.Placer}
   * @see {@link module:soundworks/client.Geolocation}
   */
  coordinates: null,

  /**
   * Full `geoposition` object as returned by `navigator.geolocation`, when
   * using the `geolocation` service.
   *
   * @type {Object}
   * @see {@link module:soundworks/client.Geolocation}
   */
  geoposition: null,

  /**
   * Socket object that handle communications with the server, if any.
   * This object is automatically created if the experience requires any service
   * having a server-side counterpart.
   *
   * @type {module:soundworks/client.socket}
   * @private
   */
  socket: _socket2.default,

  /**
   * Initialize the application.
   *
   * @param {String} [clientType='player'] - The type of the client, defines the
   *  socket connection namespace. Should match a client type defined server side.
   * @param {Object} [config={}]
   * @param {Object} [config.appContainer='#container'] - A css selector
   *  matching a DOM element where the views should be inserted.
   * @param {Object} [config.websockets.url=''] - The url where the socket should
   *  connect _(unstable)_.
   * @param {Object} [config.websockets.transports=['websocket']] - The transport
   *  used to create the url (overrides default socket.io mecanism) _(unstable)_.
   */
  init: function init() {
    var clientType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'player';
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    this.type = clientType;

    this._parseUrlParams();
    // if socket config given, mix it with defaults
    var websocketConfig = (0, _assign2.default)({
      url: '',
      transports: ['websocket']
    }, config.websockets);

    // mix all other config and override with defined socket config
    (0, _assign2.default)(this.config, {
      appContainer: '#container'
    }, config, { websocketConfig: websocketConfig });

    _serviceManager2.default.init();

    this._initViews();
  },


  /**
   * Start the application.
   */
  start: function start() {
    if (_socket2.default.required) this._initSocket();else _serviceManager2.default.start();
  },


  /**
   * Returns a service configured with the given options.
   * @param {String} id - Identifier of the service.
   * @param {Object} options - Options to configure the service.
   */
  require: function require(id, options) {
    return _serviceManager2.default.require(id, options);
  },


  /**
   * Retrieve an array of optionnal parameters from the url excluding the client type
   * and store it in `this.urlParams`.
   * Parameters can be defined in two ways :
   * - as a regular route (ex: `/player/param1/param2`)
   * - as a hash (ex: `/player#param1-param2`)
   * The parameters are send along with the socket connection
   *
   * @see {@link module:soundworks/client.socket}
   * @private
   * @todo - When handshake implemented, define if these informations should be part of it
   */
  _parseUrlParams: function _parseUrlParams() {
    var _this = this;

    var pathParams = null;
    var hashParams = null;
    // handle path name first
    var pathname = window.location.pathname;
    // sanitize
    pathname = pathname.replace(/^\//, '') // leading slash
    .replace(new RegExp('^' + this.type + '/?'), '') // remove clientType
    .replace(/\/$/, ''); // trailing slash

    if (pathname.length > 0) pathParams = pathname.split('/');

    // handle hash
    var hash = window.location.hash;
    hash = hash.replace(/^#/, '');

    if (hash.length > 0) hashParams = hash.split('-');

    if (pathParams || hashParams) {
      this.urlParams = [];

      if (pathParams) pathParams.forEach(function (param) {
        return _this.urlParams.push(param);
      });

      if (hashParams) hashParams.forEach(function (param) {
        return _this.urlParams.push(param);
      });
    }
  },


  /**
   * Initialize socket connection and perform handshake with the server.
   * @todo - refactor handshake.
   * @private
   */
  _initSocket: function _initSocket() {
    var _this2 = this;

    this.socket.init(this.type, this.config.websockets);

    // see: http://socket.io/docs/client-api/#socket
    this.socket.addStateListener(function (eventName) {
      switch (eventName) {
        case 'connect':
          var payload = { urlParams: _this2.urlParams };

          if (_this2.config.env !== 'production') {
            (0, _assign2.default)(payload, {
              requiredServices: _serviceManager2.default.getRequiredServices()
            });
          }

          _this2.socket.send('handshake', payload);
          // wait for handshake response to mark client as `ready`
          _this2.socket.receive('client:start', function (uuid) {
            _this2.uuid = uuid;
            _serviceManager2.default.start();
          });

          _this2.socket.receive('client:error', function (err) {
            switch (err.type) {
              case 'services':
                // can only append if env !== 'production'
                var msg = '"' + err.data.join(', ') + '" required client-side but not server-side';
                throw new Error(msg);
                break;
            }
          });
          break;
        // case 'reconnect':
        //   // serviceManager.start();
        //   break;
        // case 'disconnect':
        //   // can relaunch serviceManager on reconnection
        //   // serviceManager.reset();
        //   break;
        // case 'connect_error':
        // case 'reconnect_attempt':
        // case 'reconnecting':
        // case 'reconnect_error':
        // case 'reconnect_failed':
        //   break;
      }
    });
  },


  /**
   * Initialize view templates for all activities.
   * @private
   */
  _initViews: function _initViews() {
    _viewport2.default.init();
    // initialize views with default view content and templates
    this.viewContent = {};
    this.viewTemplates = {};

    var appName = this.config.appName || 'Soundworks';
    this.setViewContentDefinitions({ globals: { appName: appName } });

    this.setAppContainer(this.config.appContainer);
  },


  /**
   * Extend or override application view contents with the given object.
   * @param {Object} defs - Content to be used by activities.
   * @see {@link module:soundworks/client.setViewTemplateDefinitions}
   * @example
   * client.setViewContentDefinitions({
   *   'service:platform': { myValue: 'Welcome to the application' }
   * });
   */
  setViewContentDefinitions: function setViewContentDefinitions(defs) {
    for (var key in defs) {
      var def = defs[key];

      if (this.viewContent[key]) (0, _assign2.default)(this.viewContent[key], def);else this.viewContent[key] = def;
    }

    _Activity2.default.setViewContentDefinitions(this.viewContent);
  },


  /**
   * Extend or override application view templates with the given object.
   * @param {Object} defs - Templates to be used by activities.
   * @see {@link module:soundworks/client.setViewContentDefinitions}
   * @example
   * client.setViewTemplateDefinitions({
   *   'service:platform': `
   *     <p><%= myValue %></p>
   *   `,
   * });
   */
  setViewTemplateDefinitions: function setViewTemplateDefinitions(defs) {
    this.viewTemplates = (0, _assign2.default)(this.viewTemplates, defs);
    _Activity2.default.setViewTemplateDefinitions(this.viewTemplates);
  },


  /**
   * Set the DOM elemnt that will be the container for all views.
   * @private
   * @param {String|Element} el - DOM element (or css selector matching
   *  an existing element) to be used as the container of the application.
   */
  setAppContainer: function setAppContainer(el) {
    var $container = el instanceof Element ? el : document.querySelector(el);
    _viewManager2.default.setViewContainer($container);
  }
};
// import defaultViewContent from '../config/defaultViewContent';
// import defaultViewTemplates from '../config/defaultViewTemplates';
exports.default = client;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsaWVudC5qcyJdLCJuYW1lcyI6WyJjbGllbnQiLCJ1dWlkIiwidHlwZSIsImNvbmZpZyIsInVybFBhcmFtcyIsInBsYXRmb3JtIiwib3MiLCJpc01vYmlsZSIsImF1ZGlvRmlsZUV4dCIsImludGVyYWN0aW9uIiwiY29tcGF0aWJsZSIsImluZGV4IiwibGFiZWwiLCJjb29yZGluYXRlcyIsImdlb3Bvc2l0aW9uIiwic29ja2V0IiwiaW5pdCIsImNsaWVudFR5cGUiLCJfcGFyc2VVcmxQYXJhbXMiLCJ3ZWJzb2NrZXRDb25maWciLCJ1cmwiLCJ0cmFuc3BvcnRzIiwid2Vic29ja2V0cyIsImFwcENvbnRhaW5lciIsIl9pbml0Vmlld3MiLCJzdGFydCIsInJlcXVpcmVkIiwiX2luaXRTb2NrZXQiLCJyZXF1aXJlIiwiaWQiLCJvcHRpb25zIiwicGF0aFBhcmFtcyIsImhhc2hQYXJhbXMiLCJwYXRobmFtZSIsIndpbmRvdyIsImxvY2F0aW9uIiwicmVwbGFjZSIsIlJlZ0V4cCIsImxlbmd0aCIsInNwbGl0IiwiaGFzaCIsImZvckVhY2giLCJwYXJhbSIsInB1c2giLCJhZGRTdGF0ZUxpc3RlbmVyIiwiZXZlbnROYW1lIiwicGF5bG9hZCIsImVudiIsInJlcXVpcmVkU2VydmljZXMiLCJnZXRSZXF1aXJlZFNlcnZpY2VzIiwic2VuZCIsInJlY2VpdmUiLCJlcnIiLCJtc2ciLCJkYXRhIiwiam9pbiIsIkVycm9yIiwidmlld0NvbnRlbnQiLCJ2aWV3VGVtcGxhdGVzIiwiYXBwTmFtZSIsInNldFZpZXdDb250ZW50RGVmaW5pdGlvbnMiLCJnbG9iYWxzIiwic2V0QXBwQ29udGFpbmVyIiwiZGVmcyIsImtleSIsImRlZiIsInNldFZpZXdUZW1wbGF0ZURlZmluaXRpb25zIiwiZWwiLCIkY29udGFpbmVyIiwiRWxlbWVudCIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsInNldFZpZXdDb250YWluZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7OztB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ekM7QUFDRCxHQWpVWTs7O0FBbVViOzs7Ozs7QUFNQUksaUJBelVhLDJCQXlVR0ssRUF6VUgsRUF5VU87QUFDbEIsUUFBTUMsYUFBYUQsY0FBY0UsT0FBZCxHQUF3QkYsRUFBeEIsR0FBNkJHLFNBQVNDLGFBQVQsQ0FBdUJKLEVBQXZCLENBQWhEO0FBQ0EsMEJBQVlLLGdCQUFaLENBQTZCSixVQUE3QjtBQUNEO0FBNVVZLENBQWY7QUFyQkE7QUFDQTtrQkFvV2VwRSxNIiwiZmlsZSI6ImNsaWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTaWduYWwgZnJvbSAnLi9TaWduYWwnO1xuaW1wb3J0IEFjdGl2aXR5IGZyb20gJy4vQWN0aXZpdHknO1xuaW1wb3J0IHNlcnZpY2VNYW5hZ2VyIGZyb20gJy4vc2VydmljZU1hbmFnZXInO1xuaW1wb3J0IHZpZXdNYW5hZ2VyIGZyb20gJy4vdmlld01hbmFnZXInO1xuaW1wb3J0IHNvY2tldCBmcm9tICcuL3NvY2tldCc7XG4vLyBpbXBvcnQgZGVmYXVsdFZpZXdDb250ZW50IGZyb20gJy4uL2NvbmZpZy9kZWZhdWx0Vmlld0NvbnRlbnQnO1xuLy8gaW1wb3J0IGRlZmF1bHRWaWV3VGVtcGxhdGVzIGZyb20gJy4uL2NvbmZpZy9kZWZhdWx0Vmlld1RlbXBsYXRlcyc7XG5pbXBvcnQgdmlld3BvcnQgZnJvbSAnLi4vdmlld3Mvdmlld3BvcnQnO1xuXG4vKipcbiAqIENsaWVudCBzaWRlIGVudHJ5IHBvaW50IGZvciBhIGBzb3VuZHdvcmtzYCBhcHBsaWNhdGlvbi5cbiAqXG4gKiBUaGlzIG9iamVjdCBob3N0cyBnZW5lcmFsIGluZm9ybWF0aW9ucyBhYm91dCB0aGUgdXNlciwgYXMgd2VsbCBhcyBtZXRob2RzXG4gKiB0byBpbml0aWFsaXplIGFuZCBzdGFydCB0aGUgYXBwbGljYXRpb24uXG4gKlxuICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudFxuICogQG5hbWVzcGFjZVxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbiAqIGltcG9ydCBNeUV4cGVyaWVuY2UgZnJvbSAnLi9NeUV4cGVyaWVuY2UnO1xuICpcbiAqIHNvdW5kd29ya3MuY2xpZW50LmluaXQoJ3BsYXllcicpO1xuICogY29uc3QgbXlFeHBlcmllbmNlID0gbmV3IE15RXhwZXJpZW5jZSgpO1xuICogc291bmR3b3Jrcy5jbGllbnQuc3RhcnQoKTtcbiAqL1xuY29uc3QgY2xpZW50ID0ge1xuICAvKipcbiAgICogVW5pcXVlIGlkIG9mIHRoZSBjbGllbnQsIGdlbmVyYXRlZCBhbmQgcmV0cmlldmVkIGJ5IHRoZSBzZXJ2ZXIuXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqL1xuICB1dWlkOiBudWxsLFxuXG4gIC8qKlxuICAgKiBUaGUgdHlwZSBvZiB0aGUgY2xpZW50LCB0aGlzIGNhbiBnZW5lcmFsbHkgYmUgY29uc2lkZXJlZCBhcyB0aGUgcm9sZSBvZiB0aGVcbiAgICogY2xpZW50IGluIHRoZSBhcHBsaWNhdGlvbi4gVGhpcyB2YWx1ZSBpcyBkZWZpbmVkIGluIHRoZVxuICAgKiBbYGNsaWVudC5pbml0YF17QGxpbmsgbW9kdWxlOnNvdW5kd29ya3Mvc2VydmVyLnNlcnZlcn5zZXJ2ZXJDb25maWd9IG9iamVjdFxuICAgKiBhbmQgZGVmYXVsdHMgdG8gYCdwbGF5ZXInYC5cbiAgICpcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICovXG4gIHR5cGU6IG51bGwsXG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyYXRpb24gaW5mb3JtYXRpb25zIGZyb20gdGhlIHNlcnZlciBjb25maWd1cmF0aW9uIGlmIGFueS5cbiAgICpcbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQHNlZSB7QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LmNsaWVudH5pbml0fVxuICAgKiBAc2VlIHtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuU2hhcmVkQ29uZmlnfVxuICAgKi9cbiAgY29uZmlnOiB7fSxcblxuICAvKipcbiAgICogQXJyYXkgb2Ygb3B0aW9ubmFsIHBhcmFtZXRlcnMgcGFzc2VkIHRocm91Z2ggdGhlIHVybFxuICAgKlxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqL1xuICAgdXJsUGFyYW1zOiBudWxsLFxuXG4gIC8qKlxuICAgKiBJbmZvcm1hdGlvbiBhYm91dCB0aGUgY2xpZW50IHBsYXRmb3JtLiBUaGUgcHJvcGVydGllcyBhcmUgc2V0IGJ5IHRoZVxuICAgKiBbYHBsYXRmb3JtYF17QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlBsYXRmb3JtfSBzZXJ2aWNlLlxuICAgKlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAcHJvcGVydHkge1N0cmluZ30gb3MgLSBPcGVyYXRpbmcgc3lzdGVtLlxuICAgKiBAcHJvcGVydHkge0Jvb2xlYW59IGlzTW9iaWxlIC0gSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGNsaWVudCBpcyBydW5uaW5nIG9uIGFcbiAgICogIG1vYmlsZSBwbGF0Zm9ybSBvciBub3QuXG4gICAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBhdWRpb0ZpbGVFeHQgLSBBdWRpbyBmaWxlIGV4dGVuc2lvbiB0byB1c2UsIGRlcGVuZGluZyBvblxuICAgKiAgdGhlIHBsYXRmb3JtLlxuICAgKiBAcHJvcGVydHkge1N0cmluZ30gaW50ZXJhY3Rpb24gLSBUeXBlIG9mIGludGVyYWN0aW9uIGFsbG93ZWQgYnkgdGhlXG4gICAqICB2aWV3cG9ydCwgYHRvdWNoYCBvciBgbW91c2VgXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5QbGF0Zm9ybX1cbiAgICovXG4gIHBsYXRmb3JtOiB7XG4gICAgb3M6IG51bGwsXG4gICAgaXNNb2JpbGU6IG51bGwsXG4gICAgYXVkaW9GaWxlRXh0OiAnJyxcbiAgICBpbnRlcmFjdGlvbjogbnVsbCxcbiAgfSxcblxuICAvKipcbiAgICogRGVmaW5lcyB3aGV0aGVyIHRoZSB1c2VyJ3MgZGV2aWNlIGlzIGNvbXBhdGlibGUgd2l0aCB0aGUgYXBwbGljYXRpb25cbiAgICogcmVxdWlyZW1lbnRzLlxuICAgKlxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQHNlZSB7QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlBsYXRmb3JtfVxuICAgKi9cbiAgY29tcGF0aWJsZTogbnVsbCxcblxuICAvKipcbiAgICogSW5kZXggKGlmIGFueSkgZ2l2ZW4gYnkgYSBbYHBsYWNlcmBde0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5QbGFjZXJ9XG4gICAqIG9yIFtgY2hlY2tpbmBde0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5DaGVja2lufSBzZXJ2aWNlLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAc2VlIHtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuQ2hlY2tpbn1cbiAgICogQHNlZSB7QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlBsYWNlcn1cbiAgICovXG4gIGluZGV4OiBudWxsLFxuXG4gIC8qKlxuICAgKiBUaWNrZXQgbGFiZWwgKGlmIGFueSkgZ2l2ZW4gYnkgYSBbYHBsYWNlcmBde0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5QbGFjZXJ9XG4gICAqIG9yIFtgY2hlY2tpbmBde0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5DaGVja2lufSBzZXJ2aWNlLlxuICAgKlxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAc2VlIHtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuQ2hlY2tpbn1cbiAgICogQHNlZSB7QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlBsYWNlcn1cbiAgICovXG4gIGxhYmVsOiBudWxsLFxuXG4gIC8qKlxuICAgKiBDbGllbnQgY29vcmRpbmF0ZXMgKGlmIGFueSkgZ2l2ZW4gYnkgYVxuICAgKiBbYGxvY2F0b3JgXXtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuTG9jYXRvcn0sXG4gICAqIFtgcGxhY2VyYF17QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlBsYWNlcn0gb3JcbiAgICogW2BjaGVja2luYF17QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LkNoZWNraW59IHNlcnZpY2UuXG4gICAqIChGb3JtYXQ6IGBbeDpOdW1iZXIsIHk6TnVtYmVyXWAuKVxuICAgKlxuICAgKiBAdHlwZSB7QXJyYXk8TnVtYmVyPn1cbiAgICogQHNlZSB7QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LkNoZWNraW59XG4gICAqIEBzZWUge0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5Mb2NhdG9yfVxuICAgKiBAc2VlIHtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuUGxhY2VyfVxuICAgKiBAc2VlIHtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuR2VvbG9jYXRpb259XG4gICAqL1xuICBjb29yZGluYXRlczogbnVsbCxcblxuICAvKipcbiAgICogRnVsbCBgZ2VvcG9zaXRpb25gIG9iamVjdCBhcyByZXR1cm5lZCBieSBgbmF2aWdhdG9yLmdlb2xvY2F0aW9uYCwgd2hlblxuICAgKiB1c2luZyB0aGUgYGdlb2xvY2F0aW9uYCBzZXJ2aWNlLlxuICAgKlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAc2VlIHtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuR2VvbG9jYXRpb259XG4gICAqL1xuICBnZW9wb3NpdGlvbjogbnVsbCxcblxuICAvKipcbiAgICogU29ja2V0IG9iamVjdCB0aGF0IGhhbmRsZSBjb21tdW5pY2F0aW9ucyB3aXRoIHRoZSBzZXJ2ZXIsIGlmIGFueS5cbiAgICogVGhpcyBvYmplY3QgaXMgYXV0b21hdGljYWxseSBjcmVhdGVkIGlmIHRoZSBleHBlcmllbmNlIHJlcXVpcmVzIGFueSBzZXJ2aWNlXG4gICAqIGhhdmluZyBhIHNlcnZlci1zaWRlIGNvdW50ZXJwYXJ0LlxuICAgKlxuICAgKiBAdHlwZSB7bW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LnNvY2tldH1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNvY2tldDogc29ja2V0LFxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHRoZSBhcHBsaWNhdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IFtjbGllbnRUeXBlPSdwbGF5ZXInXSAtIFRoZSB0eXBlIG9mIHRoZSBjbGllbnQsIGRlZmluZXMgdGhlXG4gICAqICBzb2NrZXQgY29ubmVjdGlvbiBuYW1lc3BhY2UuIFNob3VsZCBtYXRjaCBhIGNsaWVudCB0eXBlIGRlZmluZWQgc2VydmVyIHNpZGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbY29uZmlnPXt9XVxuICAgKiBAcGFyYW0ge09iamVjdH0gW2NvbmZpZy5hcHBDb250YWluZXI9JyNjb250YWluZXInXSAtIEEgY3NzIHNlbGVjdG9yXG4gICAqICBtYXRjaGluZyBhIERPTSBlbGVtZW50IHdoZXJlIHRoZSB2aWV3cyBzaG91bGQgYmUgaW5zZXJ0ZWQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbY29uZmlnLndlYnNvY2tldHMudXJsPScnXSAtIFRoZSB1cmwgd2hlcmUgdGhlIHNvY2tldCBzaG91bGRcbiAgICogIGNvbm5lY3QgXyh1bnN0YWJsZSlfLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW2NvbmZpZy53ZWJzb2NrZXRzLnRyYW5zcG9ydHM9Wyd3ZWJzb2NrZXQnXV0gLSBUaGUgdHJhbnNwb3J0XG4gICAqICB1c2VkIHRvIGNyZWF0ZSB0aGUgdXJsIChvdmVycmlkZXMgZGVmYXVsdCBzb2NrZXQuaW8gbWVjYW5pc20pIF8odW5zdGFibGUpXy5cbiAgICovXG4gIGluaXQoY2xpZW50VHlwZSA9ICdwbGF5ZXInLCBjb25maWcgPSB7fSkge1xuICAgIHRoaXMudHlwZSA9IGNsaWVudFR5cGU7XG5cbiAgICB0aGlzLl9wYXJzZVVybFBhcmFtcygpO1xuICAgIC8vIGlmIHNvY2tldCBjb25maWcgZ2l2ZW4sIG1peCBpdCB3aXRoIGRlZmF1bHRzXG4gICAgY29uc3Qgd2Vic29ja2V0Q29uZmlnID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICB1cmw6ICcnLFxuICAgICAgdHJhbnNwb3J0czogWyd3ZWJzb2NrZXQnXVxuICAgIH0sIGNvbmZpZy53ZWJzb2NrZXRzKTtcblxuICAgIC8vIG1peCBhbGwgb3RoZXIgY29uZmlnIGFuZCBvdmVycmlkZSB3aXRoIGRlZmluZWQgc29ja2V0IGNvbmZpZ1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5jb25maWcsIHtcbiAgICAgIGFwcENvbnRhaW5lcjogJyNjb250YWluZXInLFxuICAgIH0sIGNvbmZpZywgeyB3ZWJzb2NrZXRDb25maWcgfSk7XG5cbiAgICBzZXJ2aWNlTWFuYWdlci5pbml0KCk7XG5cbiAgICB0aGlzLl9pbml0Vmlld3MoKTtcbiAgfSxcblxuICAvKipcbiAgICogU3RhcnQgdGhlIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgc3RhcnQoKSB7XG4gICAgaWYgKHNvY2tldC5yZXF1aXJlZClcbiAgICAgIHRoaXMuX2luaXRTb2NrZXQoKTtcbiAgICBlbHNlXG4gICAgICBzZXJ2aWNlTWFuYWdlci5zdGFydCgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc2VydmljZSBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIElkZW50aWZpZXIgb2YgdGhlIHNlcnZpY2UuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3B0aW9ucyB0byBjb25maWd1cmUgdGhlIHNlcnZpY2UuXG4gICAqL1xuICByZXF1aXJlKGlkLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHNlcnZpY2VNYW5hZ2VyLnJlcXVpcmUoaWQsIG9wdGlvbnMpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSBhbiBhcnJheSBvZiBvcHRpb25uYWwgcGFyYW1ldGVycyBmcm9tIHRoZSB1cmwgZXhjbHVkaW5nIHRoZSBjbGllbnQgdHlwZVxuICAgKiBhbmQgc3RvcmUgaXQgaW4gYHRoaXMudXJsUGFyYW1zYC5cbiAgICogUGFyYW1ldGVycyBjYW4gYmUgZGVmaW5lZCBpbiB0d28gd2F5cyA6XG4gICAqIC0gYXMgYSByZWd1bGFyIHJvdXRlIChleDogYC9wbGF5ZXIvcGFyYW0xL3BhcmFtMmApXG4gICAqIC0gYXMgYSBoYXNoIChleDogYC9wbGF5ZXIjcGFyYW0xLXBhcmFtMmApXG4gICAqIFRoZSBwYXJhbWV0ZXJzIGFyZSBzZW5kIGFsb25nIHdpdGggdGhlIHNvY2tldCBjb25uZWN0aW9uXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5zb2NrZXR9XG4gICAqIEBwcml2YXRlXG4gICAqIEB0b2RvIC0gV2hlbiBoYW5kc2hha2UgaW1wbGVtZW50ZWQsIGRlZmluZSBpZiB0aGVzZSBpbmZvcm1hdGlvbnMgc2hvdWxkIGJlIHBhcnQgb2YgaXRcbiAgICovXG4gIF9wYXJzZVVybFBhcmFtcygpIHtcbiAgICBsZXQgcGF0aFBhcmFtcyA9IG51bGw7XG4gICAgbGV0IGhhc2hQYXJhbXMgPSBudWxsO1xuICAgIC8vIGhhbmRsZSBwYXRoIG5hbWUgZmlyc3RcbiAgICBsZXQgcGF0aG5hbWUgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG4gICAgLy8gc2FuaXRpemVcbiAgICBwYXRobmFtZSA9IHBhdGhuYW1lXG4gICAgICAucmVwbGFjZSgvXlxcLy8sICcnKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsZWFkaW5nIHNsYXNoXG4gICAgICAucmVwbGFjZShuZXcgUmVnRXhwKCdeJyArIHRoaXMudHlwZSArICcvPycpLCAnJykgIC8vIHJlbW92ZSBjbGllbnRUeXBlXG4gICAgICAucmVwbGFjZSgvXFwvJC8sICcnKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0cmFpbGluZyBzbGFzaFxuXG4gICAgaWYgKHBhdGhuYW1lLmxlbmd0aCA+IDApXG4gICAgICBwYXRoUGFyYW1zID0gcGF0aG5hbWUuc3BsaXQoJy8nKTtcblxuICAgIC8vIGhhbmRsZSBoYXNoXG4gICAgbGV0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICBoYXNoID0gaGFzaC5yZXBsYWNlKC9eIy8sICcnKTtcblxuICAgIGlmIChoYXNoLmxlbmd0aCA+IDApXG4gICAgICBoYXNoUGFyYW1zID0gaGFzaC5zcGxpdCgnLScpO1xuXG4gICAgaWYgKHBhdGhQYXJhbXMgfHzCoGhhc2hQYXJhbXMpIHtcbiAgICAgIHRoaXMudXJsUGFyYW1zID0gW107XG5cbiAgICAgIGlmIChwYXRoUGFyYW1zKVxuICAgICAgICBwYXRoUGFyYW1zLmZvckVhY2goKHBhcmFtKSA9PiB0aGlzLnVybFBhcmFtcy5wdXNoKHBhcmFtKSk7XG5cbiAgICAgIGlmIChoYXNoUGFyYW1zKVxuICAgICAgICBoYXNoUGFyYW1zLmZvckVhY2goKHBhcmFtKSA9PiB0aGlzLnVybFBhcmFtcy5wdXNoKHBhcmFtKSk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHNvY2tldCBjb25uZWN0aW9uIGFuZCBwZXJmb3JtIGhhbmRzaGFrZSB3aXRoIHRoZSBzZXJ2ZXIuXG4gICAqIEB0b2RvIC0gcmVmYWN0b3IgaGFuZHNoYWtlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXRTb2NrZXQoKSB7XG4gICAgdGhpcy5zb2NrZXQuaW5pdCh0aGlzLnR5cGUsIHRoaXMuY29uZmlnLndlYnNvY2tldHMpO1xuXG4gICAgLy8gc2VlOiBodHRwOi8vc29ja2V0LmlvL2RvY3MvY2xpZW50LWFwaS8jc29ja2V0XG4gICAgdGhpcy5zb2NrZXQuYWRkU3RhdGVMaXN0ZW5lcigoZXZlbnROYW1lKSA9PiB7XG4gICAgICBzd2l0Y2ggKGV2ZW50TmFtZSkge1xuICAgICAgICBjYXNlICdjb25uZWN0JzpcbiAgICAgICAgICBjb25zdCBwYXlsb2FkID0geyB1cmxQYXJhbXM6IHRoaXMudXJsUGFyYW1zIH07XG5cbiAgICAgICAgICBpZiAodGhpcy5jb25maWcuZW52ICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24ocGF5bG9hZCwge1xuICAgICAgICAgICAgICByZXF1aXJlZFNlcnZpY2VzOiBzZXJ2aWNlTWFuYWdlci5nZXRSZXF1aXJlZFNlcnZpY2VzKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuc29ja2V0LnNlbmQoJ2hhbmRzaGFrZScsIHBheWxvYWQpO1xuICAgICAgICAgIC8vIHdhaXQgZm9yIGhhbmRzaGFrZSByZXNwb25zZSB0byBtYXJrIGNsaWVudCBhcyBgcmVhZHlgXG4gICAgICAgICAgdGhpcy5zb2NrZXQucmVjZWl2ZSgnY2xpZW50OnN0YXJ0JywgKHV1aWQpID0+IHtcbiAgICAgICAgICAgIHRoaXMudXVpZCA9IHV1aWQ7XG4gICAgICAgICAgICBzZXJ2aWNlTWFuYWdlci5zdGFydCgpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdGhpcy5zb2NrZXQucmVjZWl2ZSgnY2xpZW50OmVycm9yJywgKGVycikgPT4ge1xuICAgICAgICAgICAgc3dpdGNoIChlcnIudHlwZSkge1xuICAgICAgICAgICAgICBjYXNlICdzZXJ2aWNlcyc6XG4gICAgICAgICAgICAgICAgLy8gY2FuIG9ubHkgYXBwZW5kIGlmIGVudiAhPT0gJ3Byb2R1Y3Rpb24nXG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gYFwiJHtlcnIuZGF0YS5qb2luKCcsICcpfVwiIHJlcXVpcmVkIGNsaWVudC1zaWRlIGJ1dCBub3Qgc2VydmVyLXNpZGVgO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIC8vIGNhc2UgJ3JlY29ubmVjdCc6XG4gICAgICAgICAgLy8gICAvLyBzZXJ2aWNlTWFuYWdlci5zdGFydCgpO1xuICAgICAgICAgIC8vICAgYnJlYWs7XG4gICAgICAgICAgLy8gY2FzZSAnZGlzY29ubmVjdCc6XG4gICAgICAgICAgLy8gICAvLyBjYW4gcmVsYXVuY2ggc2VydmljZU1hbmFnZXIgb24gcmVjb25uZWN0aW9uXG4gICAgICAgICAgLy8gICAvLyBzZXJ2aWNlTWFuYWdlci5yZXNldCgpO1xuICAgICAgICAgIC8vICAgYnJlYWs7XG4gICAgICAgICAgLy8gY2FzZSAnY29ubmVjdF9lcnJvcic6XG4gICAgICAgICAgLy8gY2FzZSAncmVjb25uZWN0X2F0dGVtcHQnOlxuICAgICAgICAgIC8vIGNhc2UgJ3JlY29ubmVjdGluZyc6XG4gICAgICAgICAgLy8gY2FzZSAncmVjb25uZWN0X2Vycm9yJzpcbiAgICAgICAgICAvLyBjYXNlICdyZWNvbm5lY3RfZmFpbGVkJzpcbiAgICAgICAgICAvLyAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHZpZXcgdGVtcGxhdGVzIGZvciBhbGwgYWN0aXZpdGllcy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0Vmlld3MoKSB7XG4gICAgdmlld3BvcnQuaW5pdCgpO1xuICAgIC8vIGluaXRpYWxpemUgdmlld3Mgd2l0aCBkZWZhdWx0IHZpZXcgY29udGVudCBhbmQgdGVtcGxhdGVzXG4gICAgdGhpcy52aWV3Q29udGVudCA9IHt9O1xuICAgIHRoaXMudmlld1RlbXBsYXRlcyA9IHt9O1xuXG4gICAgY29uc3QgYXBwTmFtZSA9IHRoaXMuY29uZmlnLmFwcE5hbWUgfHzCoCdTb3VuZHdvcmtzJztcbiAgICB0aGlzLnNldFZpZXdDb250ZW50RGVmaW5pdGlvbnMoeyBnbG9iYWxzOiB7IGFwcE5hbWUgfX0pO1xuXG4gICAgdGhpcy5zZXRBcHBDb250YWluZXIodGhpcy5jb25maWcuYXBwQ29udGFpbmVyKTtcbiAgfSxcblxuICAvKipcbiAgICogRXh0ZW5kIG9yIG92ZXJyaWRlIGFwcGxpY2F0aW9uIHZpZXcgY29udGVudHMgd2l0aCB0aGUgZ2l2ZW4gb2JqZWN0LlxuICAgKiBAcGFyYW0ge09iamVjdH0gZGVmcyAtIENvbnRlbnQgdG8gYmUgdXNlZCBieSBhY3Rpdml0aWVzLlxuICAgKiBAc2VlIHtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuc2V0Vmlld1RlbXBsYXRlRGVmaW5pdGlvbnN9XG4gICAqIEBleGFtcGxlXG4gICAqIGNsaWVudC5zZXRWaWV3Q29udGVudERlZmluaXRpb25zKHtcbiAgICogICAnc2VydmljZTpwbGF0Zm9ybSc6IHsgbXlWYWx1ZTogJ1dlbGNvbWUgdG8gdGhlIGFwcGxpY2F0aW9uJyB9XG4gICAqIH0pO1xuICAgKi9cbiAgc2V0Vmlld0NvbnRlbnREZWZpbml0aW9ucyhkZWZzKSB7XG4gICAgZm9yIChsZXQga2V5IGluIGRlZnMpIHtcbiAgICAgIGNvbnN0IGRlZiA9IGRlZnNba2V5XTtcblxuICAgICAgaWYgKHRoaXMudmlld0NvbnRlbnRba2V5XSlcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLnZpZXdDb250ZW50W2tleV0sIGRlZik7XG4gICAgICBlbHNlXG4gICAgICAgIHRoaXMudmlld0NvbnRlbnRba2V5XSA9IGRlZjtcbiAgICB9XG5cbiAgICBBY3Rpdml0eS5zZXRWaWV3Q29udGVudERlZmluaXRpb25zKHRoaXMudmlld0NvbnRlbnQpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBFeHRlbmQgb3Igb3ZlcnJpZGUgYXBwbGljYXRpb24gdmlldyB0ZW1wbGF0ZXMgd2l0aCB0aGUgZ2l2ZW4gb2JqZWN0LlxuICAgKiBAcGFyYW0ge09iamVjdH0gZGVmcyAtIFRlbXBsYXRlcyB0byBiZSB1c2VkIGJ5IGFjdGl2aXRpZXMuXG4gICAqIEBzZWUge0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5zZXRWaWV3Q29udGVudERlZmluaXRpb25zfVxuICAgKiBAZXhhbXBsZVxuICAgKiBjbGllbnQuc2V0Vmlld1RlbXBsYXRlRGVmaW5pdGlvbnMoe1xuICAgKiAgICdzZXJ2aWNlOnBsYXRmb3JtJzogYFxuICAgKiAgICAgPHA+PCU9IG15VmFsdWUgJT48L3A+XG4gICAqICAgYCxcbiAgICogfSk7XG4gICAqL1xuICBzZXRWaWV3VGVtcGxhdGVEZWZpbml0aW9ucyhkZWZzKSB7XG4gICAgdGhpcy52aWV3VGVtcGxhdGVzID0gT2JqZWN0LmFzc2lnbih0aGlzLnZpZXdUZW1wbGF0ZXMsIGRlZnMpO1xuICAgIEFjdGl2aXR5LnNldFZpZXdUZW1wbGF0ZURlZmluaXRpb25zKHRoaXMudmlld1RlbXBsYXRlcyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFNldCB0aGUgRE9NIGVsZW1udCB0aGF0IHdpbGwgYmUgdGhlIGNvbnRhaW5lciBmb3IgYWxsIHZpZXdzLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fSBlbCAtIERPTSBlbGVtZW50IChvciBjc3Mgc2VsZWN0b3IgbWF0Y2hpbmdcbiAgICogIGFuIGV4aXN0aW5nIGVsZW1lbnQpIHRvIGJlIHVzZWQgYXMgdGhlIGNvbnRhaW5lciBvZiB0aGUgYXBwbGljYXRpb24uXG4gICAqL1xuICBzZXRBcHBDb250YWluZXIoZWwpIHtcbiAgICBjb25zdCAkY29udGFpbmVyID0gZWwgaW5zdGFuY2VvZiBFbGVtZW50ID8gZWwgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsKTtcbiAgICB2aWV3TWFuYWdlci5zZXRWaWV3Q29udGFpbmVyKCRjb250YWluZXIpO1xuICB9LFxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGllbnQ7XG4iXX0=