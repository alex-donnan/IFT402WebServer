//create a new group for the user
function add_task_group(user) {
	//default prevention
	event.preventDefault();
	//make data
	var group = $('#task_group_input').val();
	if (group != '') {
		var checks = [];
		checks.push(user);
		$('input:checkbox[name=task_users]:checked').each(function(){
			checks.push($(this).val());
		});
		//send socket
		socket.emit('new_group', {name: group, users: checks, type: 'task'});
		//post send to add_chat_group route
		$.ajax({
			cache: false,
			url: '/add_task_group',
			type: 'POST',
			dataType: 'json',
			data: {
				taskName: group,
				taskUsers: checks
			}
		});
		//reset value
		$('#add_task_form')[0].reset();
		document.getElementById('create_task').style.display = 'none';
	}
	//return
	return false;
}