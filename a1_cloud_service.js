//We need to import the main project because it contains
//the mqttClient object, as well as the noble object
var a1 = require('./a1_main.js');

var buttonRefreshPeriod = 5000; //in seconds

var ledcloudWriteChar;

var currState = 0;

//Callback once a characteristic has been discovered (and the event raised).
function cloudCallback(error, characteristics) {
  if (error) {
    console.log("Error discovering LED cloud characteristics!");
  }
  else {
    console.log('Successfully discovered characteristics of LED cloud service!');
    for (var i in characteristics) {
     	console.log('  ' + i + ' uuid: ' + characteristics[i].uuid);
     	ledcloudWriteChar = characteristics[i];
      console.log('Binded characteristic ' + characteristics[i].uuid +  ' to outputData');
      }
  }
}

function writeDataToLEDCloud(message){
    ledcloudWriteChar.write(new Buffer([0+message]), false, writeDataCallback);
}

function writeDataCallback(error, data){
  if (error){
    console.log('Error while writin the data');
  }
}

//We only need the "main" callback in our main.js file
//From the buttonCallback function all other methods from this file are called
//and are therefore within scope
exports.cloudCallback = cloudCallback;
exports.writeDataToLEDCloud = writeDataToLEDCloud;
exports.currState = currState;