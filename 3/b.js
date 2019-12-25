const {
  initializeInput,
  getIntersections,
} = require('./a');

const { pipe, reduce } = require('../utils/functional');

// Add 2 to offset array indeces starting from 0
const getDistance = (wires, i) => wires[0].indexOf(i) + wires[1].indexOf(i) + 2;

const findShortestIntersection = ({ wires, intersections }) => reduce(
  (min, i) => !min || getDistance(wires, i) < min
    ? getDistance(wires, i)
    : min,
  null,
  intersections,
);

const main = pipe(
  initializeInput,
  (wires) => ({
    wires,
    intersections: [...getIntersections(wires)]
  }),
  findShortestIntersection,
);

module.exports = {
  main,
  initializeInput,
};
