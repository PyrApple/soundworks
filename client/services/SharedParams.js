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

var _events = require('events');

var _Service2 = require('../core/Service');

var _Service3 = _interopRequireDefault(_Service2);

var _serviceManager = require('../core/serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* --------------------------------------------------------- */
/* CONTROL UNITS
/* --------------------------------------------------------- */

/** @private */
var _Param = function (_EventEmitter) {
  (0, _inherits3.default)(_Param, _EventEmitter);

  function _Param(parent, type, name, label) {
    (0, _classCallCheck3.default)(this, _Param);

    var _this = (0, _possibleConstructorReturn3.default)(this, (_Param.__proto__ || (0, _getPrototypeOf2.default)(_Param)).call(this));

    _this.parent = parent;
    _this.type = type;
    _this.name = name;
    _this.label = label;
    _this.value = undefined;
    return _this;
  }

  (0, _createClass3.default)(_Param, [{
    key: 'set',
    value: function set(val) {
      this.value = value;
    }
  }, {
    key: '_propagate',
    value: function _propagate() {
      var sendToServer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this.emit('update', this.value); // call event listeners

      if (sendToServer) this.parent.send('update', this.name, this.value); // send to server

      this.parent.emit('update', this.name, this.value); // call parent listeners
    }
  }, {
    key: 'update',
    value: function update(val) {
      var sendToServer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      this.set(val);
      this._propagate(sendToServer);
    }
  }]);
  return _Param;
}(_events.EventEmitter);

/** @private */


var _BooleanParam = function (_Param2) {
  (0, _inherits3.default)(_BooleanParam, _Param2);

  function _BooleanParam(parent, name, label, init) {
    (0, _classCallCheck3.default)(this, _BooleanParam);

    var _this2 = (0, _possibleConstructorReturn3.default)(this, (_BooleanParam.__proto__ || (0, _getPrototypeOf2.default)(_BooleanParam)).call(this, parent, 'boolean', name, label));

    _this2.set(init);
    return _this2;
  }

  (0, _createClass3.default)(_BooleanParam, [{
    key: 'set',
    value: function set(val) {
      this.value = val;
    }
  }]);
  return _BooleanParam;
}(_Param);

/** @private */


var _EnumParam = function (_Param3) {
  (0, _inherits3.default)(_EnumParam, _Param3);

  function _EnumParam(parent, name, label, options, init) {
    (0, _classCallCheck3.default)(this, _EnumParam);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (_EnumParam.__proto__ || (0, _getPrototypeOf2.default)(_EnumParam)).call(this, parent, 'enum', name, label));

    _this3.options = options;
    _this3.set(init);
    return _this3;
  }

  (0, _createClass3.default)(_EnumParam, [{
    key: 'set',
    value: function set(val) {
      var index = this.options.indexOf(val);

      if (index >= 0) {
        this.index = index;
        this.value = val;
      }
    }
  }]);
  return _EnumParam;
}(_Param);

/** @private */


var _NumberParam = function (_Param4) {
  (0, _inherits3.default)(_NumberParam, _Param4);

  function _NumberParam(parent, name, label, min, max, step, init) {
    (0, _classCallCheck3.default)(this, _NumberParam);

    var _this4 = (0, _possibleConstructorReturn3.default)(this, (_NumberParam.__proto__ || (0, _getPrototypeOf2.default)(_NumberParam)).call(this, parent, 'number', name, label));

    _this4.min = min;
    _this4.max = max;
    _this4.step = step;
    _this4.set(init);
    return _this4;
  }

  (0, _createClass3.default)(_NumberParam, [{
    key: 'set',
    value: function set(val) {
      this.value = Math.min(this.max, Math.max(this.min, val));
    }
  }]);
  return _NumberParam;
}(_Param);

/** @private */


var _TextParam = function (_Param5) {
  (0, _inherits3.default)(_TextParam, _Param5);

  function _TextParam(parent, name, label, init) {
    (0, _classCallCheck3.default)(this, _TextParam);

    var _this5 = (0, _possibleConstructorReturn3.default)(this, (_TextParam.__proto__ || (0, _getPrototypeOf2.default)(_TextParam)).call(this, parent, 'text', name, label));

    _this5.set(init);
    return _this5;
  }

  (0, _createClass3.default)(_TextParam, [{
    key: 'set',
    value: function set(val) {
      this.value = val;
    }
  }]);
  return _TextParam;
}(_Param);

