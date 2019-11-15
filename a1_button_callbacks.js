//We need to import the main project because it contains
//objects that we require here as well.
var a1 = require('./a1_main.js');

//The callback which was binded to the discoverCharacteristics event in line 168 of
//the main code. Here we read the characteristics and bind them to their respective callback functions.
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

//Callback regarding the subscription event. Should only be called once,
//after an attempt of subscribing to the defined characteristic. What this enables us to do
//is get information only about the changes of state which might occur. Whenever our characteristic
//changes its value, the buttonDataCallback shall be executed.
function buttonSubscriberCallback(error){
  if(error){
    console.log('Error Subscribing to characteristics of button service');
  } else{ 
    console.log('Notifications Enabled');
  }
}

//Callback for whenever data has been read, from the button service.
//We notify/print that the button's state has been changed, and instead of 0's and 1's
//we print whether it is ON or OFF. We also publish this data to the kemalA/LEDbutton topic.
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
  messageToPublish = "" + time.getDate() + "/" + (time.getMonth()+1) + "/" + time.getFullYear() + "/" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + ",  LEDbutton STATE = " + x;
  a1.mqttClient.publish("kemalA/LEDbutton", messageToPublish);
  console.log("LEDbutton state: " +  messageToPublish);  
}


//We only need to export our "main" callback (buttonCallback) to our a1_main.js file.
//The other methods are all called from buttonCallback, and thus are within its scope
//so there is no need to export them.
exports.buttonCallback = buttonCallback