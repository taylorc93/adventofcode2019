const { pipe, match, reduce } = require('../utils/functional');
const { initializeInput, createOrbitGraph } = require('./a');

const getNodesForSearch = (graph) => ({
  graph,
  nodes: {
    start: graph[graph.YOU.orbitting],
    end: graph[graph.SAN.orbitting],
  },
  count: 0,
});

const getUnvisitedNeighbors = (graph, node) => reduce(
  (nodes, n) => match(n)
    .on((x) => x === null || graph[x].visited, () => nodes)
    .otherwise((x) => [...nodes, graph[x]]),
  [],
  [node.orbitting, ...node.orbittedBy],
);

const markNode = (graph, node) => ({
  ...graph,
  [node.name]: { ...graph[node.name], visited: true },
});

/*
 * Basic DFS search on the orbit graph to find the shortest path to santa
 */
const getNumberOfTransfers = ({ graph, nodes: { start, end }, count }) => (
  match(start)
    .on((x) => x.name === end.name, () => count)
    .otherwise((x) => reduce(
      (total, unvisitedNode) => total === 0
        ? getNumberOfTransfers({
          graph: markNode(graph, x),
          count: count + 1,
          nodes: { start: unvisitedNode, end },
        })
        : total,
      0,
      getUnvisitedNeighbors(markNode(graph, x), start),
    ))
);

const main = pipe(
  initializeInput,
  createOrbitGraph,
  getNodesForSearch,
  getNumberOfTransfers,
);

module.exports = {
  main,
  getUnvisitedNeighbors,
  initializeInput,
  createOrbitGraph,
};

// const {
//   initializeInput,
//   createOrbitGraph,
//   getUnvisitedNeighbors,
// } = require('./6/b');

// const graph = createOrbitGraph(initializeInput());
