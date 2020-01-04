const { initializeProgram } = require('./a');
const { pipe } = require('../utils/functional');

const {
  runProgram,
  provideInput,
} = require('../utils/intcode');

const main = pipe(
  initializeProgram,
  (runnable) => provideInput(runnable, 5),
  runProgram,
  (runnable) => runnable.output[0],
);

module.exports = {
  main,
};
