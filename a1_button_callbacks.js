//We need to import the main project because it contains
//the mqttClient object, as well as the noble object
var a1 = require('./a1_main.js');

var buttonRefreshPeriod = 5000; //in seconds

//Callback once a characteristic has been discovered (and the event raised).
function buttonCallback(error, characteristics) {
  if (error) {
    console.log("Error discovering Button characteristics!");
  }
  else {
    console.log('Successfully discovered characteristics of Button service!');
    for (var i in characteristics) {
     	console.log('  ' + i + ' uuid: ' + characteristics[i].uuid);
     	characteristics[i].subscribe(buttonSubscriberCallback);  //bind subscription event to callback
      characteristics[i].on('data', buttonDataCallback); //bind data change event to callback
      }
  }
}

//Callback regarding the subscription event
function buttonSubscriberCallback(error){
  if(error){
    console.log('Error Subscribing to characteristics of button service');
  } else{ 
    console.log('Notifications Enabled');
  }
}

//Callback for whenever data has been read, from the button service
function buttonDataCallback(data, isNotification){
  var time = new Date();
  var x;
  if (data.toString('hex')=='01'){
    x = 'ON';
  }
  else{
    x ='OFF';
  }
  //IMPORTANT THE VALUE IS IN HEXADECIMAL.
  //console.log("Value of serv=" + service_uuid + ", char=" + characteristic_uuid + " at: " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + " is : " + data.toString('hex'));
  messageToPublish = "" + time.getDate() + "/" + (time.getMonth()+1) + "/" + time.getFullYear() + "/" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + ",  LEDbutton STATE = " + x;
  a1.mqttClient.publish("kemalA/LEDbutton", messageToPublish);
  console.log("LEDbutton state: " +  messageToPublish);  
}


//We only need the "main" callback in our main.js file
//From the buttonCallback function all other methods from this file are called
//and are therefore within scope
exports.buttonCallback = buttonCallback