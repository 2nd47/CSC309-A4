$(document).ready(function() {
	/*When the page loads, send a request to get the chat list*/
	//requestInbox();
	renderInbox();
});

function requestInbox() {
	$.ajax(
	{
		type: "get",
		url: "/inbox",
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
	update1.url = "/project.html";
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
		var messageBoard = json.messageBoard;
		var numMessages = messageBoard.length;
		var i;
		for (i=0;i<numMessages;i++) {
			var message = messageBoard[i].message;
			var url = messageBoard[i].url;
			// make a clickable message
			var $updateMessage = $("<div class='inbox-item message-item'>\
																<a href='" + url + "' type='text-decoration: none'>"
																	+ message +
																"</a>\
															</div>");
			$messageList.append($updateMessage);
		}
		
		// show chat list on the right side to click on
		var $chatList = $("#chat-list-wrapper");
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
        alert( "Failed to load inbox: " + textStatus );
    });
}