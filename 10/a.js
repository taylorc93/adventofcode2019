const path = require('path');

const { readInputFile, splitByNewline } = require('../utils/readInput');
const { pipe, reduce, match } = require('../utils/functional');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const initializeInput = pipe(
  getInputFilePath,
  readInputFile,
  splitByNewline,
);

const objs = {
  ASTEROID: '#',
  EMPTY: '.',
};
const findAsteroidInRow = (asteroids, row, y) => reduce(
  (currentAsteroids, item, x) => item === objs.ASTEROID
    ? [...currentAsteroids, { x, y }]
    : currentAsteroids,
  asteroids,
  row.split(''),
);

const getAsteroidLocations = (rows) => reduce(
  findAsteroidInRow,
  [],
  rows,
);

const getSightAngle = (start, asteroid) => Math.atan2(
  asteroid.y - start.y,
  asteroid.x - start.x,
);

// To find visible asteroids, we calculate the angle between the potential
// station spot and all other asteroids. The number of visible stations is the
// number of unique angles.
const getVisibleAsteroids = (asteroids, asteroid) => reduce(
  (angles, a) => angles.add(getSightAngle(asteroid, a)),
  new Set(),
  asteroids,
);

const findBestStation = (asteroids) => reduce(
  (max, asteroid) => match(getVisibleAsteroids(asteroids, asteroid).size)
    .on((x) => !max || x > max, (x) => x)
    .otherwise(() => max),
  null,
  asteroids,
);

const main = pipe(
  initializeInput,
  getAsteroidLocations,
  findBestStation,
);

module.exports = {
  main,
};
