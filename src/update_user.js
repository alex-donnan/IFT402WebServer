//changes session info and updates the page
function update_user(group, type) {
	$.ajax({
		cache: false,
		url: '/update_user',
		type: 'POST',
		dataType: 'json',
		data: {groupName: group, groupType: type},
		success: function(data) {
			//username @ 0
			user = data[0];
			//orgnum @ 1
			org_num = data[1];
			//set chat @ 2
			chat_user = data[2];
			//set task @ 3
			task_user = data[3];
			//create list of chats
			document.getElementById('chat_group').innerHTML = '';
			data[4].forEach(function(el) {
				var onclick = 'update_user("' + el + '", "chat")';
				document.getElementById('chat_group').innerHTML += "<li onclick='" + onclick + "'>" + el + '</li><hr>';
			});
			//task groups @ 5
			document.getElementById('task_group').innerHTML = '';
			data[5].forEach(function(el) {
				var onclick = 'update_user("' + el + '", "task")';
				document.getElementById('task_group').innerHTML += "<li onclick='" + onclick + "'>" + el + '</li><hr>';
			});
			//organization users @ 5
			if (org_num == chat_user) {
				org_user = data[6];
				document.getElementById('chat_usernames').innerHTML = '';
				document.getElementById('task_usernames').innerHTML = '';
				org_user.forEach(function(el) {
					if (el != user) {
						document.getElementById('chat_usernames').innerHTML += '<input type="checkbox" name="chat_users" value="' + el + '">' + el + '<br>';
						document.getElementById('task_usernames').innerHTML += '<input type="checkbox" name="task_users" value="' + el + '">' + el + '<br>';
					}
				});
			}
			//chat log @ 7
			document.getElementById('messages').innerHTML = '';
			data[7].forEach(function(el) {
				if (el.from == last_user) {
					document.getElementById('messages').innerHTML += '<li>' + el.message + '</li>';
				} else {
					document.getElementById('messages').innerHTML += '<li><hr></li><li><em>' + el.from + '</em></li><li>' + el.message + '</li>';
					last_user = el.from;
				}
			});
			//task log @ 8
			document.getElementById('task_display').innerHTML = '';
			data[8].forEach(function(el) {
				var todo = el.todo;
				var des = el.description;
				var html_out =
					'<div id="task_single" draggable="true">' +
					'<p>' + des + '</p>' +
					'<hr>';
				var onclick = 'remove_task("' + des + '")';
				todo.forEach(function(todo_el) {
					html_out +=
					'<label for="' + todo_el + '">' + todo_el + '</label>' + 
					'<input type="checkbox" name="' + todo_el + '" value="' + todo_el + '">' + 
					'<div class="clear"></div>';
				});
				html_out += "<img src='/img/button_confirm.svg' alt='Confirm sign' class='confirm_task' onclick='" + onclick + "'>";
				html_out += '</div>';
				document.getElementById('task_display').innerHTML += html_out;
			});
			//scroll to bottom
			document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
		}
	});
}