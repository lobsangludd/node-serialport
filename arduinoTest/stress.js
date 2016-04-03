'use strict';

var assert = require('chai').assert;
var util = require('util');
var serialPort = require('../serialport');
require('colors'); // this modifies String.prototype
// var fs = require('fs');
var memwatch = require('memwatch-next');

describe('the stress', function() {
  var testPort = process.env.TEST_PORT;

  if (!testPort) {
    it('cannot be tested as we have no test ports');
    return;
  }

  describe('of 2 minutes of running 1k writes', function() {
    it("doesn't leak memory", function (done) {
      var data = new Buffer(1024).fill('!');
      var hd = new memwatch.HeapDiff();
      var port = new serialPort.SerialPort(testPort, {}, false);
      port.on('close', done);

      memwatch.on('leak', function(info) {
        // fs.appendFile('leak.log', util.inspect(info));
        console.log(util.inspect(info, {depth: 5}).red);

        var diff = hd.end();
        // fs.appendFile('heapdiff.log', util.inspect(diff, {depth: 5}));
        console.log(util.inspect(diff, {depth: 5}).red);
        assert.fail('leak detected');
        port.close();
      });

      // memwatch.on('stats', function (stats) {
      //   fs.appendFile('stats.log', util.inspect(stats));
      // });
      port.on('error', function(err) {
        assert.fail(util.inspect(err));
        done();
      });

      port.on('data', function () {});

      var writing = true;
      var write = function() {
        if (!writing) { return }
        port.write(data, write);
      };

      port.open(function(err) {
        assert.isUndefined(err);
        write();

        setTimeout(function() {
          // var diff = hd.end();
          // fs.appendFile('heapdiff.log', util.inspect(diff));
          // console.log(util.inspect(diff, {depth: 5}).blue);
          writing = false;
          port.close();
        }, 1000 * 60 * 2);
      });
    });
  });

  // describe('of opening and closing ports', function() {
  //   it("doesn't leak memory", function(done) {
  //     var hd = new memwatch.HeapDiff();
  //     var port = new serialPort.SerialPort(testPort, {}, false);

  //     memwatch.on('leak', function(info) {
  //       // fs.appendFile('leak.log', util.inspect(info));
  //       console.log(util.inspect(info, {depth: 5}).red);

  //       var diff = hd.end();
  //       // fs.appendFile('heapdiff.log', util.inspect(diff, {depth: 5}));
  //       console.log(util.inspect(diff, {depth: 5}).red);
  //       assert.fail('leak detected');
  //       port.close();
  //     });

  //     var open, close;
  //     open = function() {
  //       process.nextTick(function() {
  //         port.open(close);
  //       });
  //     };

  //     var looping = true;
  //     close = function() {
  //       if (looping) {
  //         process.nextTick(function() {
  //           port.close(open);
  //         });
  //       } else {
  //         port.close();
  //       }
  //     };
  //     setTimeout(function() {
  //       looping = false;
  //       port.on('close', done);
  //     }, 1000 * 10);

  //     open();
  //   });
  // });
});
