const { pipe, map, reduce } = require('../utils/functional');
const { provideInput } = require('../utils/intcode');

const { initializeProgram, paintHull, initializeRobot } = require('./a');

const getPixelForColor = (color) => color === 0 ? ' ' : 'X';

const convertKeyToPoint = (key) => ({
  x: Math.abs(Number(key.split(',')[0])),
  y: Math.abs(Number(key.split(',')[1])),
});

const getXsOrYs = (grid, index) => map(
  (key) => Number(key.split(',')[index]),
  Object.keys(grid),
);

const getNumberOfRows = (grid) => (
  Math.abs(Math.max(...getXsOrYs(grid, 1)))
  + Math.abs(Math.min(...getXsOrYs(grid, 1))) + 1
);
const getNumberOfColumns = (grid) => Math.max(...getXsOrYs(grid, 0));
const initializePixelMap = (grid) => Array(getNumberOfRows(grid)).fill(
  Array(getNumberOfColumns(grid)).fill(getPixelForColor(0)),
);

const updateRow = (grid, key, row) => [
  ...row.slice(0, convertKeyToPoint(key).x),
  getPixelForColor(grid[key].color),
  ...row.slice(convertKeyToPoint(key).x + 1, row.length),
];

const convertGridToPixelMap = (grid) => reduce(
  (pixelMap, key) => [
    ...pixelMap.slice(0, convertKeyToPoint(key).y),
    updateRow(grid, key, pixelMap[convertKeyToPoint(key).y]),
    ...pixelMap.slice(convertKeyToPoint(key).y + 1, pixelMap.length),
  ],
  initializePixelMap(grid),
  Object.keys(grid),
);

const main = pipe(
  initializeProgram,
  (runnable) => provideInput(runnable, 1),
  (r) => paintHull(initializeRobot(r)),
  convertGridToPixelMap,
  (pixelMap) => pixelMap.forEach(
    (row) => console.log(row.join('')), // eslint-disable-line
  ),
);

module.exports = {
  main,
  getNumberOfRows,
};
