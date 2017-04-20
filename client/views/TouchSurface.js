'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Helper to handle `touch` events on a given element. Decompose a multitouch
 * event in several parallel events, proapgate normalized values according to
 * the size of the container.
 *
 * @param {Element} $el - Element to listen for `touch` events.
 *
 * @memberof module:soundworks/client
 */
var TouchSurface = function () {
  function TouchSurface($el) {
    var _this = this;

    (0, _classCallCheck3.default)(this, TouchSurface);

    /**
     * Element to listen.
     *
     * @type {Element}
     * @name $el
     * @instance
     * @memberof  module:soundworks/client.TouchSurface
     */
    this.$el = $el;

    /**
     * Touch id, normalized position pairs for each current touches.
     *
     * @type {Number:<Array<Number>>}
     * @name touches
     * @instance
     * @memberof  module:soundworks/client.TouchSurface
     */
    this.touches = {};

    /**
     * Bounding rect of `this.$el`.
     *
     * @type {Object}
     * @name _elBoundingRect
     * @instance
     * @memberof  module:soundworks/client.TouchSurface
     * @private
     */
    this._elBoundingRect = null;

    /**
     * Registered callbacks.
     *
     * @type {Object}
     * @name _listeners
     * @instance
     * @memberof  module:soundworks/client.TouchSurface
     * @private
     */
    this._listeners = {};

    // cache bounding rect values and listen for window resize
    this._updateBoundingRect = this._updateBoundingRect.bind(this);
    window.addEventListener('resize', this._updateBoundingRect);
    this._updateBoundingRect();

    /** @private */
    this._handleTouchStart = this._handleTouch(function (id, x, y, t, e) {
      _this.touches[id] = [x, y];
      _this._propagate('touchstart', id, x, y, t, e);
    });

    /** @private */
    this._handleTouchMove = this._handleTouch(function (id, x, y, t, e) {
      _this.touches[id] = [x, y];
      _this._propagate('touchmove', id, x, y, t, e);
    });

    /** @private */
    this._handleTouchEnd = this._handleTouch(function (id, x, y, t, e) {
      delete _this.touches[id];
      _this._propagate('touchend', id, x, y, t, e);
    });

    this.$el.addEventListener('touchstart', this._handleTouchStart);
    this.$el.addEventListener('touchmove', this._handleTouchMove);
    this.$el.addEventListener('touchend', this._handleTouchEnd);
    this.$el.addEventListener('touchcancel', this._handleTouchEnd);
  }

  /**
   * Destroy the `TouchSurface`, remove all event listeners from `this.$el`
   * and delete all pointers.
   */


  (0, _createClass3.default)(TouchSurface, [{
    key: 'destroy',
    value: function destroy() {
      window.removeEventListener('resize', this._updateBoundingRect);
      this.$el.removeEventListener('touchstart', this._handleTouchStart);
      this.$el.removeEventListener('touchmove', this._handleTouchMove);
      this.$el.removeEventListener('touchend', this._handleTouchEnd);
      this.$el.removeEventListener('touchcancel', this._handleTouchEnd);
      // delete pointers
      this.$el = null;
      this.listeners = null;
    }

    /**
     * Update bounding rect of `this.$el`
     *
     * @private
     */

  }, {
    key: '_updateBoundingRect',
    value: function _updateBoundingRect() {
      this._elBoundingRect = this.$el.getBoundingClientRect();
    }

    /**
     * Generic moethod to handle a touch event.
     *
     * @private
     */

  }, {
    key: '_handleTouch',
    value: function _handleTouch(callback) {
      var _this2 = this;

      return function (e) {
        // if `_updateBoundingRect` has not been been called or
        // has been called when $el was in `display:none` state
        if (!_this2._elBoundingRect || _this2._elBoundingRect.width === 0 && _this2._elBoundingRect.height === 0) {
          _this2._updateBoundingRect();
        }

        var touches = e.changedTouches;
        var boundingRect = _this2._elBoundingRect;

        for (var i = 0; i < touches.length; i++) {
          var touchEvent = touches[i];
          var touchId = touchEvent.identifier;
          var relX = touchEvent.clientX - boundingRect.left;
          var relY = touchEvent.clientY - boundingRect.top;
          var normX = relX / boundingRect.width;
          var normY = relY / boundingRect.height;

          callback(touchId, normX, normY, touchEvent, e);
        }
      };
    }

    /**
     * Propagate the touch event and normalized values to the listeners.
     *
     * @param {String} eventName - Type of event.
     * @param {Number} touchId - Id of the touch event.
     * @param {Number} normX - Normalized position of the touch in the x axis
     *  according to the width of the element.
     * @param {Number} normY - Normalized position of the touch in the y axis
     *  according to the height of the element.
     * @param {Object} touchEvent - Original touch event (`e.changedTouches[n]`).
     * @param {Object} originalEvent - Original event.
     * @private
     */

  }, {
    key: '_propagate',
    value: function _propagate(eventName, touchId, normX, normY, touchEvent, originalEvent) {
      var listeners = this._listeners[eventName];
      if (!listeners) {
        return;
      }

      listeners.forEach(function (listener) {
        listener(touchId, normX, normY, touchEvent, originalEvent);
      });
    }

    /**
     * Callback for touch events
     *
     * @callback module:soundworks/client.TouchSurface~EventListener
     * @param {Number} touchId - Id of the touch.
     * @param {Number} normX - Normalized position in the x axis.
     * @param {Number} normY - Normalized position in the y axis.
     * @param {Touch} touchEvent - The original Touch event.
     * @param {Event} originalEvent - The original event.
     */

    /**
     * Register a listener. __note: `touchcancel` is merge with `touchend`.
     *
     * @param {String} eventName - Name of the event to listen (`touchstart`,
     *  `touchend` or `touchmove`)
     * @param {module:soundworks/client.TouchSurface~EventListener} callback
     */

  }, {
    key: 'addListener',
    value: function addListener(eventName, callback) {
      if (!this._listeners[eventName]) {
        this._listeners[eventName] = [];
      }

      this._listeners[eventName].push(callback);
    }

    /**
     * Remove a listener. __note: `touchcancel` is merge with `touchend`.
     *
     * @param {String} eventName - Name of the event to listen (`touchstart`,
     *  `touchend` or `touchmove`)
     * @param {module:soundworks/client.TouchSurface~EventListener} callback
     */

  }, {
    key: 'removeListener',
    value: function removeListener(eventName, callback) {
      var listeners = this._listeners[eventName];
      if (!listeners) {
        return;
      }

      var index = listeners.indexOf(callback);

      if (index !== -1) listeners.splice(index, 1);
    }
  }]);
  return TouchSurface;
}();

