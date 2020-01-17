const path = require('path');

const { readInputFile, splitByNewline } = require('../utils/readInput');
const {
  pipe, map, match, reduce, curry, last,
} = require('../utils/functional');

const getInputFilePath = () => path.join(__dirname, 'input.txt');

const dealIntoNewStack = (cards) => cards.slice(0).reverse();
const cut = (value, cards) => [
  ...cards.slice(value, cards.length),
  ...cards.slice(0, value),
];

const dealWithIncrement = (value, cards) => reduce(
  (newDeck, card, i) => {
    const index = (i * value) % cards.length;
    newDeck[index] = card; // eslint-disable-line
    return newDeck;
  },
  Array(cards.length).fill(),
  cards,
);

const getValueForLine = (line) => Number(last(line.split(' ')));

const convertToOperations = (input) => map(
  (line) => match(line)
    .on(
      (l) => l.includes('cut'),
      (l) => curry(cut)(getValueForLine(l)),
    )
    .on(
      (l) => l.includes('deal with increment'),
      (l) => curry(dealWithIncrement)(getValueForLine(l)),
    )
    .otherwise(() => dealIntoNewStack),
  input,
);

const initializeCards = (length) => map(
  (_, i) => i,
  Array(length).fill(),
);

const initializeInput = pipe(
  getInputFilePath,
  readInputFile,
  splitByNewline,
  convertToOperations,
  (operations) => ({
    cards: initializeCards(10007),
    operations,
  }),
);

const shuffleCards = ({ cards, operations }) => reduce(
  (currentDeck, operation) => operation(currentDeck),
  cards,
  operations,
);

const main = pipe(
  initializeInput,
  shuffleCards,
  (cards) => cards.indexOf(2019),
);

module.exports = {
  main,
  initializeInput,
};
