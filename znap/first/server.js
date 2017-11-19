var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var Rx = require('rx');
var ev3dev = require('ev3dev-lang');

// set up our hardware
var leftWheel = new ev3dev.Motor(ev3dev.OUTPUT_A);
var rightWheel = new ev3dev.Motor(ev3dev.OUTPUT_D);
var jaws = new ev3dev.Motor(ev3dev.OUTPUT_B);

if(!leftWheel.connected || !rightWheel.connected) {
    console.error("No motor was found on port A or port D. Please connect the motors and try again.");
    process.exit(1);
} else {
    console.log('Motors for the wheels found.');
}

// (1) requests to the root path serves the static client assets.
app.use('/', express.static('client'));

// (2) start listening to socket connections
io.on('connection', function(socket) {
    console.log('A client connected.');
    socket.emit('info', 'You connected successfully!');

    // log messages we receive on the socket
    Rx.Observable.fromEvent(socket, 'info')
        .subscribe(function(payload) {
            console.log('message: ' + payload);
        });

    // execute ev3 commands we receive on the socket
    Rx.Observable.fromEvent(socket, 'ev3-command')
        .subscribe(function(command) {
            if (command === 'bite') {
                jaws.runForTime(300, -500, jaws.stopActionValues.brake);
                setTimeout(function() {
                    jaws.runForTime(750, 200, jaws.stopActionValues.brake);
                }, 1000);
            }
            if (command === 'left') {
                rightWheel.start(-500, leftWheel.stopActionValues.brake);
            }
            if (command === 'right') {
                leftWheel.start(-500, rightWheel.stopActionValues.brake);
            }
            if (command === 'up') {
                leftWheel.start(-500, leftWheel.stopActionValues.brake);
                rightWheel.start(-500, rightWheel.stopActionValues.brake);
            }
            if (command === 'down') {
                leftWheel.start(500, leftWheel.stopActionValues.brake);
                rightWheel.start(500, rightWheel.stopActionValues.brake);
            }
            if (command === 'stop') {
                leftWheel.stop();
                rightWheel.stop();
            }
        });

  socket.on('disconnect', function(){
    console.log('A client disconnected');
  });
});

// (3) start the web server on port 3000
server.listen(3000, function() {
  console.log('--------------------');
  console.log('Your app is running at http://ev3dev.local:3000/');
  console.log('--------------------')
});