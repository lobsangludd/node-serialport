#!/usr/bin/env node

/*
serialDuplexTest.js

Tests the functionality of the serial port library.
To be used in conjunction with the Arduino sketch ArduinoEcho.ino
*/
'use strict';
var SerialPort = require('../serialport').SerialPort;
var optimist = require('optimist');

var args = optimist
  .alias('h', 'help')
  .alias('h', '?')
  .usage('Run printable characters through the serial port\n Usage: $0')
  .options('p', {
    describe: 'Name of serial port. See serialportlist for available serial ports.'
  })
  .demand(['p'])
  .argv;

if (args.help) {
  optimist.showHelp();
  return process.exit(0);
}

var port = new SerialPort(args.p);          // open the serial port:
var output = 32;                                // ASCII space; lowest printable character
var byteCount = 0;                              // number of bytes read

function openPort() {
  console.log('port open');
  console.log('baud rate: ' + port.options.baudRate);
  var outString = String.fromCharCode(output);
  console.log('String is: ' + outString);
  port.write(outString);
}

function receiveData(data) {
  if (output <= 126) {        // highest printable character: ASCII ~
    output++;
  } else {
    output = 32;              // lowest printable character: space
  }
  console.log('received: ' + data);
  console.log('Byte count: ' + byteCount);
  byteCount++;
  var outString = String.fromCharCode(output);
  port.write(outString);
  console.log('Sent: ' + outString);
}

function closePort() {
  console.log('port closed');
}

function serialError(error) {
  console.log('there was an error with the serial port: ' + error);
}

port.on('open', openPort);      // called when the serial port opens
port.on('data', receiveData);    // called when data comes in
port.on('close', closePort);    // called when the serial port closes
port.on('error', serialError);  // called when there's an error with the serial port
