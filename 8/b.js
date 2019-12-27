const {
  pipe,
  curriedReduce,
  map,
  chunk,
  curry,
  reduce,
  zip,
} = require('../utils/functional');
const { initializeLayers } = require('./a');

const mergeLayers = pipe(
  ([l1, l2]) => zip(l1, l2),
  curriedReduce(
    (mergedLayer, [top, bottom]) => [
      ...mergedLayer,
      top !== 2 ? top : bottom,
    ],
    [],
  ),
);

const mergeAllLayers = (layers) => reduce(
  (image, layer) => mergeLayers([image, layer]),
  layers[0],
  layers.slice(1),
);

const pixelMap = {
  0: ' ',
  1: 'X',
  2: ' ',
};
const renderImage = (image) => image.forEach(
  (row) => console.log(map((pixel) => pixelMap[pixel], row).join('')),
);

const main = pipe(
  initializeLayers,
  mergeAllLayers,
  curry(chunk)(25),
  renderImage,
);

module.exports = {
  main,
};
