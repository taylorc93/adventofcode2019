const path = require('path');

const { readInputFile, splitByNewline, splitByComma } = require('../utils/readInput');
const {
  pipe,
  curriedMap,
  curriedReduce,
  map,
  reduce,
  match,
} = require('../utils/functional');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

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
const getMoveDistance = (move) => Number(move.slice(1));

const getNewPoint = (direction, point, distance) => match(direction)
  .on(isUp, () => ({ ...point, y: point.y + distance }))
  .on(isDown, () => ({ ...point, y: point.y - distance }))
  .on(isLeft, () => ({ ...point, x: point.x - distance }))
  .on(isRight, () => ({ ...point, x: point.x + distance }))
  .otherwise((x) => { throw new Error(`Unsupported direction ${x}`); });

const convertMoveToPoints = (points, move) => [
  ...points,
  ...map(
    (_, i) => getNewPoint(
      move[0],
      points.length > 0 ? points[points.length - 1] : { x: 0, y: 0 },
      i + 1,
    ),
    Array(getMoveDistance(move)).fill(),
  ),
];

const convertWireToPoints = curriedReduce(convertMoveToPoints, []);

const initializeInput = pipe(
  getInputFilePath,
  readInputFile,
  splitByNewline,
  curriedMap(splitByComma),
  curriedMap(convertWireToPoints),
  curriedMap((wire) => map(JSON.stringify, wire)),
);

const getIntersections = pipe(
  curriedMap((w) => new Set(w)),
  ([wireSet1, wireSet2]) => new Set(
    [...wireSet1].filter((x) => wireSet2.has(x)),
  ),
);

const getIntersectDistance = pipe(
  (i) => JSON.parse(i),
  ({ x, y }) => Math.abs(x) + Math.abs(y),
);

const findShortestIntersection = (intersections) => reduce(
  (min, i) => match(getIntersectDistance(i))
    .on((x) => x < min, (x) => x)
    .otherwise(() => min),
  getIntersectDistance([...intersections][0]),
  [...intersections].slice(1),
);

const main = pipe(
  initializeInput,
  getIntersections,
  findShortestIntersection,
);

module.exports = {
  main,
  initializeInput,
  getNewPoint,
  getMoveDistance,
  getIntersections,
};
