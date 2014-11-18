
var stateIdMap = d3.map({
    1: "AL",
    2: "AK",
    4: "AZ",
    5: "AR",
    6: "CA",
    8: "CO",
    9: "CT",
    10: "DE",
    11: "DC",
    12: "FL",
    13: "GA",
    15: "HI",
    16: "ID",
    17: "IL",
    18: "IN",
    19: "IA",
    20: "KS",
    21: "KY",
    22: "LA",
    23: "ME",
    24: "MD",
    25: "MA",
    26: "MI",
    27: "MN",
    28: "MS",
    29: "MO",
    30: "MT",
    31: "NE",
    32: "NV",
    33: "NH",
    34: "NJ",
    35: "NM",
    36: "NY",
    37: "NC",
    38: "ND",
    39: "OH",
    40: "OK",
    41: "OR",
    42: "PA",
    44: "RI",
    45: "SC",
    46: "SD",
    47: "TN",
    48: "TX",
    49: "UT",
    50: "VT",
    51: "VA",
    53: "WA",
    54: "WV",
    55: "WI",
    56: "WY"
}),
    knownStates = _.sortBy(stateIdMap.values());

var prepare = {
    filter_ufos: function (ufos) {
        return ufos
            .filter(function (ufo) { return !!ufo.state; })
            .filter(function (ufo) { 
                return _.indexOf(knownStates, ufo.state, true) >= 0; });
    },

    ufos: function (ufos) {
        return _.groupBy(ufos,
                         function (ufo) { return ufo.state; });
    },

    ufos_by_year: function (ufos) {
        var format = d3.time.format("%m/%d/%Y %H:%M");
        return _.groupBy(ufos,
                         function (ufo) {
                             return format.parse(ufo.time).getFullYear();
                         });
    },

    ufos_by_week: function (ufos) {
        var format = d3.time.format("%m/%d/%Y %H:%M");
        return _.groupBy(ufos,
                         function (ufo) {
                             var d = moment(format.parse(ufo.time));
                             return d.year()+'-'+d.week();
                         });
    },

    ufos_by_season: function (ufos, cluster_assignments) {
        var format = d3.time.format("%m/%d/%Y %H:%M"),
            seasons = seasons = d3.scale.ordinal()
                .domain(d3.range(12))
                .range(["winter", "winter", 
                        "spring", "spring", "spring", 
                        "summer", "summer", "summer", 
                        "autumn", "autumn", "autumn", 
                        "winter"]);

        ufos = ufos.map(function (ufo, i) {
            ufo.cluster = cluster_assignments[i];
            return ufo;
        });

        return _.groupBy(ufos,
                         function (ufo) {
                             var d = format.parse(ufo.time),
                                 year = d.getMonth() == 11 ? d.getFullYear()+1 : d.getFullYear();
                             
                             return year+"-"+seasons(d.getMonth());
                         });
    },

    states: function (states) {
        return d3.map(_.mapValues(states,
                                  function (s) { return s.toLowerCase(); }));
    },
    
    populations: function (populations) {
        return d3.map(_.zipObject(
            populations.map(function (p) { return p.State.toLowerCase(); }),
            populations.map(function (p) {
                var years = [2010, 2011, 2012, 2013];
                return _.zipObject(years,
                                   years.map(function (y) {
                                       return Number(p[y].replace(/\./g, "")); }));
            })));
    },

    cluster_populations:  function (clustered, city_populations) {
        return _.mapValues(clustered, function (cluster) {
            var populations = cluster.map(function (d) {
                return {city: d.label.toLowerCase(),
                        population: city_populations[d.label.toLowerCase()] || 0};
            });
            
            return _.uniq(populations, function (d) { return d.city; })
                .reduce(function (sum, d) {
                    return sum+Number(d.population);
                }, 0);
        });
    },

    base_positions: function (military_bases, projection) {
        return _.map(
            military_bases.getElementsByTagName("Placemark"), function (d) {
                var point = _.find(d.children, 
                                   function (node) { 
                                       return node.nodeName == "Point"; 
                                   }).textContent.split(",");

                var icon = _.find(d.children,
                                  function (node) {
                                      return node.nodeName == "Style";
                                  });
                if (icon.innerHTML.indexOf("force-icons.png") < 1
                    && icon.innerHTML.indexOf("navy-icons.png") < 1) {
                    return null;
                }                    
                return projection([Number(point[0]), Number(point[1])]);
            })
            .filter(function (d) { return !!d; });
    },

    precalc_animation: function (ufos_by_season, centroids) {
        var seasons = seasons = d3.scale.ordinal()
                .range(d3.range(4))
                .domain(["winter", "spring", "summer", "autumn"]),
            start_year = 1945,
            base_state = prepare.centroid_base_state(centroids.centroids,
                                                     centroids.clustered,
                                                     centroids.populations);

        return _.keys(ufos_by_season)
            .sort(
                _.curry(year_season_ordering)(seasons)
            )
            .filter(function (key) {
                key = key.split("-");
                return Number(key[0]) >= start_year;
            })
            .reduce(make_keyframe,
                    {keyframes: [],
                     sum: base_state});

        function make_keyframe (result, key, i) {           
            var ufos = ufos_by_season[key],
                cluster_ids = _.groupBy(
                    ufos.map(function (ufo) {
                        return ufo.cluster;
                    })
                        .filter(function (id) { return typeof id != "undefined"; })
                );

            var sum = _.cloneDeep(result.sum);

            var currently_drawn = d3.sum(
                _.values(sum).map(function (d) { return d.count; })
            )+cluster_ids.length;

            _.keys(cluster_ids).forEach(function (id) {
                var d = sum[id];

                d.count += cluster_ids[id].length;
                if (d.population) {
                    d.R = d.R_scale((d.count/d.population)/currently_drawn);
                }else{
                    d.R = 0;
                }

                sum[id] = d;
            });
            
            result.keyframes.push(sum);
            result.sum = sum;
            
            return result;
        }
    },

    centroid_base_state: function (centroids, clustered, cluster_populations) {
        var ratios = _.mapValues(clustered,
                                 function (group, key) {
                                     var population = cluster_populations[key];
                                     
                                     if (population == 0) {
                                         return 0;
                                     }
                                     
                                     return group.length/population;
                                 }),
            R = d3.scale.linear()
                .domain([0, d3.max(_.values(ratios))])
                .range([2, 20]);
        
        var ufo_count = _.values(clustered)
                .reduce(function (sum, group) {
                    return sum+group.length;
                }, 0);
        
        return centroids.map(function (pos, i) {
            return {x: pos[0],
                    y: pos[1],
                    max_R: R(ratios[i]),
                    all_here: clustered[i].length,
                    abs_all: ufo_count,
                    population: cluster_populations[i],
                    count: 0,
                    R_scale: R,
                    R: 0,
                    id: i};
        });
    }
};

var clustered_ufos = function (ufos, projection) {
    var labels = [],
        vectors = [];
    
    
    ufos
        .map(function (d) { return {
            label: [d.city, d.state].join(", "),
            vector: projection([d.lon, d.lat])}; })
        .filter(function (d) { return !!d.vector; })
        .forEach(function (d) {
            labels.push(d.label);
            vectors.push(d.vector);
        });
    
    
    var clusters = figue.kmeans(120, vectors);
    var clustered = _.groupBy(clusters.assignments.map(function (cluster, i) {
        return {label: labels[i],
                cluster: cluster};
    }), "cluster");

    return [clustered, clusters];
};

var year_season_ordering = function (seasons, a, b) {
    a = a.split("-");
    b = b.split("-");
    
    var order = d3.ascending(Number(a[0]),
                             Number(b[0]));
    
    if (order == 0) {
        order = d3.ascending(seasons(a[1]),
                             seasons(b[1]));
    }
    
    return order;
};
