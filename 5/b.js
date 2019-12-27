const { initializeIntcode } = require('./a');
const { pipe } = require('../utils/functional');

const {
  generateRunnable,
  runProgram,
  provideInput,
} = require('../utils/intcode');

const main = pipe(
  initializeIntcode,
  generateRunnable,
  (runnable) => provideInput(runnable, 5),
  runProgram,
  (runnable) => runnable.output,
);

module.exports = {
  main,
};
