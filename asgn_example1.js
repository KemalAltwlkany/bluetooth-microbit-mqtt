//Import the file system module
var fs = require("fs");

//synchronous read
var data = fs.readFileSync('example.txt');
console.log(data.toString());

for(i=0; i<10000; i++){
	if (i % 100 == 1){
		console.log(i*3 - 2*i);		
	}
}

console.log("Program Ended");