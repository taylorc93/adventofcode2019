/*
 * These are small wrapper functions arround Array prototype methods to allow
 * for currying + composition
 */
const map = (cb, items) => items.map(cb);
const filter = (cb, items) => items.filter(cb);
const reduce = (cb, initial, items) => items.reduce(cb, initial);

const pipe = (...fns) => (x) => fns.reduce((y, fn) => fn(y), x);
const compose = (...fns) => (x) => fns.reduceRight((y, fn) => fn(y), x);
const curry = (fn) => (...args) =>
  args.length < fn.length
    ? (...rest) => curry(fn)(...args, ...rest)
    : fn(...args);

module.exports = {
  map,
  filter,
  reduce,
  pipe,
  compose,
  curry,
};
