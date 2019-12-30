const path = require('path');

const { readInputFile, splitByNewline } = require('../utils/readInput');
const {
  pipe, reduce, match, memoize, curry,
} = require('../utils/functional');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

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

const initializeInput = pipe(
  getInputFilePath,
  readInputFile,
  splitByNewline,
  getAsteroidLocations,
);

const getSightAngle = (start, asteroid) => Math.atan2(
  asteroid.y - start.y,
  asteroid.x - start.x,
);

const getDistance = (a1, a2) => Math.abs(a2.y - a1.y);

// To find visible asteroids, we calculate the angle between the potential
// station spot and all other asteroids. The number of visible stations is the
// number of unique angles. For non-unique angles, the asteroid closest to the
// target asteroid is saved
const getVisibleAsteroids = (asteroids, asteroid) => reduce(
  (visible, a) => {
    const angle = getSightAngle(asteroid, a);
    const distance = getDistance(asteroid, a);

    return !visible.has(angle) || distance < getDistance(asteroid, visible.get(angle))
      ? visible.set(getSightAngle(asteroid, a), a)
      : visible;
  },
  new Map(),
  asteroids,
);

const findBestStation = (asteroids) => {
  const visible = memoize(curry(getVisibleAsteroids)(asteroids));

  return reduce(
    (best, asteroid) => match(asteroid)
      .on((x) => !best || visible(x).size > visible(best).size, (x) => x)
      .otherwise(() => best),
    null,
    asteroids,
  );
};

const getVisibleAsteroidsFromStation = (asteroids) => (
  getVisibleAsteroids(asteroids, findBestStation(asteroids)).size
);

const main = pipe(
  initializeInput,
  getVisibleAsteroidsFromStation,
);

module.exports = {
  main,
  initializeInput,
  getSightAngle,
  findBestStation,
  getVisibleAsteroids,
  getVisibleAsteroidsFromStation,
};
