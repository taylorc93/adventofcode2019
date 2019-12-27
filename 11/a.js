const path = require('path');

const { readInputFile, splitByComma } = require('../utils/readInput');
const { pipe, curriedMap, match } = require('../utils/functional');

const {
  generateRunnable,
  runProgram,
  provideInput,
  resetOutput,
  statuses,
} = require('../utils/intcode');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const initializeProgram = pipe(
  getInputFilePath,
  readInputFile,
  splitByComma,
  curriedMap(Number),
  generateRunnable,
);

const colors = {
  BLACK: 0,
  WHITE: 1,
};
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

const getNewPoint = (direction, point) => match(direction)
  .on(isUp, () => ({ ...point, y: point.y + 1, direction }))
  .on(isDown, () => ({ ...point, y: point.y - 1, direction }))
  .on(isLeft, () => ({ ...point, x: point.x - 1, direction }))
  .on(isRight, () => ({ ...point, x: point.x + 1, direction }))
  .otherwise((x) => { throw new Error(`Unsupported direction ${x}`); });

const getKeyForPoint = (point) => `${point.x},${point.y}`;
const updateGrid = (grid, point, color) => ({
  ...grid,
  [getKeyForPoint(point)]: {
    color,
    timesPainted: grid[getKeyForPoint(point)]
      ? grid[getKeyForPoint(point)].timesPainted + 1
      : 1,
  },
});
const getColorForPoint = (grid, point) => grid[getKeyForPoint(point)]
  ? grid[getKeyForPoint(point)].color
  : colors.BLACK;

const initializeGrid = () => ({
  '0,0': {
    color: colors.BLACK,
    timesPainted: 0,
  },
});

const getNewDirection = (current, turn) => match(turn)
  .on((t) => t === 0 && current === directions.LEFT, () => directions.DOWN)
  .on((t) => t === 1 && current === directions.LEFT, () => directions.UP)
  .on((t) => t === 0 && current === directions.UP, () => directions.LEFT)
  .on((t) => t === 1 && current === directions.UP, () => directions.RIGHT)
  .on((t) => t === 0 && current === directions.RIGHT, () => directions.UP)
  .on((t) => t === 1 && current === directions.RIGHT, () => directions.DOWN)
  .on((t) => t === 0 && current === directions.DOWN, () => directions.RIGHT)
  .on((t) => t === 1 && current === directions.DOWN, () => directions.LEFT)
  .otherwise(
    () => { throw new Error(`Invalid direction ${current} and turn ${turn}`); },
  );

// 1. Run the program to generate output
// 2. Update the grid with the latest output
// 3. Update the location of the robot
// 4. Clear output and provide input to program for the next iteration
const updateRobot = pipe(
  (robot) => ({ ...robot, runnable: runProgram(robot.runnable) }),
  ({ runnable, grid, location }) => ({
    runnable,
    location,
    grid: updateGrid(grid, location, runnable.output[0]),
  }),
  ({ runnable, grid, location }) => ({
    runnable,
    grid,
    location: getNewPoint(
      getNewDirection(location.direction, runnable.output[1]),
      location,
    ),
  }),
  ({ runnable, grid, location }) => ({
    grid,
    location,
    runnable: provideInput(
      resetOutput(runnable),
      getColorForPoint(grid, location),
    ),
  }),
);

// The initial, recursive implementation ran into maximum call stack errors...
const paintHull = (initialRobot) => {
  let robot = initialRobot;

  while (robot.runnable.status !== statuses.FINISHED) {
    robot = updateRobot(robot);
  }

  return robot.grid;
};

const initializeRobot = (runnable) => ({
  runnable,
  location: { x: 0, y: 0, direction: directions.UP },
  grid: initializeGrid(),
});

const main = pipe(
  initializeProgram,
  (runnable) => provideInput(runnable, 0),
  (r) => paintHull(initializeRobot(r)),
  (grid) => Object.keys(grid).length,
);

module.exports = {
  main,
  initializeProgram,
  initializeRobot,
  paintHull,
};
