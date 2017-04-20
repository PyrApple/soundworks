'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

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

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _klaw = require('klaw');

var _klaw2 = _interopRequireDefault(_klaw);

var _path2 = require('path');

var _path3 = _interopRequireDefault(_path2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SERVICE_ID = 'service:file-system';
var cwd = process.cwd();
var isString = function isString(value) {
  return typeof value === 'string' || value instanceof String;
};

/**
 * Interface for the server `'file-system'` service.
 *
 * This service allow to retrieve a list of files or directories from a given path.
 *
 * __*The service must be used with its [server-side counterpart]{@link module:soundworks/server.FileSystem}*__
 *
 * @memberof module:soundworks/server
 * @example
 * this.fileSystem = this.require('file-system');
 */

var FileSystem = function (_Service) {
  (0, _inherits3.default)(FileSystem, _Service);

  /** _<span class="warning">__WARNING__</span> This class should never be instanciated manually_ */
  function FileSystem() {
    (0, _classCallCheck3.default)(this, FileSystem);

    var _this = (0, _possibleConstructorReturn3.default)(this, (FileSystem.__proto__ || (0, _getPrototypeOf2.default)(FileSystem)).call(this, SERVICE_ID));

    var defaults = {
      configItem: 'publicDirectory',
      enableCache: true
    };

    _this.configure(defaults);

    _this._cache = []; // keep results in cache to avoid too much I/O calls
    _this._sharedConfig = _this.require('shared-config');
    return _this;
  }

  (0, _createClass3.default)(FileSystem, [{
    key: 'start',
    value: function start() {
      (0, _get3.default)(FileSystem.prototype.__proto__ || (0, _getPrototypeOf2.default)(FileSystem.prototype), 'start', this).call(this);

      var configItem = this.options.configItem;
      this._publicDir = this._sharedConfig.get(configItem);

      if (!this._publicDir) throw new Error('"' + SERVICE_ID + '": server.config.' + configItem + ' is not defined');

      this._enableCache = !!this.options.enableCache;
    }
  }, {
    key: 'connect',
    value: function connect(client) {
      this.receive(client, 'request', this._onRequest(client));
    }

    /**
     * @typedef {Object} module:soundworks/server.FileSystem~ListConfig
     * @property {String} path - Name of the folder to search into.
     * @property {RegExp} [match='*'] - RegExp used to filter the results.
     * @property {Boolean} [recursive=false] - Define if the search should be
     *  recursive.
     * @property {Boolean} [directories=false] - If true only return directories,
     *  files otherwise.
     */
    /**
     * Return a list of files according to the given configuration.
     *
     * @param {String|module:soundworks/server.FileSystem~ListConfig|Array<String>|Array<module:soundworks/server.FileSystem~ListConfig>} config -
     *  Details of the requested file list(s).
     * @return {Promise<Array>|Promise<Array<Array>>} - Promise resolving with an
     *  an array containing the absolute paths of the files / directories.
     *  If `config` is an array, the results will be an array of arrays
     *  containing the result of each different request.
     *
     * @example:
     * // 1. Single list
     * // retrieve all the file in a folder
     * fileSystem.getList('my-directory').then((files) => ... );
     * // or, retrieve all the `.wav` files inside a given folder, search recursively
     * fileSystem.getList({
     *   path: 'my-directory',
     *   match: /\.wav/,
     *   recursive: true,
     * }).then((files) => ... );
     *
     * // 2. Multiple Requests
     * // retrieve all the file in 2 different folders, the returned value will be
     * // an array containing the 2 file lists
     * fileSystem.getList(['my-directory1', 'my-directory2'])
     *   .then((arrayList) => ... );
     * // or
     * fileSystem.getList([{ ... }, { ... }])
     *   .then((arrayList) => ... );
     */

  }, {
    key: 'getList',
    value: function getList(config) {
      var _this2 = this;

      var returnAll = true;

      if (!Array.isArray(config)) {
        config = [config];
        returnAll = false;
      }

      var stack = config.map(function (item) {
        if (isString(item)) item = { path: item };

        var _item = item,
            path = _item.path,
            match = _item.match,
            recursive = _item.recursive,
            directories = _item.directories;

        return _this2._getList(path, match, recursive, directories);
      });

      if (returnAll === false) return stack[0]; // a single promise
      else return _promise2.default.all(stack);
    }

    /**
     * Return a list of files inside a given directory.
     *
     * @param {String} path - The directory to search into.
     * @param {RegExp} [match='*'] - A RegExp to filter the results (the
     *  wildcard '*' is accepted).
     * @param {Boolean} [recursive=false] - Define if the search should be
     *  recursive or not
     * @param {Boolean} [directories=false] - Define if the result should contain
     *  a list of files or a list of directories.
     * @return {Array}
     * @private
     */

  }, {
    key: '_getList',
    value: function _getList() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var match = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '*';

      var _this3 = this;

      var recursive = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var directories = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      if (path === null) throw new Error(SERVICE_ID + ' - path not defined');

      // wilcard
      if (match === '*') match = /.*/;

      var key = path + ':' + match + ':' + recursive + ':' + directories;

      if (this._enableCache && this._cache[key]) return _promise2.default.resolve(this._cache[key]);

      var testCwd = new RegExp('^' + cwd);
      var dir = _path3.default.normalize(path);
      var results = [];

      // make the given path absolute if not
      if (!testCwd.test(dir)) dir = _path3.default.join(cwd, dir);

      console.log(dir);
      var promise = new _promise2.default(function (resolve, reject) {
        (0, _klaw2.default)(dir).on('data', function (item) {
          var basename = _path3.default.basename(item.path);
          var dirname = _path3.default.dirname(item.path);

          if (
          // ignore current directory
          item.path === dir ||
          // ignore common hidden system file patterns
          basename === 'thumbs.db' || /^\./.test(basename) === true) {
            return;
          }

          if (directories && item.stats.isDirectory() || !directories && item.stats.isFile()) {
            if (recursive || !recursive && dirname === dir) results.push(item.path);
          }
        }).on('end', function () {
          // remove `dir` the paths and test against the regExp
          results = results.filter(function (entry) {
            entry = entry.replace(_path3.default.join(dir, _path3.default.sep), '');
            return match.test(entry);
          });

          // keep in cache and resolve promise
          if (_this3._enableCache) _this3._cache[key] = results;

          resolve(results);
        }).on('error', function (err) {
          console.error(SERVICE_ID, '-', err.message);
        });
      });

      return promise;
    }
  }, {
    key: '_onRequest',
    value: function _onRequest(client) {
      var _this4 = this;

      return function (id, config) {
        // unserialize the json config to return proper RegExp, adapted from:
        // http://stackoverflow.com/questions/12075927/serialization-of-regexp#answer-33416684
        config = JSON.parse(config, function (key, value) {
          if (key === 'match' && value.toString().indexOf('__REGEXP ') === 0) {
            var fragments = value.split('__REGEXP ')[1].match(/\/(.*?)\/([gimy])?$/);
            var pattern = fragments[1].replace('\\\\', '\\');
            var flag = fragments[2] || '';
            return new RegExp(pattern, flag);
          } else {
            return value;
          }
        });

        var testCwd = new RegExp('^' + cwd);
        var publicDir = _this4._publicDir;

        if (!testCwd.test(publicDir)) publicDir = _path3.default.join(cwd, publicDir);

        // force the search in the public directory
        function prependPath(item) {
          if (Array.isArray(item)) return item.map(prependPath);

          if (isString(item)) item = _path3.default.join(publicDir, item);else item.path = _path3.default.join(publicDir, item.path);

          return item;
        }

        config = prependPath(config);

        // get results
        _this4.getList(config).then(function (results) {
          function formatToUrl(entry) {
            if (Array.isArray(entry)) return entry.map(formatToUrl);

            entry = entry.replace(publicDir, '');
            entry = entry.replace('\\', '/'); // window paths to url

            if (!/^\//.test(entry)) entry = '/' + entry;

            return entry;
          }

          // remove all file system informations and create an absolute url
          results = formatToUrl(results);

          _this4.send(client, 'list:' + id, results);
        }).catch(function (err) {
          return console.error(err.stack);
        });
      };
    }
  }]);
  return FileSystem;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, FileSystem);

exports.default = FileSystem;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVTeXN0ZW0uanMiXSwibmFtZXMiOlsiU0VSVklDRV9JRCIsImN3ZCIsInByb2Nlc3MiLCJpc1N0cmluZyIsInZhbHVlIiwiU3RyaW5nIiwiRmlsZVN5c3RlbSIsImRlZmF1bHRzIiwiY29uZmlnSXRlbSIsImVuYWJsZUNhY2hlIiwiY29uZmlndXJlIiwiX2NhY2hlIiwiX3NoYXJlZENvbmZpZyIsInJlcXVpcmUiLCJvcHRpb25zIiwiX3B1YmxpY0RpciIsImdldCIsIkVycm9yIiwiX2VuYWJsZUNhY2hlIiwiY2xpZW50IiwicmVjZWl2ZSIsIl9vblJlcXVlc3QiLCJjb25maWciLCJyZXR1cm5BbGwiLCJBcnJheSIsImlzQXJyYXkiLCJzdGFjayIsIm1hcCIsIml0ZW0iLCJwYXRoIiwibWF0Y2giLCJyZWN1cnNpdmUiLCJkaXJlY3RvcmllcyIsIl9nZXRMaXN0IiwiYWxsIiwia2V5IiwicmVzb2x2ZSIsInRlc3RDd2QiLCJSZWdFeHAiLCJkaXIiLCJub3JtYWxpemUiLCJyZXN1bHRzIiwidGVzdCIsImpvaW4iLCJjb25zb2xlIiwibG9nIiwicHJvbWlzZSIsInJlamVjdCIsIm9uIiwiYmFzZW5hbWUiLCJkaXJuYW1lIiwic3RhdHMiLCJpc0RpcmVjdG9yeSIsImlzRmlsZSIsInB1c2giLCJmaWx0ZXIiLCJlbnRyeSIsInJlcGxhY2UiLCJzZXAiLCJlcnIiLCJlcnJvciIsIm1lc3NhZ2UiLCJpZCIsIkpTT04iLCJwYXJzZSIsInRvU3RyaW5nIiwiaW5kZXhPZiIsImZyYWdtZW50cyIsInNwbGl0IiwicGF0dGVybiIsImZsYWciLCJwdWJsaWNEaXIiLCJwcmVwZW5kUGF0aCIsImdldExpc3QiLCJ0aGVuIiwiZm9ybWF0VG9VcmwiLCJzZW5kIiwiY2F0Y2giLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLElBQU1BLGFBQWEscUJBQW5CO0FBQ0EsSUFBTUMsTUFBTUMsUUFBUUQsR0FBUixFQUFaO0FBQ0EsSUFBTUUsV0FBVyxTQUFYQSxRQUFXLENBQUNDLEtBQUQ7QUFBQSxTQUFZLE9BQU9BLEtBQVAsS0FBaUIsUUFBakIsSUFBNkJBLGlCQUFpQkMsTUFBMUQ7QUFBQSxDQUFqQjs7QUFHQTs7Ozs7Ozs7Ozs7O0lBV01DLFU7OztBQUNKO0FBQ0Esd0JBQWM7QUFBQTs7QUFBQSw4SUFDTk4sVUFETTs7QUFHWixRQUFNTyxXQUFXO0FBQ2ZDLGtCQUFZLGlCQURHO0FBRWZDLG1CQUFhO0FBRkUsS0FBakI7O0FBS0EsVUFBS0MsU0FBTCxDQUFlSCxRQUFmOztBQUVBLFVBQUtJLE1BQUwsR0FBYyxFQUFkLENBVlksQ0FVTTtBQUNsQixVQUFLQyxhQUFMLEdBQXFCLE1BQUtDLE9BQUwsQ0FBYSxlQUFiLENBQXJCO0FBWFk7QUFZYjs7Ozs0QkFFTztBQUNOOztBQUVBLFVBQU1MLGFBQWEsS0FBS00sT0FBTCxDQUFhTixVQUFoQztBQUNBLFdBQUtPLFVBQUwsR0FBa0IsS0FBS0gsYUFBTCxDQUFtQkksR0FBbkIsQ0FBdUJSLFVBQXZCLENBQWxCOztBQUVBLFVBQUksQ0FBQyxLQUFLTyxVQUFWLEVBQ0UsTUFBTSxJQUFJRSxLQUFKLE9BQWNqQixVQUFkLHlCQUE0Q1EsVUFBNUMscUJBQU47O0FBRUYsV0FBS1UsWUFBTCxHQUFvQixDQUFDLENBQUMsS0FBS0osT0FBTCxDQUFhTCxXQUFuQztBQUNEOzs7NEJBRU9VLE0sRUFBUTtBQUNkLFdBQUtDLE9BQUwsQ0FBYUQsTUFBYixFQUFxQixTQUFyQixFQUFnQyxLQUFLRSxVQUFMLENBQWdCRixNQUFoQixDQUFoQztBQUNEOztBQUVEOzs7Ozs7Ozs7QUFTQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQThCUUcsTSxFQUFRO0FBQUE7O0FBQ2QsVUFBSUMsWUFBWSxJQUFoQjs7QUFFQSxVQUFJLENBQUNDLE1BQU1DLE9BQU4sQ0FBY0gsTUFBZCxDQUFMLEVBQTRCO0FBQzFCQSxpQkFBUyxDQUFDQSxNQUFELENBQVQ7QUFDQUMsb0JBQVksS0FBWjtBQUNEOztBQUVELFVBQU1HLFFBQVFKLE9BQU9LLEdBQVAsQ0FBVyxVQUFDQyxJQUFELEVBQVU7QUFDakMsWUFBSXpCLFNBQVN5QixJQUFULENBQUosRUFDRUEsT0FBTyxFQUFFQyxNQUFNRCxJQUFSLEVBQVA7O0FBRitCLG9CQUllQSxJQUpmO0FBQUEsWUFJekJDLElBSnlCLFNBSXpCQSxJQUp5QjtBQUFBLFlBSW5CQyxLQUptQixTQUluQkEsS0FKbUI7QUFBQSxZQUlaQyxTQUpZLFNBSVpBLFNBSlk7QUFBQSxZQUlEQyxXQUpDLFNBSURBLFdBSkM7O0FBS2pDLGVBQU8sT0FBS0MsUUFBTCxDQUFjSixJQUFkLEVBQW9CQyxLQUFwQixFQUEyQkMsU0FBM0IsRUFBc0NDLFdBQXRDLENBQVA7QUFDRCxPQU5hLENBQWQ7O0FBUUEsVUFBSVQsY0FBYyxLQUFsQixFQUNFLE9BQU9HLE1BQU0sQ0FBTixDQUFQLENBREYsQ0FDbUI7QUFEbkIsV0FHRSxPQUFPLGtCQUFRUSxHQUFSLENBQVlSLEtBQVosQ0FBUDtBQUNIOztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7OytCQWEyRTtBQUFBLFVBQWxFRyxJQUFrRSx1RUFBM0QsSUFBMkQ7QUFBQSxVQUFyREMsS0FBcUQsdUVBQTdDLEdBQTZDOztBQUFBOztBQUFBLFVBQXhDQyxTQUF3Qyx1RUFBNUIsS0FBNEI7QUFBQSxVQUFyQkMsV0FBcUIsdUVBQVAsS0FBTzs7QUFDekUsVUFBSUgsU0FBUyxJQUFiLEVBQ0UsTUFBTSxJQUFJWixLQUFKLENBQWFqQixVQUFiLHlCQUFOOztBQUVGO0FBQ0EsVUFBSThCLFVBQVUsR0FBZCxFQUNFQSxRQUFRLElBQVI7O0FBRUYsVUFBTUssTUFBU04sSUFBVCxTQUFpQkMsS0FBakIsU0FBMEJDLFNBQTFCLFNBQXVDQyxXQUE3Qzs7QUFFQSxVQUFJLEtBQUtkLFlBQUwsSUFBcUIsS0FBS1AsTUFBTCxDQUFZd0IsR0FBWixDQUF6QixFQUNFLE9BQU8sa0JBQVFDLE9BQVIsQ0FBZ0IsS0FBS3pCLE1BQUwsQ0FBWXdCLEdBQVosQ0FBaEIsQ0FBUDs7QUFFRixVQUFNRSxVQUFVLElBQUlDLE1BQUosT0FBZXJDLEdBQWYsQ0FBaEI7QUFDQSxVQUFJc0MsTUFBTSxlQUFNQyxTQUFOLENBQWdCWCxJQUFoQixDQUFWO0FBQ0EsVUFBSVksVUFBVSxFQUFkOztBQUVBO0FBQ0EsVUFBSSxDQUFDSixRQUFRSyxJQUFSLENBQWFILEdBQWIsQ0FBTCxFQUNFQSxNQUFNLGVBQU1JLElBQU4sQ0FBVzFDLEdBQVgsRUFBZ0JzQyxHQUFoQixDQUFOOztBQUVGSyxjQUFRQyxHQUFSLENBQVlOLEdBQVo7QUFDQSxVQUFNTyxVQUFVLHNCQUFZLFVBQUNWLE9BQUQsRUFBVVcsTUFBVixFQUFxQjtBQUMvQyw0QkFBS1IsR0FBTCxFQUNHUyxFQURILENBQ00sTUFETixFQUNjLFVBQUNwQixJQUFELEVBQVU7QUFDcEIsY0FBTXFCLFdBQVcsZUFBTUEsUUFBTixDQUFlckIsS0FBS0MsSUFBcEIsQ0FBakI7QUFDQSxjQUFNcUIsVUFBVSxlQUFNQSxPQUFOLENBQWN0QixLQUFLQyxJQUFuQixDQUFoQjs7QUFFQTtBQUNFO0FBQ0FELGVBQUtDLElBQUwsS0FBY1UsR0FBZDtBQUNBO0FBQ0FVLHVCQUFhLFdBRmIsSUFHQSxNQUFNUCxJQUFOLENBQVdPLFFBQVgsTUFBeUIsSUFMM0IsRUFNRTtBQUNBO0FBQ0Q7O0FBRUQsY0FDR2pCLGVBQWVKLEtBQUt1QixLQUFMLENBQVdDLFdBQVgsRUFBaEIsSUFDQyxDQUFDcEIsV0FBRCxJQUFnQkosS0FBS3VCLEtBQUwsQ0FBV0UsTUFBWCxFQUZuQixFQUdFO0FBQ0EsZ0JBQUl0QixhQUFjLENBQUNBLFNBQUQsSUFBY21CLFlBQVlYLEdBQTVDLEVBQ0VFLFFBQVFhLElBQVIsQ0FBYTFCLEtBQUtDLElBQWxCO0FBQ0g7QUFDRixTQXRCSCxFQXNCS21CLEVBdEJMLENBc0JRLEtBdEJSLEVBc0JlLFlBQU07QUFDakI7QUFDQVAsb0JBQVVBLFFBQVFjLE1BQVIsQ0FBZSxVQUFDQyxLQUFELEVBQVc7QUFDbENBLG9CQUFRQSxNQUFNQyxPQUFOLENBQWMsZUFBTWQsSUFBTixDQUFXSixHQUFYLEVBQWdCLGVBQU1tQixHQUF0QixDQUFkLEVBQTBDLEVBQTFDLENBQVI7QUFDQSxtQkFBTzVCLE1BQU1ZLElBQU4sQ0FBV2MsS0FBWCxDQUFQO0FBQ0QsV0FIUyxDQUFWOztBQUtBO0FBQ0EsY0FBSSxPQUFLdEMsWUFBVCxFQUNFLE9BQUtQLE1BQUwsQ0FBWXdCLEdBQVosSUFBbUJNLE9BQW5COztBQUVGTCxrQkFBUUssT0FBUjtBQUNELFNBbENILEVBa0NLTyxFQWxDTCxDQWtDUSxPQWxDUixFQWtDaUIsVUFBU1csR0FBVCxFQUFjO0FBQzNCZixrQkFBUWdCLEtBQVIsQ0FBYzVELFVBQWQsRUFBMEIsR0FBMUIsRUFBK0IyRCxJQUFJRSxPQUFuQztBQUNELFNBcENIO0FBcUNELE9BdENlLENBQWhCOztBQXdDQSxhQUFPZixPQUFQO0FBQ0Q7OzsrQkFFVTNCLE0sRUFBUTtBQUFBOztBQUNqQixhQUFPLFVBQUMyQyxFQUFELEVBQUt4QyxNQUFMLEVBQWdCO0FBQ3JCO0FBQ0E7QUFDQUEsaUJBQVN5QyxLQUFLQyxLQUFMLENBQVcxQyxNQUFYLEVBQW1CLFVBQVNhLEdBQVQsRUFBYy9CLEtBQWQsRUFBcUI7QUFDL0MsY0FBSStCLFFBQVEsT0FBUixJQUFtQi9CLE1BQU02RCxRQUFOLEdBQWlCQyxPQUFqQixDQUF5QixXQUF6QixNQUEwQyxDQUFqRSxFQUFvRTtBQUNsRSxnQkFBTUMsWUFBWS9ELE1BQU1nRSxLQUFOLENBQVksV0FBWixFQUF5QixDQUF6QixFQUE0QnRDLEtBQTVCLENBQWtDLHFCQUFsQyxDQUFsQjtBQUNBLGdCQUFNdUMsVUFBVUYsVUFBVSxDQUFWLEVBQWFWLE9BQWIsQ0FBcUIsTUFBckIsRUFBNkIsSUFBN0IsQ0FBaEI7QUFDQSxnQkFBTWEsT0FBT0gsVUFBVSxDQUFWLEtBQWdCLEVBQTdCO0FBQ0EsbUJBQU8sSUFBSTdCLE1BQUosQ0FBVytCLE9BQVgsRUFBb0JDLElBQXBCLENBQVA7QUFDRCxXQUxELE1BS087QUFDTCxtQkFBT2xFLEtBQVA7QUFDRDtBQUNGLFNBVFEsQ0FBVDs7QUFXQSxZQUFNaUMsVUFBVSxJQUFJQyxNQUFKLE9BQWVyQyxHQUFmLENBQWhCO0FBQ0EsWUFBSXNFLFlBQVksT0FBS3hELFVBQXJCOztBQUVBLFlBQUksQ0FBQ3NCLFFBQVFLLElBQVIsQ0FBYTZCLFNBQWIsQ0FBTCxFQUNFQSxZQUFZLGVBQU01QixJQUFOLENBQVcxQyxHQUFYLEVBQWdCc0UsU0FBaEIsQ0FBWjs7QUFFRjtBQUNBLGlCQUFTQyxXQUFULENBQXFCNUMsSUFBckIsRUFBMkI7QUFDekIsY0FBSUosTUFBTUMsT0FBTixDQUFjRyxJQUFkLENBQUosRUFDRSxPQUFPQSxLQUFLRCxHQUFMLENBQVM2QyxXQUFULENBQVA7O0FBRUYsY0FBSXJFLFNBQVN5QixJQUFULENBQUosRUFDRUEsT0FBTyxlQUFNZSxJQUFOLENBQVc0QixTQUFYLEVBQXNCM0MsSUFBdEIsQ0FBUCxDQURGLEtBR0VBLEtBQUtDLElBQUwsR0FBWSxlQUFNYyxJQUFOLENBQVc0QixTQUFYLEVBQXNCM0MsS0FBS0MsSUFBM0IsQ0FBWjs7QUFFRixpQkFBT0QsSUFBUDtBQUNEOztBQUVETixpQkFBU2tELFlBQVlsRCxNQUFaLENBQVQ7O0FBRUE7QUFDQSxlQUFLbUQsT0FBTCxDQUFhbkQsTUFBYixFQUNHb0QsSUFESCxDQUNRLFVBQUNqQyxPQUFELEVBQWE7QUFDakIsbUJBQVNrQyxXQUFULENBQXFCbkIsS0FBckIsRUFBNEI7QUFDMUIsZ0JBQUloQyxNQUFNQyxPQUFOLENBQWMrQixLQUFkLENBQUosRUFDRSxPQUFPQSxNQUFNN0IsR0FBTixDQUFVZ0QsV0FBVixDQUFQOztBQUVGbkIsb0JBQVFBLE1BQU1DLE9BQU4sQ0FBY2MsU0FBZCxFQUF5QixFQUF6QixDQUFSO0FBQ0FmLG9CQUFRQSxNQUFNQyxPQUFOLENBQWMsSUFBZCxFQUFvQixHQUFwQixDQUFSLENBTDBCLENBS1E7O0FBRWxDLGdCQUFJLENBQUMsTUFBTWYsSUFBTixDQUFXYyxLQUFYLENBQUwsRUFDRUEsUUFBUSxNQUFNQSxLQUFkOztBQUVGLG1CQUFPQSxLQUFQO0FBQ0Q7O0FBRUQ7QUFDQWYsb0JBQVVrQyxZQUFZbEMsT0FBWixDQUFWOztBQUVBLGlCQUFLbUMsSUFBTCxDQUFVekQsTUFBVixZQUEwQjJDLEVBQTFCLEVBQWdDckIsT0FBaEM7QUFDRCxTQW5CSCxFQW9CR29DLEtBcEJILENBb0JTLFVBQUNsQixHQUFEO0FBQUEsaUJBQVNmLFFBQVFnQixLQUFSLENBQWNELElBQUlqQyxLQUFsQixDQUFUO0FBQUEsU0FwQlQ7QUFxQkQsT0F6REQ7QUEwREQ7Ozs7O0FBR0gseUJBQWVvRCxRQUFmLENBQXdCOUUsVUFBeEIsRUFBb0NNLFVBQXBDOztrQkFFZUEsVSIsImZpbGUiOiJGaWxlU3lzdGVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNlcnZpY2UgZnJvbSAnLi4vY29yZS9TZXJ2aWNlJztcbmltcG9ydCBzZXJ2aWNlTWFuYWdlciBmcm9tICcuLi9jb3JlL3NlcnZpY2VNYW5hZ2VyJztcbmltcG9ydCBmc2UgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0IGtsYXcgZnJvbSAna2xhdyc7XG5pbXBvcnQgX3BhdGggZnJvbSAncGF0aCc7XG5cbmNvbnN0IFNFUlZJQ0VfSUQgPSAnc2VydmljZTpmaWxlLXN5c3RlbSc7XG5jb25zdCBjd2QgPSBwcm9jZXNzLmN3ZCgpO1xuY29uc3QgaXNTdHJpbmcgPSAodmFsdWUpID0+ICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHZhbHVlIGluc3RhbmNlb2YgU3RyaW5nKTtcblxuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIHNlcnZlciBgJ2ZpbGUtc3lzdGVtJ2Agc2VydmljZS5cbiAqXG4gKiBUaGlzIHNlcnZpY2UgYWxsb3cgdG8gcmV0cmlldmUgYSBsaXN0IG9mIGZpbGVzIG9yIGRpcmVjdG9yaWVzIGZyb20gYSBnaXZlbiBwYXRoLlxuICpcbiAqIF9fKlRoZSBzZXJ2aWNlIG11c3QgYmUgdXNlZCB3aXRoIGl0cyBbc2VydmVyLXNpZGUgY291bnRlcnBhcnRde0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL3NlcnZlci5GaWxlU3lzdGVtfSpfX1xuICpcbiAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9zZXJ2ZXJcbiAqIEBleGFtcGxlXG4gKiB0aGlzLmZpbGVTeXN0ZW0gPSB0aGlzLnJlcXVpcmUoJ2ZpbGUtc3lzdGVtJyk7XG4gKi9cbmNsYXNzIEZpbGVTeXN0ZW0gZXh0ZW5kcyBTZXJ2aWNlIHtcbiAgLyoqIF88c3BhbiBjbGFzcz1cIndhcm5pbmdcIj5fX1dBUk5JTkdfXzwvc3Bhbj4gVGhpcyBjbGFzcyBzaG91bGQgbmV2ZXIgYmUgaW5zdGFuY2lhdGVkIG1hbnVhbGx5XyAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihTRVJWSUNFX0lEKTtcblxuICAgIGNvbnN0IGRlZmF1bHRzID0ge1xuICAgICAgY29uZmlnSXRlbTogJ3B1YmxpY0RpcmVjdG9yeScsXG4gICAgICBlbmFibGVDYWNoZTogdHJ1ZSxcbiAgICB9O1xuXG4gICAgdGhpcy5jb25maWd1cmUoZGVmYXVsdHMpO1xuXG4gICAgdGhpcy5fY2FjaGUgPSBbXTsgLy8ga2VlcCByZXN1bHRzIGluIGNhY2hlIHRvIGF2b2lkIHRvbyBtdWNoIEkvTyBjYWxsc1xuICAgIHRoaXMuX3NoYXJlZENvbmZpZyA9IHRoaXMucmVxdWlyZSgnc2hhcmVkLWNvbmZpZycpO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTtcblxuICAgIGNvbnN0IGNvbmZpZ0l0ZW0gPSB0aGlzLm9wdGlvbnMuY29uZmlnSXRlbTtcbiAgICB0aGlzLl9wdWJsaWNEaXIgPSB0aGlzLl9zaGFyZWRDb25maWcuZ2V0KGNvbmZpZ0l0ZW0pO1xuXG4gICAgaWYgKCF0aGlzLl9wdWJsaWNEaXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHtTRVJWSUNFX0lEfVwiOiBzZXJ2ZXIuY29uZmlnLiR7Y29uZmlnSXRlbX0gaXMgbm90IGRlZmluZWRgKTtcblxuICAgIHRoaXMuX2VuYWJsZUNhY2hlID0gISF0aGlzLm9wdGlvbnMuZW5hYmxlQ2FjaGU7XG4gIH1cblxuICBjb25uZWN0KGNsaWVudCkge1xuICAgIHRoaXMucmVjZWl2ZShjbGllbnQsICdyZXF1ZXN0JywgdGhpcy5fb25SZXF1ZXN0KGNsaWVudCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IG1vZHVsZTpzb3VuZHdvcmtzL3NlcnZlci5GaWxlU3lzdGVtfkxpc3RDb25maWdcbiAgICogQHByb3BlcnR5IHtTdHJpbmd9IHBhdGggLSBOYW1lIG9mIHRoZSBmb2xkZXIgdG8gc2VhcmNoIGludG8uXG4gICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBbbWF0Y2g9JyonXSAtIFJlZ0V4cCB1c2VkIHRvIGZpbHRlciB0aGUgcmVzdWx0cy5cbiAgICogQHByb3BlcnR5IHtCb29sZWFufSBbcmVjdXJzaXZlPWZhbHNlXSAtIERlZmluZSBpZiB0aGUgc2VhcmNoIHNob3VsZCBiZVxuICAgKiAgcmVjdXJzaXZlLlxuICAgKiBAcHJvcGVydHkge0Jvb2xlYW59IFtkaXJlY3Rvcmllcz1mYWxzZV0gLSBJZiB0cnVlIG9ubHkgcmV0dXJuIGRpcmVjdG9yaWVzLFxuICAgKiAgZmlsZXMgb3RoZXJ3aXNlLlxuICAgKi9cbiAgLyoqXG4gICAqIFJldHVybiBhIGxpc3Qgb2YgZmlsZXMgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBjb25maWd1cmF0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ3xtb2R1bGU6c291bmR3b3Jrcy9zZXJ2ZXIuRmlsZVN5c3RlbX5MaXN0Q29uZmlnfEFycmF5PFN0cmluZz58QXJyYXk8bW9kdWxlOnNvdW5kd29ya3Mvc2VydmVyLkZpbGVTeXN0ZW1+TGlzdENvbmZpZz59IGNvbmZpZyAtXG4gICAqICBEZXRhaWxzIG9mIHRoZSByZXF1ZXN0ZWQgZmlsZSBsaXN0KHMpLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEFycmF5PnxQcm9taXNlPEFycmF5PEFycmF5Pj59IC0gUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBhblxuICAgKiAgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgYWJzb2x1dGUgcGF0aHMgb2YgdGhlIGZpbGVzIC8gZGlyZWN0b3JpZXMuXG4gICAqICBJZiBgY29uZmlnYCBpcyBhbiBhcnJheSwgdGhlIHJlc3VsdHMgd2lsbCBiZSBhbiBhcnJheSBvZiBhcnJheXNcbiAgICogIGNvbnRhaW5pbmcgdGhlIHJlc3VsdCBvZiBlYWNoIGRpZmZlcmVudCByZXF1ZXN0LlxuICAgKlxuICAgKiBAZXhhbXBsZTpcbiAgICogLy8gMS4gU2luZ2xlIGxpc3RcbiAgICogLy8gcmV0cmlldmUgYWxsIHRoZSBmaWxlIGluIGEgZm9sZGVyXG4gICAqIGZpbGVTeXN0ZW0uZ2V0TGlzdCgnbXktZGlyZWN0b3J5JykudGhlbigoZmlsZXMpID0+IC4uLiApO1xuICAgKiAvLyBvciwgcmV0cmlldmUgYWxsIHRoZSBgLndhdmAgZmlsZXMgaW5zaWRlIGEgZ2l2ZW4gZm9sZGVyLCBzZWFyY2ggcmVjdXJzaXZlbHlcbiAgICogZmlsZVN5c3RlbS5nZXRMaXN0KHtcbiAgICogICBwYXRoOiAnbXktZGlyZWN0b3J5JyxcbiAgICogICBtYXRjaDogL1xcLndhdi8sXG4gICAqICAgcmVjdXJzaXZlOiB0cnVlLFxuICAgKiB9KS50aGVuKChmaWxlcykgPT4gLi4uICk7XG4gICAqXG4gICAqIC8vIDIuIE11bHRpcGxlIFJlcXVlc3RzXG4gICAqIC8vIHJldHJpZXZlIGFsbCB0aGUgZmlsZSBpbiAyIGRpZmZlcmVudCBmb2xkZXJzLCB0aGUgcmV0dXJuZWQgdmFsdWUgd2lsbCBiZVxuICAgKiAvLyBhbiBhcnJheSBjb250YWluaW5nIHRoZSAyIGZpbGUgbGlzdHNcbiAgICogZmlsZVN5c3RlbS5nZXRMaXN0KFsnbXktZGlyZWN0b3J5MScsICdteS1kaXJlY3RvcnkyJ10pXG4gICAqICAgLnRoZW4oKGFycmF5TGlzdCkgPT4gLi4uICk7XG4gICAqIC8vIG9yXG4gICAqIGZpbGVTeXN0ZW0uZ2V0TGlzdChbeyAuLi4gfSwgeyAuLi4gfV0pXG4gICAqICAgLnRoZW4oKGFycmF5TGlzdCkgPT4gLi4uICk7XG4gICAqL1xuICBnZXRMaXN0KGNvbmZpZykge1xuICAgIGxldCByZXR1cm5BbGwgPSB0cnVlO1xuXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGNvbmZpZykpIHtcbiAgICAgIGNvbmZpZyA9IFtjb25maWddO1xuICAgICAgcmV0dXJuQWxsID0gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhY2sgPSBjb25maWcubWFwKChpdGVtKSA9PiB7XG4gICAgICBpZiAoaXNTdHJpbmcoaXRlbSkpXG4gICAgICAgIGl0ZW0gPSB7IHBhdGg6IGl0ZW0gfTtcblxuICAgICAgY29uc3QgeyBwYXRoLCBtYXRjaCwgcmVjdXJzaXZlLCBkaXJlY3RvcmllcyB9ID0gaXRlbTtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRMaXN0KHBhdGgsIG1hdGNoLCByZWN1cnNpdmUsIGRpcmVjdG9yaWVzKTtcbiAgICB9KTtcblxuICAgIGlmIChyZXR1cm5BbGwgPT09IGZhbHNlKVxuICAgICAgcmV0dXJuIHN0YWNrWzBdOyAvLyBhIHNpbmdsZSBwcm9taXNlXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHN0YWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBsaXN0IG9mIGZpbGVzIGluc2lkZSBhIGdpdmVuIGRpcmVjdG9yeS5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggLSBUaGUgZGlyZWN0b3J5IHRvIHNlYXJjaCBpbnRvLlxuICAgKiBAcGFyYW0ge1JlZ0V4cH0gW21hdGNoPScqJ10gLSBBIFJlZ0V4cCB0byBmaWx0ZXIgdGhlIHJlc3VsdHMgKHRoZVxuICAgKiAgd2lsZGNhcmQgJyonIGlzIGFjY2VwdGVkKS5cbiAgICogQHBhcmFtIHtCb29sZWFufSBbcmVjdXJzaXZlPWZhbHNlXSAtIERlZmluZSBpZiB0aGUgc2VhcmNoIHNob3VsZCBiZVxuICAgKiAgcmVjdXJzaXZlIG9yIG5vdFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtkaXJlY3Rvcmllcz1mYWxzZV0gLSBEZWZpbmUgaWYgdGhlIHJlc3VsdCBzaG91bGQgY29udGFpblxuICAgKiAgYSBsaXN0IG9mIGZpbGVzIG9yIGEgbGlzdCBvZiBkaXJlY3Rvcmllcy5cbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZ2V0TGlzdChwYXRoID0gbnVsbCwgbWF0Y2ggPSAnKicsIHJlY3Vyc2l2ZSA9IGZhbHNlLCBkaXJlY3RvcmllcyA9IGZhbHNlKSB7XG4gICAgaWYgKHBhdGggPT09IG51bGwpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7U0VSVklDRV9JRH0gLSBwYXRoIG5vdCBkZWZpbmVkYCk7XG5cbiAgICAvLyB3aWxjYXJkXG4gICAgaWYgKG1hdGNoID09PSAnKicpXG4gICAgICBtYXRjaCA9IC8uKi87XG5cbiAgICBjb25zdCBrZXkgPSBgJHtwYXRofToke21hdGNofToke3JlY3Vyc2l2ZX06JHtkaXJlY3Rvcmllc31gO1xuXG4gICAgaWYgKHRoaXMuX2VuYWJsZUNhY2hlICYmIHRoaXMuX2NhY2hlW2tleV0pXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2NhY2hlW2tleV0pO1xuXG4gICAgY29uc3QgdGVzdEN3ZCA9IG5ldyBSZWdFeHAoYF4ke2N3ZH1gKTtcbiAgICBsZXQgZGlyID0gX3BhdGgubm9ybWFsaXplKHBhdGgpO1xuICAgIGxldCByZXN1bHRzID0gW107XG5cbiAgICAvLyBtYWtlIHRoZSBnaXZlbiBwYXRoIGFic29sdXRlIGlmIG5vdFxuICAgIGlmICghdGVzdEN3ZC50ZXN0KGRpcikpXG4gICAgICBkaXIgPSBfcGF0aC5qb2luKGN3ZCwgZGlyKTtcblxuICAgIGNvbnNvbGUubG9nKGRpcik7XG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGtsYXcoZGlyKVxuICAgICAgICAub24oJ2RhdGEnLCAoaXRlbSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGJhc2VuYW1lID0gX3BhdGguYmFzZW5hbWUoaXRlbS5wYXRoKTtcbiAgICAgICAgICBjb25zdCBkaXJuYW1lID0gX3BhdGguZGlybmFtZShpdGVtLnBhdGgpO1xuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgLy8gaWdub3JlIGN1cnJlbnQgZGlyZWN0b3J5XG4gICAgICAgICAgICBpdGVtLnBhdGggPT09IGRpciB8fMKgXG4gICAgICAgICAgICAvLyBpZ25vcmUgY29tbW9uIGhpZGRlbiBzeXN0ZW0gZmlsZSBwYXR0ZXJuc1xuICAgICAgICAgICAgYmFzZW5hbWUgPT09ICd0aHVtYnMuZGInIHx8XG4gICAgICAgICAgICAvXlxcLi8udGVzdChiYXNlbmFtZSkgPT09IHRydWVcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAoZGlyZWN0b3JpZXMgJiYgaXRlbS5zdGF0cy5pc0RpcmVjdG9yeSgpKSB8fMKgXG4gICAgICAgICAgICAoIWRpcmVjdG9yaWVzICYmIGl0ZW0uc3RhdHMuaXNGaWxlKCkpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBpZiAocmVjdXJzaXZlIHx8wqAoIXJlY3Vyc2l2ZSAmJiBkaXJuYW1lID09PSBkaXIpKVxuICAgICAgICAgICAgICByZXN1bHRzLnB1c2goaXRlbS5wYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgLy8gcmVtb3ZlIGBkaXJgIHRoZSBwYXRocyBhbmQgdGVzdCBhZ2FpbnN0IHRoZSByZWdFeHBcbiAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5maWx0ZXIoKGVudHJ5KSA9PiB7XG4gICAgICAgICAgICBlbnRyeSA9IGVudHJ5LnJlcGxhY2UoX3BhdGguam9pbihkaXIsIF9wYXRoLnNlcCksICcnKTtcbiAgICAgICAgICAgIHJldHVybiBtYXRjaC50ZXN0KGVudHJ5KTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIGtlZXAgaW4gY2FjaGUgYW5kIHJlc29sdmUgcHJvbWlzZVxuICAgICAgICAgIGlmICh0aGlzLl9lbmFibGVDYWNoZSlcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlW2tleV0gPSByZXN1bHRzO1xuXG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHRzKTtcbiAgICAgICAgfSkub24oJ2Vycm9yJywgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihTRVJWSUNFX0lELCAnLScsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIF9vblJlcXVlc3QoY2xpZW50KSB7XG4gICAgcmV0dXJuIChpZCwgY29uZmlnKSA9PiB7XG4gICAgICAvLyB1bnNlcmlhbGl6ZSB0aGUganNvbiBjb25maWcgdG8gcmV0dXJuIHByb3BlciBSZWdFeHAsIGFkYXB0ZWQgZnJvbTpcbiAgICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTIwNzU5Mjcvc2VyaWFsaXphdGlvbi1vZi1yZWdleHAjYW5zd2VyLTMzNDE2Njg0XG4gICAgICBjb25maWcgPSBKU09OLnBhcnNlKGNvbmZpZywgZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAoa2V5ID09PSAnbWF0Y2gnICYmIHZhbHVlLnRvU3RyaW5nKCkuaW5kZXhPZignX19SRUdFWFAgJykgPT09IDApIHtcbiAgICAgICAgICBjb25zdCBmcmFnbWVudHMgPSB2YWx1ZS5zcGxpdCgnX19SRUdFWFAgJylbMV0ubWF0Y2goL1xcLyguKj8pXFwvKFtnaW15XSk/JC8pO1xuICAgICAgICAgIGNvbnN0IHBhdHRlcm4gPSBmcmFnbWVudHNbMV0ucmVwbGFjZSgnXFxcXFxcXFwnLCAnXFxcXCcpO1xuICAgICAgICAgIGNvbnN0IGZsYWcgPSBmcmFnbWVudHNbMl0gfHzCoCcnO1xuICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKHBhdHRlcm4sIGZsYWcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHRlc3RDd2QgPSBuZXcgUmVnRXhwKGBeJHtjd2R9YCk7XG4gICAgICBsZXQgcHVibGljRGlyID0gdGhpcy5fcHVibGljRGlyO1xuXG4gICAgICBpZiAoIXRlc3RDd2QudGVzdChwdWJsaWNEaXIpKVxuICAgICAgICBwdWJsaWNEaXIgPSBfcGF0aC5qb2luKGN3ZCwgcHVibGljRGlyKTtcblxuICAgICAgLy8gZm9yY2UgdGhlIHNlYXJjaCBpbiB0aGUgcHVibGljIGRpcmVjdG9yeVxuICAgICAgZnVuY3Rpb24gcHJlcGVuZFBhdGgoaXRlbSkge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShpdGVtKSlcbiAgICAgICAgICByZXR1cm4gaXRlbS5tYXAocHJlcGVuZFBhdGgpO1xuXG4gICAgICAgIGlmIChpc1N0cmluZyhpdGVtKSlcbiAgICAgICAgICBpdGVtID0gX3BhdGguam9pbihwdWJsaWNEaXIsIGl0ZW0pO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgaXRlbS5wYXRoID0gX3BhdGguam9pbihwdWJsaWNEaXIsIGl0ZW0ucGF0aCk7XG5cbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICB9XG5cbiAgICAgIGNvbmZpZyA9IHByZXBlbmRQYXRoKGNvbmZpZyk7XG5cbiAgICAgIC8vIGdldCByZXN1bHRzXG4gICAgICB0aGlzLmdldExpc3QoY29uZmlnKVxuICAgICAgICAudGhlbigocmVzdWx0cykgPT4ge1xuICAgICAgICAgIGZ1bmN0aW9uIGZvcm1hdFRvVXJsKGVudHJ5KSB7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShlbnRyeSkpXG4gICAgICAgICAgICAgIHJldHVybiBlbnRyeS5tYXAoZm9ybWF0VG9VcmwpO1xuXG4gICAgICAgICAgICBlbnRyeSA9IGVudHJ5LnJlcGxhY2UocHVibGljRGlyLCAnJyk7XG4gICAgICAgICAgICBlbnRyeSA9IGVudHJ5LnJlcGxhY2UoJ1xcXFwnLCAnLycpOyAvLyB3aW5kb3cgcGF0aHMgdG8gdXJsXG5cbiAgICAgICAgICAgIGlmICghL15cXC8vLnRlc3QoZW50cnkpKVxuICAgICAgICAgICAgICBlbnRyeSA9ICcvJyArIGVudHJ5O1xuXG4gICAgICAgICAgICByZXR1cm4gZW50cnk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gcmVtb3ZlIGFsbCBmaWxlIHN5c3RlbSBpbmZvcm1hdGlvbnMgYW5kIGNyZWF0ZSBhbiBhYnNvbHV0ZSB1cmxcbiAgICAgICAgICByZXN1bHRzID0gZm9ybWF0VG9VcmwocmVzdWx0cyk7XG5cbiAgICAgICAgICB0aGlzLnNlbmQoY2xpZW50LCBgbGlzdDoke2lkfWAsIHJlc3VsdHMpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycikgPT4gY29uc29sZS5lcnJvcihlcnIuc3RhY2spKTtcbiAgICB9O1xuICB9XG59XG5cbnNlcnZpY2VNYW5hZ2VyLnJlZ2lzdGVyKFNFUlZJQ0VfSUQsIEZpbGVTeXN0ZW0pO1xuXG5leHBvcnQgZGVmYXVsdCBGaWxlU3lzdGVtO1xuIl19