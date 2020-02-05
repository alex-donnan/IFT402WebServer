//login function for alert on failure
function login(inputN, inputP) {
	//default action stopped
	event.preventDefault();
	//post to /login
	$.ajax({
		cache: false,
		url: '/login',
		type: 'POST',
		data: {
			uname: inputN,
			pwd: inputP
		},
		success: function(data) {
			if (data == 'failure') {
				alert('Incorrect username or password');
			} else if (data == 'okay') {
				window.location.reload(true);
			}
		}
	});
	//reset
	$('#loginForm')[0].reset();
	$('#loginForm')[0].focus();
	//return false
	return false;
}