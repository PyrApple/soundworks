'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ctors = {};
var _instances = {};

/**
 * Manager the services and their relations. Acts as a factory to ensure services
 * are instanciated only once.
 */
var serviceManager = {
  /**
   * Retrieve a service according to the given id. If the service as not beeen
   * requested yet, it is instanciated.
   * @param {String} id - The id of the registered service
   * @param {Activity} consumer - The activity instance requering the service.
   * @param {Object} options - The options to configure the service.
   */
  require: function require(id) {
    var consumer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    id = 'service:' + id;

    if (!_ctors[id]) throw new Error('Service "' + id + '" is not defined');

    var instance = _instances[id];

    if (!instance) {
      instance = new _ctors[id]();
      _instances[id] = instance;
    }

    if (consumer !== null) {
      consumer.addRequiredActivity(instance);
      instance.addClientType(consumer.clientTypes);
    }

    instance.configure(options);
    return instance;
  },


  /**
   * Regiter a service
   * @param {String} id - The id of the service, in order to retrieve it later.
   * @param {Function} ctor - The constructor of the service.
   */
  register: function register(id, ctor) {
    _ctors[id] = ctor;
  },
  getRequiredServices: function getRequiredServices(clientType) {
    var services = [];

    for (var id in _instances) {
      if (_instances[id].clientTypes.has(clientType)) services.push(id);
    }

    return services;
  },
  getServiceList: function getServiceList() {
    return (0, _keys2.default)(_ctors);
  }
};

