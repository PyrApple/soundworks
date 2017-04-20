'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _basicControllers = require('basic-controllers');

var controllers = _interopRequireWildcard(_basicControllers);

var _client = require('../core/client');

var _client2 = _interopRequireDefault(_client);

var _Scene2 = require('../core/Scene');

var _Scene3 = _interopRequireDefault(_Scene2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

controllers.setTheme('dark');

/* --------------------------------------------------------- */
/* GUIs
/* --------------------------------------------------------- */

/** @private */

var _BooleanGui = function () {
  function _BooleanGui($container, param, guiOptions) {
    (0, _classCallCheck3.default)(this, _BooleanGui);
    var label = param.label,
        value = param.value;


    this.controller = new controllers.Toggle({
      label: label,
      default: value,
      container: $container,
      callback: function callback(value) {
        if (guiOptions.confirm) {
          var msg = 'Are you sure you want to propagate "' + param.name + ':' + value + '"';
          if (!window.confirm(msg)) {
            return;
          }
        }

        param.update(value);
      }
    });
  }

  (0, _createClass3.default)(_BooleanGui, [{
    key: 'set',
    value: function set(val) {
      this.controller.value = val;
    }
  }]);
  return _BooleanGui;
}();

/** @private */


var _EnumGui = function () {
  function _EnumGui($container, param, guiOptions) {
    (0, _classCallCheck3.default)(this, _EnumGui);
    var label = param.label,
        options = param.options,
        value = param.value;


    var ctor = guiOptions.type === 'buttons' ? controllers.SelectButtons : controllers.SelectList;

    this.controller = new ctor({
      label: label,
      options: options,
      default: value,
      container: $container,
      callback: function callback(value) {
        if (guiOptions.confirm) {
          var msg = 'Are you sure you want to propagate "' + param.name + ':' + value + '"';
          if (!window.confirm(msg)) {
            return;
          }
        }

        param.update(value);
      }
    });
  }

  (0, _createClass3.default)(_EnumGui, [{
    key: 'set',
    value: function set(val) {
      this.controller.value = val;
    }
  }]);
  return _EnumGui;
}();

/** @private */


var _NumberGui = function () {
  function _NumberGui($container, param, guiOptions) {
    (0, _classCallCheck3.default)(this, _NumberGui);
    var label = param.label,
        min = param.min,
        max = param.max,
        step = param.step,
        value = param.value;


    if (guiOptions.type === 'slider') {
      this.controller = new controllers.Slider({
        label: label,
        min: min,
        max: max,
        step: step,
        default: value,
        unit: guiOptions.param ? guiOptions.param : '',
        size: guiOptions.size,
        container: $container
      });
    } else {
      this.controller = new controllers.NumberBox({
        label: label,
        min: min,
        max: max,
        step: step,
        default: value,
        container: $container
      });
    }

    this.controller.addListener(function (value) {
      if (guiOptions.confirm) {
        var msg = 'Are you sure you want to propagate "' + param.name + ':' + value + '"';
        if (!window.confirm(msg)) {
          return;
        }
      }

      param.update(value);
    });
  }

  (0, _createClass3.default)(_NumberGui, [{
    key: 'set',
    value: function set(val) {
      this.controller.value = val;
    }
  }]);
  return _NumberGui;
}();

/** @private */


var _TextGui = function () {
  function _TextGui($container, param, guiOptions) {
    (0, _classCallCheck3.default)(this, _TextGui);
    var label = param.label,
        value = param.value;


    this.controller = new controllers.Text({
      label: label,
      default: value,
      readonly: guiOptions.readonly,
      container: $container
    });

    if (!guiOptions.readonly) {
      this.controller.addListener(function (value) {
        if (guiOptions.confirm) {
          var msg = 'Are you sure you want to propagate "' + param.name + '"';
          if (!window.confirm(msg)) {
            return;
          }
        }

        param.update(value);
      });
    }
  }

  (0, _createClass3.default)(_TextGui, [{
    key: 'set',
    value: function set(val) {
      this.controller.value = val;
    }
  }]);
  return _TextGui;
}();

/** @private */


var _TriggerGui = function () {
  function _TriggerGui($container, param, guiOptions) {
    (0, _classCallCheck3.default)(this, _TriggerGui);
    var label = param.label;


    this.controller = new controllers.TriggerButtons({
      options: [label],
      container: $container,
      callback: function callback() {
        if (guiOptions.confirm) {
          var msg = 'Are you sure you want to propagate "' + param.name + '"';
          if (!window.confirm(msg)) {
            return;
          }
        }

        param.update();
      }
    });
  }

  (0, _createClass3.default)(_TriggerGui, [{
    key: 'set',
    value: function set(val) {/* nothing to set here */}
  }]);
  return _TriggerGui;
}();

var SCENE_ID = 'basic-shared-controller';

/**
 * The `BasicSharedController` scene propose a simple / default way to create
 * a client controller for the `shared-params` service.
 *
 * Each controller comes with a set of options that can be passed to the
 * constructor.
 *
 * @memberof module:soundworks/client
 * @see [`shared-params` service]{@link module:soundworks/client.SharedParams}
 */

var BasicSharedController = function (_Scene) {
  (0, _inherits3.default)(BasicSharedController, _Scene);

  /**
   * _<span class="warning">__WARNING__</span> This API is unstable, and
   * subject to change in further versions.
   */
  function BasicSharedController() {
    var guiOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, BasicSharedController);

    var _this = (0, _possibleConstructorReturn3.default)(this, (BasicSharedController.__proto__ || (0, _getPrototypeOf2.default)(BasicSharedController)).call(this, SCENE_ID, true));

    _this._guiOptions = guiOptions;

    _this._errorReporter = _this.require('error-reporter');

    /**
     * Instance of the client-side `shared-params` service.
     * @type {module:soundworks/client.SharedParams}
     * @name sharedParams
     * @instance
     * @memberof module:soundworks/client.SharedParams
     */
    _this.sharedParams = _this.require('shared-params');
    return _this;
  }

  (0, _createClass3.default)(BasicSharedController, [{
    key: 'init',
    value: function init() {
      this.view = this.createView();
    }
  }, {
    key: 'start',
    value: function start() {
      (0, _get3.default)(BasicSharedController.prototype.__proto__ || (0, _getPrototypeOf2.default)(BasicSharedController.prototype), 'start', this).call(this);

      if (!this.hasStarted) this.init();

      this.show();

      for (var name in this.sharedParams.params) {
        this.createGui(this.sharedParams.params[name]);
      }
    }

    /**
     * Configure the GUI for a given parameter, this method only makes sens if
     * `options.hasGUI=true`.
     * @param {String} name - Name of the parameter to configure.
     * @param {Object} options - Options to configure the parameter GUI.
     * @param {String} options.type - Type of GUI to use. Each type of parameter can
     *  used with different GUI according to their type and comes with acceptable
     *  default values.
     * @param {Boolean} [options.show=true] - Display or not the GUI for this parameter.
     * @param {Boolean} [options.confirm=false] - Ask for confirmation when the value changes.
     */

  }, {
    key: 'setGuiOptions',
    value: function setGuiOptions(name, options) {
      this._guiOptions[name] = options;
    }

    /** @private */

  }, {
    key: 'createGui',
    value: function createGui(param) {
      var config = (0, _assign2.default)({
        show: true,
        confirm: false
      }, this._guiOptions[param.name]);

      if (config.show === false) return null;

      var gui = null;
      var $container = this.view.$el;

      switch (param.type) {
        case 'boolean':
          gui = new _BooleanGui($container, param, config); // `Toggle`
          break;
        case 'enum':
          gui = new _EnumGui($container, param, config); // `SelectList` or `SelectButtons`
          break;
        case 'number':
          gui = new _NumberGui($container, param, config); // `NumberBox` or `Slider`
          break;
        case 'text':
          gui = new _TextGui($container, param, config); // `Text`
          break;
        case 'trigger':
          gui = new _TriggerGui($container, param, config);
          break;
      }

      param.addListener('update', function (val) {
        return gui.set(val);
      });
    }
  }]);
  return BasicSharedController;
}(_Scene3.default);

