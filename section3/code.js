
(function () {

    var svg = d3.select("#graph")
	    .append("svg")
	    .style({width: "100%",
		    height: 1024});

    d3.html("http://www.nuforc.org/webreports/ndxpost.html",
	    function (data) {
		console.log(data);
	    });

})();
