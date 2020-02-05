function setup_cal(cal_year, cal_month) {
	var d = new Date();
	//quickly set the user month
	cal_month = d.getMonth();
	cal_year = d.getFullYear();
	//establish rest of date information
	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var dayWeek = d.getDay();
	var dayNum = d.getDate();
	var month = months[d.getMonth()];
	var year = d.getFullYear();
	var monthCnt = (year % 4 == 0) ? [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	var monthBegin = new Date(year, d.getMonth(), 1);
	var startPos = monthBegin.getDay() + 1;
	var dayCount = 1;
	for (var i = startPos; i < startPos + monthCnt[d.getMonth()]; ++i) {
		document.getElementById(i).innerHTML = dayCount;
		document.getElementById(i).style.cursor = 'pointer';
		document.getElementById(i).style.borderRadius = '6px';
		if (dayCount == dayNum && cal_month == d.getMonth()) {
			document.getElementById(i).style.border = '1px solid #c1c1c1';
		}
		dayCount += 1;
	}
	document.getElementById("month").innerHTML = month + ", " + year;
}