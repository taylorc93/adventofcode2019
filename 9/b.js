const { pipe } = require('../utils/functional');
const { initializeProgram } = require('./a');

const {
  runProgram,
  provideInput,
} = require('../utils/intcode');

const main = pipe(
  initializeProgram,
  (runnable) => provideInput(runnable, 2),
  runProgram,
  (runnable) => runnable.output[0],
);

module.exports = {
  main,
  initializeProgram,
};
