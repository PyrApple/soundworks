'use strict';

var Utils = (function(){var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var proto$0={};
  function Utils() {}DP$0(Utils,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  proto$0.getMaxOfArray = function(numArray) {
    return Math.max.apply(null, numArray);
  };

  proto$0.getMinOfArray = function(numArray) {
    return Math.min.apply(null, numArray);
  };
MIXIN$0(Utils.prototype,proto$0);proto$0=void 0;return Utils;})();

module.exports = new Utils();