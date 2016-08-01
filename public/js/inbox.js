$(document).ready(function() {
	/*When the page loads, send a request to get the chat list*/
	//requestInbox();
	renderInbox();
});

function requestInbox() {
	$.ajax(
	{
		type: "get",
		url: "/api/inbox",
	})
	.done(function(data)
	{
		renderInbox(data);
	})
	.fail(function( jqXHR, textStatus )
    {
        alert( "Failed to load inbox: " + textStatus );
    });
}

function renderInbox(data) {
	/*var json = JSON.parse(data);*/
	// Dummy data for testing
	var json = new Object();
	json.success = "true";
	json.messageBoard = [];
	var update1 = new Object();
	update1.url = "/projects.html";
	update1.message = "project";
	var update2 = new Object();
	update2.url = "/people.html";
	update2.message = "people"
	json.messageBoard.push(update1);
	json.messageBoard.push(update2);
	json.chats = new Object();
	/////////////////////////////////
	if (json.success === "true") {
		// show update info on the left side
		var $messageList = $("#message-list-wrapper");
		$messageList.empty();
		var messageBoard = json.messageBoard;
		var numMessages = messageBoard.length;
		if (!numMessages) {
			// no messages to be shown
			$messageList.append("<p>You have no unread notifications.</p>");
		}
		var i;
		for (i=0;i<numMessages;i++) {
			var message = messageBoard[i].message;
			var url = messageBoard[i].url;
			// make a clickable message
			var $updateMessage = $("<div class='inbox-item message-item'>\
																<a href='" + url + "' type='text-decoration: none' target='_blank'>"
																	+ message +
																"</a>\
															</div>");
			$messageList.append($updateMessage);
		}

		// show chat list on the right side to click on
		var $chatList = $("#chat-list-wrapper");
		$chatList.empty();
		$.each(json.chats, function(key, value){
			var otherName = value.chat_name;
			var avatar = value.avatar;
			var lastMessage = value.last_message;
			var numUnread = value.num_unread;

			if (numUnread > 0) {
				// if number of unread is greater than 0, prepend a highlighted
				// list item
				var $chat = $("<div class='inbox-item message-item contact-message' onClick='requestChat(" + key + ")'>\
												<img src='" + avatar + "' alt='"+ otherName +"'/>\
												<h3>" + otherName + "(" + numUnread + ")</h3>\
												<p>" + lastMessage + "</p>\
											</div>");
				$chatList.prepend($chat);
			}
			else {
				// else, append
				var $chat = $("<div class='inbox-item message-item' onClick='requestChat(" + key + ")'>\
												<img src='" + avatar + "' alt='"+ otherName +"'/>\
												<h3>" + otherName + "(" + numUnread + ")</h3>\
												<p>" + lastMessage + "</p>\
											</div>");
				$chatList.append($chat);
			}

		});
	}
	else {
		// direct user to landing page
		alert("Please login again.");
		window.location.replace("/landing.html");
	}
}

function sendMessageToChat(personId) {
	$.ajax(
	{
		type: "post",
		url: "/inbox/:" + personId,
	})
	.done(function(data)
	{
		if (data === "Denied") {
			alert("You are not permitted to send this message.");
		}
		else {
			requestChat();
		}
	})
	.fail(function( jqXHR, textStatus )
    {
        alert( "Failed to send message: " + textStatus );
    });
}

function renderChat(data) {
	var json = JSON.parse(data);
	if (json.success === "true") {
		var result = json.result;
		var $display_title = $("#display-area-header");
		var $display_message = $("message-list-wrapper");
		$display_title.empty();
		$display_message.empty();
		// display other person's name in the display title
		$display_title.html(result.other_name);
		var messages = result.messages;
		var numMessages = messages.length;
		var i;
		for (i=0;i<numMessages;i++) {
			var message = messages[i];
			var sender = message.sender; //other or user
			var messageText = message.text;
			if (sender === "other") {
				var $senderMessage = $("<div class='inbox-item message-item'>\
																	<h4>\
																		<a href='"+ userIdToUrl(result.other_id) +"' style='text-decoration:none;color:black'>"
																			+ result.other_name +
																		"</a>\
																	</h4>\
																	<p>" + messageText + "</p>\
																</div>");
				$display_message.append($senderMessage);
			}
			else {
				var $yourMessage = $("<div class='inbox-item message-item'>\
																<h4>You</h4>\
																<p>" + messageText + "</p>\
															</div>");
				$display_message.append($yourMessage);
			}
		}
		// append a message box to the end
		var $messageBox = $("<form id='new-message'>\
													<legend>Send new message:</legend>\
													<textarea name='new-message-box' rows='3'></textarea>\
													<input id='submit-message' type='submit' value='Send' onClick='sendMessageToChat("
													+ result.other_id + ")'/>\
												 </form>");
	}
	else {
		alert("Failed to load chat. Please try agian lator.");
	}
}


function requestChat(chatId) {
	$.ajax(
	{
		type: "get",
		url: "/inbox/:" + chatId,
	})
	.done(function(data)
	{
		renderChat(data);
	})
	.fail(function( jqXHR, textStatus )
    {
        alert( "Failed to load chat: " + textStatus );
    });
}
