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

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _wavesAudio = require('waves-audio');

var _wavesLoaders = require('waves-loaders');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _path2 = require('path');

var _path3 = _interopRequireDefault(_path2);

var _SegmentedView2 = require('../views/SegmentedView');

var _SegmentedView3 = _interopRequireDefault(_SegmentedView2);

var _Service2 = require('../core/Service');

var _Service3 = _interopRequireDefault(_Service2);

var _serviceManager = require('../core/serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SERVICE_ID = 'service:audio-buffer-manager';
var log = (0, _debug2.default)('soundworks:services:audio-buffer-manager');

var defaultViewTemplate = '\n<div class="section-top flex-middle">\n  <p><%= status %></p>\n</div>\n<div class="section-center flex-center">\n  <% if (showProgress) { %>\n  <div class="progress-wrap">\n    <div class="progress-bar"></div>\n  </div>\n  <% } %>\n</div>\n<div class="section-bottom"></div>';

var defaultViewContent = {
  status: null,
  loading: 'Loading sounds...',
  decoding: 'Decoding sounds...'
};

function flattenLists(a) {
  var ret = [];
  var fun = function fun(val) {
    return Array.isArray(val) ? val.forEach(fun) : ret.push(val);
  };
  fun(a);
  return ret;
}

function clonePathObj(value) {
  if ((typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)) === 'object') {
    var className = value.constructor.name;
    var clone = null;

    if (className === 'Object') clone = {};else if (className === 'Array') clone = [];else return value;

    for (var key in value) {
      clone[key] = clonePathObj(value[key]);
    }return clone;
  }

  return value;
}

var regexp = /\.[a-zA-Z0-9]{3,4}$/;

function isFilePath(str) {
  return typeof str === 'string' && regexp.test(str);
}

function isDirSpec(obj) {
  return (typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) === 'object' && typeof obj.path === 'string';
}

function decomposePathObj(obj, pathList, refList) {
  var dirs = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  for (var key in obj) {
    var value = obj[key];

    if (!dirs && isFilePath(value) || dirs && isDirSpec(value)) {
      var ref = { obj: obj, key: key };
      var index = -1;

      if (!dirs) index = pathList.indexOf(value);

      if (index === -1) {
        var length = pathList.push(value);

        index = length - 1;
        refList[index] = [];
      }

      refList[index].push(ref);

      obj[key] = null;
    } else if ((typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)) === 'object') {
      decomposePathObj(value, pathList, refList, dirs);
    }
  }
}

function populateRefList(refList, loadedObjList) {
  var length = refList.length;

  if (length !== loadedObjList.length) {
    throw new Error('[' + SERVICE_ID + '] Loaded Buffers do not match file definion');
  }

  for (var i = 0; i < length; i++) {
    var refs = refList[i];

    for (var j = 0, l = refs.length; j < l; j++) {
      var ref = refs[j];
      var obj = ref.obj;
      var key = ref.key;

      obj[key] = loadedObjList[i];
    }
  }
}

function createObjFromPathList(pathList, commonPath) {
  var obj = [];

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)(pathList), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var path = _step.value;

      var subPathIndex = path.indexOf(commonPath);

      if (subPathIndex >= 0) {
        subPathIndex += commonPath.length;

        if (path[subPathIndex] === '/') subPathIndex++;

        var subPath = path.substring(subPathIndex);
        var nodes = subPath.split('/');
        var depth = nodes.length;
        var ref = obj;
        var i = void 0;

        for (i = 0; i < depth - 1; i++) {
          var key = nodes[i];

          if (ref[key] === undefined) ref[key] = [];

          ref = ref[key];
        }

        ref.push(path);
      }

      // transform empty array to object
      if (obj.length === 0) obj = (0, _assign2.default)({}, obj);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return obj;
}

function prefixPaths(pathList, prefix) {
  // test absolute urls (or protocol relative)
  var isAbsolute = /^https?:\/\/|^\/\//i;

  pathList = pathList.map(function (path) {
    if (isAbsolute.test(path) || path[0] === '/') return path;else return prefix + path;
  });

  return pathList;
}

/**
 * Interface for the view of the `audio-buffer-manager` service.
 *
 * @interface AbstractAudioBufferManagerView
 * @extends module:soundworks/client.View
 */
/**
 * Method called when a new information about the currently loaded assets
 * is received.
 *
 * @function
 * @name AbstractAudioBufferManagerView.onProgress
 * @param {Number} percent - The purcentage of loaded assets.
 */

var AudioBufferManagerView = function (_SegmentedView) {
  (0, _inherits3.default)(AudioBufferManagerView, _SegmentedView);

  function AudioBufferManagerView() {
    var _ref;

    (0, _classCallCheck3.default)(this, AudioBufferManagerView);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = (0, _possibleConstructorReturn3.default)(this, (_ref = AudioBufferManagerView.__proto__ || (0, _getPrototypeOf2.default)(AudioBufferManagerView)).call.apply(_ref, [this].concat(args)));

    _this.content.status = _this.content.loading;
    return _this;
  }

  (0, _createClass3.default)(AudioBufferManagerView, [{
    key: 'onRender',
    value: function onRender() {
      (0, _get3.default)(AudioBufferManagerView.prototype.__proto__ || (0, _getPrototypeOf2.default)(AudioBufferManagerView.prototype), 'onRender', this).call(this);
      this.$progressBar = this.$el.querySelector('.progress-bar');
    }
  }, {
    key: 'onProgress',
    value: function onProgress(percent) {
      if (percent === 100) {
        this.content.status = this.content.decoding;
        this.render('.section-top');
      }

      if (this.content.showProgress) this.$progressBar.style.width = percent + '%';
    }
  }]);
  return AudioBufferManagerView;
}(_SegmentedView3.default);

/**
 * Interface for the client `'audio-buffer-manager'` service.
 *
 * This service allows to preload files and store them into buffers
 * before the beginning of the experience. Audio files will be converted and
 * stored into AudioBuffer objects.
 *
 * @param {Object} options
 * @param {Array<String>} options.assetsDomain - Prefix concatenated to all
 *  given paths.
 * @param {Object} options.files - Definition of files to load.
 * @param {Object} options.directories - Definition of directories to load.
 * @param {Array<String>} options.directories - List of directories to load.
 * @param {Boolean} [options.showProgress=true] - Display the progress bar
 *  in the view.
 * @param {String|module:soundworks/client.FileSystem~ListConfig} [options.directories=null] -
 *  Load all the files in particular directories. If setted this option relies
 *  on the {@link module:soundworks/client.FileSystem} which itself relies on
 *  its server counterpart, the audio-buffer-manager can then no longer be
 *  considered as a client-only service.
 *
 * @memberof module:soundworks/client
 * @example
 * // require and configure the `audio-buffer-manager` inside the experience
 * // constructor
 * // Defining a single array of audio files results in a single
 * // array of audio buffers associated to the identifier `default`.
 *
 * // There are two different ways to specify the files to be loaded and the
 * // data structure in which the loaded data objects are arranged:
 * //
 * // (1.) With the 'files' option, the files and structure are defined by an
 * // object of any depth that contains file paths. All specified files are
 * // loaded and the loaded data objects are stored into an object of the same
 * // structure as the definition object.
 *
 * this.audioBufferManager = this.require('audio-buffer-manager', { files: [
 *   'sounds/drums/kick.mp3',
 *   'sounds/drums/snare.mp3'
 * ]});
 *
 * this.audioBufferManager = this.require('audio-buffer-manager', { files: {
 *   kick: 'sounds/kick_44kHz.mp3',
 *   snare: 'sounds/808snare.mp3'
 * }});
 *
 * this.audioBufferManager = this.require('audio-buffer-manager', { files: {
 *   latin: {
 *     audio: 'loops/sheila-e-raspberry.mp3',
 *     markers: 'loops/sheila-e-raspberry-markers.json',
 *   },
 *   jazz: {
 *     audio: 'loops/nussbaum-shuffle.mp3',
 *     markers: 'loops/nussbaum-shuffle-markers.json',
 *   },
 * }});
 *
 * this.audioBufferManager = this.require('audio-buffer-manager', { files: {
 *   instruments: [
 *     'sounds/instruments/kick_44kHz.mp3',
 *     'sounds/instruments/808snare.mp3'],
 *   loops: [
 *     'sounds/loops/sheila-e-raspberry.mp3',
 *     'sounds/loops/nussbaum-shuffle.mp3'],
 * }});
 *
 * //(2.) The 'directories' option can be used to load the files of a
 * // given directory. Each directory is specified by an object that has a
 * // property 'path' with the directory path and optionally the keys
 * // 'recursive' (specifying whether the directory's sub-directories are
 * // considered) and a key 'match' (specifying a regexp to select the files
 * // in the given directory).
 *
 * // With the option 'recursive' set to false, all (matching) files
 * // in a given directoriy are loaded into an arrays of objects without
 * // considering sub-directories. The arrays of loaded data objects are
 * // arranged in the same data structure as the definition object.
 *
 * this.audioBufferManager = this.require('audio-buffer-manager', {
 *   directories: {
 *     instruments: { path: 'sounds/instruments', recursive: false },
 *     loops: { path: 'sounds/instruments', recursive: false },
 *   },
 * });
 *
 * // When 'recursive' is set to true, all (matching) files in the given
 * // directories and their sub-directories are loaded as arrays of objects.
 * // With the option 'flatten' set to true, all files in the defined directory
 * // and its sub-directories are loaded into a single array. When the option
 * // 'flatten' set to false, the files of each sub-directory are assembled
 * // into an array and all of these arrays are arranged to a data structure
 * // that reproduces the sub-directory tree of the defined directories.
 * // The resulting data structure corresponds to the structure of the
 * // definition object extended by the defined sub-directory trees.
 *
 * // The following option results in a single array of pre-loaded files:
 * this.audioBufferManager = this.require('audio-buffer-manager', {
 *   directories: {
 *     path: 'sounds',
 *     recursive: true,
 *     flatten: true,
 *     match: /\.mp3/,
 *   },
 * });
 *
 * // This variant results in a data structure that reproduces the
 * // sub-directory tree of the 'sounds' directory:
 * this.audioBufferManager = this.require('audio-buffer-manager', {
 *   directories: {
 *     path: 'sounds',
 *     recursive: true,
 *     match: /\.mp3/,
 *   },
 * });
 *
 * // The loaded objects can be retrieved according to their definition, as for example :
 * const kickBuffer = this.audioBufferManager.data.kick;
 * const audioBuffer = this.audioBufferManager.data.latin.audio;
 * const markerArray = this.audioBufferManager.data.jazz.markers;
 * const snareBuffer = this.audioBufferManager.data.instruments[1];
 * const nussbaumLoop = this.audioBufferManager.data.loops[1];
 */


