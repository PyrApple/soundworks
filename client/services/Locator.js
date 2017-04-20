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

var _SpaceView = require('../views/SpaceView');

var _SpaceView2 = _interopRequireDefault(_SpaceView);

var _SquaredView2 = require('../views/SquaredView');

var _SquaredView3 = _interopRequireDefault(_SquaredView2);

var _TouchSurface = require('../views/TouchSurface');

var _TouchSurface2 = _interopRequireDefault(_TouchSurface);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SERVICE_ID = 'service:locator';

var defaultViewTemplate = '\n<div class="section-square"></div>\n<div class="section-float flex-middle">\n  <% if (!showBtn) { %>\n    <p class="small"><%= instructions %></p>\n  <% } else { %>\n    <button class="btn"><%= send %></button>\n  <% } %>\n</div>';

var defaultViewContent = {
  instructions: 'Define your position in the area',
  send: 'Send',
  showBtn: false
};

/**
 * Interface for the view of the `locator` service.
 *
 * @interface AbstractLocatorView
 * @extends module:soundworks/client.View
 */
/**
 * Register the `area` definition to the view.
 *
 * @function
 * @name AbstractLocatorView.setArea
 * @param {Object} area - Definition of the area.
 * @property {Number} area.width - With of the area.
 * @property {Number} area.height - Height of the area.
 * @property {Number} [area.labels=[]] - Labels of the position.
 * @property {Number} [area.coordinates=[]] - Coordinates of the area.
 */
/**
 * Register the callback to be applied when the user select a position.
 *
 * @function
 * @name AbstractLocatorView.onSelect
 * @param {Function} callback - Callback to be applied when a position is selected.
 *  This callback should be called with the `index`, `label` and `coordinates` of
 *  the requested position.
 */

var LocatorView = function (_SquaredView) {
  (0, _inherits3.default)(LocatorView, _SquaredView);

  function LocatorView(template, content, events, options) {
    (0, _classCallCheck3.default)(this, LocatorView);

    var _this = (0, _possibleConstructorReturn3.default)(this, (LocatorView.__proto__ || (0, _getPrototypeOf2.default)(LocatorView)).call(this, template, content, events, options));

    _this.area = null;

    _this._onAreaTouchStart = _this._onAreaTouchStart.bind(_this);
    _this._onAreaTouchMove = _this._onAreaTouchMove.bind(_this);
    return _this;
  }

  /**
   * Sets the `area` definition.
   * @param {Object} area - Object containing the area definition.
   */


  (0, _createClass3.default)(LocatorView, [{
    key: 'setArea',
    value: function setArea(area) {
      this._area = area;
      this._renderArea();
    }

    /**
     * Register the function to be called when the location is choosen.
     * @param {Function} callback
     */

  }, {
    key: 'onSelect',
    value: function onSelect(callback) {
      this._onSelect = callback;
    }
  }, {
    key: 'remove',
    value: function remove() {
      (0, _get3.default)(LocatorView.prototype.__proto__ || (0, _getPrototypeOf2.default)(LocatorView.prototype), 'remove', this).call(this);

      this.surface.removeListener('touchstart', this._onAreaTouchStart);
      this.surface.removeListener('touchmove', this._onAreaTouchMove);
    }
  }, {
    key: '_renderArea',
    value: function _renderArea() {
      this.selector = new _SpaceView2.default();
      this.selector.setArea(this._area);
      this.setViewComponent('.section-square', this.selector);
      this.render('.section-square');

      this.surface = new _TouchSurface2.default(this.selector.$svgContainer);
      this.surface.addListener('touchstart', this._onAreaTouchStart);
      this.surface.addListener('touchmove', this._onAreaTouchMove);
    }

    /**
     * Callback of the `touchstart` event.
     */

  }, {
    key: '_onAreaTouchStart',
    value: function _onAreaTouchStart(id, normX, normY) {
      var _this2 = this;

      if (!this.position) {
        this._createPosition(normX, normY);

        this.content.showBtn = true;
        this.render('.section-float');
        this.installEvents({
          'click .btn': function clickBtn(e) {
            return _this2._onSelect(_this2.position.x, _this2.position.y);
          }
        });
      } else {
        this._updatePosition(normX, normY);
      }
    }

    /**
     * Callback of the `touchmove` event.
     */

  }, {
    key: '_onAreaTouchMove',
    value: function _onAreaTouchMove(id, normX, normY) {
      this._updatePosition(normX, normY);
    }

    /**
     * Creates the position object according to normalized coordinates.
     * @param {Number} normX - The normalized coordinate in the x axis.
     * @param {Number} normY - The normalized coordinate in the y axis.
     */

  }, {
    key: '_createPosition',
    value: function _createPosition(normX, normY) {
      this.position = {
        id: 'locator',
        x: normX * this._area.width,
        y: normY * this._area.height
      };

      this.selector.addPoint(this.position);
    }

    /**
     * Updates the position object according to normalized coordinates.
     * @param {Number} normX - The normalized coordinate in the x axis.
     * @param {Number} normY - The normalized coordinate in the y axis.
     */

  }, {
    key: '_updatePosition',
    value: function _updatePosition(normX, normY) {
      this.position.x = normX * this._area.width;
      this.position.y = normY * this._area.height;

      this.selector.updatePoint(this.position);
    }
  }]);
  return LocatorView;
}(_SquaredView3.default);

