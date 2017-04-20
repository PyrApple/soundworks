'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _Client = require('./Client');

var _Client2 = _interopRequireDefault(_Client);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _ejs = require('ejs');

var _ejs2 = _interopRequireDefault(_ejs);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _logger = require('../utils/logger');

var _logger2 = _interopRequireDefault(_logger);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _pem = require('pem');

var _pem2 = _interopRequireDefault(_pem);

var _serviceManager = require('./serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

var _sockets = require('./sockets');

var _sockets2 = _interopRequireDefault(_sockets);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @typedef {Object} module:soundworks/server.server~serverConfig
 * @memberof module:soundworks/server.server
 *
 * @property {String} appName - Name of the application, used in the `.ejs`
 *  template and by default in the `platform` service to populate its view.
 * @property {String} env - Name of the environnement ('production' enable
 *  cache in express application).
 * @property {String} version - Version of application, can be used to force
 *  reload css and js files from server (cf. `html/default.ejs`)
 * @property {String} defaultClient - Name of the default client type,
 *  i.e. the client that can access the application at its root URL
 * @property {String} assetsDomain - Define from where the assets (static files)
 *  should be loaded, this value can refer to a separate server for scalability.
 *  The value should be used client-side to configure the `audio-buffer-manager`
 *  service.
 * @property {Number} port - Port used to open the http server, in production
 *  this value is typically 80
 *
 * @property {Object} setup - Describe the location where the experience takes
 *  places, theses values are used by the `placer`, `checkin` and `locator`
 *  services. If one of these service is required, this entry mandatory.
 * @property {Object} setup.area - Description of the area.
 * @property {Number} setup.area.width - Width of the area.
 * @property {Number} setup.area.height - Height of the area.
 * @property {String} setup.area.background - Path to an image to be used in
 *  the area representation.
 * @property {Array} setup.labels - Optionnal list of predefined labels.
 * @property {Array} setup.coordinates - Optionnal list of predefined coordinates.
 * @property {Array} setup.maxClientsPerPosition - Maximum number of clients
 *  allowed in a position.
 * @property {Number} setup.capacity - Maximum number of positions (may limit
 * or be limited by the number of labels and/or coordinates).
 *
 * @property {Object} websockets - Websockets configuration (socket.io)
 * @property {String} websockets.url - Optionnal url where the socket should
 *  connect.
 * @property {Array} websockets.transports - List of the transport mecanims that
 *  should be used to open or emulate the socket.
 *
 * @property {Boolean} useHttps -  Define if the HTTP server should be launched
 *  using secure connections. For development purposes when set to `true` and no
 *  certificates are given (cf. `httpsInfos`), a self-signed certificate is
 *  created.
 * @property {Object} httpsInfos - Paths to the key and certificate to be used
 *  in order to launch the https server. Both entries are required otherwise a
 *  self-signed certificate is generated.
 * @property {String} httpsInfos.cert - Path to the certificate.
 * @property {String} httpsInfos.key - Path to the key.
 *
 * @property {String} password - Password to be used by the `auth` service.
 *
 * @property {Object} osc - Configuration of the `osc` service.
 * @property {String} osc.receiveAddress - IP of the currently running server.
 * @property {Number} osc.receivePort - Port listening for incomming messages.
 * @property {String} osc.sendAddress - IP of the remote application.
 * @property {Number} osc.sendPort - Port where the remote application is
 *  listening for messages
 *
 * @property {Boolean} enableGZipCompression - Define if the server should use
 *  gzip compression for static files.
 * @property {String} publicDirectory - Location of the public directory
 *  (accessible through http(s) requests).
 * @property {String} templateDirectory - Directory where the server templating
 *  system looks for the `ejs` templates.
 * @property {Object} logger - Configuration of the logger service, cf. Bunyan
 *  documentation.
 * @property {String} errorReporterDirectory - Directory where error reported
 *  from the clients are written.
 */

/**
 * Server side entry point for a `soundworks` application.
 *
 * This object hosts configuration informations, as well as methods to
 * initialize and start the application. It is also responsible for creating
 * the static file (http) server as well as the socket server.
 *
 * @memberof module:soundworks/server
 * @namespace
 *
 * @example
 * import * as soundworks from 'soundworks/server';
 * import MyExperience from './MyExperience';
 *
 * soundworks.server.init(config);
 * const myExperience = new MyExperience();
 * soundworks.server.start();
 */
var server = {
  /**
   * Configuration informations, all config objects passed to the
   * [`server.init`]{@link module:soundworks/server.server.init} are merged
   * into this object.
   * @type {module:soundworks/server.server~serverConfig}
   */
  config: {},

  /**
   * The url of the node server on the current machine.
   * @private
   */
  _address: '',

  /**
   * Mapping between a `clientType` and its related activities.
   * @private
   */
  _clientTypeActivitiesMap: {},

  /**
   * Required activities that must be started.
   * @private
   */
  _activities: new _set2.default(),

  /**
   * Optionnal routing defined for each client.
   * @private
   * @type {Object}
   */
  _routes: {},

  get clientTypes() {
    return (0, _keys2.default)(this._clientTypeActivitiesMap);
  },

  /**
   * Return a service configured with the given options.
   * @param {String} id - Identifier of the service.
   * @param {Object} options - Options to configure the service.
   */
  require: function require(id, options) {
    return _serviceManager2.default.require(id, null, options);
  },


  /**
   * Default for the module:soundworks/server.server~clientConfigDefinition
   * @private
   */
  _clientConfigDefinition: function _clientConfigDefinition(clientType, serverConfig, httpRequest) {
    return { clientType: clientType };
  },

  /**
   * @callback module:soundworks/server.server~clientConfigDefinition
   * @param {String} clientType - Type of the client.
   * @param {Object} serverConfig - Configuration of the server.
   * @param {Object} httpRequest - Http request for the `index.html`
   * @return {Object}
   */
  /**
   * Set the {@link module:soundworks/server.server~clientConfigDefinition} with
   * a user defined function.
   * @param {module:soundworks/server.server~clientConfigDefinition} func - A
   *  function that returns the data that will be used to populate the `index.html`
   *  template. The function could (and should) be used to pass configuration
   *  to the soundworks client.
   * @see {@link module:soundworks/client.client~init}
   */
  setClientConfigDefinition: function setClientConfigDefinition(func) {
    this._clientConfigDefinition = func;
  },


  /**
   * Register a route for a given `clientType`, allow to define a more complex
   * routing (additionnal route parameters) for a given type of client.
   * @param {String} clientType - Type of the client.
   * @param {String|RegExp} route - Template of the route that should be append.
   *  to the client type
   *
   * @example
   * ```
   * // allow `conductor` clients to connect to `http://site.com/conductor/1`
   * server.registerRoute('conductor', '/:param')
   * ```
   */
  defineRoute: function defineRoute(clientType, route) {
    this._routes[clientType] = route;
  },


  /**
   * Function used by activities to register themselves as active activities
   * @param {Activity} activity - Activity to be registered.
   * @private
   */
  setActivity: function setActivity(activity) {
    this._activities.add(activity);
  },


  /**
   * Initialize the server with the given configuration.
   * @param {module:soundworks/server.server~serverConfig} config -
   *  Configuration of the application.
   */
  init: function init(config) {
    this.config = config;
  },


  /**
   * Start the application:
   * - launch the http(s) server.
   * - launch the socket server.
   * - start all registered activities.
   * - define routes and activities mapping for all client types.
   */
  start: function start() {
    var _this = this;

    this._populateDefaultConfig();

    if (this.config.logger !== undefined) _logger2.default.init(this.config.logger);

    // configure express
    var expressApp = new _express2.default();
    expressApp.set('port', process.env.PORT || this.config.port);
    expressApp.set('view engine', 'ejs');

    // compression
    if (this.config.enableGZipCompression) expressApp.use((0, _compression2.default)());

    // public folder
    expressApp.use(_express2.default.static(this.config.publicDirectory));

    // use https
    var useHttps = this.config.useHttps || false;
    // launch http(s) server
    if (!useHttps) {
      this._runServer(expressApp);
    } else {
      var httpsInfos = this.config.httpsInfos;

      // use given certificate
      if (httpsInfos.key && httpsInfos.cert) {
        var key = _fs2.default.readFileSync(httpsInfos.key);
        var cert = _fs2.default.readFileSync(httpsInfos.cert);

        this._runSecureServer(expressApp, key, cert);
        // generate certificate on the fly (for development purposes)
      } else {
        _pem2.default.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
          _this._runSecureServer(expressApp, keys.serviceKey, keys.certificate);
        });
      }
    }
  },


  /**
  * Populate mandatory configuration options
  * @private
  */
  _populateDefaultConfig: function _populateDefaultConfig() {
    if (this.config.port === undefined) this.config.port = 8000;

    if (this.config.enableGZipCompression === undefined) this.config.enableGZipCompression = true;

    if (this.config.publicDirectory === undefined) this.config.publicDirectory = _path2.default.join(process.cwd(), 'public');

    if (this.config.templateDirectory === undefined) this.config.templateDirectory = _path2.default.join(process.cwd(), 'html');

    if (this.config.defaultClient === undefined) this.config.defaultClient = 'player';

    if (this.config.websockets === undefined) this.config.websockets = {};
  },


  /**
   * Map client types with an activity.
   * @param {Array<String>} clientTypes - List of client type.
   * @param {Activity} activity - Activity concerned with the given `clientTypes`.
   * @private
   */
  _mapClientTypesToActivity: function _mapClientTypesToActivity(clientTypes, activity) {
    var _this2 = this;

    clientTypes.forEach(function (clientType) {
      if (!_this2._clientTypeActivitiesMap[clientType]) _this2._clientTypeActivitiesMap[clientType] = new _set2.default();

      _this2._clientTypeActivitiesMap[clientType].add(activity);
    });
  },


  /**
   * Init websocket server.
   * @private
   */
  _initSockets: function _initSockets(httpServer) {
    var _this3 = this;

    // merge socket.io configuration for cordova
    // @todo - move to template
    if (this.config.cordova && this.config.cordova.websockets) this.config.cordova.websockets = (0, _assign2.default)({}, this.config.websockets, this.config.cordova.websockets);

    _sockets2.default.init(httpServer, this.config.websockets);
    // socket connnection
    _sockets2.default.onConnection(this.clientTypes, function (clientType, socket) {
      _this3._onSocketConnection(clientType, socket);
    });
  },


  /**
   * Launch a http server.
   * @private
   */
  _runServer: function _runServer(expressApp) {
    var _this4 = this;

    var httpServer = _http2.default.createServer(expressApp);

    this._initActivities();
    this._initRouting(expressApp);

    httpServer.listen(expressApp.get('port'), function () {
      _this4._address = 'http://127.0.0.1:' + expressApp.get('port');
      console.log('[HTTP SERVER] Server listening on', _this4._address);
    });

    this._initSockets(httpServer);
  },


  /**
   * Launch a https server.
   * @private
   */
  _runSecureServer: function _runSecureServer(expressApp, key, cert) {
    var _this5 = this;

    var httpsServer = _https2.default.createServer({ key: key, cert: cert }, expressApp);

    this._initActivities();
    this._initRouting(expressApp);

    httpsServer.listen(expressApp.get('port'), function () {
      _this5._address = 'https://127.0.0.1:' + expressApp.get('port');
      console.log('[HTTPS SERVER] Server listening on', _this5._address);
    });

    this._initSockets(httpsServer);
  },


  /**
   * Map activities to their respective client type(s) and start them all.
   * @private
   */
  _initActivities: function _initActivities() {
    var _this6 = this;

    this._activities.forEach(function (activity) {
      _this6._mapClientTypesToActivity(activity.clientTypes, activity);
    });

    this._activities.forEach(function (activity) {
      return activity.start();
    });
  },


  /**
   * Init routing for each client. The default client must be opened last.
   * @private
   */
  _initRouting: function _initRouting(expressApp) {
    for (var clientType in this._clientTypeActivitiesMap) {
      if (clientType !== this.config.defaultClient) this._openClientRoute(clientType, expressApp);
    }

    for (var _clientType in this._clientTypeActivitiesMap) {
      if (_clientType === this.config.defaultClient) this._openClientRoute(_clientType, expressApp);
    }
  },


  /**
   * Open the route for the given client.
   * @private
   */
  _openClientRoute: function _openClientRoute(clientType, expressApp) {
    var _this7 = this;

    var route = '';

    if (this._routes[clientType]) route += this._routes[clientType];

    if (clientType !== this.config.defaultClient) route = '/' + clientType + route;

    // define template filename: `${clientType}.ejs` or `default.ejs`
    var templateDirectory = this.config.templateDirectory;
    var clientTmpl = _path2.default.join(templateDirectory, clientType + '.ejs');
    var defaultTmpl = _path2.default.join(templateDirectory, 'default.ejs');

    _fs2.default.stat(clientTmpl, function (err, stats) {
      var template = void 0;

      if (err || !stats.isFile()) template = defaultTmpl;else template = clientTmpl;

      var tmplString = _fs2.default.readFileSync(template, { encoding: 'utf8' });
      var tmpl = _ejs2.default.compile(tmplString);

      // http request
      expressApp.get(route, function (req, res) {
        var data = _this7._clientConfigDefinition(clientType, _this7.config, req);
        var appIndex = tmpl({ data: data });
        res.send(appIndex);
      });
    });
  },


  /**
   * Socket connection callback.
   * @private
   */
  _onSocketConnection: function _onSocketConnection(clientType, socket) {
    var _this8 = this;

    var client = new _Client2.default(clientType, socket);
    var activities = this._clientTypeActivitiesMap[clientType];

    // global lifecycle of the client
    _sockets2.default.receive(client, 'disconnect', function () {
      activities.forEach(function (activity) {
        return activity.disconnect(client);
      });
      client.destroy();

      if (_logger2.default.info) _logger2.default.info({ socket: socket, clientType: clientType }, 'disconnect');
    });

    // check coherence between client-side and server-side service requirements
    var serverRequiredServices = _serviceManager2.default.getRequiredServices(clientType);
    var serverServicesList = _serviceManager2.default.getServiceList();

    _sockets2.default.receive(client, 'handshake', function (data) {
      if (_this8.config.env !== 'production') {
        var clientRequiredServices = data.requiredServices || [];
        var missingServices = [];

        clientRequiredServices.forEach(function (serviceId) {
          if (serverServicesList.indexOf(serviceId) !== -1 && serverRequiredServices.indexOf(serviceId) === -1) {
            missingServices.push(serviceId);
          }
        });

        if (missingServices.length > 0) {
          _sockets2.default.send(client, 'client:error', {
            type: 'services',
            data: missingServices
          });
          return;
        }
      }

      client.urlParams = data.urlParams;
      // @todo - handle reconnection (ex: `data` contains an `uuid`)
      activities.forEach(function (activity) {
        return activity.connect(client);
      });
      _sockets2.default.send(client, 'client:start', client.uuid);

      if (_logger2.default.info) _logger2.default.info({ socket: socket, clientType: clientType }, 'handshake');
    });
  }
};

