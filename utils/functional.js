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
const chunk = (size, items) => reduce(
  (chunks, item) => chunks.length && chunks[chunks.length - 1].length < size
    ? [...chunks.slice(0, chunks.length - 1), [...chunks[chunks.length - 1], item]]
    : [...chunks, [item]],
  [],
  items,
);

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

  map,
  curriedMap,
  filter,
  chunk,
  match,
  curriedFilter,
  reduce,
  curriedReduce,
};