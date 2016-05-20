import childProcess from 'child_process';
import path from 'path';
import find from 'find';
import fs from 'fs';

// find all fixtures
const fixturesDir = path.join(__dirname, './fixtures');
const fixtures = find.fileSync(fixturesDir);

// pair up input & output files
const pairs = {};
const inputRegex = /(.+)\.input\.js$/;

fixtures.map(filename => {
  const match = inputRegex.exec(filename);

  if (match) {
    const outputFileName = `${match[1]}.output.js`;
    try {
      const stats = fs.statSync(outputFileName);
      if (stats.isFile()) {
        pairs[filename] = outputFileName;
      }
    } catch (e) {}
  }
});

// for each pair, run the transform and save the results
const results = {};
Object.keys(pairs).map(inputFilePath => {
  const outputFilePath = pairs[inputFilePath];

  console.log(`${path.basename(inputFilePath)} -> ${path.basename(outputFilePath)} `)

  const cp = childProcess.spawnSync('jscodeshift', [
    inputFilePath,
    '-p',
    '-d',
    '-s',
  ], {
    encoding: 'utf8',
  });

  const transformed = cp.output[1];

  // compare to output file

  const expected = fs.readFileSync(outputFilePath, 'utf8');

  if (transformed.trim() !== expected.trim()) {
    console.log('\nexpected\n');
    console.log(expected);
    console.log('\nactual\n');
    console.log(transformed);
    throw new Error('result did not match expected output');
  }
});

describe('success', () => {
  it('rules', () => {});
});