/**
 * Interface for the client `'locator'` service.
 *
 * This service is one of the provided services aimed at identifying clients inside
 * the experience along with the [`'placer'`]{@link module:soundworks/client.Placer}
 * and [`'checkin'`]{@link module:soundworks/client.Checkin} services.
 *
 * The `'locator'` service allows a client to give its approximate location inside
 * a graphical representation of the `area` as defined in the server's `setup`
 * configuration member.
 *
 * __*The service must be used with its [server-side counterpart]{@link module:soundworks/server.Locator}*__
 *
 * @see {@link module:soundworks/client.Placer}
 * @see {@link module:soundworks/client.Checkin}
 *
 * @param {Object} options
 * @param {Boolean} [options.random=false] - Defines whether the location is
 *  set randomly (mainly for development purposes).
 *
 * @memberof module:soundworks/client
 * @example
 * // inside the experience constructor
 * this.locator = this.require('locator');
 */


var Locator = function (_Service) {
  (0, _inherits3.default)(Locator, _Service);

  /** _<span class="warning">__WARNING__</span> This class should never be instanciated manually_ */
  function Locator() {
    (0, _classCallCheck3.default)(this, Locator);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (Locator.__proto__ || (0, _getPrototypeOf2.default)(Locator)).call(this, SERVICE_ID, true));

    var defaults = {
      random: false,
      viewCtor: LocatorView,
      viewPriority: 6
    };

    _this3.configure(defaults);

    _this3._defaultViewTemplate = defaultViewTemplate;
    _this3._defaultViewContent = defaultViewContent;

    _this3._sharedConfig = _this3.require('shared-config');

    _this3._onAknowledgeResponse = _this3._onAknowledgeResponse.bind(_this3);
    _this3._sendCoordinates = _this3._sendCoordinates.bind(_this3);
    return _this3;
  }

  /** @private */


  (0, _createClass3.default)(Locator, [{
    key: 'init',
    value: function init() {
      this.viewCtor = this.options.viewCtor;
      this.view = this.createView();
    }

    /** @private */

  }, {
    key: 'start',
    value: function start() {
      (0, _get3.default)(Locator.prototype.__proto__ || (0, _getPrototypeOf2.default)(Locator.prototype), 'start', this).call(this);

      if (!this.hasStarted) this.init();

      this.show();

      this.send('request');
      this.receive('acknowledge', this._onAknowledgeResponse);
    }

    /** @private */

  }, {
    key: 'stop',
    value: function stop() {
      (0, _get3.default)(Locator.prototype.__proto__ || (0, _getPrototypeOf2.default)(Locator.prototype), 'stop', this).call(this);
      this.removeListener('acknowledge', this._onAknowledgeResponse);

      this.hide();
    }

    /**
     * @private
     * @param {Object} areaConfigPath - Path to the area in the configuration.
     */

  }, {
    key: '_onAknowledgeResponse',
    value: function _onAknowledgeResponse(areaConfigPath) {
      var area = this._sharedConfig.get(areaConfigPath);
      this.view.setArea(area);
      this.view.onSelect(this._sendCoordinates);

      if (this.options.random) {
        var x = Math.random() * area.width;
        var y = Math.random() * area.height;
        this._sendCoordinates(x, y);
      }
    }

    /**
     * Send coordinates to the server.
     * @private
     * @param {Number} x - The `x` coordinate of the client.
     * @param {Number} y - The `y` coordinate of the client.
     */

  }, {
    key: '_sendCoordinates',
    value: function _sendCoordinates(x, y) {
      _client2.default.coordinates = [x, y];

      this.send('coordinates', _client2.default.coordinates);
      this.ready();
    }
  }]);
  return Locator;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, Locator);

