const path = require('path')
const async = require('async')
const newman = require('newman')

// number of parallel runs
const PARALLEL_THREADS = process.env.NEWMAN_THREADS || 1;
// path to the collection file
const POSTMAN_COLLECTION = process.env.NEWMAN_COLLECTION;
// path to the enviornment file
const POSTMAN_ENV = process.env.NEWMAN_ENV_FILE;
// in case you want to run consecutive iterations in the thread
const POSTMAN_ITERATION = process.env.NEWMAN_REPEAT; 

const runnerParameters = {
    collection: path.join(__dirname, POSTMAN_COLLECTION),
    environment: POSTMAN_ENV,
    iterationCount: POSTMAN_ITERATION,
    delayRequest: 300,
    reporters: 'cli'
};

runner = function (done) {
    newman.run(runnerParameters, done);
};

// create an array of runner's with parameters
let commands = []
for (let index = 0; index < PARALLEL_THREADS; index++) {
    commands.push(runner);
}

// run the commands async in parallel now
async.parallel(
    commands,
    (err, results) => {
        err && console.error(err);

        // iterate over results and show the data you need
        results.forEach(function (result) {
            let failures = result.run.failures;
            console.info(failures.length ? JSON.stringify(failures.failures, null, 2)
                : JSON.stringify(result.collection.name, null, 2) + "\n ran successfully."
            );
        });
    });
