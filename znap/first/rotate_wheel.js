var ev3dev = require('ev3dev-lang');

console.log('Attempting to run...');

/*
 * Check if a motor is available on OUTPUT_A
 */

var leftWheel = new ev3dev.Motor(ev3dev.OUTPUT_A);

if(!leftWheel.connected) {
    console.error("No motor was found on port A. Please connect the motor and try again.");
    process.exit(1);
} else {
    console.log('Motor found.');
}

/*
 * First attempt, simply run a motor for some time
 */

leftWheel.runForDistance(360 * 10, 500, leftWheel.stopActionValues.brake);
console.log("Running the motor for 180 tacho counts...");


// Prevent Node from exiting until motor is done
var cancellationToken = setInterval(function() {
    if (!leftWheel.isRunning)
        clearInterval(cancellationToken);
}, 200);