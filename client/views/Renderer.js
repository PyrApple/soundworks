"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base class to extend in order to be used in conjonction with a
 * [`CanvasView`]{@link module:soundworks/client.CanvasView}. These classes
 * provide altogether a clean way to manage the `update` and `render` cycles
 * of an animation.
 *
 * @param {Number} [updatePeriod=0] - Logical time (in _second_) between
 *  each subsequent updates. If `0`, the update period is slaved on the
 *  `requestAnimationFrame` period (which is appriopriate for most of the
 *  use-cases).
 *
 * @memberof module:soundworks/client
 * @see {@link module:soundworks/client.CanvasView}
 */
var Renderer = function () {
  function Renderer() {
    var updatePeriod = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    (0, _classCallCheck3.default)(this, Renderer);

    this.updatePeriod = updatePeriod;

    /**
     * Current (logical) time of the renderer.
     *
     * @type {Number}
     * @name currentTime
     * @instance
     * @memberof module:soundworks/client.Renderer
     * @readonly
     */
    this.currentTime = null;

    /**
     * Current width of the canvas.
     *
     * @type {Number}
     * @name canvasWidth
     * @instance
     * @memberof module:soundworks/client.Renderer
     * @readonly
     */
    this.canvasWidth = 0;

    /**
     * Current height of the canvas.
     *
     * @type {Number}
     * @name canvasHeight
     * @instance
     * @memberof module:soundworks/client.Renderer
     * @readonly
     */
    this.canvasHeight = 0;

    /**
     * Orientation of the canvas.
     *
     * @type {String}
     * @name orientation
     * @instance
     * @memberof module:soundworks/client.Renderer
     * @readonly
     */
    this.orientation = null;
  }

  /** @private */


  (0, _createClass3.default)(Renderer, [{
    key: "onResize",
    value: function onResize(canvasWidth, canvasHeight, orientation) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.orientation = orientation;
    }

    /**
     * Interface method called when the instance is added to a `CanvasView`.
     * `this.canvasWidth` and `this.canvasHeight` should be available at this
     * point.
     */

  }, {
    key: "init",
    value: function init() {}

    /**
     * Interface method that should host the code that updates the properties
     * of the renderer (physics, etc.)
     *
     * @param {Number} dt - Logical time since the last update. If
     *  `this.updatePeriod` is equal to zero 0, `dt` is the elasped time since
     *  the last render.
     */

  }, {
    key: "update",
    value: function update(dt) {}

    /**
     * Interface method that should host the code that draw into the canvas.
     *
     * @param {CanvasRenderingContext2D} ctx - 2d context of the canvas.
     */

  }, {
    key: "render",
    value: function render(ctx) {}
  }]);
  return Renderer;
}();

