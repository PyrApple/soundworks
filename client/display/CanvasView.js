'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _SegmentedView2 = require('./SegmentedView');

var _SegmentedView3 = _interopRequireDefault(_SegmentedView2);

var _RenderingGroup = require('./RenderingGroup');

var _RenderingGroup2 = _interopRequireDefault(_RenderingGroup);

var defaultCanvasTemplate = '\n  <canvas class="background"></canvas>\n  <div class="foreground">\n    <div class="section-top flex-middle"><%= top %></div>\n    <div class="section-center flex-center"><%= center %></div>\n    <div class="section-bottom flex-middle"><%= bottom %></div>\n  </div>\n';

/**
 * A `SegmentedView` with a `canvas` element in the background. This view should mainly be used in preformances.
 */

var CanvasView = (function (_SegmentedView) {
  _inherits(CanvasView, _SegmentedView);

  function CanvasView(template, content, events, options) {
    _classCallCheck(this, CanvasView);

    template = template || defaultCanvasTemplate;
    _get(Object.getPrototypeOf(CanvasView.prototype), 'constructor', this).call(this, template, content, events, options);
  }

  _createClass(CanvasView, [{
    key: 'onRender',
    value: function onRender() {
      _get(Object.getPrototypeOf(CanvasView.prototype), 'onRender', this).call(this);

      /**
       * The canvas element to draw into
       * @type {Element}
       */
      this.$canvas = this.$el.querySelector('canvas');

      /**
       * The 2d context of the canvas.
       * @type {CanvasRenderingContext2D}
       */
      this.ctx = this.$canvas.getContext('2d');

      /**
       * The default rendering group.
       * @type {RenderingGroup}
       */
      this._renderingGroup = new _RenderingGroup2['default'](this.ctx);
    }
  }, {
    key: 'onResize',
    value: function onResize(viewportWidth, viewportHeight, orientation) {
      _get(Object.getPrototypeOf(CanvasView.prototype), 'onResize', this).call(this, viewportWidth, viewportHeight, orientation);
      this._renderingGroup.onResize(viewportWidth, viewportHeight);
    }

    /**
     * Overrides the `preRender` interface method of the default `RenderingGroup` of the view. cf. @link `RenderingGroup~prerender`
     * @param {Function} callback - The function to use as a pre-render method.
     */
  }, {
    key: 'setPreRender',
    value: function setPreRender(callback) {
      this._renderingGroup.preRender = callback.bind(this._renderingGroup);
    }

    /**
     * Add a renderer to the `RenderingGroup`. The renderer is automaticcaly activated when added to the group.
     * @param {Renderer} renderer - The renderer to add.
     */
  }, {
    key: 'addRenderer',
    value: function addRenderer(renderer) {
      this._renderingGroup.add(renderer);
    }

    /**
     * Add a renderer to the `RenderingGroup`. The renderer is automaticcaly disactivated when removed from the group.
     * @param {Renderer} renderer - The renderer to remove.
     */
  }, {
    key: 'removeRenderer',
    value: function removeRenderer(renderer) {
      this._renderingGroup.remove(renderer);
    }
  }]);

  return CanvasView;
})(_SegmentedView3['default']);

