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

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Process2 = require('./Process');

var _Process3 = _interopRequireDefault(_Process2);

var _Signal = require('./Signal');

var _Signal2 = _interopRequireDefault(_Signal);

var _SignalAll = require('./SignalAll');

var _SignalAll2 = _interopRequireDefault(_SignalAll);

var _socket = require('./socket');

var _socket2 = _interopRequireDefault(_socket);

var _View = require('../views/View');

var _View2 = _interopRequireDefault(_View);

var _viewManager = require('./viewManager');

var _viewManager2 = _interopRequireDefault(_viewManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Internal base class for services and scenes. Basically a process with view
 * and optionnal network abilities.
 *
 * @memberof module:soundworks/client
 * @extends module:soundworks/client.Process
 */
var Activity = function (_Process) {
  (0, _inherits3.default)(Activity, _Process);

  /**
   * @param {String} id - Id of the activity.
   * @param {Boolean} hasNetwork - Define if the activity needs a socket
   *  connection or not.
   */
  function Activity(id) {
    var hasNetwork = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    (0, _classCallCheck3.default)(this, Activity);

    /**
     * If `true`, defines if the activity has already started once.
     * @type {Boolean}
     * @name hasStarted
     * @instance
     * @memberof module:soundworks/client.Activity
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Activity.__proto__ || (0, _getPrototypeOf2.default)(Activity)).call(this, id));

    _this.hasStarted = false;

    /**
     * Defines if the activity needs a connection to the server.
     * @type {Boolean}
     * @name hasNetwork
     * @instance
     * @memberof module:soundworks/client.Activity
     */
    _this.hasNetwork = !!hasNetwork;

    // register as a networked service, setup the socket connection
    if (_this.hasNetwork) _socket2.default.required = true;

    /**
     * View of the activity.
     * @type {module:soundworks/client.View}
     * @name view
     * @instance
     * @memberof module:soundworks/client.Activity
     */
    _this.view = null;

    /**
     * Events to bind to the view. (mimic the Backbone's syntax).
     * @type {Object}
     * @name viewEvents
     * @instance
     * @memberof module:soundworks/client.Activity
     * @example
     * this.viewEvents = {
     *   "touchstart .button": (e) => {
     *     // do somthing
     *   },
     *   // etc...
     * };
     */
    _this.viewEvents = {};

    /**
     * Additionnal options to pass to the view.
     * @type {Object}
     * @name viewOptions
     * @instance
     * @memberof module:soundworks/client.Activity
     */
    _this.viewOptions = {};

    /**
     * View constructor to be used in
     * [`Activity#createView`]{@link module:soundworks/client.Activity#createView}.
     * @type {module:soundworks/client.View}
     * @default module:soundworks/client.View
     * @name viewCtor
     * @instance
     * @memberof module:soundworks/client.Activity
     */
    _this.viewCtor = _View2.default;

    /**
     * Options of the activity.
     * @type {Object}
     * @name options
     * @instance
     * @memberof module:soundworks/client.Activity
     */
    _this.options = { viewPriority: 0 };

    /**
     * Define which signal the `Activity` requires to start.
     * @private
     */
    _this.requiredSignals = new _SignalAll2.default();

    _this.send = _this.send.bind(_this);
    _this.sendVolatile = _this.sendVolatile.bind(_this);
    _this.receive = _this.receive.bind(_this);
    _this.removeListener = _this.removeListener.bind(_this);
    return _this;
  }

  /**
   * Interface method to be implemented in child classes.
   * Define what to do when a service is required by an `Activity`.
   */


  (0, _createClass3.default)(Activity, [{
    key: 'require',
    value: function require() {}

    /**
     * Configure the activity with the given options.
     * @param {Object} options
     */

  }, {
    key: 'configure',
    value: function configure(options) {
      (0, _assign2.default)(this.options, options);
    }

    /**
     * Share the defined view templates with all `Activity` instances.
     * @param {Object} defs - An object containing the view templates.
     * @private
     */

  }, {
    key: 'createView',


    /**
     * Create the view of the activity according to its `viewCtor`, `viewTemplate`,
     * `viewContent`, `viewEvents` and `viewOptions` attributes.
     */
    value: function createView() {
      var options = (0, _assign2.default)({
        id: this.id.replace(/\:/g, '-'),
        className: 'activity',
        priority: this.options.viewPriority
      }, this.viewOptions);

      return new this.viewCtor(this.viewTemplate, this.viewContent, this.viewEvents, options);
    }

    /**
     * Request the view manager to display the view. The call of this method
     * doesn't guarantee a synchronized rendering or any rendering at all as the
     * view manager decides which view to display based on their priority.
     */

  }, {
    key: 'show',
    value: function show() {
      if (!this.view) {
        return;
      }

      this.view.render();
      _viewManager2.default.register(this.view);
    }

    /**
     * Hide the view of the activity if it owns one.
     */

  }, {
    key: 'hide',
    value: function hide() {
      if (!this.view) {
        return;
      }

      _viewManager2.default.remove(this.view);
    }

    /**
     * Send a web socket message to the server on a given channel.
     * @param {String} channel - The channel of the message (is automatically
     *  namespaced with the activity's id: `${this.id}:channel`).
     * @param {...*} args - Arguments of the message (as many as needed, of any type).
     */

  }, {
    key: 'send',
    value: function send(channel) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      _socket2.default.send.apply(_socket2.default, [this.id + ':' + channel].concat(args));
    }

    /**
     * Send a web socket message to the server on a given channel.
     * @param {String} channel - The channel of the message (is automatically
     *  namespaced with the activity's id: `${this.id}:channel`).
     * @param {...*} args - Arguments of the message (as many as needed, of any type).
     */

  }, {
    key: 'sendVolatile',
    value: function sendVolatile(channel) {
      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      _socket2.default.sendVolatile.apply(_socket2.default, [this.id + ':' + channel].concat(args));
    }

    /**
     * Listen to web socket messages from the server on a given channel.
     * @param {String} channel - The channel of the message (is automatically
     *  namespaced with the activity's id: `${this.id}:channel`).
     * @param {Function} callback - The callback to execute when a message is received.
     */

  }, {
    key: 'receive',
    value: function receive(channel, callback) {
      _socket2.default.receive(this.id + ':' + channel, callback);
    }

    /**
     * Stop listening for messages from the server on a given channel.
     * @param {String} channel - The channel of the message (is automatically
     *  namespaced with the activity's id: `${this.id}:channel`).
     * @param {Function} callback - The callback to remove from the stack.
     */

  }, {
    key: 'removeListener',
    value: function removeListener(channel, callback) {
      _socket2.default.removeListener(this.id + ':' + channel, callback);
    }
  }, {
    key: 'viewTemplate',


    /**
     * The template related to the `id` of the activity.
     * @type {String}
     * @see {@link module:soundworks/client.defaultViewTemplates}
     */
    get: function get() {
      var viewTemplate = this._viewTemplate || this.viewTemplateDefinitions[this.id] || this._defaultViewTemplate;

      return viewTemplate;
    },
    set: function set(tmpl) {
      this._viewTemplate = tmpl;
    }

    /**
     * The view contents related to the `id` of the activity. The object is
     * extended with a pointer to the `globals` entry of the defined view contents.
     * @type {Object}
     * @see {@link module:soundworks/client.defaultViewContent}
     */

  }, {
    key: 'viewContent',
    get: function get() {
      var viewContent = this._viewContent || this.viewContentDefinitions[this.id] || this._defaultViewContent;

      if (viewContent) viewContent.globals = this.viewContentDefinitions.globals;

      return viewContent;
    },
    set: function set(obj) {
      this._viewContent = obj;
    }
  }], [{
    key: 'setViewTemplateDefinitions',
    value: function setViewTemplateDefinitions(defs) {
      Activity.prototype.viewTemplateDefinitions = defs;
    }

    /**
     * Share the view content configuration (name and data) with all the
     * `Activity` instances
     * @param {Object} defs - The view contents of the application.
     * @private
     */

  }, {
    key: 'setViewContentDefinitions',
    value: function setViewContentDefinitions(defs) {
      Activity.prototype.viewContentDefinitions = defs;
    }
  }]);
  return Activity;
}(_Process3.default);

