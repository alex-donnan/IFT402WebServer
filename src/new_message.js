function new_message(user, chat) {
	//default action stopped
	event.preventDefault();
	//send socket
	socket.emit('message', {name: user, chatName: chat, msg: $('#text_input').val()});
	//post send
	$.ajax({
		cache: false,
		url: '/send_text',
		type: 'POST',
		dataType: 'json',
		data: { message: $('#text_input').val() }
	});
	//clear
	$('#text_form')[0].reset();
	$('#text_form')[0].focus();
	//return
	return false;
}