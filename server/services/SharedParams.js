'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

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

var _Service2 = require('../core/Service');

var _Service3 = _interopRequireDefault(_Service2);

var _serviceManager = require('../core/serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @private */
var _ControlItem = function (_EventEmitter) {
  (0, _inherits3.default)(_ControlItem, _EventEmitter);

  function _ControlItem(parent, type, name, label) {
    var init = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
    var clientTypes = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
    (0, _classCallCheck3.default)(this, _ControlItem);

    var _this = (0, _possibleConstructorReturn3.default)(this, (_ControlItem.__proto__ || (0, _getPrototypeOf2.default)(_ControlItem)).call(this));

    _this.parent = parent;
    _this.clientTypes = clientTypes;

    _this.data = {
      type: type,
      name: name,
      label: label,
      value: init
    };

    parent.params[name] = _this;
    parent._paramData.push(_this.data);
    return _this;
  }

  (0, _createClass3.default)(_ControlItem, [{
    key: 'set',
    value: function set(val) {
      this.data.value = val;
    }
  }, {
    key: 'update',
    value: function update() {
      var val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var excludeClient = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var parent = this.parent;
      var data = this.data;

      this.set(val); // set value
      this.emit(data.name, data.value); // call param listeners
      parent.broadcast(this.clientTypes, excludeClient, 'update', data.name, data.value); // send to clients
      parent.emit('update', data.name, data.value); // call parent listeners
    }
  }]);
  return _ControlItem;
}(_events.EventEmitter);

/** @private */


var _BooleanItem = function (_ControlItem2) {
  (0, _inherits3.default)(_BooleanItem, _ControlItem2);

  function _BooleanItem(parent, name, label, init) {
    var clientTypes = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    (0, _classCallCheck3.default)(this, _BooleanItem);
    return (0, _possibleConstructorReturn3.default)(this, (_BooleanItem.__proto__ || (0, _getPrototypeOf2.default)(_BooleanItem)).call(this, parent, 'boolean', name, label, init, clientTypes));
  }

  (0, _createClass3.default)(_BooleanItem, [{
    key: 'set',
    value: function set(val) {
      this.data.value = val;
    }
  }]);
  return _BooleanItem;
}(_ControlItem);

/** @private */


var _EnumItem = function (_ControlItem3) {
  (0, _inherits3.default)(_EnumItem, _ControlItem3);

  function _EnumItem(parent, name, label, options, init) {
    var clientTypes = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
    (0, _classCallCheck3.default)(this, _EnumItem);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (_EnumItem.__proto__ || (0, _getPrototypeOf2.default)(_EnumItem)).call(this, parent, 'enum', name, label, init, clientTypes));

    _this3.data.options = options;
    return _this3;
  }

  (0, _createClass3.default)(_EnumItem, [{
    key: 'set',
    value: function set(val) {
      var data = this.data;
      var index = data.options.indexOf(val);

      if (index >= 0) {
        data.value = val;
        data.index = index;
      }
    }
  }]);
  return _EnumItem;
}(_ControlItem);

/** @private */


var _NumberItem = function (_ControlItem4) {
  (0, _inherits3.default)(_NumberItem, _ControlItem4);

  function _NumberItem(parent, name, label, min, max, step, init) {
    var clientTypes = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : null;
    (0, _classCallCheck3.default)(this, _NumberItem);

    var _this4 = (0, _possibleConstructorReturn3.default)(this, (_NumberItem.__proto__ || (0, _getPrototypeOf2.default)(_NumberItem)).call(this, parent, 'number', name, label, init, clientTypes));

    var data = _this4.data;
    data.min = min;
    data.max = max;
    data.step = step;
    return _this4;
  }

  (0, _createClass3.default)(_NumberItem, [{
    key: 'set',
    value: function set(val) {
      this.data.value = Math.min(this.data.max, Math.max(this.data.min, val));
    }
  }]);
  return _NumberItem;
}(_ControlItem);

/** @private */


var _TextItem = function (_ControlItem5) {
  (0, _inherits3.default)(_TextItem, _ControlItem5);

  function _TextItem(parent, name, label, init) {
    var clientTypes = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    (0, _classCallCheck3.default)(this, _TextItem);
    return (0, _possibleConstructorReturn3.default)(this, (_TextItem.__proto__ || (0, _getPrototypeOf2.default)(_TextItem)).call(this, parent, 'text', name, label, init, clientTypes));
  }

  (0, _createClass3.default)(_TextItem, [{
    key: 'set',
    value: function set(val) {
      this.data.value = val;
    }
  }]);
  return _TextItem;
}(_ControlItem);

/** @private */


var _TriggerItem = function (_ControlItem6) {
  (0, _inherits3.default)(_TriggerItem, _ControlItem6);

  function _TriggerItem(parent, name, label) {
    var clientTypes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    (0, _classCallCheck3.default)(this, _TriggerItem);
    return (0, _possibleConstructorReturn3.default)(this, (_TriggerItem.__proto__ || (0, _getPrototypeOf2.default)(_TriggerItem)).call(this, parent, 'trigger', name, label, undefined, clientTypes));
  }

  return _TriggerItem;
}(_ControlItem);

var SERVICE_ID = 'service:shared-params';

/**
 * Interface for the server `'shared-params'` service.
 *
 * This service allows to create shared parameters among a distributed
 * application. Each shared parameter can be of the following data types:
 * - boolean
 * - enum
 * - number
 * - text
 * - trigger,
 *
 * configured with specific attributes, and bounded to specific type of clients.
 *
 * __*The service must be used with its [client-side counterpart]{@link module:soundworks/client.SharedParams}*__
 *
 * @memberof module:soundworks/server
 * @example
 * // create a boolean shared parameter with default value to `false`,
 * // inside the server experience constructor
 * this.sharedParams = this.require('shared-params');
 * this.sharedParams.addBoolean('my:boolean', 'MyBoolean', false);
 */

