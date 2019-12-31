const { initializeMoons } = require('./a');
const {
  pipe, map, curry, reduce,
} = require('../utils/functional');

const updateVelocity = (positions, velocity, index) => reduce(
  (currentV, position, i) => i === index || position === positions[index]
    ? currentV
    : position > positions[index] ? currentV + 1 : currentV - 1,
  velocity,
  positions,
);

const checkIfRepeat = (initialPs, initialVs, currentPs, currentVs) => (
  JSON.stringify(initialPs) === JSON.stringify(currentPs)
  && JSON.stringify(initialVs) === JSON.stringify(currentVs)
);


const gcd = (...nums) => {
  const gcd2 = (a, b) => !b ? a : gcd2(b, a % b);

  return reduce(
    gcd2,
    nums[0],
    nums.slice(1),
  );
};
const lcm = (...nums) => reduce(
  (total, x) => total * (x / gcd(total, x)),
  1,
  nums,
);

// Due to the number of iterations, this couldn't be recursive :(
const findStepsUntilRepeat = (initialPs, initialVs = [0, 0, 0, 0]) => {
  const isRepeat = curry(checkIfRepeat)(initialPs, initialVs);
  let currentPs = initialPs;
  let currentVs = initialVs;
  let steps = 0;

  while (true) { // eslint-disable-line no-constant-condition
    currentVs = map(curry(updateVelocity)(currentPs), currentVs);
    // eslint-disable-next-line no-loop-func
    currentPs = map((pos, i) => pos + currentVs[i], currentPs);
    steps += 1;

    if (isRepeat(currentPs, currentVs)) {
      return steps;
    }
  }
};

const main = pipe(
  initializeMoons,
  (moons) => ({
    xs: map((m) => m.pos.x, moons),
    ys: map((m) => m.pos.y, moons),
    zs: map((m) => m.pos.z, moons),
  }),
  ({ xs, ys, zs }) => ({
    xs: findStepsUntilRepeat(xs),
    ys: findStepsUntilRepeat(ys),
    zs: findStepsUntilRepeat(zs),
  }),
  ({ xs, ys, zs }) => lcm(xs, ys, zs),
);

module.exports = {
  main,
  lcm,
  gcd,
};