exports.default = Locator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxvY2F0b3IuanMiXSwibmFtZXMiOlsiU0VSVklDRV9JRCIsImRlZmF1bHRWaWV3VGVtcGxhdGUiLCJkZWZhdWx0Vmlld0NvbnRlbnQiLCJpbnN0cnVjdGlvbnMiLCJzZW5kIiwic2hvd0J0biIsIkxvY2F0b3JWaWV3IiwidGVtcGxhdGUiLCJjb250ZW50IiwiZXZlbnRzIiwib3B0aW9ucyIsImFyZWEiLCJfb25BcmVhVG91Y2hTdGFydCIsImJpbmQiLCJfb25BcmVhVG91Y2hNb3ZlIiwiX2FyZWEiLCJfcmVuZGVyQXJlYSIsImNhbGxiYWNrIiwiX29uU2VsZWN0Iiwic3VyZmFjZSIsInJlbW92ZUxpc3RlbmVyIiwic2VsZWN0b3IiLCJzZXRBcmVhIiwic2V0Vmlld0NvbXBvbmVudCIsInJlbmRlciIsIiRzdmdDb250YWluZXIiLCJhZGRMaXN0ZW5lciIsImlkIiwibm9ybVgiLCJub3JtWSIsInBvc2l0aW9uIiwiX2NyZWF0ZVBvc2l0aW9uIiwiaW5zdGFsbEV2ZW50cyIsImUiLCJ4IiwieSIsIl91cGRhdGVQb3NpdGlvbiIsIndpZHRoIiwiaGVpZ2h0IiwiYWRkUG9pbnQiLCJ1cGRhdGVQb2ludCIsIkxvY2F0b3IiLCJkZWZhdWx0cyIsInJhbmRvbSIsInZpZXdDdG9yIiwidmlld1ByaW9yaXR5IiwiY29uZmlndXJlIiwiX2RlZmF1bHRWaWV3VGVtcGxhdGUiLCJfZGVmYXVsdFZpZXdDb250ZW50IiwiX3NoYXJlZENvbmZpZyIsInJlcXVpcmUiLCJfb25Ba25vd2xlZGdlUmVzcG9uc2UiLCJfc2VuZENvb3JkaW5hdGVzIiwidmlldyIsImNyZWF0ZVZpZXciLCJoYXNTdGFydGVkIiwiaW5pdCIsInNob3ciLCJyZWNlaXZlIiwiaGlkZSIsImFyZWFDb25maWdQYXRoIiwiZ2V0Iiwib25TZWxlY3QiLCJNYXRoIiwiY29vcmRpbmF0ZXMiLCJyZWFkeSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7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QWIsRUFBNEIsS0FBS1AscUJBQWpDO0FBQ0Q7O0FBRUQ7Ozs7MkJBQ087QUFDTDtBQUNBLFdBQUsvQixjQUFMLENBQW9CLGFBQXBCLEVBQW1DLEtBQUsrQixxQkFBeEM7O0FBRUEsV0FBS1EsSUFBTDtBQUNEOztBQUVEOzs7Ozs7OzBDQUlzQkMsYyxFQUFnQjtBQUNwQyxVQUFNakQsT0FBTyxLQUFLc0MsYUFBTCxDQUFtQlksR0FBbkIsQ0FBdUJELGNBQXZCLENBQWI7QUFDQSxXQUFLUCxJQUFMLENBQVUvQixPQUFWLENBQWtCWCxJQUFsQjtBQUNBLFdBQUswQyxJQUFMLENBQVVTLFFBQVYsQ0FBbUIsS0FBS1YsZ0JBQXhCOztBQUVBLFVBQUksS0FBSzFDLE9BQUwsQ0FBYWlDLE1BQWpCLEVBQXlCO0FBQ3ZCLFlBQU1ULElBQUk2QixLQUFLcEIsTUFBTCxLQUFnQmhDLEtBQUswQixLQUEvQjtBQUNBLFlBQU1GLElBQUk0QixLQUFLcEIsTUFBTCxLQUFnQmhDLEtBQUsyQixNQUEvQjtBQUNBLGFBQUtjLGdCQUFMLENBQXNCbEIsQ0FBdEIsRUFBeUJDLENBQXpCO0FBQ0Q7QUFDRjs7QUFFRDs7Ozs7Ozs7O3FDQU1pQkQsQyxFQUFHQyxDLEVBQUc7QUFDckIsdUJBQU82QixXQUFQLEdBQXFCLENBQUM5QixDQUFELEVBQUlDLENBQUosQ0FBckI7O0FBRUEsV0FBSy9CLElBQUwsQ0FBVSxhQUFWLEVBQXlCLGlCQUFPNEQsV0FBaEM7QUFDQSxXQUFLQyxLQUFMO0FBQ0Q7Ozs7O0FBR0gseUJBQWVDLFFBQWYsQ0FBd0JsRSxVQUF4QixFQUFvQ3lDLE9BQXBDOztrQkFFZUEsTyIsImZpbGUiOiJMb2NhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNsaWVudCBmcm9tICcuLi9jb3JlL2NsaWVudCc7XG5pbXBvcnQgU2VydmljZSBmcm9tICcuLi9jb3JlL1NlcnZpY2UnO1xuaW1wb3J0IHNlcnZpY2VNYW5hZ2VyIGZyb20gJy4uL2NvcmUvc2VydmljZU1hbmFnZXInO1xuaW1wb3J0IFNwYWNlVmlldyBmcm9tICcuLi92aWV3cy9TcGFjZVZpZXcnO1xuaW1wb3J0IFNxdWFyZWRWaWV3IGZyb20gJy4uL3ZpZXdzL1NxdWFyZWRWaWV3JztcbmltcG9ydCBUb3VjaFN1cmZhY2UgZnJvbSAnLi4vdmlld3MvVG91Y2hTdXJmYWNlJztcblxuXG5jb25zdCBTRVJWSUNFX0lEID0gJ3NlcnZpY2U6bG9jYXRvcic7XG5cbmNvbnN0IGRlZmF1bHRWaWV3VGVtcGxhdGUgPSBgXG48ZGl2IGNsYXNzPVwic2VjdGlvbi1zcXVhcmVcIj48L2Rpdj5cbjxkaXYgY2xhc3M9XCJzZWN0aW9uLWZsb2F0IGZsZXgtbWlkZGxlXCI+XG4gIDwlIGlmICghc2hvd0J0bikgeyAlPlxuICAgIDxwIGNsYXNzPVwic21hbGxcIj48JT0gaW5zdHJ1Y3Rpb25zICU+PC9wPlxuICA8JSB9IGVsc2UgeyAlPlxuICAgIDxidXR0b24gY2xhc3M9XCJidG5cIj48JT0gc2VuZCAlPjwvYnV0dG9uPlxuICA8JSB9ICU+XG48L2Rpdj5gO1xuXG5jb25zdCBkZWZhdWx0Vmlld0NvbnRlbnQgPSB7XG4gIGluc3RydWN0aW9uczogJ0RlZmluZSB5b3VyIHBvc2l0aW9uIGluIHRoZSBhcmVhJyxcbiAgc2VuZDogJ1NlbmQnLFxuICBzaG93QnRuOiBmYWxzZSxcbn07XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUgdmlldyBvZiB0aGUgYGxvY2F0b3JgIHNlcnZpY2UuXG4gKlxuICogQGludGVyZmFjZSBBYnN0cmFjdExvY2F0b3JWaWV3XG4gKiBAZXh0ZW5kcyBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuVmlld1xuICovXG4vKipcbiAqIFJlZ2lzdGVyIHRoZSBgYXJlYWAgZGVmaW5pdGlvbiB0byB0aGUgdmlldy5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIEFic3RyYWN0TG9jYXRvclZpZXcuc2V0QXJlYVxuICogQHBhcmFtIHtPYmplY3R9IGFyZWEgLSBEZWZpbml0aW9uIG9mIHRoZSBhcmVhLlxuICogQHByb3BlcnR5IHtOdW1iZXJ9IGFyZWEud2lkdGggLSBXaXRoIG9mIHRoZSBhcmVhLlxuICogQHByb3BlcnR5IHtOdW1iZXJ9IGFyZWEuaGVpZ2h0IC0gSGVpZ2h0IG9mIHRoZSBhcmVhLlxuICogQHByb3BlcnR5IHtOdW1iZXJ9IFthcmVhLmxhYmVscz1bXV0gLSBMYWJlbHMgb2YgdGhlIHBvc2l0aW9uLlxuICogQHByb3BlcnR5IHtOdW1iZXJ9IFthcmVhLmNvb3JkaW5hdGVzPVtdXSAtIENvb3JkaW5hdGVzIG9mIHRoZSBhcmVhLlxuICovXG4vKipcbiAqIFJlZ2lzdGVyIHRoZSBjYWxsYmFjayB0byBiZSBhcHBsaWVkIHdoZW4gdGhlIHVzZXIgc2VsZWN0IGEgcG9zaXRpb24uXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBBYnN0cmFjdExvY2F0b3JWaWV3Lm9uU2VsZWN0XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIENhbGxiYWNrIHRvIGJlIGFwcGxpZWQgd2hlbiBhIHBvc2l0aW9uIGlzIHNlbGVjdGVkLlxuICogIFRoaXMgY2FsbGJhY2sgc2hvdWxkIGJlIGNhbGxlZCB3aXRoIHRoZSBgaW5kZXhgLCBgbGFiZWxgIGFuZCBgY29vcmRpbmF0ZXNgIG9mXG4gKiAgdGhlIHJlcXVlc3RlZCBwb3NpdGlvbi5cbiAqL1xuY2xhc3MgTG9jYXRvclZpZXcgZXh0ZW5kcyBTcXVhcmVkVmlldyB7XG4gIGNvbnN0cnVjdG9yKHRlbXBsYXRlLCBjb250ZW50LCBldmVudHMsIG9wdGlvbnMpIHtcbiAgICBzdXBlcih0ZW1wbGF0ZSwgY29udGVudCwgZXZlbnRzLCBvcHRpb25zKTtcblxuICAgIHRoaXMuYXJlYSA9IG51bGw7XG5cbiAgICB0aGlzLl9vbkFyZWFUb3VjaFN0YXJ0ID0gdGhpcy5fb25BcmVhVG91Y2hTdGFydC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uQXJlYVRvdWNoTW92ZSA9IHRoaXMuX29uQXJlYVRvdWNoTW92ZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGBhcmVhYCBkZWZpbml0aW9uLlxuICAgKiBAcGFyYW0ge09iamVjdH0gYXJlYSAtIE9iamVjdCBjb250YWluaW5nIHRoZSBhcmVhIGRlZmluaXRpb24uXG4gICAqL1xuICBzZXRBcmVhKGFyZWEpIHtcbiAgICB0aGlzLl9hcmVhID0gYXJlYTtcbiAgICB0aGlzLl9yZW5kZXJBcmVhKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgdGhlIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBsb2NhdGlvbiBpcyBjaG9vc2VuLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgKi9cbiAgb25TZWxlY3QoY2FsbGJhY2spIHtcbiAgICB0aGlzLl9vblNlbGVjdCA9IGNhbGxiYWNrO1xuICB9XG5cbiAgcmVtb3ZlKCkge1xuICAgIHN1cGVyLnJlbW92ZSgpO1xuXG4gICAgdGhpcy5zdXJmYWNlLnJlbW92ZUxpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fb25BcmVhVG91Y2hTdGFydCk7XG4gICAgdGhpcy5zdXJmYWNlLnJlbW92ZUxpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9vbkFyZWFUb3VjaE1vdmUpO1xuICB9XG5cbiAgX3JlbmRlckFyZWEoKSB7XG4gICAgdGhpcy5zZWxlY3RvciA9IG5ldyBTcGFjZVZpZXcoKTtcbiAgICB0aGlzLnNlbGVjdG9yLnNldEFyZWEodGhpcy5fYXJlYSk7XG4gICAgdGhpcy5zZXRWaWV3Q29tcG9uZW50KCcuc2VjdGlvbi1zcXVhcmUnLCB0aGlzLnNlbGVjdG9yKTtcbiAgICB0aGlzLnJlbmRlcignLnNlY3Rpb24tc3F1YXJlJyk7XG5cbiAgICB0aGlzLnN1cmZhY2UgPSBuZXcgVG91Y2hTdXJmYWNlKHRoaXMuc2VsZWN0b3IuJHN2Z0NvbnRhaW5lcik7XG4gICAgdGhpcy5zdXJmYWNlLmFkZExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fb25BcmVhVG91Y2hTdGFydCk7XG4gICAgdGhpcy5zdXJmYWNlLmFkZExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9vbkFyZWFUb3VjaE1vdmUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIG9mIHRoZSBgdG91Y2hzdGFydGAgZXZlbnQuXG4gICAqL1xuICBfb25BcmVhVG91Y2hTdGFydChpZCwgbm9ybVgsIG5vcm1ZKSB7XG4gICAgaWYgKCF0aGlzLnBvc2l0aW9uKSB7XG4gICAgICB0aGlzLl9jcmVhdGVQb3NpdGlvbihub3JtWCwgbm9ybVkpO1xuXG4gICAgICB0aGlzLmNvbnRlbnQuc2hvd0J0biA9IHRydWU7XG4gICAgICB0aGlzLnJlbmRlcignLnNlY3Rpb24tZmxvYXQnKTtcbiAgICAgIHRoaXMuaW5zdGFsbEV2ZW50cyh7XG4gICAgICAgICdjbGljayAuYnRuJzogKGUpID0+IHRoaXMuX29uU2VsZWN0KHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl91cGRhdGVQb3NpdGlvbihub3JtWCwgbm9ybVkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBvZiB0aGUgYHRvdWNobW92ZWAgZXZlbnQuXG4gICAqL1xuICBfb25BcmVhVG91Y2hNb3ZlKGlkLCBub3JtWCwgbm9ybVkpIHtcbiAgICB0aGlzLl91cGRhdGVQb3NpdGlvbihub3JtWCwgbm9ybVkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGhlIHBvc2l0aW9uIG9iamVjdCBhY2NvcmRpbmcgdG8gbm9ybWFsaXplZCBjb29yZGluYXRlcy5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG5vcm1YIC0gVGhlIG5vcm1hbGl6ZWQgY29vcmRpbmF0ZSBpbiB0aGUgeCBheGlzLlxuICAgKiBAcGFyYW0ge051bWJlcn0gbm9ybVkgLSBUaGUgbm9ybWFsaXplZCBjb29yZGluYXRlIGluIHRoZSB5IGF4aXMuXG4gICAqL1xuICBfY3JlYXRlUG9zaXRpb24obm9ybVgsIG5vcm1ZKSB7XG4gICAgdGhpcy5wb3NpdGlvbiA9IHtcbiAgICAgIGlkOiAnbG9jYXRvcicsXG4gICAgICB4OiBub3JtWCAqIHRoaXMuX2FyZWEud2lkdGgsXG4gICAgICB5OiBub3JtWSAqIHRoaXMuX2FyZWEuaGVpZ2h0LFxuICAgIH07XG5cbiAgICB0aGlzLnNlbGVjdG9yLmFkZFBvaW50KHRoaXMucG9zaXRpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHBvc2l0aW9uIG9iamVjdCBhY2NvcmRpbmcgdG8gbm9ybWFsaXplZCBjb29yZGluYXRlcy5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG5vcm1YIC0gVGhlIG5vcm1hbGl6ZWQgY29vcmRpbmF0ZSBpbiB0aGUgeCBheGlzLlxuICAgKiBAcGFyYW0ge051bWJlcn0gbm9ybVkgLSBUaGUgbm9ybWFsaXplZCBjb29yZGluYXRlIGluIHRoZSB5IGF4aXMuXG4gICAqL1xuICBfdXBkYXRlUG9zaXRpb24obm9ybVgsIG5vcm1ZKSB7XG4gICAgdGhpcy5wb3NpdGlvbi54ID0gbm9ybVggKiB0aGlzLl9hcmVhLndpZHRoO1xuICAgIHRoaXMucG9zaXRpb24ueSA9IG5vcm1ZICogdGhpcy5fYXJlYS5oZWlnaHQ7XG5cbiAgICB0aGlzLnNlbGVjdG9yLnVwZGF0ZVBvaW50KHRoaXMucG9zaXRpb24pO1xuICB9XG59XG5cblxuLyoqXG4gKiBJbnRlcmZhY2UgZm9yIHRoZSBjbGllbnQgYCdsb2NhdG9yJ2Agc2VydmljZS5cbiAqXG4gKiBUaGlzIHNlcnZpY2UgaXMgb25lIG9mIHRoZSBwcm92aWRlZCBzZXJ2aWNlcyBhaW1lZCBhdCBpZGVudGlmeWluZyBjbGllbnRzIGluc2lkZVxuICogdGhlIGV4cGVyaWVuY2UgYWxvbmcgd2l0aCB0aGUgW2AncGxhY2VyJ2Bde0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5QbGFjZXJ9XG4gKiBhbmQgW2AnY2hlY2tpbidgXXtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuQ2hlY2tpbn0gc2VydmljZXMuXG4gKlxuICogVGhlIGAnbG9jYXRvcidgIHNlcnZpY2UgYWxsb3dzIGEgY2xpZW50IHRvIGdpdmUgaXRzIGFwcHJveGltYXRlIGxvY2F0aW9uIGluc2lkZVxuICogYSBncmFwaGljYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGBhcmVhYCBhcyBkZWZpbmVkIGluIHRoZSBzZXJ2ZXIncyBgc2V0dXBgXG4gKiBjb25maWd1cmF0aW9uIG1lbWJlci5cbiAqXG4gKiBfXypUaGUgc2VydmljZSBtdXN0IGJlIHVzZWQgd2l0aCBpdHMgW3NlcnZlci1zaWRlIGNvdW50ZXJwYXJ0XXtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9zZXJ2ZXIuTG9jYXRvcn0qX19cbiAqXG4gKiBAc2VlIHtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuUGxhY2VyfVxuICogQHNlZSB7QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LkNoZWNraW59XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMucmFuZG9tPWZhbHNlXSAtIERlZmluZXMgd2hldGhlciB0aGUgbG9jYXRpb24gaXNcbiAqICBzZXQgcmFuZG9tbHkgKG1haW5seSBmb3IgZGV2ZWxvcG1lbnQgcHVycG9zZXMpLlxuICpcbiAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnRcbiAqIEBleGFtcGxlXG4gKiAvLyBpbnNpZGUgdGhlIGV4cGVyaWVuY2UgY29uc3RydWN0b3JcbiAqIHRoaXMubG9jYXRvciA9IHRoaXMucmVxdWlyZSgnbG9jYXRvcicpO1xuICovXG5jbGFzcyBMb2NhdG9yIGV4dGVuZHMgU2VydmljZSB7XG4gIC8qKiBfPHNwYW4gY2xhc3M9XCJ3YXJuaW5nXCI+X19XQVJOSU5HX188L3NwYW4+IFRoaXMgY2xhc3Mgc2hvdWxkIG5ldmVyIGJlIGluc3RhbmNpYXRlZCBtYW51YWxseV8gKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoU0VSVklDRV9JRCwgdHJ1ZSk7XG5cbiAgICBjb25zdCBkZWZhdWx0cyA9IHtcbiAgICAgIHJhbmRvbTogZmFsc2UsXG4gICAgICB2aWV3Q3RvcjogTG9jYXRvclZpZXcsXG4gICAgICB2aWV3UHJpb3JpdHk6IDYsXG4gICAgfTtcblxuICAgIHRoaXMuY29uZmlndXJlKGRlZmF1bHRzKTtcblxuICAgIHRoaXMuX2RlZmF1bHRWaWV3VGVtcGxhdGUgPSBkZWZhdWx0Vmlld1RlbXBsYXRlO1xuICAgIHRoaXMuX2RlZmF1bHRWaWV3Q29udGVudCA9IGRlZmF1bHRWaWV3Q29udGVudDtcblxuICAgIHRoaXMuX3NoYXJlZENvbmZpZyA9IHRoaXMucmVxdWlyZSgnc2hhcmVkLWNvbmZpZycpO1xuXG4gICAgdGhpcy5fb25Ba25vd2xlZGdlUmVzcG9uc2UgPSB0aGlzLl9vbkFrbm93bGVkZ2VSZXNwb25zZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3NlbmRDb29yZGluYXRlcyA9IHRoaXMuX3NlbmRDb29yZGluYXRlcy5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGluaXQoKSB7XG4gICAgdGhpcy52aWV3Q3RvciA9IHRoaXMub3B0aW9ucy52aWV3Q3RvcjtcbiAgICB0aGlzLnZpZXcgPSB0aGlzLmNyZWF0ZVZpZXcoKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuXG4gICAgaWYgKCF0aGlzLmhhc1N0YXJ0ZWQpXG4gICAgICB0aGlzLmluaXQoKTtcblxuICAgIHRoaXMuc2hvdygpO1xuXG4gICAgdGhpcy5zZW5kKCdyZXF1ZXN0Jyk7XG4gICAgdGhpcy5yZWNlaXZlKCdhY2tub3dsZWRnZScsIHRoaXMuX29uQWtub3dsZWRnZVJlc3BvbnNlKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBzdG9wKCkge1xuICAgIHN1cGVyLnN0b3AoKTtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKCdhY2tub3dsZWRnZScsIHRoaXMuX29uQWtub3dsZWRnZVJlc3BvbnNlKTtcblxuICAgIHRoaXMuaGlkZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhcmVhQ29uZmlnUGF0aCAtIFBhdGggdG8gdGhlIGFyZWEgaW4gdGhlIGNvbmZpZ3VyYXRpb24uXG4gICAqL1xuICBfb25Ba25vd2xlZGdlUmVzcG9uc2UoYXJlYUNvbmZpZ1BhdGgpIHtcbiAgICBjb25zdCBhcmVhID0gdGhpcy5fc2hhcmVkQ29uZmlnLmdldChhcmVhQ29uZmlnUGF0aCk7XG4gICAgdGhpcy52aWV3LnNldEFyZWEoYXJlYSk7XG4gICAgdGhpcy52aWV3Lm9uU2VsZWN0KHRoaXMuX3NlbmRDb29yZGluYXRlcyk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnJhbmRvbSkge1xuICAgICAgY29uc3QgeCA9IE1hdGgucmFuZG9tKCkgKiBhcmVhLndpZHRoO1xuICAgICAgY29uc3QgeSA9IE1hdGgucmFuZG9tKCkgKiBhcmVhLmhlaWdodDtcbiAgICAgIHRoaXMuX3NlbmRDb29yZGluYXRlcyh4LCB5KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBjb29yZGluYXRlcyB0byB0aGUgc2VydmVyLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge051bWJlcn0geCAtIFRoZSBgeGAgY29vcmRpbmF0ZSBvZiB0aGUgY2xpZW50LlxuICAgKiBAcGFyYW0ge051bWJlcn0geSAtIFRoZSBgeWAgY29vcmRpbmF0ZSBvZiB0aGUgY2xpZW50LlxuICAgKi9cbiAgX3NlbmRDb29yZGluYXRlcyh4LCB5KSB7XG4gICAgY2xpZW50LmNvb3JkaW5hdGVzID0gW3gsIHldO1xuXG4gICAgdGhpcy5zZW5kKCdjb29yZGluYXRlcycsIGNsaWVudC5jb29yZGluYXRlcyk7XG4gICAgdGhpcy5yZWFkeSgpO1xuICB9XG59XG5cbnNlcnZpY2VNYW5hZ2VyLnJlZ2lzdGVyKFNFUlZJQ0VfSUQsIExvY2F0b3IpO1xuXG5leHBvcnQgZGVmYXVsdCBMb2NhdG9yO1xuIl19