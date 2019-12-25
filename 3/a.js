const path = require('path');

const { readInputFile, splitByNewline, splitByComma } = require('../utils/readInput');
const {
  pipe,
  curriedMap,
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

const pointToString = (p) => `${p.x},${p.y}`;

const getMoveDistance = (move) => Number(move.slice(1));
const getNextPoint = (direction, point) => match(direction)
  .on(isUp, () => ({ ...point, y: point.y + 1 }))
  .on(isDown, () => ({ ...point, y: point.y - 1 }))
  .on(isLeft, () => ({ ...point, x: point.x - 1 }))
  .on(isRight, () => ({ ...point, x: point.x + 1 }))
  .otherwise((x) => { throw new Error(`Unsupported direction ${x}`); });

const initializeInput = pipe(
  getInputFilePath,
  readInputFile,
  splitByNewline,
  curriedMap(splitByComma),
);

const convertMoveToPoints = (pointSet, move) => reduce(
  (currentPoints) => ({
    points: currentPoints.points.add(
      pointToString(getNextPoint(move[0], currentPoints.lastPoint)),
    ),
    lastPoint: getNextPoint(move[0], currentPoints.lastPoint),
  }),
  pointSet,
  Array(getMoveDistance(move)).fill(),
);

const convertWireToPoints = (wire) => reduce(
  convertMoveToPoints,
  {
    lastPoint: { x: 0, y: 0 },
    points: new Set(),
  },
  wire,
);

const convertWiresToPoints = (wires) => map(convertWireToPoints, wires);

const getIntersections = (wires) => reduce(
  (currentPoints, wire) => new Set(
    [...currentPoints].filter((x) => wire.has(x)),
  ),
  wires[0],
  wires.slice(1),
);

const getIntersectDistance = pipe(
  (i) => i.split(',').filter(Boolean).map(Number),
  ([x, y]) => Math.abs(x) + Math.abs(y),
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
  convertWiresToPoints,
  (wires) => map((w) => w.points, wires),
  getIntersections,
  findShortestIntersection,
);

module.exports = {
  main,
  initializeInput,
};
