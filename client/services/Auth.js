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

var _SegmentedView2 = require('../views/SegmentedView');

var _SegmentedView3 = _interopRequireDefault(_SegmentedView2);

var _serviceManager = require('../core/serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SERVICE_ID = 'service:auth';
var LOCAL_STORAGE_KEY = 'soundworks:' + SERVICE_ID;

/**
 * Interface for the view of the `auth` service.
 *
 * @interface AbstractAuthView
 * @extends module:soundworks/client.View
 */
/**
 * Set the callback that should be executed when the send action is executed
 * on the view.
 *
 * @function
 * @name AbstractAuthView.onSend
 * @param {Function} callback - The callback given by the `auth` service.
 */
/**
 * Set the callback that should be executed when the reset action is executed
 * on the view.
 *
 * @function
 * @name AbstractAuthView.onReset
 * @param {Function} callback - The callback given by the `auth` service.
 */

var AuthView = function (_SegmentedView) {
  (0, _inherits3.default)(AuthView, _SegmentedView);

  function AuthView() {
    (0, _classCallCheck3.default)(this, AuthView);
    return (0, _possibleConstructorReturn3.default)(this, (AuthView.__proto__ || (0, _getPrototypeOf2.default)(AuthView)).apply(this, arguments));
  }

  (0, _createClass3.default)(AuthView, [{
    key: 'onSend',
    value: function onSend(callback) {
      var _this2 = this;

      this.installEvents({
        'click #send': function clickSend() {
          var password = _this2.$el.querySelector('#password').value;

          if (password !== '') callback(password);
        }
      });
    }
  }, {
    key: 'onReset',
    value: function onReset(callback) {
      this.installEvents({ 'click #reset': callback });
    }
  }]);
  return AuthView;
}(_SegmentedView3.default);

var defaultViewTemplate = '\n<% if (!rejected) { %>\n  <div class="section-top flex-middle">\n    <p><%= instructions %></p>\n  </div>\n  <div class="section-center flex-center">\n    <div>\n      <input type="password" id="password" />\n      <button class="btn" id="send"><%= send %></button>\n    </div>\n  </div>\n  <div class="section-bottom flex-middle">\n    <button id="reset" class="btn"><%= reset %></button>\n  </div>\n<% } else { %>\n  <div class="section-top"></div>\n  <div class="section-center flex-center">\n    <p><%= rejectMessage %></p>\n  </div>\n  <div class="section-bottom flex-middle">\n    <button id="reset" class="btn"><%= reset %></button>\n  </div>\n<% } %>';

var defaultViewContent = {
  instructions: 'Login',
  send: 'Send',
  reset: 'Reset',
  rejectMessage: 'Sorry, you don\'t have access to this client',
  rejected: false
};

/**
 * Interface for the client `auth` service.
 *
 * This service allows to lock the application to specific users by adding a
 * simple logging page to the client.
 *
 * <span class="warning">__WARNING__</span>: This service shouldn't be considered
 * secure from a production prespective.
 *
 * __*The service must be used with its [server-side counterpart]{@link module:soundworks/server.Auth}*__
 *
 * @memberof module:soundworks/client
 * @example
 * this.auth = this.require('auth');
 */

var Auth = function (_Service) {
  (0, _inherits3.default)(Auth, _Service);

  /** _<span class="warning">__WARNING__</span> This class should never be instanciated manually_ */
  function Auth() {
    (0, _classCallCheck3.default)(this, Auth);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (Auth.__proto__ || (0, _getPrototypeOf2.default)(Auth)).call(this, SERVICE_ID, true));

    var defaults = {
      viewPriority: 100,
      viewCtor: AuthView
    };

    _this3.configure(defaults);

    _this3._defaultViewTemplate = defaultViewTemplate;
    _this3._defaultViewContent = defaultViewContent;

    _this3._onAccesGrantedResponse = _this3._onAccesGrantedResponse.bind(_this3);
    _this3._onAccesRefusedResponse = _this3._onAccesRefusedResponse.bind(_this3);
    _this3._sendPassword = _this3._sendPassword.bind(_this3);
    _this3._resetPassword = _this3._resetPassword.bind(_this3);
    return _this3;
  }

  /** @private */


  (0, _createClass3.default)(Auth, [{
    key: 'init',
    value: function init() {
      this._password = null;

      this.viewCtor = this.options.viewCtor;
      this.view = this.createView();
      this.view.onSend(this._sendPassword);
      this.view.onReset(this._resetPassword);
    }

    /** @private */

  }, {
    key: 'start',
    value: function start() {
      (0, _get3.default)(Auth.prototype.__proto__ || (0, _getPrototypeOf2.default)(Auth.prototype), 'start', this).call(this);

      if (!this.hasStarted) this.init();

      this.receive('granted', this._onAccesGrantedResponse);
      this.receive('refused', this._onAccesRefusedResponse);

      var storedPassword = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (storedPassword !== null) this._sendPassword(storedPassword);

      this.show();
    }

    /** @private */

  }, {
    key: 'stop',
    value: function stop() {
      (0, _get3.default)(Auth.prototype.__proto__ || (0, _getPrototypeOf2.default)(Auth.prototype), 'stop', this).call(this);

      this.removeListener('granted', this._onAccesGrantedResponse);
      this.removeListener('refused', this._onAccesRefusedResponse);

      this.hide();
    }

    /**
     * Remove the stored password from local storage. This method is aimed at
     * being called from inside an experience / controller. Any UI update
     * resulting from the call of this method should then be handled from the
     * experience.
     */

  }, {
    key: 'logout',
    value: function logout() {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }

    /** @private */

  }, {
    key: '_sendPassword',
    value: function _sendPassword(password) {
      this._password = password;
      this.send('password', password);
    }

    /** @private */

  }, {
    key: '_resetPassword',
    value: function _resetPassword() {
      this._password = null;
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      this.view.content.rejected = false;
      this.view.render();
    }

    /** @private */

  }, {
    key: '_onAccesGrantedResponse',
    value: function _onAccesGrantedResponse() {
      localStorage.setItem(LOCAL_STORAGE_KEY, this._password);
      this.ready();
    }

    /** @private */

  }, {
    key: '_onAccesRefusedResponse',
    value: function _onAccesRefusedResponse() {
      this.view.content.rejected = true;
      this.view.render();
    }
  }]);
  return Auth;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, Auth);

