/**
 * This is the main file for the app.
 */

const http = require('http');
const url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

// Create the server
const server = http.createServer(function (req, res) {
  // Get the url and parse it.
  var parsedUrl = url.parse(req.url, true);

  // Get the path from the url.
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object.
  var queryStringObject = parsedUrl.query;

  // Get the HTTP Method
  var method = req.method.toLowerCase();

  // Get the headers as an object.
  var headers = req.headers;

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', function(data){
    buffer += decoder.write(data);
  });

  req.on('end', function(){
    buffer += decoder.end();

    // Choose the handler this request should goto. If one is not found, use the notFound handler.
    var chosenHandler = typeof(router[trimmedPath]) != 'undefined' ? router[trimmedPath] : handlers.notFound

    //Construct the data object to send to the handler
    var data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer
    }

    // Route the request to the handler specified in the router.
    chosenHandler(data,function(statusCode,payload){
      // Use the statuscode called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Use the payload called back by the handler, or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      // Convert the payload to a string
      var payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      // Log the request path.
      console.log('Returning this response. :', statusCode, payloadString);
    });
  });
});

// Start the server
server.listen(3000, function(){
  console.log("The server is listening on port 3000");
});

// Handlers definition
var handlers = {};

// Not found Handler
handlers.notFound = function(data, callback) {
  callback(404);
};

// Hello endpoint handler
handlers.hello = function(data, callback) {
  callback(200,{'message': 'Welcome, and thanks for using this enpoint!'});
}

 // Router definition
 var router = {
  'hello' : handlers.hello
 };