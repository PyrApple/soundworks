'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

var SERVICE_ID = 'service:file-system';
var isString = function isString(value) {
  return typeof value === 'string' || value instanceof String;
};

/**
 * Interface for the client `'file-system'` service.
 *
 * This service allow to retrieve a list of files or directories from a given path.
 * If a `list` option is given when requiring the service, the service marks
 * itself as `ready` when the file list is returned by the server.
 * The service can be used later to retrieve new file lists, each required list is
 * cached client-side to prevent useless network traffic.
 *
 * @param {Object} options
 * @param {String|module:soundworks/client.FileSystem~ListConfig|Array<String>|Array<module:soundworks/client.FileSystem~ListConfig>} option.list -
 *  List to
 *
 * __*The service must be used with its [client-side counterpart]{@link module:soundworks/client.FileSystem}*__
 *
 * @memberof module:soundworks/client
 * @example
 * // require and configure the `file-system` service inside the experience
 * // constructor, the file list to be retrive can be configured as a simple string
 * this.fileSystem = this.require('file-system', { list: 'audio' });
 * // ... or as a full {@link module:soundworks/client.FileSystem~ListConfig}
 * // object for better control over the returned file list
 * this.fileSystem = this.require('file-system', { list: {
 *     path: 'audio',
 *     match: /\.wav$/,
 *     recursive: true,
 *   }
 * });
 *
 * // given the following file system
 * // audio/
 * //   voice.mp3
 * //   voice.wav
 * //   drum/
 * //     kick.mp3
 * //     kick.wav
 * // the first query will return the following result:
 * > ['/audio/voice.mp3', 'audio/voice.wav']
 * // while the second one will return:
 * > ['/audio/voice.wav', 'audio/drum/kick.wav']
 *
 * @see {@link module:soundworks/client.FileSystem~ListConfig}
 */

var FileSystem = function (_Service) {
  (0, _inherits3.default)(FileSystem, _Service);

  /** _<span class="warning">__WARNING__</span> This class should never be instanciated manually_ */
  function FileSystem() {
    (0, _classCallCheck3.default)(this, FileSystem);

    var _this = (0, _possibleConstructorReturn3.default)(this, (FileSystem.__proto__ || (0, _getPrototypeOf2.default)(FileSystem)).call(this, SERVICE_ID, true));

    var defaults = { list: null };
    _this.configure(defaults);

    _this._cache = {};
    // as file system is async (server side), nothing guarantees response order
    _this._requestId = 0;
    return _this;
  }

  (0, _createClass3.default)(FileSystem, [{
    key: 'init',
    value: function init() {
      if (this.options.list !== null) this.getList(this.options.list);else this.ready();
    }
  }, {
    key: 'start',
    value: function start() {
      (0, _get3.default)(FileSystem.prototype.__proto__ || (0, _getPrototypeOf2.default)(FileSystem.prototype), 'start', this).call(this);

      if (!this.hasStarted) this.init();
    }
  }, {
    key: 'stop',
    value: function stop() {
      (0, _get3.default)(FileSystem.prototype.__proto__ || (0, _getPrototypeOf2.default)(FileSystem.prototype), 'stop', this).call(this);
    }

    /**
     * @typedef {Object} module:soundworks/client.FileSystem~ListConfig
     * @property {String} path - Name of the folder to search into.
     * @property {RegExp} [match='*'] - RegExp used to filter the results.
     * @property {Boolean} [recursive=false] - Flag whether the search should be
     *  recursive.
     * @property {Boolean} [directories=false] - If true only return directories,
     *  files otherwise.
     */
    /**
     * Return a list of file according to the given configuration.
     *
     * @param {String|module:soundworks/client.FileSystem~ListConfig|Array<String>|Array<module:soundworks/client.FileSystem~ListConfig>} config -
     *  Details of the requested list(s). The requested files or directories must
     *  be publicly accessible.
     * @return {Promise<Array>|Promise<Array<Array>>} - Promise resolving with an
     *  an array containing the absolute urls of the files or directories.
     *  If `config` is an array, the results will be an array of arrays
     *  containing the result of each different request.
     *
     * @example:
     * // 1. Single list
     * // retrieve all the file in a folder
     * fileSystem.getList('my-directory').then((list) => ... );
     * // or, retrieve all the `.wav` files inside a given folder,
     * //search recursively
     * fileSystem.getList({
     *   path: 'my-directory',
     *   match: /\.wav/,
     *   recursive: true,
     * }).then((list) => ... );
     *
     * // 2. Multiple Requests
     * // retrieve all the file in 2 different folders, the returned value will be
     * // an array containing the 2 lists
     * fileSystem.getList(['my-directory1', 'my-directory2'])
     *   .then((lists) => ... );
     * // or
     * fileSystem.getList([{ ... }, { ... }])
     *   .then((lists) => ... );
     */

  }, {
    key: 'getList',
    value: function getList(config) {
      var _this2 = this;

      // serialize the json config to properly handle RegExp, adapted from:
      // http://stackoverflow.com/questions/12075927/serialization-of-regexp#answer-33416684
      var _config = (0, _stringify2.default)(config, function (key, value) {
        if (value instanceof RegExp) return '__REGEXP ' + value.toString();else return value;
      });

      var key = isString(config) ? config : _config;

      if (this._cache[key]) return this._cache[key];

      var promise = new _promise2.default(function (resolve, reject) {
        var id = _this2._requestId;
        var channel = 'list:' + id;
        _this2._requestId += 1;

        _this2.receive(channel, function (results) {
          // @note - socket.io remove the first listener if no func argument given
          //         should be done properly -> update socket and Activity
          _this2.removeListener(channel);
          resolve(results);

          if (_this2.options.list !== null && channel === 'list:0') _this2.fileList = results;
          _this2.ready();
        });

        _this2.send('request', id, _config);

        _this2._requestId += 1;
      });

      this._cache[key] = promise;
      return promise;
    }
  }]);
  return FileSystem;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, FileSystem);

