//We need to import the main project because it contains
//objects that we require here as well. We also
//need the FileSystem library to work with files.
var a1 = require('./a1_main.js');
var fs = require('fs');

//EXTRA
//We'll be constantly logging the ACCEL data into this file.
//For this to work properly on any PC, the file pathway should be changed
//(probably along with the name as well). The flag {'a'} signals that we
//want to append to this file, meaning we just add to the file.

//Create object and assign file location which we'll be writing to.
fileToWriteAccel = fs.createWriteStream('/home/kemal/Documents/SKLADISTE_MINT/FAKS/TU_DUBLIN/IoT/asgn2/measurements/accel.txt', {flags: 'a'});

//Create callback executed after writing to file.
function accelWriteCallback(error){
  if (error){
    console.log('Error while writing to the accel.txt file!');
  }
}

//Defines frequency of refreshing the sensor readings, given in milliseconds.
var accelRefreshPeriod = 10000; //in milliseconds.

//The callback which was binded to the discoverCharacteristics event in line 155 of
//the main code. Here we read the characteristics and bind them to their respective callback functions.
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

//We should denote that a different/separate function is required for
//all the X,Y,Z characteristics. This is exactly because they are
//characteristics, which means they aren't synchronized nor read, nor
//updated at the same time. Using one callback method might result
//in one of the values not being up-to-date compared to the others.

//Once the timer runs out (specified value of accelRefreshPeriod)
//this function shall be called. From it, we read the data of the characteristic.
function accelIntervalCallbackX(charToRead){
  charToRead.read(accelReadDataX);
}

//The 2nd argument in this callback function contains the read data of the X-coordinate
//from the accelerometer. We now publish the data to the desired kemalA/accel topic,
//and log it into the previously determined file.
function accelReadDataX(error, data){
  if (error){
    console.log("Error reading the data!");
  }
  else{ 
    var time = new Date();
    //IMPORTANT THE VALUE IS IN HEXADECIMAL.
    messageToPublish = "" + time.getDate() + "/" + (time.getMonth()+1) + "/" + time.getFullYear() + "/" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + ",  X = " + data.toString('hex');
    a1.mqttClient.publish("kemalA/accel", messageToPublish);
    console.log("Accel, " +  messageToPublish);
    fileToWriteAccel.write(messageToPublish+'\n', accelWriteCallback);
  }
}

//Same procedure for the Y coordinate

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
    messageToPublish = "" + time.getDate() + "/" + (time.getMonth()+1) + "/" + time.getFullYear() + "/" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + ",  Y = " + data.toString('hex');
    a1.mqttClient.publish("kemalA/accel", messageToPublish);
    console.log("Accel, " +  messageToPublish);
    fileToWriteAccel.write(messageToPublish+'\n', accelWriteCallback);
  }
}

//same procedure for the Z coordinate.

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
    messageToPublish = "" + time.getDate() + "/" + (time.getMonth()+1) + "/" + time.getFullYear() + "/" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + ",  Z = " + data.toString('hex');
    a1.mqttClient.publish("kemalA/accel", messageToPublish);
    console.log("Accel, " +  messageToPublish);
    fileToWriteAccel.write(messageToPublish+'\n', accelWriteCallback);
  }
}

//We only need to export our "main" callback (accelCallback) to our a1_main.js file.
//The other methods are all called from accelCallback, and thus are within its scope
//so there is no need to export them.
exports.accelCallback = accelCallback