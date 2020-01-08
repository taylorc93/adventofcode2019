/*
 * These are small wrapper functions arround Array prototype methods to allow
 * for currying + composition
 */
const pipe = (...fns) => (x) => fns.reduce((y, fn) => fn(y), x);
const compose = (...fns) => (x) => fns.reduceRight((y, fn) => fn(y), x);
const curry = (fn) => (...args) => args.length < fn.length
  ? (...rest) => curry(fn)(...args, ...rest)
  : fn(...args);

const map = (cb, items) => items.map(cb);
const filter = (cb, items) => items.filter(cb);
const reduce = (cb, initial, items) => items.reduce(cb, initial);
const flatten = (items) => reduce(
  (xs, i) => [...xs, ...(Array.isArray(i) ? flatten(i) : [i])],
  [],
  items,
);

const swap = (obj) => reduce(
  (swapped, key) => ({ ...swapped, [obj[key]]: key }),
  {},
  Object.keys(obj),
);

const chunk = (size, items) => reduce(
  (chunks, item) => chunks.length && chunks[chunks.length - 1].length < size
    ? [...chunks.slice(0, chunks.length - 1), [...chunks[chunks.length - 1], item]]
    : [...chunks, [item]],
  [],
  items,
);
const zip = (xs, ys) => reduce(
  (zipped, item, i) => [...zipped, [item, ys[i]]],
  [],
  xs,
);
const updateAtIndex = (i, val, items) => [
  ...items.slice(0, i),
  val,
  ...items.slice(i + 1, items.length),
];

const last = (arr) => arr[arr.length - 1];
const trace = (label) => (value) => {
  console.log(`${label}: ${value}`); // eslint-disable-line
  return value;
};

const memoize = (fn) => {
  const cache = {};
  return (...args) => cache[JSON.stringify(args)] || fn(...args);
};

const matched = (x) => ({
  on: () => matched(x),
  otherwise: () => x,
});

const match = (x) => ({
  on: (pred, fn) => (pred(x) ? matched(fn(x)) : match(x)),
  otherwise: (fn) => fn(x),
});

const curriedMap = curry(map);
const curriedFilter = curry(filter);
const curriedReduce = curry(reduce);

module.exports = {
  pipe,
  compose,
  curry,
  memoize,
  last,
  trace,
  map,
  zip,
  flatten,
  updateAtIndex,
  swap,
  curriedMap,
  filter,
  chunk,
  match,
  curriedFilter,
  reduce,
  curriedReduce,
};
