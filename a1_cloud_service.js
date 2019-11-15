//We need to import the main project because it contains
//objects that we require here as well.
var a1 = require('./a1_main.js');

//Defines frequency of refreshing the sensor readings, given in milliseconds.
//var buttonRefreshPeriod = 5000; //in seconds

//We create a reference of global scope to the LED characteristic.
//This is because we won't be using a periodic callback, instead,
//the LED is either turned ON/OFF as soon as possible. The indicator
//whether to turn it ON/OFF is sent via the kemalA/LEDcloud topic.
var ledcloudWriteChar;

//Variable which remembers the current state of the LED, which is initially OFF.
var currState = 0;

//The callback which was binded to the discoverCharacteristics event in line 173 of
//the main code. Here we read the characteristics and assign the global scoped reference
//to the characteristic. This way, we are able to change it whenever the user prompts to.
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

//This function directly writes the value of the 'message' argument to the ledcloudWriteChar
//The ledcloudWiteChar variable is just a global reference to the characteristic refering to the
//state of our LED. In other words, we are basically just writing to our LED characteristic.
//We also assign a writeDataCallback to the event of doing so.
function writeDataToLEDCloud(message){
    ledcloudWriteChar.write(new Buffer([0+message]), false, writeDataCallback);
}

//Callback executed after attempting to write to characteristic. In case it succeeds, no error
//is generated.
function writeDataCallback(error, data){
  if (error){
    console.log('Error while writin the data');
  }
}

//Unlike other codes, here we export three variables/functions
//The first being the "main" callback method, from which most of the code within
//this scope is called. Therefore, we don't need to export that code, as the main
//cloudCallback method sees it.
//The second method exported is the writeDataToLEDcloud method, whish we require
//in our main code, because unlike the other examples here we alter the value of
//the characteristic ASAP (after receiving a user-request that is).
//In order to monitor the current state of the LED, we also export the currState
//variable. It eases out controlling the LED, as the user might by accident
//signal a turn ON request, while the LED is still turned ON. Such requests shall
//be ignored, thanks to this variable.
exports.cloudCallback = cloudCallback;
exports.writeDataToLEDCloud = writeDataToLEDCloud;
exports.currState = currState;