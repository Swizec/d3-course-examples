
d3.layout.angle_histogram = function () {
    var histogram = d3.layout.histogram();

    function angle_histogram (data, i) {
        var bins = histogram.call(this, data, i),
            radians = d3.scale.linear()
                .domain([0, d3.max(bins.map(function (d) { return d.x; }))])
                .range([0, 2*Math.PI]),
            innerRadius = 20;

        bins = bins.map(function (d) {
            d.innerRadius = innerRadius;
            d.outerRadius = d.innerRadius+d.y;
            d.startAngle = radians(d.x)-radians(d.dx/2);
            d.endAngle = radians(d.x)+radians(d.dx/2);

            return d;
        });

        return bins;
    };

    // copy histogram accessors
    ["value", "range", "bins", "frequency"].map(function (k) {
        angle_histogram[k] = function () {
            histogram[k].apply(this, arguments);
            return angle_histogram;
        };
    });

    return angle_histogram;
};
