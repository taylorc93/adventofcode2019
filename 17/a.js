const path = require('path');

const { readInputFile, splitByComma } = require('../utils/readInput');
const {
  pipe, curriedMap, map, filter, reduce,
} = require('../utils/functional');

const {
  generateRunnable,
  runProgram,
} = require('../utils/intcode');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const initializeProgram = pipe(
  getInputFilePath,
  readInputFile,
  splitByComma,
  curriedMap(Number),
  generateRunnable,
);

const filterEmpty = (i) => i !== '';
const generateGrid = ({ output }) => map(
  (row) => map(Number, filter(filterEmpty, row.split(','))),
  filter(filterEmpty, output.join(',').split(10)),
);

const outOfBounds = (grid, y, x) => x < 0
  || y < 0
  || y >= grid.length
  || x >= grid[0].length;


const getNeighbors = (grid, y, x) => filter(
  filterEmpty,
  [
    outOfBounds(grid, y + 1, x) ? '' : grid[y + 1][x],
    outOfBounds(grid, y - 1, x) ? '' : grid[y - 1][x],
    outOfBounds(grid, y, x + 1) ? '' : grid[y][x + 1],
    outOfBounds(grid, y, x - 1) ? '' : grid[y][x - 1],
  ],
);

const isIntersection = (grid, y, x) => grid[y][x] === 35
  ? reduce(
    (accum, val) => accum && grid[y][x] === val,
    true,
    getNeighbors(grid, y, x),
  ) : false;

const getAlignmentParameters = (grid) => reduce(
  (sum, row, y) => sum + reduce(
    (s, _, x) => isIntersection(grid, y, x)
      ? s + x * y
      : s,
    0,
    row,
  ),
  0,
  grid,
);

const main = pipe(
  initializeProgram,
  runProgram,
  generateGrid,
  // Due to the generation method, the last item is always an empty array
  (grid) => grid.slice(0, grid.length - 1),
  getAlignmentParameters,
);

module.exports = {
  main,
  initializeProgram,
};
