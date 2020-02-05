function new_task(user, task_todo) {
	//default action stopped
	event.preventDefault();
	if ($('#task_input').val() == '' || task_todo == []) {
		alert("Both a description and todo task are needed.");
	} else {
		//setup data object
		var dataOut = {
			task: {
					created: Date.now(),
					from: user,
					description: $('#task_input').val(),
					todo: task_todo
			}
		};
		//send socket
		socket.emit('task', dataOut);
		//post send

		$.ajax({
			cache: false,
			url: '/send_task',
			type: 'POST',
			dataType: 'json',
			data: dataOut
		});

		//clear
		$('#task_info')[0].reset();
		document.getElementById('task_todo_list').innerHTML = '';
		document.getElementById('task_editor').style.display = 'none';
	}
	//return
	return false;
}