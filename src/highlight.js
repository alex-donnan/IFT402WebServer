function highlight(id) {
	var d = new Date();
	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var year = d.getFullYear();
	var dayName = (parseInt(id) - 1) % 7;
	var dayNum = document.getElementById(id).textContent;
	for (var i = 1; i < 42; ++i) document.getElementById(i).style.background = 'none';
	if (dayNum != "") {
		document.getElementById("today").innerHTML = "Looking at " + days[dayName] + ", " + months[d.getMonth()] + " " + dayNum + ", " + year;
		document.getElementById(id).style.background = '#dcccf7';
	} else {
		document.getElementById("today").innerHTML = "Today is " + days[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate() + ", " + year;
	}
}