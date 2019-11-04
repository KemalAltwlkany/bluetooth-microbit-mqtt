//We need to import the main project because it contains
//the mqttClient object, as well as the noble object
var a1 = require('./a1_main.js');

var accelRefreshPeriod = 5000; //in seconds

//Callback once a characteristic has been discovered (and the event raised).
function accelCallback(error, characteristics) {
  if (error) {
    console.log("Error discovering ACCEL characteristics!");
  }
  else {
    console.log('Successfully discovered characteristics of ACCEL service!');
    //Depending on the UUID of the characteristic, we distinguish X,Y,Z coordinates
    for (var i in characteristics) {
     	console.log('  ' + i + ' uuid: ' + characteristics[i].uuid);
      if (characteristics[i].uuid == 'a001'){
        //bind to x-coordinate publisher
        setInterval(accelIntervalCallbackX, accelRefreshPeriod, characteristics[i]);
      }
      else if (characteristics[i].uuid == 'a002'){
        //bind to y-coordinate publisher
        setInterval(accelIntervalCallbackY, accelRefreshPeriod, characteristics[i]);
      }
      else if (characteristics[i].uuid == 'a003'){
		//bind to z-coordinate publisher
        setInterval(accelIntervalCallbackZ, accelRefreshPeriod, characteristics[i]);
      }
      }
  }
}

function accelIntervalCallbackX(charToRead){
  charToRead.read(accelReadDataX);
}

function accelReadDataX(error, data){
  if (error){
    console.log("Error reading the data!");
  }
  else{ 
    var time = new Date();

    //IMPORTANT THE VALUE IS IN HEXADECIMAL.
    //console.log("Value of serv=" + service_uuid + ", char=" + characteristic_uuid + " at: " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + " is : " + data.toString('hex'));
    messageToPublish = "" + time.getDate() + "/" + (time.getMonth()+1) + "/" + time.getFullYear() + "/" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + ",  X = " + data.toString('hex');
    a1.mqttClient.publish("kemalA/accel", messageToPublish);
    console.log("Accel, " +  messageToPublish);
  }
}

function accelIntervalCallbackY(charToRead){
  charToRead.read(accelReadDataY);
}

function accelReadDataY(error, data){
  if (error){
    console.log("Error reading the data!");
  }
  else{ 
    var time = new Date();

    //IMPORTANT THE VALUE IS IN HEXADECIMAL.
    //console.log("Value of serv=" + service_uuid + ", char=" + characteristic_uuid + " at: " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + " is : " + data.toString('hex'));
    messageToPublish = "" + time.getDate() + "/" + time.getMonth() + "/" + time.getFullYear() + "/" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + ",  Y = " + data.toString('hex');
    a1.mqttClient.publish("kemalA/accel", messageToPublish);
    console.log("Accel, " +  messageToPublish);
  }
}


function accelIntervalCallbackZ(charToRead){
  charToRead.read(accelReadDataZ);
}

function accelReadDataZ(error, data){
  if (error){
    console.log("Error reading the data!");
  }
  else{ 
    var time = new Date();

    //IMPORTANT THE VALUE IS IN HEXADECIMAL.
    //console.log("Value of serv=" + service_uuid + ", char=" + characteristic_uuid + " at: " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + " is : " + data.toString('hex'));
    messageToPublish = "" + time.getDate() + "/" + time.getMonth() + "/" + time.getFullYear() + "/" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + ",  Z = " + data.toString('hex');
    a1.mqttClient.publish("kemalA/accel", messageToPublish);
    console.log("Accel, " +  messageToPublish);
  }
}

//We only need the "main" callback in our main.js file
//From the accelCallback function all other methods from this file are called
//and are therefore within scope
exports.accelCallback = accelCallback