'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _View2 = require('./View');

var _View3 = _interopRequireDefault(_View2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultTemplate = '\n  <option class="small"><%= instructions %></option>\n  <% entries.forEach(function(entry) { %>\n    <option value="<%= entry.index %>"><%= entry.label %></option>\n  <% }); %>\n';

/**
 * View with a drop down list.
 *
 * @memberof module:soundworks/client
 *
 * @todo - Review API, non standard
 */

var SelectView = function (_View) {
  (0, _inherits3.default)(SelectView, _View);

  function SelectView(content) {
    var events = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    (0, _classCallCheck3.default)(this, SelectView);

    options = (0, _assign2.default)({ el: 'select', className: 'select' }, options);

    var _this = (0, _possibleConstructorReturn3.default)(this, (SelectView.__proto__ || (0, _getPrototypeOf2.default)(SelectView)).call(this, defaultTemplate, content, events, options));

    _this.entries = content.entries;
    return _this;
  }

  /**
   * why noop ?
   * @private
   */


  (0, _createClass3.default)(SelectView, [{
    key: 'onResize',
    value: function onResize() {}

    /**
     * Return the entry corresponding to the selected item.
     */

  }, {
    key: 'enableIndex',


    /**
     * Enable selection of a specific item.
     *
     * @param {Number} index - Index of the entry.
     */
    value: function enableIndex(index) {
      var $option = this.$el.querySelector('option[value="' + index + '"]');
      if ($option) $option.removeAttribute('disabled');
    }

    /**
     * Disable selection of a specific item.
     *
     * @param {Number} index - Index of the entry.
     */

  }, {
    key: 'disableIndex',
    value: function disableIndex(index) {
      var $option = this.$el.querySelector('option[value="' + index + '"]');
      if ($option) $option.setAttribute('disabled', 'disabled');
    }
  }, {
    key: 'value',
    get: function get() {
      var index = parseInt(this.$el.value);
      var entry = this.entries.find(function (entry) {
        return entry.index === index;
      });
      return entry || null;
    }
  }]);
  return SelectView;
}(_View3.default);

exports.default = SelectView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlbGVjdFZpZXcuanMiXSwibmFtZXMiOlsiZGVmYXVsdFRlbXBsYXRlIiwiU2VsZWN0VmlldyIsImNvbnRlbnQiLCJldmVudHMiLCJvcHRpb25zIiwiZWwiLCJjbGFzc05hbWUiLCJlbnRyaWVzIiwiaW5kZXgiLCIkb3B0aW9uIiwiJGVsIiwicXVlcnlTZWxlY3RvciIsInJlbW92ZUF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsInBhcnNlSW50IiwidmFsdWUiLCJlbnRyeSIsImZpbmQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7Ozs7QUFFQSxJQUFNQSx3TUFBTjs7QUFRQTs7Ozs7Ozs7SUFPTUMsVTs7O0FBQ0osc0JBQVlDLE9BQVosRUFBZ0Q7QUFBQSxRQUEzQkMsTUFBMkIsdUVBQWxCLEVBQWtCO0FBQUEsUUFBZEMsT0FBYyx1RUFBSixFQUFJO0FBQUE7O0FBQzlDQSxjQUFVLHNCQUFjLEVBQUVDLElBQUksUUFBTixFQUFnQkMsV0FBVyxRQUEzQixFQUFkLEVBQXFERixPQUFyRCxDQUFWOztBQUQ4Qyw4SUFFeENKLGVBRndDLEVBRXZCRSxPQUZ1QixFQUVkQyxNQUZjLEVBRU5DLE9BRk07O0FBSTlDLFVBQUtHLE9BQUwsR0FBZUwsUUFBUUssT0FBdkI7QUFKOEM7QUFLL0M7O0FBRUQ7Ozs7Ozs7OytCQUlXLENBQUU7O0FBRWI7Ozs7Ozs7O0FBU0E7Ozs7O2dDQUtZQyxLLEVBQU87QUFDakIsVUFBTUMsVUFBVSxLQUFLQyxHQUFMLENBQVNDLGFBQVQsb0JBQXdDSCxLQUF4QyxRQUFoQjtBQUNBLFVBQUlDLE9BQUosRUFDRUEsUUFBUUcsZUFBUixDQUF3QixVQUF4QjtBQUNIOztBQUVEOzs7Ozs7OztpQ0FLYUosSyxFQUFPO0FBQ2xCLFVBQU1DLFVBQVUsS0FBS0MsR0FBTCxDQUFTQyxhQUFULG9CQUF3Q0gsS0FBeEMsUUFBaEI7QUFDQSxVQUFJQyxPQUFKLEVBQ0VBLFFBQVFJLFlBQVIsQ0FBcUIsVUFBckIsRUFBaUMsVUFBakM7QUFDSDs7O3dCQTFCVztBQUNWLFVBQU1MLFFBQVFNLFNBQVMsS0FBS0osR0FBTCxDQUFTSyxLQUFsQixDQUFkO0FBQ0EsVUFBTUMsUUFBUSxLQUFLVCxPQUFMLENBQWFVLElBQWIsQ0FBa0I7QUFBQSxlQUFTRCxNQUFNUixLQUFOLEtBQWdCQSxLQUF6QjtBQUFBLE9BQWxCLENBQWQ7QUFDQSxhQUFPUSxTQUFTLElBQWhCO0FBQ0Q7Ozs7O2tCQXlCWWYsVSIsImZpbGUiOiJTZWxlY3RWaWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFZpZXcgZnJvbSAnLi9WaWV3JztcblxuY29uc3QgZGVmYXVsdFRlbXBsYXRlID0gYFxuICA8b3B0aW9uIGNsYXNzPVwic21hbGxcIj48JT0gaW5zdHJ1Y3Rpb25zICU+PC9vcHRpb24+XG4gIDwlIGVudHJpZXMuZm9yRWFjaChmdW5jdGlvbihlbnRyeSkgeyAlPlxuICAgIDxvcHRpb24gdmFsdWU9XCI8JT0gZW50cnkuaW5kZXggJT5cIj48JT0gZW50cnkubGFiZWwgJT48L29wdGlvbj5cbiAgPCUgfSk7ICU+XG5gO1xuXG5cbi8qKlxuICogVmlldyB3aXRoIGEgZHJvcCBkb3duIGxpc3QuXG4gKlxuICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudFxuICpcbiAqIEB0b2RvIC0gUmV2aWV3IEFQSSwgbm9uIHN0YW5kYXJkXG4gKi9cbmNsYXNzIFNlbGVjdFZpZXcgZXh0ZW5kcyBWaWV3IHtcbiAgY29uc3RydWN0b3IoY29udGVudCwgZXZlbnRzID0ge30sIG9wdGlvbnMgPSB7fSkge1xuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHsgZWw6ICdzZWxlY3QnLCBjbGFzc05hbWU6ICdzZWxlY3QnIH0sIG9wdGlvbnMpO1xuICAgIHN1cGVyKGRlZmF1bHRUZW1wbGF0ZSwgY29udGVudCwgZXZlbnRzLCBvcHRpb25zKTtcblxuICAgIHRoaXMuZW50cmllcyA9IGNvbnRlbnQuZW50cmllcztcbiAgfVxuXG4gIC8qKlxuICAgKiB3aHkgbm9vcCA/XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblJlc2l6ZSgpIHt9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgZW50cnkgY29ycmVzcG9uZGluZyB0byB0aGUgc2VsZWN0ZWQgaXRlbS5cbiAgICovXG4gIGdldCB2YWx1ZSgpIHtcbiAgICBjb25zdCBpbmRleCA9IHBhcnNlSW50KHRoaXMuJGVsLnZhbHVlKTtcbiAgICBjb25zdCBlbnRyeSA9IHRoaXMuZW50cmllcy5maW5kKGVudHJ5ID0+IGVudHJ5LmluZGV4ID09PSBpbmRleCk7XG4gICAgcmV0dXJuIGVudHJ5IHx8wqBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuYWJsZSBzZWxlY3Rpb24gb2YgYSBzcGVjaWZpYyBpdGVtLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggLSBJbmRleCBvZiB0aGUgZW50cnkuXG4gICAqL1xuICBlbmFibGVJbmRleChpbmRleCkge1xuICAgIGNvbnN0ICRvcHRpb24gPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKGBvcHRpb25bdmFsdWU9XCIke2luZGV4fVwiXWApO1xuICAgIGlmICgkb3B0aW9uKVxuICAgICAgJG9wdGlvbi5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gIH1cblxuICAvKipcbiAgICogRGlzYWJsZSBzZWxlY3Rpb24gb2YgYSBzcGVjaWZpYyBpdGVtLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggLSBJbmRleCBvZiB0aGUgZW50cnkuXG4gICAqL1xuICBkaXNhYmxlSW5kZXgoaW5kZXgpIHtcbiAgICBjb25zdCAkb3B0aW9uID0gdGhpcy4kZWwucXVlcnlTZWxlY3Rvcihgb3B0aW9uW3ZhbHVlPVwiJHtpbmRleH1cIl1gKTtcbiAgICBpZiAoJG9wdGlvbilcbiAgICAgICRvcHRpb24uc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNlbGVjdFZpZXc7XG4iXX0=