'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
    var consumer = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    id = 'service:' + id;

    if (!_ctors[id]) throw new Error('Service "' + id + '" does not exists');

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
  }
};

exports.default = serviceManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcnZpY2VNYW5hZ2VyLmpzIl0sIm5hbWVzIjpbIl9jdG9ycyIsIl9pbnN0YW5jZXMiLCJzZXJ2aWNlTWFuYWdlciIsInJlcXVpcmUiLCJpZCIsImNvbnN1bWVyIiwib3B0aW9ucyIsIkVycm9yIiwiaW5zdGFuY2UiLCJhZGRSZXF1aXJlZEFjdGl2aXR5IiwiYWRkQ2xpZW50VHlwZSIsImNsaWVudFR5cGVzIiwiY29uZmlndXJlIiwicmVnaXN0ZXIiLCJjdG9yIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBLElBQU1BLFNBQVMsRUFBZjtBQUNBLElBQU1DLGFBQWEsRUFBbkI7O0FBR0E7Ozs7QUFJQSxJQUFNQyxpQkFBaUI7QUFDckI7Ozs7Ozs7QUFPQUMsU0FScUIsbUJBUWJDLEVBUmEsRUFRc0I7QUFBQSxRQUEvQkMsUUFBK0IseURBQXBCLElBQW9CO0FBQUEsUUFBZEMsT0FBYyx5REFBSixFQUFJOztBQUN6Q0YsU0FBSyxhQUFhQSxFQUFsQjs7QUFFQSxRQUFJLENBQUNKLE9BQU9JLEVBQVAsQ0FBTCxFQUNFLE1BQU0sSUFBSUcsS0FBSixlQUFzQkgsRUFBdEIsdUJBQU47O0FBRUYsUUFBSUksV0FBV1AsV0FBV0csRUFBWCxDQUFmOztBQUVBLFFBQUksQ0FBQ0ksUUFBTCxFQUFlO0FBQ2JBLGlCQUFXLElBQUlSLE9BQU9JLEVBQVAsQ0FBSixFQUFYO0FBQ0FILGlCQUFXRyxFQUFYLElBQWlCSSxRQUFqQjtBQUNEOztBQUVELFFBQUlILGFBQWEsSUFBakIsRUFBdUI7QUFDckJBLGVBQVNJLG1CQUFULENBQTZCRCxRQUE3QjtBQUNBQSxlQUFTRSxhQUFULENBQXVCTCxTQUFTTSxXQUFoQztBQUNEOztBQUVESCxhQUFTSSxTQUFULENBQW1CTixPQUFuQjtBQUNBLFdBQU9FLFFBQVA7QUFDRCxHQTVCb0I7OztBQThCckI7Ozs7O0FBS0FLLFVBbkNxQixvQkFtQ1pULEVBbkNZLEVBbUNSVSxJQW5DUSxFQW1DRjtBQUNqQmQsV0FBT0ksRUFBUCxJQUFhVSxJQUFiO0FBQ0Q7QUFyQ29CLENBQXZCOztrQkF3Q2VaLGMiLCJmaWxlIjoic2VydmljZU1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBfY3RvcnMgPSB7fTtcbmNvbnN0IF9pbnN0YW5jZXMgPSB7fTtcblxuXG4vKipcbiAqIE1hbmFnZXIgdGhlIHNlcnZpY2VzIGFuZCB0aGVpciByZWxhdGlvbnMuIEFjdHMgYXMgYSBmYWN0b3J5IHRvIGVuc3VyZSBzZXJ2aWNlc1xuICogYXJlIGluc3RhbmNpYXRlZCBvbmx5IG9uY2UuXG4gKi9cbmNvbnN0IHNlcnZpY2VNYW5hZ2VyID0ge1xuICAvKipcbiAgICogUmV0cmlldmUgYSBzZXJ2aWNlIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gaWQuIElmIHRoZSBzZXJ2aWNlIGFzIG5vdCBiZWVlblxuICAgKiByZXF1ZXN0ZWQgeWV0LCBpdCBpcyBpbnN0YW5jaWF0ZWQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFRoZSBpZCBvZiB0aGUgcmVnaXN0ZXJlZCBzZXJ2aWNlXG4gICAqIEBwYXJhbSB7QWN0aXZpdHl9IGNvbnN1bWVyIC0gVGhlIGFjdGl2aXR5IGluc3RhbmNlIHJlcXVlcmluZyB0aGUgc2VydmljZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBUaGUgb3B0aW9ucyB0byBjb25maWd1cmUgdGhlIHNlcnZpY2UuXG4gICAqL1xuICByZXF1aXJlKGlkLCBjb25zdW1lciA9IG51bGwsIG9wdGlvbnMgPSB7fSkge1xuICAgIGlkID0gJ3NlcnZpY2U6JyArIGlkO1xuXG4gICAgaWYgKCFfY3RvcnNbaWRdKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBTZXJ2aWNlIFwiJHtpZH1cIiBkb2VzIG5vdCBleGlzdHNgKTtcblxuICAgIGxldCBpbnN0YW5jZSA9IF9pbnN0YW5jZXNbaWRdO1xuXG4gICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgaW5zdGFuY2UgPSBuZXcgX2N0b3JzW2lkXTtcbiAgICAgIF9pbnN0YW5jZXNbaWRdID0gaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgaWYgKGNvbnN1bWVyICE9PSBudWxsKSB7XG4gICAgICBjb25zdW1lci5hZGRSZXF1aXJlZEFjdGl2aXR5KGluc3RhbmNlKTtcbiAgICAgIGluc3RhbmNlLmFkZENsaWVudFR5cGUoY29uc3VtZXIuY2xpZW50VHlwZXMpO1xuICAgIH1cblxuICAgIGluc3RhbmNlLmNvbmZpZ3VyZShvcHRpb25zKTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlZ2l0ZXIgYSBzZXJ2aWNlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFRoZSBpZCBvZiB0aGUgc2VydmljZSwgaW4gb3JkZXIgdG8gcmV0cmlldmUgaXQgbGF0ZXIuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGN0b3IgLSBUaGUgY29uc3RydWN0b3Igb2YgdGhlIHNlcnZpY2UuXG4gICAqL1xuICByZWdpc3RlcihpZCwgY3Rvcikge1xuICAgIF9jdG9yc1tpZF0gPSBjdG9yO1xuICB9LFxufTtcblxuZXhwb3J0IGRlZmF1bHQgc2VydmljZU1hbmFnZXI7XG4iXX0=