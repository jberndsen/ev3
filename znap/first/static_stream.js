var ev3dev = require('ev3dev-lang');
var Rx = require('rx');

console.log('Attempting to run...');

/*
 * Check if a motor is available on OUTPUT_A and OUTPUT_D
 */

var leftWheel = new ev3dev.Motor(ev3dev.OUTPUT_A);
var rightWheel = new ev3dev.Motor(ev3dev.OUTPUT_D);

if(!leftWheel.connected || !rightWheel.connected) {
    console.error("No motor was found on port A or port D. Please connect the motors and try again.");
    process.exit(1);
} else {
    console.log('Motors for the wheels found.');
}

/*
 * Use streams for dealing with motors
 * Right now, we alternate turning the left or right wheel every second
 */
Rx.Observable
    .fromArray([1,2,3,4,5,6])
    .zip(Rx.Observable.interval(1000), function(a, b) { return a; })
    .subscribe(
        function(x) {                                       // onNext
            if (x % 2 == 0) {
                leftWheel.runForTime(1000, -500, leftWheel.stopActionValues.brake);
            } else {
                rightWheel.runForTime(1000, -500, rightWheel.stopActionValues.brake);
            }
        },
        null,                                               // onError
        function() {                                        // onComplete
            console.log('stream completed');    
         }
    );        


// Prevent Node from exiting until motor is done
var cancellationToken = setInterval(function() {
    if(!leftWheel.isRunning && !rightWheel.isRunning)
        clearInterval(cancellationToken);
}, 200);