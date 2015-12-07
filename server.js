var http = require('http');
var fs = require('fs');

function handleRequest(req, res) {
	/*
	Basic routing -- make sure we send requests with specific urls
	to specific funtions.

	Note that every function accepts the req, and res objects. We have
	to pass these objects so that we can read from the request, and write
	to the response. 

	See the functions below for most of the real magic
	*/
	if(req.url === "/hello") {
		return hello(req, res);
	}
	else if(req.url === '/form'){
		return formF(req, res);
	}
	else if(req.url === '/mole'){
		return moleServer(req, res);
	}
	/*
		Look at string.indexOf:
		https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf

		The short version is, it returns the leftmost index of a shared 
		substring, or -1. Some examples:

		'/mole/index.html'.indexOf('/mole') === 0
		'/mole'
		'/mole/index.html'.indexOf('mole') === 1
		'.mole'
		'/mole/index.html'.indexOf('/index') === 5
		'...../index'

		the number of dots corresponds to the answer
	*/
	else if(req.url.indexOf('/mole') === 0){
		return attemptFile(req, res);
	}
	else {
		return fourOhFour(req, res);
	}
}

/**
  This function writes "Hello World" to the response object
  then, once every 10 milliseconds, it writes a little more
  data to the response object. After 100 times (1 second) it 
  ends the response.
*/
function hello(req, res) {
	// Always write Hello World
	res.write("Hello world!");
	var counter = 0;
	
	// setInterval returns an id that can be used to "clear"
	// the interval, which prevents the callback from triggering
	// any more. look for clearInterval(intervalId) below
	var intervalId = setInterval(function() {
		counter += 1;
		res.write("\n..." + counter);

		if(counter > 100) {
			// Experiment with commenting out each of these
			// lines individually, as well as commenting out both.
			// What are the results? Why do we get an error if we only 
			// comment out 'clearInterval'?
			res.end();
			clearInterval(intervalId);
		}

	}, 10);
}

/**
  This function serves 2 purposes. 

  1. Upon a GET request, read the file reviewForm.html and 
     send it to the browser.

  2. Upon a POST request, read the data from the post request
     and send a slightly processed response. 
*/
function formF(req, res){
	// In node.js we can always get the HTTP method this way
	if(req.method === 'GET') {
		// Use fs to read a file in an asychronous way
		fs.readFile('reviewForm.html', function(err, data) {
			res.write(data);
			res.end();
		});
		// What happens you uncomment this line?
		// res.end();
	}
	else if(req.method === 'POST'){
		// Because the POST request is a stream, we have to 
		// parse the content in a chunked, or "buffered", way.
		var parsedData = '';

		// In node.js we use event binding to handle the buffered
		// data. This is similar to binding on a 'click' event
		// or a 'hover' event, like we did in the browser.
		
		// This binds an event listner to the 'data' event.
		// The data event is fired once per packet.
		// So these three lines adds each incoming packet to
		// our variable, parsedData
		req.on('data', function(chunk) {
			parsedData += chunk;
    	});

		// This binds an event listener to the 'end' event.
		// The end event is called after ALL the 'data' events
		// have completed for this particular request. 
    	req.on('end', function(){
    		// We know that our data is from an HTML form
    		// which has firstname and lastname in a query string format
    		var pd = parsedData.split('&');
    		var ret = "First param: " + pd[0] + 
    				  "\nSecond Param: " + pd[1];
    		
    		// After we do some simple processing on the data
    		// end the response.
    		res.write(ret);
    		res.end()
    	})
	}	
}

/**
  This function is a *VERY BASIC* file server. 

  It tries to determine if the url provided is a readable file and:
    If not we send a 404.
    If so we read the file and send its data to the browser.
*/
function attemptFile(req, res) {
	// This filesever does not allow ?'s in the file name
	// We had to add this to handle the url path:
	// /mole/whack-a-mole.html?MOLE_UP_MIN=3&MOLE_UP_MAX=5&NUMBER_OF_ROUNDS=10&MOLES_PER_ROUND=3&ROUND_COOLDOWN=3
	var urlParts = req.url.split('?');

	// Because of how the fs module looks for files, we had to append
	// a . to the url to get ./filename.html instead of /filename.html
	// because /filename.html is in our computers root directory.
	var processedUrl = '.' + urlParts[0];

	// Now try and read the file
	fs.readFile(processedUrl, function(err, data) {
		// On any error reading the file, we just throw a 404
		if(err) {
			return fourOhFour(req, res);
		}
		// and otherwise, we just write the data!
		res.write(data);
		res.end();
	});
}

/**
  This function handles the route /mole and is meant only 
  to handle serve the file mole/index.html.

  Every other route under /mole is handled by attemptFile
*/
function moleServer(req, res) {
	fs.readFile('mole/index.html', function (err, data) {
		if (err) {
	       return fourOhFour(req, res);
	    }
	   	res.write(data.toString());
		res.end();
	});
}

// A simple 404 function, set the header to be a "404" status code
// meaning not found, and end the response. 
function fourOhFour(req, res) {
	res.writeHead(404, {"Content-Type": "text/plain"});
	res.write("404 Not found");
	res.end();	
}

// Start the server
var server = http.createServer(handleRequest);
server.listen(8000, function() {
  console.log("Listening...")
});