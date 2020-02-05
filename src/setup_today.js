function setup_today() {
	var d = new Date();
	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var year = d.getFullYear();
	document.getElementById("today").innerHTML = "Today is " + days[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate() + ", " + year;
	
}