exports.default = Auth;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1dGguanMiXSwibmFtZXMiOlsiU0VSVklDRV9JRCIsIkxPQ0FMX1NUT1JBR0VfS0VZIiwiQXV0aFZpZXciLCJjYWxsYmFjayIsImluc3RhbGxFdmVudHMiLCJwYXNzd29yZCIsIiRlbCIsInF1ZXJ5U2VsZWN0b3IiLCJ2YWx1ZSIsImRlZmF1bHRWaWV3VGVtcGxhdGUiLCJkZWZhdWx0Vmlld0NvbnRlbnQiLCJpbnN0cnVjdGlvbnMiLCJzZW5kIiwicmVzZXQiLCJyZWplY3RNZXNzYWdlIiwicmVqZWN0ZWQiLCJBdXRoIiwiZGVmYXVsdHMiLCJ2aWV3UHJpb3JpdHkiLCJ2aWV3Q3RvciIsImNvbmZpZ3VyZSIsIl9kZWZhdWx0Vmlld1RlbXBsYXRlIiwiX2RlZmF1bHRWaWV3Q29udGVudCIsIl9vbkFjY2VzR3JhbnRlZFJlc3BvbnNlIiwiYmluZCIsIl9vbkFjY2VzUmVmdXNlZFJlc3BvbnNlIiwiX3NlbmRQYXNzd29yZCIsIl9yZXNldFBhc3N3b3JkIiwiX3Bhc3N3b3JkIiwib3B0aW9ucyIsInZpZXciLCJjcmVhdGVWaWV3Iiwib25TZW5kIiwib25SZXNldCIsImhhc1N0YXJ0ZWQiLCJpbml0IiwicmVjZWl2ZSIsInN0b3JlZFBhc3N3b3JkIiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsInNob3ciLCJyZW1vdmVMaXN0ZW5lciIsImhpZGUiLCJyZW1vdmVJdGVtIiwiY29udGVudCIsInJlbmRlciIsInNldEl0ZW0iLCJyZWFkeSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBR0EsSUFBTUEsYUFBYSxjQUFuQjtBQUNBLElBQU1DLG9DQUFrQ0QsVUFBeEM7O0FBRUE7Ozs7OztBQU1BOzs7Ozs7OztBQVFBOzs7Ozs7Ozs7SUFRTUUsUTs7Ozs7Ozs7OzsyQkFDR0MsUSxFQUFVO0FBQUE7O0FBQ2YsV0FBS0MsYUFBTCxDQUFtQjtBQUNqQix1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Q0FBcUI3QyxpQkFBckIsRUFBd0MsS0FBSzJCLFNBQTdDO0FBQ0EsV0FBS21CLEtBQUw7QUFDRDs7QUFFRDs7Ozs4Q0FDMEI7QUFDeEIsV0FBS2pCLElBQUwsQ0FBVWMsT0FBVixDQUFrQjdCLFFBQWxCLEdBQTZCLElBQTdCO0FBQ0EsV0FBS2UsSUFBTCxDQUFVZSxNQUFWO0FBQ0Q7Ozs7O0FBR0gseUJBQWVHLFFBQWYsQ0FBd0JoRCxVQUF4QixFQUFvQ2dCLElBQXBDOztrQkFFZUEsSSIsImZpbGUiOiJBdXRoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNsaWVudCBmcm9tICcuLi9jb3JlL2NsaWVudCc7XG5pbXBvcnQgU2VydmljZSBmcm9tICcuLi9jb3JlL1NlcnZpY2UnO1xuaW1wb3J0IFNlZ21lbnRlZFZpZXcgZnJvbSAnLi4vdmlld3MvU2VnbWVudGVkVmlldyc7XG5pbXBvcnQgc2VydmljZU1hbmFnZXIgZnJvbSAnLi4vY29yZS9zZXJ2aWNlTWFuYWdlcic7XG5cblxuY29uc3QgU0VSVklDRV9JRCA9ICdzZXJ2aWNlOmF1dGgnO1xuY29uc3QgTE9DQUxfU1RPUkFHRV9LRVkgPSBgc291bmR3b3Jrczoke1NFUlZJQ0VfSUR9YDtcblxuLyoqXG4gKiBJbnRlcmZhY2UgZm9yIHRoZSB2aWV3IG9mIHRoZSBgYXV0aGAgc2VydmljZS5cbiAqXG4gKiBAaW50ZXJmYWNlIEFic3RyYWN0QXV0aFZpZXdcbiAqIEBleHRlbmRzIG1vZHVsZTpzb3VuZHdvcmtzL2NsaWVudC5WaWV3XG4gKi9cbi8qKlxuICogU2V0IHRoZSBjYWxsYmFjayB0aGF0IHNob3VsZCBiZSBleGVjdXRlZCB3aGVuIHRoZSBzZW5kIGFjdGlvbiBpcyBleGVjdXRlZFxuICogb24gdGhlIHZpZXcuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBBYnN0cmFjdEF1dGhWaWV3Lm9uU2VuZFxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBUaGUgY2FsbGJhY2sgZ2l2ZW4gYnkgdGhlIGBhdXRoYCBzZXJ2aWNlLlxuICovXG4vKipcbiAqIFNldCB0aGUgY2FsbGJhY2sgdGhhdCBzaG91bGQgYmUgZXhlY3V0ZWQgd2hlbiB0aGUgcmVzZXQgYWN0aW9uIGlzIGV4ZWN1dGVkXG4gKiBvbiB0aGUgdmlldy5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIEFic3RyYWN0QXV0aFZpZXcub25SZXNldFxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBUaGUgY2FsbGJhY2sgZ2l2ZW4gYnkgdGhlIGBhdXRoYCBzZXJ2aWNlLlxuICovXG5jbGFzcyBBdXRoVmlldyBleHRlbmRzIFNlZ21lbnRlZFZpZXcge1xuICBvblNlbmQoY2FsbGJhY2spIHtcbiAgICB0aGlzLmluc3RhbGxFdmVudHMoe1xuICAgICAgJ2NsaWNrICNzZW5kJzogKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXNzd29yZCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNwYXNzd29yZCcpLnZhbHVlO1xuXG4gICAgICAgIGlmIChwYXNzd29yZCAhPT0gJycpXG4gICAgICAgICAgY2FsbGJhY2socGFzc3dvcmQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgb25SZXNldChjYWxsYmFjaykge1xuICAgIHRoaXMuaW5zdGFsbEV2ZW50cyh7ICdjbGljayAjcmVzZXQnOiBjYWxsYmFjayB9KTtcbiAgfVxufVxuXG5jb25zdCBkZWZhdWx0Vmlld1RlbXBsYXRlID0gYFxuPCUgaWYgKCFyZWplY3RlZCkgeyAlPlxuICA8ZGl2IGNsYXNzPVwic2VjdGlvbi10b3AgZmxleC1taWRkbGVcIj5cbiAgICA8cD48JT0gaW5zdHJ1Y3Rpb25zICU+PC9wPlxuICA8L2Rpdj5cbiAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtY2VudGVyXCI+XG4gICAgPGRpdj5cbiAgICAgIDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBpZD1cInBhc3N3b3JkXCIgLz5cbiAgICAgIDxidXR0b24gY2xhc3M9XCJidG5cIiBpZD1cInNlbmRcIj48JT0gc2VuZCAlPjwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbiAgPGRpdiBjbGFzcz1cInNlY3Rpb24tYm90dG9tIGZsZXgtbWlkZGxlXCI+XG4gICAgPGJ1dHRvbiBpZD1cInJlc2V0XCIgY2xhc3M9XCJidG5cIj48JT0gcmVzZXQgJT48L2J1dHRvbj5cbiAgPC9kaXY+XG48JSB9IGVsc2UgeyAlPlxuICA8ZGl2IGNsYXNzPVwic2VjdGlvbi10b3BcIj48L2Rpdj5cbiAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtY2VudGVyXCI+XG4gICAgPHA+PCU9IHJlamVjdE1lc3NhZ2UgJT48L3A+XG4gIDwvZGl2PlxuICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1ib3R0b20gZmxleC1taWRkbGVcIj5cbiAgICA8YnV0dG9uIGlkPVwicmVzZXRcIiBjbGFzcz1cImJ0blwiPjwlPSByZXNldCAlPjwvYnV0dG9uPlxuICA8L2Rpdj5cbjwlIH0gJT5gO1xuXG5jb25zdCBkZWZhdWx0Vmlld0NvbnRlbnQgPSB7XG4gIGluc3RydWN0aW9uczogJ0xvZ2luJyxcbiAgc2VuZDogJ1NlbmQnLFxuICByZXNldDogJ1Jlc2V0JyxcbiAgcmVqZWN0TWVzc2FnZTogYFNvcnJ5LCB5b3UgZG9uJ3QgaGF2ZSBhY2Nlc3MgdG8gdGhpcyBjbGllbnRgLFxuICByZWplY3RlZDogZmFsc2UsXG59O1xuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIGNsaWVudCBgYXV0aGAgc2VydmljZS5cbiAqXG4gKiBUaGlzIHNlcnZpY2UgYWxsb3dzIHRvIGxvY2sgdGhlIGFwcGxpY2F0aW9uIHRvIHNwZWNpZmljIHVzZXJzIGJ5IGFkZGluZyBhXG4gKiBzaW1wbGUgbG9nZ2luZyBwYWdlIHRvIHRoZSBjbGllbnQuXG4gKlxuICogPHNwYW4gY2xhc3M9XCJ3YXJuaW5nXCI+X19XQVJOSU5HX188L3NwYW4+OiBUaGlzIHNlcnZpY2Ugc2hvdWxkbid0IGJlIGNvbnNpZGVyZWRcbiAqIHNlY3VyZSBmcm9tIGEgcHJvZHVjdGlvbiBwcmVzcGVjdGl2ZS5cbiAqXG4gKiBfXypUaGUgc2VydmljZSBtdXN0IGJlIHVzZWQgd2l0aCBpdHMgW3NlcnZlci1zaWRlIGNvdW50ZXJwYXJ0XXtAbGluayBtb2R1bGU6c291bmR3b3Jrcy9zZXJ2ZXIuQXV0aH0qX19cbiAqXG4gKiBAbWVtYmVyb2YgbW9kdWxlOnNvdW5kd29ya3MvY2xpZW50XG4gKiBAZXhhbXBsZVxuICogdGhpcy5hdXRoID0gdGhpcy5yZXF1aXJlKCdhdXRoJyk7XG4gKi9cbmNsYXNzIEF1dGggZXh0ZW5kcyBTZXJ2aWNlIHtcbiAgLyoqIF88c3BhbiBjbGFzcz1cIndhcm5pbmdcIj5fX1dBUk5JTkdfXzwvc3Bhbj4gVGhpcyBjbGFzcyBzaG91bGQgbmV2ZXIgYmUgaW5zdGFuY2lhdGVkIG1hbnVhbGx5XyAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihTRVJWSUNFX0lELCB0cnVlKTtcblxuICAgIGNvbnN0IGRlZmF1bHRzID0ge1xuICAgICAgdmlld1ByaW9yaXR5OiAxMDAsXG4gICAgICB2aWV3Q3RvcjogQXV0aFZpZXcsXG4gICAgfTtcblxuICAgIHRoaXMuY29uZmlndXJlKGRlZmF1bHRzKTtcblxuICAgIHRoaXMuX2RlZmF1bHRWaWV3VGVtcGxhdGUgPSBkZWZhdWx0Vmlld1RlbXBsYXRlO1xuICAgIHRoaXMuX2RlZmF1bHRWaWV3Q29udGVudCA9IGRlZmF1bHRWaWV3Q29udGVudDtcblxuICAgIHRoaXMuX29uQWNjZXNHcmFudGVkUmVzcG9uc2UgPSB0aGlzLl9vbkFjY2VzR3JhbnRlZFJlc3BvbnNlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25BY2Nlc1JlZnVzZWRSZXNwb25zZSA9IHRoaXMuX29uQWNjZXNSZWZ1c2VkUmVzcG9uc2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9zZW5kUGFzc3dvcmQgPSB0aGlzLl9zZW5kUGFzc3dvcmQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yZXNldFBhc3N3b3JkID0gdGhpcy5fcmVzZXRQYXNzd29yZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGluaXQoKSB7XG4gICAgdGhpcy5fcGFzc3dvcmQgPSBudWxsO1xuXG4gICAgdGhpcy52aWV3Q3RvciA9IHRoaXMub3B0aW9ucy52aWV3Q3RvcjtcbiAgICB0aGlzLnZpZXcgPSB0aGlzLmNyZWF0ZVZpZXcoKTtcbiAgICB0aGlzLnZpZXcub25TZW5kKHRoaXMuX3NlbmRQYXNzd29yZCk7XG4gICAgdGhpcy52aWV3Lm9uUmVzZXQodGhpcy5fcmVzZXRQYXNzd29yZCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTtcblxuICAgIGlmICghdGhpcy5oYXNTdGFydGVkKVxuICAgICAgdGhpcy5pbml0KCk7XG5cbiAgICB0aGlzLnJlY2VpdmUoJ2dyYW50ZWQnLCB0aGlzLl9vbkFjY2VzR3JhbnRlZFJlc3BvbnNlKTtcbiAgICB0aGlzLnJlY2VpdmUoJ3JlZnVzZWQnLCB0aGlzLl9vbkFjY2VzUmVmdXNlZFJlc3BvbnNlKTtcblxuICAgIGNvbnN0IHN0b3JlZFBhc3N3b3JkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkpO1xuXG4gICAgaWYgKHN0b3JlZFBhc3N3b3JkICE9PSBudWxsKVxuICAgICAgdGhpcy5fc2VuZFBhc3N3b3JkKHN0b3JlZFBhc3N3b3JkKTtcblxuICAgIHRoaXMuc2hvdygpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHN0b3AoKSB7XG4gICAgc3VwZXIuc3RvcCgpO1xuXG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcignZ3JhbnRlZCcsIHRoaXMuX29uQWNjZXNHcmFudGVkUmVzcG9uc2UpO1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIoJ3JlZnVzZWQnLCB0aGlzLl9vbkFjY2VzUmVmdXNlZFJlc3BvbnNlKTtcblxuICAgIHRoaXMuaGlkZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0aGUgc3RvcmVkIHBhc3N3b3JkIGZyb20gbG9jYWwgc3RvcmFnZS4gVGhpcyBtZXRob2QgaXMgYWltZWQgYXRcbiAgICogYmVpbmcgY2FsbGVkIGZyb20gaW5zaWRlIGFuIGV4cGVyaWVuY2UgLyBjb250cm9sbGVyLiBBbnkgVUkgdXBkYXRlXG4gICAqIHJlc3VsdGluZyBmcm9tIHRoZSBjYWxsIG9mIHRoaXMgbWV0aG9kIHNob3VsZCB0aGVuIGJlIGhhbmRsZWQgZnJvbSB0aGVcbiAgICogZXhwZXJpZW5jZS5cbiAgICovXG4gIGxvZ291dCgpIHtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShMT0NBTF9TVE9SQUdFX0tFWSk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX3NlbmRQYXNzd29yZChwYXNzd29yZCkge1xuICAgIHRoaXMuX3Bhc3N3b3JkID0gcGFzc3dvcmQ7XG4gICAgdGhpcy5zZW5kKCdwYXNzd29yZCcsIHBhc3N3b3JkKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfcmVzZXRQYXNzd29yZCgpIHtcbiAgICB0aGlzLl9wYXNzd29yZCA9IG51bGw7XG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkpO1xuXG4gICAgdGhpcy52aWV3LmNvbnRlbnQucmVqZWN0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLnZpZXcucmVuZGVyKCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX29uQWNjZXNHcmFudGVkUmVzcG9uc2UoKSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oTE9DQUxfU1RPUkFHRV9LRVksIHRoaXMuX3Bhc3N3b3JkKTtcbiAgICB0aGlzLnJlYWR5KCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX29uQWNjZXNSZWZ1c2VkUmVzcG9uc2UoKSB7XG4gICAgdGhpcy52aWV3LmNvbnRlbnQucmVqZWN0ZWQgPSB0cnVlO1xuICAgIHRoaXMudmlldy5yZW5kZXIoKTtcbiAgfVxufVxuXG5zZXJ2aWNlTWFuYWdlci5yZWdpc3RlcihTRVJWSUNFX0lELCBBdXRoKTtcblxuZXhwb3J0IGRlZmF1bHQgQXV0aDtcbiJdfQ==