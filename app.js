var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    mongoose = require('mongoose'),
    io = require('socket.io').listen(server),
    database = require('./config/database'),
    SMS = require('./config/models');

var accountSID = 'ACb6256885fda21fad22469b31bed4914a',
    authToken = 'c8ac0e2aded06f3018d99b2ea0ccac28';

//twillio authentication 
var client = require('twilio')(accountSID, authToken);

//public properties for our app
//list for numbers who have texted before

var categories = ['sanitation', 'public works', 'education', 'housing']

var phoneNumbers = [];

var referenceNumberStart = 2000;

// all environments
app.set('port', process.env.PORT || 3000);

//connecting to mongoDB --config/database holds DB info
mongoose.connect(database.url);

//static files located in the root folder
app.use(express.static(__dirname + '/public'))
app.use(express.bodyParser());

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//routes located in routes/routes.js
require('./routes/routes.js')(app);

app.post('/message', function(request, response) {

    // info from the text message

    var body = request.body.Body;
    var from = request.body.From;
    var to = request.body.To;
    var userResponse = 'Thank you for contacting <3 Gov! Let me know what subject (1 - sanitation 2 - public works 3 - education 4 - housing) and then your idea.';
    var responder = 'Automated Response';

    //checking to see if text has been recieved

    var newNumber = checkNumber(phoneNumbers.indexOf(from));
    console.log('New Number?: ' + newNumber);
    
    //if the from-number has been recieved before
    if (newNumber) {
      
      //adding the new phone number to our array
      phoneNumbers.push(from)
    }

    if (!newNumber) {

      var re = new RegExp('^[0-5]'); //this will test if the first number of the text is 0-5
      //var re1 = new RegExp('[0-5]'); //this will test if any part of the text is 0-5

      //if first char of text is 0-5
      if (re.test(body)) {
        var category = categories[body[0]-1] //0 indexed category list

        var userResponse = 'Thanks for contacting us about ' + category + '! Your issue will be looked ASAP.' //' Your Reference number is '+ userRef;
      }

      else {
        //if incorrect text structure
        console.log('Repeat texter, but they did not have a number in their text');
        var userResponse = 'Please let us know which subject you\'d like to tell us about and try again! Example: "1, our trash hasn\'t been picked up in a week."'; 
      }

    }

    //generating object to be saved to DB
    //if the text came from a new number OR the text was correctly structured, we will save the text
    //otherwise it will be disregarded
    if (newNumber || re.test(body)) {
      console.log('Saving Text');

    var newSMS = new SMS({
      From: from,
      To: to,
      Body: body,
      Response: userResponse,
      Responder: responder,
      //This item will be used to search the database for keywords
      Searchable: body.split(' ')
    });

    // saving new object
    newSMS.save( function(err) {
      if (err) { console.log(err) };
    });
    }

    //this functionality happens for every text, no matter what
    //print messages to the console
    console.log('body : ' + body);
    console.log('from : ' + from);
    console.log('to : ' + to);
    console.log('Message : ' + userResponse)

    //reply to the incoming message

    client.sms.messages.create({to: from, from: responder, body: userResponse}, function(err,response) {

   		console.log('Message Delivered');

    });   

  response.send('Message Recieved!');

});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//interacting with the clientside
io.sockets.on('connection', function(socket){
  console.log('User Connected');

  //returning the entire DB
  SMS.find({}, function(err, data) {
    var allTexts = data;

    io.sockets.emit('returnAllTexts', allTexts);
  })

  //for responding to texts from the public site
  socket.on('responderSendText', function(messageData) {

      client.sms.messages.create({ to: messageData.reciever, 
        from: messageData.from, 
        body: messageData.message
        }, function(err,response) {

      socket.emit('successfulResponse', err);
      console.log(err);
    });   
  })

  //if a user searches by keyword
  socket.on('keyWordSearch', function(keyword){
    SMS.find({Searchable: keyword}, function(err, matchingResponses){
      
      socket.emit('keyWordSearchReturn', matchingResponses);
    });
  });

  //filtering texts
  socket.on('filterTexts', function(filterType) {

    if (filterType === 'all') {
      //returns all texts in DB
      SMS.find({}, function(err, matchingResponses) {
        socket.emit('returnFilter', matchingResponses);
      });
    }

    if (filterType === 'date') {
      //returns the oldest texts first
      var query = SMS.find().sort({'date': -1});
      query.exec( function(err, matchingResponses) {
        socket.emit('returnFilter', matchingResponses);
      });
    }

    if (filterType === 'from') {
       //returns the texts sorted by phone number
      var query = SMS.find().sort({'From': -1});
      query.exec( function(err, matchingResponses) {
        socket.emit('returnFilter', matchingResponses);
      });
    }

    if (filterType === 'responder') {
      //
      var query = SMS.find().sort({'Responder': -1});
      query.exec( function(err, matchingResponses) {
        socket.emit('returnFilter', matchingResponses);
      });
    }

  });

})

// will return true if the number is not known
function checkNumber(value) {
  return value === -1;
}