exports.default = server;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcnZlci5qcyJdLCJuYW1lcyI6WyJzZXJ2ZXIiLCJjb25maWciLCJfYWRkcmVzcyIsIl9jbGllbnRUeXBlQWN0aXZpdGllc01hcCIsIl9hY3Rpdml0aWVzIiwiX3JvdXRlcyIsImNsaWVudFR5cGVzIiwicmVxdWlyZSIsImlkIiwib3B0aW9ucyIsIl9jbGllbnRDb25maWdEZWZpbml0aW9uIiwiY2xpZW50VHlwZSIsInNlcnZlckNvbmZpZyIsImh0dHBSZXF1ZXN0Iiwic2V0Q2xpZW50Q29uZmlnRGVmaW5pdGlvbiIsImZ1bmMiLCJkZWZpbmVSb3V0ZSIsInJvdXRlIiwic2V0QWN0aXZpdHkiLCJhY3Rpdml0eSIsImFkZCIsImluaXQiLCJzdGFydCIsIl9wb3B1bGF0ZURlZmF1bHRDb25maWciLCJsb2dnZXIiLCJ1bmRlZmluZWQiLCJleHByZXNzQXBwIiwic2V0IiwicHJvY2VzcyIsImVudiIsIlBPUlQiLCJwb3J0IiwiZW5hYmxlR1ppcENvbXByZXNzaW9uIiwidXNlIiwic3RhdGljIiwicHVibGljRGlyZWN0b3J5IiwidXNlSHR0cHMiLCJfcnVuU2VydmVyIiwiaHR0cHNJbmZvcyIsImtleSIsImNlcnQiLCJyZWFkRmlsZVN5bmMiLCJfcnVuU2VjdXJlU2VydmVyIiwiY3JlYXRlQ2VydGlmaWNhdGUiLCJkYXlzIiwic2VsZlNpZ25lZCIsImVyciIsImtleXMiLCJzZXJ2aWNlS2V5IiwiY2VydGlmaWNhdGUiLCJqb2luIiwiY3dkIiwidGVtcGxhdGVEaXJlY3RvcnkiLCJkZWZhdWx0Q2xpZW50Iiwid2Vic29ja2V0cyIsIl9tYXBDbGllbnRUeXBlc1RvQWN0aXZpdHkiLCJmb3JFYWNoIiwiX2luaXRTb2NrZXRzIiwiaHR0cFNlcnZlciIsImNvcmRvdmEiLCJvbkNvbm5lY3Rpb24iLCJzb2NrZXQiLCJfb25Tb2NrZXRDb25uZWN0aW9uIiwiY3JlYXRlU2VydmVyIiwiX2luaXRBY3Rpdml0aWVzIiwiX2luaXRSb3V0aW5nIiwibGlzdGVuIiwiZ2V0IiwiY29uc29sZSIsImxvZyIsImh0dHBzU2VydmVyIiwiX29wZW5DbGllbnRSb3V0ZSIsImNsaWVudFRtcGwiLCJkZWZhdWx0VG1wbCIsInN0YXQiLCJzdGF0cyIsInRlbXBsYXRlIiwiaXNGaWxlIiwidG1wbFN0cmluZyIsImVuY29kaW5nIiwidG1wbCIsImNvbXBpbGUiLCJyZXEiLCJyZXMiLCJkYXRhIiwiYXBwSW5kZXgiLCJzZW5kIiwiY2xpZW50IiwiYWN0aXZpdGllcyIsInJlY2VpdmUiLCJkaXNjb25uZWN0IiwiZGVzdHJveSIsImluZm8iLCJzZXJ2ZXJSZXF1aXJlZFNlcnZpY2VzIiwiZ2V0UmVxdWlyZWRTZXJ2aWNlcyIsInNlcnZlclNlcnZpY2VzTGlzdCIsImdldFNlcnZpY2VMaXN0IiwiY2xpZW50UmVxdWlyZWRTZXJ2aWNlcyIsInJlcXVpcmVkU2VydmljZXMiLCJtaXNzaW5nU2VydmljZXMiLCJzZXJ2aWNlSWQiLCJpbmRleE9mIiwicHVzaCIsImxlbmd0aCIsInR5cGUiLCJ1cmxQYXJhbXMiLCJjb25uZWN0IiwidXVpZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3RUE7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtCQSxJQUFNQSxTQUFTO0FBQ2I7Ozs7OztBQU1BQyxVQUFRLEVBUEs7O0FBU2I7Ozs7QUFJQUMsWUFBVSxFQWJHOztBQWViOzs7O0FBSUFDLDRCQUEwQixFQW5CYjs7QUFxQmI7Ozs7QUFJQUMsZUFBYSxtQkF6QkE7O0FBMkJiOzs7OztBQUtBQyxXQUFTLEVBaENJOztBQWtDYixNQUFJQyxXQUFKLEdBQWtCO0FBQ2hCLFdBQU8sb0JBQVksS0FBS0gsd0JB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LElBQ0FQLHVCQUF1QlEsT0FBdkIsQ0FBK0JELFNBQS9CLE1BQThDLENBQUMsQ0FGakQsRUFHRTtBQUNBRCw0QkFBZ0JHLElBQWhCLENBQXFCRixTQUFyQjtBQUNEO0FBQ0YsU0FQRDs7QUFTQSxZQUFJRCxnQkFBZ0JJLE1BQWhCLEdBQXlCLENBQTdCLEVBQWdDO0FBQzlCLDRCQUFRakIsSUFBUixDQUFhQyxNQUFiLEVBQXFCLGNBQXJCLEVBQXFDO0FBQ25DaUIsa0JBQU0sVUFENkI7QUFFbkNwQixrQkFBTWU7QUFGNkIsV0FBckM7QUFJQTtBQUNEO0FBQ0Y7O0FBRURaLGFBQU9rQixTQUFQLEdBQW1CckIsS0FBS3FCLFNBQXhCO0FBQ0E7QUFDQWpCLGlCQUFXaEMsT0FBWCxDQUFtQixVQUFDckMsUUFBRDtBQUFBLGVBQWNBLFNBQVN1RixPQUFULENBQWlCbkIsTUFBakIsQ0FBZDtBQUFBLE9BQW5CO0FBQ0Esd0JBQVFELElBQVIsQ0FBYUMsTUFBYixFQUFxQixjQUFyQixFQUFxQ0EsT0FBT29CLElBQTVDOztBQUVBLFVBQUksaUJBQU9mLElBQVgsRUFDRSxpQkFBT0EsSUFBUCxDQUFZLEVBQUUvQixjQUFGLEVBQVVsRCxzQkFBVixFQUFaLEVBQW9DLFdBQXBDO0FBQ0gsS0E5QkQ7QUErQkQ7QUFoWFksQ0FBZjs7a0JBbVhlWCxNIiwiZmlsZSI6InNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDbGllbnQgZnJvbSAnLi9DbGllbnQnO1xuaW1wb3J0IGNvbXByZXNzaW9uIGZyb20gJ2NvbXByZXNzaW9uJztcbmltcG9ydCBlanMgZnJvbSAnZWpzJztcbmltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBodHRwIGZyb20gJ2h0dHAnO1xuaW1wb3J0IGh0dHBzIGZyb20gJ2h0dHBzJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHBlbSBmcm9tICdwZW0nO1xuaW1wb3J0IHNlcnZpY2VNYW5hZ2VyIGZyb20gJy4vc2VydmljZU1hbmFnZXInO1xuaW1wb3J0IHNvY2tldHMgZnJvbSAnLi9zb2NrZXRzJztcblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBtb2R1bGU6c291bmR3b3Jrcy9zZXJ2ZXIuc2VydmVyfnNlcnZlckNvbmZpZ1xuICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL3NlcnZlci5zZXJ2ZXJcbiAqXG4gKiBAcHJvcGVydHkge1N0cmluZ30gYXBwTmFtZSAtIE5hbWUgb2YgdGhlIGFwcGxpY2F0aW9uLCB1c2VkIGluIHRoZSBgLmVqc2BcbiAqICB0ZW1wbGF0ZSBhbmQgYnkgZGVmYXVsdCBpbiB0aGUgYHBsYXRmb3JtYCBzZXJ2aWNlIHRvIHBvcHVsYXRlIGl0cyB2aWV3LlxuICogQHByb3BlcnR5IHtTdHJpbmd9IGVudiAtIE5hbWUgb2YgdGhlIGVudmlyb25uZW1lbnQgKCdwcm9kdWN0aW9uJyBlbmFibGVcbiAqICBjYWNoZSBpbiBleHByZXNzIGFwcGxpY2F0aW9uKS5cbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSB2ZXJzaW9uIC0gVmVyc2lvbiBvZiBhcHBsaWNhdGlvbiwgY2FuIGJlIHVzZWQgdG8gZm9yY2VcbiAqICByZWxvYWQgY3NzIGFuZCBqcyBmaWxlcyBmcm9tIHNlcnZlciAoY2YuIGBodG1sL2RlZmF1bHQuZWpzYClcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkZWZhdWx0Q2xpZW50IC0gTmFtZSBvZiB0aGUgZGVmYXVsdCBjbGllbnQgdHlwZSxcbiAqICBpLmUuIHRoZSBjbGllbnQgdGhhdCBjYW4gYWNjZXNzIHRoZSBhcHBsaWNhdGlvbiBhdCBpdHMgcm9vdCBVUkxcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBhc3NldHNEb21haW4gLSBEZWZpbmUgZnJvbSB3aGVyZSB0aGUgYXNzZXRzIChzdGF0aWMgZmlsZXMpXG4gKiAgc2hvdWxkIGJlIGxvYWRlZCwgdGhpcyB2YWx1ZSBjYW4gcmVmZXIgdG8gYSBzZXBhcmF0ZSBzZXJ2ZXIgZm9yIHNjYWxhYmlsaXR5LlxuICogIFRoZSB2YWx1ZSBzaG91bGQgYmUgdXNlZCBjbGllbnQtc2lkZSB0byBjb25maWd1cmUgdGhlIGBhdWRpby1idWZmZXItbWFuYWdlcmBcbiAqICBzZXJ2aWNlLlxuICogQHByb3BlcnR5IHtOdW1iZXJ9IHBvcnQgLSBQb3J0IHVzZWQgdG8gb3BlbiB0aGUgaHR0cCBzZXJ2ZXIsIGluIHByb2R1Y3Rpb25cbiAqICB0aGlzIHZhbHVlIGlzIHR5cGljYWxseSA4MFxuICpcbiAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBzZXR1cCAtIERlc2NyaWJlIHRoZSBsb2NhdGlvbiB3aGVyZSB0aGUgZXhwZXJpZW5jZSB0YWtlc1xuICogIHBsYWNlcywgdGhlc2VzIHZhbHVlcyBhcmUgdXNlZCBieSB0aGUgYHBsYWNlcmAsIGBjaGVja2luYCBhbmQgYGxvY2F0b3JgXG4gKiAgc2VydmljZXMuIElmIG9uZSBvZiB0aGVzZSBzZXJ2aWNlIGlzIHJlcXVpcmVkLCB0aGlzIGVudHJ5IG1hbmRhdG9yeS5cbiAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBzZXR1cC5hcmVhIC0gRGVzY3JpcHRpb24gb2YgdGhlIGFyZWEuXG4gKiBAcHJvcGVydHkge051bWJlcn0gc2V0dXAuYXJlYS53aWR0aCAtIFdpZHRoIG9mIHRoZSBhcmVhLlxuICogQHByb3BlcnR5IHtOdW1iZXJ9IHNldHVwLmFyZWEuaGVpZ2h0IC0gSGVpZ2h0IG9mIHRoZSBhcmVhLlxuICogQHByb3BlcnR5IHtTdHJpbmd9IHNldHVwLmFyZWEuYmFja2dyb3VuZCAtIFBhdGggdG8gYW4gaW1hZ2UgdG8gYmUgdXNlZCBpblxuICogIHRoZSBhcmVhIHJlcHJlc2VudGF0aW9uLlxuICogQHByb3BlcnR5IHtBcnJheX0gc2V0dXAubGFiZWxzIC0gT3B0aW9ubmFsIGxpc3Qgb2YgcHJlZGVmaW5lZCBsYWJlbHMuXG4gKiBAcHJvcGVydHkge0FycmF5fSBzZXR1cC5jb29yZGluYXRlcyAtIE9wdGlvbm5hbCBsaXN0IG9mIHByZWRlZmluZWQgY29vcmRpbmF0ZXMuXG4gKiBAcHJvcGVydHkge0FycmF5fSBzZXR1cC5tYXhDbGllbnRzUGVyUG9zaXRpb24gLSBNYXhpbXVtIG51bWJlciBvZiBjbGllbnRzXG4gKiAgYWxsb3dlZCBpbiBhIHBvc2l0aW9uLlxuICogQHByb3BlcnR5IHtOdW1iZXJ9IHNldHVwLmNhcGFjaXR5IC0gTWF4aW11bSBudW1iZXIgb2YgcG9zaXRpb25zIChtYXkgbGltaXRcbiAqIG9yIGJlIGxpbWl0ZWQgYnkgdGhlIG51bWJlciBvZiBsYWJlbHMgYW5kL29yIGNvb3JkaW5hdGVzKS5cbiAqXG4gKiBAcHJvcGVydHkge09iamVjdH0gd2Vic29ja2V0cyAtIFdlYnNvY2tldHMgY29uZmlndXJhdGlvbiAoc29ja2V0LmlvKVxuICogQHByb3BlcnR5IHtTdHJpbmd9IHdlYnNvY2tldHMudXJsIC0gT3B0aW9ubmFsIHVybCB3aGVyZSB0aGUgc29ja2V0IHNob3VsZFxuICogIGNvbm5lY3QuXG4gKiBAcHJvcGVydHkge0FycmF5fSB3ZWJzb2NrZXRzLnRyYW5zcG9ydHMgLSBMaXN0IG9mIHRoZSB0cmFuc3BvcnQgbWVjYW5pbXMgdGhhdFxuICogIHNob3VsZCBiZSB1c2VkIHRvIG9wZW4gb3IgZW11bGF0ZSB0aGUgc29ja2V0LlxuICpcbiAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gdXNlSHR0cHMgLSAgRGVmaW5lIGlmIHRoZSBIVFRQIHNlcnZlciBzaG91bGQgYmUgbGF1bmNoZWRcbiAqICB1c2luZyBzZWN1cmUgY29ubmVjdGlvbnMuIEZvciBkZXZlbG9wbWVudCBwdXJwb3NlcyB3aGVuIHNldCB0byBgdHJ1ZWAgYW5kIG5vXG4gKiAgY2VydGlmaWNhdGVzIGFyZSBnaXZlbiAoY2YuIGBodHRwc0luZm9zYCksIGEgc2VsZi1zaWduZWQgY2VydGlmaWNhdGUgaXNcbiAqICBjcmVhdGVkLlxuICogQHByb3BlcnR5IHtPYmplY3R9IGh0dHBzSW5mb3MgLSBQYXRocyB0byB0aGUga2V5IGFuZCBjZXJ0aWZpY2F0ZSB0byBiZSB1c2VkXG4gKiAgaW4gb3JkZXIgdG8gbGF1bmNoIHRoZSBodHRwcyBzZXJ2ZXIuIEJvdGggZW50cmllcyBhcmUgcmVxdWlyZWQgb3RoZXJ3aXNlIGFcbiAqICBzZWxmLXNpZ25lZCBjZXJ0aWZpY2F0ZSBpcyBnZW5lcmF0ZWQuXG4gKiBAcHJvcGVydHkge1N0cmluZ30gaHR0cHNJbmZvcy5jZXJ0IC0gUGF0aCB0byB0aGUgY2VydGlmaWNhdGUuXG4gKiBAcHJvcGVydHkge1N0cmluZ30gaHR0cHNJbmZvcy5rZXkgLSBQYXRoIHRvIHRoZSBrZXkuXG4gKlxuICogQHByb3BlcnR5IHtTdHJpbmd9IHBhc3N3b3JkIC0gUGFzc3dvcmQgdG8gYmUgdXNlZCBieSB0aGUgYGF1dGhgIHNlcnZpY2UuXG4gKlxuICogQHByb3BlcnR5IHtPYmplY3R9IG9zYyAtIENvbmZpZ3VyYXRpb24gb2YgdGhlIGBvc2NgIHNlcnZpY2UuXG4gKiBAcHJvcGVydHkge1N0cmluZ30gb3NjLnJlY2VpdmVBZGRyZXNzIC0gSVAgb2YgdGhlIGN1cnJlbnRseSBydW5uaW5nIHNlcnZlci5cbiAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBvc2MucmVjZWl2ZVBvcnQgLSBQb3J0IGxpc3RlbmluZyBmb3IgaW5jb21taW5nIG1lc3NhZ2VzLlxuICogQHByb3BlcnR5IHtTdHJpbmd9IG9zYy5zZW5kQWRkcmVzcyAtIElQIG9mIHRoZSByZW1vdGUgYXBwbGljYXRpb24uXG4gKiBAcHJvcGVydHkge051bWJlcn0gb3NjLnNlbmRQb3J0IC0gUG9ydCB3aGVyZSB0aGUgcmVtb3RlIGFwcGxpY2F0aW9uIGlzXG4gKiAgbGlzdGVuaW5nIGZvciBtZXNzYWdlc1xuICpcbiAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gZW5hYmxlR1ppcENvbXByZXNzaW9uIC0gRGVmaW5lIGlmIHRoZSBzZXJ2ZXIgc2hvdWxkIHVzZVxuICogIGd6aXAgY29tcHJlc3Npb24gZm9yIHN0YXRpYyBmaWxlcy5cbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBwdWJsaWNEaXJlY3RvcnkgLSBMb2NhdGlvbiBvZiB0aGUgcHVibGljIGRpcmVjdG9yeVxuICogIChhY2Nlc3NpYmxlIHRocm91Z2ggaHR0cChzKSByZXF1ZXN0cykuXG4gKiBAcHJvcGVydHkge1N0cmluZ30gdGVtcGxhdGVEaXJlY3RvcnkgLSBEaXJlY3Rvcnkgd2hlcmUgdGhlIHNlcnZlciB0ZW1wbGF0aW5nXG4gKiAgc3lzdGVtIGxvb2tzIGZvciB0aGUgYGVqc2AgdGVtcGxhdGVzLlxuICogQHByb3BlcnR5IHtPYmplY3R9IGxvZ2dlciAtIENvbmZpZ3VyYXRpb24gb2YgdGhlIGxvZ2dlciBzZXJ2aWNlLCBjZi4gQnVueWFuXG4gKiAgZG9jdW1lbnRhdGlvbi5cbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBlcnJvclJlcG9ydGVyRGlyZWN0b3J5IC0gRGlyZWN0b3J5IHdoZXJlIGVycm9yIHJlcG9ydGVkXG4gKiAgZnJvbSB0aGUgY2xpZW50cyBhcmUgd3JpdHRlbi5cbiAqL1xuXG5cbi8qKlxuICogU2VydmVyIHNpZGUgZW50cnkgcG9pbnQgZm9yIGEgYHNvdW5kd29ya3NgIGFwcGxpY2F0aW9uLlxuICpcbiAqIFRoaXMgb2JqZWN0IGhvc3RzIGNvbmZpZ3VyYXRpb24gaW5mb3JtYXRpb25zLCBhcyB3ZWxsIGFzIG1ldGhvZHMgdG9cbiAqIGluaXRpYWxpemUgYW5kIHN0YXJ0IHRoZSBhcHBsaWNhdGlvbi4gSXQgaXMgYWxzbyByZXNwb25zaWJsZSBmb3IgY3JlYXRpbmdcbiAqIHRoZSBzdGF0aWMgZmlsZSAoaHR0cCkgc2VydmVyIGFzIHdlbGwgYXMgdGhlIHNvY2tldCBzZXJ2ZXIuXG4gKlxuICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL3NlcnZlclxuICogQG5hbWVzcGFjZVxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3Mvc2VydmVyJztcbiAqIGltcG9ydCBNeUV4cGVyaWVuY2UgZnJvbSAnLi9NeUV4cGVyaWVuY2UnO1xuICpcbiAqIHNvdW5kd29ya3Muc2VydmVyLmluaXQoY29uZmlnKTtcbiAqIGNvbnN0IG15RXhwZXJpZW5jZSA9IG5ldyBNeUV4cGVyaWVuY2UoKTtcbiAqIHNvdW5kd29ya3Muc2VydmVyLnN0YXJ0KCk7XG4gKi9cbmNvbnN0IHNlcnZlciA9IHtcbiAgLyoqXG4gICAqIENvbmZpZ3VyYXRpb24gaW5mb3JtYXRpb25zLCBhbGwgY29uZmlnIG9iamVjdHMgcGFzc2VkIHRvIHRoZVxuICAgKiBbYHNlcnZlci5pbml0YF17QGxpbmsgbW9kdWxlOnNvdW5kd29ya3Mvc2VydmVyLnNlcnZlci5pbml0fSBhcmUgbWVyZ2VkXG4gICAqIGludG8gdGhpcyBvYmplY3QuXG4gICAqIEB0eXBlIHttb2R1bGU6c291bmR3b3Jrcy9zZXJ2ZXIuc2VydmVyfnNlcnZlckNvbmZpZ31cbiAgICovXG4gIGNvbmZpZzoge30sXG5cbiAgLyoqXG4gICAqIFRoZSB1cmwgb2YgdGhlIG5vZGUgc2VydmVyIG9uIHRoZSBjdXJyZW50IG1hY2hpbmUuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYWRkcmVzczogJycsXG5cbiAgLyoqXG4gICAqIE1hcHBpbmcgYmV0d2VlbiBhIGBjbGllbnRUeXBlYCBhbmQgaXRzIHJlbGF0ZWQgYWN0aXZpdGllcy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9jbGllbnRUeXBlQWN0aXZpdGllc01hcDoge30sXG5cbiAgLyoqXG4gICAqIFJlcXVpcmVkIGFjdGl2aXRpZXMgdGhhdCBtdXN0IGJlIHN0YXJ0ZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYWN0aXZpdGllczogbmV3IFNldCgpLFxuXG4gIC8qKlxuICAgKiBPcHRpb25uYWwgcm91dGluZyBkZWZpbmVkIGZvciBlYWNoIGNsaWVudC5cbiAgICogQHByaXZhdGVcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIF9yb3V0ZXM6IHt9LFxuXG4gIGdldCBjbGllbnRUeXBlcygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5fY2xpZW50VHlwZUFjdGl2aXRpZXNNYXApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBzZXJ2aWNlIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gSWRlbnRpZmllciBvZiB0aGUgc2VydmljZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPcHRpb25zIHRvIGNvbmZpZ3VyZSB0aGUgc2VydmljZS5cbiAgICovXG4gIHJlcXVpcmUoaWQsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gc2VydmljZU1hbmFnZXIucmVxdWlyZShpZCwgbnVsbCwgb3B0aW9ucyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIERlZmF1bHQgZm9yIHRoZSBtb2R1bGU6c291bmR3b3Jrcy9zZXJ2ZXIuc2VydmVyfmNsaWVudENvbmZpZ0RlZmluaXRpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9jbGllbnRDb25maWdEZWZpbml0aW9uOiAoY2xpZW50VHlwZSwgc2VydmVyQ29uZmlnLCBodHRwUmVxdWVzdCkgPT4ge1xuICAgIHJldHVybiB7IGNsaWVudFR5cGUgfTtcbiAgfSxcblxuICAvKipcbiAgICogQGNhbGxiYWNrIG1vZHVsZTpzb3VuZHdvcmtzL3NlcnZlci5zZXJ2ZXJ+Y2xpZW50Q29uZmlnRGVmaW5pdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gY2xpZW50VHlwZSAtIFR5cGUgb2YgdGhlIGNsaWVudC5cbiAgICogQHBhcmFtIHtPYmplY3R9IHNlcnZlckNvbmZpZyAtIENvbmZpZ3VyYXRpb24gb2YgdGhlIHNlcnZlci5cbiAgICogQHBhcmFtIHtPYmplY3R9IGh0dHBSZXF1ZXN0IC0gSHR0cCByZXF1ZXN0IGZvciB0aGUgYGluZGV4Lmh0bWxgXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG4gIC8qKlxuICAgKiBTZXQgdGhlIHtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9zZXJ2ZXIuc2VydmVyfmNsaWVudENvbmZpZ0RlZmluaXRpb259IHdpdGhcbiAgICogYSB1c2VyIGRlZmluZWQgZnVuY3Rpb24uXG4gICAqIEBwYXJhbSB7bW9kdWxlOnNvdW5kd29ya3Mvc2VydmVyLnNlcnZlcn5jbGllbnRDb25maWdEZWZpbml0aW9ufSBmdW5jIC0gQVxuICAgKiAgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBkYXRhIHRoYXQgd2lsbCBiZSB1c2VkIHRvIHBvcHVsYXRlIHRoZSBgaW5kZXguaHRtbGBcbiAgICogIHRlbXBsYXRlLiBUaGUgZnVuY3Rpb24gY291bGQgKGFuZCBzaG91bGQpIGJlIHVzZWQgdG8gcGFzcyBjb25maWd1cmF0aW9uXG4gICAqICB0byB0aGUgc291bmR3b3JrcyBjbGllbnQuXG4gICAqIEBzZWUge0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5jbGllbnR+aW5pdH1cbiAgICovXG4gIHNldENsaWVudENvbmZpZ0RlZmluaXRpb24oZnVuYykge1xuICAgIHRoaXMuX2NsaWVudENvbmZpZ0RlZmluaXRpb24gPSBmdW5jO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIHJvdXRlIGZvciBhIGdpdmVuIGBjbGllbnRUeXBlYCwgYWxsb3cgdG8gZGVmaW5lIGEgbW9yZSBjb21wbGV4XG4gICAqIHJvdXRpbmcgKGFkZGl0aW9ubmFsIHJvdXRlIHBhcmFtZXRlcnMpIGZvciBhIGdpdmVuIHR5cGUgb2YgY2xpZW50LlxuICAgKiBAcGFyYW0ge1N0cmluZ30gY2xpZW50VHlwZSAtIFR5cGUgb2YgdGhlIGNsaWVudC5cbiAgICogQHBhcmFtIHtTdHJpbmd8UmVnRXhwfSByb3V0ZSAtIFRlbXBsYXRlIG9mIHRoZSByb3V0ZSB0aGF0IHNob3VsZCBiZSBhcHBlbmQuXG4gICAqICB0byB0aGUgY2xpZW50IHR5cGVcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYGBgXG4gICAqIC8vIGFsbG93IGBjb25kdWN0b3JgIGNsaWVudHMgdG8gY29ubmVjdCB0byBgaHR0cDovL3NpdGUuY29tL2NvbmR1Y3Rvci8xYFxuICAgKiBzZXJ2ZXIucmVnaXN0ZXJSb3V0ZSgnY29uZHVjdG9yJywgJy86cGFyYW0nKVxuICAgKiBgYGBcbiAgICovXG4gIGRlZmluZVJvdXRlKGNsaWVudFR5cGUsIHJvdXRlKSB7XG4gICAgdGhpcy5fcm91dGVzW2NsaWVudFR5cGVdID0gcm91dGU7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHVzZWQgYnkgYWN0aXZpdGllcyB0byByZWdpc3RlciB0aGVtc2VsdmVzIGFzIGFjdGl2ZSBhY3Rpdml0aWVzXG4gICAqIEBwYXJhbSB7QWN0aXZpdHl9IGFjdGl2aXR5IC0gQWN0aXZpdHkgdG8gYmUgcmVnaXN0ZXJlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNldEFjdGl2aXR5KGFjdGl2aXR5KSB7XG4gICAgdGhpcy5fYWN0aXZpdGllcy5hZGQoYWN0aXZpdHkpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHRoZSBzZXJ2ZXIgd2l0aCB0aGUgZ2l2ZW4gY29uZmlndXJhdGlvbi5cbiAgICogQHBhcmFtIHttb2R1bGU6c291bmR3b3Jrcy9zZXJ2ZXIuc2VydmVyfnNlcnZlckNvbmZpZ30gY29uZmlnIC1cbiAgICogIENvbmZpZ3VyYXRpb24gb2YgdGhlIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgaW5pdChjb25maWcpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgfSxcblxuICAvKipcbiAgICogU3RhcnQgdGhlIGFwcGxpY2F0aW9uOlxuICAgKiAtIGxhdW5jaCB0aGUgaHR0cChzKSBzZXJ2ZXIuXG4gICAqIC0gbGF1bmNoIHRoZSBzb2NrZXQgc2VydmVyLlxuICAgKiAtIHN0YXJ0IGFsbCByZWdpc3RlcmVkIGFjdGl2aXRpZXMuXG4gICAqIC0gZGVmaW5lIHJvdXRlcyBhbmQgYWN0aXZpdGllcyBtYXBwaW5nIGZvciBhbGwgY2xpZW50IHR5cGVzLlxuICAgKi9cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5fcG9wdWxhdGVEZWZhdWx0Q29uZmlnKCk7XG5cbiAgICBpZiAodGhpcy5jb25maWcubG9nZ2VyICE9PSB1bmRlZmluZWQpXG4gICAgICBsb2dnZXIuaW5pdCh0aGlzLmNvbmZpZy5sb2dnZXIpO1xuXG4gICAgLy8gY29uZmlndXJlIGV4cHJlc3NcbiAgICBjb25zdCBleHByZXNzQXBwID0gbmV3IGV4cHJlc3MoKTtcbiAgICBleHByZXNzQXBwLnNldCgncG9ydCcsIHByb2Nlc3MuZW52LlBPUlQgfHwgdGhpcy5jb25maWcucG9ydCk7XG4gICAgZXhwcmVzc0FwcC5zZXQoJ3ZpZXcgZW5naW5lJywgJ2VqcycpO1xuXG4gICAgLy8gY29tcHJlc3Npb25cbiAgICBpZiAodGhpcy5jb25maWcuZW5hYmxlR1ppcENvbXByZXNzaW9uKVxuICAgICAgZXhwcmVzc0FwcC51c2UoY29tcHJlc3Npb24oKSk7XG5cbiAgICAvLyBwdWJsaWMgZm9sZGVyXG4gICAgZXhwcmVzc0FwcC51c2UoZXhwcmVzcy5zdGF0aWModGhpcy5jb25maWcucHVibGljRGlyZWN0b3J5KSk7XG5cbiAgICAvLyB1c2UgaHR0cHNcbiAgICBjb25zdCB1c2VIdHRwcyA9IHRoaXMuY29uZmlnLnVzZUh0dHBzIHx8wqBmYWxzZTtcbiAgICAvLyBsYXVuY2ggaHR0cChzKSBzZXJ2ZXJcbiAgICBpZiAoIXVzZUh0dHBzKSB7XG4gICAgICB0aGlzLl9ydW5TZXJ2ZXIoZXhwcmVzc0FwcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGh0dHBzSW5mb3MgPSB0aGlzLmNvbmZpZy5odHRwc0luZm9zO1xuXG4gICAgICAvLyB1c2UgZ2l2ZW4gY2VydGlmaWNhdGVcbiAgICAgIGlmIChodHRwc0luZm9zLmtleSAmJiBodHRwc0luZm9zLmNlcnQpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gZnMucmVhZEZpbGVTeW5jKGh0dHBzSW5mb3Mua2V5KTtcbiAgICAgICAgY29uc3QgY2VydCA9IGZzLnJlYWRGaWxlU3luYyhodHRwc0luZm9zLmNlcnQpO1xuXG4gICAgICAgIHRoaXMuX3J1blNlY3VyZVNlcnZlcihleHByZXNzQXBwLCBrZXksIGNlcnQpO1xuICAgICAgLy8gZ2VuZXJhdGUgY2VydGlmaWNhdGUgb24gdGhlIGZseSAoZm9yIGRldmVsb3BtZW50IHB1cnBvc2VzKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGVtLmNyZWF0ZUNlcnRpZmljYXRlKHsgZGF5czogMSwgc2VsZlNpZ25lZDogdHJ1ZSB9LCAoZXJyLCBrZXlzKSA9PiB7XG4gICAgICAgICAgdGhpcy5fcnVuU2VjdXJlU2VydmVyKGV4cHJlc3NBcHAsIGtleXMuc2VydmljZUtleSwga2V5cy5jZXJ0aWZpY2F0ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAgLyoqXG4gICAqIFBvcHVsYXRlIG1hbmRhdG9yeSBjb25maWd1cmF0aW9uIG9wdGlvbnNcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9wb3B1bGF0ZURlZmF1bHRDb25maWcoKSB7XG4gICAgaWYgKHRoaXMuY29uZmlnLnBvcnQgPT09IHVuZGVmaW5lZClcbiAgICAgIMKgdGhpcy5jb25maWcucG9ydCA9IDgwMDA7XG5cbiAgICBpZiAodGhpcy5jb25maWcuZW5hYmxlR1ppcENvbXByZXNzaW9uID09PSB1bmRlZmluZWQpXG4gICAgICB0aGlzLmNvbmZpZy5lbmFibGVHWmlwQ29tcHJlc3Npb24gPSB0cnVlO1xuXG4gICAgaWYgKHRoaXMuY29uZmlnLnB1YmxpY0RpcmVjdG9yeSA9PT0gdW5kZWZpbmVkKVxuICAgICAgdGhpcy5jb25maWcucHVibGljRGlyZWN0b3J5ID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdwdWJsaWMnKTtcblxuICAgIGlmICh0aGlzLmNvbmZpZy50ZW1wbGF0ZURpcmVjdG9yeSA9PT0gdW5kZWZpbmVkKVxuICAgICAgdGhpcy5jb25maWcudGVtcGxhdGVEaXJlY3RvcnkgPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2h0bWwnKTtcblxuICAgIGlmICh0aGlzLmNvbmZpZy5kZWZhdWx0Q2xpZW50ID09PSB1bmRlZmluZWQpXG4gICAgICB0aGlzLmNvbmZpZy5kZWZhdWx0Q2xpZW50ID0gJ3BsYXllcic7XG5cbiAgICBpZiAodGhpcy5jb25maWcud2Vic29ja2V0cyA9PT0gdW5kZWZpbmVkKVxuICAgICAgdGhpcy5jb25maWcud2Vic29ja2V0cyA9IHt9O1xuICB9LFxuXG4gIC8qKlxuICAgKiBNYXAgY2xpZW50IHR5cGVzIHdpdGggYW4gYWN0aXZpdHkuXG4gICAqIEBwYXJhbSB7QXJyYXk8U3RyaW5nPn0gY2xpZW50VHlwZXMgLSBMaXN0IG9mIGNsaWVudCB0eXBlLlxuICAgKiBAcGFyYW0ge0FjdGl2aXR5fSBhY3Rpdml0eSAtIEFjdGl2aXR5IGNvbmNlcm5lZCB3aXRoIHRoZSBnaXZlbiBgY2xpZW50VHlwZXNgLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX21hcENsaWVudFR5cGVzVG9BY3Rpdml0eShjbGllbnRUeXBlcywgYWN0aXZpdHkpIHtcbiAgICBjbGllbnRUeXBlcy5mb3JFYWNoKChjbGllbnRUeXBlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuX2NsaWVudFR5cGVBY3Rpdml0aWVzTWFwW2NsaWVudFR5cGVdKVxuICAgICAgICB0aGlzLl9jbGllbnRUeXBlQWN0aXZpdGllc01hcFtjbGllbnRUeXBlXSA9IG5ldyBTZXQoKTtcblxuICAgICAgdGhpcy5fY2xpZW50VHlwZUFjdGl2aXRpZXNNYXBbY2xpZW50VHlwZV0uYWRkKGFjdGl2aXR5KTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogSW5pdCB3ZWJzb2NrZXQgc2VydmVyLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXRTb2NrZXRzKGh0dHBTZXJ2ZXIpIHtcbiAgICAvLyBtZXJnZSBzb2NrZXQuaW8gY29uZmlndXJhdGlvbiBmb3IgY29yZG92YVxuICAgIC8vIEB0b2RvIC0gbW92ZSB0byB0ZW1wbGF0ZVxuICAgIGlmICh0aGlzLmNvbmZpZy5jb3Jkb3ZhICYmIHRoaXMuY29uZmlnLmNvcmRvdmEud2Vic29ja2V0cylcbiAgICAgIHRoaXMuY29uZmlnLmNvcmRvdmEud2Vic29ja2V0cyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY29uZmlnLndlYnNvY2tldHMsIHRoaXMuY29uZmlnLmNvcmRvdmEud2Vic29ja2V0cyk7XG5cbiAgICBzb2NrZXRzLmluaXQoaHR0cFNlcnZlciwgdGhpcy5jb25maWcud2Vic29ja2V0cyk7XG4gICAgLy8gc29ja2V0IGNvbm5uZWN0aW9uXG4gICAgc29ja2V0cy5vbkNvbm5lY3Rpb24odGhpcy5jbGllbnRUeXBlcywgKGNsaWVudFR5cGUsIHNvY2tldCkgPT4ge1xuICAgICAgdGhpcy5fb25Tb2NrZXRDb25uZWN0aW9uKGNsaWVudFR5cGUsIHNvY2tldCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIExhdW5jaCBhIGh0dHAgc2VydmVyLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3J1blNlcnZlcihleHByZXNzQXBwKSB7XG4gICAgY29uc3QgaHR0cFNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKGV4cHJlc3NBcHApO1xuXG4gICAgdGhpcy5faW5pdEFjdGl2aXRpZXMoKTtcbiAgICB0aGlzLl9pbml0Um91dGluZyhleHByZXNzQXBwKTtcblxuICAgIGh0dHBTZXJ2ZXIubGlzdGVuKGV4cHJlc3NBcHAuZ2V0KCdwb3J0JyksICgpID0+IHtcbiAgICAgIHRoaXMuX2FkZHJlc3MgPSBgaHR0cDovLzEyNy4wLjAuMToke2V4cHJlc3NBcHAuZ2V0KCdwb3J0Jyl9YDtcbiAgICAgIGNvbnNvbGUubG9nKCdbSFRUUCBTRVJWRVJdIFNlcnZlciBsaXN0ZW5pbmcgb24nLCB0aGlzLl9hZGRyZXNzKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2luaXRTb2NrZXRzKGh0dHBTZXJ2ZXIpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBMYXVuY2ggYSBodHRwcyBzZXJ2ZXIuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcnVuU2VjdXJlU2VydmVyKGV4cHJlc3NBcHAsIGtleSwgY2VydCkge1xuICAgIGNvbnN0IGh0dHBzU2VydmVyID0gaHR0cHMuY3JlYXRlU2VydmVyKHsga2V5LCBjZXJ0IH0sIGV4cHJlc3NBcHApO1xuXG4gICAgdGhpcy5faW5pdEFjdGl2aXRpZXMoKTtcbiAgICB0aGlzLl9pbml0Um91dGluZyhleHByZXNzQXBwKTtcblxuICAgIGh0dHBzU2VydmVyLmxpc3RlbihleHByZXNzQXBwLmdldCgncG9ydCcpLCAoKSA9PiB7XG4gICAgICB0aGlzLl9hZGRyZXNzID0gYGh0dHBzOi8vMTI3LjAuMC4xOiR7ZXhwcmVzc0FwcC5nZXQoJ3BvcnQnKX1gO1xuICAgICAgY29uc29sZS5sb2coJ1tIVFRQUyBTRVJWRVJdIFNlcnZlciBsaXN0ZW5pbmcgb24nLCB0aGlzLl9hZGRyZXNzKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2luaXRTb2NrZXRzKGh0dHBzU2VydmVyKTtcbiAgfSxcblxuICAvKipcbiAgICogTWFwIGFjdGl2aXRpZXMgdG8gdGhlaXIgcmVzcGVjdGl2ZSBjbGllbnQgdHlwZShzKSBhbmQgc3RhcnQgdGhlbSBhbGwuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdEFjdGl2aXRpZXMoKSB7XG4gICAgdGhpcy5fYWN0aXZpdGllcy5mb3JFYWNoKChhY3Rpdml0eSkgPT4ge1xuICAgICAgdGhpcy5fbWFwQ2xpZW50VHlwZXNUb0FjdGl2aXR5KGFjdGl2aXR5LmNsaWVudFR5cGVzLCBhY3Rpdml0eSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9hY3Rpdml0aWVzLmZvckVhY2goKGFjdGl2aXR5KSA9PiBhY3Rpdml0eS5zdGFydCgpKTtcbiAgfSxcblxuICAvKipcbiAgICogSW5pdCByb3V0aW5nIGZvciBlYWNoIGNsaWVudC4gVGhlIGRlZmF1bHQgY2xpZW50IG11c3QgYmUgb3BlbmVkIGxhc3QuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdFJvdXRpbmcoZXhwcmVzc0FwcCkge1xuICAgIGZvciAobGV0IGNsaWVudFR5cGUgaW4gdGhpcy5fY2xpZW50VHlwZUFjdGl2aXRpZXNNYXApIHtcbiAgICAgIGlmIChjbGllbnRUeXBlICE9PSB0aGlzLmNvbmZpZy5kZWZhdWx0Q2xpZW50KVxuICAgICAgICB0aGlzLl9vcGVuQ2xpZW50Um91dGUoY2xpZW50VHlwZSwgZXhwcmVzc0FwcCk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgY2xpZW50VHlwZSBpbiB0aGlzLl9jbGllbnRUeXBlQWN0aXZpdGllc01hcCkge1xuICAgICAgaWYgKGNsaWVudFR5cGUgPT09IHRoaXMuY29uZmlnLmRlZmF1bHRDbGllbnQpXG4gICAgICAgIHRoaXMuX29wZW5DbGllbnRSb3V0ZShjbGllbnRUeXBlLCBleHByZXNzQXBwKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIE9wZW4gdGhlIHJvdXRlIGZvciB0aGUgZ2l2ZW4gY2xpZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX29wZW5DbGllbnRSb3V0ZShjbGllbnRUeXBlLCBleHByZXNzQXBwKSB7XG4gICAgbGV0IHJvdXRlID0gJyc7XG5cbiAgICBpZiAodGhpcy5fcm91dGVzW2NsaWVudFR5cGVdKVxuICAgICAgcm91dGUgKz0gdGhpcy5fcm91dGVzW2NsaWVudFR5cGVdO1xuXG4gICAgaWYgKGNsaWVudFR5cGUgIT09IHRoaXMuY29uZmlnLmRlZmF1bHRDbGllbnQpXG4gICAgICByb3V0ZSA9IGAvJHtjbGllbnRUeXBlfSR7cm91dGV9YDtcblxuICAgIC8vIGRlZmluZSB0ZW1wbGF0ZSBmaWxlbmFtZTogYCR7Y2xpZW50VHlwZX0uZWpzYCBvciBgZGVmYXVsdC5lanNgXG4gICAgY29uc3QgdGVtcGxhdGVEaXJlY3RvcnkgPSB0aGlzLmNvbmZpZy50ZW1wbGF0ZURpcmVjdG9yeTtcbiAgICBjb25zdCBjbGllbnRUbXBsID0gcGF0aC5qb2luKHRlbXBsYXRlRGlyZWN0b3J5LCBgJHtjbGllbnRUeXBlfS5lanNgKTtcbiAgICBjb25zdCBkZWZhdWx0VG1wbCA9IHBhdGguam9pbih0ZW1wbGF0ZURpcmVjdG9yeSwgYGRlZmF1bHQuZWpzYCk7XG5cbiAgICBmcy5zdGF0KGNsaWVudFRtcGwsIChlcnIsIHN0YXRzKSA9PiB7XG4gICAgICBsZXQgdGVtcGxhdGU7XG5cbiAgICAgIGlmIChlcnIgfHwgIXN0YXRzLmlzRmlsZSgpKVxuICAgICAgICB0ZW1wbGF0ZSA9IGRlZmF1bHRUbXBsO1xuICAgICAgZWxzZVxuICAgICAgICB0ZW1wbGF0ZSA9IGNsaWVudFRtcGw7XG5cbiAgICAgIGNvbnN0IHRtcGxTdHJpbmcgPSBmcy5yZWFkRmlsZVN5bmModGVtcGxhdGUsIHsgZW5jb2Rpbmc6ICd1dGY4JyB9KTtcbiAgICAgIGNvbnN0IHRtcGwgPSBlanMuY29tcGlsZSh0bXBsU3RyaW5nKTtcblxuICAgICAgLy8gaHR0cCByZXF1ZXN0XG4gICAgICBleHByZXNzQXBwLmdldChyb3V0ZSwgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLl9jbGllbnRDb25maWdEZWZpbml0aW9uKGNsaWVudFR5cGUsIHRoaXMuY29uZmlnLCByZXEpO1xuICAgICAgICBjb25zdCBhcHBJbmRleCA9IHRtcGwoeyBkYXRhIH0pO1xuICAgICAgICByZXMuc2VuZChhcHBJbmRleCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogU29ja2V0IGNvbm5lY3Rpb24gY2FsbGJhY2suXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfb25Tb2NrZXRDb25uZWN0aW9uKGNsaWVudFR5cGUsIHNvY2tldCkge1xuICAgIGNvbnN0IGNsaWVudCA9IG5ldyBDbGllbnQoY2xpZW50VHlwZSwgc29ja2V0KTtcbiAgICBjb25zdCBhY3Rpdml0aWVzID0gdGhpcy5fY2xpZW50VHlwZUFjdGl2aXRpZXNNYXBbY2xpZW50VHlwZV07XG5cbiAgICAvLyBnbG9iYWwgbGlmZWN5Y2xlIG9mIHRoZSBjbGllbnRcbiAgICBzb2NrZXRzLnJlY2VpdmUoY2xpZW50LCAnZGlzY29ubmVjdCcsICgpID0+IHtcbiAgICAgIGFjdGl2aXRpZXMuZm9yRWFjaCgoYWN0aXZpdHkpID0+IGFjdGl2aXR5LmRpc2Nvbm5lY3QoY2xpZW50KSk7XG4gICAgICBjbGllbnQuZGVzdHJveSgpO1xuXG4gICAgICBpZiAobG9nZ2VyLmluZm8pXG4gICAgICAgIGxvZ2dlci5pbmZvKHsgc29ja2V0LCBjbGllbnRUeXBlIH0sICdkaXNjb25uZWN0Jyk7XG4gICAgfSk7XG5cbiAgICAvLyBjaGVjayBjb2hlcmVuY2UgYmV0d2VlbiBjbGllbnQtc2lkZSBhbmQgc2VydmVyLXNpZGUgc2VydmljZSByZXF1aXJlbWVudHNcbiAgICBjb25zdCBzZXJ2ZXJSZXF1aXJlZFNlcnZpY2VzID0gc2VydmljZU1hbmFnZXIuZ2V0UmVxdWlyZWRTZXJ2aWNlcyhjbGllbnRUeXBlKTtcbiAgICBjb25zdCBzZXJ2ZXJTZXJ2aWNlc0xpc3QgPSBzZXJ2aWNlTWFuYWdlci5nZXRTZXJ2aWNlTGlzdCgpO1xuXG4gICAgc29ja2V0cy5yZWNlaXZlKGNsaWVudCwgJ2hhbmRzaGFrZScsIChkYXRhKSA9PiB7XG4gICAgICBpZiAodGhpcy5jb25maWcuZW52ICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgY29uc3QgY2xpZW50UmVxdWlyZWRTZXJ2aWNlcyA9IGRhdGEucmVxdWlyZWRTZXJ2aWNlcyB8fMKgW107XG4gICAgICAgIGNvbnN0IG1pc3NpbmdTZXJ2aWNlcyA9IFtdO1xuXG4gICAgICAgIGNsaWVudFJlcXVpcmVkU2VydmljZXMuZm9yRWFjaCgoc2VydmljZUlkKSA9PiB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgc2VydmVyU2VydmljZXNMaXN0LmluZGV4T2Yoc2VydmljZUlkKSAhPT0gLTEgJiZcbiAgICAgICAgICAgIHNlcnZlclJlcXVpcmVkU2VydmljZXMuaW5kZXhPZihzZXJ2aWNlSWQpID09PSAtMVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgbWlzc2luZ1NlcnZpY2VzLnB1c2goc2VydmljZUlkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChtaXNzaW5nU2VydmljZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHNvY2tldHMuc2VuZChjbGllbnQsICdjbGllbnQ6ZXJyb3InLCB7XG4gICAgICAgICAgICB0eXBlOiAnc2VydmljZXMnLFxuICAgICAgICAgICAgZGF0YTogbWlzc2luZ1NlcnZpY2VzLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjbGllbnQudXJsUGFyYW1zID0gZGF0YS51cmxQYXJhbXM7XG4gICAgICAvLyBAdG9kbyAtIGhhbmRsZSByZWNvbm5lY3Rpb24gKGV4OiBgZGF0YWAgY29udGFpbnMgYW4gYHV1aWRgKVxuICAgICAgYWN0aXZpdGllcy5mb3JFYWNoKChhY3Rpdml0eSkgPT4gYWN0aXZpdHkuY29ubmVjdChjbGllbnQpKTtcbiAgICAgIHNvY2tldHMuc2VuZChjbGllbnQsICdjbGllbnQ6c3RhcnQnLCBjbGllbnQudXVpZCk7XG5cbiAgICAgIGlmIChsb2dnZXIuaW5mbylcbiAgICAgICAgbG9nZ2VyLmluZm8oeyBzb2NrZXQsIGNsaWVudFR5cGUgfSwgJ2hhbmRzaGFrZScpO1xuICAgIH0pO1xuICB9LFxufTtcblxuZXhwb3J0IGRlZmF1bHQgc2VydmVyO1xuIl19