const path = require('path');

const { readInputFile, splitByNewline } = require('../utils/readInput');
const {
  pipe, curriedMap, match, reduce, filter, curry, map,
} = require('../utils/functional');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const createMoonFromInput = (input, i) => ({
  pos: {
    x: Number(input.split(',')[0].split('=')[1]),
    y: Number(input.split(',')[1].split('=')[1]),
    z: Number(input.split(',')[2].split('=')[1].replace('>', '')),
  },
  vel: { x: 0, y: 0, z: 0 },
  id: i,
});

const getPairs = (moons, pairs = []) => match(moons.length)
  .on((l) => l === 1, () => pairs)
  .otherwise(() => getPairs(
    moons.slice(1),
    reduce(
      (currentPairs, m) => [...currentPairs, [moons[0], m]],
      pairs,
      moons.slice(1),
    ),
  ));

const updatePosition = (moon) => ({
  ...moon,
  pos: {
    x: moon.pos.x + moon.vel.x,
    y: moon.pos.y + moon.vel.y,
    z: moon.pos.z + moon.vel.z,
  },
});

const updateVelocity = (moon, changes) => ({
  ...moon,
  vel: {
    x: moon.vel.x + reduce((sum, n) => sum + n.x, 0, changes),
    y: moon.vel.y + reduce((sum, n) => sum + n.y, 0, changes),
    z: moon.vel.z + reduce((sum, n) => sum + n.z, 0, changes),
  },
});

const applyVelocityChanges = (moons, changes) => map(
  (moon) => updateVelocity(moon, filter((c) => c.id === moon.id, changes)),
  moons,
);

const getVelocityChange = (m1, m2) => ({
  id: m1.id,
  x: m2.pos.x > m1.pos.x ? 1 : m2.pos.x === m1.pos.x ? 0 : -1,
  y: m2.pos.y > m1.pos.y ? 1 : m2.pos.y === m1.pos.y ? 0 : -1,
  z: m2.pos.z > m1.pos.z ? 1 : m2.pos.z === m1.pos.z ? 0 : -1,
});

const getVelocityChanges = (moons) => reduce(
  (changes, [m1, m2]) => [
    ...changes,
    getVelocityChange(m1, m2),
    getVelocityChange(m2, m1),
  ],
  [],
  getPairs(moons),
);

const updateMoons = pipe(
  (moons) => ({
    moons,
    changes: getVelocityChanges(moons),
  }),
  ({ moons, changes }) => applyVelocityChanges(moons, changes),
  curriedMap(updatePosition),
);

const applySteps = (steps, moons) => match(steps)
  .on((s) => s === 0, () => moons)
  .otherwise(() => applySteps(
    steps - 1,
    updateMoons(moons),
  ));

const getPotentialEnergy = (moon) => (
  (Math.abs(moon.pos.x) + Math.abs(moon.pos.y) + Math.abs(moon.pos.z))
  * (Math.abs(moon.vel.x) + Math.abs(moon.vel.y) + Math.abs(moon.vel.z))
);

const calculateTotalEnergy = (moons) => reduce(
  (energy, moon) => energy + getPotentialEnergy(moon),
  0,
  moons,
);

const initializeMoons = pipe(
  getInputFilePath,
  readInputFile,
  splitByNewline,
  curriedMap(createMoonFromInput),
);

const main = pipe(
  initializeMoons,
  curry(applySteps)(1000),
  calculateTotalEnergy,
);

module.exports = {
  main,
  initializeMoons,
  getPairs,
  updateMoons,
};
