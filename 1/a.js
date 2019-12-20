const path = require('path');

const { pipe, curriedMap, curriedReduce } = require('../utils/functional');
const { splitByNewline, readInputFile } = require('../utils/readInput');

const getInputFilePath = () => path.join(__dirname, 'input.txt');
const divideByThree = (x) => x / 3;
const roundDown = (x) => Math.floor(x);
const subtractTwo = (x) => x - 2;
const add = (x, y) => x + y;

const getFuelForMass = pipe(
  divideByThree,
  roundDown,
  subtractTwo,
);

const main = pipe(
  getInputFilePath,
  readInputFile,
  splitByNewline,
  curriedMap(getFuelForMass),
  curriedReduce(add, 0),
);

module.exports = {
  divideByThree,
  roundDown,
  subtractTwo,
  getFuelForMass,
  add,
  main,
};
