const myArgs = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const Mocha = require('mocha');

// Instantiate a Mocha with options
const mocha = new Mocha({
    reporter: 'mochawesome',
    reporterOptions: {
        reportFilename: 'customReportFilename',
        quiet: false
    },
});

// Use non-default Mocha test directory.
const testDir = process.env.PWD + '/src/specs/';

global.env = myArgs.env;

// Add each .js file to the mocha instance
fs.readdirSync(testDir)
    .filter(function(file) {
        return path.extname(file) === '.js';
    })
    .forEach(function(file) {
        mocha.addFile(path.join(testDir, file));
        mocha.asyncOnly();
        mocha.slow(1000); // setting the indication of slow tests
        mocha.retries(3);   // settings fail retry counts for flaky tests
        mocha.timeout(10000);
    });

// Run the tests.
mocha.run(function(failures) {
    process.exitCode = failures ? 1 : 0; // exit with non-zero status if there were failures
});
