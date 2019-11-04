//We need to import the main project because it contains
//the mqttClient object, as well as the noble object
var a1 = require('./a1_main.js');
var fs = require('fs');

fileToWriteMag = fs.createWriteStream('/home/kemal/Documents/SKLADISTE_MINT/FAKS/TU_DUBLIN/IoT/asgn2/measurements/mag.txt', {flags: 'a'});


var magRefreshPeriod = 5000; //in seconds.


function magWriteCallback(error){
  if (error){
    console.log('Error while writing to the mag.txt file!');
  }
}

//Callback once a characteristic has been discovered (and the event raised).
function magCallback(error, characteristics) {
  if (error) {
    console.log("Error discovering MAG characteristics!");
  }
  else {
    console.log('Successfully discovered characteristics of MAG service!');
    //Depending on the UUID of the characteristic, we distinguish X,Y,Z coordinates
    for (var i in characteristics) {
     	console.log('  ' + i + ' uuid: ' + characteristics[i].uuid);
      if (characteristics[i].uuid == 'b001'){
        //bind to x-coordinate publisher
        setInterval(magIntervalCallbackX, magRefreshPeriod, characteristics[i]);
      }
      else if (characteristics[i].uuid == 'b002'){
        //bind to y-coordinate publisher
        setInterval(magIntervalCallbackY, magRefreshPeriod, characteristics[i]);
      }
      else if (characteristics[i].uuid == 'b003'){
		//bind to z-coordinate publisher
        setInterval(magIntervalCallbackZ, magRefreshPeriod, characteristics[i]);
      }
      }
  }
}

function magIntervalCallbackX(charToRead){
  charToRead.read(magReadDataX);
}

function magReadDataX(error, data){
  if (error){
    console.log("Error reading the data!");
  }
  else{ 
    var time = new Date();

    //IMPORTANT THE VALUE IS IN HEXADECIMAL.
    //console.log("Value of serv=" + service_uuid + ", char=" + characteristic_uuid + " at: " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + " is : " + data.toString('hex'));
    messageToPublish = "" + time.getDate() + "/" + (time.getMonth()+1) + "/" + time.getFullYear() + "/" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + ",  X = " + data.toString('hex');
    a1.mqttClient.publish("kemalA/mag", messageToPublish);
    console.log("MAG, " +  messageToPublish);
    fileToWriteMag.write(messageToPublish+'\n', magWriteCallback);
  }
}

function magIntervalCallbackY(charToRead){
  charToRead.read(magReadDataY);
}

function magReadDataY(error, data){
  if (error){
    console.log("Error reading the data!");
  }
  else{ 
    var time = new Date();

    //IMPORTANT THE VALUE IS IN HEXADECIMAL.
    //console.log("Value of serv=" + service_uuid + ", char=" + characteristic_uuid + " at: " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + " is : " + data.toString('hex'));
    messageToPublish = "" + time.getDate() + "/" + time.getMonth() + "/" + time.getFullYear() + "/" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + ",  Y = " + data.toString('hex');
    a1.mqttClient.publish("kemalA/mag", messageToPublish);
    console.log("MAG, " +  messageToPublish);
    fileToWriteMag.write(messageToPublish+'\n', magWriteCallback);
  }
}

function magIntervalCallbackZ(charToRead){
  charToRead.read(magReadDataZ);
}

function magReadDataZ(error, data){
  if (error){
    console.log("Error reading the data!");
  }
  else{ 
    var time = new Date();

    //IMPORTANT THE VALUE IS IN HEXADECIMAL.
    //console.log("Value of serv=" + service_uuid + ", char=" + characteristic_uuid + " at: " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + " is : " + data.toString('hex'));
    messageToPublish = "" + time.getDate() + "/" + time.getMonth() + "/" + time.getFullYear() + "/" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + ",  Z = " + data.toString('hex');
    a1.mqttClient.publish("kemalA/mag", messageToPublish);
    console.log("MAG, " +  messageToPublish);
    fileToWriteMag.write(messageToPublish+'\n', magWriteCallback);
  }
}

//We only need the "main" callback in our main.js file
//From the magCallback function all other methods from this file are called
//and are therefore within scope
exports.magCallback = magCallback