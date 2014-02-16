/*jslint node: true */
/*global describe, it */
"use strict";

// The purpose of this app is to manually validate node-serialport eventing.
// The app finds the name of the last comPort provided by list(), opens the port,
// and sends/receives an echo packet.  It looks for disconnected events which
// would occur due to manual removal of the serial port device and attempts
// to reconnect after the port reappears in list().
// The goal for this test is to provide a reproduction case of bug #265,
// https://github.com/voodootikigod/node-serialport/issues/265
// and provide validation of the necessary api changes and the fix.

var chai = require('chai');
var util = require('util');
var serialPortFactory = require('../serialport');

serialPortFactory.on('error', function(err) {
  chai.assert.fail('no error', err, util.inspect(err));
});

// Open a port, hook its events
function openPort(portName) {

  console.log('opening ' + portName);

  var port = new serialPortFactory.SerialPort(portName, null, false);

  var data = new Buffer("hello");
  var sendDataIntervalId;

  port.on('disconnected', function() {

    clearInterval(sendDataIntervalId);
    console.log('disconnected');

    var intervalId = setInterval(function () {
      reconnect(portName, intervalId);
    }, 2000 );

  });

  port.on('error', function(err) {
    chai.assert.fail('no error', err, util.inspect(err));
  });

  port.on('data', function(d) {
    chai.assert.equal(data.toString(), d.toString(), 'incorrect data received');
    process.stdout.write('r'); // data properly received
  });

  port.on('open', function() {
    console.log('opened');

    sendDataIntervalId = setInterval(function () {
      process.stdout.write('s'); // sending data
      port.write(data);
    }, 200 );

  });

  port.on('close', function() {

    clearInterval(sendDataIntervalId);
    console.log('closed');

  });

  port.open();

};

function reconnect(portName, intervalId) {
  serialPortFactory.list(function(err, ports) {

    chai.assert.isUndefined(err, util.inspect(err));
    chai.assert.isDefined(ports, 'ports is not defined');

    if (ports.length > 0 && portName == ports.slice(-1)[0].comName) {
      clearInterval(intervalId);
      openPort(portName);
    } else {
      console.log('Port ' + portName + ' not found, retrying...');
    }

  });
};

serialPortFactory.list(function(err, ports) {

  chai.assert.isUndefined(err, util.inspect(err));
  chai.assert.isDefined(ports, 'ports is not defined');
  chai.assert.isTrue(ports.length > 0, 'no ports found');

  var portName = ports.slice(-1)[0].comName;

  openPort(portName);
});