Activity.prototype.viewTemplateDefinitions = {};
Activity.prototype.viewContentDefinitions = {};

exports.default = Activity;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFjdGl2aXR5LmpzIl0sIm5hbWVzIjpbIkFjdGl2aXR5IiwiaWQiLCJoYXNOZXR3b3JrIiwiaGFzU3RhcnRlZCIsInJlcXVpcmVkIiwidmlldyIsInZpZXdFdmVudHMiLCJ2aWV3T3B0aW9ucyIsInZpZXdDdG9yIiwib3B0aW9ucyIsInZpZXdQcmlvcml0eSIsInJlcXVpcmVkU2lnbmFscyIsInNlbmQiLCJiaW5kIiwic2VuZFZvbGF0aWxlIiwicmVjZWl2ZSIsInJlbW92ZUxpc3RlbmVyIiwicmVwbGFjZSIsImNsYXNzTmFtZSIsInByaW9yaXR5Iiwidmlld1RlbXBsYXRlIiwidmlld0NvbnRlbnQiLCJyZW5kZXIiLCJyZWdpc3RlciIsInJlbW92ZSIsImNoYW5uZWwiLCJhcmdzIiwiY2FsbGJhY2siLCJfdmlld1RlbXBsYXRlIiwidmlld1RlbXBsYXRlRGVmaW5pdGlvbnMiLCJfZGVmYXVsdFZpZXdUZW1wbGF0ZSIsInRtcGwiLCJfdmlld0NvbnRlbnQiLCJ2aWV3Q29udGVudERlZmluaXRpb25zIiwiX2RlZmF1bHRWaWV3Q29udGVudCIsImdsb2JhbHMiLCJvYmoiLCJkZWZzIiwicHJvdG90eXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUdBOzs7Ozs7O0lBT01BLFE7OztBQUNKOzs7OztBQUtBLG9CQUFZQyxFQUFaLEVBQW1DO0FBQUEsUUFBbkJDLFVBQW1CLHVFQUFOLElBQU07QUFBQTs7QUFHakM7Ozs7Ozs7QUFIaUMsMElBQzNCRCxFQUQyQjs7QUFVakMsVUFBS0UsVUFBTCxHQUFrQixLQUFsQjs7QUFFQTs7Ozs7OztBQU9BLFVBQUtELFVBQUwsR0FBa0IsQ0FBQyxDQUFDQSxVQUFwQjs7QUFFQTtBQUNBLFFBQUksTUFBS0EsVUFBVCxFQUNFLGlCQUFPRSxRQUFQLEdBQWtCLElBQWxCOztBQUVGOzs7Ozs7O0FBT0Es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QUE0QixLQUFLaEMsRUFBakMsQ0FEa0IsSUFFbEIsS0FBS2lDLG1CQUZQOztBQUlBLFVBQUliLFdBQUosRUFDRUEsWUFBWWMsT0FBWixHQUFzQixLQUFLRixzQkFBTCxDQUE0QkUsT0FBbEQ7O0FBRUYsYUFBT2QsV0FBUDtBQUNELEs7c0JBRWVlLEcsRUFBSztBQUNuQixXQUFLSixZQUFMLEdBQW9CSSxHQUFwQjtBQUNEOzs7K0NBbERpQ0MsSSxFQUFNO0FBQ3RDckMsZUFBU3NDLFNBQVQsQ0FBbUJULHVCQUFuQixHQUE2Q1EsSUFBN0M7QUFDRDs7QUFFRDs7Ozs7Ozs7OzhDQU1pQ0EsSSxFQUFNO0FBQ3JDckMsZUFBU3NDLFNBQVQsQ0FBbUJMLHNCQUFuQixHQUE0Q0ksSUFBNUM7QUFDRDs7Ozs7QUFvSEhyQyxTQUFTc0MsU0FBVCxDQUFtQlQsdUJBQW5CLEdBQTZDLEVBQTdDO0FBQ0E3QixTQUFTc0MsU0FBVCxDQUFtQkwsc0JBQW5CLEdBQTRDLEVBQTVDOztrQkFFZWpDLFEiLCJmaWxlIjoiQWN0aXZpdHkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUHJvY2VzcyBmcm9tICcuL1Byb2Nlc3MnO1xuaW1wb3J0IFNpZ25hbCBmcm9tICcuL1NpZ25hbCc7XG5pbXBvcnQgU2lnbmFsQWxsIGZyb20gJy4vU2lnbmFsQWxsJztcbmltcG9ydCBzb2NrZXQgZnJvbSAnLi9zb2NrZXQnO1xuaW1wb3J0IFZpZXcgZnJvbSAnLi4vdmlld3MvVmlldyc7XG5pbXBvcnQgdmlld01hbmFnZXIgZnJvbSAnLi92aWV3TWFuYWdlcic7XG5cblxuLyoqXG4gKiBJbnRlcm5hbCBiYXNlIGNsYXNzIGZvciBzZXJ2aWNlcyBhbmQgc2NlbmVzLiBCYXNpY2FsbHkgYSBwcm9jZXNzIHdpdGggdmlld1xuICogYW5kIG9wdGlvbm5hbCBuZXR3b3JrIGFiaWxpdGllcy5cbiAqXG4gKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50XG4gKiBAZXh0ZW5kcyBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuUHJvY2Vzc1xuICovXG5jbGFzcyBBY3Rpdml0eSBleHRlbmRzIFByb2Nlc3Mge1xuICAvKipcbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gSWQgb2YgdGhlIGFjdGl2aXR5LlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGhhc05ldHdvcmsgLSBEZWZpbmUgaWYgdGhlIGFjdGl2aXR5IG5lZWRzIGEgc29ja2V0XG4gICAqICBjb25uZWN0aW9uIG9yIG5vdC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGlkLCBoYXNOZXR3b3JrID0gdHJ1ZSkge1xuICAgIHN1cGVyKGlkKTtcblxuICAgIC8qKlxuICAgICAqIElmIGB0cnVlYCwgZGVmaW5lcyBpZiB0aGUgYWN0aXZpdHkgaGFzIGFscmVhZHkgc3RhcnRlZCBvbmNlLlxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBuYW1lIGhhc1N0YXJ0ZWRcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LkFjdGl2aXR5XG4gICAgICovXG4gICAgdGhpcy5oYXNTdGFydGVkID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBEZWZpbmVzIGlmIHRoZSBhY3Rpdml0eSBuZWVkcyBhIGNvbm5lY3Rpb24gdG8gdGhlIHNlcnZlci5cbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAbmFtZSBoYXNOZXR3b3JrXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5BY3Rpdml0eVxuICAgICAqL1xuICAgIHRoaXMuaGFzTmV0d29yayA9ICEhaGFzTmV0d29yaztcblxuICAgIC8vIHJlZ2lzdGVyIGFzIGEgbmV0d29ya2VkIHNlcnZpY2UsIHNldHVwIHRoZSBzb2NrZXQgY29ubmVjdGlvblxuICAgIGlmICh0aGlzLmhhc05ldHdvcmspXG4gICAgICBzb2NrZXQucmVxdWlyZWQgPSB0cnVlO1xuXG4gICAgLyoqXG4gICAgICogVmlldyBvZiB0aGUgYWN0aXZpdHkuXG4gICAgICogQHR5cGUge21vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5WaWV3fVxuICAgICAqIEBuYW1lIHZpZXdcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LkFjdGl2aXR5XG4gICAgICovXG4gICAgdGhpcy52aWV3ID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEV2ZW50cyB0byBiaW5kIHRvIHRoZSB2aWV3LiAobWltaWMgdGhlIEJhY2tib25lJ3Mgc3ludGF4KS5cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBuYW1lIHZpZXdFdmVudHNcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LkFjdGl2aXR5XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0aGlzLnZpZXdFdmVudHMgPSB7XG4gICAgICogICBcInRvdWNoc3RhcnQgLmJ1dHRvblwiOiAoZSkgPT4ge1xuICAgICAqICAgICAvLyBkbyBzb210aGluZ1xuICAgICAqICAgfSxcbiAgICAgKiAgIC8vIGV0Yy4uLlxuICAgICAqIH07XG4gICAgICovXG4gICAgdGhpcy52aWV3RXZlbnRzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBBZGRpdGlvbm5hbCBvcHRpb25zIHRvIHBhc3MgdG8gdGhlIHZpZXcuXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAbmFtZSB2aWV3T3B0aW9uc1xuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuQWN0aXZpdHlcbiAgICAgKi9cbiAgICB0aGlzLnZpZXdPcHRpb25zID0ge307XG5cbiAgICAvKipcbiAgICAgKiBWaWV3IGNvbnN0cnVjdG9yIHRvIGJlIHVzZWQgaW5cbiAgICAgKiBbYEFjdGl2aXR5I2NyZWF0ZVZpZXdgXXtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuQWN0aXZpdHkjY3JlYXRlVmlld30uXG4gICAgICogQHR5cGUge21vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5WaWV3fVxuICAgICAqIEBkZWZhdWx0IG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5WaWV3XG4gICAgICogQG5hbWUgdmlld0N0b3JcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LkFjdGl2aXR5XG4gICAgICovXG4gICAgdGhpcy52aWV3Q3RvciA9IFZpZXc7XG5cbiAgICAvKipcbiAgICAgKiBPcHRpb25zIG9mIHRoZSBhY3Rpdml0eS5cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBuYW1lIG9wdGlvbnNcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LkFjdGl2aXR5XG4gICAgICovXG4gICAgdGhpcy5vcHRpb25zID0geyB2aWV3UHJpb3JpdHk6IDAgfTtcblxuICAgIC8qKlxuICAgICAqIERlZmluZSB3aGljaCBzaWduYWwgdGhlIGBBY3Rpdml0eWAgcmVxdWlyZXMgdG8gc3RhcnQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnJlcXVpcmVkU2lnbmFscyA9IG5ldyBTaWduYWxBbGwoKTtcblxuICAgIHRoaXMuc2VuZCA9IHRoaXMuc2VuZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc2VuZFZvbGF0aWxlID0gdGhpcy5zZW5kVm9sYXRpbGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlY2VpdmUgPSB0aGlzLnJlY2VpdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyID0gdGhpcy5yZW1vdmVMaXN0ZW5lci5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEludGVyZmFjZSBtZXRob2QgdG8gYmUgaW1wbGVtZW50ZWQgaW4gY2hpbGQgY2xhc3Nlcy5cbiAgICogRGVmaW5lIHdoYXQgdG8gZG8gd2hlbiBhIHNlcnZpY2UgaXMgcmVxdWlyZWQgYnkgYW4gYEFjdGl2aXR5YC5cbiAgICovXG4gIHJlcXVpcmUoKSB7fVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmUgdGhlIGFjdGl2aXR5IHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqL1xuICBjb25maWd1cmUob3B0aW9ucykge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaGFyZSB0aGUgZGVmaW5lZCB2aWV3IHRlbXBsYXRlcyB3aXRoIGFsbCBgQWN0aXZpdHlgIGluc3RhbmNlcy5cbiAgICogQHBhcmFtIHtPYmplY3R9IGRlZnMgLSBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgdmlldyB0ZW1wbGF0ZXMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzdGF0aWMgc2V0Vmlld1RlbXBsYXRlRGVmaW5pdGlvbnMoZGVmcykge1xuICAgIEFjdGl2aXR5LnByb3RvdHlwZS52aWV3VGVtcGxhdGVEZWZpbml0aW9ucyA9IGRlZnM7XG4gIH1cblxuICAvKipcbiAgICogU2hhcmUgdGhlIHZpZXcgY29udGVudCBjb25maWd1cmF0aW9uIChuYW1lIGFuZCBkYXRhKSB3aXRoIGFsbCB0aGVcbiAgICogYEFjdGl2aXR5YCBpbnN0YW5jZXNcbiAgICogQHBhcmFtIHtPYmplY3R9IGRlZnMgLSBUaGUgdmlldyBjb250ZW50cyBvZiB0aGUgYXBwbGljYXRpb24uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzdGF0aWMgc2V0Vmlld0NvbnRlbnREZWZpbml0aW9ucyhkZWZzKSB7XG4gICAgQWN0aXZpdHkucHJvdG90eXBlLnZpZXdDb250ZW50RGVmaW5pdGlvbnMgPSBkZWZzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSB0ZW1wbGF0ZSByZWxhdGVkIHRvIHRoZSBgaWRgIG9mIHRoZSBhY3Rpdml0eS5cbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQHNlZSB7QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LmRlZmF1bHRWaWV3VGVtcGxhdGVzfVxuICAgKi9cbiAgZ2V0IHZpZXdUZW1wbGF0ZSgpIHtcbiAgICBjb25zdCB2aWV3VGVtcGxhdGUgPSB0aGlzLl92aWV3VGVtcGxhdGUgfHzCoFxuICAgICAgdGhpcy52aWV3VGVtcGxhdGVEZWZpbml0aW9uc1t0aGlzLmlkXSB8fFxuICAgICAgdGhpcy5fZGVmYXVsdFZpZXdUZW1wbGF0ZTtcblxuICAgIHJldHVybiB2aWV3VGVtcGxhdGU7XG4gIH1cblxuICBzZXQgdmlld1RlbXBsYXRlKHRtcGwpIHtcbiAgICB0aGlzLl92aWV3VGVtcGxhdGUgPSB0bXBsO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSB2aWV3IGNvbnRlbnRzIHJlbGF0ZWQgdG8gdGhlIGBpZGAgb2YgdGhlIGFjdGl2aXR5LiBUaGUgb2JqZWN0IGlzXG4gICAqIGV4dGVuZGVkIHdpdGggYSBwb2ludGVyIHRvIHRoZSBgZ2xvYmFsc2AgZW50cnkgb2YgdGhlIGRlZmluZWQgdmlldyBjb250ZW50cy5cbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQHNlZSB7QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LmRlZmF1bHRWaWV3Q29udGVudH1cbiAgICovXG4gIGdldCB2aWV3Q29udGVudCgpIHtcbiAgICBjb25zdCB2aWV3Q29udGVudCA9IHRoaXMuX3ZpZXdDb250ZW50IHx8wqBcbiAgICAgIHRoaXMudmlld0NvbnRlbnREZWZpbml0aW9uc1t0aGlzLmlkXSB8fFxuICAgICAgdGhpcy5fZGVmYXVsdFZpZXdDb250ZW50O1xuXG4gICAgaWYgKHZpZXdDb250ZW50KVxuICAgICAgdmlld0NvbnRlbnQuZ2xvYmFscyA9IHRoaXMudmlld0NvbnRlbnREZWZpbml0aW9ucy5nbG9iYWxzO1xuXG4gICAgcmV0dXJuIHZpZXdDb250ZW50O1xuICB9XG5cbiAgc2V0IHZpZXdDb250ZW50KG9iaikge1xuICAgIHRoaXMuX3ZpZXdDb250ZW50ID0gb2JqO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSB0aGUgdmlldyBvZiB0aGUgYWN0aXZpdHkgYWNjb3JkaW5nIHRvIGl0cyBgdmlld0N0b3JgLCBgdmlld1RlbXBsYXRlYCxcbiAgICogYHZpZXdDb250ZW50YCwgYHZpZXdFdmVudHNgIGFuZCBgdmlld09wdGlvbnNgIGF0dHJpYnV0ZXMuXG4gICAqL1xuICBjcmVhdGVWaWV3KCkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIGlkOiB0aGlzLmlkLnJlcGxhY2UoL1xcOi9nLCAnLScpLFxuICAgICAgY2xhc3NOYW1lOiAnYWN0aXZpdHknLFxuICAgICAgcHJpb3JpdHk6IHRoaXMub3B0aW9ucy52aWV3UHJpb3JpdHksXG4gICAgfSwgdGhpcy52aWV3T3B0aW9ucyk7XG5cbiAgICByZXR1cm4gbmV3IHRoaXMudmlld0N0b3IodGhpcy52aWV3VGVtcGxhdGUsIHRoaXMudmlld0NvbnRlbnQsIHRoaXMudmlld0V2ZW50cywgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdCB0aGUgdmlldyBtYW5hZ2VyIHRvIGRpc3BsYXkgdGhlIHZpZXcuIFRoZSBjYWxsIG9mIHRoaXMgbWV0aG9kXG4gICAqIGRvZXNuJ3QgZ3VhcmFudGVlIGEgc3luY2hyb25pemVkIHJlbmRlcmluZyBvciBhbnkgcmVuZGVyaW5nIGF0IGFsbCBhcyB0aGVcbiAgICogdmlldyBtYW5hZ2VyIGRlY2lkZXMgd2hpY2ggdmlldyB0byBkaXNwbGF5IGJhc2VkIG9uIHRoZWlyIHByaW9yaXR5LlxuICAgKi9cbiAgc2hvdygpIHtcbiAgICBpZiAoIXRoaXMudmlldykgeyByZXR1cm47IH1cblxuICAgIHRoaXMudmlldy5yZW5kZXIoKTtcbiAgICB2aWV3TWFuYWdlci5yZWdpc3Rlcih0aGlzLnZpZXcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhpZGUgdGhlIHZpZXcgb2YgdGhlIGFjdGl2aXR5IGlmIGl0IG93bnMgb25lLlxuICAgKi9cbiAgaGlkZSgpIHtcbiAgICBpZiAoIXRoaXMudmlldykgeyByZXR1cm47IH1cblxuICAgIHZpZXdNYW5hZ2VyLnJlbW92ZSh0aGlzLnZpZXcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgYSB3ZWIgc29ja2V0IG1lc3NhZ2UgdG8gdGhlIHNlcnZlciBvbiBhIGdpdmVuIGNoYW5uZWwuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjaGFubmVsIC0gVGhlIGNoYW5uZWwgb2YgdGhlIG1lc3NhZ2UgKGlzIGF1dG9tYXRpY2FsbHlcbiAgICogIG5hbWVzcGFjZWQgd2l0aCB0aGUgYWN0aXZpdHkncyBpZDogYCR7dGhpcy5pZH06Y2hhbm5lbGApLlxuICAgKiBAcGFyYW0gey4uLip9IGFyZ3MgLSBBcmd1bWVudHMgb2YgdGhlIG1lc3NhZ2UgKGFzIG1hbnkgYXMgbmVlZGVkLCBvZiBhbnkgdHlwZSkuXG4gICAqL1xuICBzZW5kKGNoYW5uZWwsIC4uLmFyZ3MpIHtcbiAgICBzb2NrZXQuc2VuZChgJHt0aGlzLmlkfToke2NoYW5uZWx9YCwgLi4uYXJncyk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBhIHdlYiBzb2NrZXQgbWVzc2FnZSB0byB0aGUgc2VydmVyIG9uIGEgZ2l2ZW4gY2hhbm5lbC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGNoYW5uZWwgLSBUaGUgY2hhbm5lbCBvZiB0aGUgbWVzc2FnZSAoaXMgYXV0b21hdGljYWxseVxuICAgKiAgbmFtZXNwYWNlZCB3aXRoIHRoZSBhY3Rpdml0eSdzIGlkOiBgJHt0aGlzLmlkfTpjaGFubmVsYCkuXG4gICAqIEBwYXJhbSB7Li4uKn0gYXJncyAtIEFyZ3VtZW50cyBvZiB0aGUgbWVzc2FnZSAoYXMgbWFueSBhcyBuZWVkZWQsIG9mIGFueSB0eXBlKS5cbiAgICovXG4gIHNlbmRWb2xhdGlsZShjaGFubmVsLCAuLi5hcmdzKSB7XG4gICAgc29ja2V0LnNlbmRWb2xhdGlsZShgJHt0aGlzLmlkfToke2NoYW5uZWx9YCwgLi4uYXJncyk7XG4gIH1cblxuICAvKipcbiAgICogTGlzdGVuIHRvIHdlYiBzb2NrZXQgbWVzc2FnZXMgZnJvbSB0aGUgc2VydmVyIG9uIGEgZ2l2ZW4gY2hhbm5lbC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGNoYW5uZWwgLSBUaGUgY2hhbm5lbCBvZiB0aGUgbWVzc2FnZSAoaXMgYXV0b21hdGljYWxseVxuICAgKiAgbmFtZXNwYWNlZCB3aXRoIHRoZSBhY3Rpdml0eSdzIGlkOiBgJHt0aGlzLmlkfTpjaGFubmVsYCkuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIHRvIGV4ZWN1dGUgd2hlbiBhIG1lc3NhZ2UgaXMgcmVjZWl2ZWQuXG4gICAqL1xuICByZWNlaXZlKGNoYW5uZWwsIGNhbGxiYWNrKSB7XG4gICAgc29ja2V0LnJlY2VpdmUoYCR7dGhpcy5pZH06JHtjaGFubmVsfWAsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIGxpc3RlbmluZyBmb3IgbWVzc2FnZXMgZnJvbSB0aGUgc2VydmVyIG9uIGEgZ2l2ZW4gY2hhbm5lbC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGNoYW5uZWwgLSBUaGUgY2hhbm5lbCBvZiB0aGUgbWVzc2FnZSAoaXMgYXV0b21hdGljYWxseVxuICAgKiAgbmFtZXNwYWNlZCB3aXRoIHRoZSBhY3Rpdml0eSdzIGlkOiBgJHt0aGlzLmlkfTpjaGFubmVsYCkuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIHRvIHJlbW92ZSBmcm9tIHRoZSBzdGFjay5cbiAgICovXG4gIHJlbW92ZUxpc3RlbmVyKGNoYW5uZWwsIGNhbGxiYWNrKSB7XG4gICAgc29ja2V0LnJlbW92ZUxpc3RlbmVyKGAke3RoaXMuaWR9OiR7Y2hhbm5lbH1gLCBjYWxsYmFjayk7XG4gIH1cbn1cblxuQWN0aXZpdHkucHJvdG90eXBlLnZpZXdUZW1wbGF0ZURlZmluaXRpb25zID0ge307XG5BY3Rpdml0eS5wcm90b3R5cGUudmlld0NvbnRlbnREZWZpbml0aW9ucyA9IHt9O1xuXG5leHBvcnQgZGVmYXVsdCBBY3Rpdml0eTtcbiJdfQ==