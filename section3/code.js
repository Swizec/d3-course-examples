
(function () {

    var slugify = function (string) {
        return string
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '-');
    };

    var parse_index = function (fragment) {
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
                
                })
                .filter(function (datum) {
                })
                .map(function (datum) {
                
                });

            callback(null, state);
        });
    };

    d3.html("state-index.html", function (fragment) {
        var index = parse_index(fragment);

        async.map(index, fetch_a_state, function (err, data) {
            var time_formatter = d3.time.format("%x %H:%M"),
                posted_formatter = d3.time.format("%x");

            data = data.map(function (datum) {
                return datum.data.map(function (datum) {
                    datum.time = time_formatter(datum.time);
                    datum.posted = posted_formatter(datum.posted);

                    return datum;
                });
            }).reduce(function (a, b) {
                return a.concat(b);
            });

            var csv = d3.csv.format(data);

            var blob = new Blob([csv], {type: "text/plain;charset=utf-8"});

            saveAs(blob, "full-data.csv");
        });
    });

})();