var SharedParams = function (_Service) {
  (0, _inherits3.default)(SharedParams, _Service);

  /** _<span class="warning">__WARNING__</span> This class should never be instanciated manually_ */
  function SharedParams() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, SharedParams);

    /**
     * Dictionary of all control parameters.
     * @type {Object}
     * @private
     */
    var _this7 = (0, _possibleConstructorReturn3.default)(this, (SharedParams.__proto__ || (0, _getPrototypeOf2.default)(SharedParams)).call(this, SERVICE_ID));

    _this7.params = {};

    /**
     * Array of parameter data cells.
     * @type {Array}
     */
    _this7._paramData = [];
    return _this7;
  }

  /**
   * Generic method to create shared parameters from an array of definitions.
   * A definition is an object with a 'type' property
   * ('boolean' | 'enum' | 'number' | 'text' | 'trigger') and a set of properties
   * matching the arguments of the corresponding `add${type}` method.
   * @see {@link SharedParams#addBoolean}
   * @see {@link SharedParams#addEnum}
   * @see {@link SharedParams#addNumber}
   * @see {@link SharedParams#addText}
   * @see {@link SharedParams#addTrigger}
   * @param {Array} definitions - An array of parameter definitions.
   */


  (0, _createClass3.default)(SharedParams, [{
    key: 'add',
    value: function add(definitions) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(definitions), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var def = _step.value;

          var type = def.type || 'text';

          switch (type) {
            case 'boolean':
              this.addBoolean(def.name, def.label, def.value, def.clientTypes);
              break;
            case 'enum':
              this.addEnum(def.name, def.label, def.options, def.value, def.clientTypes);
              break;
            case 'number':
              this.addNumber(def.name, def.label, def.min, def.max, def.step, def.value, def.clientTypes);
              break;
            case 'text':
              this.addText(def.name, def.label, def.value, def.clientTypes);
              break;
            case 'trigger':
              this.addTrigger(def.name, def.label, def.clientTypes);
              break;
          }
        }
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
    }

    /**
     * Add a `boolean` parameter.
     * @param {String} name - Name of the parameter.
     * @param {String} label - Label of the parameter (displayed on the GUI on the client side)
     * @param {Number} value - Initial value of the parameter (`true` or `false`).
     * @param {String[]} [clientTypes=null] - Array of the client types to send
     *  the parameter value to. If not set, the value is sent to all the client types.
     */

  }, {
    key: 'addBoolean',
    value: function addBoolean(name, label, value) {
      var clientTypes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

      return new _BooleanItem(this, name, label, value, clientTypes);
    }

    /**
     * Add an `enum` parameter.
     * @param {String} name - Name of the parameter.
     * @param {String} label - Label of the parameter (displayed on the GUI on the client side).
     * @param {String[]} options - Different possible values of the parameter.
     * @param {Number} value - Initial value of the parameter (must be defined in `options`).
     * @param {String[]} [clientTypes=null] - Array of the client types to send
     *  the parameter value to. If not set, the value is sent to all the client types.
     */

  }, {
    key: 'addEnum',
    value: function addEnum(name, label, options, value) {
      var clientTypes = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

      return new _EnumItem(this, name, label, options, value, clientTypes);
    }

    /**
     * Add a `number` parameter.
     * @param {String} name - Name of the parameter.
     * @param {String} label - Label of the parameter (displayed on the GUI on the client side).
     * @param {Number} min - Minimum value of the parameter.
     * @param {Number} max - Maximum value of the parameter.
     * @param {Number} step - Step by which the parameter value is increased or decreased.
     * @param {Number} value - Initial value of the parameter.
     * @param {String[]} [clientTypes=null] - Array of the client types to send
     *  the parameter value to. If not set, the value is sent to all the client types.
     */

  }, {
    key: 'addNumber',
    value: function addNumber(name, label, min, max, step, value) {
      var clientTypes = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;

      return new _NumberItem(this, name, label, min, max, step, value, clientTypes);
    }

    /**
     * Add a `text` parameter.
     * @param {String} name - Name of the parameter.
     * @param {String} label - Label of the parameter (displayed on the GUI on the client side).
     * @param {Number} value - Initial value of the parameter.
     * @param {String[]} [clientTypes=null] - Array of the client types to send
     *  the parameter value to. If not set, the value is sent to all the client types.
     */

  }, {
    key: 'addText',
    value: function addText(name, label, value) {
      var clientTypes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

      return new _TextItem(this, name, label, value, clientTypes);
    }

    /**
     * Add a trigger (not really a parameter).
     * @param {String} name - Name of the trigger.
     * @param {String} label - Label of the trigger (displayed on the GUI on the client side).
     * @param {String[]} [clientTypes=null] - Array of the client types to send
     *  the trigger to. If not set, the value is sent to all the client types.
     */

  }, {
    key: 'addTrigger',
    value: function addTrigger(name, label) {
      var clientTypes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      return new _TriggerItem(this, name, label, undefined, clientTypes);
    }

    /**
     * @callback module:soundworks/server.SharedParams~paramCallback
     * @param {Mixed} value - Updated value of the parameter.
     */
    /**
     * Add a listener to listen to a specific parameter changes. The listener
     * is called a first time when added to retrieve the current value of the parameter.
     * @param {String} name - Name of the parameter.
     * @param {module:soundworks/server.SharedParams~paramCallback} listener - Callback
     *  that handle the event.
     */

  }, {
    key: 'addParamListener',
    value: function addParamListener(name, listener) {
      var param = this.params[name];

      if (param) {
        param.addListener(param.data.name, listener);

        if (param.data.type !== 'trigger') listener(param.data.value);
      } else {
        console.log('unknown shared parameter "' + name + '"');
      }
    }

    /**
     * Remove a listener from listening to a specific parameter changes.
     * @param {String} name - Name of the event.
     * @param {module:soundworks/client.SharedParams~paramCallback} listener - The
     *  callback to remove.
     */

  }, {
    key: 'removeParamListener',
    value: function removeParamListener(name, listener) {
      var param = this.params[name];

      if (param) param.removeListener(param.data.name, listener);else console.log('unknown shared parameter "' + name + '"');
    }

    /**
     * Updates the value of a parameter and sends it to the clients.
     * @private
     * @param {String} name - Name of the parameter to update.
     * @param {Mixed} value - New value of the parameter.
     * @param {String} [excludeClient=null] - Exclude the given client from the
     *  clients to send the update to (generally the source of the update).
     */

  }, {
    key: 'update',
    value: function update(name, value) {
      var excludeClient = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var param = this.params[name];

      if (param) param.update(value, excludeClient);else console.log('unknown shared parameter  "' + name + '"');
    }

    /** @private */

  }, {
    key: 'connect',
    value: function connect(client) {
      (0, _get3.default)(SharedParams.prototype.__proto__ || (0, _getPrototypeOf2.default)(SharedParams.prototype), 'connect', this).call(this, client);

      this.receive(client, 'request', this._onRequest(client));
      this.receive(client, 'update', this._onUpdate(client));
    }

    /** @private */

  }, {
    key: '_onRequest',
    value: function _onRequest(client) {
      var _this8 = this;

      return function () {
        return _this8.send(client, 'init', _this8._paramData);
      };
    }

    /** @private */

  }, {
    key: '_onUpdate',
    value: function _onUpdate(client) {
      var _this9 = this;

      // update, but exclude client from broadcasting to other clients
      return function (name, value) {
        return _this9.update(name, value, client);
      };
    }
  }]);
  return SharedParams;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, SharedParams);

