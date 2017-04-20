'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Server side representation of a client.
 */
var Client = function () {
  /**
   * @param {String} clientType - Client type of the connected client.
   * @param {Socket} socket - Socket object used to comminuate with the client.
   * @private
   */
  function Client(clientType, socket) {
    (0, _classCallCheck3.default)(this, Client);

    /**
     * Client type (specified when initializing the {@link client} object on the client side with {@link client.init}).
     * @type {String}
     */
    this.type = clientType;

    /**
     * Index of the client.
     * @type {Number}
     */
    this.uuid = _uuid2.default.v4();

    /**
     * Coordinates of the client, stored as an `[x:Number, y:Number]` array.
     * @type {Array<Number>}
     */
    this.coordinates = null;

    /**
     * Geoposition of the client as returned by `geolocation.getCurrentPosition`
     * @typ {Object}
     */
    this.geoposition = null;

    /**
     * Ticket index of the client.
     * @type {Number}
     */
    this.index = null;

    /**
     * Ticket label of the client.
     * @type {Number}
     */
    this.label = null;

    /**
     * Used by the activities to associate data to a particular client.
     *
     * All the data associated with a activity whose `name` is `'activityName'`
       * is accessible through the key `activityName`.
     * For instance, the {@link src/server/Checkin.js~Checkin} activity keeps
       * track of client's checkin index and label in `this.activities.checkin.index`
       * and `this.activities.checkin.label`.
     * Similarly, a {@link src/server/Performance.js~Performance} activity whose
       * name is `'myPerformance'` could report the client's status in
       * `this.activities.myPerformance.status`.
     * @type {Object}
     */
    this.activities = {};

    /**
     * Socket used to communicate with the client.
     * @type {Socket}
     * @private
     */
    this.socket = socket;
  }

  /**
   * Returns a lightweight version of the data defining the client.
   * @returns {Object}
   */


  (0, _createClass3.default)(Client, [{
    key: 'serialize',
    value: function serialize() {
      return {
        type: this.type,
        uuid: this.uuid,
        coordinates: this.coordinates,
        index: this.index,
        label: this.label,
        activities: this.activities
      };
    }

    /**
     * Destroy the client.
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      this.socket.removeAllListeners();
      this.uuid = null;
    }
  }]);
  return Client;
}();

exports.default = Client;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsaWVudC5qcyJdLCJuYW1lcyI6WyJDbGllbnQiLCJjbGllbnRUeXBlIiwic29ja2V0IiwidHlwZSIsInV1aWQiLCJ2NCIsImNvb3JkaW5hdGVzIiwiZ2VvcG9zaXRpb24iLCJpbmRleCIsImxhYmVsIiwiYWN0aXZpdGllcyIsInJlbW92ZUFsbExpc3RlbmVycyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7O0FBRUE7OztJQUdxQkEsTTtBQUNwQjs7Ozs7QUFLQSxrQkFBWUMsVUFBWixFQUF3QkMsTUFBeEIsRUFBZ0M7QUFBQTs7QUFDL0I7Ozs7QUFJRSxTQUFLQyxJQUFMLEdBQVlGLFVBQVo7O0FBRUY7Ozs7QUFJRSxTQUFLRyxJQUFMLEdBQVksZUFBS0MsRUFBTCxFQUFaOztBQUVGOzs7O0FBSUUsU0FBS0MsV0FBTCxHQUFtQixJQUFuQjs7QUFFQTs7OztBQUlBLFNBQUtDLFdBQUwsR0FBbUIsSUFBbkI7O0FBRUE7Ozs7QUFJQSxTQUFLQyxLQUFMLEdBQWEsSUFBYjs7QUFFQTs7OztBQUlBLFNBQUtDLEtBQUwsR0FBYSxJQUFiOztBQUVGOzs7Ozs7Ozs7Ozs7O0FBYUUsU0FBS0MsVUFBTCxHQUFrQixFQUFsQjs7QUFFRjs7Ozs7QUFLRSxTQUFLUixNQUFMLEdBQWNBLE1BQWQ7QUFDRDs7QUFFRDs7Ozs7Ozs7Z0NBSVk7QUFDVixhQUFPO0FBQ0xDLGNBQU0sS0FBS0EsSUFETjtBQUVMQyxjQUFNLEtBQUtBLElBRk47QUFHTEUscUJBQWEsS0FBS0EsV0FIYjtBQUlMRSxlQUFPLEtBQUtBLEtBSlA7QUFLTEMsZUFBTyxLQUFLQSxLQUxQO0FBTUxDLG9CQUFZLEtBQUtBO0FBTlosT0FBUDtBQVFEOztBQUVEOzs7Ozs7OEJBR1U7QUFDUixXQUFLUixNQUFMLENBQVlTLGtCQUFaO0FBQ0EsV0FBS1AsSUFBTCxHQUFZLElBQVo7QUFDRDs7Ozs7a0JBdkZrQkosTSIsImZpbGUiOiJDbGllbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdXVpZCBmcm9tICd1dWlkJztcblxuLyoqXG4gKiBTZXJ2ZXIgc2lkZSByZXByZXNlbnRhdGlvbiBvZiBhIGNsaWVudC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2xpZW50IHtcblx0LyoqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBjbGllbnRUeXBlIC0gQ2xpZW50IHR5cGUgb2YgdGhlIGNvbm5lY3RlZCBjbGllbnQuXG5cdCAqIEBwYXJhbSB7U29ja2V0fSBzb2NrZXQgLSBTb2NrZXQgb2JqZWN0IHVzZWQgdG8gY29tbWludWF0ZSB3aXRoIHRoZSBjbGllbnQuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihjbGllbnRUeXBlLCBzb2NrZXQpIHtcblx0XHQvKipcblx0XHQgKiBDbGllbnQgdHlwZSAoc3BlY2lmaWVkIHdoZW4gaW5pdGlhbGl6aW5nIHRoZSB7QGxpbmsgY2xpZW50fSBvYmplY3Qgb24gdGhlIGNsaWVudCBzaWRlIHdpdGgge0BsaW5rIGNsaWVudC5pbml0fSkuXG5cdFx0ICogQHR5cGUge1N0cmluZ31cblx0XHQgKi9cbiAgICB0aGlzLnR5cGUgPSBjbGllbnRUeXBlO1xuXG5cdFx0LyoqXG5cdFx0ICogSW5kZXggb2YgdGhlIGNsaWVudC5cblx0XHQgKiBAdHlwZSB7TnVtYmVyfVxuXHRcdCAqL1xuICAgIHRoaXMudXVpZCA9IHV1aWQudjQoKTtcblxuXHRcdC8qKlxuXHRcdCAqIENvb3JkaW5hdGVzIG9mIHRoZSBjbGllbnQsIHN0b3JlZCBhcyBhbiBgW3g6TnVtYmVyLCB5Ok51bWJlcl1gIGFycmF5LlxuXHRcdCAqIEB0eXBlIHtBcnJheTxOdW1iZXI+fVxuXHRcdCAqL1xuICAgIHRoaXMuY29vcmRpbmF0ZXMgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogR2VvcG9zaXRpb24gb2YgdGhlIGNsaWVudCBhcyByZXR1cm5lZCBieSBgZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uYFxuICAgICAqIEB0eXAge09iamVjdH1cbiAgICAgKi9cbiAgICB0aGlzLmdlb3Bvc2l0aW9uID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFRpY2tldCBpbmRleCBvZiB0aGUgY2xpZW50LlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5pbmRleCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBUaWNrZXQgbGFiZWwgb2YgdGhlIGNsaWVudC5cbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMubGFiZWwgPSBudWxsO1xuXG5cdFx0LyoqXG5cdFx0ICogVXNlZCBieSB0aGUgYWN0aXZpdGllcyB0byBhc3NvY2lhdGUgZGF0YSB0byBhIHBhcnRpY3VsYXIgY2xpZW50LlxuXHRcdCAqXG5cdFx0ICogQWxsIHRoZSBkYXRhIGFzc29jaWF0ZWQgd2l0aCBhIGFjdGl2aXR5IHdob3NlIGBuYW1lYCBpcyBgJ2FjdGl2aXR5TmFtZSdgXG4gICAgICogaXMgYWNjZXNzaWJsZSB0aHJvdWdoIHRoZSBrZXkgYGFjdGl2aXR5TmFtZWAuXG5cdFx0ICogRm9yIGluc3RhbmNlLCB0aGUge0BsaW5rIHNyYy9zZXJ2ZXIvQ2hlY2tpbi5qc35DaGVja2lufSBhY3Rpdml0eSBrZWVwc1xuICAgICAqIHRyYWNrIG9mIGNsaWVudCdzIGNoZWNraW4gaW5kZXggYW5kIGxhYmVsIGluIGB0aGlzLmFjdGl2aXRpZXMuY2hlY2tpbi5pbmRleGBcbiAgICAgKiBhbmQgYHRoaXMuYWN0aXZpdGllcy5jaGVja2luLmxhYmVsYC5cblx0XHQgKiBTaW1pbGFybHksIGEge0BsaW5rIHNyYy9zZXJ2ZXIvUGVyZm9ybWFuY2UuanN+UGVyZm9ybWFuY2V9IGFjdGl2aXR5IHdob3NlXG4gICAgICogbmFtZSBpcyBgJ215UGVyZm9ybWFuY2UnYCBjb3VsZCByZXBvcnQgdGhlIGNsaWVudCdzIHN0YXR1cyBpblxuICAgICAqIGB0aGlzLmFjdGl2aXRpZXMubXlQZXJmb3JtYW5jZS5zdGF0dXNgLlxuXHRcdCAqIEB0eXBlIHtPYmplY3R9XG5cdFx0ICovXG4gICAgdGhpcy5hY3Rpdml0aWVzID0ge307XG5cblx0XHQvKipcblx0XHQgKiBTb2NrZXQgdXNlZCB0byBjb21tdW5pY2F0ZSB3aXRoIHRoZSBjbGllbnQuXG5cdFx0ICogQHR5cGUge1NvY2tldH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuICAgIHRoaXMuc29ja2V0ID0gc29ja2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBsaWdodHdlaWdodCB2ZXJzaW9uIG9mIHRoZSBkYXRhIGRlZmluaW5nIHRoZSBjbGllbnQuXG4gICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAqL1xuICBzZXJpYWxpemUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgIHV1aWQ6IHRoaXMudXVpZCxcbiAgICAgIGNvb3JkaW5hdGVzOiB0aGlzLmNvb3JkaW5hdGVzLFxuICAgICAgaW5kZXg6IHRoaXMuaW5kZXgsXG4gICAgICBsYWJlbDogdGhpcy5sYWJlbCxcbiAgICAgIGFjdGl2aXRpZXM6IHRoaXMuYWN0aXZpdGllcyxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3kgdGhlIGNsaWVudC5cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5zb2NrZXQucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgdGhpcy51dWlkID0gbnVsbDtcbiAgfVxufVxuIl19