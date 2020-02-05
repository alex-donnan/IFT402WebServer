//create a new group for the user
function add_chat_group(user) {
	//default prevention
	event.preventDefault();
	//make data
	var group = $('#chat_input').val();
	if (group != '') {
		var checks = [];
		checks.push(user);
		$('input:checkbox[name=chat_users]:checked').each(function(){
			checks.push($(this).val());
		});
		//send socket
		socket.emit('new_group', {name: group, users: checks, type: 'chat'});
		//post send to add_chat_group route
		$.ajax({
			cache: false,
			url: '/add_chat_group',
			type: 'POST',
			dataType: 'json',
			data: {
				groupName: group,
				groupUsers: checks
			}
		});
		//reset value
		$('#add_chat_form')[0].reset();
		document.getElementById('create_chat').style.display = 'none';
	}
	//return
	return false;
}