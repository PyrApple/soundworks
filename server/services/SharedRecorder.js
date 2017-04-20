'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

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

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _Service2 = require('../core/Service');

var _Service3 = _interopRequireDefault(_Service2);

var _serviceManager = require('../core/serviceManager');

var _serviceManager2 = _interopRequireDefault(_serviceManager);

var _wavEncoder = require('wav-encoder');

var _wavEncoder2 = _interopRequireDefault(_wavEncoder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SERVICE_ID = 'service:shared-recorder';

var SharedRecorder = function (_Service) {
  (0, _inherits3.default)(SharedRecorder, _Service);

  function SharedRecorder() {
    (0, _classCallCheck3.default)(this, SharedRecorder);

    var _this = (0, _possibleConstructorReturn3.default)(this, (SharedRecorder.__proto__ || (0, _getPrototypeOf2.default)(SharedRecorder)).call(this, SERVICE_ID));

    var defaults = {
      directory: 'public'
    };

    _this.buffers = new _map2.default();
    // this.stacks = {};

    _this._rawSocket = _this.require('raw-socket', {
      protocol: [{ channel: 'shared-recorder:start-record', type: 'Uint8' }, { channel: 'shared-recorder:stop-record', type: 'Uint8' }, { channel: 'shared-recorder:new-block', type: 'Float32' }]
    });
    return _this;
  }

  (0, _createClass3.default)(SharedRecorder, [{
    key: 'start',
    value: function start() {}
  }, {
    key: 'connect',
    value: function connect(client) {
      // producer
      // @todo - define if the client is a producer in the handshake
      this.receive(client, 'create-buffer', this._createBuffer(client));

      this._rawSocket.receive(client, 'shared-recorder:start-record', this._startRecord(client));
      this._rawSocket.receive(client, 'shared-recorder:stop-record', this._stopRecord(client));
      this._rawSocket.receive(client, 'shared-recorder:new-block', this._recordBlock(client));
    }
  }, {
    key: 'disconnect',
    value: function disconnect(client) {}

    // remove that...

  }, {
    key: '_getBufferInfos',
    value: function _getBufferInfos(client, index) {
      var bufferId = client.uuid + ':' + index;
      return this.buffers[bufferId];
    }
  }, {
    key: '_createBuffer',
    value: function _createBuffer(client) {
      var _this2 = this;

      var uuid = client.uuid;

      return function (infos) {
        // prepare the buffer
        infos.buffer = new Float32Array(infos.length);
        infos.chunkHop = infos.chunkPeriod * infos.sampleRate; // period in samples
        infos.chunkSize = infos.chunkDuration * infos.sampleRate;
        // initialize pointers
        infos.pointer = 0;
        infos.chunkIndex = 0;
        // console.log(infos, infos.chunkPeriod, infos.sampleRate);

        var bufferId = uuid + ':' + infos.index;
        _this2.buffers[bufferId] = infos;
      };
    }
  }, {
    key: '_startRecord',
    value: function _startRecord(client) {
      var _this3 = this;

      return function (data) {
        console.log('start');
        var index = data[0];
        var infos = _this3._getBufferInfos(client, index);
        infos.pointer = 0;
        infos.chunkIndex = 0;
        infos.full = false;
      };
    }
  }, {
    key: '_stopRecord',
    value: function _stopRecord(client) {
      var _this4 = this;

      return function (data) {
        console.log('stop');
        var index = data[0];
        var infos = _this4._getBufferInfos(client, index);

        // finalize current chunk with available data
        var start = infos.chunkIndex * infos.chunkHop;
        _this4._finalizeChunk(infos, start, infos.pointer);
      };
    }
  }, {
    key: '_finalizeChunk',
    value: function _finalizeChunk(infos, start, end) {
      var _this5 = this;

      // const startTime = start / infos.sampleRate;
      // const endTime = end / infos.sampleRate;
      // console.log('finalizeBuffer', infos.name, infos.chunkIndex, start, startTime + 's', end, endTime + 's');

      var name = infos.name,
          chunkIndex = infos.chunkIndex,
          buffer = infos.buffer;

      var chunk = void 0;

      if (start < 0) {
        chunk = new Float32Array(end - start);
        chunk.set(buffer.subarray(start), 0);
        chunk.set(buffer.subarray(0, end), -start);
      } else {
        chunk = buffer.subarray(start, end);
      }

      _wavEncoder2.default.encode({
        sampleRate: infos.sampleRate,
        channelData: [chunk]
      }).then(function (buffer) {
        var filename = infos.name + '-' + chunkIndex + '.wav';
        // @todo - remove hard coded path
        var clientPath = _path2.default.join('sounds', filename);
        var serverPath = _path2.default.join(process.cwd(), 'public', clientPath);
        // write encoded buffer into a file
        var stream = _fs2.default.createWriteStream(serverPath);
        stream.on('finish', function () {
          return _this5._notifyChunk(name, chunkIndex, clientPath);
        });
        stream.write(new Buffer(buffer));
        stream.end();
      });
    }
  }, {
    key: '_notifyChunk',
    value: function _notifyChunk(name, chunkIndex, path) {
      // @todo - should send only to consumers client types
      console.log('notify "' + name + '" - chunkIndex: ' + chunkIndex + ' - ' + path);
      this.broadcast(null, null, 'available-file', name, chunkIndex, path);
      // emit for server side
      this.emit('available-file', name, chunkIndex, path);
    }

    // @fixme - this implementation assume that the block size cannot be larger
    // than the hop size, cannot have multiple output chunk in one incomming block

  }, {
    key: '_verifyChunk',
    value: function _verifyChunk(infos, prevPointer, currentPointer) {
      var full = infos.full;
      var chunkIndex = infos.chunkIndex;
      var hop = infos.chunkHop;
      var size = infos.chunkSize;
      var length = infos.length;

      var end = chunkIndex * hop + size;

      if (end > length) end = end - length;

      var start = end - size;

      if (!full && start < 0) return;

      if (end > prevPointer && end <= currentPointer) {
        this._finalizeChunk(infos, start, end);
        infos.chunkIndex = (infos.chunkIndex + 1) % infos.numChunks;
      }
    }
  }, {
    key: '_recordBlock',
    value: function _recordBlock(client) {
      var _this6 = this;

      var uuid = client.uuid;

      return function (data) {
        var index = data[0];
        var buffer = data.subarray(1);
        var bufferId = uuid + ':' + index;
        var length = buffer.length;
        var infos = _this6.buffers[bufferId];
        var prevPointer = infos.pointer;

        var numLeft = infos.length - infos.pointer;
        var numCopy = Math.min(numLeft, length);
        var toCopy = buffer.subarray(0, numCopy);
        // @todo - handle the end of the buffer properly
        infos.buffer.set(toCopy, infos.pointer);
        infos.pointer += toCopy.length;
        // console.log(infos.pointer, toCopy.length, infos.length);

        _this6._verifyChunk(infos, prevPointer, infos.pointer);

        if (!infos.cyclic && infos.pointer === infos.length) console.log('end recording');

        // if cyclic buffer - reinit pointer and copy rest of the incomming buffer
        if (infos.cyclic && infos.pointer === infos.length) {
          infos.full = true;
          infos.pointer = 0;

          if (numCopy < length) {
            var _toCopy = buffer.subarray(numCopy);
            infos.buffer.set(_toCopy, 0);
            infos.pointer += _toCopy.length;
          }

          _this6._verifyChunk(infos, prevPointer, infos.pointer);
        }
      };
    }
  }]);
  return SharedRecorder;
}(_Service3.default);

_serviceManager2.default.register(SERVICE_ID, SharedRecorder);

exports.default = SharedRecorder;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNoYXJlZFJlY29yZGVyLmpzIl0sIm5hbWVzIjpbIlNFUlZJQ0VfSUQiLCJTaGFyZWRSZWNvcmRlciIsImRlZmF1bHRzIiwiZGlyZWN0b3J5IiwiYnVmZmVycyIsIl9yYXdTb2NrZXQiLCJyZXF1aXJlIiwicHJvdG9jb2wiLCJjaGFubmVsIiwidHlwZSIsImNsaWVudCIsInJlY2VpdmUiLCJfY3JlYXRlQnVmZmVyIiwiX3N0YXJ0UmVjb3JkIiwiX3N0b3BSZWNvcmQiLCJfcmVjb3JkQmxvY2siLCJpbmRleCIsImJ1ZmZlcklkIiwidXVpZCIsImluZm9zIiwiYnVmZmVyIiwiRmxvYXQzMkFycmF5IiwibGVuZ3RoIiwiY2h1bmtIb3AiLCJjaHVua1BlcmlvZCIsInNhbXBsZVJhdGUiLCJjaHVua1NpemUiLCJjaHVua0R1cmF0aW9uIiwicG9pbnRlciIsImNodW5rSW5kZXgiLCJkYXRhIiwiY29uc29sZSIsImxvZyIsIl9nZXRCdWZmZXJJbmZvcyIsImZ1bGwiLCJzdGFydCIsIl9maW5hbGl6ZUNodW5rIiwiZW5kIiwibmFtZSIsImNodW5rIiwic2V0Iiwic3ViYXJyYXkiLCJlbmNvZGUiLCJjaGFubmVsRGF0YSIsInRoZW4iLCJmaWxlbmFtZSIsImNsaWVudFBhdGgiLCJqb2luIiwic2VydmVyUGF0aCIsInByb2Nlc3MiLCJjd2QiLCJzdHJlYW0iLCJjcmVhdGVXcml0ZVN0cmVhbSIsIm9uIiwiX25vdGlmeUNodW5rIiwid3JpdGUiLCJCdWZmZXIiLCJwYXRoIiwiYnJvYWRjYXN0IiwiZW1pdCIsInByZXZQb2ludGVyIiwiY3VycmVudFBvaW50ZXIiLCJob3AiLCJzaXplIiwibnVtQ2h1bmtzIiwibnVtTGVmdCIsIm51bUNvcHkiLCJNYXRoIiwibWluIiwidG9Db3B5IiwiX3ZlcmlmeUNodW5rIiwiY3ljbGljIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNB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VCxNQUFNRyxNQUE3QyxFQUNFUyxRQUFRQyxHQUFSLENBQVksZUFBWjs7QUFFRjtBQUNBLFlBQUliLE1BQU1vRCxNQUFOLElBQWdCcEQsTUFBTVMsT0FBTixLQUFrQlQsTUFBTUcsTUFBNUMsRUFBb0Q7QUFDbERILGdCQUFNZSxJQUFOLEdBQWEsSUFBYjtBQUNBZixnQkFBTVMsT0FBTixHQUFnQixDQUFoQjs7QUFFQSxjQUFJc0MsVUFBVTVDLE1BQWQsRUFBc0I7QUFDcEIsZ0JBQU0rQyxVQUFTakQsT0FBT3FCLFFBQVAsQ0FBZ0J5QixPQUFoQixDQUFmO0FBQ0EvQyxrQkFBTUMsTUFBTixDQUFhb0IsR0FBYixDQUFpQjZCLE9BQWpCLEVBQXlCLENBQXpCO0FBQ0FsRCxrQkFBTVMsT0FBTixJQUFpQnlDLFFBQU8vQyxNQUF4QjtBQUNEOztBQUVELGlCQUFLZ0QsWUFBTCxDQUFrQm5ELEtBQWxCLEVBQXlCeUMsV0FBekIsRUFBc0N6QyxNQUFNUyxPQUE1QztBQUNEO0FBQ0YsT0FsQ0Q7QUFtQ0Q7Ozs7O0FBR0gseUJBQWU0QyxRQUFmLENBQXdCeEUsVUFBeEIsRUFBb0NDLGNBQXBDOztrQkFFZUEsYyIsImZpbGUiOiJTaGFyZWRSZWNvcmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBTZXJ2aWNlIGZyb20gJy4uL2NvcmUvU2VydmljZSc7XG5pbXBvcnQgc2VydmljZU1hbmFnZXIgZnJvbSAnLi4vY29yZS9zZXJ2aWNlTWFuYWdlcic7XG5pbXBvcnQgd2F2RW5jb2RlciBmcm9tICd3YXYtZW5jb2Rlcic7XG5cbmNvbnN0IFNFUlZJQ0VfSUQgPSAnc2VydmljZTpzaGFyZWQtcmVjb3JkZXInO1xuXG5cbmNsYXNzIFNoYXJlZFJlY29yZGVyIGV4dGVuZHMgU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKFNFUlZJQ0VfSUQpO1xuXG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgICBkaXJlY3Rvcnk6ICdwdWJsaWMnXG4gICAgfTtcblxuICAgIHRoaXMuYnVmZmVycyA9IG5ldyBNYXAoKTtcbiAgICAvLyB0aGlzLnN0YWNrcyA9IHt9O1xuXG4gICAgdGhpcy5fcmF3U29ja2V0ID0gdGhpcy5yZXF1aXJlKCdyYXctc29ja2V0Jywge1xuICAgICAgcHJvdG9jb2w6IFtcbiAgICAgICAgeyBjaGFubmVsOiAnc2hhcmVkLXJlY29yZGVyOnN0YXJ0LXJlY29yZCcsIHR5cGU6ICdVaW50OCcgfSxcbiAgICAgICAgeyBjaGFubmVsOiAnc2hhcmVkLXJlY29yZGVyOnN0b3AtcmVjb3JkJywgdHlwZTogJ1VpbnQ4JyB9LFxuICAgICAgICB7IGNoYW5uZWw6ICdzaGFyZWQtcmVjb3JkZXI6bmV3LWJsb2NrJywgdHlwZTogJ0Zsb2F0MzInIH0sXG4gICAgICBdLFxuICAgIH0pO1xuICB9XG5cbiAgc3RhcnQoKSB7XG5cbiAgfVxuXG4gIGNvbm5lY3QoY2xpZW50KSB7XG4gICAgLy8gcHJvZHVjZXJcbiAgICAvLyBAdG9kbyAtIGRlZmluZSBpZiB0aGUgY2xpZW50IGlzIGEgcHJvZHVjZXIgaW4gdGhlIGhhbmRzaGFrZVxuICAgIHRoaXMucmVjZWl2ZShjbGllbnQsICdjcmVhdGUtYnVmZmVyJywgdGhpcy5fY3JlYXRlQnVmZmVyKGNsaWVudCkpO1xuXG4gICAgdGhpcy5fcmF3U29ja2V0LnJlY2VpdmUoY2xpZW50LCAnc2hhcmVkLXJlY29yZGVyOnN0YXJ0LXJlY29yZCcsIHRoaXMuX3N0YXJ0UmVjb3JkKGNsaWVudCkpO1xuICAgIHRoaXMuX3Jhd1NvY2tldC5yZWNlaXZlKGNsaWVudCwgJ3NoYXJlZC1yZWNvcmRlcjpzdG9wLXJlY29yZCcsIHRoaXMuX3N0b3BSZWNvcmQoY2xpZW50KSk7XG4gICAgdGhpcy5fcmF3U29ja2V0LnJlY2VpdmUoY2xpZW50LCAnc2hhcmVkLXJlY29yZGVyOm5ldy1ibG9jaycsIHRoaXMuX3JlY29yZEJsb2NrKGNsaWVudCkpO1xuICB9XG5cbiAgZGlzY29ubmVjdChjbGllbnQpIHtcblxuICB9XG5cbiAgLy8gcmVtb3ZlIHRoYXQuLi5cbiAgX2dldEJ1ZmZlckluZm9zKGNsaWVudCwgaW5kZXgpIHtcbiAgICBjb25zdCBidWZmZXJJZCA9IGAke2NsaWVudC51dWlkfToke2luZGV4fWA7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyc1tidWZmZXJJZF07XG4gIH1cblxuICBfY3JlYXRlQnVmZmVyKGNsaWVudCkge1xuICAgIGNvbnN0IHV1aWQgPSBjbGllbnQudXVpZDtcblxuICAgIHJldHVybiAoaW5mb3MpID0+IHtcbiAgICAgIC8vIHByZXBhcmUgdGhlIGJ1ZmZlclxuICAgICAgaW5mb3MuYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheShpbmZvcy5sZW5ndGgpO1xuICAgICAgaW5mb3MuY2h1bmtIb3AgPSBpbmZvcy5jaHVua1BlcmlvZCAqIGluZm9zLnNhbXBsZVJhdGU7IC8vIHBlcmlvZCBpbiBzYW1wbGVzXG4gICAgICBpbmZvcy5jaHVua1NpemUgPSBpbmZvcy5jaHVua0R1cmF0aW9uICogaW5mb3Muc2FtcGxlUmF0ZTtcbiAgICAgIC8vIGluaXRpYWxpemUgcG9pbnRlcnNcbiAgICAgIGluZm9zLnBvaW50ZXIgPSAwO1xuICAgICAgaW5mb3MuY2h1bmtJbmRleCA9IDA7XG4gICAgICAvLyBjb25zb2xlLmxvZyhpbmZvcywgaW5mb3MuY2h1bmtQZXJpb2QsIGluZm9zLnNhbXBsZVJhdGUpO1xuXG4gICAgICBjb25zdCBidWZmZXJJZCA9IGAke3V1aWR9OiR7aW5mb3MuaW5kZXh9YDtcbiAgICAgIHRoaXMuYnVmZmVyc1tidWZmZXJJZF0gPSBpbmZvcztcbiAgICB9O1xuICB9XG5cbiAgX3N0YXJ0UmVjb3JkKGNsaWVudCkge1xuICAgIHJldHVybiAoZGF0YSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ3N0YXJ0Jyk7XG4gICAgICBjb25zdCBpbmRleCA9IGRhdGFbMF07XG4gICAgICBjb25zdCBpbmZvcyA9IHRoaXMuX2dldEJ1ZmZlckluZm9zKGNsaWVudCwgaW5kZXgpO1xuICAgICAgaW5mb3MucG9pbnRlciA9IDA7XG4gICAgICBpbmZvcy5jaHVua0luZGV4ID0gMDtcbiAgICAgIGluZm9zLmZ1bGwgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBfc3RvcFJlY29yZChjbGllbnQpIHtcbiAgICByZXR1cm4gKGRhdGEpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdzdG9wJyk7XG4gICAgICBjb25zdCBpbmRleCA9IGRhdGFbMF07XG4gICAgICBjb25zdCBpbmZvcyA9IHRoaXMuX2dldEJ1ZmZlckluZm9zKGNsaWVudCwgaW5kZXgpO1xuXG4gICAgICAvLyBmaW5hbGl6ZSBjdXJyZW50IGNodW5rIHdpdGggYXZhaWxhYmxlIGRhdGFcbiAgICAgIGNvbnN0IHN0YXJ0ID0gaW5mb3MuY2h1bmtJbmRleCAqIGluZm9zLmNodW5rSG9wO1xuICAgICAgdGhpcy5fZmluYWxpemVDaHVuayhpbmZvcywgc3RhcnQsIGluZm9zLnBvaW50ZXIpO1xuICAgIH1cbiAgfVxuXG4gIF9maW5hbGl6ZUNodW5rKGluZm9zLCBzdGFydCwgZW5kKSB7XG4gICAgLy8gY29uc3Qgc3RhcnRUaW1lID0gc3RhcnQgLyBpbmZvcy5zYW1wbGVSYXRlO1xuICAgIC8vIGNvbnN0IGVuZFRpbWUgPSBlbmQgLyBpbmZvcy5zYW1wbGVSYXRlO1xuICAgIC8vIGNvbnNvbGUubG9nKCdmaW5hbGl6ZUJ1ZmZlcicsIGluZm9zLm5hbWUsIGluZm9zLmNodW5rSW5kZXgsIHN0YXJ0LCBzdGFydFRpbWUgKyAncycsIGVuZCwgZW5kVGltZSArICdzJyk7XG5cbiAgICBjb25zdCB7IG5hbWUsIGNodW5rSW5kZXgsIGJ1ZmZlciB9ID0gaW5mb3M7XG4gICAgbGV0IGNodW5rO1xuXG4gICAgaWYgKHN0YXJ0IDwgMCkge1xuICAgICAgY2h1bmsgPSBuZXcgRmxvYXQzMkFycmF5KGVuZCAtIHN0YXJ0KTtcbiAgICAgIGNodW5rLnNldChidWZmZXIuc3ViYXJyYXkoc3RhcnQpLCAwKTtcbiAgICAgIGNodW5rLnNldChidWZmZXIuc3ViYXJyYXkoMCwgZW5kKSwgLXN0YXJ0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2h1bmsgPSBidWZmZXIuc3ViYXJyYXkoc3RhcnQsIGVuZCk7XG4gICAgfVxuXG4gICAgd2F2RW5jb2Rlci5lbmNvZGUoe1xuICAgICAgc2FtcGxlUmF0ZTogaW5mb3Muc2FtcGxlUmF0ZSxcbiAgICAgIGNoYW5uZWxEYXRhOiBbY2h1bmtdLFxuICAgIH0pLnRoZW4oKGJ1ZmZlcikgPT4ge1xuICAgICAgY29uc3QgZmlsZW5hbWUgPSBgJHtpbmZvcy5uYW1lfS0ke2NodW5rSW5kZXh9LndhdmA7XG4gICAgICAvLyBAdG9kbyAtIHJlbW92ZSBoYXJkIGNvZGVkIHBhdGhcbiAgICAgIGNvbnN0IGNsaWVudFBhdGggPSBwYXRoLmpvaW4oJ3NvdW5kcycsIGZpbGVuYW1lKTtcbiAgICAgIGNvbnN0IHNlcnZlclBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3B1YmxpYycsIGNsaWVudFBhdGgpO1xuICAgICAgLy8gd3JpdGUgZW5jb2RlZCBidWZmZXIgaW50byBhIGZpbGVcbiAgICAgIGNvbnN0IHN0cmVhbSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKHNlcnZlclBhdGgpO1xuICAgICAgc3RyZWFtLm9uKCdmaW5pc2gnLCAoKSA9PiB0aGlzLl9ub3RpZnlDaHVuayhuYW1lLCBjaHVua0luZGV4LCBjbGllbnRQYXRoKSk7XG4gICAgICBzdHJlYW0ud3JpdGUobmV3IEJ1ZmZlcihidWZmZXIpKTtcbiAgICAgIHN0cmVhbS5lbmQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9ub3RpZnlDaHVuayhuYW1lLCBjaHVua0luZGV4LCBwYXRoKSB7XG4gICAgLy8gQHRvZG8gLSBzaG91bGQgc2VuZCBvbmx5IHRvIGNvbnN1bWVycyBjbGllbnQgdHlwZXNcbiAgICBjb25zb2xlLmxvZyhgbm90aWZ5IFwiJHtuYW1lfVwiIC0gY2h1bmtJbmRleDogJHtjaHVua0luZGV4fSAtICR7cGF0aH1gKTtcbiAgICB0aGlzLmJyb2FkY2FzdChudWxsLCBudWxsLCAnYXZhaWxhYmxlLWZpbGUnLCBuYW1lLCBjaHVua0luZGV4LCBwYXRoKTtcbiAgICAvLyBlbWl0IGZvciBzZXJ2ZXIgc2lkZVxuICAgIHRoaXMuZW1pdCgnYXZhaWxhYmxlLWZpbGUnLCBuYW1lLCBjaHVua0luZGV4LCBwYXRoKTtcbiAgfVxuXG4gIC8vIEBmaXhtZSAtIHRoaXMgaW1wbGVtZW50YXRpb24gYXNzdW1lIHRoYXQgdGhlIGJsb2NrIHNpemUgY2Fubm90IGJlIGxhcmdlclxuICAvLyB0aGFuIHRoZSBob3Agc2l6ZSwgY2Fubm90IGhhdmUgbXVsdGlwbGUgb3V0cHV0IGNodW5rIGluIG9uZSBpbmNvbW1pbmcgYmxvY2tcbiAgX3ZlcmlmeUNodW5rKGluZm9zLCBwcmV2UG9pbnRlciwgY3VycmVudFBvaW50ZXIpIHtcbiAgICBjb25zdCBmdWxsID0gaW5mb3MuZnVsbDtcbiAgICBjb25zdCBjaHVua0luZGV4ID0gaW5mb3MuY2h1bmtJbmRleDtcbiAgICBjb25zdCBob3AgPSBpbmZvcy5jaHVua0hvcDtcbiAgICBjb25zdCBzaXplID0gaW5mb3MuY2h1bmtTaXplO1xuICAgIGNvbnN0IGxlbmd0aCA9IGluZm9zLmxlbmd0aDtcblxuICAgIGxldCBlbmQgPSBjaHVua0luZGV4ICogaG9wICsgc2l6ZTtcblxuICAgIGlmIChlbmQgPiBsZW5ndGgpXG4gICAgICBlbmQgPSBlbmQgLSBsZW5ndGg7XG5cbiAgICBjb25zdCBzdGFydCA9IGVuZCAtIHNpemU7XG5cbiAgICBpZiAoIWZ1bGwgJiYgc3RhcnQgPCAwKVxuICAgICAgcmV0dXJuO1xuXG4gICAgaWYgKGVuZCA+IHByZXZQb2ludGVyICYmIGVuZCA8PSBjdXJyZW50UG9pbnRlcikge1xuICAgICAgdGhpcy5fZmluYWxpemVDaHVuayhpbmZvcywgc3RhcnQsIGVuZCk7XG4gICAgICBpbmZvcy5jaHVua0luZGV4ID0gKGluZm9zLmNodW5rSW5kZXggKyAxKSAlIGluZm9zLm51bUNodW5rcztcbiAgICB9XG4gIH1cblxuICBfcmVjb3JkQmxvY2soY2xpZW50KSB7XG4gICAgY29uc3QgdXVpZCA9IGNsaWVudC51dWlkO1xuXG4gICAgcmV0dXJuIChkYXRhKSA9PiB7XG4gICAgICBjb25zdCBpbmRleCA9IGRhdGFbMF07XG4gICAgICBjb25zdCBidWZmZXIgPSBkYXRhLnN1YmFycmF5KDEpO1xuICAgICAgY29uc3QgYnVmZmVySWQgPSBgJHt1dWlkfToke2luZGV4fWA7XG4gICAgICBjb25zdCBsZW5ndGggPSBidWZmZXIubGVuZ3RoO1xuICAgICAgY29uc3QgaW5mb3MgPSB0aGlzLmJ1ZmZlcnNbYnVmZmVySWRdO1xuICAgICAgY29uc3QgcHJldlBvaW50ZXIgPSBpbmZvcy5wb2ludGVyO1xuXG4gICAgICBjb25zdCBudW1MZWZ0ID0gaW5mb3MubGVuZ3RoIC0gaW5mb3MucG9pbnRlcjtcbiAgICAgIGNvbnN0IG51bUNvcHkgPSBNYXRoLm1pbihudW1MZWZ0LCBsZW5ndGgpO1xuICAgICAgY29uc3QgdG9Db3B5ID0gYnVmZmVyLnN1YmFycmF5KDAsIG51bUNvcHkpO1xuICAgICAgLy8gQHRvZG8gLSBoYW5kbGUgdGhlIGVuZCBvZiB0aGUgYnVmZmVyIHByb3Blcmx5XG4gICAgICBpbmZvcy5idWZmZXIuc2V0KHRvQ29weSwgaW5mb3MucG9pbnRlcik7XG4gICAgICBpbmZvcy5wb2ludGVyICs9IHRvQ29weS5sZW5ndGg7XG4gICAgICAvLyBjb25zb2xlLmxvZyhpbmZvcy5wb2ludGVyLCB0b0NvcHkubGVuZ3RoLCBpbmZvcy5sZW5ndGgpO1xuXG4gICAgICB0aGlzLl92ZXJpZnlDaHVuayhpbmZvcywgcHJldlBvaW50ZXIsIGluZm9zLnBvaW50ZXIpO1xuXG4gICAgICBpZiAoIWluZm9zLmN5Y2xpYyAmJiBpbmZvcy5wb2ludGVyID09PSBpbmZvcy5sZW5ndGgpXG4gICAgICAgIGNvbnNvbGUubG9nKCdlbmQgcmVjb3JkaW5nJyk7XG5cbiAgICAgIC8vIGlmIGN5Y2xpYyBidWZmZXIgLSByZWluaXQgcG9pbnRlciBhbmQgY29weSByZXN0IG9mIHRoZSBpbmNvbW1pbmcgYnVmZmVyXG4gICAgICBpZiAoaW5mb3MuY3ljbGljICYmIGluZm9zLnBvaW50ZXIgPT09IGluZm9zLmxlbmd0aCkge1xuICAgICAgICBpbmZvcy5mdWxsID0gdHJ1ZTtcbiAgICAgICAgaW5mb3MucG9pbnRlciA9IDA7XG5cbiAgICAgICAgaWYgKG51bUNvcHkgPCBsZW5ndGgpIHtcbiAgICAgICAgICBjb25zdCB0b0NvcHkgPSBidWZmZXIuc3ViYXJyYXkobnVtQ29weSk7XG4gICAgICAgICAgaW5mb3MuYnVmZmVyLnNldCh0b0NvcHksIDApO1xuICAgICAgICAgIGluZm9zLnBvaW50ZXIgKz0gdG9Db3B5Lmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3ZlcmlmeUNodW5rKGluZm9zLCBwcmV2UG9pbnRlciwgaW5mb3MucG9pbnRlcik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbnNlcnZpY2VNYW5hZ2VyLnJlZ2lzdGVyKFNFUlZJQ0VfSUQsIFNoYXJlZFJlY29yZGVyKTtcblxuZXhwb3J0IGRlZmF1bHQgU2hhcmVkUmVjb3JkZXI7XG4iXX0=