exports.default = SharedParams;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNoYXJlZFBhcmFtcy5qcyJdLCJuYW1lcyI6WyJfQ29udHJvbEl0ZW0iLCJwYXJlbnQiLCJ0eXBlIiwibmFtZSIsImxhYmVsIiwiaW5pdCIsInVuZGVmaW5lZCIsImNsaWVudFR5cGVzIiwiZGF0YSIsInZhbHVlIiwicGFyYW1zIiwiX3BhcmFtRGF0YSIsInB1c2giLCJ2YWwiLCJleGNsdWRlQ2xpZW50Iiwic2V0IiwiZW1pdCIsImJyb2FkY2FzdCIsIl9Cb29sZWFuSXRlbSIsIl9FbnVtSXRlbSIsIm9wdGlvbnMiLCJpbmRleCIsImluZGV4T2YiLCJfTnVtYmVySXRlbSIsIm1pbiIsIm1heCIsInN0ZXAiLCJNYXRoIiwiX1RleHRJdGVtIiwiX1RyaWdnZXJJdGVtIiwiU0VSVklDRV9JRCIsIlNoYXJlZFBhcmFtcyIsImRlZmluaXRpb25zIiwiZGVmIiwiYWRkQm9vbGVhbiIsImFkZEVudW0iLCJhZGROdW1iZXIiLCJhZGRUZXh0IiwiYWRkVHJpZ2dlciIsImxpc3RlbmVyIiwicGFyYW0iLCJhZGRMaXN0ZW5lciIsImNvbnNvbGUiLCJsb2ciLCJyZW1vdmVMaXN0ZW5lciIsInVwZGF0ZSIsImNsaWVudCIsInJlY2VpdmUiLCJfb25SZXF1ZXN0IiwiX29uVXBkYXRlIiwic2VuZCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7SUFDTUEsWTs7O0FBQ0osd0JBQVlDLE1BQVosRUFBb0JDLElBQXBCLEVBQTBCQyxJQUExQixFQUFnQ0MsS0FBaEMsRUFBNkU7QUFBQSxRQUF0Q0MsSUFBc0MsdUVBQS9CQyxTQUErQjtBQUFBLFFBQXBCQyxXQUFvQix1RUFBTixJQUFNO0FBQUE7O0FBQUE7O0FBRzNFLFVBQUtOLE1BQUwsR0FBY0EsTUFBZDtBQUNBLFVBQUtNLFdBQUwsR0FBbUJBLFdBQW5COztBQUVBLFVBQUtDLElBQUwsR0FBWTtBQUNWTixZQUFNQSxJ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QUtFLFVBQUwsQ0FBZ0JGLE1BQWhCLENBQWhDO0FBQ0EsV0FBS0MsT0FBTCxDQUFhRCxNQUFiLEVBQXFCLFFBQXJCLEVBQStCLEtBQUtHLFNBQUwsQ0FBZUgsTUFBZixDQUEvQjtBQUNEOztBQUVEOzs7OytCQUNXQSxNLEVBQVE7QUFBQTs7QUFDakIsYUFBTztBQUFBLGVBQU0sT0FBS0ksSUFBTCxDQUFVSixNQUFWLEVBQWtCLE1BQWxCLEVBQTBCLE9BQUtuQyxVQUEvQixDQUFOO0FBQUEsT0FBUDtBQUNEOztBQUVEOzs7OzhCQUNVbUMsTSxFQUFRO0FBQUE7O0FBQ2hCO0FBQ0EsYUFBTyxVQUFDM0MsSUFBRCxFQUFPTSxLQUFQO0FBQUEsZUFBaUIsT0FBS29DLE1BQUwsQ0FBWTFDLElBQVosRUFBa0JNLEtBQWxCLEVBQXlCcUMsTUFBekIsQ0FBakI7QUFBQSxPQUFQO0FBQ0Q7Ozs7O0FBR0gseUJBQWVLLFFBQWYsQ0FBd0JyQixVQUF4QixFQUFvQ0MsWUFBcEM7O2tCQUVlQSxZIiwiZmlsZSI6IlNoYXJlZFBhcmFtcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTZXJ2aWNlIGZyb20gJy4uL2NvcmUvU2VydmljZSc7XG5pbXBvcnQgc2VydmljZU1hbmFnZXIgZnJvbSAnLi4vY29yZS9zZXJ2aWNlTWFuYWdlcic7XG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuXG4vKiogQHByaXZhdGUgKi9cbmNsYXNzIF9Db250cm9sSXRlbSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yKHBhcmVudCwgdHlwZSwgbmFtZSwgbGFiZWwsIGluaXQgPSB1bmRlZmluZWQsIGNsaWVudFR5cGVzID0gbnVsbCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLmNsaWVudFR5cGVzID0gY2xpZW50VHlwZXM7XG5cbiAgICB0aGlzLmRhdGEgPSB7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgIHZhbHVlOiBpbml0LFxuICAgIH07XG5cbiAgICBwYXJlbnQucGFyYW1zW25hbWVdID0gdGhpcztcbiAgICBwYXJlbnQuX3BhcmFtRGF0YS5wdXNoKHRoaXMuZGF0YSk7XG4gIH1cblxuICBzZXQodmFsKSB7XG4gICAgdGhpcy5kYXRhLnZhbHVlID0gdmFsO1xuICB9XG5cbiAgdXBkYXRlKHZhbCA9IHVuZGVmaW5lZCwgZXhjbHVkZUNsaWVudCA9IG51bGwpIHtcbiAgICBsZXQgcGFyZW50ID0gdGhpcy5wYXJlbnQ7XG4gICAgbGV0IGRhdGEgPSB0aGlzLmRhdGE7XG5cbiAgICB0aGlzLnNldCh2YWwpOyAvLyBzZXQgdmFsdWVcbiAgICB0aGlzLmVtaXQoZGF0YS5uYW1lLCBkYXRhLnZhbHVlKTsgLy8gY2FsbCBwYXJhbSBsaXN0ZW5lcnNcbiAgICBwYXJlbnQuYnJvYWRjYXN0KHRoaXMuY2xpZW50VHlwZXMsIGV4Y2x1ZGVDbGllbnQsICd1cGRhdGUnLCBkYXRhLm5hbWUsIGRhdGEudmFsdWUpOyAvLyBzZW5kIHRvIGNsaWVudHNcbiAgICBwYXJlbnQuZW1pdCgndXBkYXRlJywgZGF0YS5uYW1lLCBkYXRhLnZhbHVlKTsgLy8gY2FsbCBwYXJlbnQgbGlzdGVuZXJzXG4gIH1cbn1cblxuLyoqIEBwcml2YXRlICovXG5jbGFzcyBfQm9vbGVhbkl0ZW0gZXh0ZW5kcyBfQ29udHJvbEl0ZW0ge1xuICBjb25zdHJ1Y3RvcihwYXJlbnQsIG5hbWUsIGxhYmVsLCBpbml0LCBjbGllbnRUeXBlcyA9IG51bGwpIHtcbiAgICBzdXBlcihwYXJlbnQsICdib29sZWFuJywgbmFtZSwgbGFiZWwsIGluaXQsIGNsaWVudFR5cGVzKTtcbiAgfVxuXG4gIHNldCh2YWwpIHtcbiAgICB0aGlzLmRhdGEudmFsdWUgPSB2YWw7XG4gIH1cbn1cblxuLyoqIEBwcml2YXRlICovXG5jbGFzcyBfRW51bUl0ZW0gZXh0ZW5kcyBfQ29udHJvbEl0ZW0ge1xuICBjb25zdHJ1Y3RvcihwYXJlbnQsIG5hbWUsIGxhYmVsLCBvcHRpb25zLCBpbml0LCBjbGllbnRUeXBlcyA9IG51bGwpIHtcbiAgICBzdXBlcihwYXJlbnQsICdlbnVtJywgbmFtZSwgbGFiZWwsIGluaXQsIGNsaWVudFR5cGVzKTtcblxuICAgIHRoaXMuZGF0YS5vcHRpb25zID0gb3B0aW9ucztcbiAgfVxuXG4gIHNldCh2YWwpIHtcbiAgICBsZXQgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICBsZXQgaW5kZXggPSBkYXRhLm9wdGlvbnMuaW5kZXhPZih2YWwpO1xuXG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIGRhdGEudmFsdWUgPSB2YWw7XG4gICAgICBkYXRhLmluZGV4ID0gaW5kZXg7XG4gICAgfVxuICB9XG59XG5cbi8qKiBAcHJpdmF0ZSAqL1xuY2xhc3MgX051bWJlckl0ZW0gZXh0ZW5kcyBfQ29udHJvbEl0ZW0ge1xuICBjb25zdHJ1Y3RvcihwYXJlbnQsIG5hbWUsIGxhYmVsLCBtaW4sIG1heCwgc3RlcCwgaW5pdCwgY2xpZW50VHlwZXMgPSBudWxsKSB7XG4gICAgc3VwZXIocGFyZW50LCAnbnVtYmVyJywgbmFtZSwgbGFiZWwsIGluaXQsIGNsaWVudFR5cGVzKTtcblxuICAgIGxldCBkYXRhID0gdGhpcy5kYXRhO1xuICAgIGRhdGEubWluID0gbWluO1xuICAgIGRhdGEubWF4ID0gbWF4O1xuICAgIGRhdGEuc3RlcCA9IHN0ZXA7XG4gIH1cblxuICBzZXQodmFsKSB7XG4gICAgdGhpcy5kYXRhLnZhbHVlID0gTWF0aC5taW4odGhpcy5kYXRhLm1heCwgTWF0aC5tYXgodGhpcy5kYXRhLm1pbiwgdmFsKSk7XG4gIH1cbn1cblxuLyoqIEBwcml2YXRlICovXG5jbGFzcyBfVGV4dEl0ZW0gZXh0ZW5kcyBfQ29udHJvbEl0ZW0ge1xuICBjb25zdHJ1Y3RvcihwYXJlbnQsIG5hbWUsIGxhYmVsLCBpbml0LCBjbGllbnRUeXBlcyA9IG51bGwpIHtcbiAgICBzdXBlcihwYXJlbnQsICd0ZXh0JywgbmFtZSwgbGFiZWwsIGluaXQsIGNsaWVudFR5cGVzKTtcbiAgfVxuXG4gIHNldCh2YWwpIHtcbiAgICB0aGlzLmRhdGEudmFsdWUgPSB2YWw7XG4gIH1cbn1cblxuLyoqIEBwcml2YXRlICovXG5jbGFzcyBfVHJpZ2dlckl0ZW0gZXh0ZW5kcyBfQ29udHJvbEl0ZW0ge1xuICBjb25zdHJ1Y3RvcihwYXJlbnQsIG5hbWUsIGxhYmVsLCBjbGllbnRUeXBlcyA9IG51bGwpIHtcbiAgICBzdXBlcihwYXJlbnQsICd0cmlnZ2VyJywgbmFtZSwgbGFiZWwsIHVuZGVmaW5lZCwgY2xpZW50VHlwZXMpO1xuICB9XG59XG5cblxuY29uc3QgU0VSVklDRV9JRCA9ICdzZXJ2aWNlOnNoYXJlZC1wYXJhbXMnO1xuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIHNlcnZlciBgJ3NoYXJlZC1wYXJhbXMnYCBzZXJ2aWNlLlxuICpcbiAqIFRoaXMgc2VydmljZSBhbGxvd3MgdG8gY3JlYXRlIHNoYXJlZCBwYXJhbWV0ZXJzIGFtb25nIGEgZGlzdHJpYnV0ZWRcbiAqIGFwcGxpY2F0aW9uLiBFYWNoIHNoYXJlZCBwYXJhbWV0ZXIgY2FuIGJlIG9mIHRoZSBmb2xsb3dpbmcgZGF0YSB0eXBlczpcbiAqIC0gYm9vbGVhblxuICogLSBlbnVtXG4gKiAtIG51bWJlclxuICogLSB0ZXh0XG4gKiAtIHRyaWdnZXIsXG4gKlxuICogY29uZmlndXJlZCB3aXRoIHNwZWNpZmljIGF0dHJpYnV0ZXMsIGFuZCBib3VuZGVkIHRvIHNwZWNpZmljIHR5cGUgb2YgY2xpZW50cy5cbiAqXG4gKiBfXypUaGUgc2VydmljZSBtdXN0IGJlIHVzZWQgd2l0aCBpdHMgW2NsaWVudC1zaWRlIGNvdW50ZXJwYXJ0XXtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuU2hhcmVkUGFyYW1zfSpfX1xuICpcbiAqIEBtZW1iZXJvZiBtb2R1bGU6c291bmR3b3Jrcy9zZXJ2ZXJcbiAqIEBleGFtcGxlXG4gKiAvLyBjcmVhdGUgYSBib29sZWFuIHNoYXJlZCBwYXJhbWV0ZXIgd2l0aCBkZWZhdWx0IHZhbHVlIHRvIGBmYWxzZWAsXG4gKiAvLyBpbnNpZGUgdGhlIHNlcnZlciBleHBlcmllbmNlIGNvbnN0cnVjdG9yXG4gKiB0aGlzLnNoYXJlZFBhcmFtcyA9IHRoaXMucmVxdWlyZSgnc2hhcmVkLXBhcmFtcycpO1xuICogdGhpcy5zaGFyZWRQYXJhbXMuYWRkQm9vbGVhbignbXk6Ym9vbGVhbicsICdNeUJvb2xlYW4nLCBmYWxzZSk7XG4gKi9cbmNsYXNzIFNoYXJlZFBhcmFtcyBleHRlbmRzIFNlcnZpY2Uge1xuICAvKiogXzxzcGFuIGNsYXNzPVwid2FybmluZ1wiPl9fV0FSTklOR19fPC9zcGFuPiBUaGlzIGNsYXNzIHNob3VsZCBuZXZlciBiZSBpbnN0YW5jaWF0ZWQgbWFudWFsbHlfICovXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKFNFUlZJQ0VfSUQpO1xuXG4gICAgLyoqXG4gICAgICogRGljdGlvbmFyeSBvZiBhbGwgY29udHJvbCBwYXJhbWV0ZXJzLlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnBhcmFtcyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogQXJyYXkgb2YgcGFyYW1ldGVyIGRhdGEgY2VsbHMuXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqL1xuICAgIHRoaXMuX3BhcmFtRGF0YSA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyaWMgbWV0aG9kIHRvIGNyZWF0ZSBzaGFyZWQgcGFyYW1ldGVycyBmcm9tIGFuIGFycmF5IG9mIGRlZmluaXRpb25zLlxuICAgKiBBIGRlZmluaXRpb24gaXMgYW4gb2JqZWN0IHdpdGggYSAndHlwZScgcHJvcGVydHlcbiAgICogKCdib29sZWFuJyB8wqAnZW51bScgfMKgJ251bWJlcicgfMKgJ3RleHQnIHzCoCd0cmlnZ2VyJykgYW5kIGEgc2V0IG9mIHByb3BlcnRpZXNcbiAgICogbWF0Y2hpbmcgdGhlIGFyZ3VtZW50cyBvZiB0aGUgY29ycmVzcG9uZGluZyBgYWRkJHt0eXBlfWAgbWV0aG9kLlxuICAgKiBAc2VlIHtAbGluayBTaGFyZWRQYXJhbXMjYWRkQm9vbGVhbn1cbiAgICogQHNlZSB7QGxpbmsgU2hhcmVkUGFyYW1zI2FkZEVudW19XG4gICAqIEBzZWUge0BsaW5rIFNoYXJlZFBhcmFtcyNhZGROdW1iZXJ9XG4gICAqIEBzZWUge0BsaW5rIFNoYXJlZFBhcmFtcyNhZGRUZXh0fVxuICAgKiBAc2VlIHtAbGluayBTaGFyZWRQYXJhbXMjYWRkVHJpZ2dlcn1cbiAgICogQHBhcmFtIHtBcnJheX0gZGVmaW5pdGlvbnMgLSBBbiBhcnJheSBvZiBwYXJhbWV0ZXIgZGVmaW5pdGlvbnMuXG4gICAqL1xuICBhZGQoZGVmaW5pdGlvbnMpIHtcbiAgICBmb3IgKGxldCBkZWYgb2YgZGVmaW5pdGlvbnMpIHtcbiAgICAgIGxldCB0eXBlID0gZGVmLnR5cGUgfHwgJ3RleHQnO1xuXG4gICAgICBzd2l0Y2godHlwZSkge1xuICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgICB0aGlzLmFkZEJvb2xlYW4oZGVmLm5hbWUsIGRlZi5sYWJlbCwgZGVmLnZhbHVlLCBkZWYuY2xpZW50VHlwZXMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdlbnVtJzpcbiAgICAgICAgICB0aGlzLmFkZEVudW0oZGVmLm5hbWUsIGRlZi5sYWJlbCwgZGVmLm9wdGlvbnMsIGRlZi52YWx1ZSwgZGVmLmNsaWVudFR5cGVzKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgICB0aGlzLmFkZE51bWJlcihkZWYubmFtZSwgZGVmLmxhYmVsLCBkZWYubWluLCBkZWYubWF4LCBkZWYuc3RlcCwgZGVmLnZhbHVlLCBkZWYuY2xpZW50VHlwZXMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgICB0aGlzLmFkZFRleHQoZGVmLm5hbWUsIGRlZi5sYWJlbCwgZGVmLnZhbHVlLCBkZWYuY2xpZW50VHlwZXMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0cmlnZ2VyJzpcbiAgICAgICAgICB0aGlzLmFkZFRyaWdnZXIoZGVmLm5hbWUsIGRlZi5sYWJlbCwgZGVmLmNsaWVudFR5cGVzKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgYGJvb2xlYW5gIHBhcmFtZXRlci5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSBwYXJhbWV0ZXIuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCAtIExhYmVsIG9mIHRoZSBwYXJhbWV0ZXIgKGRpc3BsYXllZCBvbiB0aGUgR1VJIG9uIHRoZSBjbGllbnQgc2lkZSlcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIC0gSW5pdGlhbCB2YWx1ZSBvZiB0aGUgcGFyYW1ldGVyIChgdHJ1ZWAgb3IgYGZhbHNlYCkuXG4gICAqIEBwYXJhbSB7U3RyaW5nW119IFtjbGllbnRUeXBlcz1udWxsXSAtIEFycmF5IG9mIHRoZSBjbGllbnQgdHlwZXMgdG8gc2VuZFxuICAgKiAgdGhlIHBhcmFtZXRlciB2YWx1ZSB0by4gSWYgbm90IHNldCwgdGhlIHZhbHVlIGlzIHNlbnQgdG8gYWxsIHRoZSBjbGllbnQgdHlwZXMuXG4gICAqL1xuICBhZGRCb29sZWFuKG5hbWUsIGxhYmVsLCB2YWx1ZSwgY2xpZW50VHlwZXMgPSBudWxsKSB7XG4gICAgcmV0dXJuIG5ldyBfQm9vbGVhbkl0ZW0odGhpcywgbmFtZSwgbGFiZWwsIHZhbHVlLCBjbGllbnRUeXBlcyk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGFuIGBlbnVtYCBwYXJhbWV0ZXIuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gTmFtZSBvZiB0aGUgcGFyYW1ldGVyLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbGFiZWwgLSBMYWJlbCBvZiB0aGUgcGFyYW1ldGVyIChkaXNwbGF5ZWQgb24gdGhlIEdVSSBvbiB0aGUgY2xpZW50IHNpZGUpLlxuICAgKiBAcGFyYW0ge1N0cmluZ1tdfSBvcHRpb25zIC0gRGlmZmVyZW50IHBvc3NpYmxlIHZhbHVlcyBvZiB0aGUgcGFyYW1ldGVyLlxuICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWUgLSBJbml0aWFsIHZhbHVlIG9mIHRoZSBwYXJhbWV0ZXIgKG11c3QgYmUgZGVmaW5lZCBpbiBgb3B0aW9uc2ApLlxuICAgKiBAcGFyYW0ge1N0cmluZ1tdfSBbY2xpZW50VHlwZXM9bnVsbF0gLSBBcnJheSBvZiB0aGUgY2xpZW50IHR5cGVzIHRvIHNlbmRcbiAgICogIHRoZSBwYXJhbWV0ZXIgdmFsdWUgdG8uIElmIG5vdCBzZXQsIHRoZSB2YWx1ZSBpcyBzZW50IHRvIGFsbCB0aGUgY2xpZW50IHR5cGVzLlxuICAgKi9cbiAgYWRkRW51bShuYW1lLCBsYWJlbCwgb3B0aW9ucywgdmFsdWUsIGNsaWVudFR5cGVzID0gbnVsbCkge1xuICAgIHJldHVybiBuZXcgX0VudW1JdGVtKHRoaXMsIG5hbWUsIGxhYmVsLCBvcHRpb25zLCB2YWx1ZSwgY2xpZW50VHlwZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGBudW1iZXJgIHBhcmFtZXRlci5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSBwYXJhbWV0ZXIuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCAtIExhYmVsIG9mIHRoZSBwYXJhbWV0ZXIgKGRpc3BsYXllZCBvbiB0aGUgR1VJIG9uIHRoZSBjbGllbnQgc2lkZSkuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBtaW4gLSBNaW5pbXVtIHZhbHVlIG9mIHRoZSBwYXJhbWV0ZXIuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBtYXggLSBNYXhpbXVtIHZhbHVlIG9mIHRoZSBwYXJhbWV0ZXIuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzdGVwIC0gU3RlcCBieSB3aGljaCB0aGUgcGFyYW1ldGVyIHZhbHVlIGlzIGluY3JlYXNlZCBvciBkZWNyZWFzZWQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZSAtIEluaXRpYWwgdmFsdWUgb2YgdGhlIHBhcmFtZXRlci5cbiAgICogQHBhcmFtIHtTdHJpbmdbXX0gW2NsaWVudFR5cGVzPW51bGxdIC0gQXJyYXkgb2YgdGhlIGNsaWVudCB0eXBlcyB0byBzZW5kXG4gICAqICB0aGUgcGFyYW1ldGVyIHZhbHVlIHRvLiBJZiBub3Qgc2V0LCB0aGUgdmFsdWUgaXMgc2VudCB0byBhbGwgdGhlIGNsaWVudCB0eXBlcy5cbiAgICovXG4gIGFkZE51bWJlcihuYW1lLCBsYWJlbCwgbWluLCBtYXgsIHN0ZXAsIHZhbHVlLCBjbGllbnRUeXBlcyA9IG51bGwpIHtcbiAgICByZXR1cm4gbmV3IF9OdW1iZXJJdGVtKHRoaXMsIG5hbWUsIGxhYmVsLCBtaW4sIG1heCwgc3RlcCwgdmFsdWUsIGNsaWVudFR5cGVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBgdGV4dGAgcGFyYW1ldGVyLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIE5hbWUgb2YgdGhlIHBhcmFtZXRlci5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGxhYmVsIC0gTGFiZWwgb2YgdGhlIHBhcmFtZXRlciAoZGlzcGxheWVkIG9uIHRoZSBHVUkgb24gdGhlIGNsaWVudCBzaWRlKS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIC0gSW5pdGlhbCB2YWx1ZSBvZiB0aGUgcGFyYW1ldGVyLlxuICAgKiBAcGFyYW0ge1N0cmluZ1tdfSBbY2xpZW50VHlwZXM9bnVsbF0gLSBBcnJheSBvZiB0aGUgY2xpZW50IHR5cGVzIHRvIHNlbmRcbiAgICogIHRoZSBwYXJhbWV0ZXIgdmFsdWUgdG8uIElmIG5vdCBzZXQsIHRoZSB2YWx1ZSBpcyBzZW50IHRvIGFsbCB0aGUgY2xpZW50IHR5cGVzLlxuICAgKi9cbiAgYWRkVGV4dChuYW1lLCBsYWJlbCwgdmFsdWUsIGNsaWVudFR5cGVzID0gbnVsbCkge1xuICAgIHJldHVybiBuZXcgX1RleHRJdGVtKHRoaXMsIG5hbWUsIGxhYmVsLCB2YWx1ZSwgY2xpZW50VHlwZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHRyaWdnZXIgKG5vdCByZWFsbHkgYSBwYXJhbWV0ZXIpLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIE5hbWUgb2YgdGhlIHRyaWdnZXIuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCAtIExhYmVsIG9mIHRoZSB0cmlnZ2VyIChkaXNwbGF5ZWQgb24gdGhlIEdVSSBvbiB0aGUgY2xpZW50IHNpZGUpLlxuICAgKiBAcGFyYW0ge1N0cmluZ1tdfSBbY2xpZW50VHlwZXM9bnVsbF0gLSBBcnJheSBvZiB0aGUgY2xpZW50IHR5cGVzIHRvIHNlbmRcbiAgICogIHRoZSB0cmlnZ2VyIHRvLiBJZiBub3Qgc2V0LCB0aGUgdmFsdWUgaXMgc2VudCB0byBhbGwgdGhlIGNsaWVudCB0eXBlcy5cbiAgICovXG4gIGFkZFRyaWdnZXIobmFtZSwgbGFiZWwsIGNsaWVudFR5cGVzID0gbnVsbCkge1xuICAgIHJldHVybiBuZXcgX1RyaWdnZXJJdGVtKHRoaXMsIG5hbWUsIGxhYmVsLCB1bmRlZmluZWQsIGNsaWVudFR5cGVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAY2FsbGJhY2sgbW9kdWxlOnNvdW5kd29ya3Mvc2VydmVyLlNoYXJlZFBhcmFtc35wYXJhbUNhbGxiYWNrXG4gICAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIC0gVXBkYXRlZCB2YWx1ZSBvZiB0aGUgcGFyYW1ldGVyLlxuICAgKi9cbiAgLyoqXG4gICAqIEFkZCBhIGxpc3RlbmVyIHRvIGxpc3RlbiB0byBhIHNwZWNpZmljIHBhcmFtZXRlciBjaGFuZ2VzLiBUaGUgbGlzdGVuZXJcbiAgICogaXMgY2FsbGVkIGEgZmlyc3QgdGltZSB3aGVuIGFkZGVkIHRvIHJldHJpZXZlIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBwYXJhbWV0ZXIuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gTmFtZSBvZiB0aGUgcGFyYW1ldGVyLlxuICAgKiBAcGFyYW0ge21vZHVsZTpzb3VuZHdvcmtzL3NlcnZlci5TaGFyZWRQYXJhbXN+cGFyYW1DYWxsYmFja30gbGlzdGVuZXIgLSBDYWxsYmFja1xuICAgKiAgdGhhdCBoYW5kbGUgdGhlIGV2ZW50LlxuICAgKi9cbiAgYWRkUGFyYW1MaXN0ZW5lcihuYW1lLCBsaXN0ZW5lcikge1xuICAgIGNvbnN0IHBhcmFtID0gdGhpcy5wYXJhbXNbbmFtZV07XG5cbiAgICBpZiAocGFyYW0pIHtcbiAgICAgIHBhcmFtLmFkZExpc3RlbmVyKHBhcmFtLmRhdGEubmFtZSwgbGlzdGVuZXIpO1xuXG4gICAgICBpZiAocGFyYW0uZGF0YS50eXBlICE9PSAndHJpZ2dlcicpXG4gICAgICAgIGxpc3RlbmVyKHBhcmFtLmRhdGEudmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygndW5rbm93biBzaGFyZWQgcGFyYW1ldGVyIFwiJyArIG5hbWUgKyAnXCInKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgbGlzdGVuZXIgZnJvbSBsaXN0ZW5pbmcgdG8gYSBzcGVjaWZpYyBwYXJhbWV0ZXIgY2hhbmdlcy5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSBldmVudC5cbiAgICogQHBhcmFtIHttb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuU2hhcmVkUGFyYW1zfnBhcmFtQ2FsbGJhY2t9IGxpc3RlbmVyIC0gVGhlXG4gICAqICBjYWxsYmFjayB0byByZW1vdmUuXG4gICAqL1xuICByZW1vdmVQYXJhbUxpc3RlbmVyKG5hbWUsIGxpc3RlbmVyKSB7XG4gICAgY29uc3QgcGFyYW0gPSB0aGlzLnBhcmFtc1tuYW1lXTtcblxuICAgIGlmIChwYXJhbSlcbiAgICAgIHBhcmFtLnJlbW92ZUxpc3RlbmVyKHBhcmFtLmRhdGEubmFtZSwgbGlzdGVuZXIpO1xuICAgIGVsc2VcbiAgICAgIGNvbnNvbGUubG9nKCd1bmtub3duIHNoYXJlZCBwYXJhbWV0ZXIgXCInICsgbmFtZSArICdcIicpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHZhbHVlIG9mIGEgcGFyYW1ldGVyIGFuZCBzZW5kcyBpdCB0byB0aGUgY2xpZW50cy5cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSBwYXJhbWV0ZXIgdG8gdXBkYXRlLlxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZSAtIE5ldyB2YWx1ZSBvZiB0aGUgcGFyYW1ldGVyLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gW2V4Y2x1ZGVDbGllbnQ9bnVsbF0gLSBFeGNsdWRlIHRoZSBnaXZlbiBjbGllbnQgZnJvbSB0aGVcbiAgICogIGNsaWVudHMgdG8gc2VuZCB0aGUgdXBkYXRlIHRvIChnZW5lcmFsbHkgdGhlIHNvdXJjZSBvZiB0aGUgdXBkYXRlKS5cbiAgICovXG4gIHVwZGF0ZShuYW1lLCB2YWx1ZSwgZXhjbHVkZUNsaWVudCA9IG51bGwpIHtcbiAgICBjb25zdCBwYXJhbSA9IHRoaXMucGFyYW1zW25hbWVdO1xuXG4gICAgaWYgKHBhcmFtKVxuICAgICAgcGFyYW0udXBkYXRlKHZhbHVlLCBleGNsdWRlQ2xpZW50KTtcbiAgICBlbHNlXG4gICAgICBjb25zb2xlLmxvZygndW5rbm93biBzaGFyZWQgcGFyYW1ldGVyICBcIicgKyBuYW1lICsgJ1wiJyk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgY29ubmVjdChjbGllbnQpIHtcbiAgICBzdXBlci5jb25uZWN0KGNsaWVudCk7XG5cbiAgICB0aGlzLnJlY2VpdmUoY2xpZW50LCAncmVxdWVzdCcsIHRoaXMuX29uUmVxdWVzdChjbGllbnQpKTtcbiAgICB0aGlzLnJlY2VpdmUoY2xpZW50LCAndXBkYXRlJywgdGhpcy5fb25VcGRhdGUoY2xpZW50KSk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX29uUmVxdWVzdChjbGllbnQpIHtcbiAgICByZXR1cm4gKCkgPT4gdGhpcy5zZW5kKGNsaWVudCwgJ2luaXQnLCB0aGlzLl9wYXJhbURhdGEpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9vblVwZGF0ZShjbGllbnQpIHtcbiAgICAvLyB1cGRhdGUsIGJ1dCBleGNsdWRlIGNsaWVudCBmcm9tIGJyb2FkY2FzdGluZyB0byBvdGhlciBjbGllbnRzXG4gICAgcmV0dXJuIChuYW1lLCB2YWx1ZSkgPT4gdGhpcy51cGRhdGUobmFtZSwgdmFsdWUsIGNsaWVudCk7XG4gIH1cbn1cblxuc2VydmljZU1hbmFnZXIucmVnaXN0ZXIoU0VSVklDRV9JRCwgU2hhcmVkUGFyYW1zKTtcblxuZXhwb3J0IGRlZmF1bHQgU2hhcmVkUGFyYW1zO1xuIl19