var AudioBufferManager = function (_Service) {
  (0, _inherits3.default)(AudioBufferManager, _Service);

  /** _<span class="warning">__WARNING__</span> This class should never be instanciated manually_ */
  function AudioBufferManager() {
    (0, _classCallCheck3.default)(this, AudioBufferManager);

    var _this2 = (0, _possibleConstructorReturn3.default)(this, (AudioBufferManager.__proto__ || (0, _getPrototypeOf2.default)(AudioBufferManager)).call(this, SERVICE_ID, false));

    var defaults = {
      assetsDomain: '',
      showProgress: true,
      files: null,
      directories: null,
      audioWrapTail: 0,
      viewCtor: AudioBufferManagerView,
      viewPriority: 4
    };

    _this2._defaultViewTemplate = defaultViewTemplate;
    _this2._defaultViewContent = defaultViewContent;

    _this2.configure(defaults);
    return _this2;
  }

  /** @private */


  (0, _createClass3.default)(AudioBufferManager, [{
    key: 'configure',
    value: function configure(options) {
      (0, _get3.default)(AudioBufferManager.prototype.__proto__ || (0, _getPrototypeOf2.default)(AudioBufferManager.prototype), 'configure', this).call(this, options);

      var directories = this.options.directories;

      if (directories !== null) {
        this._fileSystem = this.require('file-system');
      }
    }

    /** @private */

  }, {
    key: 'init',
    value: function init() {
      /**
       * Data structure correponding to the structure of requested files.
       * @private
       */
      this.data = [];

      // prepare view
      this.viewContent.showProgress = this.options.showProgress;
      this.viewCtor = this.options.viewCtor;
      this.view = this.createView();
    }

    /** @private */

  }, {
    key: 'start',
    value: function start() {
      (0, _get3.default)(AudioBufferManager.prototype.__proto__ || (0, _getPrototypeOf2.default)(AudioBufferManager.prototype), 'start', this).call(this);

      if (!this.hasStarted) this.init();

      this.show();

      if (this.options.files || this.options.directories) {
        if (this.options.files) this.loadFiles(this.options.files, this.view);

        if (this.options.directories) this.loadDirectories(this.options.directories, this.view);
      } else {
        this.ready();
      }
    }

    /** @private */

  }, {
    key: 'stop',
    value: function stop() {
      this.hide();
      (0, _get3.default)(AudioBufferManager.prototype.__proto__ || (0, _getPrototypeOf2.default)(AudioBufferManager.prototype), 'stop', this).call(this);
    }

    /**
     * Load files defined as a set of file paths.
     * @param {Object} defObj - Definition of files to load
     * @returns {Promise} - Promise resolved with the resulting data structure
     */

  }, {
    key: 'loadFiles',
    value: function loadFiles(defObj) {
      var _this3 = this;

      var view = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var promise = new _promise2.default(function (resolve, reject) {
        var pathList = [];
        var refList = [];

        if (typeof defObj === 'string') defObj = [defObj];

        // create data object copying the strcuture of the file definion object
        var dataObj = clonePathObj(defObj);
        decomposePathObj(dataObj, pathList, refList, false);

        // prefix relative paths with assetsDomain
        pathList = prefixPaths(pathList, _this3.options.assetsDomain);

        log(pathList, refList);

        // load files
        if (pathList.length > 0) {
          var loader = new _wavesLoaders.SuperLoader();
          loader.setAudioContext(_wavesAudio.audioContext);

          if (view && view.onProgress) {
            var progressPerFile = pathList.map(function () {
              return 0;
            }); // track files loading progress

            loader.progressCallback = function (e) {
              progressPerFile[e.index] = e.value;

              var totalProgress = 0;

              for (var i = 0; i < progressPerFile.length; i++) {
                totalProgress += progressPerFile[i];
              }totalProgress /= progressPerFile.length;

              view.onProgress(totalProgress * 100);
            };
          }

          loader.load(pathList, {
            wrapAroundExtention: _this3.options.audioWrapTail
          }).then(function (loadedObjList) {
            // place loaded objects (i.e. audio buffers and json files) into the structure of the file definition object
            populateRefList(refList, loadedObjList);

            // mix loaded objects into data
            (0, _assign2.default)(_this3.data, dataObj);
            _this3.ready();
            resolve(dataObj);
          }).catch(function (error) {
            reject(error);
            console.error(error);
          });
        } else {
          _this3.ready();
          resolve([]);
        }
      });

      return promise;
    }

    /**
     * Load files defined as a set of directory paths.
     * @param {Object} defObj - Definition of files to load
     * @returns {Promise} - Promise resolved with the resulting data structure
     */

  }, {
    key: 'loadDirectories',
    value: function loadDirectories(defObj) {
      var _this4 = this;

      var view = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var promise = new _promise2.default(function (resolve, reject) {
        var dirDefList = [];
        var dirRefList = [];

        // for the case that just a directory object is given as definition,
        // we have to wrap it temporarily into a dummy object
        defObj = { def: defObj };

        var fileDefObj = clonePathObj(defObj); // clone definition object

        // decompose directory definition into list of directory paths (strings)
        decomposePathObj(fileDefObj, dirDefList, dirRefList, true);

        _this4._fileSystem.getList(dirDefList).then(function (filePathListList) {
          var subDirList = [];
          var length = filePathListList.length;

          // create sub directory file definitions (list of file paths structured into sub directory trees derived from file paths)
          if (length === dirDefList.length) {
            for (var i = 0; i < length; i++) {
              var dirPath = dirDefList[i].path;
              var flatten = !!dirDefList[i].flatten;
              var pathList = filePathListList[i];
              var subDir = pathList;

              if (!flatten) subDir = createObjFromPathList(pathList, dirPath);

              subDirList.push(subDir);
            }

            // replace directory paths in initial definition by sub directory file definitions
            // to create a complete file definition object
            populateRefList(dirRefList, subDirList);
          } else {
            throw new Error('[' + SERVICE_ID + '] Cannot retrieve file paths from defined directories');
          }

          // unwrap subDir from dummy object
          fileDefObj = fileDefObj.def;

          // load files
          _this4.loadFiles(fileDefObj, view).then(function (data) {
            _this4.ready();
            resolve(data);
          }).catch(function (error) {
            return reject(error);
          });
        }).catch(function (error) {
          return reject(error);
        });
      });

      return promise;
    }

    /**
     * wrapAround, copy the begining input buffer to the end of an output buffer
     * @private
     * @param {arraybuffer} inBuffer {arraybuffer} - The input buffer
     * @returns {arraybuffer} - The processed buffer (with frame copied from the begining to the end)
     */

  }, {
    key: '_wrapAround',
    value: function _wrapAround(inBuffer) {
      var inLength = inBuffer.length;
      var outLength = inLength + this.options.wrapAroundExtension * inBuffer.sampleRate;
      var outBuffer = _wavesAudio.audioContext.createBuffer(inBuffer.numberOfChannels, outLength, inBuffer.sampleRate);
      var arrayChData = void 0,
          arrayOutChData = void 0;

      for (var ch = 0; ch < inBuffer.numberOfChannels; ch++) {
        arrayChData = inBuffer.getChannelData(ch);
        arrayOutChData = outBuffer.getChannelData(ch);

        for (var i = 0; i < inLength; i++) {
          arrayOutChData[i] = arrayChData[i];
        }for (var _i = inLength; _i < outLength; _i++) {
          arrayOutChData[_i] = arrayChData[_i - inLength];
        }
      }

      return outBuffer;
    }

    /** deprecated */

  }, {
    key: 'load',
    value: function load(files) {
      var view = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      return this.loadFiles(files, view);
    }

    /**
     * Retrieve a loaded object.
     * @param {String} id - Object or group identifier.
     * @param {String} key - Member key in group.
     * @returns {Promise} - Returns the loaded object.
     */

  }, {
    key: 'get',
    value: function get(id) {
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var obj = this.data[id];

      if (obj && key !== null) return obj[key];

      return obj;
    }

    /**
     * Retrieve a single audio buffer associated to a given id.
     * @param {String} id - Object identifier.
     * @param {Number} index - Audio buffer index (if array).
     * @returns {Promise} - Returns a single loaded audio buffer associated to the given id.
     */

  }, {
    key: 'getAudioBuffer',
    value: function getAudioBuffer() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'default';
      var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      return this.audioBuffers[id][index];
    }

    /**
     * Retrieve an array of audio buffers associated to a given id.
     * @param {String} id - Object identifier.
     * @returns {Promise} - Returns an array of loaded audio buffers associated to the given id.
     */

  }, {
    key: 'getAudioBufferArray',
    value: function getAudioBufferArray() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'default';

      return this.audioBuffers[id];
    }
  }]);
  return AudioBufferManager;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, AudioBufferManager);

