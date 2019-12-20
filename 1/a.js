const path = require('path');

const { pipe } = require('../utils/functional');
const readInput = require('../utils/readInput');

const divideByThree = (x) => x / 3;
const roundDown = (x) => Math.floor(x);
const subtractTwo = (x) => x - 2;
const add = (x, y) => x + y;

const getMass = pipe(
  divideByThree,
  roundDown,
  subtractTwo
);

const main = () => readInput(path.join(__dirname, './input.txt'))
  .map(Number)
  .map(getMass)
  .reduce(add, 0);

module.exports = {
  divideByThree,
  roundDown,
  subtractTwo,
  getMass,
  main,
};