/** @private */


var _TriggerParam = function (_Param6) {
  (0, _inherits3.default)(_TriggerParam, _Param6);

  function _TriggerParam(parent, name, label) {
    (0, _classCallCheck3.default)(this, _TriggerParam);
    return (0, _possibleConstructorReturn3.default)(this, (_TriggerParam.__proto__ || (0, _getPrototypeOf2.default)(_TriggerParam)).call(this, parent, 'trigger', name, label));
  }

  (0, _createClass3.default)(_TriggerParam, [{
    key: 'set',
    value: function set(val) {/* nothing to set here */}
  }]);
  return _TriggerParam;
}(_Param);

var SERVICE_ID = 'service:shared-params';

/**
 * Interface for the client `'shared-params'` service.
 *
 * The `shared-params` service is used to maintain and update global parameters
 * used among all connected clients. Each defined parameter can be of the
 * following data types:
 * - boolean
 * - enum
 * - number
 * - text
 * - trigger
 *
 * The parameters are configured in the server side counterpart of the service.
 *
 * To create a control surface from the parameters definitions, a dedicated scene
 * [`BasicSharedController`]{@link module:soundworks/client.BasicSharedController}
 * is available.
 *
 * __*The service must be used along with its
 * [server-side counterpart]{@link module:soundworks/server.SharedParams}*__
 *
 * _<span class="warning">__WARNING__</span> This class should never be
 * instanciated manually_
 *
 * @memberof module:soundworks/client
 *
 * @example
 * // inside the experience constructor
 * this.sharedParams = this.require('shared-params');
 * // when the experience starts, listen for parameter updates
 * this.sharedParams.addParamListener('synth:gain', (value) => {
 *   this.synth.setGain(value);
 * });
 *
 * @see [`BasicSharedController` scene]{@link module:soundworks/client.BasicSharedController}
 */