exports.default = AudioBufferManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1ZGlvQnVmZmVyTWFuYWdlci5qcyJdLCJuYW1lcyI6WyJTRVJWSUNFX0lEIiwibG9nIiwiZGVmYXVsdFZpZXdUZW1wbGF0ZSIsImRlZmF1bHRWaWV3Q29udGVudCIsInN0YXR1cyIsImxvYWRpbmciLCJkZWNvZGluZyIsImZsYXR0ZW5MaXN0cyIsImEiLCJyZXQiLCJmdW4iLCJ2YWwiLCJBcnJheSIsImlzQXJyYXkiLCJmb3JFYWNoIiwicHVzaCIsImNsb25lUGF0aE9iaiIsInZhbHVlIiwiY2xhc3NOYW1lIiwiY29uc3RydWN0b3IiLCJuYW1lIiwiY2xvbmUiLCJrZXkiLCJyZWdleHAiLCJpc0ZpbGVQYXRoIiwic3RyIiwidGVzdCIsImlzRGlyU3BlYyIsIm9iaiIsInBhdGgiLCJkZWNvbXBvc2VQYXRoT2JqIiwicGF0aExpc3QiLCJyZWZMaXN0IiwiZGlycyIsInJlZiIsImluZGV4IiwiaW5kZXhPZiIsImxlbmd0aCIsInBvcHVsYXRlUmVmTGlzdCIsImxvYWRlZE9iakxpc3QiLCJFcnJvciIsImkiLCJyZWZzIiwiaiIsImwiLCJjcmVhdGVPYmpGcm9tUGF0aExpc3QiLCJjb21tb25QYXRoIiwic3ViUGF0aEluZGV4Iiwic3ViUGF0aCIsInN1YnN0cmluZyIsIm5vZGVzIiwic3BsaXQiLCJkZXB0aCIsInVuZGVmaW5lZCIsInByZWZpeFBhdGhzIiwicHJlZml4IiwiaXNBYnNvbHV0ZSIsIm1hcCIsIkF1ZGlvQnVmZmVyTWFuYWdlclZpZXciLCJhcmdzIiwiY29udGVudCIsIiRwcm9ncmVzc0JhciIsIiRlbCIsInF1ZXJ5U2VsZWN0b3IiLCJwZXJjZW50IiwicmVuZGVyIiwic2hvd1Byb2dyZXNzIiwic3R5bGUiLCJ3aWR0aCIsIkF1ZGlvQnVmZmVyTWFuYWdlciIsImRlZmF1bHRzIiwiYXNzZXRzRG9tYWluIiwiZmlsZXMiLCJkaXJlY3RvcmllcyIsImF1ZGlvV3JhcFRhaWwiLCJ2aWV3Q3RvciIsInZpZXdQcmlvcml0eSIsIl9kZWZhdWx0Vmlld1RlbXBsYXRlIiwiX2RlZmF1bHRWaWV3Q29udGVudCIsImNvbmZpZ3VyZSIsIm9wdGlvbnMiLCJfZmlsZVN5c3RlbSIsInJlcXVpcmUiLCJkYXRhIiwidmlld0NvbnRlbnQiLCJ2aWV3IiwiY3JlYXRlVmlldyIsImhhc1N0YXJ0ZWQiLCJpbml0Iiwic2hvdyIsImxvYWRGaWxlcyIsImxvYWREaXJlY3RvcmllcyIsInJlYWR5IiwiaGlkZSIsImRlZk9iaiIsInByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZGF0YU9iaiIsImxvYWRlciIsInNldEF1ZGlvQ29udGV4dCIsIm9uUHJvZ3Jlc3MiLCJwcm9ncmVzc1BlckZpbGUiLCJwcm9ncmVzc0NhbGxiYWNrIiwiZSIsInRvdGFsUHJvZ3Jlc3MiLCJsb2FkIiwid3JhcEFyb3VuZEV4dGVudGlvbiIsInRoZW4iLCJjYXRjaCIsImVycm9yIiwiY29uc29sZSIsImRpckRlZkxpc3QiLCJkaXJSZWZMaXN0IiwiZGVmIiwiZmlsZURlZk9iaiIsImdldExpc3QiLCJmaWxlUGF0aExpc3RMaXN0Iiwic3ViRGlyTGlzdCIsImRpclBhdGgiLCJmbGF0dGVuIiwic3ViRGlyIiwiaW5CdWZmZXIiLCJpbkxlbmd0aCIsIm91dExlbmd0aCIsIndyYXBBcm91bmRFeHRlbnNpb24iLCJzYW1wbGVSYXRlIiwib3V0QnVmZmVyIiwiY3JlYXRlQnVmZmVyIiwibnVtYmVyT2ZDaGFubmVscyIsImFycmF5Q2hEYXRhIiwiYXJyYXlPdXRDaERhdGEiLCJjaCIsImdldENoYW5uZWxEYXRhIiwiaWQiLCJhdWRpb0J1ZmZlcnMiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLElBQU1BLGFBQWEsOEJBQW5CO0FBQ0EsSUFBTUMsTUFBTSxxQkFBTSwwQ0FBTixDQUFaOztBQUVBLElBQU1DLDRTQUFOOztB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QUFwQzs7a0JBRWVBLGtCIiwiZmlsZSI6IkF1ZGlvQnVmZmVyTWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGF1ZGlvQ29udGV4dCB9IGZyb20gJ3dhdmVzLWF1ZGlvJztcbmltcG9ydCB7IFN1cGVyTG9hZGVyIH0gZnJvbSAnd2F2ZXMtbG9hZGVycyc7XG5pbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IF9wYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IFNlZ21lbnRlZFZpZXcgZnJvbSAnLi4vdmlld3MvU2VnbWVudGVkVmlldyc7XG5pbXBvcnQgU2VydmljZSBmcm9tICcuLi9jb3JlL1NlcnZpY2UnO1xuaW1wb3J0IHNlcnZpY2VNYW5hZ2VyIGZyb20gJy4uL2NvcmUvc2VydmljZU1hbmFnZXInO1xuXG5jb25zdCBTRVJWSUNFX0lEID0gJ3NlcnZpY2U6YXVkaW8tYnVmZmVyLW1hbmFnZXInO1xuY29uc3QgbG9nID0gZGVidWcoJ3NvdW5kd29ya3M6c2VydmljZXM6YXVkaW8tYnVmZmVyLW1hbmFnZXInKTtcblxuY29uc3QgZGVmYXVsdFZpZXdUZW1wbGF0ZSA9IGBcbjxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcCBmbGV4LW1pZGRsZVwiPlxuICA8cD48JT0gc3RhdHVzICU+PC9wPlxuPC9kaXY+XG48ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj5cbiAgPCUgaWYgKHNob3dQcm9ncmVzcykgeyAlPlxuICA8ZGl2IGNsYXNzPVwicHJvZ3Jlc3Mtd3JhcFwiPlxuICAgIDxkaXYgY2xhc3M9XCJwcm9ncmVzcy1iYXJcIj48L2Rpdj5cbiAgPC9kaXY+XG4gIDwlIH0gJT5cbjwvZGl2PlxuPGRpdiBjbGFzcz1cInNlY3Rpb24tYm90dG9tXCI+PC9kaXY+YDtcblxuXG5jb25zdCBkZWZhdWx0Vmlld0NvbnRlbnQgPSB7XG4gIHN0YXR1czogbnVsbCxcbiAgbG9hZGluZzogJ0xvYWRpbmcgc291bmRzLi4uJyxcbiAgZGVjb2Rpbmc6ICdEZWNvZGluZyBzb3VuZHMuLi4nLFxufTtcblxuZnVuY3Rpb24gZmxhdHRlbkxpc3RzKGEpIHtcbiAgY29uc3QgcmV0ID0gW107XG4gIGNvbnN0IGZ1biA9ICh2YWwpID0+IEFycmF5LmlzQXJyYXkodmFsKSA/IHZhbC5mb3JFYWNoKGZ1bikgOiByZXQucHVzaCh2YWwpO1xuICBmdW4oYSk7XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIGNsb25lUGF0aE9iaih2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgIGNvbnN0IGNsYXNzTmFtZSA9IHZhbHVlLmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgbGV0IGNsb25lID0gbnVsbDtcblxuICAgIGlmIChjbGFzc05hbWUgPT09ICdPYmplY3QnKVxuICAgICAgY2xvbmUgPSB7fTtcbiAgICBlbHNlIGlmIChjbGFzc05hbWUgPT09ICdBcnJheScpXG4gICAgICBjbG9uZSA9IFtdO1xuICAgIGVsc2VcbiAgICAgIHJldHVybiB2YWx1ZTtcblxuICAgIGZvciAobGV0IGtleSBpbiB2YWx1ZSlcbiAgICAgIGNsb25lW2tleV0gPSBjbG9uZVBhdGhPYmoodmFsdWVba2V5XSk7XG5cbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59XG5cbmNvbnN0IHJlZ2V4cCA9IC9cXC5bYS16QS1aMC05XXszLDR9JC87XG5cbmZ1bmN0aW9uIGlzRmlsZVBhdGgoc3RyKSB7XG4gIHJldHVybiAodHlwZW9mIHN0ciA9PT0gJ3N0cmluZycgJiYgcmVnZXhwLnRlc3Qoc3RyKSk7XG59XG5cbmZ1bmN0aW9uIGlzRGlyU3BlYyhvYmopIHtcbiAgcmV0dXJuICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb2JqLnBhdGggPT09ICdzdHJpbmcnKTtcbn1cblxuZnVuY3Rpb24gZGVjb21wb3NlUGF0aE9iaihvYmosIHBhdGhMaXN0LCByZWZMaXN0LCBkaXJzID0gZmFsc2UpIHtcbiAgZm9yIChsZXQga2V5IGluIG9iaikge1xuICAgIGNvbnN0IHZhbHVlID0gb2JqW2tleV07XG5cbiAgICBpZiAoKCFkaXJzICYmIGlzRmlsZVBhdGgodmFsdWUpKSB8fCAoZGlycyAmJiBpc0RpclNwZWModmFsdWUpKSkge1xuICAgICAgY29uc3QgcmVmID0geyBvYmosIGtleSB9O1xuICAgICAgbGV0IGluZGV4ID0gLTE7XG5cbiAgICAgIGlmICghZGlycylcbiAgICAgICAgaW5kZXggPSBwYXRoTGlzdC5pbmRleE9mKHZhbHVlKTtcblxuICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBwYXRoTGlzdC5wdXNoKHZhbHVlKTtcblxuICAgICAgICBpbmRleCA9IGxlbmd0aCAtIDE7XG4gICAgICAgIHJlZkxpc3RbaW5kZXhdID0gW107XG4gICAgICB9XG5cbiAgICAgIHJlZkxpc3RbaW5kZXhdLnB1c2gocmVmKTtcblxuICAgICAgb2JqW2tleV0gPSBudWxsO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgZGVjb21wb3NlUGF0aE9iaih2YWx1ZSwgcGF0aExpc3QsIHJlZkxpc3QsIGRpcnMpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBwb3B1bGF0ZVJlZkxpc3QocmVmTGlzdCwgbG9hZGVkT2JqTGlzdCkge1xuICBjb25zdCBsZW5ndGggPSByZWZMaXN0Lmxlbmd0aDtcblxuICBpZiAobGVuZ3RoICE9PSBsb2FkZWRPYmpMaXN0Lmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgWyR7U0VSVklDRV9JRH1dIExvYWRlZCBCdWZmZXJzIGRvIG5vdCBtYXRjaCBmaWxlIGRlZmluaW9uYCk7XG4gIH1cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcmVmcyA9IHJlZkxpc3RbaV07XG5cbiAgICBmb3IgKGxldCBqID0gMCwgbCA9IHJlZnMubGVuZ3RoOyBqIDwgbDsgaisrKSB7XG4gICAgICBjb25zdCByZWYgPSByZWZzW2pdO1xuICAgICAgY29uc3Qgb2JqID0gcmVmLm9iajtcbiAgICAgIGNvbnN0IGtleSA9IHJlZi5rZXk7XG5cbiAgICAgIG9ialtrZXldID0gbG9hZGVkT2JqTGlzdFtpXTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlT2JqRnJvbVBhdGhMaXN0KHBhdGhMaXN0LCBjb21tb25QYXRoKSB7XG4gIGxldCBvYmogPSBbXTtcblxuICBmb3IgKGxldCBwYXRoIG9mIHBhdGhMaXN0KSB7XG4gICAgbGV0IHN1YlBhdGhJbmRleCA9IHBhdGguaW5kZXhPZihjb21tb25QYXRoKTtcblxuICAgIGlmIChzdWJQYXRoSW5kZXggPj0gMCkge1xuICAgICAgc3ViUGF0aEluZGV4ICs9IGNvbW1vblBhdGgubGVuZ3RoO1xuXG4gICAgICBpZiAocGF0aFtzdWJQYXRoSW5kZXhdID09PSAnLycpXG4gICAgICAgIHN1YlBhdGhJbmRleCsrO1xuXG4gICAgICBjb25zdCBzdWJQYXRoID0gcGF0aC5zdWJzdHJpbmcoc3ViUGF0aEluZGV4KTtcbiAgICAgIGNvbnN0IG5vZGVzID0gc3ViUGF0aC5zcGxpdCgnLycpO1xuICAgICAgY29uc3QgZGVwdGggPSBub2Rlcy5sZW5ndGg7XG4gICAgICBsZXQgcmVmID0gb2JqO1xuICAgICAgbGV0IGk7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBkZXB0aCAtIDE7IGkrKykge1xuICAgICAgICBjb25zdCBrZXkgPSBub2Rlc1tpXTtcblxuICAgICAgICBpZiAocmVmW2tleV0gPT09IHVuZGVmaW5lZClcbiAgICAgICAgICByZWZba2V5XSA9IFtdO1xuXG4gICAgICAgIHJlZiA9IHJlZltrZXldO1xuICAgICAgfVxuXG4gICAgICByZWYucHVzaChwYXRoKTtcbiAgICB9XG5cbiAgICAvLyB0cmFuc2Zvcm0gZW1wdHkgYXJyYXkgdG8gb2JqZWN0XG4gICAgaWYgKG9iai5sZW5ndGggPT09IDApXG4gICAgICBvYmogPSBPYmplY3QuYXNzaWduKHt9LCBvYmopO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuZnVuY3Rpb24gcHJlZml4UGF0aHMocGF0aExpc3QsIHByZWZpeCkge1xuICAvLyB0ZXN0IGFic29sdXRlIHVybHMgKG9yIHByb3RvY29sIHJlbGF0aXZlKVxuICBjb25zdCBpc0Fic29sdXRlID0gL15odHRwcz86XFwvXFwvfF5cXC9cXC8vaTtcblxuICBwYXRoTGlzdCA9IHBhdGhMaXN0Lm1hcCgocGF0aCkgPT4ge1xuICAgIGlmIChpc0Fic29sdXRlLnRlc3QocGF0aCkgfHwgcGF0aFswXSA9PT0gJy8nKVxuICAgICAgcmV0dXJuIHBhdGg7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIHByZWZpeCArIHBhdGg7XG4gIH0pO1xuXG4gIHJldHVybiBwYXRoTGlzdDtcbn1cblxuLyoqXG4gKiBJbnRlcmZhY2UgZm9yIHRoZSB2aWV3IG9mIHRoZSBgYXVkaW8tYnVmZmVyLW1hbmFnZXJgIHNlcnZpY2UuXG4gKlxuICogQGludGVyZmFjZSBBYnN0cmFjdEF1ZGlvQnVmZmVyTWFuYWdlclZpZXdcbiAqIEBleHRlbmRzIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5WaWV3XG4gKi9cbi8qKlxuICogTWV0aG9kIGNhbGxlZCB3aGVuIGEgbmV3IGluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50bHkgbG9hZGVkIGFzc2V0c1xuICogaXMgcmVjZWl2ZWQuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBBYnN0cmFjdEF1ZGlvQnVmZmVyTWFuYWdlclZpZXcub25Qcm9ncmVzc1xuICogQHBhcmFtIHtOdW1iZXJ9IHBlcmNlbnQgLSBUaGUgcHVyY2VudGFnZSBvZiBsb2FkZWQgYXNzZXRzLlxuICovXG5jbGFzcyBBdWRpb0J1ZmZlck1hbmFnZXJWaWV3IGV4dGVuZHMgU2VnbWVudGVkVmlldyB7XG4gIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICBzdXBlciguLi5hcmdzKTtcblxuICAgIHRoaXMuY29udGVudC5zdGF0dXMgPSB0aGlzLmNvbnRlbnQubG9hZGluZztcbiAgfVxuXG4gIG9uUmVuZGVyKCkge1xuICAgIHN1cGVyLm9uUmVuZGVyKCk7XG4gICAgdGhpcy4kcHJvZ3Jlc3NCYXIgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcucHJvZ3Jlc3MtYmFyJyk7XG4gIH1cblxuICBvblByb2dyZXNzKHBlcmNlbnQpIHtcbiAgICBpZiAocGVyY2VudCA9PT0gMTAwKSB7XG4gICAgICB0aGlzLmNvbnRlbnQuc3RhdHVzID0gdGhpcy5jb250ZW50LmRlY29kaW5nO1xuICAgICAgdGhpcy5yZW5kZXIoJy5zZWN0aW9uLXRvcCcpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNvbnRlbnQuc2hvd1Byb2dyZXNzKVxuICAgICAgdGhpcy4kcHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSBgJHtwZXJjZW50fSVgO1xuICB9XG59XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUgY2xpZW50IGAnYXVkaW8tYnVmZmVyLW1hbmFnZXInYCBzZXJ2aWNlLlxuICpcbiAqIFRoaXMgc2VydmljZSBhbGxvd3MgdG8gcHJlbG9hZCBmaWxlcyBhbmQgc3RvcmUgdGhlbSBpbnRvIGJ1ZmZlcnNcbiAqIGJlZm9yZSB0aGUgYmVnaW5uaW5nIG9mIHRoZSBleHBlcmllbmNlLiBBdWRpbyBmaWxlcyB3aWxsIGJlIGNvbnZlcnRlZCBhbmRcbiAqIHN0b3JlZCBpbnRvIEF1ZGlvQnVmZmVyIG9iamVjdHMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7QXJyYXk8U3RyaW5nPn0gb3B0aW9ucy5hc3NldHNEb21haW4gLSBQcmVmaXggY29uY2F0ZW5hdGVkIHRvIGFsbFxuICogIGdpdmVuIHBhdGhzLlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMuZmlsZXMgLSBEZWZpbml0aW9uIG9mIGZpbGVzIHRvIGxvYWQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucy5kaXJlY3RvcmllcyAtIERlZmluaXRpb24gb2YgZGlyZWN0b3JpZXMgdG8gbG9hZC5cbiAqIEBwYXJhbSB7QXJyYXk8U3RyaW5nPn0gb3B0aW9ucy5kaXJlY3RvcmllcyAtIExpc3Qgb2YgZGlyZWN0b3JpZXMgdG8gbG9hZC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuc2hvd1Byb2dyZXNzPXRydWVdIC0gRGlzcGxheSB0aGUgcHJvZ3Jlc3MgYmFyXG4gKiAgaW4gdGhlIHZpZXcuXG4gKiBAcGFyYW0ge1N0cmluZ3xtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuRmlsZVN5c3RlbX5MaXN0Q29uZmlnfSBbb3B0aW9ucy5kaXJlY3Rvcmllcz1udWxsXSAtXG4gKiAgTG9hZCBhbGwgdGhlIGZpbGVzIGluIHBhcnRpY3VsYXIgZGlyZWN0b3JpZXMuIElmIHNldHRlZCB0aGlzIG9wdGlvbiByZWxpZXNcbiAqICBvbiB0aGUge0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5GaWxlU3lzdGVtfSB3aGljaCBpdHNlbGYgcmVsaWVzIG9uXG4gKiAgaXRzIHNlcnZlciBjb3VudGVycGFydCwgdGhlIGF1ZGlvLWJ1ZmZlci1tYW5hZ2VyIGNhbiB0aGVuIG5vIGxvbmdlciBiZVxuICogIGNvbnNpZGVyZWQgYXMgYSBjbGllbnQtb25seSBzZXJ2aWNlLlxuICpcbiAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnRcbiAqIEBleGFtcGxlXG4gKiAvLyByZXF1aXJlIGFuZCBjb25maWd1cmUgdGhlIGBhdWRpby1idWZmZXItbWFuYWdlcmAgaW5zaWRlIHRoZSBleHBlcmllbmNlXG4gKiAvLyBjb25zdHJ1Y3RvclxuICogLy8gRGVmaW5pbmcgYSBzaW5nbGUgYXJyYXkgb2YgYXVkaW8gZmlsZXMgcmVzdWx0cyBpbiBhIHNpbmdsZVxuICogLy8gYXJyYXkgb2YgYXVkaW8gYnVmZmVycyBhc3NvY2lhdGVkIHRvIHRoZSBpZGVudGlmaWVyIGBkZWZhdWx0YC5cbiAqXG4gKiAvLyBUaGVyZSBhcmUgdHdvIGRpZmZlcmVudCB3YXlzIHRvIHNwZWNpZnkgdGhlIGZpbGVzIHRvIGJlIGxvYWRlZCBhbmQgdGhlXG4gKiAvLyBkYXRhIHN0cnVjdHVyZSBpbiB3aGljaCB0aGUgbG9hZGVkIGRhdGEgb2JqZWN0cyBhcmUgYXJyYW5nZWQ6XG4gKiAvL1xuICogLy8gKDEuKSBXaXRoIHRoZSAnZmlsZXMnIG9wdGlvbiwgdGhlIGZpbGVzIGFuZCBzdHJ1Y3R1cmUgYXJlIGRlZmluZWQgYnkgYW5cbiAqIC8vIG9iamVjdCBvZiBhbnkgZGVwdGggdGhhdCBjb250YWlucyBmaWxlIHBhdGhzLiBBbGwgc3BlY2lmaWVkIGZpbGVzIGFyZVxuICogLy8gbG9hZGVkIGFuZCB0aGUgbG9hZGVkIGRhdGEgb2JqZWN0cyBhcmUgc3RvcmVkIGludG8gYW4gb2JqZWN0IG9mIHRoZSBzYW1lXG4gKiAvLyBzdHJ1Y3R1cmUgYXMgdGhlIGRlZmluaXRpb24gb2JqZWN0LlxuICpcbiAqIHRoaXMuYXVkaW9CdWZmZXJNYW5hZ2VyID0gdGhpcy5yZXF1aXJlKCdhdWRpby1idWZmZXItbWFuYWdlcicsIHsgZmlsZXM6IFtcbiAqICAgJ3NvdW5kcy9kcnVtcy9raWNrLm1wMycsXG4gKiAgICdzb3VuZHMvZHJ1bXMvc25hcmUubXAzJ1xuICogXX0pO1xuICpcbiAqIHRoaXMuYXVkaW9CdWZmZXJNYW5hZ2VyID0gdGhpcy5yZXF1aXJlKCdhdWRpby1idWZmZXItbWFuYWdlcicsIHsgZmlsZXM6IHtcbiAqICAga2ljazogJ3NvdW5kcy9raWNrXzQ0a0h6Lm1wMycsXG4gKiAgIHNuYXJlOiAnc291bmRzLzgwOHNuYXJlLm1wMydcbiAqIH19KTtcbiAqXG4gKiB0aGlzLmF1ZGlvQnVmZmVyTWFuYWdlciA9IHRoaXMucmVxdWlyZSgnYXVkaW8tYnVmZmVyLW1hbmFnZXInLCB7IGZpbGVzOiB7XG4gKiAgIGxhdGluOiB7XG4gKiAgICAgYXVkaW86ICdsb29wcy9zaGVpbGEtZS1yYXNwYmVycnkubXAzJyxcbiAqICAgICBtYXJrZXJzOiAnbG9vcHMvc2hlaWxhLWUtcmFzcGJlcnJ5LW1hcmtlcnMuanNvbicsXG4gKiAgIH0sXG4gKiAgIGpheno6IHtcbiAqICAgICBhdWRpbzogJ2xvb3BzL251c3NiYXVtLXNodWZmbGUubXAzJyxcbiAqICAgICBtYXJrZXJzOiAnbG9vcHMvbnVzc2JhdW0tc2h1ZmZsZS1tYXJrZXJzLmpzb24nLFxuICogICB9LFxuICogfX0pO1xuICpcbiAqIHRoaXMuYXVkaW9CdWZmZXJNYW5hZ2VyID0gdGhpcy5yZXF1aXJlKCdhdWRpby1idWZmZXItbWFuYWdlcicsIHsgZmlsZXM6IHtcbiAqICAgaW5zdHJ1bWVudHM6IFtcbiAqICAgICAnc291bmRzL2luc3RydW1lbnRzL2tpY2tfNDRrSHoubXAzJyxcbiAqICAgICAnc291bmRzL2luc3RydW1lbnRzLzgwOHNuYXJlLm1wMyddLFxuICogICBsb29wczogW1xuICogICAgICdzb3VuZHMvbG9vcHMvc2hlaWxhLWUtcmFzcGJlcnJ5Lm1wMycsXG4gKiAgICAgJ3NvdW5kcy9sb29wcy9udXNzYmF1bS1zaHVmZmxlLm1wMyddLFxuICogfX0pO1xuICpcbiAqIC8vKDIuKSBUaGUgJ2RpcmVjdG9yaWVzJyBvcHRpb24gY2FuIGJlIHVzZWQgdG8gbG9hZCB0aGUgZmlsZXMgb2YgYVxuICogLy8gZ2l2ZW4gZGlyZWN0b3J5LiBFYWNoIGRpcmVjdG9yeSBpcyBzcGVjaWZpZWQgYnkgYW4gb2JqZWN0IHRoYXQgaGFzIGFcbiAqIC8vIHByb3BlcnR5ICdwYXRoJyB3aXRoIHRoZSBkaXJlY3RvcnkgcGF0aCBhbmQgb3B0aW9uYWxseSB0aGUga2V5c1xuICogLy8gJ3JlY3Vyc2l2ZScgKHNwZWNpZnlpbmcgd2hldGhlciB0aGUgZGlyZWN0b3J5J3Mgc3ViLWRpcmVjdG9yaWVzIGFyZVxuICogLy8gY29uc2lkZXJlZCkgYW5kIGEga2V5ICdtYXRjaCcgKHNwZWNpZnlpbmcgYSByZWdleHAgdG8gc2VsZWN0IHRoZSBmaWxlc1xuICogLy8gaW4gdGhlIGdpdmVuIGRpcmVjdG9yeSkuXG4gKlxuICogLy8gV2l0aCB0aGUgb3B0aW9uICdyZWN1cnNpdmUnIHNldCB0byBmYWxzZSwgYWxsIChtYXRjaGluZykgZmlsZXNcbiAqIC8vIGluIGEgZ2l2ZW4gZGlyZWN0b3JpeSBhcmUgbG9hZGVkIGludG8gYW4gYXJyYXlzIG9mIG9iamVjdHMgd2l0aG91dFxuICogLy8gY29uc2lkZXJpbmcgc3ViLWRpcmVjdG9yaWVzLiBUaGUgYXJyYXlzIG9mIGxvYWRlZCBkYXRhIG9iamVjdHMgYXJlXG4gKiAvLyBhcnJhbmdlZCBpbiB0aGUgc2FtZSBkYXRhIHN0cnVjdHVyZSBhcyB0aGUgZGVmaW5pdGlvbiBvYmplY3QuXG4gKlxuICogdGhpcy5hdWRpb0J1ZmZlck1hbmFnZXIgPSB0aGlzLnJlcXVpcmUoJ2F1ZGlvLWJ1ZmZlci1tYW5hZ2VyJywge1xuICogICBkaXJlY3Rvcmllczoge1xuICogICAgIGluc3RydW1lbnRzOiB7IHBhdGg6ICdzb3VuZHMvaW5zdHJ1bWVudHMnLCByZWN1cnNpdmU6IGZhbHNlIH0sXG4gKiAgICAgbG9vcHM6IHsgcGF0aDogJ3NvdW5kcy9pbnN0cnVtZW50cycsIHJlY3Vyc2l2ZTogZmFsc2UgfSxcbiAqICAgfSxcbiAqIH0pO1xuICpcbiAqIC8vIFdoZW4gJ3JlY3Vyc2l2ZScgaXMgc2V0IHRvIHRydWUsIGFsbCAobWF0Y2hpbmcpIGZpbGVzIGluIHRoZSBnaXZlblxuICogLy8gZGlyZWN0b3JpZXMgYW5kIHRoZWlyIHN1Yi1kaXJlY3RvcmllcyBhcmUgbG9hZGVkIGFzIGFycmF5cyBvZiBvYmplY3RzLlxuICogLy8gV2l0aCB0aGUgb3B0aW9uICdmbGF0dGVuJyBzZXQgdG8gdHJ1ZSwgYWxsIGZpbGVzIGluIHRoZSBkZWZpbmVkIGRpcmVjdG9yeVxuICogLy8gYW5kIGl0cyBzdWItZGlyZWN0b3JpZXMgYXJlIGxvYWRlZCBpbnRvIGEgc2luZ2xlIGFycmF5LiBXaGVuIHRoZSBvcHRpb25cbiAqIC8vICdmbGF0dGVuJyBzZXQgdG8gZmFsc2UsIHRoZSBmaWxlcyBvZiBlYWNoIHN1Yi1kaXJlY3RvcnkgYXJlIGFzc2VtYmxlZFxuICogLy8gaW50byBhbiBhcnJheSBhbmQgYWxsIG9mIHRoZXNlIGFycmF5cyBhcmUgYXJyYW5nZWQgdG8gYSBkYXRhIHN0cnVjdHVyZVxuICogLy8gdGhhdCByZXByb2R1Y2VzIHRoZSBzdWItZGlyZWN0b3J5IHRyZWUgb2YgdGhlIGRlZmluZWQgZGlyZWN0b3JpZXMuXG4gKiAvLyBUaGUgcmVzdWx0aW5nIGRhdGEgc3RydWN0dXJlIGNvcnJlc3BvbmRzIHRvIHRoZSBzdHJ1Y3R1cmUgb2YgdGhlXG4gKiAvLyBkZWZpbml0aW9uIG9iamVjdCBleHRlbmRlZCBieSB0aGUgZGVmaW5lZCBzdWItZGlyZWN0b3J5IHRyZWVzLlxuICpcbiAqIC8vIFRoZSBmb2xsb3dpbmcgb3B0aW9uIHJlc3VsdHMgaW4gYSBzaW5nbGUgYXJyYXkgb2YgcHJlLWxvYWRlZCBmaWxlczpcbiAqIHRoaXMuYXVkaW9CdWZmZXJNYW5hZ2VyID0gdGhpcy5yZXF1aXJlKCdhdWRpby1idWZmZXItbWFuYWdlcicsIHtcbiAqICAgZGlyZWN0b3JpZXM6IHtcbiAqICAgICBwYXRoOiAnc291bmRzJyxcbiAqICAgICByZWN1cnNpdmU6IHRydWUsXG4gKiAgICAgZmxhdHRlbjogdHJ1ZSxcbiAqICAgICBtYXRjaDogL1xcLm1wMy8sXG4gKiAgIH0sXG4gKiB9KTtcbiAqXG4gKiAvLyBUaGlzIHZhcmlhbnQgcmVzdWx0cyBpbiBhIGRhdGEgc3RydWN0dXJlIHRoYXQgcmVwcm9kdWNlcyB0aGVcbiAqIC8vIHN1Yi1kaXJlY3RvcnkgdHJlZSBvZiB0aGUgJ3NvdW5kcycgZGlyZWN0b3J5OlxuICogdGhpcy5hdWRpb0J1ZmZlck1hbmFnZXIgPSB0aGlzLnJlcXVpcmUoJ2F1ZGlvLWJ1ZmZlci1tYW5hZ2VyJywge1xuICogICBkaXJlY3Rvcmllczoge1xuICogICAgIHBhdGg6ICdzb3VuZHMnLFxuICogICAgIHJlY3Vyc2l2ZTogdHJ1ZSxcbiAqICAgICBtYXRjaDogL1xcLm1wMy8sXG4gKiAgIH0sXG4gKiB9KTtcbiAqXG4gKiAvLyBUaGUgbG9hZGVkIG9iamVjdHMgY2FuIGJlIHJldHJpZXZlZCBhY2NvcmRpbmcgdG8gdGhlaXIgZGVmaW5pdGlvbiwgYXMgZm9yIGV4YW1wbGUgOlxuICogY29uc3Qga2lja0J1ZmZlciA9IHRoaXMuYXVkaW9CdWZmZXJNYW5hZ2VyLmRhdGEua2ljaztcbiAqIGNvbnN0IGF1ZGlvQnVmZmVyID0gdGhpcy5hdWRpb0J1ZmZlck1hbmFnZXIuZGF0YS5sYXRpbi5hdWRpbztcbiAqIGNvbnN0IG1hcmtlckFycmF5ID0gdGhpcy5hdWRpb0J1ZmZlck1hbmFnZXIuZGF0YS5qYXp6Lm1hcmtlcnM7XG4gKiBjb25zdCBzbmFyZUJ1ZmZlciA9IHRoaXMuYXVkaW9CdWZmZXJNYW5hZ2VyLmRhdGEuaW5zdHJ1bWVudHNbMV07XG4gKiBjb25zdCBudXNzYmF1bUxvb3AgPSB0aGlzLmF1ZGlvQnVmZmVyTWFuYWdlci5kYXRhLmxvb3BzWzFdO1xuICovXG5jbGFzcyBBdWRpb0J1ZmZlck1hbmFnZXIgZXh0ZW5kcyBTZXJ2aWNlIHtcbiAgLyoqIF88c3BhbiBjbGFzcz1cIndhcm5pbmdcIj5fX1dBUk5JTkdfXzwvc3Bhbj4gVGhpcyBjbGFzcyBzaG91bGQgbmV2ZXIgYmUgaW5zdGFuY2lhdGVkIG1hbnVhbGx5XyAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihTRVJWSUNFX0lELCBmYWxzZSk7XG5cbiAgICBjb25zdCBkZWZhdWx0cyA9IHtcbiAgICAgIGFzc2V0c0RvbWFpbjogJycsXG4gICAgICBzaG93UHJvZ3Jlc3M6IHRydWUsXG4gICAgICBmaWxlczogbnVsbCxcbiAgICAgIGRpcmVjdG9yaWVzOiBudWxsLFxuICAgICAgYXVkaW9XcmFwVGFpbDogMCxcbiAgICAgIHZpZXdDdG9yOiBBdWRpb0J1ZmZlck1hbmFnZXJWaWV3LFxuICAgICAgdmlld1ByaW9yaXR5OiA0LFxuICAgIH07XG5cbiAgICB0aGlzLl9kZWZhdWx0Vmlld1RlbXBsYXRlID0gZGVmYXVsdFZpZXdUZW1wbGF0ZTtcbiAgICB0aGlzLl9kZWZhdWx0Vmlld0NvbnRlbnQgPSBkZWZhdWx0Vmlld0NvbnRlbnQ7XG5cbiAgICB0aGlzLmNvbmZpZ3VyZShkZWZhdWx0cyk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgY29uZmlndXJlKG9wdGlvbnMpIHtcbiAgICBzdXBlci5jb25maWd1cmUob3B0aW9ucyk7XG5cbiAgICBjb25zdCBkaXJlY3RvcmllcyA9IHRoaXMub3B0aW9ucy5kaXJlY3RvcmllcztcblxuICAgIGlmIChkaXJlY3RvcmllcyAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5fZmlsZVN5c3RlbSA9IHRoaXMucmVxdWlyZSgnZmlsZS1zeXN0ZW0nKTtcbiAgICB9XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgaW5pdCgpIHtcbiAgICAvKipcbiAgICAgKiBEYXRhIHN0cnVjdHVyZSBjb3JyZXBvbmRpbmcgdG8gdGhlIHN0cnVjdHVyZSBvZiByZXF1ZXN0ZWQgZmlsZXMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmRhdGEgPSBbXTtcblxuICAgIC8vIHByZXBhcmUgdmlld1xuICAgIHRoaXMudmlld0NvbnRlbnQuc2hvd1Byb2dyZXNzID0gdGhpcy5vcHRpb25zLnNob3dQcm9ncmVzcztcbiAgICB0aGlzLnZpZXdDdG9yID0gdGhpcy5vcHRpb25zLnZpZXdDdG9yO1xuICAgIHRoaXMudmlldyA9IHRoaXMuY3JlYXRlVmlldygpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHN0YXJ0KCkge1xuICAgIHN1cGVyLnN0YXJ0KCk7XG5cbiAgICBpZiAoIXRoaXMuaGFzU3RhcnRlZClcbiAgICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgdGhpcy5zaG93KCk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmZpbGVzIHx8IHRoaXMub3B0aW9ucy5kaXJlY3Rvcmllcykge1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5maWxlcylcbiAgICAgICAgdGhpcy5sb2FkRmlsZXModGhpcy5vcHRpb25zLmZpbGVzLCB0aGlzLnZpZXcpO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmRpcmVjdG9yaWVzKVxuICAgICAgICB0aGlzLmxvYWREaXJlY3Rvcmllcyh0aGlzLm9wdGlvbnMuZGlyZWN0b3JpZXMsIHRoaXMudmlldyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVhZHkoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgc3RvcCgpIHtcbiAgICB0aGlzLmhpZGUoKTtcbiAgICBzdXBlci5zdG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogTG9hZCBmaWxlcyBkZWZpbmVkIGFzIGEgc2V0IG9mIGZpbGUgcGF0aHMuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkZWZPYmogLSBEZWZpbml0aW9uIG9mIGZpbGVzIHRvIGxvYWRcbiAgICogQHJldHVybnMge1Byb21pc2V9IC0gUHJvbWlzZSByZXNvbHZlZCB3aXRoIHRoZSByZXN1bHRpbmcgZGF0YSBzdHJ1Y3R1cmVcbiAgICovXG4gIGxvYWRGaWxlcyhkZWZPYmosIHZpZXcgPSBudWxsKSB7XG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCBwYXRoTGlzdCA9IFtdO1xuICAgICAgbGV0IHJlZkxpc3QgPSBbXTtcblxuICAgICAgaWYgKHR5cGVvZiBkZWZPYmogPT09ICdzdHJpbmcnKVxuICAgICAgICBkZWZPYmogPSBbZGVmT2JqXTtcblxuICAgICAgLy8gY3JlYXRlIGRhdGEgb2JqZWN0IGNvcHlpbmcgdGhlIHN0cmN1dHVyZSBvZiB0aGUgZmlsZSBkZWZpbmlvbiBvYmplY3RcbiAgICAgIGNvbnN0IGRhdGFPYmogPSBjbG9uZVBhdGhPYmooZGVmT2JqKTtcbiAgICAgIGRlY29tcG9zZVBhdGhPYmooZGF0YU9iaiwgcGF0aExpc3QsIHJlZkxpc3QsIGZhbHNlKTtcblxuICAgICAgLy8gcHJlZml4IHJlbGF0aXZlIHBhdGhzIHdpdGggYXNzZXRzRG9tYWluXG4gICAgICBwYXRoTGlzdCA9IHByZWZpeFBhdGhzKHBhdGhMaXN0LCB0aGlzLm9wdGlvbnMuYXNzZXRzRG9tYWluKTtcblxuICAgICAgbG9nKHBhdGhMaXN0LCByZWZMaXN0KTtcblxuICAgICAgLy8gbG9hZCBmaWxlc1xuICAgICAgaWYgKHBhdGhMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgbG9hZGVyID0gbmV3IFN1cGVyTG9hZGVyKCk7XG4gICAgICAgIGxvYWRlci5zZXRBdWRpb0NvbnRleHQoYXVkaW9Db250ZXh0KTtcblxuICAgICAgICBpZiAodmlldyAmJiB2aWV3Lm9uUHJvZ3Jlc3MpIHtcbiAgICAgICAgICBjb25zdCBwcm9ncmVzc1BlckZpbGUgPSBwYXRoTGlzdC5tYXAoKCkgPT4gMCk7IC8vIHRyYWNrIGZpbGVzIGxvYWRpbmcgcHJvZ3Jlc3NcblxuICAgICAgICAgIGxvYWRlci5wcm9ncmVzc0NhbGxiYWNrID0gKGUpID0+IHtcbiAgICAgICAgICAgIHByb2dyZXNzUGVyRmlsZVtlLmluZGV4XSA9IGUudmFsdWU7XG5cbiAgICAgICAgICAgIGxldCB0b3RhbFByb2dyZXNzID0gMDtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9ncmVzc1BlckZpbGUubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICAgIHRvdGFsUHJvZ3Jlc3MgKz0gcHJvZ3Jlc3NQZXJGaWxlW2ldO1xuXG4gICAgICAgICAgICB0b3RhbFByb2dyZXNzIC89IHByb2dyZXNzUGVyRmlsZS5sZW5ndGg7XG5cbiAgICAgICAgICAgIHZpZXcub25Qcm9ncmVzcyh0b3RhbFByb2dyZXNzICogMTAwKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgbG9hZGVyXG4gICAgICAgICAgLmxvYWQocGF0aExpc3QsIHtcbiAgICAgICAgICAgIHdyYXBBcm91bmRFeHRlbnRpb246IHRoaXMub3B0aW9ucy5hdWRpb1dyYXBUYWlsLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oKGxvYWRlZE9iakxpc3QpID0+IHtcbiAgICAgICAgICAgIC8vIHBsYWNlIGxvYWRlZCBvYmplY3RzIChpLmUuIGF1ZGlvIGJ1ZmZlcnMgYW5kIGpzb24gZmlsZXMpIGludG8gdGhlIHN0cnVjdHVyZSBvZiB0aGUgZmlsZSBkZWZpbml0aW9uIG9iamVjdFxuICAgICAgICAgICAgcG9wdWxhdGVSZWZMaXN0KHJlZkxpc3QsIGxvYWRlZE9iakxpc3QpO1xuXG4gICAgICAgICAgICAvLyBtaXggbG9hZGVkIG9iamVjdHMgaW50byBkYXRhXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMuZGF0YSwgZGF0YU9iaik7XG4gICAgICAgICAgICB0aGlzLnJlYWR5KCk7XG4gICAgICAgICAgICByZXNvbHZlKGRhdGFPYmopO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWFkeSgpO1xuICAgICAgICByZXNvbHZlKFtdKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgZmlsZXMgZGVmaW5lZCBhcyBhIHNldCBvZiBkaXJlY3RvcnkgcGF0aHMuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkZWZPYmogLSBEZWZpbml0aW9uIG9mIGZpbGVzIHRvIGxvYWRcbiAgICogQHJldHVybnMge1Byb21pc2V9IC0gUHJvbWlzZSByZXNvbHZlZCB3aXRoIHRoZSByZXN1bHRpbmcgZGF0YSBzdHJ1Y3R1cmVcbiAgICovXG4gIGxvYWREaXJlY3RvcmllcyhkZWZPYmosIHZpZXcgPSBudWxsKSB7XG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCBkaXJEZWZMaXN0ID0gW107XG4gICAgICBsZXQgZGlyUmVmTGlzdCA9IFtdO1xuXG4gICAgICAvLyBmb3IgdGhlIGNhc2UgdGhhdCBqdXN0IGEgZGlyZWN0b3J5IG9iamVjdCBpcyBnaXZlbiBhcyBkZWZpbml0aW9uLFxuICAgICAgLy8gd2UgaGF2ZSB0byB3cmFwIGl0IHRlbXBvcmFyaWx5IGludG8gYSBkdW1teSBvYmplY3RcbiAgICAgIGRlZk9iaiA9IHsgZGVmOiBkZWZPYmogfTtcblxuICAgICAgbGV0IGZpbGVEZWZPYmogPSBjbG9uZVBhdGhPYmooZGVmT2JqKTsgLy8gY2xvbmUgZGVmaW5pdGlvbiBvYmplY3RcblxuICAgICAgLy8gZGVjb21wb3NlIGRpcmVjdG9yeSBkZWZpbml0aW9uIGludG8gbGlzdCBvZiBkaXJlY3RvcnkgcGF0aHMgKHN0cmluZ3MpXG4gICAgICBkZWNvbXBvc2VQYXRoT2JqKGZpbGVEZWZPYmosIGRpckRlZkxpc3QsIGRpclJlZkxpc3QsIHRydWUpO1xuXG4gICAgICB0aGlzLl9maWxlU3lzdGVtLmdldExpc3QoZGlyRGVmTGlzdClcbiAgICAgICAgLnRoZW4oKGZpbGVQYXRoTGlzdExpc3QpID0+IHtcbiAgICAgICAgICBjb25zdCBzdWJEaXJMaXN0ID0gW107XG4gICAgICAgICAgY29uc3QgbGVuZ3RoID0gZmlsZVBhdGhMaXN0TGlzdC5sZW5ndGg7XG5cbiAgICAgICAgICAvLyBjcmVhdGUgc3ViIGRpcmVjdG9yeSBmaWxlIGRlZmluaXRpb25zIChsaXN0IG9mIGZpbGUgcGF0aHMgc3RydWN0dXJlZCBpbnRvIHN1YiBkaXJlY3RvcnkgdHJlZXMgZGVyaXZlZCBmcm9tIGZpbGUgcGF0aHMpXG4gICAgICAgICAgaWYgKGxlbmd0aCA9PT0gZGlyRGVmTGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgY29uc3QgZGlyUGF0aCA9IGRpckRlZkxpc3RbaV0ucGF0aDtcbiAgICAgICAgICAgICAgY29uc3QgZmxhdHRlbiA9ICEhZGlyRGVmTGlzdFtpXS5mbGF0dGVuO1xuICAgICAgICAgICAgICBjb25zdCBwYXRoTGlzdCA9IGZpbGVQYXRoTGlzdExpc3RbaV07XG4gICAgICAgICAgICAgIGxldCBzdWJEaXIgPSBwYXRoTGlzdDtcblxuICAgICAgICAgICAgICBpZighZmxhdHRlbilcbiAgICAgICAgICAgICAgICBzdWJEaXIgPSBjcmVhdGVPYmpGcm9tUGF0aExpc3QocGF0aExpc3QsIGRpclBhdGgpO1xuXG4gICAgICAgICAgICAgIHN1YkRpckxpc3QucHVzaChzdWJEaXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyByZXBsYWNlIGRpcmVjdG9yeSBwYXRocyBpbiBpbml0aWFsIGRlZmluaXRpb24gYnkgc3ViIGRpcmVjdG9yeSBmaWxlIGRlZmluaXRpb25zXG4gICAgICAgICAgICAvLyB0byBjcmVhdGUgYSBjb21wbGV0ZSBmaWxlIGRlZmluaXRpb24gb2JqZWN0XG4gICAgICAgICAgICBwb3B1bGF0ZVJlZkxpc3QoZGlyUmVmTGlzdCwgc3ViRGlyTGlzdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgWyR7U0VSVklDRV9JRH1dIENhbm5vdCByZXRyaWV2ZSBmaWxlIHBhdGhzIGZyb20gZGVmaW5lZCBkaXJlY3Rvcmllc2ApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIHVud3JhcCBzdWJEaXIgZnJvbSBkdW1teSBvYmplY3RcbiAgICAgICAgICBmaWxlRGVmT2JqID0gZmlsZURlZk9iai5kZWY7XG5cbiAgICAgICAgICAvLyBsb2FkIGZpbGVzXG4gICAgICAgICAgdGhpcy5sb2FkRmlsZXMoZmlsZURlZk9iaiwgdmlldylcbiAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMucmVhZHkoKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4gcmVqZWN0KGVycm9yKSk7XG4gICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4gcmVqZWN0KGVycm9yKSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiB3cmFwQXJvdW5kLCBjb3B5IHRoZSBiZWdpbmluZyBpbnB1dCBidWZmZXIgdG8gdGhlIGVuZCBvZiBhbiBvdXRwdXQgYnVmZmVyXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7YXJyYXlidWZmZXJ9IGluQnVmZmVyIHthcnJheWJ1ZmZlcn0gLSBUaGUgaW5wdXQgYnVmZmVyXG4gICAqIEByZXR1cm5zIHthcnJheWJ1ZmZlcn0gLSBUaGUgcHJvY2Vzc2VkIGJ1ZmZlciAod2l0aCBmcmFtZSBjb3BpZWQgZnJvbSB0aGUgYmVnaW5pbmcgdG8gdGhlIGVuZClcbiAgICovXG4gIF93cmFwQXJvdW5kKGluQnVmZmVyKSB7XG4gICAgY29uc3QgaW5MZW5ndGggPSBpbkJ1ZmZlci5sZW5ndGg7XG4gICAgY29uc3Qgb3V0TGVuZ3RoID0gaW5MZW5ndGggKyB0aGlzLm9wdGlvbnMud3JhcEFyb3VuZEV4dGVuc2lvbiAqIGluQnVmZmVyLnNhbXBsZVJhdGU7XG4gICAgY29uc3Qgb3V0QnVmZmVyID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlcihpbkJ1ZmZlci5udW1iZXJPZkNoYW5uZWxzLCBvdXRMZW5ndGgsIGluQnVmZmVyLnNhbXBsZVJhdGUpO1xuICAgIGxldCBhcnJheUNoRGF0YSwgYXJyYXlPdXRDaERhdGE7XG5cbiAgICBmb3IgKGxldCBjaCA9IDA7IGNoIDwgaW5CdWZmZXIubnVtYmVyT2ZDaGFubmVsczsgY2grKykge1xuICAgICAgYXJyYXlDaERhdGEgPSBpbkJ1ZmZlci5nZXRDaGFubmVsRGF0YShjaCk7XG4gICAgICBhcnJheU91dENoRGF0YSA9IG91dEJ1ZmZlci5nZXRDaGFubmVsRGF0YShjaCk7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5MZW5ndGg7IGkrKylcbiAgICAgICAgYXJyYXlPdXRDaERhdGFbaV0gPSBhcnJheUNoRGF0YVtpXTtcblxuICAgICAgZm9yIChsZXQgaSA9IGluTGVuZ3RoOyBpIDwgb3V0TGVuZ3RoOyBpKyspXG4gICAgICAgIGFycmF5T3V0Q2hEYXRhW2ldID0gYXJyYXlDaERhdGFbaSAtIGluTGVuZ3RoXTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0QnVmZmVyO1xuICB9XG5cbiAgLyoqIGRlcHJlY2F0ZWQgKi9cbiAgbG9hZChmaWxlcywgdmlldyA9IG51bGwpIHtcbiAgICByZXR1cm4gdGhpcy5sb2FkRmlsZXMoZmlsZXMsIHZpZXcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIGEgbG9hZGVkIG9iamVjdC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gT2JqZWN0IG9yIGdyb3VwIGlkZW50aWZpZXIuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgLSBNZW1iZXIga2V5IGluIGdyb3VwLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIHRoZSBsb2FkZWQgb2JqZWN0LlxuICAgKi9cbiAgZ2V0KGlkLCBrZXkgPSBudWxsKSB7XG4gICAgY29uc3Qgb2JqID0gdGhpcy5kYXRhW2lkXTtcblxuICAgIGlmIChvYmogJiYgKGtleSAhPT0gbnVsbCkpXG4gICAgICByZXR1cm4gb2JqW2tleV07XG5cbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIGEgc2luZ2xlIGF1ZGlvIGJ1ZmZlciBhc3NvY2lhdGVkIHRvIGEgZ2l2ZW4gaWQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIE9iamVjdCBpZGVudGlmaWVyLlxuICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggLSBBdWRpbyBidWZmZXIgaW5kZXggKGlmIGFycmF5KS5cbiAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBhIHNpbmdsZSBsb2FkZWQgYXVkaW8gYnVmZmVyIGFzc29jaWF0ZWQgdG8gdGhlIGdpdmVuIGlkLlxuICAgKi9cbiAgZ2V0QXVkaW9CdWZmZXIoaWQgPSAnZGVmYXVsdCcsIGluZGV4ID0gMCkge1xuICAgIHJldHVybiB0aGlzLmF1ZGlvQnVmZmVyc1tpZF1baW5kZXhdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIGFuIGFycmF5IG9mIGF1ZGlvIGJ1ZmZlcnMgYXNzb2NpYXRlZCB0byBhIGdpdmVuIGlkLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBPYmplY3QgaWRlbnRpZmllci5cbiAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBhbiBhcnJheSBvZiBsb2FkZWQgYXVkaW8gYnVmZmVycyBhc3NvY2lhdGVkIHRvIHRoZSBnaXZlbiBpZC5cbiAgICovXG4gIGdldEF1ZGlvQnVmZmVyQXJyYXkoaWQgPSAnZGVmYXVsdCcpIHtcbiAgICByZXR1cm4gdGhpcy5hdWRpb0J1ZmZlcnNbaWRdO1xuICB9XG59XG5cbnNlcnZpY2VNYW5hZ2VyLnJlZ2lzdGVyKFNFUlZJQ0VfSUQsIEF1ZGlvQnVmZmVyTWFuYWdlcik7XG5cbmV4cG9ydCBkZWZhdWx0IEF1ZGlvQnVmZmVyTWFuYWdlcjtcbiJdfQ==