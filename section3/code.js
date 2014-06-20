
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
            var time_formatter = d3.time.format("%m/%d/%y %H:%M"),
                posted_formatter = d3.time.format("%m/%d/%y"),
                this_year = (new Date()).getFullYear();

            state.data = Array.prototype.map.call(
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
                })
                .filter(function (datum) {
                    return !!datum.time && !!datum.posted;
                })
                .map(function (datum) {
                    // fix y2k problems
                    if (datum.time.getFullYear() > this_year) {
                        datum.time.setFullYear(datum.time.getFullYear()-100);
                    }
                    if (datum.posted.getFullYear() > this_year) {
                        datum.posted.setFullYear(datum.posted.getFullYear()-100);
                    }

                    return datum;
                });

            callback(null, state);
        });
    };

    d3.html("state-index.html", function (fragment) {
        var index = parse_index(fragment),
            start = new Date();

        async.map(index, fetch_a_state, function (err, data) {
            var time_taken = ((new Date())-start)/1000;

            var time_formatter = d3.time.format("%x %H:%M"),
                posted_formatter = d3.time.format("%x");

            console.log(data.length);
            console.log(time_taken+"s");

            d3.csv.format(
                data[0].data.map(function (datum) {
                    
                    datum.time = time_formatter(datum.time);
                    datum.posted = posted_formatter(datum.posted);
                    
                    return datum;
                })
            );
            //console.log(d3.csv.format(data[0]));
        });
    });
})();
