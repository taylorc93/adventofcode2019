const path = require('path');

const { readInputFile, splitBy } = require('../utils/readInput');
const {
  pipe,
  curriedMap,
  chunk,
  curry,
  reduce,
  match,
  filter,
} = require('../utils/functional');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const initializeLayers = pipe(
  getInputFilePath,
  readInputFile,
  splitBy(''),
  curriedMap(Number),
  curry(chunk)(25 * 6),
);

const getNumValuesInLayer = (value, layer) => (
  filter((x) => x === value, layer).length
);
const getZerosInLayer = curry(getNumValuesInLayer)(0);
const getOnesInLayer = curry(getNumValuesInLayer)(1);
const getTwosInLayer = curry(getNumValuesInLayer)(2);

const findMinLayer = (layers) => reduce(
  (minLayer, layer) => match(getZerosInLayer(layer))
    .on((x) => !minLayer || x < getZerosInLayer(minLayer), () => layer)
    .otherwise(() => minLayer),
  null,
  layers,
);

const calculateLayerSize = (layer) => (
  getOnesInLayer(layer) * getTwosInLayer(layer)
);

const main = pipe(
  initializeLayers,
  findMinLayer,
  calculateLayerSize,
);

module.exports = {
  main,
  initializeLayers,
};
