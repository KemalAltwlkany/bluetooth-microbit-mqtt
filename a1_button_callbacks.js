//We need to import the main project because it contains
//the mqttClient object, as well as the noble object
var a1 = require('./a1_main.js');

var buttonRefreshPeriod = 5000; //in seconds

//Callback once a characteristic has been discovered (and the event raised).
function buttonCallback(error, characteristics) {
  if (error) {
    console.log("Error discovering ADC characteristics!");
  }
  else {
    console.log('Successfully discovered characteristics of Button service!');
    for (var i in characteristics) {
     	console.log('  ' + i + ' uuid: ' + characteristics[i].uuid);
     	setInterval(buttonIntervalCallback, buttonRefreshPeriod, characteristic[i]);
      }
  }
}

function buttonIntervalCallback(charToRead){
	charToRead.read(buttonReadData);
}

function buttonReadData(error, data){
  if (error){
    console.log("Error reading the data!");
  }
  else{ 
    var time = new Date();

    //IMPORTANT THE VALUE IS IN HEXADECIMAL.
    //console.log("Value of serv=" + service_uuid + ", char=" + characteristic_uuid + " at: " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + " is : " + data.toString('hex'));
    messageToPublish = "" + time.getDate() + "/" + time.getMonth() + "/" + time.getFullYear() + "/" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + ",  LED is = " + data.toString('hex');
    a1.mqttClient.publish("kemalA/button", messageToPublish);
    console.log("Button, " +  messageToPublish);
  }	
}

//We only need the "main" callback in our main.js file
//From the buttonCallback function all other methods from this file are called
//and are therefore within scope
exports.buttonCallback = buttonCallback