var SharedParams = function (_Service) {
  (0, _inherits3.default)(SharedParams, _Service);

  function SharedParams() {
    (0, _classCallCheck3.default)(this, SharedParams);

    var _this7 = (0, _possibleConstructorReturn3.default)(this, (SharedParams.__proto__ || (0, _getPrototypeOf2.default)(SharedParams)).call(this, SERVICE_ID, true));

    var defaults = {};
    _this7.configure(defaults);

    /**
     * Dictionary of all the parameters and commands.
     * @type {Object}
     * @name params
     * @instance
     * @memberof module:soundworks/client.SharedParams
     *
     * @private
     */
    _this7.params = {};

    _this7._onInitResponse = _this7._onInitResponse.bind(_this7);
    _this7._onUpdateResponse = _this7._onUpdateResponse.bind(_this7);
    return _this7;
  }

  /** @private */


  (0, _createClass3.default)(SharedParams, [{
    key: 'start',
    value: function start() {
      (0, _get3.default)(SharedParams.prototype.__proto__ || (0, _getPrototypeOf2.default)(SharedParams.prototype), 'start', this).call(this);

      if (!this.hasStarted) this.init();

      this.send('request');

      this.receive('init', this._onInitResponse);
      this.receive('update', this._onUpdateResponse);
    }

    /** @private */

  }, {
    key: 'stop',
    value: function stop() {
      (0, _get3.default)(SharedParams.prototype.__proto__ || (0, _getPrototypeOf2.default)(SharedParams.prototype), 'stop', this).call(this);
      // don't remove 'update' listener, as the control is runnig as a background process
      this.removeListener('init', this._onInitResponse);
    }

    /** @private */

  }, {
    key: '_onInitResponse',
    value: function _onInitResponse(config) {
      var _this8 = this;

      config.forEach(function (entry) {
        var param = _this8._createParam(entry);
        _this8.params[param.name] = param;
      });

      this.ready();
    }

    /** @private */

  }, {
    key: '_onUpdateResponse',
    value: function _onUpdateResponse(name, val) {
      // update, but don't send back to server
      this.update(name, val, false);
    }

    /** @private */

  }, {
    key: '_createParam',
    value: function _createParam(init) {
      var param = null;

      switch (init.type) {
        case 'boolean':
          param = new _BooleanParam(this, init.name, init.label, init.value);
          break;

        case 'enum':
          param = new _EnumParam(this, init.name, init.label, init.options, init.value);
          break;

        case 'number':
          param = new _NumberParam(this, init.name, init.label, init.min, init.max, init.step, init.value);
          break;

        case 'text':
          param = new _TextParam(this, init.name, init.label, init.value);
          break;

        case 'trigger':
          param = new _TriggerParam(this, init.name, init.label);
          break;
      }

      return param;
    }

    /**
     * @callback module:soundworks/client.SharedParams~paramCallback
     * @param {Mixed} value - Updated value of the shared parameter.
     */

    /**
     * Add a listener to listen a specific parameter changes. The listener is
     * executed immediately when added with the parameter current value.
     *
     * @param {String} name - Name of the parameter.
     * @param {module:soundworks/client.SharedParams~paramCallback} listener -
     *  Listener to add.
     */

  }, {
    key: 'addParamListener',
    value: function addParamListener(name, listener) {
      var param = this.params[name];

      if (param) {
        param.addListener('update', listener);

        if (param.type !== 'trigger') listener(param.value);
      } else {
        console.log('unknown param "' + name + '"');
      }
    }

    /**
     * Remove a listener from listening a specific parameter changes.
     *
     * @param {String} name - Name of the parameter.
     * @param {module:soundworks/client.SharedParams~paramCallback} listener -
     *  Listener to remove.
     */

  }, {
    key: 'removeParamListener',
    value: function removeParamListener(name, listener) {
      var param = this.params[name];

      if (param) param.removeListener('update', listener);else console.log('unknown param "' + name + '"');
    }

    /**
     * Get the value of a given parameter.
     *
     * @param {String} name - Name of the parameter.
     * @returns {Mixed} - Current value of the parameter.
     */

  }, {
    key: 'getValue',
    value: function getValue(name) {
      return this.params[name].value;
    }

    /**
     * Update the value of a parameter (used when `options.hasGUI=true`)
     *
     * @param {String} name - Name of the parameter.
     * @param {Mixed} val - New value of the parameter.
     * @param {Boolean} [sendToServer=true] - Flag whether the value should be
     *  propagated to the server.
     */

  }, {
    key: 'update',
    value: function update(name, val) {
      var sendToServer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      var param = this.params[name];

      if (param) param.update(val, sendToServer);else console.log('unknown shared parameter "' + name + '"');
    }
  }]);
  return SharedParams;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, SharedParams);

