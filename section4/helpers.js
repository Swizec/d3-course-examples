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
                return _.indexOf(knownStates, ufo.state, true) >= 0;
            });
    },

    ufos: function (ufos) {
        return _.groupBy(ufos,
                         function (ufo) { return ufo.state; });
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
                                       return Number(p[y].replace(/\./g, ""));
                                   }));
            })
        ));
    }
};
