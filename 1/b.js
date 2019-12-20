const readInput = require('../utils/readInput');
const { pipe } = require('../utils/functional');
const { getFuelForMass, add } = require('./a');

const getFuelForFuelMass = (x) => x <= 0
  ? 0 // return 0 instead of x to prevent a negative num from being returned
  : x + getFuelForFuelMass(getFuelForMass(x));

const getAllFuelRequired = pipe(
  getFuelForMass,
  getFuelForFuelMass
);

const main = () => readInput(path.join(__dirname, './input.txt'))
  .map(Number)
  .map(getAllFuelRequired)
  .reduce(add, 0);

module.exports = {
  main
};
