$(window).ready(function() {
	var socket = io.connect();

	socketObject.init();

	//running a keyword search
	var searchButton = $('#searchSubmit'),
		button = $('.button'),
		//responding to text via static page
		sendResponse = $('#submitResponse');

	//page functionality
	//=========================================================================

	//posting the keyword search
	searchButton.on('click', function() {
		var searchValue = $('#search').val();

		socket.emit('keyWordSearch', searchValue);
	});

	//filter the available texts 
	button.on('click', function(e) {
		filterType = e.target.id;

		socket.emit('filterTexts', filterType);
	});

	//responding to texts via text box
	sendResponse.on('click', function() {
		var reciever = $('#respondToTexts').val(),
			message = $('#responseText').val();

			console.log(reciever)

		socket.emit('responderSendText', {'from': 'Asher', 'reciever': reciever, 'message': message})
	})

	//=========================================================================



	//socket listeners
	//=========================================================================

	socket.on('successfulResponse', function(err) {
		alert('Response Sent!')
	})

	//returning all texts when a user logs on
	socket.on('returnAllTexts', function(data) {
		showAllTexts(data);
	})

	//returning keyword search
	socket.on('keyWordSearchReturn', function(matchingResponses) {
		showAllTexts(matchingResponses)
	});

	socket.on('returnFilter', function(matchingResponses) {
		showAllTexts(matchingResponses)
	});

	//=========================================================================
});

var socketObject = (function() {
	//var newSocket = io.connect();
	
	var init = function() {
		getUserClicks();
	}

	var getUserClicks = function() {
		return true
	}

	return {
		'init': init
	}


})();

function showAllTexts(text) {
	var textHolder = $('.textwindow');
	var htmlInsert = "";

	for (i=0; i <= text.length-1; i++) {
		var newDiv = createTextDiv(text[i])

		htmlInsert += (newDiv)
	};

	textHolder.html(htmlInsert)

	//clicking a text to return phone number to responsebox
	var textbox = $('.textbox');

	textbox.on('click', function(e) {
		var phoneNumber = e.target.id,
			phoneNumberField = $('#respondToTexts');

			phoneNumberField.val(phoneNumber)
	})
}

function createTextDiv(text) {

	//content vars
	var content = text.Body,
		from = text.From,
		response = text.Response,
		responder = text.Responder,
		id = text._id,
		date = text.date;

	//new div vars	
	var fromDiv = '<div class="fromDiv">Text from:<br><br>' + from + '</div>';
	var dateDiv = '<div class="fromDiv">Date Recieved:<br><br>' + date + '</div>';
	var responderDiv = '<div class="fromDiv">Responder:<br><br>' + responder +'</div>';
	var responseDiv = '<div class="fromDiv">Response Sent:<br><br>' + response + '</div>';
	var textContentDiv = '<div class="fromDiv">Text Content:<br><br>' + content +'</div>';
	var fullfilledDiv = '<div class="fromDiv">Fullfilled:<br><br>False</div>';

	//maybe we dont need to show DB Id
	var dbIDdiv = '<div class="fromDiv">Database ID: ' + id +'</div>';

	var allContentDivs = fromDiv + dateDiv +textContentDiv  + responseDiv + responderDiv + fullfilledDiv;
	var newDiv = '<div class="textbox" id=' + from +'>'+ allContentDivs +'</div>';

	return newDiv;		 
}