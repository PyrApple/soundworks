"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.linearToDecibel = linearToDecibel;
exports.decibelTolinear = decibelTolinear;
exports.powerToDecibel = powerToDecibel;
exports.decibelToPower = decibelToPower;
exports.linearToCent = linearToCent;
exports.centTolinear = centTolinear;
exports.getScaler = getScaler;
function linearToDecibel(val) {
  return 8.685889638065035 * Math.log(val); // 20 * log10(val)
};

function decibelTolinear(val) {
  return Math.exp(0.11512925464970229 * val); // pow(10, val / 20)
};

function powerToDecibel(val) {
  return 4.3429448190325175 * Math.log(val); // 10 * log10(val)
};

function decibelToPower(val) {
  return Math.exp(0.23025850929940458 * val); // pow(10, val / 10)
};

function linearToCent(val) {
  return 1731.23404906675611 * Math.log(val); // 1200 * log2(val)
};

function centTolinear(val) {
  return Math.exp(0.0005776226504666211 * val); // pow(2, val / 1200)
};

function getScaler(minIn, maxIn, minOut, maxOut) {
  var a = (maxOut - minOut) / (maxIn - minIn);
  var b = minOut - a * minIn;
  return function (x) {
    return a * x + b;
  };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hdGguanMiXSwibmFtZXMiOlsibGluZWFyVG9EZWNpYmVsIiwiZGVjaWJlbFRvbGluZWFyIiwicG93ZXJUb0RlY2liZWwiLCJkZWNpYmVsVG9Qb3dlciIsImxpbmVhclRvQ2VudCIsImNlbnRUb2xpbmVhciIsImdldFNjYWxlciIsInZhbCIsIk1hdGgiLCJsb2ciLCJleHAiLCJtaW5JbiIsIm1heEluIiwibWluT3V0IiwibWF4T3V0IiwiYSIsImIiLCJ4Il0sIm1hcHBpbmdzIjoiOzs7OztRQUFnQkEsZSxHQUFBQSxlO1FBSUFDLGUsR0FBQUEsZTtRQUlBQyxjLEdBQUFBLGM7UUFJQUMsYyxHQUFBQSxjO1FBSUFDLFksR0FBQUEsWTtRQUlBQyxZLEdBQUFBLFk7UUFJQUMsUyxHQUFBQSxTO0FBeEJULFNBQVNOLGVBQVQsQ0FBeUJPLEdBQXpCLEVBQThCO0FBQ25DLFNBQU8sb0JBQW9CQyxLQUFLQyxHQUFMLENBQVNGLEdBQVQsQ0FBM0IsQ0FEbUMsQ0FDTztBQUMzQzs7QUFFTSxTQUFTTixlQUFULENBQXlCTSxHQUF6QixFQUE4QjtBQUNuQyxTQUFPQyxLQUFLRSxHQUFMLENBQVMsc0JBQXNCSCxHQUEvQixDQUFQLENBRG1DLENBQ1M7QUFDN0M7O0FBRU0sU0FBU0wsY0FBVCxDQUF3QkssR0FBeEIsRUFBNkI7QUFDbEMsU0FBTyxxQkFBcUJDLEtBQUtDLEdBQUwsQ0FBU0YsR0FBVCxDQUE1QixDQURrQyxDQUNTO0FBQzVDOztBQUVNLFNBQVNKLGNBQVQsQ0FBd0JJLEdBQXhCLEVBQTZCO0FBQ2xDLFNBQU9DLEtBQUtFLEdBQUwsQ0FBUyxzQkFBc0JILEdBQS9CLENBQVAsQ0FEa0MsQ0FDVTtBQUM3Qzs7QUFFTSxTQUFTSCxZQUFULENBQXNCRyxHQUF0QixFQUEyQjtBQUNoQyxTQUFPLHNCQUFzQkMsS0FBS0MsR0FBTCxDQUFTRixHQUFULENBQTdCLENBRGdDLENBQ1k7QUFDN0M7O0FBRU0sU0FBU0YsWUFBVCxDQUFzQkUsR0FBdEIsRUFBMkI7QUFDaEMsU0FBT0MsS0FBS0UsR0FBTCxDQUFTLHdCQUF3QkgsR0FBakMsQ0FBUCxDQURnQyxDQUNjO0FBQy9DOztBQUVNLFNBQVNELFNBQVQsQ0FBbUJLLEtBQW5CLEVBQTBCQyxLQUExQixFQUFpQ0MsTUFBakMsRUFBeUNDLE1BQXpDLEVBQWlEO0FBQ3RELE1BQU1DLElBQUksQ0FBQ0QsU0FBU0QsTUFBVixLQUFxQkQsUUFBUUQsS0FBN0IsQ0FBVjtBQUNBLE1BQU1LLElBQUlILFNBQVNFLElBQUlKLEtBQXZCO0FBQ0EsU0FBTztBQUFBLFdBQUtJLElBQUlFLENBQUosR0FBUUQsQ0FBYjtBQUFBLEdBQVA7QUFDRCIsImZpbGUiOiJtYXRoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGxpbmVhclRvRGVjaWJlbCh2YWwpIHtcbiAgcmV0dXJuIDguNjg1ODg5NjM4MDY1MDM1ICogTWF0aC5sb2codmFsKTsgLy8gMjAgKiBsb2cxMCh2YWwpXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZGVjaWJlbFRvbGluZWFyKHZhbCkge1xuICByZXR1cm4gTWF0aC5leHAoMC4xMTUxMjkyNTQ2NDk3MDIyOSAqIHZhbCk7IC8vIHBvdygxMCwgdmFsIC8gMjApXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcG93ZXJUb0RlY2liZWwodmFsKSB7XG4gIHJldHVybiA0LjM0Mjk0NDgxOTAzMjUxNzUgKiBNYXRoLmxvZyh2YWwpOyAvLyAxMCAqIGxvZzEwKHZhbClcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWNpYmVsVG9Qb3dlcih2YWwpIHtcbiAgcmV0dXJuIE1hdGguZXhwKDAuMjMwMjU4NTA5Mjk5NDA0NTggKiB2YWwpOyAvLyBwb3coMTAsIHZhbCAvIDEwKVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGxpbmVhclRvQ2VudCh2YWwpIHtcbiAgcmV0dXJuIDE3MzEuMjM0MDQ5MDY2NzU2MTEgKiBNYXRoLmxvZyh2YWwpOyAvLyAxMjAwICogbG9nMih2YWwpXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gY2VudFRvbGluZWFyKHZhbCkge1xuICByZXR1cm4gTWF0aC5leHAoMC4wMDA1Nzc2MjI2NTA0NjY2MjExICogdmFsKTsgLy8gcG93KDIsIHZhbCAvIDEyMDApXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2NhbGVyKG1pbkluLCBtYXhJbiwgbWluT3V0LCBtYXhPdXQpIHtcbiAgY29uc3QgYSA9IChtYXhPdXQgLSBtaW5PdXQpIC8gKG1heEluIC0gbWluSW4pO1xuICBjb25zdCBiID0gbWluT3V0IC0gYSAqIG1pbkluO1xuICByZXR1cm4geCA9PiBhICogeCArIGI7XG59O1xuIl19