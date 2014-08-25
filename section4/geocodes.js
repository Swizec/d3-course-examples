
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

            async.map(ufos,
                      function (ufo, callback) {
                          console.log(ufo.time, ufo.city, ufo.state, ufo.summary);

                          GMaps.geocode({
                              address: ufo.city,
                              callback: function (results, status) {
                                  if (status != "OK") {
                                      console.log(status, results);
                                      if (status == "ZERO_RESULTS") {
                                          return callback(null, ufo);
                                      }else{
                                          return callback(new Error("Query Limit!"));
                                      }
                                  }

                                  var latlng = results[0].geometry.location;
                                  ufo.lat = latlng.lat();
                                  ufo.lon = latlng.lng();

                                  callback(null, ufo);
                              }
                          });
                      },
                      function (err, data) {
                          if (err) return console.log(err);

                          var csv = d3.csv.format(data);
            
                          var blob = new Blob([csv], {type: "text/plain;charset=utf-8"});
            
                          console.log("got csv");

                          saveAs(blob, "full-data-geodata.csv");
                      });
        });
})();
