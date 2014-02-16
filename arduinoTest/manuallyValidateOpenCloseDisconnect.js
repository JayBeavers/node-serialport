/*jslint node: true */
/*global describe, it */
"use strict";

var chai = require('chai');
var util = require('util');
var serialPort = require('../serialport');

serialPort.on('error', function(err) {
  chai.assert.fail('no error', err, util.inspect(err));
});

function openPort(portName) {

  console.log('opening ' + portName);

  var port = new serialPort.SerialPort(portName, null, false);

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
    process.stdout.write('.');
  });

  port.on('open', function() {
    console.log('opened');

    sendDataIntervalId = setInterval(function () {
    process.stdout.write('_');
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
  serialPort.list(function(err, ports) {

    chai.assert.isUndefined(err, util.inspect(err));
    chai.assert.isDefined(ports, 'ports is not defined');

    if (ports.length > 0 && portName == ports.slice(-1)[0].comName) {
      openPort(portName);
    } else {
      console.log('Port ' + portName + ' not found, retrying...');
    }

  });
};

serialPort.list(function(err, ports) {

  chai.assert.isUndefined(err, util.inspect(err));
  chai.assert.isDefined(ports, 'ports is not defined');
  chai.assert.isTrue(ports.length > 0, 'no ports found');

  var portName = ports.slice(-1)[0].comName;

  openPort(portName);
});