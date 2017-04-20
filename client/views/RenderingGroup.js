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
 * Rendering loop handling the `requestAnimationFrame` and the `update` /
 * `render` cycles.
 *
 * @private
 */
var loop = {
  renderingGroups: [],

  _isRunning: false,

  /**
   * @return {Number} - Current time in seconds.
   */
  getTime: function getTime() {
    return 0.001 * (window.performance && window.performance.now ? window.performance.now() : new Date().getTime());
  },


  /**
   * Start the rendering loop if not started.
   */
  requireStart: function requireStart() {
    if (this._isRunning) {
      return;
    }
    this._isRunning = true;
    this.lastRenderTime = this.getTime();

    (function (self) {
      function loop() {
        var time = self.getTime();
        var dt = time - self.lastRenderTime;
        var renderingGroups = self.renderingGroups;

        for (var i = 0, l = renderingGroups.length; i < l; i++) {
          var group = renderingGroups[i];
          // let the group handle the updatePeriod of each renderer
          group.update(time, dt);
          group.render(dt); // forward `dt` for `preRender` method
        }

        self.lastRenderTime = time;
        self.rAFid = requestAnimationFrame(loop);
      }

      self.rAFid = requestAnimationFrame(loop);
    })(this);
  },


  /**
   * Stop the loop if no renderer are still present. If not abort.
   */
  requireStop: function requireStop() {
    // @todo - handle several parallel groups
    var shouldStop = true;

    for (var i = 0, l = this.renderingGroups.length; i < l; i++) {
      if (this.renderingGroups[i].renderers.length > 0) {
        shouldStop = false;
      }
    }

    if (shouldStop) {
      cancelAnimationFrame(this.rAFid);
      this._isRunning = false;
    }
  },


  /**
   * Add a rendering group to the loop.
   */
  registerRenderingGroup: function registerRenderingGroup(group) {
    this.renderingGroups.push(group);
  }
};

/**
 * Handle a group of renderers on a single full screen canvas.
 *
 * <span class="warning">This class is a property of
 * {@link module:soundworks/client.CanvasView} should be considered private.</span>
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context in which
 *  the renderer should draw.
 * @param {Boolean} [preservePixelRatio=false] - Define if the canvas should
 *  take account of the device pixel ratio for the drawing. When set to `true`,
 *  quality if favored over performance.
 *
 * @memberof module:soundworks/client
 */

