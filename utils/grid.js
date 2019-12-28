const { map, curry, match } = require('./functional');

const directions = {
  UP: 'U',
  DOWN: 'D',
  LEFT: 'L',
  RIGHT: 'R',
};
const isUp = (x) => x === directions.UP;
const isDown = (x) => x === directions.DOWN;
const isLeft = (x) => x === directions.LEFT;
const isRight = (x) => x === directions.RIGHT;


// Generates a new point from an existing one. Uses the given direction to
// determine what value to increment.
const getPointFromDirection = (direction, point, distance) => match(direction)
  .on(isUp, () => ({ ...point, y: point.y + distance, direction }))
  .on(isDown, () => ({ ...point, y: point.y - distance, direction }))
  .on(isLeft, () => ({ ...point, x: point.x - distance, direction }))
  .on(isRight, () => ({ ...point, x: point.x + distance, direction }))
  .otherwise((x) => { throw new Error(`Unsupported direction ${x}`); });

const initializeTiles = (rows, columns) => Array(rows).fill(
  Array(columns).fill(0),
);

const generateGrid = (height, width, pixelMap) => ({
  pixelMap,
  tiles: initializeTiles(height, width),
});

const insertAtPoint = (grid, point, value) => ({
  ...grid,
  tiles: [
    ...grid.tiles.slice(0, point.y),
    [
      ...grid.tiles[point.y].slice(0, point.x),
      value,
      ...grid.tiles[point.y].slice(point.x + 1, grid.tiles[point.y].length),
    ],
    ...grid.tiles.slice(point.y + 1, grid.length),
  ],
});

const updatePixelMap = (grid, pixelMap) => ({ ...grid, pixelMap });

const getValueAtPoint = (grid, point) => grid.tiles[point.y][point.x];
const getOutputForPixel = (pixelMap, p) => pixelMap[p];
const renderGrid = ({ tiles, pixelMap }) => tiles.forEach(
  // eslint-disable-next-line
  (row) => console.log(map(curry(getOutputForPixel)(pixelMap), row).join(''))
);

module.exports = {
  generateGrid,
  insertAtPoint,
  getValueAtPoint,
  renderGrid,
  getPointFromDirection,
  updatePixelMap,
};
