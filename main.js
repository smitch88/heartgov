$(window).ready(function() {
	var socket = io.connect();

	//running a keyword search
	var searchButton = $('#searchSubmit'),
		button = $('.button');

	//posting the keyword search
	searchButton.click( function() {
		var searchValue = $('#search').val();

		socket.emit('keyWordSearch', searchValue);
	});

	//filter the available texts 
	button.click( function(e) {
		filterType = e.target.id;

		socket.emit('filterTexts', filterType);
	});

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

});

function showAllTexts(texts) {
	var textHolder = $('.textwindow');

	textHolder.empty();

	for (i=0; i <= texts.length-1; i++) {
		var content = texts[i].Body,
			from = texts[i].From,
			response = texts[i].Response,
			responder = texts[i].Responder,
			id = texts[i]._id,
			date = texts[i].date,
			newDiv = '<div class="textbox" id=' + from +
					 '>Text from: ' + from + '<br>' + 
					 'Date Recieved: ' + date + '<br>' + 
					 'Responder: ' + responder +'<br>' +
					 'Response Sent: ' + response + '<br>' + 
					 'Database ID: ' + id +'<br>' + 
					 'Text Content: ' + content +'<br>' +
					 'Fullfilled: false'
					 + '</div>';

		textHolder.append(newDiv)
	};

	//clicking a text to return phone number to responsebox
	var textbox = $('.textbox');

	textbox.click( function(e) {
		var phoneNumber = e.target.id,
			phoneNumberField = $('#respondToTexts');

			phoneNumberField.val(phoneNumber)
	})
}