exports.default = FileSystem;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVTeXN0ZW0uanMiXSwibmFtZXMiOlsiU0VSVklDRV9JRCIsImlzU3RyaW5nIiwidmFsdWUiLCJTdHJpbmciLCJGaWxlU3lzdGVtIiwiZGVmYXVsdHMiLCJsaXN0IiwiY29uZmlndXJlIiwiX2NhY2hlIiwiX3JlcXVlc3RJZCIsIm9wdGlvbnMiLCJnZXRMaXN0IiwicmVhZHkiLCJoYXNTdGFydGVkIiwiaW5pdCIsImNvbmZpZyIsIl9jb25maWciLCJrZXkiLCJSZWdFeHAiLCJ0b1N0cmluZyIsInByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiaWQiLCJjaGFubmVsIiwicmVjZWl2ZSIsInJlc3VsdHMiLCJyZW1vdmVMaXN0ZW5lciIsImZpbGVMaXN0Iiwic2VuZCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7OztBQUVBLElBQU1BLGFBQWEscUJBQW5CO0FBQ0EsSUFBTUMsV0FBVyxTQUFYQSxRQUFXLENBQUNDLEtBQUQ7QUFBQSxTQUFZLE9BQU9BLEtBQVAsS0FBaUIsUUFBakIsSUFBNkJBLGlCQUFpQkMsTUFBMUQ7QUFBQSxDQUFqQjs7QUFHQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUEyQ01DLFU7OztBQUNKO0FBQ0Esd0JBQWM7QUFBQTs7QUFBQSw4SUFDTkosVUFETSxFQUNNLElBRE47O0FBR1osUUFBTUssV0FBVyxFQUFFQyxNQUFNLElBQVIsRUFBakI7QUFDQSxVQUFLQyxTQUFMLENBQWVGLFFBQWY7O0FBRUEsVUFBS0csTUFBTCxHQUFjLEVBQWQ7QUFDQTtBQUNBLFVBQUtDLFVBQUwsR0FBa0IsQ0FBbEI7QUFSWTtBQVNiOzs7OzJCQUVNO0FBQ0wsVUFBSSxLQUFLQyxPQUFMLENBQWFKLElBQWIsS0FBc0IsSUFBMUIsRUFDRSxLQUFLSyxPQUFMLENBQWEsS0FBS0QsT0FBTCxDQUFhSixJQUExQixFQURGLEtBR0UsS0FBS00sS0FBTDtBQUNIOzs7NEJBRU87QUFDTjs7QUFFQSxVQUFJLENBQUMsS0FBS0MsVUFBVixFQUNFLEtBQUtDLElBQUw7QUFDSDs7OzJCQUVNO0FBQ0w7QUFDRDs7QUFFRDs7Ozs7Ozs7O0FBU0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQWdDUUMsTSxFQUFRO0FBQUE7O0FBQ2Q7QUFDQTtBQUNBLFVBQU1DLFVBQVUseUJBQWVELE1BQWYsRUFBdUIsVUFBU0UsR0FBVCxFQUFjZixLQUFkLEVBQXFCO0FBQzFELFlBQUlBLGlCQUFpQmdCLE1BQXJCLEVBQ0UscUJBQW1CaEIsTUFBTWlCLFFBQU4sRUFBbkIsQ0FERixLQUdFLE9BQU9qQixLQUFQO0FBQ0gsT0FMZSxDQUFoQjs7QUFPQSxVQUFNZSxNQUFNaEIsU0FBU2MsTUFBVCxJQUFtQkEsTUFBbkIsR0FBNEJDLE9BQXhDOztBQUVBLFVBQUksS0FBS1IsTUFBTCxDQUFZUyxHQUFaLENBQUosRUFDRSxPQUFPLEtBQUtULE1BQUwsQ0FBWVMsR0FBWixDQUFQOztBQUVGLFVBQU1HLFVBQVUsc0JBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQy9DLFlBQU1DLEtBQUssT0FBS2QsVUFBaEI7QUFDQSxZQUFNZSxvQkFBa0JELEVBQXhCO0FBQ0EsZUFBS2QsVUFBTCxJQUFtQixDQUFuQjs7QUFFQSxlQUFLZ0IsT0FBTCxDQUFhRCxPQUFiLEVBQXNCLFVBQUNFLE9BQUQsRUFBYTtBQUNqQztBQUNBO0FBQ0EsaUJBQUtDLGNBQUwsQ0FBb0JILE9BQXBCO0FBQ0FILGtCQUFRSyxPQUFSOztBQUVBLGNBQUksT0FBS2hCLE9BQUwsQ0FBYUosSUFBYixLQUFzQixJQUF0QixJQUE4QmtCLFlBQVksUUFBOUMsRUFDRSxPQUFLSSxRQUFMLEdBQWdCRixPQUFoQjtBQUNBLGlCQUFLZCxLQUFMO0FBQ0gsU0FURDs7QUFXQSxlQUFLaUIsSUFBTCxDQUFVLFNBQVYsRUFBcUJOLEVBQXJCLEVBQXlCUCxPQUF6Qjs7QUFFQSxlQUFLUCxVQUFMLElBQW1CLENBQW5CO0FBQ0QsT0FuQmUsQ0FBaEI7O0FBcUJBLFdBQUtELE1BQUwsQ0FBWVMsR0FBWixJQUFtQkcsT0FBbkI7QUFDQSxhQUFPQSxPQUFQO0FBQ0Q7Ozs7O0FBR0gseUJBQWVVLFFBQWYsQ0FBd0I5QixVQUF4QixFQUFvQ0ksVUFBcEM7O2tCQUVlQSxVIiwiZmlsZSI6IkZpbGVTeXN0ZW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU2VydmljZSBmcm9tICcuLi9jb3JlL1NlcnZpY2UnO1xuaW1wb3J0IHNlcnZpY2VNYW5hZ2VyIGZyb20gJy4uL2NvcmUvc2VydmljZU1hbmFnZXInO1xuXG5jb25zdCBTRVJWSUNFX0lEID0gJ3NlcnZpY2U6ZmlsZS1zeXN0ZW0nO1xuY29uc3QgaXNTdHJpbmcgPSAodmFsdWUpID0+ICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHZhbHVlIGluc3RhbmNlb2YgU3RyaW5nKTtcblxuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIGNsaWVudCBgJ2ZpbGUtc3lzdGVtJ2Agc2VydmljZS5cbiAqXG4gKiBUaGlzIHNlcnZpY2UgYWxsb3cgdG8gcmV0cmlldmUgYSBsaXN0IG9mIGZpbGVzIG9yIGRpcmVjdG9yaWVzIGZyb20gYSBnaXZlbiBwYXRoLlxuICogSWYgYSBgbGlzdGAgb3B0aW9uIGlzIGdpdmVuIHdoZW4gcmVxdWlyaW5nIHRoZSBzZXJ2aWNlLCB0aGUgc2VydmljZSBtYXJrc1xuICogaXRzZWxmIGFzIGByZWFkeWAgd2hlbiB0aGUgZmlsZSBsaXN0IGlzIHJldHVybmVkIGJ5IHRoZSBzZXJ2ZXIuXG4gKiBUaGUgc2VydmljZSBjYW4gYmUgdXNlZCBsYXRlciB0byByZXRyaWV2ZSBuZXcgZmlsZSBsaXN0cywgZWFjaCByZXF1aXJlZCBsaXN0IGlzXG4gKiBjYWNoZWQgY2xpZW50LXNpZGUgdG8gcHJldmVudCB1c2VsZXNzIG5ldHdvcmsgdHJhZmZpYy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtTdHJpbmd8bW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LkZpbGVTeXN0ZW1+TGlzdENvbmZpZ3xBcnJheTxTdHJpbmc+fEFycmF5PG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5GaWxlU3lzdGVtfkxpc3RDb25maWc+fSBvcHRpb24ubGlzdCAtXG4gKiAgTGlzdCB0b1xuICpcbiAqIF9fKlRoZSBzZXJ2aWNlIG11c3QgYmUgdXNlZCB3aXRoIGl0cyBbY2xpZW50LXNpZGUgY291bnRlcnBhcnRde0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5GaWxlU3lzdGVtfSpfX1xuICpcbiAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnRcbiAqIEBleGFtcGxlXG4gKiAvLyByZXF1aXJlIGFuZCBjb25maWd1cmUgdGhlIGBmaWxlLXN5c3RlbWAgc2VydmljZSBpbnNpZGUgdGhlIGV4cGVyaWVuY2VcbiAqIC8vIGNvbnN0cnVjdG9yLCB0aGUgZmlsZSBsaXN0IHRvIGJlIHJldHJpdmUgY2FuIGJlIGNvbmZpZ3VyZWQgYXMgYSBzaW1wbGUgc3RyaW5nXG4gKiB0aGlzLmZpbGVTeXN0ZW0gPSB0aGlzLnJlcXVpcmUoJ2ZpbGUtc3lzdGVtJywgeyBsaXN0OiAnYXVkaW8nIH0pO1xuICogLy8gLi4uIG9yIGFzIGEgZnVsbCB7QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LkZpbGVTeXN0ZW1+TGlzdENvbmZpZ31cbiAqIC8vIG9iamVjdCBmb3IgYmV0dGVyIGNvbnRyb2wgb3ZlciB0aGUgcmV0dXJuZWQgZmlsZSBsaXN0XG4gKiB0aGlzLmZpbGVTeXN0ZW0gPSB0aGlzLnJlcXVpcmUoJ2ZpbGUtc3lzdGVtJywgeyBsaXN0OiB7XG4gKiAgICAgcGF0aDogJ2F1ZGlvJyxcbiAqICAgICBtYXRjaDogL1xcLndhdiQvLFxuICogICAgIHJlY3Vyc2l2ZTogdHJ1ZSxcbiAqICAgfVxuICogfSk7XG4gKlxuICogLy8gZ2l2ZW4gdGhlIGZvbGxvd2luZyBmaWxlIHN5c3RlbVxuICogLy8gYXVkaW8vXG4gKiAvLyAgIHZvaWNlLm1wM1xuICogLy8gICB2b2ljZS53YXZcbiAqIC8vICAgZHJ1bS9cbiAqIC8vICAgICBraWNrLm1wM1xuICogLy8gICAgIGtpY2sud2F2XG4gKiAvLyB0aGUgZmlyc3QgcXVlcnkgd2lsbCByZXR1cm4gdGhlIGZvbGxvd2luZyByZXN1bHQ6XG4gKiA+IFsnL2F1ZGlvL3ZvaWNlLm1wMycsICdhdWRpby92b2ljZS53YXYnXVxuICogLy8gd2hpbGUgdGhlIHNlY29uZCBvbmUgd2lsbCByZXR1cm46XG4gKiA+IFsnL2F1ZGlvL3ZvaWNlLndhdicsICdhdWRpby9kcnVtL2tpY2sud2F2J11cbiAqXG4gKiBAc2VlIHtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuRmlsZVN5c3RlbX5MaXN0Q29uZmlnfVxuICovXG5jbGFzcyBGaWxlU3lzdGVtIGV4dGVuZHMgU2VydmljZSB7XG4gIC8qKiBfPHNwYW4gY2xhc3M9XCJ3YXJuaW5nXCI+X19XQVJOSU5HX188L3NwYW4+IFRoaXMgY2xhc3Mgc2hvdWxkIG5ldmVyIGJlIGluc3RhbmNpYXRlZCBtYW51YWxseV8gKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoU0VSVklDRV9JRCwgdHJ1ZSk7XG5cbiAgICBjb25zdCBkZWZhdWx0cyA9IHsgbGlzdDogbnVsbCB9O1xuICAgIHRoaXMuY29uZmlndXJlKGRlZmF1bHRzKTtcblxuICAgIHRoaXMuX2NhY2hlID0ge307XG4gICAgLy8gYXMgZmlsZSBzeXN0ZW0gaXMgYXN5bmMgKHNlcnZlciBzaWRlKSwgbm90aGluZyBndWFyYW50ZWVzIHJlc3BvbnNlIG9yZGVyXG4gICAgdGhpcy5fcmVxdWVzdElkID0gMDtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5saXN0ICE9PSBudWxsKVxuICAgICAgdGhpcy5nZXRMaXN0KHRoaXMub3B0aW9ucy5saXN0KTtcbiAgICBlbHNlXG4gICAgICB0aGlzLnJlYWR5KCk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuXG4gICAgaWYgKCF0aGlzLmhhc1N0YXJ0ZWQpXG4gICAgICB0aGlzLmluaXQoKTtcbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgc3VwZXIuc3RvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5GaWxlU3lzdGVtfkxpc3RDb25maWdcbiAgICogQHByb3BlcnR5IHtTdHJpbmd9IHBhdGggLSBOYW1lIG9mIHRoZSBmb2xkZXIgdG8gc2VhcmNoIGludG8uXG4gICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBbbWF0Y2g9JyonXSAtIFJlZ0V4cCB1c2VkIHRvIGZpbHRlciB0aGUgcmVzdWx0cy5cbiAgICogQHByb3BlcnR5IHtCb29sZWFufSBbcmVjdXJzaXZlPWZhbHNlXSAtIEZsYWcgd2hldGhlciB0aGUgc2VhcmNoIHNob3VsZCBiZVxuICAgKiAgcmVjdXJzaXZlLlxuICAgKiBAcHJvcGVydHkge0Jvb2xlYW59IFtkaXJlY3Rvcmllcz1mYWxzZV0gLSBJZiB0cnVlIG9ubHkgcmV0dXJuIGRpcmVjdG9yaWVzLFxuICAgKiAgZmlsZXMgb3RoZXJ3aXNlLlxuICAgKi9cbiAgLyoqXG4gICAqIFJldHVybiBhIGxpc3Qgb2YgZmlsZSBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5GaWxlU3lzdGVtfkxpc3RDb25maWd8QXJyYXk8U3RyaW5nPnxBcnJheTxtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuRmlsZVN5c3RlbX5MaXN0Q29uZmlnPn0gY29uZmlnIC1cbiAgICogIERldGFpbHMgb2YgdGhlIHJlcXVlc3RlZCBsaXN0KHMpLiBUaGUgcmVxdWVzdGVkIGZpbGVzIG9yIGRpcmVjdG9yaWVzIG11c3RcbiAgICogIGJlIHB1YmxpY2x5IGFjY2Vzc2libGUuXG4gICAqIEByZXR1cm4ge1Byb21pc2U8QXJyYXk+fFByb21pc2U8QXJyYXk8QXJyYXk+Pn0gLSBQcm9taXNlIHJlc29sdmluZyB3aXRoIGFuXG4gICAqICBhbiBhcnJheSBjb250YWluaW5nIHRoZSBhYnNvbHV0ZSB1cmxzIG9mIHRoZSBmaWxlcyBvciBkaXJlY3Rvcmllcy5cbiAgICogIElmIGBjb25maWdgIGlzIGFuIGFycmF5LCB0aGUgcmVzdWx0cyB3aWxsIGJlIGFuIGFycmF5IG9mIGFycmF5c1xuICAgKiAgY29udGFpbmluZyB0aGUgcmVzdWx0IG9mIGVhY2ggZGlmZmVyZW50IHJlcXVlc3QuXG4gICAqXG4gICAqIEBleGFtcGxlOlxuICAgKiAvLyAxLiBTaW5nbGUgbGlzdFxuICAgKiAvLyByZXRyaWV2ZSBhbGwgdGhlIGZpbGUgaW4gYSBmb2xkZXJcbiAgICogZmlsZVN5c3RlbS5nZXRMaXN0KCdteS1kaXJlY3RvcnknKS50aGVuKChsaXN0KSA9PiAuLi4gKTtcbiAgICogLy8gb3IsIHJldHJpZXZlIGFsbCB0aGUgYC53YXZgIGZpbGVzIGluc2lkZSBhIGdpdmVuIGZvbGRlcixcbiAgICogLy9zZWFyY2ggcmVjdXJzaXZlbHlcbiAgICogZmlsZVN5c3RlbS5nZXRMaXN0KHtcbiAgICogICBwYXRoOiAnbXktZGlyZWN0b3J5JyxcbiAgICogICBtYXRjaDogL1xcLndhdi8sXG4gICAqICAgcmVjdXJzaXZlOiB0cnVlLFxuICAgKiB9KS50aGVuKChsaXN0KSA9PiAuLi4gKTtcbiAgICpcbiAgICogLy8gMi4gTXVsdGlwbGUgUmVxdWVzdHNcbiAgICogLy8gcmV0cmlldmUgYWxsIHRoZSBmaWxlIGluIDIgZGlmZmVyZW50IGZvbGRlcnMsIHRoZSByZXR1cm5lZCB2YWx1ZSB3aWxsIGJlXG4gICAqIC8vIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIDIgbGlzdHNcbiAgICogZmlsZVN5c3RlbS5nZXRMaXN0KFsnbXktZGlyZWN0b3J5MScsICdteS1kaXJlY3RvcnkyJ10pXG4gICAqICAgLnRoZW4oKGxpc3RzKSA9PiAuLi4gKTtcbiAgICogLy8gb3JcbiAgICogZmlsZVN5c3RlbS5nZXRMaXN0KFt7IC4uLiB9LCB7IC4uLiB9XSlcbiAgICogICAudGhlbigobGlzdHMpID0+IC4uLiApO1xuICAgKi9cbiAgZ2V0TGlzdChjb25maWcpIHtcbiAgICAvLyBzZXJpYWxpemUgdGhlIGpzb24gY29uZmlnIHRvIHByb3Blcmx5IGhhbmRsZSBSZWdFeHAsIGFkYXB0ZWQgZnJvbTpcbiAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEyMDc1OTI3L3NlcmlhbGl6YXRpb24tb2YtcmVnZXhwI2Fuc3dlci0zMzQxNjY4NFxuICAgIGNvbnN0IF9jb25maWcgPSBKU09OLnN0cmluZ2lmeShjb25maWcsIGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFJlZ0V4cClcbiAgICAgICAgcmV0dXJuIGBfX1JFR0VYUCAke3ZhbHVlLnRvU3RyaW5nKCl9YDtcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0pO1xuXG4gICAgY29uc3Qga2V5ID0gaXNTdHJpbmcoY29uZmlnKSA/IGNvbmZpZyA6IF9jb25maWc7XG5cbiAgICBpZiAodGhpcy5fY2FjaGVba2V5XSlcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZVtrZXldO1xuXG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IGlkID0gdGhpcy5fcmVxdWVzdElkO1xuICAgICAgY29uc3QgY2hhbm5lbCA9IGBsaXN0OiR7aWR9YDtcbiAgICAgIHRoaXMuX3JlcXVlc3RJZCArPSAxO1xuXG4gICAgICB0aGlzLnJlY2VpdmUoY2hhbm5lbCwgKHJlc3VsdHMpID0+IHtcbiAgICAgICAgLy8gQG5vdGUgLSBzb2NrZXQuaW8gcmVtb3ZlIHRoZSBmaXJzdCBsaXN0ZW5lciBpZiBubyBmdW5jIGFyZ3VtZW50IGdpdmVuXG4gICAgICAgIC8vICAgICAgICAgc2hvdWxkIGJlIGRvbmUgcHJvcGVybHkgLT4gdXBkYXRlIHNvY2tldCBhbmQgQWN0aXZpdHlcbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcihjaGFubmVsKTtcbiAgICAgICAgcmVzb2x2ZShyZXN1bHRzKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmxpc3QgIT09IG51bGwgJiYgY2hhbm5lbCA9PT0gJ2xpc3Q6MCcpXG4gICAgICAgICAgdGhpcy5maWxlTGlzdCA9IHJlc3VsdHM7XG4gICAgICAgICAgdGhpcy5yZWFkeSgpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2VuZCgncmVxdWVzdCcsIGlkLCBfY29uZmlnKTtcblxuICAgICAgdGhpcy5fcmVxdWVzdElkICs9IDE7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9jYWNoZVtrZXldID0gcHJvbWlzZTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxufVxuXG5zZXJ2aWNlTWFuYWdlci5yZWdpc3RlcihTRVJWSUNFX0lELCBGaWxlU3lzdGVtKTtcblxuZXhwb3J0IGRlZmF1bHQgRmlsZVN5c3RlbTtcbiJdfQ==