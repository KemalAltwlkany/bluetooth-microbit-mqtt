//We need to import the main project because it contains
//objects that we require here as well. We also
//need the FileSystem library to work with files.
var a1 = require('./a1_main.js');
var fs = require('fs');

//Defines frequency of refreshing the sensor readings, given in milliseconds.
var ADCRefreshPeriod = 10000; //in seconds

//We create a "helper/trigger" variable which will indicate whether to user would like to publish
//the read value from the sensor (the ADC) to the online kemalA/ADC topic or not.
var publishToADC;


//EXTRA
//We'll be constantly logging the ADC data into this file.
//For this to work properly on any PC, the file pathway should be changed
//(probably along with the name as well). The flag {'a'} signals that we
//want to append to this file, meaning we just add to the file.

//Create object and assign file location which we'll be writing to.
fileToWriteADC = fs.createWriteStream('/home/kemal/Documents/SKLADISTE_MINT/FAKS/TU_DUBLIN/IoT/asgn2/measurements/adc.txt', {flags: 'a'});


//Callback called after an attempt to write to the specified file (where we log the data)
function adcWriteTxtCallback(error){
  if (error){
    console.log('Error while writing to the adc.txt file!');
  }
}

//Set the value of the trigger variable
function setPublishing(){
  publishToADC = 1;
}

//Reset the value of the trigger variable
function resetPublishing(){
  publishToADC = 0;
}


//The callback which was binded to the discoverCharacteristics event in line 164 of
//the main code. Here we read the characteristics and bind them to their respective callback functions.
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

//Once the timer runs out (specified value of ADCRefreshPeriod)
//this function shall be called. From it, we read the data of the characteristic.
function ADCIntervalCallback(charToRead){
	charToRead.read(ADCReadData);
}

//The 2nd argument in this callback function contains the read data which is in hexadecimal
//form, and represents the result of a just performed ADC.We now log the data into the
//previously determined file. Whether it shall be publish to the cloud or not, depends
//on whether the user request a publishing or not. If she/he did, it will be published.
//The variable containing that information is "publishToADC"
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

//We only need to export two functions. The "main" ADCCallback function,
//from which most of the other methods are called, so they are within its scope.
//The second function which we export is the setPublishing method. The reason is simple,
//it needs to be connected to the main code, so that it can set the variable of this
//code fragment (publishToADC) if the user requests a publishing to the ADC topic.
exports.ADCCallback = ADCCallback
exports.setPublishing = setPublishing