exports.default = TouchSurface;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRvdWNoU3VyZmFjZS5qcyJdLCJuYW1lcyI6WyJUb3VjaFN1cmZhY2UiLCIkZWwiLCJ0b3VjaGVzIiwiX2VsQm91bmRpbmdSZWN0IiwiX2xpc3RlbmVycyIsIl91cGRhdGVCb3VuZGluZ1JlY3QiLCJiaW5kIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsIl9oYW5kbGVUb3VjaFN0YXJ0IiwiX2hhbmRsZVRvdWNoIiwiaWQiLCJ4IiwieSIsInQiLCJlIiwiX3Byb3BhZ2F0ZSIsIl9oYW5kbGVUb3VjaE1vdmUiLCJfaGFuZGxlVG91Y2hFbmQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwibGlzdGVuZXJzIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiY2FsbGJhY2siLCJ3aWR0aCIsImhlaWdodCIsImNoYW5nZWRUb3VjaGVzIiwiYm91bmRpbmdSZWN0IiwiaSIsImxlbmd0aCIsInRvdWNoRXZlbnQiLCJ0b3VjaElkIiwiaWRlbnRpZmllciIsInJlbFgiLCJjbGllbnRYIiwibGVmdCIsInJlbFkiLCJjbGllbnRZIiwidG9wIiwibm9ybVgiLCJub3JtWSIsImV2ZW50TmFtZSIsIm9yaWdpbmFsRXZlbnQiLCJmb3JFYWNoIiwibGlzdGVuZXIiLCJwdXNoIiwiaW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7OztJQVNNQSxZO0FBQ0osd0JBQVlDLEdBQVosRUFBaUI7QUFBQTs7QUFBQTs7QUFDZjs7Ozs7Ozs7QUFRQSxTQUFLQSxHQUFMLEdBQVdBLEdBQVg7O0FBRUE7Ozs7Ozs7O0FBUUEsU0FBS0MsT0FBTCxHQUFlLEVBQWY7O0FBRUE7Ozs7Ozs7OztBQVNBLFNBQUtDLGVBQUwsR0FBdUIsSUFBdkI7O0FBRUE7Ozs7Ozs7OztBQVNBLFNBQUtDLFVBQUwsR0FBa0IsRUFBbEI7O0FBRUE7QUFDQSxTQUFLQyxtQkFBTCxHQUEyQixLQUFLQSxtQkFBTCxDQUF5QkMsSUFBekIsQ0FBOEIsSUFB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O0FBRUQsV0FBS3BDLFVBQUwsQ0FBZ0JvQyxTQUFoQixFQUEyQkksSUFBM0IsQ0FBZ0N0QixRQUFoQztBQUNEOztBQUVEOzs7Ozs7Ozs7O21DQU9la0IsUyxFQUFXbEIsUSxFQUFVO0FBQ2xDLFVBQU1GLFlBQVksS0FBS2hCLFVBQUwsQ0FBZ0JvQyxTQUFoQixDQUFsQjtBQUNBLFVBQUksQ0FBQ3BCLFNBQUwsRUFBZ0I7QUFBRTtBQUFTOztBQUUzQixVQUFNeUIsUUFBUXpCLFVBQVUwQixPQUFWLENBQWtCeEIsUUFBbEIsQ0FBZDs7QUFFQSxVQUFJdUIsVUFBVSxDQUFDLENBQWYsRUFDRXpCLFVBQVUyQixNQUFWLENBQWlCRixLQUFqQixFQUF3QixDQUF4QjtBQUNIOzs7OztrQkFHWTdDLFkiLCJmaWxlIjoiVG91Y2hTdXJmYWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBIZWxwZXIgdG8gaGFuZGxlIGB0b3VjaGAgZXZlbnRzIG9uIGEgZ2l2ZW4gZWxlbWVudC4gRGVjb21wb3NlIGEgbXVsdGl0b3VjaFxuICogZXZlbnQgaW4gc2V2ZXJhbCBwYXJhbGxlbCBldmVudHMsIHByb2FwZ2F0ZSBub3JtYWxpemVkIHZhbHVlcyBhY2NvcmRpbmcgdG9cbiAqIHRoZSBzaXplIG9mIHRoZSBjb250YWluZXIuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSAkZWwgLSBFbGVtZW50IHRvIGxpc3RlbiBmb3IgYHRvdWNoYCBldmVudHMuXG4gKlxuICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudFxuICovXG5jbGFzcyBUb3VjaFN1cmZhY2Uge1xuICBjb25zdHJ1Y3RvcigkZWwpIHtcbiAgICAvKipcbiAgICAgKiBFbGVtZW50IHRvIGxpc3Rlbi5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lICRlbFxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBtZW1iZXJvZiAgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlRvdWNoU3VyZmFjZVxuICAgICAqL1xuICAgIHRoaXMuJGVsID0gJGVsO1xuXG4gICAgLyoqXG4gICAgICogVG91Y2ggaWQsIG5vcm1hbGl6ZWQgcG9zaXRpb24gcGFpcnMgZm9yIGVhY2ggY3VycmVudCB0b3VjaGVzLlxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcjo8QXJyYXk8TnVtYmVyPj59XG4gICAgICogQG5hbWUgdG91Y2hlc1xuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBtZW1iZXJvZiAgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlRvdWNoU3VyZmFjZVxuICAgICAqL1xuICAgIHRoaXMudG91Y2hlcyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogQm91bmRpbmcgcmVjdCBvZiBgdGhpcy4kZWxgLlxuICAgICAqXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAbmFtZSBfZWxCb3VuZGluZ1JlY3RcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAbWVtYmVyb2YgIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5Ub3VjaFN1cmZhY2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX2VsQm91bmRpbmdSZWN0ID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICAgICAqXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAbmFtZSBfbGlzdGVuZXJzXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQG1lbWJlcm9mICBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuVG91Y2hTdXJmYWNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9saXN0ZW5lcnMgPSB7fTtcblxuICAgIC8vIGNhY2hlIGJvdW5kaW5nIHJlY3QgdmFsdWVzIGFuZCBsaXN0ZW4gZm9yIHdpbmRvdyByZXNpemVcbiAgICB0aGlzLl91cGRhdGVCb3VuZGluZ1JlY3QgPSB0aGlzLl91cGRhdGVCb3VuZGluZ1JlY3QuYmluZCh0aGlzKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fdXBkYXRlQm91bmRpbmdSZWN0KTtcbiAgICB0aGlzLl91cGRhdGVCb3VuZGluZ1JlY3QoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSAqL1xuICAgIHRoaXMuX2hhbmRsZVRvdWNoU3RhcnQgPSB0aGlzLl9oYW5kbGVUb3VjaCgoaWQsIHgsIHksIHQsIGUpID0+IHtcbiAgICAgIHRoaXMudG91Y2hlc1tpZF0gPSBbeCwgeV07XG4gICAgICB0aGlzLl9wcm9wYWdhdGUoJ3RvdWNoc3RhcnQnLCBpZCwgeCwgeSwgdCwgZSk7XG4gICAgfSk7XG5cbiAgICAvKiogQHByaXZhdGUgKi9cbiAgICB0aGlzLl9oYW5kbGVUb3VjaE1vdmUgPSB0aGlzLl9oYW5kbGVUb3VjaCgoaWQsIHgsIHksIHQsIGUpID0+IHtcbiAgICAgIHRoaXMudG91Y2hlc1tpZF0gPSBbeCwgeV07XG4gICAgICB0aGlzLl9wcm9wYWdhdGUoJ3RvdWNobW92ZScsIGlkLCB4LCB5LCB0LCBlKTtcbiAgICB9KTtcblxuICAgIC8qKiBAcHJpdmF0ZSAqL1xuICAgIHRoaXMuX2hhbmRsZVRvdWNoRW5kID0gdGhpcy5faGFuZGxlVG91Y2goKGlkLCB4LCB5LCB0LCBlKSA9PiB7XG4gICAgICBkZWxldGUgdGhpcy50b3VjaGVzW2lkXTtcbiAgICAgIHRoaXMuX3Byb3BhZ2F0ZSgndG91Y2hlbmQnLCBpZCwgeCwgeSwgdCwgZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLiRlbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5faGFuZGxlVG91Y2hTdGFydCk7XG4gICAgdGhpcy4kZWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5faGFuZGxlVG91Y2hNb3ZlKTtcbiAgICB0aGlzLiRlbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX2hhbmRsZVRvdWNoRW5kKTtcbiAgICB0aGlzLiRlbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMuX2hhbmRsZVRvdWNoRW5kKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95IHRoZSBgVG91Y2hTdXJmYWNlYCwgcmVtb3ZlIGFsbCBldmVudCBsaXN0ZW5lcnMgZnJvbSBgdGhpcy4kZWxgXG4gICAqIGFuZCBkZWxldGUgYWxsIHBvaW50ZXJzLlxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fdXBkYXRlQm91bmRpbmdSZWN0KTtcbiAgICB0aGlzLiRlbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5faGFuZGxlVG91Y2hTdGFydCk7XG4gICAgdGhpcy4kZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5faGFuZGxlVG91Y2hNb3ZlKTtcbiAgICB0aGlzLiRlbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX2hhbmRsZVRvdWNoRW5kKTtcbiAgICB0aGlzLiRlbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMuX2hhbmRsZVRvdWNoRW5kKTtcbiAgICAvLyBkZWxldGUgcG9pbnRlcnNcbiAgICB0aGlzLiRlbCA9IG51bGw7XG4gICAgdGhpcy5saXN0ZW5lcnMgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBib3VuZGluZyByZWN0IG9mIGB0aGlzLiRlbGBcbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF91cGRhdGVCb3VuZGluZ1JlY3QoKSB7XG4gICAgdGhpcy5fZWxCb3VuZGluZ1JlY3QgPSB0aGlzLiRlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmljIG1vZXRob2QgdG8gaGFuZGxlIGEgdG91Y2ggZXZlbnQuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaGFuZGxlVG91Y2goY2FsbGJhY2spIHtcbiAgICByZXR1cm4gKGUpID0+IHtcbiAgICAgIC8vIGlmIGBfdXBkYXRlQm91bmRpbmdSZWN0YCBoYXMgbm90IGJlZW4gYmVlbiBjYWxsZWQgb3JcbiAgICAgIC8vIGhhcyBiZWVuIGNhbGxlZCB3aGVuICRlbCB3YXMgaW4gYGRpc3BsYXk6bm9uZWAgc3RhdGVcbiAgICAgIGlmICghdGhpcy5fZWxCb3VuZGluZ1JlY3QgfHzCoFxuICAgICAgICAgICh0aGlzLl9lbEJvdW5kaW5nUmVjdC53aWR0aCA9PT0gMCAmJiB0aGlzLl9lbEJvdW5kaW5nUmVjdC5oZWlnaHQgPT09IDApKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUJvdW5kaW5nUmVjdCgpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0b3VjaGVzID0gZS5jaGFuZ2VkVG91Y2hlcztcbiAgICAgIGNvbnN0IGJvdW5kaW5nUmVjdCA9IHRoaXMuX2VsQm91bmRpbmdSZWN0O1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgdG91Y2hFdmVudCA9IHRvdWNoZXNbaV07XG4gICAgICAgIGNvbnN0IHRvdWNoSWQgPSB0b3VjaEV2ZW50LmlkZW50aWZpZXI7XG4gICAgICAgIGNvbnN0IHJlbFggPSB0b3VjaEV2ZW50LmNsaWVudFggLSBib3VuZGluZ1JlY3QubGVmdDtcbiAgICAgICAgY29uc3QgcmVsWSA9IHRvdWNoRXZlbnQuY2xpZW50WSAtIGJvdW5kaW5nUmVjdC50b3A7XG4gICAgICAgIGNvbnN0IG5vcm1YID0gcmVsWCAvIGJvdW5kaW5nUmVjdC53aWR0aDtcbiAgICAgICAgY29uc3Qgbm9ybVkgPSByZWxZIC8gYm91bmRpbmdSZWN0LmhlaWdodDtcblxuICAgICAgICBjYWxsYmFjayh0b3VjaElkLCBub3JtWCwgbm9ybVksIHRvdWNoRXZlbnQsIGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9wYWdhdGUgdGhlIHRvdWNoIGV2ZW50IGFuZCBub3JtYWxpemVkIHZhbHVlcyB0byB0aGUgbGlzdGVuZXJzLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lIC0gVHlwZSBvZiBldmVudC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRvdWNoSWQgLSBJZCBvZiB0aGUgdG91Y2ggZXZlbnQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBub3JtWCAtIE5vcm1hbGl6ZWQgcG9zaXRpb24gb2YgdGhlIHRvdWNoIGluIHRoZSB4IGF4aXNcbiAgICogIGFjY29yZGluZyB0byB0aGUgd2lkdGggb2YgdGhlIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBub3JtWSAtIE5vcm1hbGl6ZWQgcG9zaXRpb24gb2YgdGhlIHRvdWNoIGluIHRoZSB5IGF4aXNcbiAgICogIGFjY29yZGluZyB0byB0aGUgaGVpZ2h0IG9mIHRoZSBlbGVtZW50LlxuICAgKiBAcGFyYW0ge09iamVjdH0gdG91Y2hFdmVudCAtIE9yaWdpbmFsIHRvdWNoIGV2ZW50IChgZS5jaGFuZ2VkVG91Y2hlc1tuXWApLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3JpZ2luYWxFdmVudCAtIE9yaWdpbmFsIGV2ZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3Byb3BhZ2F0ZShldmVudE5hbWUsIHRvdWNoSWQsIG5vcm1YLCBub3JtWSwgdG91Y2hFdmVudCwgb3JpZ2luYWxFdmVudCkge1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVyc1tldmVudE5hbWVdO1xuICAgIGlmICghbGlzdGVuZXJzKSB7IHJldHVybjsgfVxuXG4gICAgbGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICBsaXN0ZW5lcih0b3VjaElkLCBub3JtWCwgbm9ybVksIHRvdWNoRXZlbnQsIG9yaWdpbmFsRXZlbnQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZvciB0b3VjaCBldmVudHNcbiAgICpcbiAgICogQGNhbGxiYWNrIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5Ub3VjaFN1cmZhY2V+RXZlbnRMaXN0ZW5lclxuICAgKiBAcGFyYW0ge051bWJlcn0gdG91Y2hJZCAtIElkIG9mIHRoZSB0b3VjaC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG5vcm1YIC0gTm9ybWFsaXplZCBwb3NpdGlvbiBpbiB0aGUgeCBheGlzLlxuICAgKiBAcGFyYW0ge051bWJlcn0gbm9ybVkgLSBOb3JtYWxpemVkIHBvc2l0aW9uIGluIHRoZSB5IGF4aXMuXG4gICAqIEBwYXJhbSB7VG91Y2h9IHRvdWNoRXZlbnQgLSBUaGUgb3JpZ2luYWwgVG91Y2ggZXZlbnQuXG4gICAqIEBwYXJhbSB7RXZlbnR9IG9yaWdpbmFsRXZlbnQgLSBUaGUgb3JpZ2luYWwgZXZlbnQuXG4gICAqL1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGxpc3RlbmVyLiBfX25vdGU6IGB0b3VjaGNhbmNlbGAgaXMgbWVyZ2Ugd2l0aCBgdG91Y2hlbmRgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lIC0gTmFtZSBvZiB0aGUgZXZlbnQgdG8gbGlzdGVuIChgdG91Y2hzdGFydGAsXG4gICAqICBgdG91Y2hlbmRgIG9yIGB0b3VjaG1vdmVgKVxuICAgKiBAcGFyYW0ge21vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5Ub3VjaFN1cmZhY2V+RXZlbnRMaXN0ZW5lcn0gY2FsbGJhY2tcbiAgICovXG4gIGFkZExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICBpZiAoIXRoaXMuX2xpc3RlbmVyc1tldmVudE5hbWVdKSB7XG4gICAgICB0aGlzLl9saXN0ZW5lcnNbZXZlbnROYW1lXSA9IFtdO1xuICAgIH1cblxuICAgIHRoaXMuX2xpc3RlbmVyc1tldmVudE5hbWVdLnB1c2goY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGxpc3RlbmVyLiBfX25vdGU6IGB0b3VjaGNhbmNlbGAgaXMgbWVyZ2Ugd2l0aCBgdG91Y2hlbmRgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lIC0gTmFtZSBvZiB0aGUgZXZlbnQgdG8gbGlzdGVuIChgdG91Y2hzdGFydGAsXG4gICAqICBgdG91Y2hlbmRgIG9yIGB0b3VjaG1vdmVgKVxuICAgKiBAcGFyYW0ge21vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5Ub3VjaFN1cmZhY2V+RXZlbnRMaXN0ZW5lcn0gY2FsbGJhY2tcbiAgICovXG4gIHJlbW92ZUxpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnNbZXZlbnROYW1lXTtcbiAgICBpZiAoIWxpc3RlbmVycykgeyByZXR1cm47IH1cblxuICAgIGNvbnN0IGluZGV4ID0gbGlzdGVuZXJzLmluZGV4T2YoY2FsbGJhY2spO1xuXG4gICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgIGxpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRvdWNoU3VyZmFjZTtcbiJdfQ==