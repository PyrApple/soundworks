'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

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

var _View2 = require('./View');

var _View3 = _interopRequireDefault(_View2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var svgTemplate = '\n<div class="svg-container">\n  <svg></svg>\n</div>';

var ns = 'http://www.w3.org/2000/svg';

/**
 * A view that render an `area` object (as defined in server configuration).
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

var SpaceView = function (_View) {
  (0, _inherits3.default)(SpaceView, _View);

  function SpaceView() {
    var template = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : svgTemplate;
    var content = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var events = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    (0, _classCallCheck3.default)(this, SpaceView);

    options = (0, _assign2.default)({ className: 'space' }, options);

    /**
     * The area to display.
     *
     * @type {Object}
     * @property {Number} area.width - Width of the area.
     * @property {Number} area.height - Height of the area.
     * @property {String} area.background - Optionnal background image to
     *  display in background.
     * @name area
     * @instance
     * @memberof module:soundworks/client.SpaceView
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (SpaceView.__proto__ || (0, _getPrototypeOf2.default)(SpaceView)).call(this, template, content, events, options));

    _this.area = null;

    /**
     * Width of the rendered area in pixels.
     *
     * @type {Number}
     * @name areaWidth
     * @instance
     * @memberof module:soundworks/client.SpaceView
     */
    _this.areaWidth = null;

    /**
     * Height of the rendered area in pixels.
     *
     * @type {Number}
     * @name areaHeight
     * @instance
     * @memberof module:soundworks/client.SpaceView
     */
    _this.areaHeight = null;

    /**
     * Map associating `$shapes` and their relative `point` object.
     *
     * @type {Map}
     * @name shapePointMap
     * @instance
     * @memberof module:soundworks/client.SpaceView
     */
    _this.shapePointMap = new _map2.default();

    /**
     * Expose a Map of the $shapes and their relative line object.
     * @type {Map}
     * @private
     */
    _this.shapeLineMap = new _map2.default();

    _this._renderedPoints = new _map2.default();
    _this._renderedLines = new _map2.default();
    return _this;
  }

  /**
   * Set the `area` to be renderered.
   *
   * @type {Object} area - Object describing the area, generally defined in
   *  server configuration.
   * @property {Number} area.width - Width of the area.
   * @property {Number} area.height - Height of the area.
   * @property {String} area.background - Optionnal background image to
     *  display in background.
   */


  (0, _createClass3.default)(SpaceView, [{
    key: 'setArea',
    value: function setArea(area) {
      this.area = area;
    }

    /** @private */

  }, {
    key: 'onRender',
    value: function onRender() {
      this.$svgContainer = this.$el.querySelector('.svg-container');
      this.$svg = this.$el.querySelector('svg');
      this.addDefinitions();
      this.renderArea();
    }

    /** @private */

  }, {
    key: 'onResize',
    value: function onResize(viewportWidth, viewportHeight, orientation) {
      (0, _get3.default)(SpaceView.prototype.__proto__ || (0, _getPrototypeOf2.default)(SpaceView.prototype), 'onResize', this).call(this, viewportWidth, viewportHeight, orientation);
      // override size to match parent size if component of another view
      if (this.parentView) {
        this.$el.style.width = '100%';
        this.$el.style.height = '100%';
      }

      this.renderArea();
    }

    /**
     * Add svg definitions.
     *
     * @private
     */

  }, {
    key: 'addDefinitions',
    value: function addDefinitions() {
      this.$defs = document.createElementNS(ns, 'defs');

      var markerArrow = '\n      <marker id="marker-arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">\n          <path d="M0,0 L0,10 L10,5 L0,0" class="marker-arrow" />\n      </marker>\n    ';

      this.$defs.innerHTML = markerArrow;
      this.$svg.insertBefore(this.$defs, this.$svg.firstChild);
    }

    /**
     * Update the displayed area, according to changes in `area` definition or
     * if a `resize` event has been trigerred.
     */

  }, {
    key: 'renderArea',
    value: function renderArea() {
      var area = this.area;
      // use `this.$el` size instead of `this.$parent` size to ignore parent padding
      var boundingRect = this.$el.getBoundingClientRect();
      var containerWidth = boundingRect.width;
      var containerHeight = boundingRect.height;

      this.ratio = Math.min(containerWidth / area.width, containerHeight / area.height);
      var svgWidth = area.width * this.ratio;
      var svgHeight = area.height * this.ratio;

      var top = (containerHeight - svgHeight) / 2;
      var left = (containerWidth - svgWidth) / 2;

      this.$svgContainer.style.width = svgWidth + 'px';
      this.$svgContainer.style.height = svgHeight + 'px';
      this.$svg.setAttribute('width', svgWidth);
      this.$svg.setAttribute('height', svgHeight);
      // center the svg into the parent
      this.$svgContainer.style.position = 'absolute';
      this.$svgContainer.style.top = top + 'px';
      this.$svgContainer.style.left = left + 'px';

      this.$svg.style.position = 'absolute';
      this.$svg.style.top = '0px';
      this.$svg.style.left = '0px';

      // display background if any
      if (area.background) {
        this.$el.style.backgroundImage = 'url(' + area.background + ')';
        this.$el.style.backgroundPosition = '50% 50%';
        this.$el.style.backgroundRepeat = 'no-repeat';
        this.$el.style.backgroundSize = 'contain';
        // force $svg to be transparent
        this.$svg.style.backgroundColor = 'transparent';
      }

      // update existing points position
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(this.shapePointMap), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = (0, _slicedToArray3.default)(_step.value, 2),
              $shape = _step$value[0],
              point = _step$value[1];

          this.updatePoint(point);
        } // expose the size of the area in pixel
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

      this.areaWidth = svgWidth;
      this.areaHeight = svgHeight;
    }

    /**
     * Method used to render a specific point. Override this method to display
     * points with user defined shapes. The shape returned by this method is
     * inserted into the `svg` element.
     *
     * @param {Object} point - Point to render.
     * @param {String|Number} point.id - Unique identifier for the point.
     * @param {Number} point.x - Value in the x axis in the area coordinate system.
     * @param {Number} point.y - Value in the y axis in the area coordinate system.
     * @param {Number} [point.radius=0.3] - Radius of the point (relative to the
     *  area width and height).
     * @param {String} [point.color=undefined] - Optionnal color of the point.
     */

  }, {
    key: 'renderPoint',
    value: function renderPoint(point) {
      var $shape = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if ($shape === null) {
        $shape = document.createElementNS(ns, 'circle');
        $shape.classList.add('point');
      }

      $shape.setAttribute('data-id', point.id);
      $shape.setAttribute('cx', '' + point.x * this.ratio);
      $shape.setAttribute('cy', '' + point.y * this.ratio);
      $shape.setAttribute('r', point.radius || 8); // radius is relative to area size

      if (point.color) $shape.style.fill = point.color;

      var method = point.selected ? 'add' : 'remove';
      $shape.classList[method]('selected');

      return $shape;
    }

    /**
     * Replace all the existing points with the given array of points.
     *
     * @param {Array<Object>} points - Points to render.
     */

  }, {
    key: 'setPoints',
    value: function setPoints(points) {
      this.clearPoints();
      this.addPoints(points);
    }

    /**
     * Delete all points.
     */

  }, {
    key: 'clearPoints',
    value: function clearPoints() {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = (0, _getIterator3.default)(this._renderedPoints.keys()), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var id = _step2.value;

          this.deletePoint(id);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }

    /**
     * Add new points to the area.
     *
     * @param {Array<Object>} points - New points to add to the view.
     */

  }, {
    key: 'addPoints',
    value: function addPoints(points) {
      var _this2 = this;

      points.forEach(function (point) {
        return _this2.addPoint(point);
      });
    }

    /**
     * Add a new point to the area.
     *
     * @param {Object} point - New point to add to the view.
     */

  }, {
    key: 'addPoint',
    value: function addPoint(point) {
      var $shape = this.renderPoint(point);
      this.$svg.appendChild($shape);
      this._renderedPoints.set(point.id, $shape);
      // map for easier retrieving of the point
      this.shapePointMap.set($shape, point);
    }

    /**
     * Update a point.
     *
     * @param {Object} point - Point to update.
     */

  }, {
    key: 'updatePoint',
    value: function updatePoint(point) {
      var $shape = this._renderedPoints.get(point.id);
      this.renderPoint(point, $shape);
    }

    /**
     * Delete a point.
     *
     * @param {String|Number} id - Id of the point to delete.
     */

  }, {
    key: 'deletePoint',
    value: function deletePoint(id) {
      var $shape = this._renderedPoints.get(id);
      this.$svg.removeChild($shape);
      this._renderedPoints.delete(id);
      // map for easier retrieving of the point
      this.shapePointMap.delete($shape);
    }
  }]);
  return SpaceView;
}(_View3.default);

