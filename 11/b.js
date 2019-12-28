const { pipe, map, reduce } = require('../utils/functional');
const { provideInput } = require('../utils/intcode');

const { initializeProgram, paintHull, initializeRobot } = require('./a');
const { generateGrid, insertAtPoint, renderGrid } = require('../utils/grid');

const convertKeyToPoint = (key) => ({
  x: Math.abs(Number(key.split(',')[0])),
  y: Math.abs(Number(key.split(',')[1])),
});

const getXsOrYs = (grid, index) => map(
  (key) => Number(key.split(',')[index]),
  Object.keys(grid),
);

const getNumberOfRows = (grid) => (
  Math.abs(Math.min(...getXsOrYs(grid, 1))) + 1
);
const getNumberOfColumns = (grid) => Math.max(...getXsOrYs(grid, 0)) + 1;

const convertPaintInstructionsToGrid = (pi) => reduce(
  (grid, key) => insertAtPoint(
    grid,
    convertKeyToPoint(key),
    pi[key].color,
  ),
  generateGrid(
    getNumberOfRows(pi),
    getNumberOfColumns(pi),
    { 0: ' ', 1: '#' },
  ),
  Object.keys(pi),
);

const main = pipe(
  initializeProgram,
  (runnable) => provideInput(runnable, 1),
  (r) => paintHull(initializeRobot(r)),
  convertPaintInstructionsToGrid,
  renderGrid,
);

module.exports = {
  main,
  getNumberOfRows,
};
