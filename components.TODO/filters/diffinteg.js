/* Generated by es6-transpiler v 0.7.14-2 *//**
 * Filter removing offset (combining 1st-order differentiator and integrtor)
 *
 * @constructor
 * @param {number} factor - feedback factor of integrator.
 */
var DiffInteg = (function(){var DP$0 = Object.defineProperty;"use strict";
  function DiffInteg() {var factor = arguments[0];if(factor === void 0)factor = 0.98;
    if(factor < 0)
      factor = 0.0;
    else if(factor > 1)
      factor = 1;

    this.factor = factor;

    this.last = null;
    this.output = 0;
  }DP$0(DiffInteg, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  /**
   * Input and process value.
   *
   * @param {number} value - input value.
   * @returns filtered value
   */
  DiffInteg.prototype.input = function(value) {
    if(this.last !== null) {
      var diff = value - this.last;
      this.output = this.factor * (this.output + diff);
    } else {
      this.output = 0.0;
    }
    
    this.last = value;

    return this.output;
  }
;return DiffInteg;})();

module.exports = DiffInteg;
