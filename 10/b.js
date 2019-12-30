const { pipe } = require('../utils/functional');
const {
  initializeInput,
  findBestStation,
  getVisibleAsteroids,
} = require('./a');

// If you envision the cartesian plane as a clock, atan2 starts from 3 and
// returns values from [-PI, PI]. This function starts at 12 and returns
// values from [0, 2PI], rotating clockwise.
const getClockwiseSightAngle = (start, asteroid) => {
  const result = Math.atan2(
    asteroid.x - start.x,
    // swap start + asteroid here to start at the top, not bottom
    start.y - asteroid.y,
  );

  return result >= 0
    ? result
    : (Math.PI - Math.abs(result)) + Math.PI;
};

const main = pipe(
  initializeInput,
  (asteroids) => ({ asteroids, station: findBestStation(asteroids) }),
  // This is a naive implementation b/c we know that there are 319 asteroids
  // visible from our station, so we just sort by clockwise angle and then
  // grab the 200th item
  ({ asteroids, station }) => Array
    .from(getVisibleAsteroids(asteroids, station).values())
    .sort((a1, a2) => {
      const a1Angle = getClockwiseSightAngle(station, a1);
      const a2Angle = getClockwiseSightAngle(station, a2);

      return a1Angle < a2Angle ? -1 : 1;
    }),
  (asteroids) => asteroids[199],
  (asteroid) => asteroid.x * 100 + asteroid.y,
);

module.exports = {
  main,
  getClockwiseSightAngle,
};