exports.default = SharedParams;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNoYXJlZFBhcmFtcy5qcyJdLCJuYW1lcyI6WyJfUGFyYW0iLCJwYXJlbnQiLCJ0eXBlIiwibmFtZSIsImxhYmVsIiwidmFsdWUiLCJ1bmRlZmluZWQiLCJ2YWwiLCJzZW5kVG9TZXJ2ZXIiLCJlbWl0Iiwic2VuZCIsInNldCIsIl9wcm9wYWdhdGUiLCJfQm9vbGVhblBhcmFtIiwiaW5pdCIsIl9FbnVtUGFyYW0iLCJvcHRpb25zIiwiaW5kZXgiLCJpbmRleE9mIiwiX051bWJlclBhcmFtIiwibWluIiwibWF4Iiwic3RlcCIsIk1hdGgiLCJfVGV4dFBhcmFtIiwiX1RyaWdnZXJQYXJhbSIsIlNFUlZJQ0VfSUQiLCJTaGFyZWRQYXJhbXMiLCJkZWZhdWx0cyIsImNvbmZpZ3VyZSIsInBhcmFtcyIsIl9vbkluaXRSZXNwb25zZSIsImJpbmQiLCJfb25VcGRhdGVSZXNwb25zZSIsImhhc1N0YXJ0ZWQiLCJyZWNlaXZlIiwicmVtb3ZlTGlzdGVuZXIiLCJjb25maWciLCJmb3JFYWNoIiwiZW50cnkiLCJwYXJhbSIsIl9jcmVhdGVQYXJhbSIsInJlYWR5IiwidXBkYXRlIiwibGlzdGVuZXIiLCJhZGRMaXN0ZW5lciIsImNvbnNvbGUiLCJsb2ciLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBR0E7QUFDQTs7O0FBR0E7SUFDTUEsTTs7O0FBQ0osa0JBQVlDLE1BQVosRUFBb0JDLElBQXBCLEVBQTBCQyxJQUExQixFQUFnQ0MsS0FBaEMsRUFBdUM7QUFBQTs7QUFBQTs7QUFFckMsVUFBS0gsTUFBTCxHQUFjQSxNQUFkO0FBQ0EsVUFBS0MsSUFBTCxHQUFZQSxJQUFaO0FBQ0EsVUFBS0MsSUFBTCxHQUFZQSxJQUFaO0FBQ0EsVUFBS0MsS0FBTCxHQUFhQSxLQUFiO0FBQ0EsVUFBS0MsS0FBTCxHQUFhQyxTQUFiO0FBTnFDO0FBT3RDOzs7O3dCQUVHQyxHLEVBQUs7QUFD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OlsiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCBTZXJ2aWNlIGZyb20gJy4uL2NvcmUvU2VydmljZSc7XG5pbXBvcnQgc2VydmljZU1hbmFnZXIgZnJvbSAnLi4vY29yZS9zZXJ2aWNlTWFuYWdlcic7XG5cblxuLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG4vKiBDT05UUk9MIFVOSVRTXG4vKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuLyoqIEBwcml2YXRlICovXG5jbGFzcyBfUGFyYW0gZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3RvcihwYXJlbnQsIHR5cGUsIG5hbWUsIGxhYmVsKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xuICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBzZXQodmFsKSB7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgX3Byb3BhZ2F0ZShzZW5kVG9TZXJ2ZXIgPSB0cnVlKSB7XG4gICAgdGhpcy5lbWl0KCd1cGRhdGUnLCB0aGlzLnZhbHVlKTsgLy8gY2FsbCBldmVudCBsaXN0ZW5lcnNcblxuICAgIGlmIChzZW5kVG9TZXJ2ZXIpXG4gICAgICB0aGlzLnBhcmVudC5zZW5kKCd1cGRhdGUnLCB0aGlzLm5hbWUsIHRoaXMudmFsdWUpOyAvLyBzZW5kIHRvIHNlcnZlclxuXG4gICAgdGhpcy5wYXJlbnQuZW1pdCgndXBkYXRlJywgdGhpcy5uYW1lLCB0aGlzLnZhbHVlKTsgLy8gY2FsbCBwYXJlbnQgbGlzdGVuZXJzXG4gIH1cblxuICB1cGRhdGUodmFsLCBzZW5kVG9TZXJ2ZXIgPSB0cnVlKSB7XG4gICAgdGhpcy5zZXQodmFsKTtcbiAgICB0aGlzLl9wcm9wYWdhdGUoc2VuZFRvU2VydmVyKTtcbiAgfVxufVxuXG5cbi8qKiBAcHJpdmF0ZSAqL1xuY2xhc3MgX0Jvb2xlYW5QYXJhbSBleHRlbmRzIF9QYXJhbSB7XG4gIGNvbnN0cnVjdG9yKHBhcmVudCwgbmFtZSwgbGFiZWwsIGluaXQpIHtcbiAgICBzdXBlcihwYXJlbnQsICdib29sZWFuJywgbmFtZSwgbGFiZWwpO1xuICAgIHRoaXMuc2V0KGluaXQpO1xuICB9XG5cbiAgc2V0KHZhbCkge1xuICAgIHRoaXMudmFsdWUgPSB2YWw7XG4gIH1cbn1cblxuLyoqIEBwcml2YXRlICovXG5jbGFzcyBfRW51bVBhcmFtIGV4dGVuZHMgX1BhcmFtIHtcbiAgY29uc3RydWN0b3IocGFyZW50LCBuYW1lLCBsYWJlbCwgb3B0aW9ucywgaW5pdCkge1xuICAgIHN1cGVyKHBhcmVudCwgJ2VudW0nLCBuYW1lLCBsYWJlbCk7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLnNldChpbml0KTtcbiAgfVxuXG4gIHNldCh2YWwpIHtcbiAgICBsZXQgaW5kZXggPSB0aGlzLm9wdGlvbnMuaW5kZXhPZih2YWwpO1xuXG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgICAgIHRoaXMudmFsdWUgPSB2YWw7XG4gICAgfVxuICB9XG59XG5cbi8qKiBAcHJpdmF0ZSAqL1xuY2xhc3MgX051bWJlclBhcmFtIGV4dGVuZHMgX1BhcmFtIHtcbiAgY29uc3RydWN0b3IocGFyZW50LCBuYW1lLCBsYWJlbCwgbWluLCBtYXgsIHN0ZXAsIGluaXQpIHtcbiAgICBzdXBlcihwYXJlbnQsICdudW1iZXInLCBuYW1lLCBsYWJlbCk7XG4gICAgdGhpcy5taW4gPSBtaW47XG4gICAgdGhpcy5tYXggPSBtYXg7XG4gICAgdGhpcy5zdGVwID0gc3RlcDtcbiAgICB0aGlzLnNldChpbml0KTtcbiAgfVxuXG4gIHNldCh2YWwpIHtcbiAgICB0aGlzLnZhbHVlID0gTWF0aC5taW4odGhpcy5tYXgsIE1hdGgubWF4KHRoaXMubWluLCB2YWwpKTtcbiAgfVxufVxuXG4vKiogQHByaXZhdGUgKi9cbmNsYXNzIF9UZXh0UGFyYW0gZXh0ZW5kcyBfUGFyYW0ge1xuICBjb25zdHJ1Y3RvcihwYXJlbnQsIG5hbWUsIGxhYmVsLCBpbml0KSB7XG4gICAgc3VwZXIocGFyZW50LCAndGV4dCcsIG5hbWUsIGxhYmVsKTtcbiAgICB0aGlzLnNldChpbml0KTtcbiAgfVxuXG4gIHNldCh2YWwpIHtcbiAgICB0aGlzLnZhbHVlID0gdmFsO1xuICB9XG59XG5cbi8qKiBAcHJpdmF0ZSAqL1xuY2xhc3MgX1RyaWdnZXJQYXJhbSBleHRlbmRzIF9QYXJhbSB7XG4gIGNvbnN0cnVjdG9yKHBhcmVudCwgbmFtZSwgbGFiZWwpIHtcbiAgICBzdXBlcihwYXJlbnQsICd0cmlnZ2VyJywgbmFtZSwgbGFiZWwpO1xuICB9XG5cbiAgc2V0KHZhbCkgeyAvKiBub3RoaW5nIHRvIHNldCBoZXJlICovIH1cbn1cblxuY29uc3QgU0VSVklDRV9JRCA9ICdzZXJ2aWNlOnNoYXJlZC1wYXJhbXMnO1xuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIGNsaWVudCBgJ3NoYXJlZC1wYXJhbXMnYCBzZXJ2aWNlLlxuICpcbiAqIFRoZSBgc2hhcmVkLXBhcmFtc2Agc2VydmljZSBpcyB1c2VkIHRvIG1haW50YWluIGFuZCB1cGRhdGUgZ2xvYmFsIHBhcmFtZXRlcnNcbiAqIHVzZWQgYW1vbmcgYWxsIGNvbm5lY3RlZCBjbGllbnRzLiBFYWNoIGRlZmluZWQgcGFyYW1ldGVyIGNhbiBiZSBvZiB0aGVcbiAqIGZvbGxvd2luZyBkYXRhIHR5cGVzOlxuICogLSBib29sZWFuXG4gKiAtIGVudW1cbiAqIC0gbnVtYmVyXG4gKiAtIHRleHRcbiAqIC0gdHJpZ2dlclxuICpcbiAqIFRoZSBwYXJhbWV0ZXJzIGFyZSBjb25maWd1cmVkIGluIHRoZSBzZXJ2ZXIgc2lkZSBjb3VudGVycGFydCBvZiB0aGUgc2VydmljZS5cbiAqXG4gKiBUbyBjcmVhdGUgYSBjb250cm9sIHN1cmZhY2UgZnJvbSB0aGUgcGFyYW1ldGVycyBkZWZpbml0aW9ucywgYSBkZWRpY2F0ZWQgc2NlbmVcbiAqIFtgQmFzaWNTaGFyZWRDb250cm9sbGVyYF17QGxpbmsgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50LkJhc2ljU2hhcmVkQ29udHJvbGxlcn1cbiAqIGlzIGF2YWlsYWJsZS5cbiAqXG4gKiBfXypUaGUgc2VydmljZSBtdXN0IGJlIHVzZWQgYWxvbmcgd2l0aCBpdHNcbiAqIFtzZXJ2ZXItc2lkZSBjb3VudGVycGFydF17QGxpbmsgbW9kdWxlOnNvdW5kd29ya3Mvc2VydmVyLlNoYXJlZFBhcmFtc30qX19cbiAqXG4gKiBfPHNwYW4gY2xhc3M9XCJ3YXJuaW5nXCI+X19XQVJOSU5HX188L3NwYW4+IFRoaXMgY2xhc3Mgc2hvdWxkIG5ldmVyIGJlXG4gKiBpbnN0YW5jaWF0ZWQgbWFudWFsbHlfXG4gKlxuICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudFxuICpcbiAqIEBleGFtcGxlXG4gKiAvLyBpbnNpZGUgdGhlIGV4cGVyaWVuY2UgY29uc3RydWN0b3JcbiAqIHRoaXMuc2hhcmVkUGFyYW1zID0gdGhpcy5yZXF1aXJlKCdzaGFyZWQtcGFyYW1zJyk7XG4gKiAvLyB3aGVuIHRoZSBleHBlcmllbmNlIHN0YXJ0cywgbGlzdGVuIGZvciBwYXJhbWV0ZXIgdXBkYXRlc1xuICogdGhpcy5zaGFyZWRQYXJhbXMuYWRkUGFyYW1MaXN0ZW5lcignc3ludGg6Z2FpbicsICh2YWx1ZSkgPT4ge1xuICogICB0aGlzLnN5bnRoLnNldEdhaW4odmFsdWUpO1xuICogfSk7XG4gKlxuICogQHNlZSBbYEJhc2ljU2hhcmVkQ29udHJvbGxlcmAgc2NlbmVde0BsaW5rIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5CYXNpY1NoYXJlZENvbnRyb2xsZXJ9XG4gKi9cbmNsYXNzIFNoYXJlZFBhcmFtcyBleHRlbmRzIFNlcnZpY2Uge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihTRVJWSUNFX0lELCB0cnVlKTtcblxuICAgIGNvbnN0IGRlZmF1bHRzID0ge307XG4gICAgdGhpcy5jb25maWd1cmUoZGVmYXVsdHMpO1xuXG4gICAgLyoqXG4gICAgICogRGljdGlvbmFyeSBvZiBhbGwgdGhlIHBhcmFtZXRlcnMgYW5kIGNvbW1hbmRzLlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQG5hbWUgcGFyYW1zXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQG1lbWJlcm9mIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5TaGFyZWRQYXJhbXNcbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5wYXJhbXMgPSB7fTtcblxuICAgIHRoaXMuX29uSW5pdFJlc3BvbnNlID0gdGhpcy5fb25Jbml0UmVzcG9uc2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblVwZGF0ZVJlc3BvbnNlID0gdGhpcy5fb25VcGRhdGVSZXNwb25zZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHN0YXJ0KCkge1xuICAgIHN1cGVyLnN0YXJ0KCk7XG5cbiAgICBpZiAoIXRoaXMuaGFzU3RhcnRlZClcbiAgICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgdGhpcy5zZW5kKCdyZXF1ZXN0Jyk7XG5cbiAgICB0aGlzLnJlY2VpdmUoJ2luaXQnLCB0aGlzLl9vbkluaXRSZXNwb25zZSk7XG4gICAgdGhpcy5yZWNlaXZlKCd1cGRhdGUnLCB0aGlzLl9vblVwZGF0ZVJlc3BvbnNlKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBzdG9wKCkge1xuICAgIHN1cGVyLnN0b3AoKTtcbiAgICAvLyBkb24ndCByZW1vdmUgJ3VwZGF0ZScgbGlzdGVuZXIsIGFzIHRoZSBjb250cm9sIGlzIHJ1bm5pZyBhcyBhIGJhY2tncm91bmQgcHJvY2Vzc1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIoJ2luaXQnLCB0aGlzLl9vbkluaXRSZXNwb25zZSk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX29uSW5pdFJlc3BvbnNlKGNvbmZpZykge1xuICAgIGNvbmZpZy5mb3JFYWNoKChlbnRyeSkgPT4ge1xuICAgICAgY29uc3QgcGFyYW0gPSB0aGlzLl9jcmVhdGVQYXJhbShlbnRyeSk7XG4gICAgICB0aGlzLnBhcmFtc1twYXJhbS5uYW1lXSA9IHBhcmFtO1xuICAgIH0pO1xuXG4gICAgdGhpcy5yZWFkeSgpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9vblVwZGF0ZVJlc3BvbnNlKG5hbWUsIHZhbCkge1xuICAgIC8vIHVwZGF0ZSwgYnV0IGRvbid0IHNlbmQgYmFjayB0byBzZXJ2ZXJcbiAgICB0aGlzLnVwZGF0ZShuYW1lLCB2YWwsIGZhbHNlKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfY3JlYXRlUGFyYW0oaW5pdCkge1xuICAgIGxldCBwYXJhbSA9IG51bGw7XG5cbiAgICBzd2l0Y2ggKGluaXQudHlwZSkge1xuICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgIHBhcmFtID0gbmV3IF9Cb29sZWFuUGFyYW0odGhpcywgaW5pdC5uYW1lLCBpbml0LmxhYmVsLCBpbml0LnZhbHVlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2VudW0nOlxuICAgICAgICBwYXJhbSA9IG5ldyBfRW51bVBhcmFtKHRoaXMsIGluaXQubmFtZSwgaW5pdC5sYWJlbCwgaW5pdC5vcHRpb25zLCBpbml0LnZhbHVlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICAgIHBhcmFtID0gbmV3IF9OdW1iZXJQYXJhbSh0aGlzLCBpbml0Lm5hbWUsIGluaXQubGFiZWwsIGluaXQubWluLCBpbml0Lm1heCwgaW5pdC5zdGVwLCBpbml0LnZhbHVlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3RleHQnOlxuICAgICAgICBwYXJhbSA9IG5ldyBfVGV4dFBhcmFtKHRoaXMsIGluaXQubmFtZSwgaW5pdC5sYWJlbCwgaW5pdC52YWx1ZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICd0cmlnZ2VyJzpcbiAgICAgICAgcGFyYW0gPSBuZXcgX1RyaWdnZXJQYXJhbSh0aGlzLCBpbml0Lm5hbWUsIGluaXQubGFiZWwpO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyYW07XG4gIH1cblxuICAvKipcbiAgICogQGNhbGxiYWNrIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5TaGFyZWRQYXJhbXN+cGFyYW1DYWxsYmFja1xuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZSAtIFVwZGF0ZWQgdmFsdWUgb2YgdGhlIHNoYXJlZCBwYXJhbWV0ZXIuXG4gICAqL1xuXG4gIC8qKlxuICAgKiBBZGQgYSBsaXN0ZW5lciB0byBsaXN0ZW4gYSBzcGVjaWZpYyBwYXJhbWV0ZXIgY2hhbmdlcy4gVGhlIGxpc3RlbmVyIGlzXG4gICAqIGV4ZWN1dGVkIGltbWVkaWF0ZWx5IHdoZW4gYWRkZWQgd2l0aCB0aGUgcGFyYW1ldGVyIGN1cnJlbnQgdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gTmFtZSBvZiB0aGUgcGFyYW1ldGVyLlxuICAgKiBAcGFyYW0ge21vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5TaGFyZWRQYXJhbXN+cGFyYW1DYWxsYmFja30gbGlzdGVuZXIgLVxuICAgKiAgTGlzdGVuZXIgdG8gYWRkLlxuICAgKi9cbiAgYWRkUGFyYW1MaXN0ZW5lcihuYW1lLCBsaXN0ZW5lcikge1xuICAgIGNvbnN0IHBhcmFtID0gdGhpcy5wYXJhbXNbbmFtZV07XG5cbiAgICBpZiAocGFyYW0pIHtcbiAgICAgIHBhcmFtLmFkZExpc3RlbmVyKCd1cGRhdGUnLCBsaXN0ZW5lcik7XG5cbiAgICAgIGlmIChwYXJhbS50eXBlICE9PSAndHJpZ2dlcicpXG4gICAgICAgIGxpc3RlbmVyKHBhcmFtLnZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ3Vua25vd24gcGFyYW0gXCInICsgbmFtZSArICdcIicpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBsaXN0ZW5lciBmcm9tIGxpc3RlbmluZyBhIHNwZWNpZmljIHBhcmFtZXRlciBjaGFuZ2VzLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIE5hbWUgb2YgdGhlIHBhcmFtZXRlci5cbiAgICogQHBhcmFtIHttb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuU2hhcmVkUGFyYW1zfnBhcmFtQ2FsbGJhY2t9IGxpc3RlbmVyIC1cbiAgICogIExpc3RlbmVyIHRvIHJlbW92ZS5cbiAgICovXG4gIHJlbW92ZVBhcmFtTGlzdGVuZXIobmFtZSwgbGlzdGVuZXIpIHtcbiAgICBjb25zdCBwYXJhbSA9IHRoaXMucGFyYW1zW25hbWVdO1xuXG4gICAgaWYgKHBhcmFtKVxuICAgICAgcGFyYW0ucmVtb3ZlTGlzdGVuZXIoJ3VwZGF0ZScsIGxpc3RlbmVyKTtcbiAgICBlbHNlXG4gICAgICBjb25zb2xlLmxvZygndW5rbm93biBwYXJhbSBcIicgKyBuYW1lICsgJ1wiJyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSB2YWx1ZSBvZiBhIGdpdmVuIHBhcmFtZXRlci5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSBwYXJhbWV0ZXIuXG4gICAqIEByZXR1cm5zIHtNaXhlZH0gLSBDdXJyZW50IHZhbHVlIG9mIHRoZSBwYXJhbWV0ZXIuXG4gICAqL1xuICBnZXRWYWx1ZShuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyYW1zW25hbWVdLnZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgdmFsdWUgb2YgYSBwYXJhbWV0ZXIgKHVzZWQgd2hlbiBgb3B0aW9ucy5oYXNHVUk9dHJ1ZWApXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gTmFtZSBvZiB0aGUgcGFyYW1ldGVyLlxuICAgKiBAcGFyYW0ge01peGVkfSB2YWwgLSBOZXcgdmFsdWUgb2YgdGhlIHBhcmFtZXRlci5cbiAgICogQHBhcmFtIHtCb29sZWFufSBbc2VuZFRvU2VydmVyPXRydWVdIC0gRmxhZyB3aGV0aGVyIHRoZSB2YWx1ZSBzaG91bGQgYmVcbiAgICogIHByb3BhZ2F0ZWQgdG8gdGhlIHNlcnZlci5cbiAgICovXG4gIHVwZGF0ZShuYW1lLCB2YWwsIHNlbmRUb1NlcnZlciA9IHRydWUpIHtcbiAgICBjb25zdCBwYXJhbSA9IHRoaXMucGFyYW1zW25hbWVdO1xuXG4gICAgaWYgKHBhcmFtKVxuICAgICAgcGFyYW0udXBkYXRlKHZhbCwgc2VuZFRvU2VydmVyKTtcbiAgICBlbHNlXG4gICAgICBjb25zb2xlLmxvZygndW5rbm93biBzaGFyZWQgcGFyYW1ldGVyIFwiJyArIG5hbWUgKyAnXCInKTtcbiAgfVxufVxuXG5zZXJ2aWNlTWFuYWdlci5yZWdpc3RlcihTRVJWSUNFX0lELCBTaGFyZWRQYXJhbXMpO1xuXG5leHBvcnQgZGVmYXVsdCBTaGFyZWRQYXJhbXM7XG4iXX0=