exports.default = SpaceView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNwYWNlVmlldy5qcyJdLCJuYW1lcyI6WyJzdmdUZW1wbGF0ZSIsIm5zIiwiU3BhY2VWaWV3IiwidGVtcGxhdGUiLCJjb250ZW50IiwiZXZlbnRzIiwib3B0aW9ucyIsImNsYXNzTmFtZSIsImFyZWEiLCJhcmVhV2lkdGgiLCJhcmVhSGVpZ2h0Iiwic2hhcGVQb2ludE1hcCIsInNoYXBlTGluZU1hcCIsIl9yZW5kZXJlZFBvaW50cyIsIl9yZW5kZXJlZExpbmVzIiwiJHN2Z0NvbnRhaW5lciIsIiRlbCIsInF1ZXJ5U2VsZWN0b3IiLCIkc3ZnIiwiYWRkRGVmaW5pdGlvbnMiLCJyZW5kZXJBcmVhIiwidmlld3BvcnRXaWR0aCIsInZpZXdwb3J0SGVpZ2h0Iiwib3JpZW50YXRpb24iLCJwYXJlbnRWaWV3Iiwic3R5bGUiLCJ3aWR0aCIsImhlaWdodCIsIiRkZWZzIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50TlMiLCJtYXJrZXJBcnJvdyIsImlubmVySFRNTCIsImluc2VydEJlZm9yZSIsImZpcnN0Q2hpbGQiLCJib3VuZGluZ1JlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJjb250YWluZXJXaWR0aCIsImNvbnRhaW5lckhlaWdodCIsInJhdGlvIiwiTWF0aCIsIm1pbiIsInN2Z1dpZHRoIiwic3ZnSGVpZ2h0IiwidG9wIiwibGVmdCIsInNldEF0dHJpYnV0ZSIsInBvc2l0aW9uIiwiYmFja2dyb3VuZCIsImJhY2tncm91bmRJbWFnZSIsImJhY2tncm91bmRQb3NpdGlvbiIsImJhY2tncm91bmRSZXBlYXQiLCJiYWNrZ3JvdW5kU2l6ZSIsImJhY2tncm91bmRDb2xvciIsIiRzaGFwZSIsInBvaW50IiwidXBkYXRlUG9pbnQiLCJjbGFzc0xpc3QiLCJhZGQiLCJpZCIsIngiLCJ5IiwicmFkaXVzIiwiY29sb3IiLCJmaWxsIiwibWV0aG9kIiwic2VsZWN0ZWQiLCJwb2ludHMiLCJjbGVhclBvaW50cyIsImFkZFBvaW50cyIsImtleXMiLCJkZWxldGVQb2ludCIsImZvckVhY2giLCJhZGRQb2ludCIsInJlbmRlclBvaW50IiwiYXBwZW5kQ2hpbGQiLCJzZXQiLCJnZXQiLCJyZW1vdmVDaGlsZCIsImRlbGV0ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7Ozs7QUFFQSxJQUFNQSxvRUFBTjs7QUFLQSxJQUFNQyxLQUFLLDRCQUFYOztBQUVBOzs7Ozs7Ozs7Ozs7OztJQWFNQyxTOzs7QUFDSix1QkFBNkU7QUFBQSxRQUFqRUMsUUFBaUUsdUVBQXRESCxXQUFzRDtBQUFBLFFBQXpDSSxPQUF5Qyx1RUFBL0IsRUFBK0I7QUFBQSxRQUEzQkMsTUFBMkIsdUVBQWxCLEVBQWtCO0FBQUEsUUFBZEMsT0FBYyx1RUFBSixFQUFJO0FBQUE7O0FBQzNFQSxjQUFVLHNCQUFjLEVBQUVDLFdBQVcsT0FBYixFQUFkLEVBQXNDRCxPQUF0QyxDQUFWOztBQUdBOzs7Ozs7Ozs7Ozs7QUFKMkUsNElBRXJFSCxRQUZxRSxFQUUzREMsT0FGMkQsRUFFbERDLE1BRmtELEVBRTFDQyxPQUYwQzs7QUFnQjNFLFVBQUtFLElBQUwsR0FBWSxJQUFaOztBQUVBOzs7Ozs7OztBQVFBLFVBQUtDLFNBQUwsR0FBaUIsSUFBakI7O0FBRUE7Ozs7Ozs7O0FBUUEsVUFBS0MsVUFBTCxHQUFrQixJQUFsQjs7QUFFQTs7Ozs7Ozs7QUFRQSxVQUFLQyxhQUFMLEdBQXFCLG1CQUFyQjs7QUFFQTs7Ozs7QUFLQSxVQUFLQyxZQUFMLEdBQW9CLG1CQUFwQjs7QUFFQSxVQUFLQyxlQUFMLEdBQXVCLG1CQUF2QjtBQUNBLFVBQUtDLGNBQUwsR0FBc0IsbUJBQXRCO0FBeEQyRTtBQXlENUU7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7OzRCQVVRTixJLEVBQU07QUFDWixXQUFLQSxJQUFMLEdBQVlBLElBQVo7QUFDRDs7QUFFRDs7OzsrQkFDVztBQUNULFdBQUtPLGFBQUwsR0FBcUIsS0FBS0MsR0FBTCxDQUFTQyxhQUFULENBQXVCLGdCQUF2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OztnQ0FLWUssRSxFQUFJO0FBQ2QsVUFBTUwsU0FBUyxLQUFLekMsZUFBTCxDQUFxQmdFLEdBQXJCLENBQXlCbEIsRUFBekIsQ0FBZjtBQUNBLFdBQUt6QyxJQUFMLENBQVU0RCxXQUFWLENBQXNCeEIsTUFBdEI7QUFDQSxXQUFLekMsZUFBTCxDQUFxQmtFLE1BQXJCLENBQTRCcEIsRUFBNUI7QUFDQTtBQUNBLFdBQUtoRCxhQUFMLENBQW1Cb0UsTUFBbkIsQ0FBMEJ6QixNQUExQjtBQUNEOzs7OztrQkFHWXBELFMiLCJmaWxlIjoiU3BhY2VWaWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFZpZXcgZnJvbSAnLi9WaWV3JztcblxuY29uc3Qgc3ZnVGVtcGxhdGUgPSBgXG48ZGl2IGNsYXNzPVwic3ZnLWNvbnRhaW5lclwiPlxuICA8c3ZnPjwvc3ZnPlxuPC9kaXY+YDtcblxuY29uc3QgbnMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuXG4vKipcbiAqIEEgdmlldyB0aGF0IHJlbmRlciBhbiBgYXJlYWAgb2JqZWN0IChhcyBkZWZpbmVkIGluIHNlcnZlciBjb25maWd1cmF0aW9uKS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdGVtcGxhdGUgLSBUZW1wbGF0ZSBvZiB0aGUgdmlldy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZW50IC0gT2JqZWN0IGNvbnRhaW5pbmcgdGhlIHZhcmlhYmxlcyB1c2VkIHRvIHBvcHVsYXRlXG4gKiAgdGhlIHRlbXBsYXRlLiB7QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlZpZXcjY29udGVudH0uXG4gKiBAcGFyYW0ge09iamVjdH0gZXZlbnRzIC0gTGlzdGVuZXJzIHRvIGluc3RhbGwgaW4gdGhlIHZpZXdcbiAqICB7QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlZpZXcjZXZlbnRzfS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3B0aW9ucyBvZiB0aGUgdmlldy5cbiAqICB7QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlZpZXcjb3B0aW9uc30uXG4gKlxuICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudFxuICovXG5jbGFzcyBTcGFjZVZpZXcgZXh0ZW5kcyBWaWV3IHtcbiAgY29uc3RydWN0b3IodGVtcGxhdGUgPSBzdmdUZW1wbGF0ZSwgY29udGVudCA9IHt9LCBldmVudHMgPSB7fSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oeyBjbGFzc05hbWU6ICdzcGFjZScgfSwgb3B0aW9ucyk7XG4gICAgc3VwZXIodGVtcGxhdGUsIGNvbnRlbnQsIGV2ZW50cywgb3B0aW9ucyk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYXJlYSB0byBkaXNwbGF5LlxuICAgICAqXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAcHJvcGVydHkge051bWJlcn0gYXJlYS53aWR0aCAtIFdpZHRoIG9mIHRoZSBhcmVhLlxuICAgICAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBhcmVhLmhlaWdodCAtIEhlaWdodCBvZiB0aGUgYXJlYS5cbiAgICAgKiBAcHJvcGVydHkge1N0cmluZ30gYXJlYS5iYWNrZ3JvdW5kIC0gT3B0aW9ubmFsIGJhY2tncm91bmQgaW1hZ2UgdG9cbiAgICAgKiAgZGlzcGxheSBpbiBiYWNrZ3JvdW5kLlxuICAgICAqIEBuYW1lIGFyZWFcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlNwYWNlVmlld1xuICAgICAqL1xuICAgIHRoaXMuYXJlYSA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBXaWR0aCBvZiB0aGUgcmVuZGVyZWQgYXJlYSBpbiBwaXhlbHMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIGFyZWFXaWR0aFxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuU3BhY2VWaWV3XG4gICAgICovXG4gICAgdGhpcy5hcmVhV2lkdGggPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogSGVpZ2h0IG9mIHRoZSByZW5kZXJlZCBhcmVhIGluIHBpeGVscy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgYXJlYUhlaWdodFxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuU3BhY2VWaWV3XG4gICAgICovXG4gICAgdGhpcy5hcmVhSGVpZ2h0ID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIE1hcCBhc3NvY2lhdGluZyBgJHNoYXBlc2AgYW5kIHRoZWlyIHJlbGF0aXZlIGBwb2ludGAgb2JqZWN0LlxuICAgICAqXG4gICAgICogQHR5cGUge01hcH1cbiAgICAgKiBAbmFtZSBzaGFwZVBvaW50TWFwXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5TcGFjZVZpZXdcbiAgICAgKi9cbiAgICB0aGlzLnNoYXBlUG9pbnRNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBFeHBvc2UgYSBNYXAgb2YgdGhlICRzaGFwZXMgYW5kIHRoZWlyIHJlbGF0aXZlIGxpbmUgb2JqZWN0LlxuICAgICAqIEB0eXBlIHtNYXB9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnNoYXBlTGluZU1hcCA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuX3JlbmRlcmVkUG9pbnRzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3JlbmRlcmVkTGluZXMgPSBuZXcgTWFwKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBgYXJlYWAgdG8gYmUgcmVuZGVyZXJlZC5cbiAgICpcbiAgICogQHR5cGUge09iamVjdH0gYXJlYSAtIE9iamVjdCBkZXNjcmliaW5nIHRoZSBhcmVhLCBnZW5lcmFsbHkgZGVmaW5lZCBpblxuICAgKiAgc2VydmVyIGNvbmZpZ3VyYXRpb24uXG4gICAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBhcmVhLndpZHRoIC0gV2lkdGggb2YgdGhlIGFyZWEuXG4gICAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBhcmVhLmhlaWdodCAtIEhlaWdodCBvZiB0aGUgYXJlYS5cbiAgICogQHByb3BlcnR5IHtTdHJpbmd9IGFyZWEuYmFja2dyb3VuZCAtIE9wdGlvbm5hbCBiYWNrZ3JvdW5kIGltYWdlIHRvXG4gICAgICogIGRpc3BsYXkgaW4gYmFja2dyb3VuZC5cbiAgICovXG4gIHNldEFyZWEoYXJlYSkge1xuICAgIHRoaXMuYXJlYSA9IGFyZWE7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgb25SZW5kZXIoKSB7XG4gICAgdGhpcy4kc3ZnQ29udGFpbmVyID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLnN2Zy1jb250YWluZXInKTtcbiAgICB0aGlzLiRzdmcgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCdzdmcnKTtcbiAgICB0aGlzLmFkZERlZmluaXRpb25zKCk7XG4gICAgdGhpcy5yZW5kZXJBcmVhKCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgb25SZXNpemUodmlld3BvcnRXaWR0aCwgdmlld3BvcnRIZWlnaHQsIG9yaWVudGF0aW9uKSB7XG4gICAgc3VwZXIub25SZXNpemUodmlld3BvcnRXaWR0aCwgdmlld3BvcnRIZWlnaHQsIG9yaWVudGF0aW9uKTtcbiAgICAvLyBvdmVycmlkZSBzaXplIHRvIG1hdGNoIHBhcmVudCBzaXplIGlmIGNvbXBvbmVudCBvZiBhbm90aGVyIHZpZXdcbiAgICBpZiAodGhpcy5wYXJlbnRWaWV3KSB7XG4gICAgICB0aGlzLiRlbC5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICAgIHRoaXMuJGVsLnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICB9XG5cbiAgICB0aGlzLnJlbmRlckFyZWEoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgc3ZnIGRlZmluaXRpb25zLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYWRkRGVmaW5pdGlvbnMoKSB7XG4gICAgdGhpcy4kZGVmcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgJ2RlZnMnKTtcblxuICAgIGNvbnN0IG1hcmtlckFycm93ID0gYFxuICAgICAgPG1hcmtlciBpZD1cIm1hcmtlci1hcnJvd1wiIG1hcmtlcldpZHRoPVwiMTBcIiBtYXJrZXJIZWlnaHQ9XCIxMFwiIHJlZlg9XCI1XCIgcmVmWT1cIjVcIiBvcmllbnQ9XCJhdXRvXCI+XG4gICAgICAgICAgPHBhdGggZD1cIk0wLDAgTDAsMTAgTDEwLDUgTDAsMFwiIGNsYXNzPVwibWFya2VyLWFycm93XCIgLz5cbiAgICAgIDwvbWFya2VyPlxuICAgIGA7XG5cbiAgICB0aGlzLiRkZWZzLmlubmVySFRNTCA9IG1hcmtlckFycm93O1xuICAgIHRoaXMuJHN2Zy5pbnNlcnRCZWZvcmUodGhpcy4kZGVmcywgdGhpcy4kc3ZnLmZpcnN0Q2hpbGQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgZGlzcGxheWVkIGFyZWEsIGFjY29yZGluZyB0byBjaGFuZ2VzIGluIGBhcmVhYCBkZWZpbml0aW9uIG9yXG4gICAqIGlmIGEgYHJlc2l6ZWAgZXZlbnQgaGFzIGJlZW4gdHJpZ2VycmVkLlxuICAgKi9cbiAgcmVuZGVyQXJlYSgpIHtcbiAgICBjb25zdCBhcmVhID0gdGhpcy5hcmVhO1xuICAgIC8vIHVzZSBgdGhpcy4kZWxgIHNpemUgaW5zdGVhZCBvZiBgdGhpcy4kcGFyZW50YCBzaXplIHRvIGlnbm9yZSBwYXJlbnQgcGFkZGluZ1xuICAgIGNvbnN0IGJvdW5kaW5nUmVjdCA9IHRoaXMuJGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IGNvbnRhaW5lcldpZHRoID0gYm91bmRpbmdSZWN0LndpZHRoO1xuICAgIGNvbnN0IGNvbnRhaW5lckhlaWdodCA9IGJvdW5kaW5nUmVjdC5oZWlnaHQ7XG5cbiAgICB0aGlzLnJhdGlvID0gTWF0aC5taW4oY29udGFpbmVyV2lkdGggLyBhcmVhLndpZHRoLCBjb250YWluZXJIZWlnaHQgLyBhcmVhLmhlaWdodCk7XG4gICAgY29uc3Qgc3ZnV2lkdGggPSBhcmVhLndpZHRoICogdGhpcy5yYXRpbztcbiAgICBjb25zdCBzdmdIZWlnaHQgPSBhcmVhLmhlaWdodCAqIHRoaXMucmF0aW87XG5cbiAgICBjb25zdCB0b3AgPSAoY29udGFpbmVySGVpZ2h0IC0gc3ZnSGVpZ2h0KSAvIDI7XG4gICAgY29uc3QgbGVmdCA9IChjb250YWluZXJXaWR0aCAtIHN2Z1dpZHRoKSAvIDI7XG5cbiAgICB0aGlzLiRzdmdDb250YWluZXIuc3R5bGUud2lkdGggPSBzdmdXaWR0aCArICdweCc7XG4gICAgdGhpcy4kc3ZnQ29udGFpbmVyLnN0eWxlLmhlaWdodCA9IHN2Z0hlaWdodCArICdweCc7XG4gICAgdGhpcy4kc3ZnLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBzdmdXaWR0aCk7XG4gICAgdGhpcy4kc3ZnLnNldEF0dHJpYnV0ZSgnaGVpZ2h0Jywgc3ZnSGVpZ2h0KTtcbiAgICAvLyBjZW50ZXIgdGhlIHN2ZyBpbnRvIHRoZSBwYXJlbnRcbiAgICB0aGlzLiRzdmdDb250YWluZXIuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIHRoaXMuJHN2Z0NvbnRhaW5lci5zdHlsZS50b3AgPSBgJHt0b3B9cHhgO1xuICAgIHRoaXMuJHN2Z0NvbnRhaW5lci5zdHlsZS5sZWZ0ID0gYCR7bGVmdH1weGA7XG5cbiAgICB0aGlzLiRzdmcuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIHRoaXMuJHN2Zy5zdHlsZS50b3AgPSBgMHB4YDtcbiAgICB0aGlzLiRzdmcuc3R5bGUubGVmdCA9IGAwcHhgO1xuXG4gICAgLy8gZGlzcGxheSBiYWNrZ3JvdW5kIGlmIGFueVxuICAgIGlmIChhcmVhLmJhY2tncm91bmQpIHtcbiAgICAgIHRoaXMuJGVsLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IGB1cmwoJHthcmVhLmJhY2tncm91bmR9KWA7XG4gICAgICB0aGlzLiRlbC5zdHlsZS5iYWNrZ3JvdW5kUG9zaXRpb24gPSAnNTAlIDUwJSc7XG4gICAgICB0aGlzLiRlbC5zdHlsZS5iYWNrZ3JvdW5kUmVwZWF0ID0gJ25vLXJlcGVhdCc7XG4gICAgICB0aGlzLiRlbC5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9ICdjb250YWluJztcbiAgICAgIC8vIGZvcmNlICRzdmcgdG8gYmUgdHJhbnNwYXJlbnRcbiAgICAgIHRoaXMuJHN2Zy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnO1xuICAgIH1cblxuICAgIC8vIHVwZGF0ZSBleGlzdGluZyBwb2ludHMgcG9zaXRpb25cbiAgICBmb3IgKGxldCBbJHNoYXBlLCBwb2ludF0gb2YgdGhpcy5zaGFwZVBvaW50TWFwKVxuICAgICAgdGhpcy51cGRhdGVQb2ludChwb2ludCk7XG5cbiAgICAvLyBleHBvc2UgdGhlIHNpemUgb2YgdGhlIGFyZWEgaW4gcGl4ZWxcbiAgICB0aGlzLmFyZWFXaWR0aCA9IHN2Z1dpZHRoO1xuICAgIHRoaXMuYXJlYUhlaWdodCA9IHN2Z0hlaWdodDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgdXNlZCB0byByZW5kZXIgYSBzcGVjaWZpYyBwb2ludC4gT3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gZGlzcGxheVxuICAgKiBwb2ludHMgd2l0aCB1c2VyIGRlZmluZWQgc2hhcGVzLiBUaGUgc2hhcGUgcmV0dXJuZWQgYnkgdGhpcyBtZXRob2QgaXNcbiAgICogaW5zZXJ0ZWQgaW50byB0aGUgYHN2Z2AgZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHBvaW50IC0gUG9pbnQgdG8gcmVuZGVyLlxuICAgKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IHBvaW50LmlkIC0gVW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoZSBwb2ludC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvaW50LnggLSBWYWx1ZSBpbiB0aGUgeCBheGlzIGluIHRoZSBhcmVhIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9pbnQueSAtIFZhbHVlIGluIHRoZSB5IGF4aXMgaW4gdGhlIGFyZWEgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbcG9pbnQucmFkaXVzPTAuM10gLSBSYWRpdXMgb2YgdGhlIHBvaW50IChyZWxhdGl2ZSB0byB0aGVcbiAgICogIGFyZWEgd2lkdGggYW5kIGhlaWdodCkuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbcG9pbnQuY29sb3I9dW5kZWZpbmVkXSAtIE9wdGlvbm5hbCBjb2xvciBvZiB0aGUgcG9pbnQuXG4gICAqL1xuICByZW5kZXJQb2ludChwb2ludCwgJHNoYXBlID0gbnVsbCkge1xuICAgIGlmICgkc2hhcGUgPT09IG51bGwpIHtcbiAgICAgICRzaGFwZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgJ2NpcmNsZScpO1xuICAgICAgJHNoYXBlLmNsYXNzTGlzdC5hZGQoJ3BvaW50Jyk7XG4gICAgfVxuXG4gICAgJHNoYXBlLnNldEF0dHJpYnV0ZSgnZGF0YS1pZCcsIHBvaW50LmlkKTtcbiAgICAkc2hhcGUuc2V0QXR0cmlidXRlKCdjeCcsIGAke3BvaW50LnggKiB0aGlzLnJhdGlvfWApO1xuICAgICRzaGFwZS5zZXRBdHRyaWJ1dGUoJ2N5JywgYCR7cG9pbnQueSAqIHRoaXMucmF0aW99YCk7XG4gICAgJHNoYXBlLnNldEF0dHJpYnV0ZSgncicsIHBvaW50LnJhZGl1cyB8fMKgOCk7IC8vIHJhZGl1cyBpcyByZWxhdGl2ZSB0byBhcmVhIHNpemVcblxuICAgIGlmIChwb2ludC5jb2xvcilcbiAgICAgICRzaGFwZS5zdHlsZS5maWxsID0gcG9pbnQuY29sb3I7XG5cbiAgICBjb25zdCBtZXRob2QgPSBwb2ludC5zZWxlY3RlZCA/ICdhZGQnIDogJ3JlbW92ZSc7XG4gICAgJHNoYXBlLmNsYXNzTGlzdFttZXRob2RdKCdzZWxlY3RlZCcpO1xuXG4gICAgcmV0dXJuICRzaGFwZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlIGFsbCB0aGUgZXhpc3RpbmcgcG9pbnRzIHdpdGggdGhlIGdpdmVuIGFycmF5IG9mIHBvaW50cy5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheTxPYmplY3Q+fSBwb2ludHMgLSBQb2ludHMgdG8gcmVuZGVyLlxuICAgKi9cbiAgc2V0UG9pbnRzKHBvaW50cykge1xuICAgIHRoaXMuY2xlYXJQb2ludHMoKTtcbiAgICB0aGlzLmFkZFBvaW50cyhwb2ludHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZSBhbGwgcG9pbnRzLlxuICAgKi9cbiAgY2xlYXJQb2ludHMoKSB7XG4gICAgZm9yIChsZXQgaWQgb2YgdGhpcy5fcmVuZGVyZWRQb2ludHMua2V5cygpKVxuICAgICAgdGhpcy5kZWxldGVQb2ludChpZCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIG5ldyBwb2ludHMgdG8gdGhlIGFyZWEuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0Pn0gcG9pbnRzIC0gTmV3IHBvaW50cyB0byBhZGQgdG8gdGhlIHZpZXcuXG4gICAqL1xuICBhZGRQb2ludHMocG9pbnRzKSB7XG4gICAgcG9pbnRzLmZvckVhY2gocG9pbnQgPT4gdGhpcy5hZGRQb2ludChwb2ludCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIG5ldyBwb2ludCB0byB0aGUgYXJlYS5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHBvaW50IC0gTmV3IHBvaW50IHRvIGFkZCB0byB0aGUgdmlldy5cbiAgICovXG4gIGFkZFBvaW50KHBvaW50KSB7XG4gICAgY29uc3QgJHNoYXBlID0gdGhpcy5yZW5kZXJQb2ludChwb2ludCk7XG4gICAgdGhpcy4kc3ZnLmFwcGVuZENoaWxkKCRzaGFwZSk7XG4gICAgdGhpcy5fcmVuZGVyZWRQb2ludHMuc2V0KHBvaW50LmlkLCAkc2hhcGUpO1xuICAgIC8vIG1hcCBmb3IgZWFzaWVyIHJldHJpZXZpbmcgb2YgdGhlIHBvaW50XG4gICAgdGhpcy5zaGFwZVBvaW50TWFwLnNldCgkc2hhcGUsIHBvaW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgYSBwb2ludC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHBvaW50IC0gUG9pbnQgdG8gdXBkYXRlLlxuICAgKi9cbiAgdXBkYXRlUG9pbnQocG9pbnQpIHtcbiAgICBjb25zdCAkc2hhcGUgPSB0aGlzLl9yZW5kZXJlZFBvaW50cy5nZXQocG9pbnQuaWQpO1xuICAgIHRoaXMucmVuZGVyUG9pbnQocG9pbnQsICRzaGFwZSk7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlIGEgcG9pbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gaWQgLSBJZCBvZiB0aGUgcG9pbnQgdG8gZGVsZXRlLlxuICAgKi9cbiAgZGVsZXRlUG9pbnQoaWQpIHtcbiAgICBjb25zdCAkc2hhcGUgPSB0aGlzLl9yZW5kZXJlZFBvaW50cy5nZXQoaWQpO1xuICAgIHRoaXMuJHN2Zy5yZW1vdmVDaGlsZCgkc2hhcGUpO1xuICAgIHRoaXMuX3JlbmRlcmVkUG9pbnRzLmRlbGV0ZShpZCk7XG4gICAgLy8gbWFwIGZvciBlYXNpZXIgcmV0cmlldmluZyBvZiB0aGUgcG9pbnRcbiAgICB0aGlzLnNoYXBlUG9pbnRNYXAuZGVsZXRlKCRzaGFwZSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU3BhY2VWaWV3O1xuIl19