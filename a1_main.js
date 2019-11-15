//Requirred libraries and files

//Noble and information regarding GATT
var noble = require('noble'); //import noble library
var device_uuid = 'dcef302a7deb'; //MAC address of device to look for
var servicesUUIDs = ['a000', 'b000', 'c000', 'd000', 'e000']; //services which we are interested in
//we get the info from the UUID from the code uploaded to the microbit (there we determined the uuid's).
//since this is a standalone project, we don't need to worry about potential clashes with predefined UUIDs.



//MQTT and information regarding the publish and subscribe topics
var mqtt = require('mqtt');
var listeningTopics = ["kemalA/LEDcloud", "kemalA/ADC"]; //topics we will subscribe to
var talkingTopics = ["kemalA/accel", "kemalA/mag", "kemalA/ADC", "kemalA/LEDbutton"]; //topics we will publish to
var mqttClient  = mqtt.connect('mqtt://broker.mqttdashboard.com'); //broker


var intervalTime = 5000; //needed for defining publishing frequency

//My personal modules, for increasing code readabillity
//These must be in the same folder as the main code.
var a1_accel = require('./a1_accel_callbacks.js'); 
var a1_mag = require('./a1_mag_callbacks.js');
var a1_ADC = require('./a1_ADC_callbacks.js');
var a1_button = require('./a1_button_callbacks.js');
var a1_cloud = require('./a1_cloud_service.js');

noble.on('stateChange', stateChangeHandler); //bind the callback function to a 'stateChange' event
noble.on('discover', discoverDeviceHandler); //bind the callback function to a 'discover' event

mqttClient.on('connect', MQTTconnectCallback); //bind the callback function to a 'connect' event

var peripheralGlobal;

//The connect callback. Executed after a connection has been established via MQTT broker.
//The function subscribes our mqttClient object to all topics of interest.
function MQTTconnectCallback() {
	for (var i in listeningTopics){
		mqttClient.subscribe(listeningTopics[i]);
	}
}

mqttClient.on('message', messageHandler); //bind the callback function to a 'message' event

//The callback function which is executed whenever a message is received.
//Within it, we distinct messages from different topics.
function messageHandler(topic, message, packet) { 
    console.log("Received message'" + message + "' on topic '" + topic + "'");
    //message received on kemalA/LEDcloud topic
    if ( topic == 'kemalA/LEDcloud' ){
    	console.log('')
    	if ( (message == '1') &&  (a1_cloud.currState == 0) ){
    			a1_cloud.currState = 1;
    			a1_cloud.writeDataToLEDCloud(1);
    	}
    	else if ( (message == '0') &&  (a1_cloud.currState == 1) ){
    		a1_cloud.currState = 0;
    		a1_cloud.writeDataToLEDCloud(message);    		
    	}
    }
    //message received on kemalA/ADC topic
    else if ( (topic == 'kemalA/ADC') && (message == 'read') ){
    	console.log('Received ADC request. Will perform ADC!');
    	a1_ADC.setPublishing();
    }
}


//This function is called on start automatically. It will turn on the BL device
//and begin scanning for peripherals.
function stateChangeHandler(state) {
  if (state === 'poweredOn') {
    console.log("Started scanning for devices.");  
    noble.startScanning();
  } else {
    console.log("Stopped scanning for devices.");  
    noble.stopScanning();
	process.exit(0);
  }
}


//This function is called whenever a device has been discovered, using the
//noble.startScanning(). The peripheral object which was just found is passed as an argument.
//We are only interested in one particular peripheral, which is named
//'JAMIE VARDY'. Other devices are not of our interest. Therefore, we shall not display
//that they were found, nor any data related to them.
function discoverDeviceHandler(peripheral) {
	//compare uuid of found device to device of interest, if we have a match
	//proceed to connect to the device	
  if (peripheral.uuid == device_uuid){
    console.log('Found peripheral device with following GATT:');
    console.log('    uuid: ' + peripheral.uuid);
    console.log('    local name: ' + peripheral.advertisement.localName);
    console.log('    advertising service(s) with uuid(s) ' + peripheral.advertisement.serviceUuids); 
    console.log('Now attempting to connect to the peripheral.');
    
    //We now bind the connectCallback function to the event raised by noble after
    //it attempts to connect with the peripheral of interest.
    peripheral.connect(connectCallback);
    //We assign a reference of global scope to our peripheral device.
    peripheralGlobal = peripheral;
  }
}


//Parameter error will tell us whether the connection was successful or not.
//If not, we signal it, if it was a successful connection we proceed to read
//the services of interest.
function connectCallback(error) {
  if (error) {
    console.log("Error connecting to peripheral!");
  } else {    
    console.log('Successfully connected to peripheral device: ' + peripheralGlobal.uuid  + "   " + peripheralGlobal.advertisement.localName);

    //We proceed to read the services of a device by binding the function which does it
    //to the discoverServicesCallback.
    //The first optional argument ([] by default) includes all UUID's of services
    //of interest. If left empty, it will discover all services.
    //We already declared an array of services we are interested in, so we pass it as an argument.
    peripheralGlobal.discoverServices(servicesUUIDs, discoverServicesCallback);
  }
}


//This callback function is called when the services have been discovered.
//From this function we read all the services the device has to offer.
//It should match the length of our servicesUUIDs variable (array), if not
//that means that it did not discover the same amount of services which we
//are interested in.
function discoverServicesCallback(error, services) {
  //Error - we didn't read the services correctly.
  if (error) {
    console.log("Error discovering services!");
  }
  else {
    //Read services match our optional argument passed, servicesUUIDs
    if (servicesUUIDs.length == services.length){  
      console.log('Discovered all services we were interested in!');
    }
    else{
      console.log('Did NOT discover all services we were interested in!');
    } 
    
    console.log("Device advertises the following services");
    //For every service, we write a different callback method because we want our
    //microbit to respond differently, dependent on the service.
    //From some services we read data, to others we write data, and all is done in a
    //different way. Therefore, a different method for every service.
    for (var i in services) {
      console.log('  ' + i + ' uuid: ' + services[i].uuid);
      if ( services[i].uuid == 'a000'){
      	//console.log('Discovering accelerometer');
      	services[i].discoverCharacteristics([], a1_accel.accelCallback); //bind discoverServ event to callback
      }
      else if ( services[i].uuid == 'b000'){
      	//console.log('In the magnetometer');
      	services[i].discoverCharacteristics([], a1_mag.magCallback); //bind discoverServ event to callback

      }
      else if ( services[i].uuid == 'c000'){
      	//console.log('In the ADC converter');
      	services[i].discoverCharacteristics([], a1_ADC.ADCCallback); //bind discoverServ event to callback

      }
      else if ( services[i].uuid == 'd000'){
      	//console.log('In the button service.');
      	services[i].discoverCharacteristics([], a1_button.buttonCallback); //bind discoverServ event to callback
      }
      else if ( services[i].uuid == 'e000'){
      	//console.log('In the LED cloud service');
      	services[i].discoverCharacteristics([], a1_cloud.cloudCallback); //bind the discoverServ event to the callback
      }
      //We didn't need to check whether this was our service of interest, BECAUSE
      //we had already setup the discoverServices function to only look for our
      //services of interest (we passed them as an argument).
    }  
  }
}

//variables/functions exported and available to other files.
exports.mqttClient = mqttClient;
exports.intervalTime = intervalTime;