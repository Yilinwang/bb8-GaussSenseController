var northPoint = null;
var southPoint = null;
var bipolarMidpoint = null;

var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();

client.on('connect', function(connection) {
    console.log('webserver connected');
    connection.on('message', function(msg) {
        var msgobj = JSON.parse(msg.utf8Data);
        northPoint = msgobj['northPoint'];
        southPoint = msgobj['southPoint'];
        bipolarMidpoint = msgobj['bipolarMidpoint'];
    });
});

client.connect('ws://localhost:5100/', 'echo-protocol');

var sphero = require("sphero");
var bb8 = sphero("5e03f581ba624f7c963dbd7422045c62");

bb8.connect(function() {
    console.log('bb8 connected');
    var cali = true;
    var zerop = 0;
    bb8.color("000000");
    bb8.setBackLed(255, null);
    bb8.setStabilization(1);

    setInterval(function() {
        if(bipolarMidpoint != null) {
            var tmp = bipolarMidpoint;
            var dir = (Math.floor(tmp.angle*(180/Math.PI))+360+90+zerop)%360;
            var vol = Math.abs(tmp.pitch)*3;

            if(cali) {
                bb8.roll(0, dir);
                if(tmp.pitch < -30) {
                    zerop = dir;
                    cali = false;
                    bb8.setBackLed(0, null);
                }
            }
            else {
                if(tmp.pitch > 10) {
                    bb8.roll(vol, dir);
                    bb8.color("00FF00");
                }
                else {
                    bb8.roll(0, dir);
                    bb8.color("FF0000");
                }
            }
        }
    }, 200);
});