exports['default'] = CanvasView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvZGlzcGxheS9DYW52YXNWaWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OEJBQTBCLGlCQUFpQjs7Ozs4QkFDaEIsa0JBQWtCOzs7O0FBRzdDLElBQU0scUJBQXFCLGtSQU8xQixDQUFDOzs7Ozs7SUFLbUIsVUFBVTtZQUFWLFVBQVU7O0FBQ2xCLFdBRFEsVUFBVSxDQUNqQixRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUU7MEJBRDdCLFVBQVU7O0FBRTNCLFlBQVEsR0FBRyxRQUFRLElBQUkscUJBQXFCLENBQUM7QUFDN0MsK0JBSGlCLFVBQVUsNkNBR3JCLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRTtHQUMzQzs7ZUFKa0IsVUFBVTs7V0FNckIsb0JBQUc7QUFDVCxpQ0FQaUIsVUFBVSwwQ0FPVjs7Ozs7O0FBTWpCLFVBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7Ozs7OztBQU1oRCxVQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDOzs7Ozs7QUFNekMsVUFBSSxDQUFDLGVBQWUsR0FBRyxnQ0FBbUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3JEOzs7V0FFTyxrQkFBQyxhQUFhLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRTtBQUNuRCxpQ0E3QmlCLFVBQVUsMENBNkJaLGFBQWEsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFO0FBQzNELFVBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxjQUFjLENBQUMsQ0FBQztLQUM5RDs7Ozs7Ozs7V0FNVyxzQkFBQyxRQUFRLEVBQUU7QUFDckIsVUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDdEU7Ozs7Ozs7O1dBTVUscUJBQUMsUUFBUSxFQUFFO0FBQ3BCLFVBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3BDOzs7Ozs7OztXQU1hLHdCQUFDLFFBQVEsRUFBRTtBQUN2QixVQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN2Qzs7O1NBdkRrQixVQUFVOzs7cUJBQVYsVUFBVSIsImZpbGUiOiJzcmMvY2xpZW50L2Rpc3BsYXkvQ2FudmFzVmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTZWdtZW50ZWRWaWV3IGZyb20gJy4vU2VnbWVudGVkVmlldyc7XG5pbXBvcnQgUmVuZGVyaW5nR3JvdXAgZnJvbSAnLi9SZW5kZXJpbmdHcm91cCc7XG5cblxuY29uc3QgZGVmYXVsdENhbnZhc1RlbXBsYXRlID0gYFxuICA8Y2FudmFzIGNsYXNzPVwiYmFja2dyb3VuZFwiPjwvY2FudmFzPlxuICA8ZGl2IGNsYXNzPVwiZm9yZWdyb3VuZFwiPlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcCBmbGV4LW1pZGRsZVwiPjwlPSB0b3AgJT48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj48JT0gY2VudGVyICU+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tYm90dG9tIGZsZXgtbWlkZGxlXCI+PCU9IGJvdHRvbSAlPjwvZGl2PlxuICA8L2Rpdj5cbmA7XG5cbi8qKlxuICogQSBgU2VnbWVudGVkVmlld2Agd2l0aCBhIGBjYW52YXNgIGVsZW1lbnQgaW4gdGhlIGJhY2tncm91bmQuIFRoaXMgdmlldyBzaG91bGQgbWFpbmx5IGJlIHVzZWQgaW4gcHJlZm9ybWFuY2VzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDYW52YXNWaWV3IGV4dGVuZHMgU2VnbWVudGVkVmlldyB7XG4gIGNvbnN0cnVjdG9yKHRlbXBsYXRlLCBjb250ZW50LCBldmVudHMsIG9wdGlvbnMpIHtcbiAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlIHx8IGRlZmF1bHRDYW52YXNUZW1wbGF0ZTtcbiAgICBzdXBlcih0ZW1wbGF0ZSwgY29udGVudCwgZXZlbnRzLCBvcHRpb25zKTtcbiAgfVxuXG4gIG9uUmVuZGVyKCkge1xuICAgIHN1cGVyLm9uUmVuZGVyKCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY2FudmFzIGVsZW1lbnQgdG8gZHJhdyBpbnRvXG4gICAgICogQHR5cGUge0VsZW1lbnR9XG4gICAgICovXG4gICAgdGhpcy4kY2FudmFzID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignY2FudmFzJyk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgMmQgY29udGV4dCBvZiB0aGUgY2FudmFzLlxuICAgICAqIEB0eXBlIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9XG4gICAgICovXG4gICAgdGhpcy5jdHggPSB0aGlzLiRjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBkZWZhdWx0IHJlbmRlcmluZyBncm91cC5cbiAgICAgKiBAdHlwZSB7UmVuZGVyaW5nR3JvdXB9XG4gICAgICovXG4gICAgdGhpcy5fcmVuZGVyaW5nR3JvdXAgPSBuZXcgUmVuZGVyaW5nR3JvdXAodGhpcy5jdHgpO1xuICB9XG5cbiAgb25SZXNpemUodmlld3BvcnRXaWR0aCwgdmlld3BvcnRIZWlnaHQsIG9yaWVudGF0aW9uKSB7XG4gICAgc3VwZXIub25SZXNpemUodmlld3BvcnRXaWR0aCwgdmlld3BvcnRIZWlnaHQsIG9yaWVudGF0aW9uKTtcbiAgICB0aGlzLl9yZW5kZXJpbmdHcm91cC5vblJlc2l6ZSh2aWV3cG9ydFdpZHRoLCB2aWV3cG9ydEhlaWdodCk7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIHRoZSBgcHJlUmVuZGVyYCBpbnRlcmZhY2UgbWV0aG9kIG9mIHRoZSBkZWZhdWx0IGBSZW5kZXJpbmdHcm91cGAgb2YgdGhlIHZpZXcuIGNmLiBAbGluayBgUmVuZGVyaW5nR3JvdXB+cHJlcmVuZGVyYFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIFRoZSBmdW5jdGlvbiB0byB1c2UgYXMgYSBwcmUtcmVuZGVyIG1ldGhvZC5cbiAgICovXG4gIHNldFByZVJlbmRlcihjYWxsYmFjaykge1xuICAgIHRoaXMuX3JlbmRlcmluZ0dyb3VwLnByZVJlbmRlciA9IGNhbGxiYWNrLmJpbmQodGhpcy5fcmVuZGVyaW5nR3JvdXApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHJlbmRlcmVyIHRvIHRoZSBgUmVuZGVyaW5nR3JvdXBgLiBUaGUgcmVuZGVyZXIgaXMgYXV0b21hdGljY2FseSBhY3RpdmF0ZWQgd2hlbiBhZGRlZCB0byB0aGUgZ3JvdXAuXG4gICAqIEBwYXJhbSB7UmVuZGVyZXJ9IHJlbmRlcmVyIC0gVGhlIHJlbmRlcmVyIHRvIGFkZC5cbiAgICovXG4gIGFkZFJlbmRlcmVyKHJlbmRlcmVyKSB7XG4gICAgdGhpcy5fcmVuZGVyaW5nR3JvdXAuYWRkKHJlbmRlcmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSByZW5kZXJlciB0byB0aGUgYFJlbmRlcmluZ0dyb3VwYC4gVGhlIHJlbmRlcmVyIGlzIGF1dG9tYXRpY2NhbHkgZGlzYWN0aXZhdGVkIHdoZW4gcmVtb3ZlZCBmcm9tIHRoZSBncm91cC5cbiAgICogQHBhcmFtIHtSZW5kZXJlcn0gcmVuZGVyZXIgLSBUaGUgcmVuZGVyZXIgdG8gcmVtb3ZlLlxuICAgKi9cbiAgcmVtb3ZlUmVuZGVyZXIocmVuZGVyZXIpIHtcbiAgICB0aGlzLl9yZW5kZXJpbmdHcm91cC5yZW1vdmUocmVuZGVyZXIpO1xuICB9XG59XG4iXX0=