'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _lodash = require('lodash.template');

var _lodash2 = _interopRequireDefault(_lodash);

var _viewport = require('./viewport');

var _viewport2 = _interopRequireDefault(_viewport);

var _domDelegate = require('dom-delegate');

var _domDelegate2 = _interopRequireDefault(_domDelegate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base class for views.
 *
 * _<span class="warning">__WARNING__</span> Views should be created using
 * {@link module:soundworks/client.Activity#createView} method._
 *
 * @param {String} template - Template of the view.
 * @param {Object} content - Object containing the variables used to populate
 *  the template. {@link module:soundworks/client.View#content}.
 * @param {Object} events - Listeners to install in the view
 *  {@link module:soundworks/client.View#events}.
 * @param {Object} options - Options of the view.
 *  {@link module:soundworks/client.View#options}.
 *
 * @memberof module:soundworks/client
 */
var View = function () {
  function View(template) {
    var content = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var events = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    (0, _classCallCheck3.default)(this, View);

    /**
     * Function created from the given `template`, to be executed with the
     * `content` object.
     *
     * @type {Function}
     * @name tmpl
     * @instance
     * @memberof module:soundworks/client.View
     * @private
     */
    this.tmpl = (0, _lodash2.default)(template);

    /**
     * Data used to populate variables defined in the template.
     *
     * @type {Object}
     * @name content
     * @instance
     * @memberof module:soundworks/client.View
     */
    this.content = content;

    /**
     * Events to attach to the view. The key / value pairs must follow the
     * convention: `'eventName [cssSelector]': callbackFunction`
     *
     * @type {Object}
     * @name events
     * @instance
     * @memberof module:soundworks/client.View
     */
    this.events = events;

    /**
     * Options of the View.
     *
     * @type {Object}
     * @property {String} [el='div'] - Type of DOM element of the main container
     *  of the view. Basically the argument of `document.createElement`.
     * @property {String} [id=null] - Id of the main container.
     * @property {Array<String>} [className=null] - Classes of the main container.
     * @property {Array<String>} [priority=0] - Priority of the view. This value
     *  is used by the `viewManager` to define which view should appear first.
     * @name options
     * @instance
     * @memberof module:soundworks/client.View
     *
     * @see {@link module:soundworks/client.view#$el}
     * @see {@link module:soundworks/client.viewManager}
     */
    this.options = (0, _assign2.default)({
      el: 'div',
      id: null,
      className: null,
      priority: 0
    }, options);

    /**
     * Priority of the view.
     *
     * @type {Number}
     * @name priority
     * @instance
     * @memberof module:soundworks/client.View
     * @see {@link module:soundworks/client.viewManager}
     */
    this.priority = this.options.priority;

    /**
     * Viewport width.
     *
     * @type {Number}
     * @name viewWidth
     * @instance
     * @memberof module:soundworks/client.View
     * @see {@link module:soundworks/client.viewport}
     */
    this.viewportWidth = null;

    /**
     * Viewport height.
     *
     * @type {Number}
     * @name viewWidth
     * @instance
     * @memberof module:soundworks/client.View
     * @see {@link module:soundworks/client.viewport}
     */
    this.viewportHeight = null;

    /**
     * Orientation of the view ('portrait'|'landscape')
     *
     * @type {String}
     * @name orientation
     * @instance
     * @memberof module:soundworks/client.View
     * @see {@link module:soundworks/client.viewport}
     */
    this.orientation = null;

    /**
     * Indicates if the view is visible or not.
     *
     * @type {Boolean}
     * @name isVisible
     * @instance
     * @memberof module:soundworks/client.View
     */
    this.isVisible = false;

    /**
     * If the view is a component, pointer to the parent view.
     *
     * @type {module:soundworks/client.View}
     * @name parentView
     * @default null
     * @instance
     * @memberof module:soundworks/client.View
     */
    this.parentView = null;

    /**
     * DOM element of the main container of the view. Defaults to `<div>`.
     *
     * @type {Element}
     * @name $el
     * @instance
     * @memberof module:soundworks/client.View
     */
    this.$el = document.createElement(this.options.el);

    /**
     * Store the components (sub-views) of the view.
     *
     * @type {Object}
     * @name _components
     * @instance
     * @memberof module:soundworks/client.View
     * @private
     */
    this._components = {};

    this._delegate = new _domDelegate2.default(this.$el);
    this.onResize = this.onResize.bind(this);

    this.installEvents(this.events, false);
  }

  /**
   * Add or remove a component view inside the current view.
   *
   * @param {String} selector - Css selector defining the placeholder of the view.
   * @param {View} [view=null] - View to insert inside the selector. If `null`
   *  destroy the component.
   */


  (0, _createClass3.default)(View, [{
    key: 'setViewComponent',
    value: function setViewComponent(selector) {
      var view = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var prevView = this._components[selector];
      if (prevView instanceof View) {
        prevView.remove();
      }

      if (view === null) {
        delete this._components[selector];
      } else {
        this._components[selector] = view;
        this.parentView = view;
      }
    }

    /**
     * Execute a method on all the component views (sub-views).
     *
     * @param {String} method - Name of the method to execute.
     * @param {...Mixed} args - Arguments to apply to the method.
     * @private
     */

  }, {
    key: '_executeViewComponentMethod',
    value: function _executeViewComponentMethod(method) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      for (var selector in this._components) {
        var view = this._components[selector];
        view[method].apply(view, args);
      }
    }

    /**
     * Partially re-render the view according to the given selector. If the
     * selector is associated to a `component`, the `component` is rendered.
     *
     * @param {String} selector - Css selector of the element to render. The
     *  element itself is not updated, only its content.
     * @private
     */

  }, {
    key: '_renderPartial',
    value: function _renderPartial(selector) {
      var $componentContainer = this.$el.querySelector(selector);

      if ($componentContainer === null) throw new Error('selector ' + selector + ' doesn\'t match any element');

      var component = this._components[selector];
      $componentContainer.innerHTML = '';

      if (component) {
        component.render();
        component.appendTo($componentContainer);
        component.onRender();

        if (this.isVisible) component.show();else component.hide();
      } else {
        var html = this.tmpl(this.content);
        var $tmp = document.createElement('div');
        $tmp.innerHTML = html;
        $componentContainer.innerHTML = $tmp.querySelector(selector).innerHTML;
        this.onRender();
      }
    }

    /**
     * Render the whole view and its components.
     *
     * @private
     */

  }, {
    key: '_renderAll',
    value: function _renderAll() {
      var options = this.options;
      // set id of the container id given
      if (options.id) this.$el.id = options.id;
      // set classes of the container if given
      if (options.className) {
        var _$el$classList;

        var className = options.className;
        var classes = typeof className === 'string' ? [className] : className;
        (_$el$classList = this.$el.classList).add.apply(_$el$classList, (0, _toConsumableArray3.default)(classes));
      }

      // render template and insert it in the main element
      var html = this.tmpl(this.content);
      this.$el.innerHTML = html;
      this.onRender();

      for (var selector in this._components) {
        this._renderPartial(selector);
      }
    }

    // LIFE CYCLE METHODS ----------------------------------

    /**
     * Render the view according to the given template and content.
     *
     * @param {String} [selector=null] - If not `null`, renders only the part of
     *  the view inside the matched element. If this element contains a component
     *  (sub-view), the component is rendered. Render the whole view otherwise.
     */

  }, {
    key: 'render',
    value: function render() {
      var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (selector !== null) this._renderPartial(selector);else this._renderAll();

      if (this.isVisible) this.onResize(_viewport2.default.width, _viewport2.default.height, _viewport2.default.orientation, true);
    }

    /**
     * Insert the view (`this.$el`) into the given element.
     *
     * @param {Element} $parent - Element in which the view must be inserted.
     * @private
     */

  }, {
    key: 'appendTo',
    value: function appendTo($parent) {
      this.$parent = $parent;
      $parent.appendChild(this.$el);
    }

    /**
     * Show the view. Executed by the `viewManager`.
     *
     * @private
     */

  }, {
    key: 'show',
    value: function show() {
      this.$el.style.display = 'block';
      this.isVisible = true;
      // must resize before child component
      this._delegateEvents();
      _viewport2.default.addResizeListener(this.onResize);

      this._executeViewComponentMethod('show');
    }

    /**
     * Hide the view and uninstall events. Executed by the `viewManager`.
     *
     * @private
     */

  }, {
    key: 'hide',
    value: function hide() {
      this.$el.style.display = 'none';
      this.isVisible = false;

      this._undelegateEvents();
      _viewport2.default.removeResizeListener(this.onResize);

      this._executeViewComponentMethod('hide');
    }

    /**
     * Remove the view from it's container. Executed by the `viewManager`.
     * @private
     */

  }, {
    key: 'remove',
    value: function remove() {
      this.hide();
      this.$el.remove();
      this._executeViewComponentMethod('remove');
    }

    /**
     * Interface method to extend, executed when the DOM is created.
     */

  }, {
    key: 'onRender',
    value: function onRender() {}

    /**
     * Callback executed on `resize` events. By default, maintains the size
     * of the container to fit the viewport size. The method is also executed when
     * the view is inserted in the DOM.
     *
     * @param {Number} viewportWidth - Width of the viewport.
     * @param {Number} viewportHeight - Height of the viewport.
     * @param {String} orientation - Orientation of the viewport.
     * @see {@link module:soundworks/client.viewport}
     */

  }, {
    key: 'onResize',
    value: function onResize(viewportWidth, viewportHeight, orientation) {
      var propagate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      this.viewportWidth = viewportWidth;
      this.viewportHeight = viewportHeight;
      this.orientation = orientation;

      this.$el.style.width = viewportWidth + 'px';
      this.$el.style.height = viewportHeight + 'px';
      this.$el.classList.remove('portrait', 'landscape');
      this.$el.classList.add(orientation);

      if (propagate) this._executeViewComponentMethod('onResize', viewportWidth, viewportHeight, orientation);
    }

    // EVENTS ----------------------------------------

    /**
     * Install events on the view.
     *
     * @param {Object<String, Function>} events - An object of events.
     * @param {Boolean} [override=false] - Defines if the new events added to the
     *  the old one or if they replace them.
     */

  }, {
    key: 'installEvents',
    value: function installEvents(events) {
      var override = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (this.isVisible) this._undelegateEvents();

      this.events = override ? events : (0, _assign2.default)(this.events, events);

      if (this.isVisible) this._delegateEvents();
    }

    /**
     * Add event listeners on the view.
     *
     * @private
     */

  }, {
    key: '_delegateEvents',
    value: function _delegateEvents() {
      for (var key in this.events) {
        var _key$split = key.split(/ +/),
            _key$split2 = (0, _slicedToArray3.default)(_key$split, 2),
            event = _key$split2[0],
            selector = _key$split2[1];

        var callback = this.events[key];

        this._delegate.on(event, selector || null, callback);
      }
    }

    /**
     * Remove event listeners from the view.
     *
     * @private
     */

  }, {
    key: '_undelegateEvents',
    value: function _undelegateEvents() {
      this._delegate.off();
    }
  }]);
  return View;
}();

exports.default = View;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlZpZXcuanMiXSwibmFtZXMiOlsiVmlldyIsInRlbXBsYXRlIiwiY29udGVudCIsImV2ZW50cyIsIm9wdGlvbnMiLCJ0bXBsIiwiZWwiLCJpZCIsImNsYXNzTmFtZSIsInByaW9yaXR5Iiwidmlld3BvcnRXaWR0aCIsInZpZXdwb3J0SGVpZ2h0Iiwib3JpZW50YXRpb24iLCJpc1Zpc2libGUiLCJwYXJlbnRWaWV3IiwiJGVsIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiX2NvbXBvbmVudHMiLCJfZGVsZWdhdGUiLCJvblJlc2l6ZSIsImJpbmQiLCJpbnN0YWxsRXZlbnRzIiwic2VsZWN0b3IiLCJ2aWV3IiwicHJldlZpZXciLCJyZW1vdmUiLCJtZXRob2QiLCJhcmdzIiwiJGNvbXBvbmVudENvbnRhaW5lciIsInF1ZXJ5U2VsZWN0b3IiLCJFcnJvciIsImNvbXBvbmVudCIsImlubmVySFRNTCIsInJlbmRlciIsImFwcGVuZFRvIiwib25SZW5kZXIiLCJzaG93IiwiaGlkZSIsImh0bWwiLCIkdG1wIiwiY2xhc3NlcyIsImNsYXNzTGlzdCIsImFkZCIsIl9yZW5kZXJQYXJ0aWFsIiwiX3JlbmRlckFsbCIsIndpZHRoIiwiaGVpZ2h0IiwiJHBhcmVudCIsImFwcGVuZENoaWxkIiwic3R5bGUiLCJkaXNwbGF5IiwiX2RlbGVnYXRlRXZlbnRzIiwiYWRkUmVzaXplTGlzdGVuZXIiLCJfZXhlY3V0ZVZpZXdDb21wb25lbnRNZXRob2QiLCJfdW5kZWxlZ2F0ZUV2ZW50cyIsInJlbW92ZVJlc2l6ZUxpc3RlbmVyIiwicHJvcGFnYXRlIiwib3ZlcnJpZGUiLCJrZXkiLCJzcGxpdCIsImV2ZW50IiwiY2FsbGJhY2siLCJvbiIsIm9mZiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7O0lBZ0JNQSxJO0FBQ0osZ0JBQVlDLFFBQVosRUFBK0Q7QUFBQSxRQUF6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QUdZaEUsSSIsImZpbGUiOiJWaWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHRtcGwgZnJvbSAnbG9kYXNoLnRlbXBsYXRlJztcbmltcG9ydCB2aWV3cG9ydCBmcm9tICcuL3ZpZXdwb3J0JztcbmltcG9ydCBEZWxlZ2F0ZSBmcm9tICdkb20tZGVsZWdhdGUnO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIHZpZXdzLlxuICpcbiAqIF88c3BhbiBjbGFzcz1cIndhcm5pbmdcIj5fX1dBUk5JTkdfXzwvc3Bhbj4gVmlld3Mgc2hvdWxkIGJlIGNyZWF0ZWQgdXNpbmdcbiAqIHtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuQWN0aXZpdHkjY3JlYXRlVmlld30gbWV0aG9kLl9cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdGVtcGxhdGUgLSBUZW1wbGF0ZSBvZiB0aGUgdmlldy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZW50IC0gT2JqZWN0IGNvbnRhaW5pbmcgdGhlIHZhcmlhYmxlcyB1c2VkIHRvIHBvcHVsYXRlXG4gKiAgdGhlIHRlbXBsYXRlLiB7QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlZpZXcjY29udGVudH0uXG4gKiBAcGFyYW0ge09iamVjdH0gZXZlbnRzIC0gTGlzdGVuZXJzIHRvIGluc3RhbGwgaW4gdGhlIHZpZXdcbiAqICB7QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlZpZXcjZXZlbnRzfS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3B0aW9ucyBvZiB0aGUgdmlldy5cbiAqICB7QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlZpZXcjb3B0aW9uc30uXG4gKlxuICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudFxuICovXG5jbGFzcyBWaWV3IHtcbiAgY29uc3RydWN0b3IodGVtcGxhdGUsIGNvbnRlbnQgPSB7fSwgZXZlbnRzID0ge30sIG9wdGlvbnMgPSB7fSkge1xuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgZ2l2ZW4gYHRlbXBsYXRlYCwgdG8gYmUgZXhlY3V0ZWQgd2l0aCB0aGVcbiAgICAgKiBgY29udGVudGAgb2JqZWN0LlxuICAgICAqXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqIEBuYW1lIHRtcGxcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlZpZXdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMudG1wbCA9IHRtcGwodGVtcGxhdGUpO1xuXG4gICAgLyoqXG4gICAgICogRGF0YSB1c2VkIHRvIHBvcHVsYXRlIHZhcmlhYmxlcyBkZWZpbmVkIGluIHRoZSB0ZW1wbGF0ZS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQG5hbWUgY29udGVudFxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuVmlld1xuICAgICAqL1xuICAgIHRoaXMuY29udGVudCA9IGNvbnRlbnQ7XG5cbiAgICAvKipcbiAgICAgKiBFdmVudHMgdG8gYXR0YWNoIHRvIHRoZSB2aWV3LiBUaGUga2V5IC8gdmFsdWUgcGFpcnMgbXVzdCBmb2xsb3cgdGhlXG4gICAgICogY29udmVudGlvbjogYCdldmVudE5hbWUgW2Nzc1NlbGVjdG9yXSc6IGNhbGxiYWNrRnVuY3Rpb25gXG4gICAgICpcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBuYW1lIGV2ZW50c1xuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuVmlld1xuICAgICAqL1xuICAgIHRoaXMuZXZlbnRzID0gZXZlbnRzO1xuXG4gICAgLyoqXG4gICAgICogT3B0aW9ucyBvZiB0aGUgVmlldy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQHByb3BlcnR5IHtTdHJpbmd9IFtlbD0nZGl2J10gLSBUeXBlIG9mIERPTSBlbGVtZW50IG9mIHRoZSBtYWluIGNvbnRhaW5lclxuICAgICAqICBvZiB0aGUgdmlldy4gQmFzaWNhbGx5IHRoZSBhcmd1bWVudCBvZiBgZG9jdW1lbnQuY3JlYXRlRWxlbWVudGAuXG4gICAgICogQHByb3BlcnR5IHtTdHJpbmd9IFtpZD1udWxsXSAtIElkIG9mIHRoZSBtYWluIGNvbnRhaW5lci5cbiAgICAgKiBAcHJvcGVydHkge0FycmF5PFN0cmluZz59IFtjbGFzc05hbWU9bnVsbF0gLSBDbGFzc2VzIG9mIHRoZSBtYWluIGNvbnRhaW5lci5cbiAgICAgKiBAcHJvcGVydHkge0FycmF5PFN0cmluZz59IFtwcmlvcml0eT0wXSAtIFByaW9yaXR5IG9mIHRoZSB2aWV3LiBUaGlzIHZhbHVlXG4gICAgICogIGlzIHVzZWQgYnkgdGhlIGB2aWV3TWFuYWdlcmAgdG8gZGVmaW5lIHdoaWNoIHZpZXcgc2hvdWxkIGFwcGVhciBmaXJzdC5cbiAgICAgKiBAbmFtZSBvcHRpb25zXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5WaWV3XG4gICAgICpcbiAgICAgKiBAc2VlIHtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQudmlldyMkZWx9XG4gICAgICogQHNlZSB7QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LnZpZXdNYW5hZ2VyfVxuICAgICAqL1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgZWw6ICdkaXYnLFxuICAgICAgaWQ6IG51bGwsXG4gICAgICBjbGFzc05hbWU6IG51bGwsXG4gICAgICBwcmlvcml0eTogMCxcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIC8qKlxuICAgICAqIFByaW9yaXR5IG9mIHRoZSB2aWV3LlxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBwcmlvcml0eVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuVmlld1xuICAgICAqIEBzZWUge0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC52aWV3TWFuYWdlcn1cbiAgICAgKi9cbiAgICB0aGlzLnByaW9yaXR5ID0gdGhpcy5vcHRpb25zLnByaW9yaXR5O1xuXG4gICAgLyoqXG4gICAgICogVmlld3BvcnQgd2lkdGguXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIHZpZXdXaWR0aFxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuVmlld1xuICAgICAqIEBzZWUge0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC52aWV3cG9ydH1cbiAgICAgKi9cbiAgICB0aGlzLnZpZXdwb3J0V2lkdGggPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogVmlld3BvcnQgaGVpZ2h0LlxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSB2aWV3V2lkdGhcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlZpZXdcbiAgICAgKiBAc2VlIHtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQudmlld3BvcnR9XG4gICAgICovXG4gICAgdGhpcy52aWV3cG9ydEhlaWdodCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBPcmllbnRhdGlvbiBvZiB0aGUgdmlldyAoJ3BvcnRyYWl0J3wnbGFuZHNjYXBlJylcbiAgICAgKlxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICogQG5hbWUgb3JpZW50YXRpb25cbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlZpZXdcbiAgICAgKiBAc2VlIHtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQudmlld3BvcnR9XG4gICAgICovXG4gICAgdGhpcy5vcmllbnRhdGlvbiA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIHZpZXcgaXMgdmlzaWJsZSBvciBub3QuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAbmFtZSBpc1Zpc2libGVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlZpZXdcbiAgICAgKi9cbiAgICB0aGlzLmlzVmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogSWYgdGhlIHZpZXcgaXMgYSBjb21wb25lbnQsIHBvaW50ZXIgdG8gdGhlIHBhcmVudCB2aWV3LlxuICAgICAqXG4gICAgICogQHR5cGUge21vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5WaWV3fVxuICAgICAqIEBuYW1lIHBhcmVudFZpZXdcbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5WaWV3XG4gICAgICovXG4gICAgdGhpcy5wYXJlbnRWaWV3ID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIERPTSBlbGVtZW50IG9mIHRoZSBtYWluIGNvbnRhaW5lciBvZiB0aGUgdmlldy4gRGVmYXVsdHMgdG8gYDxkaXY+YC5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lICRlbFxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuVmlld1xuICAgICAqL1xuICAgIHRoaXMuJGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0aGlzLm9wdGlvbnMuZWwpO1xuXG4gICAgLyoqXG4gICAgICogU3RvcmUgdGhlIGNvbXBvbmVudHMgKHN1Yi12aWV3cykgb2YgdGhlIHZpZXcuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBuYW1lIF9jb21wb25lbnRzXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5WaWV3XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9jb21wb25lbnRzID0ge307XG5cblxuICAgIHRoaXMuX2RlbGVnYXRlID0gbmV3IERlbGVnYXRlKHRoaXMuJGVsKTtcbiAgICB0aGlzLm9uUmVzaXplID0gdGhpcy5vblJlc2l6ZS5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy5pbnN0YWxsRXZlbnRzKHRoaXMuZXZlbnRzLCBmYWxzZSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIG9yIHJlbW92ZSBhIGNvbXBvbmVudCB2aWV3IGluc2lkZSB0aGUgY3VycmVudCB2aWV3LlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3IgLSBDc3Mgc2VsZWN0b3IgZGVmaW5pbmcgdGhlIHBsYWNlaG9sZGVyIG9mIHRoZSB2aWV3LlxuICAgKiBAcGFyYW0ge1ZpZXd9IFt2aWV3PW51bGxdIC0gVmlldyB0byBpbnNlcnQgaW5zaWRlIHRoZSBzZWxlY3Rvci4gSWYgYG51bGxgXG4gICAqICBkZXN0cm95IHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBzZXRWaWV3Q29tcG9uZW50KHNlbGVjdG9yLCB2aWV3ID0gbnVsbCkge1xuICAgIGNvbnN0IHByZXZWaWV3ID0gdGhpcy5fY29tcG9uZW50c1tzZWxlY3Rvcl07XG4gICAgaWYgKHByZXZWaWV3IGluc3RhbmNlb2YgVmlldykgeyBwcmV2Vmlldy5yZW1vdmUoKTsgfVxuXG4gICAgaWYgKHZpZXcgPT09IG51bGwpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLl9jb21wb25lbnRzW3NlbGVjdG9yXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY29tcG9uZW50c1tzZWxlY3Rvcl0gPSB2aWV3O1xuICAgICAgdGhpcy5wYXJlbnRWaWV3ID0gdmlldztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZSBhIG1ldGhvZCBvbiBhbGwgdGhlIGNvbXBvbmVudCB2aWV3cyAoc3ViLXZpZXdzKS5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZCAtIE5hbWUgb2YgdGhlIG1ldGhvZCB0byBleGVjdXRlLlxuICAgKiBAcGFyYW0gey4uLk1peGVkfSBhcmdzIC0gQXJndW1lbnRzIHRvIGFwcGx5IHRvIHRoZSBtZXRob2QuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXhlY3V0ZVZpZXdDb21wb25lbnRNZXRob2QobWV0aG9kLCAuLi5hcmdzKSB7XG4gICAgZm9yIChsZXQgc2VsZWN0b3IgaW4gdGhpcy5fY29tcG9uZW50cykge1xuICAgICAgY29uc3QgdmlldyA9IHRoaXMuX2NvbXBvbmVudHNbc2VsZWN0b3JdO1xuICAgICAgdmlld1ttZXRob2RdKC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJ0aWFsbHkgcmUtcmVuZGVyIHRoZSB2aWV3IGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gc2VsZWN0b3IuIElmIHRoZVxuICAgKiBzZWxlY3RvciBpcyBhc3NvY2lhdGVkIHRvIGEgYGNvbXBvbmVudGAsIHRoZSBgY29tcG9uZW50YCBpcyByZW5kZXJlZC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yIC0gQ3NzIHNlbGVjdG9yIG9mIHRoZSBlbGVtZW50IHRvIHJlbmRlci4gVGhlXG4gICAqICBlbGVtZW50IGl0c2VsZiBpcyBub3QgdXBkYXRlZCwgb25seSBpdHMgY29udGVudC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9yZW5kZXJQYXJ0aWFsKHNlbGVjdG9yKSB7XG4gICAgY29uc3QgJGNvbXBvbmVudENvbnRhaW5lciA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuXG4gICAgaWYgKCRjb21wb25lbnRDb250YWluZXIgPT09IG51bGwpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHNlbGVjdG9yICR7c2VsZWN0b3J9IGRvZXNuJ3QgbWF0Y2ggYW55IGVsZW1lbnRgKTtcblxuICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMuX2NvbXBvbmVudHNbc2VsZWN0b3JdO1xuICAgICRjb21wb25lbnRDb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG5cbiAgICBpZiAoY29tcG9uZW50KSB7XG4gICAgICBjb21wb25lbnQucmVuZGVyKCk7XG4gICAgICBjb21wb25lbnQuYXBwZW5kVG8oJGNvbXBvbmVudENvbnRhaW5lcik7XG4gICAgICBjb21wb25lbnQub25SZW5kZXIoKTtcblxuICAgICAgaWYgKHRoaXMuaXNWaXNpYmxlKVxuICAgICAgICBjb21wb25lbnQuc2hvdygpO1xuICAgICAgZWxzZVxuICAgICAgICBjb21wb25lbnQuaGlkZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBodG1sID0gdGhpcy50bXBsKHRoaXMuY29udGVudCk7XG4gICAgICBjb25zdCAkdG1wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAkdG1wLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAkY29tcG9uZW50Q29udGFpbmVyLmlubmVySFRNTCA9ICR0bXAucXVlcnlTZWxlY3RvcihzZWxlY3RvcikuaW5uZXJIVE1MO1xuICAgICAgdGhpcy5vblJlbmRlcigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgdGhlIHdob2xlIHZpZXcgYW5kIGl0cyBjb21wb25lbnRzLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3JlbmRlckFsbCgpIHtcbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgIC8vIHNldCBpZCBvZiB0aGUgY29udGFpbmVyIGlkIGdpdmVuXG4gICAgaWYgKG9wdGlvbnMuaWQpXG4gICAgICB0aGlzLiRlbC5pZCA9IG9wdGlvbnMuaWQ7XG4gICAgLy8gc2V0IGNsYXNzZXMgb2YgdGhlIGNvbnRhaW5lciBpZiBnaXZlblxuICAgIGlmIChvcHRpb25zLmNsYXNzTmFtZSkge1xuICAgICAgY29uc3QgY2xhc3NOYW1lID0gb3B0aW9ucy5jbGFzc05hbWU7XG4gICAgICBjb25zdCBjbGFzc2VzID0gdHlwZW9mIGNsYXNzTmFtZSA9PT0gJ3N0cmluZycgPyBbY2xhc3NOYW1lXSA6IGNsYXNzTmFtZTtcbiAgICAgIHRoaXMuJGVsLmNsYXNzTGlzdC5hZGQoLi4uY2xhc3Nlcyk7XG4gICAgfVxuXG4gICAgLy8gcmVuZGVyIHRlbXBsYXRlIGFuZCBpbnNlcnQgaXQgaW4gdGhlIG1haW4gZWxlbWVudFxuICAgIGNvbnN0IGh0bWwgPSB0aGlzLnRtcGwodGhpcy5jb250ZW50KTtcbiAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBodG1sO1xuICAgIHRoaXMub25SZW5kZXIoKTtcblxuICAgIGZvciAobGV0IHNlbGVjdG9yIGluIHRoaXMuX2NvbXBvbmVudHMpXG4gICAgICB0aGlzLl9yZW5kZXJQYXJ0aWFsKHNlbGVjdG9yKTtcbiAgfVxuXG4gIC8vIExJRkUgQ1lDTEUgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgdmlldyBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIHRlbXBsYXRlIGFuZCBjb250ZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gW3NlbGVjdG9yPW51bGxdIC0gSWYgbm90IGBudWxsYCwgcmVuZGVycyBvbmx5IHRoZSBwYXJ0IG9mXG4gICAqICB0aGUgdmlldyBpbnNpZGUgdGhlIG1hdGNoZWQgZWxlbWVudC4gSWYgdGhpcyBlbGVtZW50IGNvbnRhaW5zIGEgY29tcG9uZW50XG4gICAqICAoc3ViLXZpZXcpLCB0aGUgY29tcG9uZW50IGlzIHJlbmRlcmVkLiBSZW5kZXIgdGhlIHdob2xlIHZpZXcgb3RoZXJ3aXNlLlxuICAgKi9cbiAgcmVuZGVyKHNlbGVjdG9yID0gbnVsbCkge1xuICAgIGlmIChzZWxlY3RvciAhPT0gbnVsbClcbiAgICAgIHRoaXMuX3JlbmRlclBhcnRpYWwoc2VsZWN0b3IpO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuX3JlbmRlckFsbCgpO1xuXG4gICAgaWYgKHRoaXMuaXNWaXNpYmxlKVxuICAgICAgdGhpcy5vblJlc2l6ZSh2aWV3cG9ydC53aWR0aCwgdmlld3BvcnQuaGVpZ2h0LCB2aWV3cG9ydC5vcmllbnRhdGlvbiwgdHJ1ZSk7XG4gIH1cblxuICAvKipcbiAgICogSW5zZXJ0IHRoZSB2aWV3IChgdGhpcy4kZWxgKSBpbnRvIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR9ICRwYXJlbnQgLSBFbGVtZW50IGluIHdoaWNoIHRoZSB2aWV3IG11c3QgYmUgaW5zZXJ0ZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhcHBlbmRUbygkcGFyZW50KSB7XG4gICAgdGhpcy4kcGFyZW50ID0gJHBhcmVudDtcbiAgICAkcGFyZW50LmFwcGVuZENoaWxkKHRoaXMuJGVsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG93IHRoZSB2aWV3LiBFeGVjdXRlZCBieSB0aGUgYHZpZXdNYW5hZ2VyYC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNob3coKSB7XG4gICAgdGhpcy4kZWwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgdGhpcy5pc1Zpc2libGUgPSB0cnVlO1xuICAgIC8vIG11c3QgcmVzaXplIGJlZm9yZSBjaGlsZCBjb21wb25lbnRcbiAgICB0aGlzLl9kZWxlZ2F0ZUV2ZW50cygpO1xuICAgIHZpZXdwb3J0LmFkZFJlc2l6ZUxpc3RlbmVyKHRoaXMub25SZXNpemUpO1xuXG4gICAgdGhpcy5fZXhlY3V0ZVZpZXdDb21wb25lbnRNZXRob2QoJ3Nob3cnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWRlIHRoZSB2aWV3IGFuZCB1bmluc3RhbGwgZXZlbnRzLiBFeGVjdXRlZCBieSB0aGUgYHZpZXdNYW5hZ2VyYC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhpZGUoKSB7XG4gICAgdGhpcy4kZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB0aGlzLmlzVmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgdGhpcy5fdW5kZWxlZ2F0ZUV2ZW50cygpO1xuICAgIHZpZXdwb3J0LnJlbW92ZVJlc2l6ZUxpc3RlbmVyKHRoaXMub25SZXNpemUpO1xuXG4gICAgdGhpcy5fZXhlY3V0ZVZpZXdDb21wb25lbnRNZXRob2QoJ2hpZGUnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgdGhlIHZpZXcgZnJvbSBpdCdzIGNvbnRhaW5lci4gRXhlY3V0ZWQgYnkgdGhlIGB2aWV3TWFuYWdlcmAuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICByZW1vdmUoKSB7XG4gICAgdGhpcy5oaWRlKCk7XG4gICAgdGhpcy4kZWwucmVtb3ZlKCk7XG4gICAgdGhpcy5fZXhlY3V0ZVZpZXdDb21wb25lbnRNZXRob2QoJ3JlbW92ZScpO1xuICB9XG5cbiAgLyoqXG4gICAqIEludGVyZmFjZSBtZXRob2QgdG8gZXh0ZW5kLCBleGVjdXRlZCB3aGVuIHRoZSBET00gaXMgY3JlYXRlZC5cbiAgICovXG4gIG9uUmVuZGVyKCkge31cblxuICAvKipcbiAgICogQ2FsbGJhY2sgZXhlY3V0ZWQgb24gYHJlc2l6ZWAgZXZlbnRzLiBCeSBkZWZhdWx0LCBtYWludGFpbnMgdGhlIHNpemVcbiAgICogb2YgdGhlIGNvbnRhaW5lciB0byBmaXQgdGhlIHZpZXdwb3J0IHNpemUuIFRoZSBtZXRob2QgaXMgYWxzbyBleGVjdXRlZCB3aGVuXG4gICAqIHRoZSB2aWV3IGlzIGluc2VydGVkIGluIHRoZSBET00uXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB2aWV3cG9ydFdpZHRoIC0gV2lkdGggb2YgdGhlIHZpZXdwb3J0LlxuICAgKiBAcGFyYW0ge051bWJlcn0gdmlld3BvcnRIZWlnaHQgLSBIZWlnaHQgb2YgdGhlIHZpZXdwb3J0LlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3JpZW50YXRpb24gLSBPcmllbnRhdGlvbiBvZiB0aGUgdmlld3BvcnQuXG4gICAqIEBzZWUge0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC52aWV3cG9ydH1cbiAgICovXG4gIG9uUmVzaXplKHZpZXdwb3J0V2lkdGgsIHZpZXdwb3J0SGVpZ2h0LCBvcmllbnRhdGlvbiwgcHJvcGFnYXRlID0gZmFsc2UpIHtcbiAgICB0aGlzLnZpZXdwb3J0V2lkdGggPSB2aWV3cG9ydFdpZHRoO1xuICAgIHRoaXMudmlld3BvcnRIZWlnaHQgPSB2aWV3cG9ydEhlaWdodDtcbiAgICB0aGlzLm9yaWVudGF0aW9uID0gb3JpZW50YXRpb247XG5cbiAgICB0aGlzLiRlbC5zdHlsZS53aWR0aCA9IGAke3ZpZXdwb3J0V2lkdGh9cHhgO1xuICAgIHRoaXMuJGVsLnN0eWxlLmhlaWdodCA9IGAke3ZpZXdwb3J0SGVpZ2h0fXB4YDtcbiAgICB0aGlzLiRlbC5jbGFzc0xpc3QucmVtb3ZlKCdwb3J0cmFpdCcsICdsYW5kc2NhcGUnKTtcbiAgICB0aGlzLiRlbC5jbGFzc0xpc3QuYWRkKG9yaWVudGF0aW9uKTtcblxuICAgIGlmIChwcm9wYWdhdGUpXG4gICAgICB0aGlzLl9leGVjdXRlVmlld0NvbXBvbmVudE1ldGhvZCgnb25SZXNpemUnLCB2aWV3cG9ydFdpZHRoLCB2aWV3cG9ydEhlaWdodCwgb3JpZW50YXRpb24pO1xuICB9XG5cbiAgLy8gRVZFTlRTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvKipcbiAgICogSW5zdGFsbCBldmVudHMgb24gdGhlIHZpZXcuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0PFN0cmluZywgRnVuY3Rpb24+fSBldmVudHMgLSBBbiBvYmplY3Qgb2YgZXZlbnRzLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvdmVycmlkZT1mYWxzZV0gLSBEZWZpbmVzIGlmIHRoZSBuZXcgZXZlbnRzIGFkZGVkIHRvIHRoZVxuICAgKiAgdGhlIG9sZCBvbmUgb3IgaWYgdGhleSByZXBsYWNlIHRoZW0uXG4gICAqL1xuICBpbnN0YWxsRXZlbnRzKGV2ZW50cywgb3ZlcnJpZGUgPSBmYWxzZSkge1xuICAgIGlmICh0aGlzLmlzVmlzaWJsZSlcbiAgICAgIHRoaXMuX3VuZGVsZWdhdGVFdmVudHMoKTtcblxuICAgIHRoaXMuZXZlbnRzID0gb3ZlcnJpZGUgPyBldmVudHMgOiBPYmplY3QuYXNzaWduKHRoaXMuZXZlbnRzLCBldmVudHMpO1xuXG4gICAgaWYgKHRoaXMuaXNWaXNpYmxlKVxuICAgICAgdGhpcy5fZGVsZWdhdGVFdmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgZXZlbnQgbGlzdGVuZXJzIG9uIHRoZSB2aWV3LlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2RlbGVnYXRlRXZlbnRzKCkge1xuICAgIGZvciAobGV0IGtleSBpbiB0aGlzLmV2ZW50cykge1xuICAgICAgY29uc3QgW2V2ZW50LCBzZWxlY3Rvcl0gPSBrZXkuc3BsaXQoLyArLyk7XG4gICAgICBjb25zdCBjYWxsYmFjayA9IHRoaXMuZXZlbnRzW2tleV07XG5cbiAgICAgIHRoaXMuX2RlbGVnYXRlLm9uKGV2ZW50LCBzZWxlY3RvciB8fMKgbnVsbCwgY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzIGZyb20gdGhlIHZpZXcuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfdW5kZWxlZ2F0ZUV2ZW50cygpIHtcbiAgICB0aGlzLl9kZWxlZ2F0ZS5vZmYoKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWaWV3O1xuIl19