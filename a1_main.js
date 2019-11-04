//PREREQUISITES

//Noble and information regarding GATT
var noble = require('noble'); //import noble library
var device_uuid = 'dcef302a7deb'; //MAC address of device to look for
var servicesUUIDs = ['a000', 'b000', 'c000', 'd000', 'e000']; //services which we are interested in



//MQTT and information regarding the publish and subscribe topics
var mqtt = require('mqtt');
var listeningTopics = ["kemalA/LEDcloud", "kemalA/ADC"]; //topics we will subscribe to
var talkingTopics = ["kemalA/accel", "kemalA/mag", "kemalA/ADC", "kemalA/LEDbutton"]; //topics we will listen to
var mqttClient  = mqtt.connect('mqtt://broker.mqttdashboard.com'); //broker


var intervalTime = 5000; //needed for defining publishing frequency
//My personal modules, for increasing code readabillity
var a1_accel = require('./a1_accel_callbacks.js'); 
var a1_mag = require('./a1_mag_callbacks.js');
var a1_ADC = require('./a1_ADC_callbacks.js');
var a1_button = require('./a1_button_callbacks.js');
var a1_cloud = require('./a1_cloud_service.js');


noble.on('stateChange', stateChangeHandler); //bind callback function to a 'stateChange' event
noble.on('discover', discoverDeviceHandler); //bind callback function to a 'discover' event
mqttClient.on('connect', MQTTconnectCallback); //bind callback function to a 'connect' event

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
function messageHandler(topic, message, packet) { 
    console.log("Received message'" + message + "' on topic '" + topic + "'");
    if ( topic == 'kemalA/LEDcloud' ){
    	if ( (message == '1') &&  (a1_cloud.currState == 0) ){
    			a1_cloud.currState = 1;
    			a1_cloud.writeDataToLEDCloud(1);
    	}
    	else if ( (message == '0') &&  (a1_cloud.currState == 1) ){
    		a1_cloud.currState = 0;
    		a1_cloud.writeDataToLEDCloud(message);    		
    	}
    }
    else if ( (topic == 'kemalA/ADC') && (message == 'read') ){
    	console.log('Entered this crap!');
    	a1_ADC.setPublishing();
    }
}


//This function is called on start automatically. It will turn on the BL device
//and begin scanning for peripherals.
function stateChangeHandler(state) { //event handler callback function
  if (state === 'poweredOn') {
    console.log("Started the device scanning.");  
    noble.startScanning();
  } else {
    console.log("Stopped scanning.");  
    noble.stopScanning();
	process.exit(0);
  }
}


//This function is called whenever a device has been discovered, using the
//noble.startScanning(). The peripheral object is passed as an argument.
//We are only interested in my particular peripheral, which is named
//'JAMIE VARDY'. Other devices are not of our interest .
function discoverDeviceHandler(peripheral) {
	//compare uuid of found device to device of interest, if we have a match
	//proceed to connect to the peripheral	
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
    //to the discoverServices callback.
    //The first optional argument, which is [] by default includes all UUID's of services
    //of interest. If left empty, it will discover all services.
    peripheralGlobal.discoverServices(servicesUUIDs, discoverServicesCallback);
  }
}


//This callback function is summoned when the services have been discovered.
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
    
    if (servicesUUIDs.length == services.length){  
      console.log('Discovered all services we were interested in!');
    }
    else{
      console.log('Did NOT discover all services we were interested in!');
    } 
    
    console.log("Device advertises the following services");
    //For every service, we write a different callback method because we want our
    //microbit to respond differently, dependent on the service. Some we want to
    //listen to, while some we would like to write to, etc...      
    for (var i in services) {
      console.log('  ' + i + ' uuid: ' + services[i].uuid);
      if ( services[i].uuid == 'a000'){
      	console.log('In the accelerometer');
      	services[i].discoverCharacteristics([], a1_accel.accelCallback); //bind discoverServ event to callback
      }
      else if ( services[i].uuid == 'b000'){
      	console.log('In the magnetometer');
      	services[i].discoverCharacteristics([], a1_mag.magCallback); //bind discoverServ event to callback

      }
      else if ( services[i].uuid == 'c000'){
      	console.log('In the ADC converter');
      	services[i].discoverCharacteristics([], a1_ADC.ADCCallback); //bind discoverServ event to callback

      }
      else if ( services[i].uuid == 'd000'){
      	console.log('In the button service.');
      	services[i].discoverCharacteristics([], a1_button.buttonCallback); //bind discoverServ event to callback
      }
      else if ( services[i].uuid == 'e000'){
      	console.log('In the LED cloud service');
      	services[i].discoverCharacteristics([], a1_cloud.cloudCallback); //bind the discoverServ event to the callback
      }
      //We didn't need to check whether this was our service of interest, BECAUSE
      //we already had setup the discoverServices function to only look for our
      //services of interest (we passed them as an argument).
    }  
  }
}


exports.mqttClient = mqttClient;
exports.intervalTime = intervalTime;