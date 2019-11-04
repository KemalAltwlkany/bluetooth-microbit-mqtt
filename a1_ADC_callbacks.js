//We need to import the main project because it contains
//the mqttClient object, as well as the noble object
var a1 = require('./a1_main.js');
var fs = require('fs');

var ADCRefreshPeriod = 5000; //in seconds

var publishToADC;
fileToWriteADC = fs.createWriteStream('/home/kemal/Documents/SKLADISTE_MINT/FAKS/TU_DUBLIN/IoT/asgn2/measurements/adc.txt', {flags: 'a'});

function setPublishing(){
  publishToADC = 1;
}

function resetPublishing(){
  publishToADC = 0;
}

//Callback once a characteristic has been discovered (and the event raised).
function ADCCallback(error, characteristics) {
  if (error) {
    console.log("Error discovering ADC characteristics!");
  }
  else {
    console.log('Successfully discovered characteristics of ADC service!');
    for (var i in characteristics) {
     	console.log('  ' + i + ' uuid: ' + characteristics[i].uuid);
     	setInterval(ADCIntervalCallback, ADCRefreshPeriod, characteristics[i]);
      }
  }
}

function ADCIntervalCallback(charToRead){
	charToRead.read(ADCReadData);
}

function adcWriteTxtCallback(error){
  if (error){
    console.log('Error while writing to the adc.txt file!');
  }
}

function ADCReadData(error, data){
  if (error){
    console.log("Error reading the data!");
  }
  else{ 
    var time = new Date();
    //IMPORTANT THE VALUE IS IN HEXADECIMAL.
    //console.log("Value of serv=" + service_uuid + ", char=" + characteristic_uuid + " at: " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + " is : " + data.toString('hex'));
    messageToPublish = "" + time.getDate() + "/" + (time.getMonth()+1) + "/" + time.getFullYear() + "/" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()  + ",  Dig.Val. = " + data.toString('hex');
    if (publishToADC == 1){
      a1.mqttClient.publish("kemalA/ADC", messageToPublish);
    }
    fileToWriteADC.write(messageToPublish+'\n', adcWriteTxtCallback);
    console.log("ADC, " +  messageToPublish);
  }
  resetPublishing();	
}

//We only need the "main" callback in our main.js file
//From the ADCCallback function all other methods from this file are called
//and are therefore within scope
exports.ADCCallback = ADCCallback
exports.setPublishing = setPublishing