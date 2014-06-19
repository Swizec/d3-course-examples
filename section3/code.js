
(function () {

    var svg = d3.select("#graph")
	    .append("svg")
	    .style({width: "100%",
		    height: 1024});

    var slugify = function (string) {
        return string
            .toLowerCase()
            .replace(/ /g,'-')
            .replace(/[^\w-]+/g,'-');
    };

    var parse_index = function (fragment) {
	var formatter = d3.time.format("%x");

        return Array.prototype.map.call(
	    fragment.querySelectorAll("tbody tr"),
	    function (row) {
	        var a = row.querySelector("a");
                
                return {state: a.textContent,
                        count: Number(row.querySelectorAll("td")[1].textContent),
                        link: "data/"+slugify(a.textContent)+".html"};
                
	    });
    };

    var fetch_a_state = function (state, callback) {
        callback || (callback = function () {});

        console.log("Fetching", state.state);

        d3.html(state.link, function (fragment) {
            var time_formatter = d3.time.format("%x %H:%M"),
                posted_formatter = d3.time.format("%x");

            var data = Array.prototype.map.call(
                fragment.querySelectorAll("tbody tr"),
                function (row) {
                    var cells = row.querySelectorAll("td"),
                        parsed = {};

                    ["time", "city", "state", "shape", 
                     "duration", "summary", "posted"].forEach(
                        function (key, i) {
                            parsed[key] = cells[i].textContent;
                        });
                    
                    parsed.time = time_formatter.parse(parsed.time);
                    parsed.posted = posted_formatter.parse(parsed.posted);

                    return parsed;
                });

            callback(null, data);
        });
    };

    d3.html("state-index.html", function (fragment) {
        var index = parse_index(fragment);

        async.map(index, fetch_a_state, function (err, data) {
            console.log(data.length);
        });
    });
})();
