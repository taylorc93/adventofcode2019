const { initializeIntcode } = require('./a');
const { pipe, curry } = require('../utils/functional');

const {
  generateRunnable,
  runProgram,
  provideInput,
} = require('../utils/intcode');

const main = pipe(
  initializeIntcode,
  generateRunnable,
  curry(provideInput)(5),
  runProgram,
  (runnable) => runnable.output,
);

module.exports = {
  main,
};