var RenderingGroup = function () {
  function RenderingGroup(ctx) {
    var preservePixelRatio = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    (0, _classCallCheck3.default)(this, RenderingGroup);

    /**
     * 2d context of the canvas.
     *
     * @type {CanvasRenderingContext2D}
     * @name ctx
     * @instance
     * @memberof module:soundworks/client.RenderingGroup
     */
    this.ctx = ctx;

    /**
     * Stack of the registered renderers.
     *
     * @type {Array<module:soundworks/client.Renderer>}
     * @name renderers
     * @instance
     * @memberof module:soundworks/client.RenderingGroup
     */
    this.renderers = [];

    /**
     * Pixel ratio of the device, set to 1 if `false`.
     *
     * @type {Number}
     * @name pixelRatio
     * @instance
     * @memberof module:soundworks/client.RenderingGroup
     */
    this.pixelRatio = function (ctx) {
      var dPR = window.devicePixelRatio || 1;
      var bPR = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;

      return preservePixelRatio ? dPR / bPR : 1;
    }(this.ctx);

    // register the group into the loop
    loop.registerRenderingGroup(this);
  }

  /**
   * Updates the size of the canvas. Propagate new logical `width` and `height`
   * according to `this.pixelRatio` to all registered renderers.
   *
   * @param {Number} viewportWidth - Width of the viewport.
   * @param {Number} viewportHeight - Height of the viewport.
   * @param {Number} orientation - Orientation of the viewport.
   */


  (0, _createClass3.default)(RenderingGroup, [{
    key: "onResize",
    value: function onResize(viewportWidth, viewportHeight, orientation) {
      var ctx = this.ctx;
      var pixelRatio = this.pixelRatio;

      this.canvasWidth = viewportWidth * pixelRatio;
      this.canvasHeight = viewportHeight * pixelRatio;
      this.orientation = orientation;

      ctx.canvas.width = this.canvasWidth;
      ctx.canvas.height = this.canvasHeight;
      ctx.canvas.style.width = viewportWidth + "px";
      ctx.canvas.style.height = viewportHeight + "px";

      // propagate logical size to renderers
      for (var i = 0, l = this.renderers.length; i < l; i++) {
        this.renderers[i].onResize(this.canvasWidth, this.canvasHeight, orientation);
      }
    }

    /**
     * Entry point to apply global transformations to the canvas before each
     * renderer is rendered.
     *
     * @param {CanvasRenderingContext2D} ctx - Context of the canvas.
     * @param {Number} dt - Delta time in seconds since the last rendering
     *  loop (`requestAnimationFrame`).
     * @param {Number} canvasWidth - Current width of the canvas.
     * @param {Number} canvasHeight - Current height of the canvas.
     */

  }, {
    key: "preRender",
    value: function preRender(ctx, dt, canvasWidth, canvasHeight) {}

    /**
     * Propagate `update` to all registered renderers. The `update` method
     * for each renderer is called according to their update period.
     *
     * @param {Number} time - Current time.
     * @param {Number} dt - Delta time in seconds since last update.
     */

  }, {
    key: "update",
    value: function update(time, dt) {
      var renderers = this.renderers;

      for (var i = 0, l = renderers.length; i < l; i++) {
        var renderer = renderers[i];
        var updatePeriod = renderer.updatePeriod;

        if (updatePeriod === 0) {
          renderer.update(dt);
          renderer.currentTime = time;
        } else {
          while (renderer.currentTime < time) {
            renderer.update(updatePeriod);
            renderer.currentTime += updatePeriod;
          }
        }
      }
    }

    /**
     * Propagate `render` to all the registered renderers.
     *
     * @param {Number} dt - Delta time in seconds since the last
     *  `requestAnimationFrame` call.
     */

  }, {
    key: "render",
    value: function render(dt) {
      var ctx = this.ctx;
      var renderers = this.renderers;

      this.preRender(ctx, dt, this.canvasWidth, this.canvasHeight);

      for (var i = 0, l = renderers.length; i < l; i++) {
        renderers[i].render(ctx);
      }
    }

    /**
     * Add a `Renderer` instance to the group.
     *
     * @param {module:soundworks/client.Renderer} renderer - Renderer to add to
     *  the group.
     */

  }, {
    key: "add",
    value: function add(renderer) {
      this.renderers.push(renderer);
      this.currentTime = loop.getTime();
      // update the current time of the renderer
      renderer.currentTime = this.currentTime;
      renderer.pixelRatio = this.pixelRatio;
      renderer.onResize(this.canvasWidth, this.canvasHeight, this.orientation);
      renderer.init();
      // if first renderer added, start the loop
      if (this.renderers.length === 1) loop.requireStart();
    }

    /**
     * Remove a `Renderer` instance from the group.
     *
     * @param {module:soundworks/client.Renderer} renderer - Renderer to remove
     *  from the group.
     */

  }, {
    key: "remove",
    value: function remove(renderer) {
      var index = this.renderers.indexOf(renderer);

      if (index !== -1) {
        this.renderers.splice(index, 1);
        // if last renderer removed, stop the loop
        if (this.renderers.length === 0) loop.requireStop();
      }
    }
  }]);
  return RenderingGroup;
}();

