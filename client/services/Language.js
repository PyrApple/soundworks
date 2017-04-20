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

var _client = require('../core/client');

var _client2 = _interopRequireDefault(_client);

var _Service2 = require('../core/Service');

var _Service3 = _interopRequireDefault(_Service2);

var _serviceManager = require('../core/serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

var _SegmentedView = require('../views/SegmentedView');

var _SegmentedView2 = _interopRequireDefault(_SegmentedView);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SERVICE_ID = 'service:language';

var defaultViewTemplate = '\n <div class="section-top"></div>\n <div class="section-center">\n   <% Object.keys(options).forEach(function(key,index) { %>\n     <button class="btn" data-id="<%= key %>"><%= options[key] %></button>\n   <% }); %>\n </div>\n <div class="section-bottom"></div>\n';

/**
 * Interface for the view of the `language` service.
 *
 * Allow to select the experience language at startup. Selected language tag will 
 * then be available in client.language.
 *
 * @memberof module:soundworks/client
 *
 * @example
 * // inside the experience constructor
 * this.language = this.require('language', {options: {en: 'English', fr:'Français'} })
 * console.log(client.language);
 */

var Language = function (_Service) {
  (0, _inherits3.default)(Language, _Service);

  function Language() {
    (0, _classCallCheck3.default)(this, Language);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Language.__proto__ || (0, _getPrototypeOf2.default)(Language)).call(this, SERVICE_ID, false));

    var defaults = {
      // viewCtor: SegmentedView, // @fixme
      viewPriority: 9,
      options: {},
      contents: {}
    };

    _this.configure(defaults);

    _this._defaultViewTemplate = defaultViewTemplate;

    _this._onClick = _this._onClick.bind(_this);
    return _this;
  }

  /** @private */


  (0, _createClass3.default)(Language, [{
    key: 'init',
    value: function init() {
      this.viewContent = { options: this.options.options };
      this.viewCtor = _SegmentedView2.default;
      this.viewTemplate = this._defaultViewTemplate;
      this.viewEvents = {
        'click .btn': this._onClick
      };

      this.view = this.createView();
    }

    /** @private */

  }, {
    key: 'start',
    value: function start() {
      (0, _get3.default)(Language.prototype.__proto__ || (0, _getPrototypeOf2.default)(Language.prototype), 'start', this).call(this);

      if (!this._hasStarted) this.init();

      this.show();
    }

    /** @private */

  }, {
    key: 'stop',
    value: function stop() {
      (0, _get3.default)(Language.prototype.__proto__ || (0, _getPrototypeOf2.default)(Language.prototype), 'stop', this).call(this);
      // this.removeListener('acknowledge', this._onAknowledgeResponse);

      this.hide();
    }
  }, {
    key: '_onClick',
    value: function _onClick(e) {
      var $btn = e.target;
      var id = $btn.getAttribute('data-id');
      var content = this.options[id];

      _client2.default.setViewContentDefinitions(content || {});
      _client2.default.language = id;
      this.ready();
    }
  }]);
  return Language;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, Language);

