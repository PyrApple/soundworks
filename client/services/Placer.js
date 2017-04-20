'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

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

var _client = require('../core/client');

var _client2 = _interopRequireDefault(_client);

var _Service2 = require('../core/Service');

var _Service3 = _interopRequireDefault(_Service2);

var _serviceManager = require('../core/serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

var _SelectView = require('../views/SelectView');

var _SelectView2 = _interopRequireDefault(_SelectView);

var _SpaceView = require('../views/SpaceView');

var _SpaceView2 = _interopRequireDefault(_SpaceView);

var _SquaredView3 = require('../views/SquaredView');

var _SquaredView4 = _interopRequireDefault(_SquaredView3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SERVICE_ID = 'service:placer';

var defaultViewTemplate = '\n<div class="section-square<%= mode === \'list\' ? \' flex-middle\' : \'\' %>">\n  <% if (rejected) { %>\n  <div class="fit-container flex-middle">\n    <p><%= reject %></p>\n  </div>\n  <% } %>\n</div>\n<div class="section-float flex-middle">\n  <% if (!rejected) { %>\n    <% if (mode === \'graphic\') { %>\n      <p><%= instructions %></p>\n    <% } else if (mode === \'list\') { %>\n      <% if (showBtn) { %>\n        <button class="btn"><%= send %></button>\n      <% } %>\n    <% } %>\n  <% } %>\n</div>';

var defaultViewContent = {
  instructions: 'Select your position',
  send: 'Send',
  reject: 'Sorry, no place is available',
  showBtn: false,
  rejected: false
};

/**
 * Interface for the view of the `placer` service.
 *
 * @interface AbstractPlacerView
 * @extends module:soundworks/client.View
 */
/**
 * Register the `area` definition to the view.
 *
 * @function
 * @name AbstractPlacerView.setArea
 * @param {Object} area - Definition of the area.
 * @property {Number} area.width - With of the area.
 * @property {Number} area.height - Height of the area.
 * @property {Number} [area.labels=[]] - Labels of the position.
 * @property {Number} [area.coordinates=[]] - Coordinates of the area.
 */
/**
 * Display the available positions.
 *
 * @function
 * @name AbstractPlacerView.displayPositions
 * @param {Number} capacity - The maximum number of clients allowed.
 * @param {Array<String>} [labels=null] - An array of the labels for the positions
 * @param {Array<Array<Number>>} [coordinates=null] - An array of the coordinates of the positions
 * @param {Number} [maxClientsPerPosition=1] - Number of clients allowed for each position.
 */
/**
 * Disable the given positions.
 *
 * @function
 * @name AbstractPlacerView.updateDisabledPositions
 * @param {Array<Number>} disabledIndexes - Array of indexes of the disabled positions.
 */
/**
 * Define the behavior of the view when the position requested by the user is
 * no longer available
 *
 * @function
 * @name AbstractPlacerView.reject
 * @param {Array<Number>} disabledIndexes - Array of indexes of the disabled positions.
 */
/**
 * Register the callback to be applied when the user select a position.
 *
 * @function
 * @name AbstratPlacerView.onSelect
 * @param {Function} callback - Callback to be applied when a position is selected.
 *  This callback should be called with the `index`, `label` and `coordinates` of
 *  the requested position.
 */

var _ListView = function (_SquaredView) {
  (0, _inherits3.default)(_ListView, _SquaredView);

  function _ListView(template, content, events, options) {
    (0, _classCallCheck3.default)(this, _ListView);

    var _this = (0, _possibleConstructorReturn3.default)(this, (_ListView.__proto__ || (0, _getPrototypeOf2.default)(_ListView)).call(this, template, content, events, options));

    _this._onSelectionChange = _this._onSelectionChange.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(_ListView, [{
    key: '_onSelectionChange',
    value: function _onSelectionChange(e) {
      var _this2 = this;

      this.content.showBtn = true;
      this.render('.section-float');
      this.installEvents({
        'click .btn': function clickBtn(e) {
          var position = _this2.selector.value;

          if (position) _this2._onSelect(position.index, position.label, position.coordinates);
        }
      });
    }
  }, {
    key: 'setArea',
    value: function setArea(area) {/* no need for area */}
  }, {
    key: 'displayPositions',
    value: function displayPositions(capacity) {
      var labels = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var coordinates = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var maxClientsPerPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

      this.positions = [];
      this.numberPositions = capacity / maxClientsPerPosition;

      for (var index = 0; index < this.numberPositions; index++) {
        var label = labels !== null ? labels[index] : (index + 1).toString();
        var position = { index: index, label: label };

        if (coordinates) position.coordinates = coordinates[index];

        this.positions.push(position);
      }

      this.selector = new _SelectView2.default({
        instructions: this.content.instructions,
        entries: this.positions
      });

      this.setViewComponent('.section-square', this.selector);
      this.render('.section-square');

      this.selector.installEvents({
        'change': this._onSelectionChange
      });
    }
  }, {
    key: 'updateDisabledPositions',
    value: function updateDisabledPositions(indexes) {
      for (var index = 0; index < this.numberPositions; index++) {
        if (indexes.indexOf(index) === -1) this.selector.enableIndex(index);else this.selector.disableIndex(index);
      }
    }
  }, {
    key: 'onSelect',
    value: function onSelect(callback) {
      this._onSelect = callback;
    }
  }, {
    key: 'reject',
    value: function reject(disabledPositions) {
      if (disabledPositions.length >= this.numberPositions) {
        this.setViewComponent('.section-square');
        this.content.rejected = true;
        this.render();
      } else {
        this.disablePositions(disabledPositions);
      }
    }
  }]);
  return _ListView;
}(_SquaredView4.default);

var _GraphicView = function (_SquaredView2) {
  (0, _inherits3.default)(_GraphicView, _SquaredView2);

  function _GraphicView(template, content, events, options) {
    (0, _classCallCheck3.default)(this, _GraphicView);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (_GraphicView.__proto__ || (0, _getPrototypeOf2.default)(_GraphicView)).call(this, template, content, events, options));

    _this3._area = null;
    _this3._disabledPositions = [];
    _this3._onSelectionChange = _this3._onSelectionChange.bind(_this3);
    return _this3;
  }

  (0, _createClass3.default)(_GraphicView, [{
    key: '_onSelectionChange',
    value: function _onSelectionChange(e) {
      var position = this.selector.shapePointMap.get(e.target);
      var disabledIndex = this._disabledPositions.indexOf(position.index);

      if (disabledIndex === -1) this._onSelect(position.id, position.label, [position.x, position.y]);
    }
  }, {
    key: 'setArea',
    value: function setArea(area) {
      this._area = area;
    }
  }, {
    key: 'displayPositions',
    value: function displayPositions(capacity) {
      var labels = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var coordinates = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var maxClientsPerPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

      this.numberPositions = capacity / maxClientsPerPosition;
      this.positions = [];

      for (var i = 0; i < this.numberPositions; i++) {
        var label = labels !== null ? labels[i] : (i + 1).toString();
        var position = { id: i, label: label };
        var coords = coordinates[i];
        position.x = coords[0];
        position.y = coords[1];

        this.positions.push(position);
      }

      this.selector = new _SpaceView2.default();
      this.selector.setArea(this._area);
      this.setViewComponent('.section-square', this.selector);
      this.render('.section-square');

      this.selector.setPoints(this.positions);

      this.selector.installEvents({
        'click .point': this._onSelectionChange
      });
    }
  }, {
    key: 'updateDisabledPositions',
    value: function updateDisabledPositions(indexes) {
      this._disabledPositions = indexes;

      for (var index = 0; index < this.numberPositions; index++) {
        var position = this.positions[index];
        var isDisabled = indexes.indexOf(index) !== -1;
        position.selected = isDisabled ? true : false;
        this.selector.updatePoint(position);
      }
    }
  }, {
    key: 'onSelect',
    value: function onSelect(callback) {
      this._onSelect = callback;
    }
  }, {
    key: 'reject',
    value: function reject(disabledPositions) {
      if (disabledPositions.length >= this.numberPositions) {
        this.setViewComponent('.section-square');
        this.content.rejected = true;
        this.render();
      } else {
        this.view.updateDisabledPositions(disabledPositions);
      }
    }
  }]);
  return _GraphicView;
}(_SquaredView4.default);

/**
 * Interface for the `'placer'` service.
 *
 * This service is one of the provided services aimed at identifying clients inside
 * the experience along with the [`'locator'`]{@link module:soundworks/client.Locator}
 * and [`'checkin'`]{@link module:soundworks/client.Checkin} services.
 *
 * The `'placer'` service allows a client to choose its location among a set of
 * positions defined in the server's `setup` configuration entry.
 *
 * __*The service must be used with its [server-side counterpart]{@link module:soundworks/server.Placer}*__
 *
 * @see {@link module:soundworks/client.Locator}
 * @see {@link module:soundworks/client.Checkin}
 *
 * @param {Object} options
 * @param {String} [options.mode='list'] - Sets the interaction mode for the
 *  client to choose its position, the `'list'` mode proposes a drop-down menu
 *  while the `'graphic'` mode (which requires located positions) proposes an
 *  interface representing the area and dots for each available location.
 *
 * @memberof module:soundworks/client
 * @example
 * // inside the experience constructor
 * this.placer = this.require('placer', { mode: 'graphic' });
 */


var Placer = function (_Service) {
  (0, _inherits3.default)(Placer, _Service);

  /** _<span class="warning">__WARNING__</span> This class should never be instanciated manually_ */
  function Placer() {
    (0, _classCallCheck3.default)(this, Placer);

    var _this4 = (0, _possibleConstructorReturn3.default)(this, (Placer.__proto__ || (0, _getPrototypeOf2.default)(Placer)).call(this, SERVICE_ID, true));

    var defaults = {
      mode: 'list',
      view: null,
      viewCtor: null,
      viewPriority: 6
    };

    _this4.configure(defaults);

    _this4._defaultViewTemplate = defaultViewTemplate;
    _this4._defaultViewContent = defaultViewContent;

    _this4._onAknowledgeResponse = _this4._onAknowledgeResponse.bind(_this4);
    _this4._onClientJoined = _this4._onClientJoined.bind(_this4);
    _this4._onClientLeaved = _this4._onClientLeaved.bind(_this4);
    _this4._onSelect = _this4._onSelect.bind(_this4);
    _this4._onConfirmResponse = _this4._onConfirmResponse.bind(_this4);
    _this4._onRejectResponse = _this4._onRejectResponse.bind(_this4);

    _this4._sharedConfigService = _this4.require('shared-config');
    return _this4;
  }

  /** @private */


  (0, _createClass3.default)(Placer, [{
    key: 'init',
    value: function init() {
      /**
       * Index of the position selected by the user.
       * @type {Number}
       */
      this.index = null;

      /**
       * Label of the position selected by the user.
       * @type {String}
       */
      this.label = null;

      // allow to pass any view
      if (this.options.view !== null) {
        this.view = this.options.view;
      } else {
        if (this.options.viewCtor !== null) {} else {
          switch (this.options.mode) {
            default:
            case 'list':
              this.viewCtor = _ListView;
              break;

            case 'graphic':
              this.viewCtor = _GraphicView;
              break;
          }

          this.viewContent.mode = this.options.mode;
          this.view = this.createView();
        }
      }
    }

    /** @private */

  }, {
    key: 'start',
    value: function start() {
      (0, _get3.default)(Placer.prototype.__proto__ || (0, _getPrototypeOf2.default)(Placer.prototype), 'start', this).call(this);

      if (!this.hasStarted) this.init();

      this.show();
      this.send('request');

      this.receive('aknowlegde', this._onAknowledgeResponse);
      this.receive('confirm', this._onConfirmResponse);
      this.receive('reject', this._onRejectResponse);
      this.receive('client-joined', this._onClientJoined);
      this.receive('client-leaved', this._onClientLeaved);
    }

    /** @private */

  }, {
    key: 'stop',
    value: function stop() {
      this.removeListener('aknowlegde', this._onAknowledgeResponse);
      this.removeListener('confirm', this._onConfirmResponse);
      this.removeListener('reject', this._onRejectResponse);
      this.removeListener('client-joined', this._onClientJoined);
      this.removeListener('client-leaved', this._onClientLeaved);

      this.hide();
    }

    /** @private */

  }, {
    key: '_onAknowledgeResponse',
    value: function _onAknowledgeResponse(setupConfigItem, disabledPositions) {
      var setup = this._sharedConfigService.get(setupConfigItem);
      var area = setup.area;
      var capacity = setup.capacity;
      var labels = setup.labels;
      var coordinates = setup.coordinates;
      var maxClientsPerPosition = setup.maxClientsPerPosition;

      if (area) this.view.setArea(area);

      this.view.displayPositions(capacity, labels, coordinates, maxClientsPerPosition);
      this.view.updateDisabledPositions(disabledPositions);
      this.view.onSelect(this._onSelect);
    }

    /** @private */

  }, {
    key: '_onSelect',
    value: function _onSelect(index, label, coordinates) {
      this.send('position', index, label, coordinates);
    }

    /** @private */

  }, {
    key: '_onConfirmResponse',
    value: function _onConfirmResponse(index, label, coordinates) {
      _client2.default.index = this.index = index;
      _client2.default.label = this.label = label;
      _client2.default.coordinates = coordinates;

      this.ready();
    }

    /** @private */

  }, {
    key: '_onClientJoined',
    value: function _onClientJoined(disabledPositions) {
      this.view.updateDisabledPositions(disabledPositions);
    }

    /** @private */

  }, {
    key: '_onClientLeaved',
    value: function _onClientLeaved(disabledPositions) {
      this.view.updateDisabledPositions(disabledPositions);
    }

    /** @private */

  }, {
    key: '_onRejectResponse',
    value: function _onRejectResponse(disabledPositions) {
      this.view.reject(disabledPositions);
    }
  }]);
  return Placer;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, Placer);

exports.default = Placer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYWNlci5qcyJdLCJuYW1lcyI6WyJTRVJWSUNFX0lEIiwiZGVmYXVsdFZpZXdUZW1wbGF0ZSIsImRlZmF1bHRWaWV3Q29udGVudCIsImluc3RydWN0aW9ucyIsInNlbmQiLCJyZWplY3QiLCJzaG93QnRuIiwicmVqZWN0ZWQiLCJfTGlzdFZpZXciLCJ0ZW1wbGF0ZSIsImNvbnRlbnQiLCJldmVudHMiLCJvcHRpb25zIiwiX29uU2VsZWN0aW9uQ2hhbmdlIiwiYmluZCIsImUiLCJyZW5kZXIiLCJpbnN0YWxsRXZlbnRzIiwicG9zaXRpb24iLCJzZWxlY3RvciIsInZhbHVlIiwiX29uU2VsZWN0IiwiaW5kZXgiLCJsYWJlbCIsImNvb3JkaW5hdGVzIiwiYXJlYSIsImNhcGFjaXR5IiwibGFiZWxzIiwibWF4Q2xpZW50c1BlclBvc2l0aW9uIiwicG9zaXRpb25zIiwibnVtYmVyUG9zaXRpb25zIiwidG9TdHJpbmciLCJwdXNoIiwiZW50cmllcyIsInNldFZpZXdDb21wb25lbnQiLCJpbmRleGVzIiwiaW5kZXhPZiIsImVuYWJsZUluZGV4IiwiZGlzYWJsZUluZGV4IiwiY2FsbGJhY2siLCJkaXNhYmxlZFBvc2l0aW9ucyIsImxlbmd0aCIsImRpc2FibGVQb3NpdGlvbnMiLCJfR3JhcGhpY1ZpZXciLCJfYXJlYSIsIl9kaXNhYmxlZFBvc2l0aW9ucyIsInNoYXBlUG9pbnRNYXAiLCJnZXQiLCJ0YXJnZXQiLCJkaXNhYmxlZEluZGV4IiwiaWQiLCJ4IiwieSIsImkiLCJjb29yZHMiLCJzZXRBcmVhIiwic2V0UG9pbnRzIiwiaXNEaXNhYmxlZCIsInNlbGVjdGVkIiwidXBkYXRlUG9pbnQiLCJ2aWV3IiwidXBkYXRlRGlzYWJsZWRQb3NpdGlvbnMiLCJQbGFjZXIiLCJkZWZhdWx0cyIsIm1vZGUiLCJ2aWV3Q3RvciIsInZpZXdQcmlvcml0eSIsImNvbmZpZ3VyZSIsIl9kZWZhdWx0Vmlld1RlbXBsYXRlIiwiX2RlZmF1bHRWaWV3Q29udGVudCIsIl9vbkFrbm93bGVkZ2VSZXNwb25zZSIsIl9vbkNsaWVudEpvaW5lZCIsIl9vbkNsaWVudExlYXZlZCIsIl9vbkNvbmZpcm1SZXNwb25zZSIsIl9vblJlamVjdFJlc3BvbnNlIiwiX3NoYXJlZENvbmZpZ1NlcnZpY2UiLCJyZXF1aXJlIiwidmlld0NvbnRlbnQiLCJjcmVhdGVWaWV3IiwiaGFzU3RhcnRlZCIsImluaXQiLCJzaG93IiwicmVjZWl2ZSIsInJlbW92ZUxpc3RlbmVyIiwiaGlkZSIsInNldHVwQ29uZmlnSXRlbSIsInNldHVwIiwiZGlzcGxheVBvc2l0aW9ucyIsIm9uU2VsZWN0IiwicmVhZHkiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxhQUFhLGdCQUFuQjs7QUFFQSxJQUFNQyx1aEJBQU47O0FBb0JBLElBQU1DLHFCQUFxQjtBQUN6QkMsZ0JBQWMsc0JBRFc7QUFFekJDLFFBQU0sTUFGbUI7QUFHekJDLFVBQVEsOEJBSGlCO0FBSXpCQyxXQUFTLEtBSmdCO0FBS3pCQyxZQUFVO0FBTGUsQ0FBM0I7O0FBU0E7Ozs7OztBQU1BOzs7Ozs7Ozs7OztBQVdBOzs7Ozs7Ozs7O0FBVUE7Ozs7Ozs7QUFPQTs7Ozs7Ozs7QUFRQTs7Ozs7Ozs7OztJQVVNQyxTOzs7QUFDSixxQkFBWUMsUUFBWixFQUFzQkMsT0FBdEIsRUFBK0JDLE1BQS9CLEVBQXVDQyxPQUF2QyxFQUFnRDtBQUFBOztBQUFBLDRJQUN4Q0gsUUFEd0MsRUFDOUJDLE9BRDhCLEVBQ3JCQyxNQURxQixFQUNiQyxPQURhOztBQUc5QyxVQUFLQyxrQkFBTCxHQUEwQixNQUFLQSxrQkFBTCxDQUF3QkMsSUFBeEIsT0FBMUI7QUFIOEM7QUFJL0M7Ozs7dUNBRWtCQyxDLEVBQUc7QUFBQTs7QUFDcEIsV0FBS0wsT0FBTCxDQUFhSixPQUFiLEdBQXVCLElBQXZCO0FBQ0EsV0FBS1UsTUFBTCxD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VixDQUFrQ3JCLGlCQUFsQztBQUNEOztBQUVEOzs7O3NDQUNrQkEsaUIsRUFBbUI7QUFDbkMsV0FBS29CLElBQUwsQ0FBVXZELE1BQVYsQ0FBaUJtQyxpQkFBakI7QUFDRDs7Ozs7QUFHSCx5QkFBZWtELFFBQWYsQ0FBd0IxRixVQUF4QixFQUFvQzhELE1BQXBDOztrQkFFZUEsTSIsImZpbGUiOiJQbGFjZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2xpZW50IGZyb20gJy4uL2NvcmUvY2xpZW50JztcbmltcG9ydCBTZXJ2aWNlIGZyb20gJy4uL2NvcmUvU2VydmljZSc7XG5pbXBvcnQgc2VydmljZU1hbmFnZXIgZnJvbSAnLi4vY29yZS9zZXJ2aWNlTWFuYWdlcic7XG5pbXBvcnQgU2VsZWN0VmlldyBmcm9tICcuLi92aWV3cy9TZWxlY3RWaWV3JztcbmltcG9ydCBTcGFjZVZpZXcgZnJvbSAnLi4vdmlld3MvU3BhY2VWaWV3JztcbmltcG9ydCBTcXVhcmVkVmlldyBmcm9tICcuLi92aWV3cy9TcXVhcmVkVmlldyc7XG5cbmNvbnN0IFNFUlZJQ0VfSUQgPSAnc2VydmljZTpwbGFjZXInO1xuXG5jb25zdCBkZWZhdWx0Vmlld1RlbXBsYXRlID0gYFxuPGRpdiBjbGFzcz1cInNlY3Rpb24tc3F1YXJlPCU9IG1vZGUgPT09ICdsaXN0JyA/ICcgZmxleC1taWRkbGUnIDogJycgJT5cIj5cbiAgPCUgaWYgKHJlamVjdGVkKSB7ICU+XG4gIDxkaXYgY2xhc3M9XCJmaXQtY29udGFpbmVyIGZsZXgtbWlkZGxlXCI+XG4gICAgPHA+PCU9IHJlamVjdCAlPjwvcD5cbiAgPC9kaXY+XG4gIDwlIH0gJT5cbjwvZGl2PlxuPGRpdiBjbGFzcz1cInNlY3Rpb24tZmxvYXQgZmxleC1taWRkbGVcIj5cbiAgPCUgaWYgKCFyZWplY3RlZCkgeyAlPlxuICAgIDwlIGlmIChtb2RlID09PSAnZ3JhcGhpYycpIHsgJT5cbiAgICAgIDxwPjwlPSBpbnN0cnVjdGlvbnMgJT48L3A+XG4gICAgPCUgfSBlbHNlIGlmIChtb2RlID09PSAnbGlzdCcpIHsgJT5cbiAgICAgIDwlIGlmIChzaG93QnRuKSB7ICU+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG5cIj48JT0gc2VuZCAlPjwvYnV0dG9uPlxuICAgICAgPCUgfSAlPlxuICAgIDwlIH0gJT5cbiAgPCUgfSAlPlxuPC9kaXY+YDtcblxuY29uc3QgZGVmYXVsdFZpZXdDb250ZW50ID0ge1xuICBpbnN0cnVjdGlvbnM6ICdTZWxlY3QgeW91ciBwb3NpdGlvbicsXG4gIHNlbmQ6ICdTZW5kJyxcbiAgcmVqZWN0OiAnU29ycnksIG5vIHBsYWNlIGlzIGF2YWlsYWJsZScsXG4gIHNob3dCdG46IGZhbHNlLFxuICByZWplY3RlZDogZmFsc2UsXG59O1xuXG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUgdmlldyBvZiB0aGUgYHBsYWNlcmAgc2VydmljZS5cbiAqXG4gKiBAaW50ZXJmYWNlIEFic3RyYWN0UGxhY2VyVmlld1xuICogQGV4dGVuZHMgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlZpZXdcbiAqL1xuLyoqXG4gKiBSZWdpc3RlciB0aGUgYGFyZWFgIGRlZmluaXRpb24gdG8gdGhlIHZpZXcuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBBYnN0cmFjdFBsYWNlclZpZXcuc2V0QXJlYVxuICogQHBhcmFtIHtPYmplY3R9IGFyZWEgLSBEZWZpbml0aW9uIG9mIHRoZSBhcmVhLlxuICogQHByb3BlcnR5IHtOdW1iZXJ9IGFyZWEud2lkdGggLSBXaXRoIG9mIHRoZSBhcmVhLlxuICogQHByb3BlcnR5IHtOdW1iZXJ9IGFyZWEuaGVpZ2h0IC0gSGVpZ2h0IG9mIHRoZSBhcmVhLlxuICogQHByb3BlcnR5IHtOdW1iZXJ9IFthcmVhLmxhYmVscz1bXV0gLSBMYWJlbHMgb2YgdGhlIHBvc2l0aW9uLlxuICogQHByb3BlcnR5IHtOdW1iZXJ9IFthcmVhLmNvb3JkaW5hdGVzPVtdXSAtIENvb3JkaW5hdGVzIG9mIHRoZSBhcmVhLlxuICovXG4vKipcbiAqIERpc3BsYXkgdGhlIGF2YWlsYWJsZSBwb3NpdGlvbnMuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBBYnN0cmFjdFBsYWNlclZpZXcuZGlzcGxheVBvc2l0aW9uc1xuICogQHBhcmFtIHtOdW1iZXJ9IGNhcGFjaXR5IC0gVGhlIG1heGltdW0gbnVtYmVyIG9mIGNsaWVudHMgYWxsb3dlZC5cbiAqIEBwYXJhbSB7QXJyYXk8U3RyaW5nPn0gW2xhYmVscz1udWxsXSAtIEFuIGFycmF5IG9mIHRoZSBsYWJlbHMgZm9yIHRoZSBwb3NpdGlvbnNcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8TnVtYmVyPj59IFtjb29yZGluYXRlcz1udWxsXSAtIEFuIGFycmF5IG9mIHRoZSBjb29yZGluYXRlcyBvZiB0aGUgcG9zaXRpb25zXG4gKiBAcGFyYW0ge051bWJlcn0gW21heENsaWVudHNQZXJQb3NpdGlvbj0xXSAtIE51bWJlciBvZiBjbGllbnRzIGFsbG93ZWQgZm9yIGVhY2ggcG9zaXRpb24uXG4gKi9cbi8qKlxuICogRGlzYWJsZSB0aGUgZ2l2ZW4gcG9zaXRpb25zLlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgQWJzdHJhY3RQbGFjZXJWaWV3LnVwZGF0ZURpc2FibGVkUG9zaXRpb25zXG4gKiBAcGFyYW0ge0FycmF5PE51bWJlcj59IGRpc2FibGVkSW5kZXhlcyAtIEFycmF5IG9mIGluZGV4ZXMgb2YgdGhlIGRpc2FibGVkIHBvc2l0aW9ucy5cbiAqL1xuLyoqXG4gKiBEZWZpbmUgdGhlIGJlaGF2aW9yIG9mIHRoZSB2aWV3IHdoZW4gdGhlIHBvc2l0aW9uIHJlcXVlc3RlZCBieSB0aGUgdXNlciBpc1xuICogbm8gbG9uZ2VyIGF2YWlsYWJsZVxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgQWJzdHJhY3RQbGFjZXJWaWV3LnJlamVjdFxuICogQHBhcmFtIHtBcnJheTxOdW1iZXI+fSBkaXNhYmxlZEluZGV4ZXMgLSBBcnJheSBvZiBpbmRleGVzIG9mIHRoZSBkaXNhYmxlZCBwb3NpdGlvbnMuXG4gKi9cbi8qKlxuICogUmVnaXN0ZXIgdGhlIGNhbGxiYWNrIHRvIGJlIGFwcGxpZWQgd2hlbiB0aGUgdXNlciBzZWxlY3QgYSBwb3NpdGlvbi5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIEFic3RyYXRQbGFjZXJWaWV3Lm9uU2VsZWN0XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIENhbGxiYWNrIHRvIGJlIGFwcGxpZWQgd2hlbiBhIHBvc2l0aW9uIGlzIHNlbGVjdGVkLlxuICogIFRoaXMgY2FsbGJhY2sgc2hvdWxkIGJlIGNhbGxlZCB3aXRoIHRoZSBgaW5kZXhgLCBgbGFiZWxgIGFuZCBgY29vcmRpbmF0ZXNgIG9mXG4gKiAgdGhlIHJlcXVlc3RlZCBwb3NpdGlvbi5cbiAqL1xuXG5jbGFzcyBfTGlzdFZpZXcgZXh0ZW5kcyBTcXVhcmVkVmlldyB7XG4gIGNvbnN0cnVjdG9yKHRlbXBsYXRlLCBjb250ZW50LCBldmVudHMsIG9wdGlvbnMpIHtcbiAgICBzdXBlcih0ZW1wbGF0ZSwgY29udGVudCwgZXZlbnRzLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX29uU2VsZWN0aW9uQ2hhbmdlID0gdGhpcy5fb25TZWxlY3Rpb25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgfVxuXG4gIF9vblNlbGVjdGlvbkNoYW5nZShlKSB7XG4gICAgdGhpcy5jb250ZW50LnNob3dCdG4gPSB0cnVlO1xuICAgIHRoaXMucmVuZGVyKCcuc2VjdGlvbi1mbG9hdCcpO1xuICAgIHRoaXMuaW5zdGFsbEV2ZW50cyh7XG4gICAgICAnY2xpY2sgLmJ0bic6IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5zZWxlY3Rvci52YWx1ZTtcblxuICAgICAgICBpZiAocG9zaXRpb24pXG4gICAgICAgICAgdGhpcy5fb25TZWxlY3QocG9zaXRpb24uaW5kZXgsIHBvc2l0aW9uLmxhYmVsLCBwb3NpdGlvbi5jb29yZGluYXRlcyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzZXRBcmVhKGFyZWEpIHsgLyogbm8gbmVlZCBmb3IgYXJlYSAqLyB9XG5cbiAgZGlzcGxheVBvc2l0aW9ucyhjYXBhY2l0eSwgbGFiZWxzID0gbnVsbCwgY29vcmRpbmF0ZXMgPSBudWxsLCBtYXhDbGllbnRzUGVyUG9zaXRpb24gPSAxKSB7XG4gICAgdGhpcy5wb3NpdGlvbnMgPSBbXTtcbiAgICB0aGlzLm51bWJlclBvc2l0aW9ucyA9IGNhcGFjaXR5IC8gbWF4Q2xpZW50c1BlclBvc2l0aW9uO1xuXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMubnVtYmVyUG9zaXRpb25zOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBsYWJlbCA9IGxhYmVscyAhPT0gbnVsbCA/IGxhYmVsc1tpbmRleF0gOiAoaW5kZXggKyAxKS50b1N0cmluZygpO1xuICAgICAgY29uc3QgcG9zaXRpb24gPSB7IGluZGV4OiBpbmRleCwgbGFiZWw6IGxhYmVsIH07XG5cbiAgICAgIGlmIChjb29yZGluYXRlcylcbiAgICAgICAgcG9zaXRpb24uY29vcmRpbmF0ZXMgPSBjb29yZGluYXRlc1tpbmRleF07XG5cbiAgICAgIHRoaXMucG9zaXRpb25zLnB1c2gocG9zaXRpb24pO1xuICAgIH1cblxuICAgIHRoaXMuc2VsZWN0b3IgPSBuZXcgU2VsZWN0Vmlldyh7XG4gICAgICBpbnN0cnVjdGlvbnM6IHRoaXMuY29udGVudC5pbnN0cnVjdGlvbnMsXG4gICAgICBlbnRyaWVzOiB0aGlzLnBvc2l0aW9ucyxcbiAgICB9KTtcblxuICAgIHRoaXMuc2V0Vmlld0NvbXBvbmVudCgnLnNlY3Rpb24tc3F1YXJlJywgdGhpcy5zZWxlY3Rvcik7XG4gICAgdGhpcy5yZW5kZXIoJy5zZWN0aW9uLXNxdWFyZScpO1xuXG4gICAgdGhpcy5zZWxlY3Rvci5pbnN0YWxsRXZlbnRzKHtcbiAgICAgICdjaGFuZ2UnOiB0aGlzLl9vblNlbGVjdGlvbkNoYW5nZSxcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZURpc2FibGVkUG9zaXRpb25zKGluZGV4ZXMpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5udW1iZXJQb3NpdGlvbnM7IGluZGV4KyspIHtcbiAgICAgIGlmIChpbmRleGVzLmluZGV4T2YoaW5kZXgpID09PSAtMSlcbiAgICAgICAgdGhpcy5zZWxlY3Rvci5lbmFibGVJbmRleChpbmRleCk7XG4gICAgICBlbHNlXG4gICAgICAgIHRoaXMuc2VsZWN0b3IuZGlzYWJsZUluZGV4KGluZGV4KTtcbiAgICB9XG4gIH1cblxuICBvblNlbGVjdChjYWxsYmFjaykge1xuICAgIHRoaXMuX29uU2VsZWN0ID0gY2FsbGJhY2s7XG4gIH1cblxuICByZWplY3QoZGlzYWJsZWRQb3NpdGlvbnMpIHtcbiAgICBpZiAoZGlzYWJsZWRQb3NpdGlvbnMubGVuZ3RoID49IHRoaXMubnVtYmVyUG9zaXRpb25zKSB7XG4gICAgICB0aGlzLnNldFZpZXdDb21wb25lbnQoJy5zZWN0aW9uLXNxdWFyZScpO1xuICAgICAgdGhpcy5jb250ZW50LnJlamVjdGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGlzYWJsZVBvc2l0aW9ucyhkaXNhYmxlZFBvc2l0aW9ucyk7XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIF9HcmFwaGljVmlldyBleHRlbmRzIFNxdWFyZWRWaWV3IHtcbiAgY29uc3RydWN0b3IodGVtcGxhdGUsIGNvbnRlbnQsIGV2ZW50cywgb3B0aW9ucykge1xuICAgIHN1cGVyKHRlbXBsYXRlLCBjb250ZW50LCBldmVudHMsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5fYXJlYSA9IG51bGw7XG4gICAgdGhpcy5fZGlzYWJsZWRQb3NpdGlvbnMgPSBbXTtcbiAgICB0aGlzLl9vblNlbGVjdGlvbkNoYW5nZSA9IHRoaXMuX29uU2VsZWN0aW9uQ2hhbmdlLmJpbmQodGhpcyk7XG4gIH1cblxuICBfb25TZWxlY3Rpb25DaGFuZ2UoZSkge1xuICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5zZWxlY3Rvci5zaGFwZVBvaW50TWFwLmdldChlLnRhcmdldCk7XG4gICAgY29uc3QgZGlzYWJsZWRJbmRleCA9IHRoaXMuX2Rpc2FibGVkUG9zaXRpb25zLmluZGV4T2YocG9zaXRpb24uaW5kZXgpO1xuXG4gICAgaWYgKGRpc2FibGVkSW5kZXggPT09IC0xKVxuICAgICAgdGhpcy5fb25TZWxlY3QocG9zaXRpb24uaWQsIHBvc2l0aW9uLmxhYmVsLCBbcG9zaXRpb24ueCwgcG9zaXRpb24ueV0pO1xuICB9XG5cbiAgc2V0QXJlYShhcmVhKSB7XG4gICAgdGhpcy5fYXJlYSA9IGFyZWE7XG4gIH1cblxuICBkaXNwbGF5UG9zaXRpb25zKGNhcGFjaXR5LCBsYWJlbHMgPSBudWxsLCBjb29yZGluYXRlcyA9IG51bGwsIG1heENsaWVudHNQZXJQb3NpdGlvbiA9IDEpIHtcbiAgICB0aGlzLm51bWJlclBvc2l0aW9ucyA9IGNhcGFjaXR5IC8gbWF4Q2xpZW50c1BlclBvc2l0aW9uO1xuICAgIHRoaXMucG9zaXRpb25zID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubnVtYmVyUG9zaXRpb25zOyBpKyspIHtcbiAgICAgIGNvbnN0IGxhYmVsID0gbGFiZWxzICE9PSBudWxsID8gbGFiZWxzW2ldIDogKGkgKyAxKS50b1N0cmluZygpO1xuICAgICAgY29uc3QgcG9zaXRpb24gPSB7IGlkOiBpLCBsYWJlbDogbGFiZWwgfTtcbiAgICAgIGNvbnN0IGNvb3JkcyA9IGNvb3JkaW5hdGVzW2ldO1xuICAgICAgcG9zaXRpb24ueCA9IGNvb3Jkc1swXTtcbiAgICAgIHBvc2l0aW9uLnkgPSBjb29yZHNbMV07XG5cbiAgICAgIHRoaXMucG9zaXRpb25zLnB1c2gocG9zaXRpb24pO1xuICAgIH1cblxuICAgIHRoaXMuc2VsZWN0b3IgPSBuZXcgU3BhY2VWaWV3KCk7XG4gICAgdGhpcy5zZWxlY3Rvci5zZXRBcmVhKHRoaXMuX2FyZWEpO1xuICAgIHRoaXMuc2V0Vmlld0NvbXBvbmVudCgnLnNlY3Rpb24tc3F1YXJlJywgdGhpcy5zZWxlY3Rvcik7XG4gICAgdGhpcy5yZW5kZXIoJy5zZWN0aW9uLXNxdWFyZScpO1xuXG4gICAgdGhpcy5zZWxlY3Rvci5zZXRQb2ludHModGhpcy5wb3NpdGlvbnMpO1xuXG4gICAgdGhpcy5zZWxlY3Rvci5pbnN0YWxsRXZlbnRzKHtcbiAgICAgICdjbGljayAucG9pbnQnOiB0aGlzLl9vblNlbGVjdGlvbkNoYW5nZVxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlRGlzYWJsZWRQb3NpdGlvbnMoaW5kZXhlcykge1xuICAgIHRoaXMuX2Rpc2FibGVkUG9zaXRpb25zID0gaW5kZXhlcztcblxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLm51bWJlclBvc2l0aW9uczsgaW5kZXgrKykge1xuICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uc1tpbmRleF07XG4gICAgICBjb25zdCBpc0Rpc2FibGVkID0gaW5kZXhlcy5pbmRleE9mKGluZGV4KSAhPT0gLTE7XG4gICAgICBwb3NpdGlvbi5zZWxlY3RlZCA9IGlzRGlzYWJsZWQgPyB0cnVlIDogZmFsc2U7XG4gICAgICB0aGlzLnNlbGVjdG9yLnVwZGF0ZVBvaW50KHBvc2l0aW9uKTtcbiAgICB9XG4gIH1cblxuICBvblNlbGVjdChjYWxsYmFjaykge1xuICAgIHRoaXMuX29uU2VsZWN0ID0gY2FsbGJhY2s7XG4gIH1cblxuICByZWplY3QoZGlzYWJsZWRQb3NpdGlvbnMpIHtcbiAgICBpZiAoZGlzYWJsZWRQb3NpdGlvbnMubGVuZ3RoID49IHRoaXMubnVtYmVyUG9zaXRpb25zKSB7XG4gICAgICB0aGlzLnNldFZpZXdDb21wb25lbnQoJy5zZWN0aW9uLXNxdWFyZScpO1xuICAgICAgdGhpcy5jb250ZW50LnJlamVjdGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudmlldy51cGRhdGVEaXNhYmxlZFBvc2l0aW9ucyhkaXNhYmxlZFBvc2l0aW9ucyk7XG4gICAgfVxuICB9XG59XG5cblxuLyoqXG4gKiBJbnRlcmZhY2UgZm9yIHRoZSBgJ3BsYWNlcidgIHNlcnZpY2UuXG4gKlxuICogVGhpcyBzZXJ2aWNlIGlzIG9uZSBvZiB0aGUgcHJvdmlkZWQgc2VydmljZXMgYWltZWQgYXQgaWRlbnRpZnlpbmcgY2xpZW50cyBpbnNpZGVcbiAqIHRoZSBleHBlcmllbmNlIGFsb25nIHdpdGggdGhlIFtgJ2xvY2F0b3InYF17QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LkxvY2F0b3J9XG4gKiBhbmQgW2AnY2hlY2tpbidgXXtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuQ2hlY2tpbn0gc2VydmljZXMuXG4gKlxuICogVGhlIGAncGxhY2VyJ2Agc2VydmljZSBhbGxvd3MgYSBjbGllbnQgdG8gY2hvb3NlIGl0cyBsb2NhdGlvbiBhbW9uZyBhIHNldCBvZlxuICogcG9zaXRpb25zIGRlZmluZWQgaW4gdGhlIHNlcnZlcidzIGBzZXR1cGAgY29uZmlndXJhdGlvbiBlbnRyeS5cbiAqXG4gKiBfXypUaGUgc2VydmljZSBtdXN0IGJlIHVzZWQgd2l0aCBpdHMgW3NlcnZlci1zaWRlIGNvdW50ZXJwYXJ0XXtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9zZXJ2ZXIuUGxhY2VyfSpfX1xuICpcbiAqIEBzZWUge0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5Mb2NhdG9yfVxuICogQHNlZSB7QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LkNoZWNraW59XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5tb2RlPSdsaXN0J10gLSBTZXRzIHRoZSBpbnRlcmFjdGlvbiBtb2RlIGZvciB0aGVcbiAqICBjbGllbnQgdG8gY2hvb3NlIGl0cyBwb3NpdGlvbiwgdGhlIGAnbGlzdCdgIG1vZGUgcHJvcG9zZXMgYSBkcm9wLWRvd24gbWVudVxuICogIHdoaWxlIHRoZSBgJ2dyYXBoaWMnYCBtb2RlICh3aGljaCByZXF1aXJlcyBsb2NhdGVkIHBvc2l0aW9ucykgcHJvcG9zZXMgYW5cbiAqICBpbnRlcmZhY2UgcmVwcmVzZW50aW5nIHRoZSBhcmVhIGFuZCBkb3RzIGZvciBlYWNoIGF2YWlsYWJsZSBsb2NhdGlvbi5cbiAqXG4gKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50XG4gKiBAZXhhbXBsZVxuICogLy8gaW5zaWRlIHRoZSBleHBlcmllbmNlIGNvbnN0cnVjdG9yXG4gKiB0aGlzLnBsYWNlciA9IHRoaXMucmVxdWlyZSgncGxhY2VyJywgeyBtb2RlOiAnZ3JhcGhpYycgfSk7XG4gKi9cbmNsYXNzIFBsYWNlciBleHRlbmRzIFNlcnZpY2Uge1xuICAvKiogXzxzcGFuIGNsYXNzPVwid2FybmluZ1wiPl9fV0FSTklOR19fPC9zcGFuPiBUaGlzIGNsYXNzIHNob3VsZCBuZXZlciBiZSBpbnN0YW5jaWF0ZWQgbWFudWFsbHlfICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKFNFUlZJQ0VfSUQsIHRydWUpO1xuXG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgICBtb2RlOiAnbGlzdCcsXG4gICAgICB2aWV3OiBudWxsLFxuICAgICAgdmlld0N0b3I6IG51bGwsXG4gICAgICB2aWV3UHJpb3JpdHk6IDYsXG4gICAgfTtcblxuICAgIHRoaXMuY29uZmlndXJlKGRlZmF1bHRzKTtcblxuICAgIHRoaXMuX2RlZmF1bHRWaWV3VGVtcGxhdGUgPSBkZWZhdWx0Vmlld1RlbXBsYXRlO1xuICAgIHRoaXMuX2RlZmF1bHRWaWV3Q29udGVudCA9IGRlZmF1bHRWaWV3Q29udGVudDtcblxuICAgIHRoaXMuX29uQWtub3dsZWRnZVJlc3BvbnNlID0gdGhpcy5fb25Ba25vd2xlZGdlUmVzcG9uc2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vbkNsaWVudEpvaW5lZCA9IHRoaXMuX29uQ2xpZW50Sm9pbmVkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25DbGllbnRMZWF2ZWQgPSB0aGlzLl9vbkNsaWVudExlYXZlZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uU2VsZWN0ID0gdGhpcy5fb25TZWxlY3QuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vbkNvbmZpcm1SZXNwb25zZSA9IHRoaXMuX29uQ29uZmlybVJlc3BvbnNlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25SZWplY3RSZXNwb25zZSA9IHRoaXMuX29uUmVqZWN0UmVzcG9uc2UuYmluZCh0aGlzKTtcblxuICAgIHRoaXMuX3NoYXJlZENvbmZpZ1NlcnZpY2UgPSB0aGlzLnJlcXVpcmUoJ3NoYXJlZC1jb25maWcnKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBpbml0KCkge1xuICAgIC8qKlxuICAgICAqIEluZGV4IG9mIHRoZSBwb3NpdGlvbiBzZWxlY3RlZCBieSB0aGUgdXNlci5cbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuaW5kZXggPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogTGFiZWwgb2YgdGhlIHBvc2l0aW9uIHNlbGVjdGVkIGJ5IHRoZSB1c2VyLlxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5sYWJlbCA9IG51bGw7XG5cbiAgICAvLyBhbGxvdyB0byBwYXNzIGFueSB2aWV3XG4gICAgaWYgKHRoaXMub3B0aW9ucy52aWV3ICE9PSBudWxsKSB7XG4gICAgICB0aGlzLnZpZXcgPSB0aGlzLm9wdGlvbnMudmlldztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy52aWV3Q3RvciAhPT0gbnVsbCkge1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzd2l0Y2ggKHRoaXMub3B0aW9ucy5tb2RlKSB7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBjYXNlICdsaXN0JzpcbiAgICAgICAgICAgIHRoaXMudmlld0N0b3IgPSBfTGlzdFZpZXc7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgJ2dyYXBoaWMnOlxuICAgICAgICAgICAgdGhpcy52aWV3Q3RvciA9IF9HcmFwaGljVmlldztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy52aWV3Q29udGVudC5tb2RlID0gdGhpcy5vcHRpb25zLm1vZGU7XG4gICAgICAgIHRoaXMudmlldyA9IHRoaXMuY3JlYXRlVmlldygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuXG4gICAgaWYgKCF0aGlzLmhhc1N0YXJ0ZWQpXG4gICAgICB0aGlzLmluaXQoKTtcblxuICAgIHRoaXMuc2hvdygpO1xuICAgIHRoaXMuc2VuZCgncmVxdWVzdCcpO1xuXG4gICAgdGhpcy5yZWNlaXZlKCdha25vd2xlZ2RlJywgdGhpcy5fb25Ba25vd2xlZGdlUmVzcG9uc2UpO1xuICAgIHRoaXMucmVjZWl2ZSgnY29uZmlybScsIHRoaXMuX29uQ29uZmlybVJlc3BvbnNlKTtcbiAgICB0aGlzLnJlY2VpdmUoJ3JlamVjdCcsIHRoaXMuX29uUmVqZWN0UmVzcG9uc2UpO1xuICAgIHRoaXMucmVjZWl2ZSgnY2xpZW50LWpvaW5lZCcsIHRoaXMuX29uQ2xpZW50Sm9pbmVkKTtcbiAgICB0aGlzLnJlY2VpdmUoJ2NsaWVudC1sZWF2ZWQnLCB0aGlzLl9vbkNsaWVudExlYXZlZCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgc3RvcCgpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKCdha25vd2xlZ2RlJywgdGhpcy5fb25Ba25vd2xlZGdlUmVzcG9uc2UpO1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIoJ2NvbmZpcm0nLCB0aGlzLl9vbkNvbmZpcm1SZXNwb25zZSk7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcigncmVqZWN0JywgdGhpcy5fb25SZWplY3RSZXNwb25zZSk7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcignY2xpZW50LWpvaW5lZCcsIHRoaXMuX29uQ2xpZW50Sm9pbmVkKTtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKCdjbGllbnQtbGVhdmVkJywgdGhpcy5fb25DbGllbnRMZWF2ZWQpO1xuXG4gICAgdGhpcy5oaWRlKCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX29uQWtub3dsZWRnZVJlc3BvbnNlKHNldHVwQ29uZmlnSXRlbSwgZGlzYWJsZWRQb3NpdGlvbnMpIHtcbiAgICBjb25zdCBzZXR1cCA9IHRoaXMuX3NoYXJlZENvbmZpZ1NlcnZpY2UuZ2V0KHNldHVwQ29uZmlnSXRlbSk7XG4gICAgY29uc3QgYXJlYSA9IHNldHVwLmFyZWE7XG4gICAgY29uc3QgY2FwYWNpdHkgPSBzZXR1cC5jYXBhY2l0eTtcbiAgICBjb25zdCBsYWJlbHMgPSBzZXR1cC5sYWJlbHM7XG4gICAgY29uc3QgY29vcmRpbmF0ZXMgPSBzZXR1cC5jb29yZGluYXRlcztcbiAgICBjb25zdCBtYXhDbGllbnRzUGVyUG9zaXRpb24gPSBzZXR1cC5tYXhDbGllbnRzUGVyUG9zaXRpb247XG5cbiAgICBpZiAoYXJlYSlcbiAgICAgIHRoaXMudmlldy5zZXRBcmVhKGFyZWEpO1xuXG4gICAgdGhpcy52aWV3LmRpc3BsYXlQb3NpdGlvbnMoY2FwYWNpdHksIGxhYmVscywgY29vcmRpbmF0ZXMsIG1heENsaWVudHNQZXJQb3NpdGlvbik7XG4gICAgdGhpcy52aWV3LnVwZGF0ZURpc2FibGVkUG9zaXRpb25zKGRpc2FibGVkUG9zaXRpb25zKTtcbiAgICB0aGlzLnZpZXcub25TZWxlY3QodGhpcy5fb25TZWxlY3QpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9vblNlbGVjdChpbmRleCwgbGFiZWwsIGNvb3JkaW5hdGVzKSB7XG4gICAgdGhpcy5zZW5kKCdwb3NpdGlvbicsIGluZGV4LCBsYWJlbCwgY29vcmRpbmF0ZXMpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9vbkNvbmZpcm1SZXNwb25zZShpbmRleCwgbGFiZWwsIGNvb3JkaW5hdGVzKSB7XG4gICAgY2xpZW50LmluZGV4ID0gdGhpcy5pbmRleCA9IGluZGV4O1xuICAgIGNsaWVudC5sYWJlbCA9IHRoaXMubGFiZWwgPSBsYWJlbDtcbiAgICBjbGllbnQuY29vcmRpbmF0ZXMgPSBjb29yZGluYXRlcztcblxuICAgIHRoaXMucmVhZHkoKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfb25DbGllbnRKb2luZWQoZGlzYWJsZWRQb3NpdGlvbnMpIHtcbiAgICB0aGlzLnZpZXcudXBkYXRlRGlzYWJsZWRQb3NpdGlvbnMoZGlzYWJsZWRQb3NpdGlvbnMpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9vbkNsaWVudExlYXZlZChkaXNhYmxlZFBvc2l0aW9ucykge1xuICAgIHRoaXMudmlldy51cGRhdGVEaXNhYmxlZFBvc2l0aW9ucyhkaXNhYmxlZFBvc2l0aW9ucyk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX29uUmVqZWN0UmVzcG9uc2UoZGlzYWJsZWRQb3NpdGlvbnMpIHtcbiAgICB0aGlzLnZpZXcucmVqZWN0KGRpc2FibGVkUG9zaXRpb25zKTtcbiAgfVxufVxuXG5zZXJ2aWNlTWFuYWdlci5yZWdpc3RlcihTRVJWSUNFX0lELCBQbGFjZXIpO1xuXG5leHBvcnQgZGVmYXVsdCBQbGFjZXI7XG4iXX0=