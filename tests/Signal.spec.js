import test from 'tape';
import Signal from '../src/client/core/Signal';

test('Signal#set', (t) => {
  var signal = new Signal();

  t.test('should be able to change the signal state', (t) => {
    signal.set(true);
    t.deepEqual(signal._state, true);
    t.end();
  });

  // it('should do nothing when already in this state', () => {

  // });
});