exports.default = Renderer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbmRlcmVyLmpzIl0sIm5hbWVzIjpbIlJlbmRlcmVyIiwidXBkYXRlUGVyaW9kIiwiY3VycmVudFRpbWUiLCJjYW52YXNXaWR0aCIsImNhbnZhc0hlaWdodCIsIm9yaWVudGF0aW9uIiwiZHQiLCJjdHgiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7SUFjTUEsUTtBQUNKLHNCQUE4QjtBQUFBLFFBQWxCQyxZQUFrQix1RUFBSCxDQUFHO0FBQUE7O0FBQzVCLFNBQUtBLFlBQUwsR0FBb0JBLFlBQXBCOztBQUVBOzs7Ozs7Ozs7QUFTQSxTQUFLQyxXQUFMLEdBQW1CLElBQW5COztBQUVBOzs7Ozs7Ozs7QUFTQSxTQUFLQyxXQUFMLEdBQW1CLENBQW5COztBQUVBOzs7Ozs7Ozs7QUFTQSxTQUFLQyxZQUFMLEdBQW9CLENBQXBCOztBQUVBOzs7Ozs7Ozs7QUFTQSxTQUFLQyxXQUFMLEdBQW1CLElBQW5CO0FBQ0Q7O0FBRUQ7Ozs7OzZCQUNTRixXLEVBQWFDLFksRUFBY0MsVyxFQUFhO0FBQy9DLFdBQUtGLFdBQUwsR0FBbUJBLFdBQW5CO0FBQ0EsV0FBS0MsWUFBTCxHQUFvQkEsWUFBcEI7QUFDQSxXQUFLQyxXQUFMLEdBQW1CQSxXQUFuQjtBQUNEOztBQUVEOzs7Ozs7OzsyQkFLTyxDQUFFOztBQUVUOzs7Ozs7Ozs7OzsyQkFRT0MsRSxFQUFJLENBQUU7O0FBRWI7Ozs7Ozs7OzJCQUtPQyxHLEVBQUssQ0FBRTs7Ozs7a0JBR0RQLFEiLCJmaWxlIjoiUmVuZGVyZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEJhc2UgY2xhc3MgdG8gZXh0ZW5kIGluIG9yZGVyIHRvIGJlIHVzZWQgaW4gY29uam9uY3Rpb24gd2l0aCBhXG4gKiBbYENhbnZhc1ZpZXdgXXtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuQ2FudmFzVmlld30uIFRoZXNlIGNsYXNzZXNcbiAqIHByb3ZpZGUgYWx0b2dldGhlciBhIGNsZWFuIHdheSB0byBtYW5hZ2UgdGhlIGB1cGRhdGVgIGFuZCBgcmVuZGVyYCBjeWNsZXNcbiAqIG9mIGFuIGFuaW1hdGlvbi5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW3VwZGF0ZVBlcmlvZD0wXSAtIExvZ2ljYWwgdGltZSAoaW4gX3NlY29uZF8pIGJldHdlZW5cbiAqICBlYWNoIHN1YnNlcXVlbnQgdXBkYXRlcy4gSWYgYDBgLCB0aGUgdXBkYXRlIHBlcmlvZCBpcyBzbGF2ZWQgb24gdGhlXG4gKiAgYHJlcXVlc3RBbmltYXRpb25GcmFtZWAgcGVyaW9kICh3aGljaCBpcyBhcHByaW9wcmlhdGUgZm9yIG1vc3Qgb2YgdGhlXG4gKiAgdXNlLWNhc2VzKS5cbiAqXG4gKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50XG4gKiBAc2VlIHtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuQ2FudmFzVmlld31cbiAqL1xuY2xhc3MgUmVuZGVyZXIge1xuICBjb25zdHJ1Y3Rvcih1cGRhdGVQZXJpb2QgPSAwKSB7XG4gICAgdGhpcy51cGRhdGVQZXJpb2QgPSB1cGRhdGVQZXJpb2Q7XG5cbiAgICAvKipcbiAgICAgKiBDdXJyZW50IChsb2dpY2FsKSB0aW1lIG9mIHRoZSByZW5kZXJlci5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgY3VycmVudFRpbWVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlJlbmRlcmVyXG4gICAgICogQHJlYWRvbmx5XG4gICAgICovXG4gICAgdGhpcy5jdXJyZW50VGltZSA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBDdXJyZW50IHdpZHRoIG9mIHRoZSBjYW52YXMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIGNhbnZhc1dpZHRoXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5SZW5kZXJlclxuICAgICAqIEByZWFkb25seVxuICAgICAqL1xuICAgIHRoaXMuY2FudmFzV2lkdGggPSAwO1xuXG4gICAgLyoqXG4gICAgICogQ3VycmVudCBoZWlnaHQgb2YgdGhlIGNhbnZhcy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgY2FudmFzSGVpZ2h0XG4gICAgICogQGluc3RhbmNlXG4gICAgICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5SZW5kZXJlclxuICAgICAqIEByZWFkb25seVxuICAgICAqL1xuICAgIHRoaXMuY2FudmFzSGVpZ2h0ID0gMDtcblxuICAgIC8qKlxuICAgICAqIE9yaWVudGF0aW9uIG9mIHRoZSBjYW52YXMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqIEBuYW1lIG9yaWVudGF0aW9uXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5SZW5kZXJlclxuICAgICAqIEByZWFkb25seVxuICAgICAqL1xuICAgIHRoaXMub3JpZW50YXRpb24gPSBudWxsO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIG9uUmVzaXplKGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQsIG9yaWVudGF0aW9uKSB7XG4gICAgdGhpcy5jYW52YXNXaWR0aCA9IGNhbnZhc1dpZHRoO1xuICAgIHRoaXMuY2FudmFzSGVpZ2h0ID0gY2FudmFzSGVpZ2h0O1xuICAgIHRoaXMub3JpZW50YXRpb24gPSBvcmllbnRhdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnRlcmZhY2UgbWV0aG9kIGNhbGxlZCB3aGVuIHRoZSBpbnN0YW5jZSBpcyBhZGRlZCB0byBhIGBDYW52YXNWaWV3YC5cbiAgICogYHRoaXMuY2FudmFzV2lkdGhgIGFuZCBgdGhpcy5jYW52YXNIZWlnaHRgIHNob3VsZCBiZSBhdmFpbGFibGUgYXQgdGhpc1xuICAgKiBwb2ludC5cbiAgICovXG4gIGluaXQoKSB7fVxuXG4gIC8qKlxuICAgKiBJbnRlcmZhY2UgbWV0aG9kIHRoYXQgc2hvdWxkIGhvc3QgdGhlIGNvZGUgdGhhdCB1cGRhdGVzIHRoZSBwcm9wZXJ0aWVzXG4gICAqIG9mIHRoZSByZW5kZXJlciAocGh5c2ljcywgZXRjLilcbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGR0IC0gTG9naWNhbCB0aW1lIHNpbmNlIHRoZSBsYXN0IHVwZGF0ZS4gSWZcbiAgICogIGB0aGlzLnVwZGF0ZVBlcmlvZGAgaXMgZXF1YWwgdG8gemVybyAwLCBgZHRgIGlzIHRoZSBlbGFzcGVkIHRpbWUgc2luY2VcbiAgICogIHRoZSBsYXN0IHJlbmRlci5cbiAgICovXG4gIHVwZGF0ZShkdCkge31cblxuICAvKipcbiAgICogSW50ZXJmYWNlIG1ldGhvZCB0aGF0IHNob3VsZCBob3N0IHRoZSBjb2RlIHRoYXQgZHJhdyBpbnRvIHRoZSBjYW52YXMuXG4gICAqXG4gICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggLSAyZCBjb250ZXh0IG9mIHRoZSBjYW52YXMuXG4gICAqL1xuICByZW5kZXIoY3R4KSB7fVxufVxuXG5leHBvcnQgZGVmYXVsdCBSZW5kZXJlcjtcbiJdfQ==