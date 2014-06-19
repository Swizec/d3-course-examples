
(function () {

    var svg = d3.select("#graph")
	    .append("svg")
	    .style({width: "100%",
		    height: 1024});

    d3.html("time-index.html",
	    function (fragment) {
		var formatter = d3.time.format("%x"),
                    data = Array.prototype.map.call(
		    fragment.lastElementChild.querySelectorAll("tbody tr"),
		    function (row) {
			var a = row.querySelector("a");

			return {time: formatter.parse(a.textContent),
				count: Number(row.querySelectorAll("td")[1].textContent),
				link: a.href};
		    });
                
                console.log(data);
	    });
})();
