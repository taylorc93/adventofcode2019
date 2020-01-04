# Advent of Code 2019

This repo contains my solutions to the [Advent of Code 2019](https://adventofcode.com/2019) problems. While attempting to solve these problems, I tried to solve using the following criteria:

1. Use functional programming principles whenever possible (immutability, recursion, pure functions, functional composition, etc).
2. The code should be as concise as possible while still being easy to read
3. Reuse as much code from previous problems as possible

## Local setup

1. Node >= 10
2. `npm i`

## Running a solution:

The solutions for each day are contained within their own directory numbered 1-25. Since there are 2 parts to each day, each part is contained in either `a.js` or `b.js`. If you want to run an example:

1. Start the node REPL
2. Enter `const { main } = require('./{DAY}/{PART})`, replacing `{DAY}` and `{PART}` with your desired solution.
3. Run `main()`. This should output the answer to the problem.

If you want to try the solution on different input, replace the contents of `input.txt` with a different set of puzzle input.