exports.default = RenderingGroup;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbmRlcmluZ0dyb3VwLmpzIl0sIm5hbWVzIjpbImxvb3AiLCJyZW5kZXJpbmdHcm91cHMiLCJfaXNSdW5uaW5nIiwiZ2V0VGltZSIsIndpbmRvdyIsInBlcmZvcm1hbmNlIiwibm93IiwiRGF0ZSIsInJlcXVpcmVTdGFydCIsImxhc3RSZW5kZXJUaW1lIiwic2VsZiIsInRpbWUiLCJkdCIsImkiLCJsIiwibGVuZ3RoIiwiZ3JvdXAiLCJ1cGRhdGUiLCJyZW5kZXIiLCJyQUZpZCIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInJlcXVpcmVTdG9wIiwic2hvdWxkU3RvcCIsInJlbmRlcmVycyIsImNhbmNlbEFuaW1hdGlvbkZyYW1lIiwicmVnaXN0ZXJSZW5kZXJpbmdHcm91cCIsInB1c2giLCJSZW5kZXJpbmdHcm91cCIsImN0eCIsInByZXNlcnZlUGl4ZWxSYXRpbyIsInBpeGVsUmF0aW8iLCJkUFIiLCJkZXZpY2VQaXhlbFJhdGlvIiwiYlBSIiwid2Via2l0QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyIsIm1vekJhY2tpbmdTdG9yZVBpeGVsUmF0aW8iLCJtc0JhY2tpbmdTdG9yZVBpeGVsUmF0aW8iLCJvQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyIsImJhY2tpbmdTdG9yZVBpeGVsUmF0aW8iLCJ2aWV3cG9ydFdpZHRoIiwidmlld3BvcnRIZWlnaHQiLCJvcmllbnRhdGlvbiIsImNhbnZhc1dpZHRoIiwiY2FudmFzSGVpZ2h0IiwiY2FudmFzIiwid2lkdGgiLCJoZWlnaHQiLCJzdHlsZSIsIm9uUmVzaXplIiwicmVuZGVyZXIiLCJ1cGRhdGVQZXJpb2QiLCJjdXJyZW50VGltZSIsInByZVJlbmRlciIsImluaXQiLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7O0FBTUEsSUFBTUEsT0FBTztBQUNYQyxtQkFBaUIsRUFETjs7QUFHWEMsY0FBWSxLQUhEOztBQUtYOzs7QUFHQUMsU0FSVyxx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LFFBQVEsS0FBSy9CLFNBQUwsQ0FBZWdDLE9BQWYsQ0FBdUJOLFFBQXZCLENBQWQ7O0FBRUEsVUFBSUssVUFBVSxDQUFDLENBQWYsRUFBa0I7QUFDaEIsYUFBSy9CLFNBQUwsQ0FBZWlDLE1BQWYsQ0FBc0JGLEtBQXRCLEVBQTZCLENBQTdCO0FBQ0E7QUFDQSxZQUFJLEtBQUsvQixTQUFMLENBQWVSLE1BQWYsS0FBMEIsQ0FBOUIsRUFDRWYsS0FBS3FCLFdBQUw7QUFDRjtBQUNIOzs7OztrQkFHWU0sYyIsImZpbGUiOiJSZW5kZXJpbmdHcm91cC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogUmVuZGVyaW5nIGxvb3AgaGFuZGxpbmcgdGhlIGByZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIGFuZCB0aGUgYHVwZGF0ZWAgL1xuICogYHJlbmRlcmAgY3ljbGVzLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IGxvb3AgPSB7XG4gIHJlbmRlcmluZ0dyb3VwczogW10sXG5cbiAgX2lzUnVubmluZzogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBDdXJyZW50IHRpbWUgaW4gc2Vjb25kcy5cbiAgICovXG4gIGdldFRpbWUoKSB7XG4gICAgcmV0dXJuIDAuMDAxICogKHdpbmRvdy5wZXJmb3JtYW5jZSAmJiB3aW5kb3cucGVyZm9ybWFuY2Uubm93ID9cbiAgICAgIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKSA6IG5ldyBEYXRlKCkuZ2V0VGltZSgpKTtcbiAgfSxcblxuICAvKipcbiAgICogU3RhcnQgdGhlIHJlbmRlcmluZyBsb29wIGlmIG5vdCBzdGFydGVkLlxuICAgKi9cbiAgcmVxdWlyZVN0YXJ0KCkge1xuICAgIGlmICh0aGlzLl9pc1J1bm5pbmcpIHsgcmV0dXJuOyB9XG4gICAgdGhpcy5faXNSdW5uaW5nID0gdHJ1ZTtcbiAgICB0aGlzLmxhc3RSZW5kZXJUaW1lID0gdGhpcy5nZXRUaW1lKCk7XG5cbiAgICAoZnVuY3Rpb24oc2VsZikge1xuICAgICAgZnVuY3Rpb24gbG9vcCgpIHtcbiAgICAgICAgY29uc3QgdGltZSA9IHNlbGYuZ2V0VGltZSgpO1xuICAgICAgICBjb25zdCBkdCA9IHRpbWUgLSBzZWxmLmxhc3RSZW5kZXJUaW1lO1xuICAgICAgICBjb25zdCByZW5kZXJpbmdHcm91cHMgPSBzZWxmLnJlbmRlcmluZ0dyb3VwcztcblxuICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IHJlbmRlcmluZ0dyb3Vwcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBjb25zdCBncm91cCA9IHJlbmRlcmluZ0dyb3Vwc1tpXTtcbiAgICAgICAgICAvLyBsZXQgdGhlIGdyb3VwIGhhbmRsZSB0aGUgdXBkYXRlUGVyaW9kIG9mIGVhY2ggcmVuZGVyZXJcbiAgICAgICAgICBncm91cC51cGRhdGUodGltZSwgZHQpO1xuICAgICAgICAgIGdyb3VwLnJlbmRlcihkdCk7IC8vIGZvcndhcmQgYGR0YCBmb3IgYHByZVJlbmRlcmAgbWV0aG9kXG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLmxhc3RSZW5kZXJUaW1lID0gdGltZTtcbiAgICAgICAgc2VsZi5yQUZpZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKTtcbiAgICAgIH1cblxuICAgICAgc2VsZi5yQUZpZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKTtcbiAgICB9KHRoaXMpKTtcbiAgfSxcblxuICAvKipcbiAgICogU3RvcCB0aGUgbG9vcCBpZiBubyByZW5kZXJlciBhcmUgc3RpbGwgcHJlc2VudC4gSWYgbm90IGFib3J0LlxuICAgKi9cbiAgcmVxdWlyZVN0b3AoKSB7XG4gICAgLy8gQHRvZG8gLSBoYW5kbGUgc2V2ZXJhbCBwYXJhbGxlbCBncm91cHNcbiAgICBsZXQgc2hvdWxkU3RvcCA9IHRydWU7XG5cbiAgICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMucmVuZGVyaW5nR3JvdXBzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKHRoaXMucmVuZGVyaW5nR3JvdXBzW2ldLnJlbmRlcmVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNob3VsZFN0b3AgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc2hvdWxkU3RvcCkge1xuICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5yQUZpZCk7XG4gICAgICB0aGlzLl9pc1J1bm5pbmcgPSBmYWxzZTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFkZCBhIHJlbmRlcmluZyBncm91cCB0byB0aGUgbG9vcC5cbiAgICovXG4gIHJlZ2lzdGVyUmVuZGVyaW5nR3JvdXAoZ3JvdXApIHtcbiAgICB0aGlzLnJlbmRlcmluZ0dyb3Vwcy5wdXNoKGdyb3VwKTtcbiAgfVxufTtcblxuLyoqXG4gKiBIYW5kbGUgYSBncm91cCBvZiByZW5kZXJlcnMgb24gYSBzaW5nbGUgZnVsbCBzY3JlZW4gY2FudmFzLlxuICpcbiAqIDxzcGFuIGNsYXNzPVwid2FybmluZ1wiPlRoaXMgY2xhc3MgaXMgYSBwcm9wZXJ0eSBvZlxuICoge0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5DYW52YXNWaWV3fSBzaG91bGQgYmUgY29uc2lkZXJlZCBwcml2YXRlLjwvc3Bhbj5cbiAqXG4gKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY3R4IC0gQ2FudmFzIGNvbnRleHQgaW4gd2hpY2hcbiAqICB0aGUgcmVuZGVyZXIgc2hvdWxkIGRyYXcuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtwcmVzZXJ2ZVBpeGVsUmF0aW89ZmFsc2VdIC0gRGVmaW5lIGlmIHRoZSBjYW52YXMgc2hvdWxkXG4gKiAgdGFrZSBhY2NvdW50IG9mIHRoZSBkZXZpY2UgcGl4ZWwgcmF0aW8gZm9yIHRoZSBkcmF3aW5nLiBXaGVuIHNldCB0byBgdHJ1ZWAsXG4gKiAgcXVhbGl0eSBpZiBmYXZvcmVkIG92ZXIgcGVyZm9ybWFuY2UuXG4gKlxuICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudFxuICovXG5jbGFzcyBSZW5kZXJpbmdHcm91cCB7XG4gIGNvbnN0cnVjdG9yKGN0eCwgcHJlc2VydmVQaXhlbFJhdGlvID0gZmFsc2UpIHtcbiAgICAvKipcbiAgICAgKiAyZCBjb250ZXh0IG9mIHRoZSBjYW52YXMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfVxuICAgICAqIEBuYW1lIGN0eFxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuUmVuZGVyaW5nR3JvdXBcbiAgICAgKi9cbiAgICB0aGlzLmN0eCA9IGN0eDtcblxuICAgIC8qKlxuICAgICAqIFN0YWNrIG9mIHRoZSByZWdpc3RlcmVkIHJlbmRlcmVycy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtBcnJheTxtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuUmVuZGVyZXI+fVxuICAgICAqIEBuYW1lIHJlbmRlcmVyc1xuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuUmVuZGVyaW5nR3JvdXBcbiAgICAgKi9cbiAgICB0aGlzLnJlbmRlcmVycyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogUGl4ZWwgcmF0aW8gb2YgdGhlIGRldmljZSwgc2V0IHRvIDEgaWYgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgcGl4ZWxSYXRpb1xuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuUmVuZGVyaW5nR3JvdXBcbiAgICAgKi9cbiAgICB0aGlzLnBpeGVsUmF0aW8gPSAoZnVuY3Rpb24oY3R4KSB7XG4gICAgICBjb25zdCBkUFIgPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxO1xuICAgICAgY29uc3QgYlBSID0gY3R4LndlYmtpdEJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcbiAgICAgICAgY3R4Lm1vekJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcbiAgICAgICAgY3R4Lm1zQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuICAgICAgICBjdHgub0JhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcbiAgICAgICAgY3R4LmJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgMTtcblxuICAgICAgcmV0dXJuIHByZXNlcnZlUGl4ZWxSYXRpbyA/IChkUFIgLyBiUFIpIDogMTtcbiAgICB9KHRoaXMuY3R4KSk7XG5cbiAgICAvLyByZWdpc3RlciB0aGUgZ3JvdXAgaW50byB0aGUgbG9vcFxuICAgIGxvb3AucmVnaXN0ZXJSZW5kZXJpbmdHcm91cCh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBzaXplIG9mIHRoZSBjYW52YXMuIFByb3BhZ2F0ZSBuZXcgbG9naWNhbCBgd2lkdGhgIGFuZCBgaGVpZ2h0YFxuICAgKiBhY2NvcmRpbmcgdG8gYHRoaXMucGl4ZWxSYXRpb2AgdG8gYWxsIHJlZ2lzdGVyZWQgcmVuZGVyZXJzLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gdmlld3BvcnRXaWR0aCAtIFdpZHRoIG9mIHRoZSB2aWV3cG9ydC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZpZXdwb3J0SGVpZ2h0IC0gSGVpZ2h0IG9mIHRoZSB2aWV3cG9ydC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9yaWVudGF0aW9uIC0gT3JpZW50YXRpb24gb2YgdGhlIHZpZXdwb3J0LlxuICAgKi9cbiAgb25SZXNpemUodmlld3BvcnRXaWR0aCwgdmlld3BvcnRIZWlnaHQsIG9yaWVudGF0aW9uKSB7XG4gICAgY29uc3QgY3R4ID0gdGhpcy5jdHg7XG4gICAgY29uc3QgcGl4ZWxSYXRpbyA9IHRoaXMucGl4ZWxSYXRpbztcblxuICAgIHRoaXMuY2FudmFzV2lkdGggPSB2aWV3cG9ydFdpZHRoICogcGl4ZWxSYXRpbztcbiAgICB0aGlzLmNhbnZhc0hlaWdodCA9IHZpZXdwb3J0SGVpZ2h0ICogcGl4ZWxSYXRpbztcbiAgICB0aGlzLm9yaWVudGF0aW9uID0gb3JpZW50YXRpb247XG5cbiAgICBjdHguY2FudmFzLndpZHRoID0gdGhpcy5jYW52YXNXaWR0aDtcbiAgICBjdHguY2FudmFzLmhlaWdodCA9IHRoaXMuY2FudmFzSGVpZ2h0O1xuICAgIGN0eC5jYW52YXMuc3R5bGUud2lkdGggPSBgJHt2aWV3cG9ydFdpZHRofXB4YDtcbiAgICBjdHguY2FudmFzLnN0eWxlLmhlaWdodCA9IGAke3ZpZXdwb3J0SGVpZ2h0fXB4YDtcblxuICAgIC8vIHByb3BhZ2F0ZSBsb2dpY2FsIHNpemUgdG8gcmVuZGVyZXJzXG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLnJlbmRlcmVycy5sZW5ndGg7IGkgPCBsOyBpKyspXG4gICAgICB0aGlzLnJlbmRlcmVyc1tpXS5vblJlc2l6ZSh0aGlzLmNhbnZhc1dpZHRoLCB0aGlzLmNhbnZhc0hlaWdodCwgb3JpZW50YXRpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIEVudHJ5IHBvaW50IHRvIGFwcGx5IGdsb2JhbCB0cmFuc2Zvcm1hdGlvbnMgdG8gdGhlIGNhbnZhcyBiZWZvcmUgZWFjaFxuICAgKiByZW5kZXJlciBpcyByZW5kZXJlZC5cbiAgICpcbiAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGN0eCAtIENvbnRleHQgb2YgdGhlIGNhbnZhcy5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGR0IC0gRGVsdGEgdGltZSBpbiBzZWNvbmRzIHNpbmNlIHRoZSBsYXN0IHJlbmRlcmluZ1xuICAgKiAgbG9vcCAoYHJlcXVlc3RBbmltYXRpb25GcmFtZWApLlxuICAgKiBAcGFyYW0ge051bWJlcn0gY2FudmFzV2lkdGggLSBDdXJyZW50IHdpZHRoIG9mIHRoZSBjYW52YXMuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBjYW52YXNIZWlnaHQgLSBDdXJyZW50IGhlaWdodCBvZiB0aGUgY2FudmFzLlxuICAgKi9cbiAgcHJlUmVuZGVyKGN0eCwgZHQsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpIHt9XG5cbiAgLyoqXG4gICAqIFByb3BhZ2F0ZSBgdXBkYXRlYCB0byBhbGwgcmVnaXN0ZXJlZCByZW5kZXJlcnMuIFRoZSBgdXBkYXRlYCBtZXRob2RcbiAgICogZm9yIGVhY2ggcmVuZGVyZXIgaXMgY2FsbGVkIGFjY29yZGluZyB0byB0aGVpciB1cGRhdGUgcGVyaW9kLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSAtIEN1cnJlbnQgdGltZS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGR0IC0gRGVsdGEgdGltZSBpbiBzZWNvbmRzIHNpbmNlIGxhc3QgdXBkYXRlLlxuICAgKi9cbiAgdXBkYXRlKHRpbWUsIGR0KSB7XG4gICAgY29uc3QgcmVuZGVyZXJzID0gdGhpcy5yZW5kZXJlcnM7XG5cbiAgICBmb3IgKGxldCBpID0gMCwgbCA9IHJlbmRlcmVycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbmRlcmVyID0gcmVuZGVyZXJzW2ldO1xuICAgICAgY29uc3QgdXBkYXRlUGVyaW9kID0gcmVuZGVyZXIudXBkYXRlUGVyaW9kO1xuXG4gICAgICBpZiAodXBkYXRlUGVyaW9kID09PSAwKSB7XG4gICAgICAgIHJlbmRlcmVyLnVwZGF0ZShkdCk7XG4gICAgICAgIHJlbmRlcmVyLmN1cnJlbnRUaW1lID0gdGltZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdoaWxlIChyZW5kZXJlci5jdXJyZW50VGltZSA8IHRpbWUpIHtcbiAgICAgICAgICByZW5kZXJlci51cGRhdGUodXBkYXRlUGVyaW9kKTtcbiAgICAgICAgICByZW5kZXJlci5jdXJyZW50VGltZSArPSB1cGRhdGVQZXJpb2Q7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHJvcGFnYXRlIGByZW5kZXJgIHRvIGFsbCB0aGUgcmVnaXN0ZXJlZCByZW5kZXJlcnMuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBkdCAtIERlbHRhIHRpbWUgaW4gc2Vjb25kcyBzaW5jZSB0aGUgbGFzdFxuICAgKiAgYHJlcXVlc3RBbmltYXRpb25GcmFtZWAgY2FsbC5cbiAgICovXG4gIHJlbmRlcihkdCkge1xuICAgIGNvbnN0IGN0eCA9IHRoaXMuY3R4O1xuICAgIGNvbnN0IHJlbmRlcmVycyA9IHRoaXMucmVuZGVyZXJzO1xuXG4gICAgdGhpcy5wcmVSZW5kZXIoY3R4LCBkdCwgdGhpcy5jYW52YXNXaWR0aCwgdGhpcy5jYW52YXNIZWlnaHQpO1xuXG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSByZW5kZXJlcnMubGVuZ3RoOyBpIDwgbDsgaSsrKVxuICAgICAgcmVuZGVyZXJzW2ldLnJlbmRlcihjdHgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGBSZW5kZXJlcmAgaW5zdGFuY2UgdG8gdGhlIGdyb3VwLlxuICAgKlxuICAgKiBAcGFyYW0ge21vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5SZW5kZXJlcn0gcmVuZGVyZXIgLSBSZW5kZXJlciB0byBhZGQgdG9cbiAgICogIHRoZSBncm91cC5cbiAgICovXG4gIGFkZChyZW5kZXJlcikge1xuICAgIHRoaXMucmVuZGVyZXJzLnB1c2gocmVuZGVyZXIpO1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSBsb29wLmdldFRpbWUoKTtcbiAgICAvLyB1cGRhdGUgdGhlIGN1cnJlbnQgdGltZSBvZiB0aGUgcmVuZGVyZXJcbiAgICByZW5kZXJlci5jdXJyZW50VGltZSA9IHRoaXMuY3VycmVudFRpbWU7XG4gICAgcmVuZGVyZXIucGl4ZWxSYXRpbyA9IHRoaXMucGl4ZWxSYXRpbztcbiAgICByZW5kZXJlci5vblJlc2l6ZSh0aGlzLmNhbnZhc1dpZHRoLCB0aGlzLmNhbnZhc0hlaWdodCwgdGhpcy5vcmllbnRhdGlvbik7XG4gICAgcmVuZGVyZXIuaW5pdCgpO1xuICAgIC8vIGlmIGZpcnN0IHJlbmRlcmVyIGFkZGVkLCBzdGFydCB0aGUgbG9vcFxuICAgIGlmICh0aGlzLnJlbmRlcmVycy5sZW5ndGggPT09IDEpXG4gICAgICBsb29wLnJlcXVpcmVTdGFydCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGBSZW5kZXJlcmAgaW5zdGFuY2UgZnJvbSB0aGUgZ3JvdXAuXG4gICAqXG4gICAqIEBwYXJhbSB7bW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlJlbmRlcmVyfSByZW5kZXJlciAtIFJlbmRlcmVyIHRvIHJlbW92ZVxuICAgKiAgZnJvbSB0aGUgZ3JvdXAuXG4gICAqL1xuICByZW1vdmUocmVuZGVyZXIpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMucmVuZGVyZXJzLmluZGV4T2YocmVuZGVyZXIpO1xuXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgdGhpcy5yZW5kZXJlcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIC8vIGlmIGxhc3QgcmVuZGVyZXIgcmVtb3ZlZCwgc3RvcCB0aGUgbG9vcFxuICAgICAgaWYgKHRoaXMucmVuZGVyZXJzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgbG9vcC5yZXF1aXJlU3RvcCgpO1xuICAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUmVuZGVyaW5nR3JvdXA7XG4iXX0=