exports.default = serviceManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcnZpY2VNYW5hZ2VyLmpzIl0sIm5hbWVzIjpbIl9jdG9ycyIsIl9pbnN0YW5jZXMiLCJzZXJ2aWNlTWFuYWdlciIsInJlcXVpcmUiLCJpZCIsImNvbnN1bWVyIiwib3B0aW9ucyIsIkVycm9yIiwiaW5zdGFuY2UiLCJhZGRSZXF1aXJlZEFjdGl2aXR5IiwiYWRkQ2xpZW50VHlwZSIsImNsaWVudFR5cGVzIiwiY29uZmlndXJlIiwicmVnaXN0ZXIiLCJjdG9yIiwiZ2V0UmVxdWlyZWRTZXJ2aWNlcyIsImNsaWVudFR5cGUiLCJzZXJ2aWNlcyIsImhhcyIsInB1c2giLCJnZXRTZXJ2aWNlTGlzdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBUyxFQUFmO0FBQ0EsSUFBTUMsYUFBYSxFQUFuQjs7QUFHQTs7OztBQUlBLElBQU1DLGlCQUFpQjtBQUNyQjs7Ozs7OztBQU9BQyxTQVJxQixtQkFRYkMsRUFSYSxFQVFzQjtBQUFBLFFBQS9CQyxRQUErQix1RUFBcEIsSUFBb0I7QUFBQSxRQUFkQyxPQUFjLHVFQUFKLEVBQUk7O0FBQ3pDRixTQUFLLGFBQWFBLEVBQWxCOztBQUVBLFFBQUksQ0FBQ0osT0FBT0ksRUFBUCxDQUFMLEVBQ0UsTUFBTSxJQUFJRyxLQUFKLGVBQXNCSCxFQUF0QixzQkFBTjs7QUFFRixRQUFJSSxXQUFXUCxXQUFXRyxFQUFYLENBQWY7O0FBRUEsUUFBSSxDQUFDSSxRQUFMLEVBQWU7QUFDYkEsaUJBQVcsSUFBSVIsT0FBT0ksRUFBUCxDQUFKLEVBQVg7QUFDQUgsaUJBQVdHLEVBQVgsSUFBaUJJLFFBQWpCO0FBQ0Q7O0FBRUQsUUFBSUgsYUFBYSxJQUFqQixFQUF1QjtBQUNyQkEsZUFBU0ksbUJBQVQsQ0FBNkJELFFBQTdCO0FBQ0FBLGVBQVNFLGFBQVQsQ0FBdUJMLFNBQVNNLFdBQWhDO0FBQ0Q7O0FBRURILGFBQVNJLFNBQVQsQ0FBbUJOLE9BQW5CO0FBQ0EsV0FBT0UsUUFBUDtBQUNELEdBNUJvQjs7O0FBOEJyQjs7Ozs7QUFLQUssVUFuQ3FCLG9CQW1DWlQsRUFuQ1ksRUFtQ1JVLElBbkNRLEVBbUNGO0FBQ2pCZCxXQUFPSSxFQUFQLElBQWFVLElBQWI7QUFDRCxHQXJDb0I7QUF1Q3JCQyxxQkF2Q3FCLCtCQXVDREMsVUF2Q0MsRUF1Q1c7QUFDOUIsUUFBTUMsV0FBVyxFQUFqQjs7QUFFQSxTQUFLLElBQUliLEVBQVQsSUFBZUgsVUFBZixFQUEyQjtBQUN6QixVQUFJQSxXQUFXRyxFQUFYLEVBQWVPLFdBQWYsQ0FBMkJPLEdBQTNCLENBQStCRixVQUEvQixDQUFKLEVBQ0VDLFNBQVNFLElBQVQsQ0FBY2YsRUFBZDtBQUNIOztBQUVELFdBQU9hLFFBQVA7QUFDRCxHQWhEb0I7QUFrRHJCRyxnQkFsRHFCLDRCQWtESjtBQUNmLFdBQU8sb0JBQVlwQixNQUFaLENBQVA7QUFDRDtBQXBEb0IsQ0FBdkI7O2tCQXVEZUUsYyIsImZpbGUiOiJzZXJ2aWNlTWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IF9jdG9ycyA9IHt9O1xuY29uc3QgX2luc3RhbmNlcyA9IHt9O1xuXG5cbi8qKlxuICogTWFuYWdlciB0aGUgc2VydmljZXMgYW5kIHRoZWlyIHJlbGF0aW9ucy4gQWN0cyBhcyBhIGZhY3RvcnkgdG8gZW5zdXJlIHNlcnZpY2VzXG4gKiBhcmUgaW5zdGFuY2lhdGVkIG9ubHkgb25jZS5cbiAqL1xuY29uc3Qgc2VydmljZU1hbmFnZXIgPSB7XG4gIC8qKlxuICAgKiBSZXRyaWV2ZSBhIHNlcnZpY2UgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBpZC4gSWYgdGhlIHNlcnZpY2UgYXMgbm90IGJlZWVuXG4gICAqIHJlcXVlc3RlZCB5ZXQsIGl0IGlzIGluc3RhbmNpYXRlZC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSByZWdpc3RlcmVkIHNlcnZpY2VcbiAgICogQHBhcmFtIHtBY3Rpdml0eX0gY29uc3VtZXIgLSBUaGUgYWN0aXZpdHkgaW5zdGFuY2UgcmVxdWVyaW5nIHRoZSBzZXJ2aWNlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIFRoZSBvcHRpb25zIHRvIGNvbmZpZ3VyZSB0aGUgc2VydmljZS5cbiAgICovXG4gIHJlcXVpcmUoaWQsIGNvbnN1bWVyID0gbnVsbCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgaWQgPSAnc2VydmljZTonICsgaWQ7XG5cbiAgICBpZiAoIV9jdG9yc1tpZF0pXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFNlcnZpY2UgXCIke2lkfVwiIGlzIG5vdCBkZWZpbmVkYCk7XG5cbiAgICBsZXQgaW5zdGFuY2UgPSBfaW5zdGFuY2VzW2lkXTtcblxuICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgIGluc3RhbmNlID0gbmV3IF9jdG9yc1tpZF07XG4gICAgICBfaW5zdGFuY2VzW2lkXSA9IGluc3RhbmNlO1xuICAgIH1cblxuICAgIGlmIChjb25zdW1lciAhPT0gbnVsbCkge1xuICAgICAgY29uc3VtZXIuYWRkUmVxdWlyZWRBY3Rpdml0eShpbnN0YW5jZSk7XG4gICAgICBpbnN0YW5jZS5hZGRDbGllbnRUeXBlKGNvbnN1bWVyLmNsaWVudFR5cGVzKTtcbiAgICB9XG5cbiAgICBpbnN0YW5jZS5jb25maWd1cmUob3B0aW9ucyk7XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZWdpdGVyIGEgc2VydmljZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHNlcnZpY2UsIGluIG9yZGVyIHRvIHJldHJpZXZlIGl0IGxhdGVyLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjdG9yIC0gVGhlIGNvbnN0cnVjdG9yIG9mIHRoZSBzZXJ2aWNlLlxuICAgKi9cbiAgcmVnaXN0ZXIoaWQsIGN0b3IpIHtcbiAgICBfY3RvcnNbaWRdID0gY3RvcjtcbiAgfSxcblxuICBnZXRSZXF1aXJlZFNlcnZpY2VzKGNsaWVudFR5cGUpIHtcbiAgICBjb25zdCBzZXJ2aWNlcyA9IFtdO1xuXG4gICAgZm9yIChsZXQgaWQgaW4gX2luc3RhbmNlcykge1xuICAgICAgaWYgKF9pbnN0YW5jZXNbaWRdLmNsaWVudFR5cGVzLmhhcyhjbGllbnRUeXBlKSlcbiAgICAgICAgc2VydmljZXMucHVzaChpZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlcnZpY2VzO1xuICB9LFxuXG4gIGdldFNlcnZpY2VMaXN0KCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhfY3RvcnMpO1xuICB9LFxufTtcblxuZXhwb3J0IGRlZmF1bHQgc2VydmljZU1hbmFnZXI7XG4iXX0=