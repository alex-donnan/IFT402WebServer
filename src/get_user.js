//set the user constant for this page
function get_user(user, last_user, org_user, org_num, chat_user, task_user) {
	$.ajax({
		cache: false,
		url: '/get_user',
		type: 'GET',
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
			data[4].forEach(function(el) {
				var onclick = 'update_user("' + el + '", "chat")';
				document.getElementById('chat_group').innerHTML += "<li onclick='" + onclick + "'>" + el + '</li><hr>';
			});
			//task groups @ 5
			data[5].forEach(function(el) {
				var onclick = 'update_user("' + el + '", "task")';
				document.getElementById('task_group').innerHTML += "<li onclick='" + onclick + "'>" + el + '</li><hr>';
			});
			//organization users @ 5
			org_user = data[6];
			org_user.forEach(function(el) {
				if (el != user) {
					document.getElementById('chat_usernames').innerHTML += '<input type="checkbox" name="group_users" value="' + el + '">' + el + '<br>';
					document.getElementById('task_usernames').innerHTML += '<input type="checkbox" name="group_users" value="' + el + '">' + el + '<br>';
				}
			});
			//chat log @ 7
			data[7].forEach(function(el) {
				if (el.from == last_user) {
					document.getElementById('messages').innerHTML += '<li>' + el.message + '</li>';
				} else {
					document.getElementById('messages').innerHTML += '<li><hr></li><li><em>' + el.from + '</em></li><li>' + el.message + '</li>';
					last_user = el.from;
				}
			});
			//task log @ 8
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