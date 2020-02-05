function remove_task(task_des) {
	//default action stopped
	event.preventDefault();
	//post send
	$.ajax({
		cache: false,
		url: '/remove_task',
		type: 'POST',
		dataType: 'json',
		data: { taskDes: task_des },
		success: function(data) {
			//task log @ 8
			document.getElementById('task_display').innerHTML = '';
			data[8].forEach(function(el) {
				var todo = el.todo;
				var des = el.description;
				var html_out =
					'<div id="task_single">' +
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
		}
	});
	//return
	return false;
}