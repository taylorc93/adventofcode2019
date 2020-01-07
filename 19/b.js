const { initializeProgram } = require('./a');
const {
  pipe, reduce, curry, match,
} = require('../utils/functional');
const {
  runProgram,
  provideInput,
} = require('../utils/intcode');

const tileIsAffected = (program, x, y) => (
  Number(runProgram(provideInput(program, x, y)).output[0]) === 1
);

const checkRow = (maxTiles, program, y, x) => match(x)
  .on(() => x === maxTiles, () => null)
  .on(
    () => !tileIsAffected(program, x, y),
    () => checkRow(maxTiles, program, y, x + 1),
  )
  .on(
    () => !tileIsAffected(program, x + 99, y),
    () => null,
  )
  .otherwise(() => tileIsAffected(program, x, y + 99)
    ? { x, y }
    : checkRow(maxTiles, program, y, x + 1));

const findSquare = (maxTiles, program) => reduce(
  (point, _, y) => point || checkRow(maxTiles, program, y, 0),
  null,
  Array(maxTiles).fill(),
);

const main = pipe(
  initializeProgram,
  curry(findSquare)(2000), // Brute forced this... couldn't find a better way
  ({ x, y }) => x * 10000 + y,
);

module.exports = {
  main,
  initializeProgram,
  tileIsAffected,
};
