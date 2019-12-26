const path = require('path');

const { readInputFile, splitByNewline } = require('../utils/readInput');
const {
  pipe, reduce, memoize,
} = require('../utils/functional');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const addOrbitToGraph = (graph, obj1, obj2) => ({
  ...graph,
  [obj1]: graph[obj1]
    ? { ...graph[obj1], orbittedBy: [...graph[obj1].orbittedBy, obj2] }
    : { name: obj1, orbitting: null, orbittedBy: [obj2] },
  [obj2]: graph[obj2]
    ? { ...graph[obj2], orbitting: obj1 }
    : { name: obj2, orbitting: obj1, orbittedBy: [] },
});

const createOrbitGraph = (orbits) => reduce(
  (graph, orbit) => addOrbitToGraph(graph, ...orbit.split(')')),
  {},
  orbits,
);

const getOrbitalCalculation = (graph) => {
  const getNumberOfOrbits = (node, count = 0) => node.name === 'COM'
    ? count
    : getNumberOfOrbits(graph[node.orbitting], count + 1);

  return memoize(getNumberOfOrbits);
};

const calculateOrbitChecksum = (graph) => {
  const getNumberOfOrbits = getOrbitalCalculation(graph);

  return reduce(
    (sum, node) => sum + getNumberOfOrbits(node),
    0,
    Object.values(graph),
  );
};

const initializeInput = pipe(
  getInputFilePath,
  readInputFile,
  splitByNewline,
);

const main = pipe(
  initializeInput,
  createOrbitGraph,
  calculateOrbitChecksum,
);

module.exports = {
  main,
  initializeInput,
  createOrbitGraph,
  calculateOrbitChecksum,
};
