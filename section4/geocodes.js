
(function () {

    queue()
        .defer(d3.csv, "data/full-data.csv")
        .defer(d3.csv, "data/full-data-geodata.csv")
        .await(function (err, ufos, processed) {
            ufos = prepare.filter_ufos(ufos);
            processed = prepare.filter_ufos(processed);
            var last = _.last(processed);

            ufos = ufos.splice(_.findIndex(ufos, function (d) {
                return d.time == last.time && d.city == last.city && d.summary == last.summary;
            }));

            console.log(ufos.length);
        });
})();
