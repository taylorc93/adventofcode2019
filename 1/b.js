const path = require('path');

const { splitByNewline, readInputFile } = require('../utils/readInput');
const { pipe, curriedMap, curriedReduce } = require('../utils/functional');
const { getFuelForMass, add } = require('./a');

const getInputFilePath = () => path.join(__dirname, 'input.txt');
const getFuelForFuelMass = (x) => x <= 0
  ? 0 // return 0 instead of x to prevent a negative num from being returned
  : x + getFuelForFuelMass(getFuelForMass(x));

const getAllFuelRequired = pipe(
  getFuelForMass,
  getFuelForFuelMass,
);

const main = pipe(
  getInputFilePath,
  readInputFile,
  splitByNewline,
  curriedMap(Number),
  curriedMap(getAllFuelRequired),
  curriedReduce(add, 0),
);

module.exports = {
  main,
};