exports.default = BasicSharedController;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJhc2ljU2hhcmVkQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6WyJjb250cm9sbGVycyIsInNldFRoZW1lIiwiX0Jvb2xlYW5HdWkiLCIkY29udGFpbmVyIiwicGFyYW0iLCJndWlPcHRpb25zIiwibGFiZWwiLCJ2YWx1ZSIsImNvbnRyb2xsZXIiLCJUb2dnbGUiLCJkZWZhdWx0IiwiY29udGFpbmVyIiwiY2FsbGJhY2siLCJjb25maXJtIiwibXNnIiwibmFtZSIsIndpbmRvdyIsInVwZGF0ZSIsInZhbCIsIl9FbnVtR3VpIiwib3B0aW9ucyIsImN0b3IiLCJ0eXBlIiwiU2VsZWN0QnV0dG9ucyIsIlNlbGVjdExpc3QiLCJfTnVtYmVyR3VpIiwibWluIiwibWF4Iiwic3RlcCIsIlNsaWRlciIsInVuaXQiLCJzaXplIiwiTnVtYmVyQm94IiwiYWRkTGlzdGVuZXIiLCJfVGV4dEd1aSIsIlRleHQiLCJyZWFkb25seSIsIl9UcmlnZ2VyR3VpIiwiVHJpZ2dlckJ1dHRvbnMiLCJTQ0VORV9JRCIsIkJhc2ljU2hhcmVkQ29udHJvbGxlciIsIl9ndWlPcHRpb25zIiwiX2Vycm9yUmVwb3J0ZXIiLCJyZXF1aXJlIiwic2hhcmVkUGFyYW1zIiwidmlldyIsImNyZWF0ZVZpZXciLCJoYXNTdGFydGVkIiwiaW5pdCIsInNob3ciLCJwYXJhbXMiLCJjcmVhdGVHdWkiLCJjb25maWciLCJndWkiLCIkZWwiLCJzZXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsVzs7QUFDWjs7OztBQUNBOzs7Ozs7OztBQUVBQSxZQUFZQyxRQUFaLENBQXFCLE1BQXJCOztBQUVBO0FBQ0E7OztBQUdBOztJQUNNQyxXO0FBQ0osdUJBQVlDLFVBQVosRUFBd0JDLEtBQXhCLEVBQStCQyxVQUEvQixFQUEyQztBQUFBO0FBQUEsUUFDakNDLEtBRGlDLEdBQ2hCRixLQURnQixDQUNqQ0UsS0FEaUM7QUFBQSxRQUMxQkMsS0FEMEIsR0FD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QixFQUFrQ2dELE1BQWxDLENBQU4sQ0FERixDQUNtRDtBQUNqRDtBQUNGLGFBQUssTUFBTDtBQUNFQyxnQkFBTSxJQUFJbkIsUUFBSixDQUFhL0IsVUFBYixFQUF5QkMsS0FBekIsRUFBZ0NnRCxNQUFoQyxDQUFOLENBREYsQ0FDaUQ7QUFDL0M7QUFDRixhQUFLLFNBQUw7QUFDRUMsZ0JBQU0sSUFBSWhCLFdBQUosQ0FBZ0JsQyxVQUFoQixFQUE0QkMsS0FBNUIsRUFBbUNnRCxNQUFuQyxDQUFOO0FBQ0E7QUFmSjs7QUFrQkFoRCxZQUFNNkIsV0FBTixDQUFrQixRQUFsQixFQUE0QixVQUFDZixHQUFEO0FBQUEsZUFBU21DLElBQUlFLEdBQUosQ0FBUXJDLEdBQVIsQ0FBVDtBQUFBLE9BQTVCO0FBQ0Q7Ozs7O2tCQXBGa0JzQixxQiIsImZpbGUiOiJCYXNpY1NoYXJlZENvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjb250cm9sbGVycyBmcm9tICdiYXNpYy1jb250cm9sbGVycyc7XG5pbXBvcnQgY2xpZW50IGZyb20gJy4uL2NvcmUvY2xpZW50JztcbmltcG9ydCBTY2VuZSBmcm9tICcuLi9jb3JlL1NjZW5lJztcblxuY29udHJvbGxlcnMuc2V0VGhlbWUoJ2RhcmsnKTtcblxuLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG4vKiBHVUlzXG4vKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuLyoqIEBwcml2YXRlICovXG5jbGFzcyBfQm9vbGVhbkd1aSB7XG4gIGNvbnN0cnVjdG9yKCRjb250YWluZXIsIHBhcmFtLCBndWlPcHRpb25zKSB7XG4gICAgY29uc3QgeyBsYWJlbCwgdmFsdWUgfSA9IHBhcmFtO1xuXG4gICAgdGhpcy5jb250cm9sbGVyID0gbmV3IGNvbnRyb2xsZXJzLlRvZ2dsZSh7XG4gICAgICBsYWJlbDogbGFiZWwsXG4gICAgICBkZWZhdWx0OiB2YWx1ZSxcbiAgICAgIGNvbnRhaW5lcjogJGNvbnRhaW5lcixcbiAgICAgIGNhbGxiYWNrOiAodmFsdWUpID0+IHtcbiAgICAgICAgaWYgKGd1aU9wdGlvbnMuY29uZmlybSkge1xuICAgICAgICAgIGNvbnN0IG1zZyA9IGBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcHJvcGFnYXRlIFwiJHtwYXJhbS5uYW1lfToke3ZhbHVlfVwiYDtcbiAgICAgICAgICBpZiAoIXdpbmRvdy5jb25maXJtKG1zZykpIHsgcmV0dXJuOyB9XG4gICAgICAgIH1cblxuICAgICAgICBwYXJhbS51cGRhdGUodmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc2V0KHZhbCkge1xuICAgIHRoaXMuY29udHJvbGxlci52YWx1ZSA9IHZhbDtcbiAgfVxufVxuXG4vKiogQHByaXZhdGUgKi9cbmNsYXNzIF9FbnVtR3VpIHtcbiAgY29uc3RydWN0b3IoJGNvbnRhaW5lciwgcGFyYW0sIGd1aU9wdGlvbnMpIHtcbiAgICBjb25zdCB7IGxhYmVsLCBvcHRpb25zLCB2YWx1ZSB9ID0gcGFyYW07XG5cbiAgICBjb25zdCBjdG9yID0gZ3VpT3B0aW9ucy50eXBlID09PSAnYnV0dG9ucycgP1xuICAgICAgY29udHJvbGxlcnMuU2VsZWN0QnV0dG9ucyA6IGNvbnRyb2xsZXJzLlNlbGVjdExpc3RcblxuICAgIHRoaXMuY29udHJvbGxlciA9IG5ldyBjdG9yKHtcbiAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICBkZWZhdWx0OiB2YWx1ZSxcbiAgICAgIGNvbnRhaW5lcjogJGNvbnRhaW5lcixcbiAgICAgIGNhbGxiYWNrOiAodmFsdWUpID0+IHtcbiAgICAgICAgaWYgKGd1aU9wdGlvbnMuY29uZmlybSkge1xuICAgICAgICAgIGNvbnN0IG1zZyA9IGBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcHJvcGFnYXRlIFwiJHtwYXJhbS5uYW1lfToke3ZhbHVlfVwiYDtcbiAgICAgICAgICBpZiAoIXdpbmRvdy5jb25maXJtKG1zZykpIHsgcmV0dXJuOyB9XG4gICAgICAgIH1cblxuICAgICAgICBwYXJhbS51cGRhdGUodmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc2V0KHZhbCkge1xuICAgIHRoaXMuY29udHJvbGxlci52YWx1ZSA9IHZhbDtcbiAgfVxufVxuXG4vKiogQHByaXZhdGUgKi9cbmNsYXNzIF9OdW1iZXJHdWkge1xuICBjb25zdHJ1Y3RvcigkY29udGFpbmVyLCBwYXJhbSwgZ3VpT3B0aW9ucykge1xuICAgIGNvbnN0IHsgbGFiZWwsIG1pbiwgbWF4LCBzdGVwLCB2YWx1ZSB9ID0gcGFyYW07XG5cbiAgICBpZiAoZ3VpT3B0aW9ucy50eXBlID09PSAnc2xpZGVyJykge1xuICAgICAgdGhpcy5jb250cm9sbGVyID0gbmV3IGNvbnRyb2xsZXJzLlNsaWRlcih7XG4gICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgbWluOiBtaW4sXG4gICAgICAgIG1heDogbWF4LFxuICAgICAgICBzdGVwOiBzdGVwLFxuICAgICAgICBkZWZhdWx0OiB2YWx1ZSxcbiAgICAgICAgdW5pdDogZ3VpT3B0aW9ucy5wYXJhbSA/IGd1aU9wdGlvbnMucGFyYW0gOiAnJyxcbiAgICAgICAgc2l6ZTogZ3VpT3B0aW9ucy5zaXplLFxuICAgICAgICBjb250YWluZXI6ICRjb250YWluZXIsXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb250cm9sbGVyID0gbmV3IGNvbnRyb2xsZXJzLk51bWJlckJveCh7XG4gICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgbWluOiBtaW4sXG4gICAgICAgIG1heDogbWF4LFxuICAgICAgICBzdGVwOiBzdGVwLFxuICAgICAgICBkZWZhdWx0OiB2YWx1ZSxcbiAgICAgICAgY29udGFpbmVyOiAkY29udGFpbmVyLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5jb250cm9sbGVyLmFkZExpc3RlbmVyKCh2YWx1ZSkgPT4ge1xuICAgICAgaWYgKGd1aU9wdGlvbnMuY29uZmlybSkge1xuICAgICAgICBjb25zdCBtc2cgPSBgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHByb3BhZ2F0ZSBcIiR7cGFyYW0ubmFtZX06JHt2YWx1ZX1cImA7XG4gICAgICAgIGlmICghd2luZG93LmNvbmZpcm0obXNnKSkgeyByZXR1cm47IH1cbiAgICAgIH1cblxuICAgICAgcGFyYW0udXBkYXRlKHZhbHVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHNldCh2YWwpIHtcbiAgICB0aGlzLmNvbnRyb2xsZXIudmFsdWUgPSB2YWw7XG4gIH1cbn1cblxuLyoqIEBwcml2YXRlICovXG5jbGFzcyBfVGV4dEd1aSB7XG4gIGNvbnN0cnVjdG9yKCRjb250YWluZXIsIHBhcmFtLCBndWlPcHRpb25zKSB7XG4gICAgY29uc3QgeyBsYWJlbCwgdmFsdWUgfSA9IHBhcmFtO1xuXG4gICAgdGhpcy5jb250cm9sbGVyID0gbmV3IGNvbnRyb2xsZXJzLlRleHQoe1xuICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgZGVmYXVsdDogdmFsdWUsXG4gICAgICByZWFkb25seTogZ3VpT3B0aW9ucy5yZWFkb25seSxcbiAgICAgIGNvbnRhaW5lcjogJGNvbnRhaW5lcixcbiAgICB9KTtcblxuICAgIGlmICghZ3VpT3B0aW9ucy5yZWFkb25seSkge1xuICAgICAgdGhpcy5jb250cm9sbGVyLmFkZExpc3RlbmVyKCh2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAoZ3VpT3B0aW9ucy5jb25maXJtKSB7XG4gICAgICAgICAgY29uc3QgbXNnID0gYEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBwcm9wYWdhdGUgXCIke3BhcmFtLm5hbWV9XCJgO1xuICAgICAgICAgIGlmICghd2luZG93LmNvbmZpcm0obXNnKSkgeyByZXR1cm47IH1cbiAgICAgICAgfVxuXG4gICAgICAgIHBhcmFtLnVwZGF0ZSh2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBzZXQodmFsKSB7XG4gICAgdGhpcy5jb250cm9sbGVyLnZhbHVlID0gdmFsO1xuICB9XG59XG5cbi8qKiBAcHJpdmF0ZSAqL1xuY2xhc3MgX1RyaWdnZXJHdWkge1xuICBjb25zdHJ1Y3RvcigkY29udGFpbmVyLCBwYXJhbSwgZ3VpT3B0aW9ucykge1xuICAgIGNvbnN0IHsgbGFiZWwgfSA9IHBhcmFtO1xuXG4gICAgdGhpcy5jb250cm9sbGVyID0gbmV3IGNvbnRyb2xsZXJzLlRyaWdnZXJCdXR0b25zKHtcbiAgICAgIG9wdGlvbnM6IFtsYWJlbF0sXG4gICAgICBjb250YWluZXI6ICRjb250YWluZXIsXG4gICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICBpZiAoZ3VpT3B0aW9ucy5jb25maXJtKSB7XG4gICAgICAgICAgY29uc3QgbXNnID0gYEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBwcm9wYWdhdGUgXCIke3BhcmFtLm5hbWV9XCJgO1xuICAgICAgICAgIGlmICghd2luZG93LmNvbmZpcm0obXNnKSkgeyByZXR1cm47IH1cbiAgICAgICAgfVxuXG4gICAgICAgIHBhcmFtLnVwZGF0ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc2V0KHZhbCkgeyAvKiBub3RoaW5nIHRvIHNldCBoZXJlICovIH1cbn1cblxuY29uc3QgU0NFTkVfSUQgPSAnYmFzaWMtc2hhcmVkLWNvbnRyb2xsZXInO1xuXG4vKipcbiAqIFRoZSBgQmFzaWNTaGFyZWRDb250cm9sbGVyYCBzY2VuZSBwcm9wb3NlIGEgc2ltcGxlIC8gZGVmYXVsdCB3YXkgdG8gY3JlYXRlXG4gKiBhIGNsaWVudCBjb250cm9sbGVyIGZvciB0aGUgYHNoYXJlZC1wYXJhbXNgIHNlcnZpY2UuXG4gKlxuICogRWFjaCBjb250cm9sbGVyIGNvbWVzIHdpdGggYSBzZXQgb2Ygb3B0aW9ucyB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gdGhlXG4gKiBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50XG4gKiBAc2VlIFtgc2hhcmVkLXBhcmFtc2Agc2VydmljZV17QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LlNoYXJlZFBhcmFtc31cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzaWNTaGFyZWRDb250cm9sbGVyIGV4dGVuZHMgU2NlbmUge1xuICAvKipcbiAgICogXzxzcGFuIGNsYXNzPVwid2FybmluZ1wiPl9fV0FSTklOR19fPC9zcGFuPiBUaGlzIEFQSSBpcyB1bnN0YWJsZSwgYW5kXG4gICAqIHN1YmplY3QgdG8gY2hhbmdlIGluIGZ1cnRoZXIgdmVyc2lvbnMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihndWlPcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihTQ0VORV9JRCwgdHJ1ZSk7XG5cbiAgICB0aGlzLl9ndWlPcHRpb25zID0gZ3VpT3B0aW9ucztcblxuICAgIHRoaXMuX2Vycm9yUmVwb3J0ZXIgPSB0aGlzLnJlcXVpcmUoJ2Vycm9yLXJlcG9ydGVyJyk7XG5cbiAgICAvKipcbiAgICAgKiBJbnN0YW5jZSBvZiB0aGUgY2xpZW50LXNpZGUgYHNoYXJlZC1wYXJhbXNgIHNlcnZpY2UuXG4gICAgICogQHR5cGUge21vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5TaGFyZWRQYXJhbXN9XG4gICAgICogQG5hbWUgc2hhcmVkUGFyYW1zXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5TaGFyZWRQYXJhbXNcbiAgICAgKi9cbiAgICB0aGlzLnNoYXJlZFBhcmFtcyA9IHRoaXMucmVxdWlyZSgnc2hhcmVkLXBhcmFtcycpO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICB0aGlzLnZpZXcgPSB0aGlzLmNyZWF0ZVZpZXcoKTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHN1cGVyLnN0YXJ0KCk7XG5cbiAgICBpZiAoIXRoaXMuaGFzU3RhcnRlZClcbiAgICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgdGhpcy5zaG93KCk7XG5cbiAgICBmb3IgKGxldCBuYW1lIGluIHRoaXMuc2hhcmVkUGFyYW1zLnBhcmFtcylcbiAgICAgIHRoaXMuY3JlYXRlR3VpKHRoaXMuc2hhcmVkUGFyYW1zLnBhcmFtc1tuYW1lXSk7XG4gIH1cblxuICAvKipcbiAgICogQ29uZmlndXJlIHRoZSBHVUkgZm9yIGEgZ2l2ZW4gcGFyYW1ldGVyLCB0aGlzIG1ldGhvZCBvbmx5IG1ha2VzIHNlbnMgaWZcbiAgICogYG9wdGlvbnMuaGFzR1VJPXRydWVgLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIE5hbWUgb2YgdGhlIHBhcmFtZXRlciB0byBjb25maWd1cmUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3B0aW9ucyB0byBjb25maWd1cmUgdGhlIHBhcmFtZXRlciBHVUkuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLnR5cGUgLSBUeXBlIG9mIEdVSSB0byB1c2UuIEVhY2ggdHlwZSBvZiBwYXJhbWV0ZXIgY2FuXG4gICAqICB1c2VkIHdpdGggZGlmZmVyZW50IEdVSSBhY2NvcmRpbmcgdG8gdGhlaXIgdHlwZSBhbmQgY29tZXMgd2l0aCBhY2NlcHRhYmxlXG4gICAqICBkZWZhdWx0IHZhbHVlcy5cbiAgICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5zaG93PXRydWVdIC0gRGlzcGxheSBvciBub3QgdGhlIEdVSSBmb3IgdGhpcyBwYXJhbWV0ZXIuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuY29uZmlybT1mYWxzZV0gLSBBc2sgZm9yIGNvbmZpcm1hdGlvbiB3aGVuIHRoZSB2YWx1ZSBjaGFuZ2VzLlxuICAgKi9cbiAgc2V0R3VpT3B0aW9ucyhuYW1lLCBvcHRpb25zKSB7XG4gICAgdGhpcy5fZ3VpT3B0aW9uc1tuYW1lXSA9IG9wdGlvbnM7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgY3JlYXRlR3VpKHBhcmFtKSB7XG4gICAgY29uc3QgY29uZmlnID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBzaG93OiB0cnVlLFxuICAgICAgY29uZmlybTogZmFsc2UsXG4gICAgfSwgdGhpcy5fZ3VpT3B0aW9uc1twYXJhbS5uYW1lXSk7XG5cbiAgICBpZiAoY29uZmlnLnNob3cgPT09IGZhbHNlKSByZXR1cm4gbnVsbDtcblxuICAgIGxldCBndWkgPSBudWxsO1xuICAgIGNvbnN0ICRjb250YWluZXIgPSB0aGlzLnZpZXcuJGVsO1xuXG4gICAgc3dpdGNoIChwYXJhbS50eXBlKSB7XG4gICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgZ3VpID0gbmV3IF9Cb29sZWFuR3VpKCRjb250YWluZXIsIHBhcmFtLCBjb25maWcpOyAvLyBgVG9nZ2xlYFxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2VudW0nOlxuICAgICAgICBndWkgPSBuZXcgX0VudW1HdWkoJGNvbnRhaW5lciwgcGFyYW0sIGNvbmZpZyk7IC8vIGBTZWxlY3RMaXN0YCBvciBgU2VsZWN0QnV0dG9uc2BcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICBndWkgPSBuZXcgX051bWJlckd1aSgkY29udGFpbmVyLCBwYXJhbSwgY29uZmlnKTsgLy8gYE51bWJlckJveGAgb3IgYFNsaWRlcmBcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgZ3VpID0gbmV3IF9UZXh0R3VpKCRjb250YWluZXIsIHBhcmFtLCBjb25maWcpOyAvLyBgVGV4dGBcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd0cmlnZ2VyJzpcbiAgICAgICAgZ3VpID0gbmV3IF9UcmlnZ2VyR3VpKCRjb250YWluZXIsIHBhcmFtLCBjb25maWcpO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBwYXJhbS5hZGRMaXN0ZW5lcigndXBkYXRlJywgKHZhbCkgPT4gZ3VpLnNldCh2YWwpKTtcbiAgfVxufVxuIl19