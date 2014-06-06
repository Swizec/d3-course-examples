
(function () {

    var svg = d3.select("#graph")
            .append("svg")
            .style({width: "100%",
                    height: 500});

    d3.json("triangle-ufos.json", function (data) {
        data = data.map(function (datum) {
            datum.time = Date.parse(datum.time);
            return datum;
        }).filter(function (datum) {
            return !!datum.time;
        }).map(function (datum) {
            datum.time = new Date(datum.time);
            return datum;
        });

        console.log(data);
    });

})();