exports.default = Language;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxhbmd1YWdlLmpzIl0sIm5hbWVzIjpbIlNFUlZJQ0VfSUQiLCJkZWZhdWx0Vmlld1RlbXBsYXRlIiwiTGFuZ3VhZ2UiLCJkZWZhdWx0cyIsInZpZXdQcmlvcml0eSIsIm9wdGlvbnMiLCJjb250ZW50cyIsImNvbmZpZ3VyZSIsIl9kZWZhdWx0Vmlld1RlbXBsYXRlIiwiX29uQ2xpY2siLCJiaW5kIiwidmlld0NvbnRlbnQiLCJ2aWV3Q3RvciIsInZpZXdUZW1wbGF0ZSIsInZpZXdFdmVudHMiLCJ2aWV3IiwiY3JlYXRlVmlldyIsIl9oYXNTdGFydGVkIiwiaW5pdCIsInNob3ciLCJoaWRlIiwiZSIsIiRidG4iLCJ0YXJnZXQiLCJpZCIsImdldEF0dHJpYnV0ZSIsImNvbnRlbnQiLCJzZXRWaWV3Q29udGVudERlZmluaXRpb25zIiwibGFuZ3VhZ2UiLCJyZWFkeSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTUEsYUFBYSxrQkFBbkI7O0FBRUEsSUFBTUMsZ1NBQU47O0FBVUE7Ozs7Ozs7Ozs7Ozs7O0lBY01DLFE7OztBQUNKLHNCQUFjO0FBQUE7O0FBQUEsMElBQ05GLFVBRE0sRUFDTSxLQUROOztBQUdaLFFBQU1HLFdBQVc7QUFDZjtBQUNBQyxvQkFBYyxDQUZDO0FBR2ZDLGVBQVMsRUFITTtBQUlmQyxnQkFBVTtBQUpLLEtBQWpCOztBQU9BLFVBQUtDLFNBQUwsQ0FBZUosUUFBZjs7QUFFQSxVQUFLSyxvQkFBTCxHQUE0QlAsbUJBQTVCOztBQUVBLFVBQUtRLFFBQUwsR0FBZ0IsTUFBS0EsUUFBTCxDQUFjQyxJQUFkLE9BQWhCO0FBZFk7QUFlYjs7QUFFRDs7Ozs7MkJBQ087QUFDTCxXQUFLQyxXQUFMLEdBQW1CLEVBQUVOLFNBQVMsS0FBS0EsT0FBTCxDQUFhQSxPQUF4QixFQUFuQjtBQUNBLFdBQUtPLFFBQUw7QUFDQSxXQUFLQyxZQUFMLEdBQW9CLEtBQUtMLG9CQUF6QjtBQUNBLFdBQUtNLFVBQUwsR0FBa0I7QUFDaEIsc0JBQWMsS0FBS0w7QUFESCxPQUFsQjs7QUFJQSxXQUFLTSxJQUFMLEdBQVksS0FBS0MsVUFBTCxFQUFaO0FBQ0Q7O0FBRUQ7Ozs7NEJBQ1E7QUFDTjs7QUFFQSxVQUFJLENBQUMsS0FBS0MsV0FBVixFQUNFLEtBQUtDLElBQUw7O0FBR0YsV0FBS0MsSUFBTDtBQUNEOztBQUVEOzs7OzJCQUNPO0FBQ0w7QUFDQTs7QUFFQSxXQUFLQyxJQUFMO0FBQ0Q7Ozs2QkFFUUMsQyxFQUFHO0FBQ1YsVUFBTUMsT0FBT0QsRUFBRUUsTUFBZjtBQUNBLFVBQU1DLEtBQUtGLEtBQUtHLFlBQUwsQ0FBa0IsU0FBbEIsQ0FBWDtBQUNBLFVBQU1DLFVBQVUsS0FBS3JCLE9BQUwsQ0FBYW1CLEVBQWIsQ0FBaEI7O0FBRUEsdUJBQU9HLHlCQUFQLENBQWlDRCxXQUFXLEVBQTVDO0FBQ0EsdUJBQU9FLFFBQVAsR0FBa0JKLEVBQWxCO0FBQ0EsV0FBS0ssS0FBTDtBQUNEOzs7OztBQUdILHlCQUFlQyxRQUFmLENBQXdCOUIsVUFBeEIsRUFBb0NFLFFBQXBDOztrQkFFZUEsUSIsImZpbGUiOiJMYW5ndWFnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjbGllbnQgZnJvbSAnLi4vY29yZS9jbGllbnQnO1xuaW1wb3J0IFNlcnZpY2UgZnJvbSAnLi4vY29yZS9TZXJ2aWNlJztcbmltcG9ydCBzZXJ2aWNlTWFuYWdlciBmcm9tICcuLi9jb3JlL3NlcnZpY2VNYW5hZ2VyJztcbmltcG9ydCBTZWdtZW50ZWRWaWV3IGZyb20gJy4uL3ZpZXdzL1NlZ21lbnRlZFZpZXcnO1xuXG5jb25zdCBTRVJWSUNFX0lEID0gJ3NlcnZpY2U6bGFuZ3VhZ2UnO1xuXG5jb25zdCBkZWZhdWx0Vmlld1RlbXBsYXRlID0gYFxuIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcFwiPjwvZGl2PlxuIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlclwiPlxuICAgPCUgT2JqZWN0LmtleXMob3B0aW9ucykuZm9yRWFjaChmdW5jdGlvbihrZXksaW5kZXgpIHsgJT5cbiAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0blwiIGRhdGEtaWQ9XCI8JT0ga2V5ICU+XCI+PCU9IG9wdGlvbnNba2V5XSAlPjwvYnV0dG9uPlxuICAgPCUgfSk7ICU+XG4gPC9kaXY+XG4gPGRpdiBjbGFzcz1cInNlY3Rpb24tYm90dG9tXCI+PC9kaXY+XG5gO1xuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIHZpZXcgb2YgdGhlIGBsYW5ndWFnZWAgc2VydmljZS5cbiAqXG4gKiBBbGxvdyB0byBzZWxlY3QgdGhlIGV4cGVyaWVuY2UgbGFuZ3VhZ2UgYXQgc3RhcnR1cC4gU2VsZWN0ZWQgbGFuZ3VhZ2UgdGFnIHdpbGwgXG4gKiB0aGVuIGJlIGF2YWlsYWJsZSBpbiBjbGllbnQubGFuZ3VhZ2UuXG4gKlxuICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudFxuICpcbiAqIEBleGFtcGxlXG4gKiAvLyBpbnNpZGUgdGhlIGV4cGVyaWVuY2UgY29uc3RydWN0b3JcbiAqIHRoaXMubGFuZ3VhZ2UgPSB0aGlzLnJlcXVpcmUoJ2xhbmd1YWdlJywge29wdGlvbnM6IHtlbjogJ0VuZ2xpc2gnLCBmcjonRnJhbsOnYWlzJ30gfSlcbiAqIGNvbnNvbGUubG9nKGNsaWVudC5sYW5ndWFnZSk7XG4gKi9cblxuY2xhc3MgTGFuZ3VhZ2UgZXh0ZW5kcyBTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoU0VSVklDRV9JRCwgZmFsc2UpO1xuXG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgICAvLyB2aWV3Q3RvcjogU2VnbWVudGVkVmlldywgLy8gQGZpeG1lXG4gICAgICB2aWV3UHJpb3JpdHk6IDksXG4gICAgICBvcHRpb25zOiB7fSxcbiAgICAgIGNvbnRlbnRzOiB7fSxcbiAgICB9XG5cbiAgICB0aGlzLmNvbmZpZ3VyZShkZWZhdWx0cyk7XG5cbiAgICB0aGlzLl9kZWZhdWx0Vmlld1RlbXBsYXRlID0gZGVmYXVsdFZpZXdUZW1wbGF0ZTtcblxuICAgIHRoaXMuX29uQ2xpY2sgPSB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgaW5pdCgpIHtcbiAgICB0aGlzLnZpZXdDb250ZW50ID0geyBvcHRpb25zOiB0aGlzLm9wdGlvbnMub3B0aW9ucyB9O1xuICAgIHRoaXMudmlld0N0b3IgPSBTZWdtZW50ZWRWaWV3O1xuICAgIHRoaXMudmlld1RlbXBsYXRlID0gdGhpcy5fZGVmYXVsdFZpZXdUZW1wbGF0ZTtcbiAgICB0aGlzLnZpZXdFdmVudHMgPSB7XG4gICAgICAnY2xpY2sgLmJ0bic6IHRoaXMuX29uQ2xpY2ssXG4gICAgfVxuXG4gICAgdGhpcy52aWV3ID0gdGhpcy5jcmVhdGVWaWV3KCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTtcblxuICAgIGlmICghdGhpcy5faGFzU3RhcnRlZClcbiAgICAgIHRoaXMuaW5pdCgpO1xuXG5cbiAgICB0aGlzLnNob3coKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBzdG9wKCkge1xuICAgIHN1cGVyLnN0b3AoKTtcbiAgICAvLyB0aGlzLnJlbW92ZUxpc3RlbmVyKCdhY2tub3dsZWRnZScsIHRoaXMuX29uQWtub3dsZWRnZVJlc3BvbnNlKTtcblxuICAgIHRoaXMuaGlkZSgpO1xuICB9XG5cbiAgX29uQ2xpY2soZSkge1xuICAgIGNvbnN0ICRidG4gPSBlLnRhcmdldDtcbiAgICBjb25zdCBpZCA9ICRidG4uZ2V0QXR0cmlidXRlKCdkYXRhLWlkJyk7XG4gICAgY29uc3QgY29udGVudCA9IHRoaXMub3B0aW9uc1tpZF07XG5cbiAgICBjbGllbnQuc2V0Vmlld0NvbnRlbnREZWZpbml0aW9ucyhjb250ZW50IHx8IHt9KTtcbiAgICBjbGllbnQubGFuZ3VhZ2UgPSBpZDtcbiAgICB0aGlzLnJlYWR5KCk7XG4gIH1cbn1cblxuc2VydmljZU1hbmFnZXIucmVnaXN0ZXIoU0VSVklDRV9JRCwgTGFuZ3VhZ2UpO1xuXG5leHBvcnQgZGVmYXVsdCBMYW5ndWFnZTsiXX0=