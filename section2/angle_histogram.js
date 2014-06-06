
d3.layout.angle_histogram = function () {
    var histogram = d3.layout.histogram(),
        innerRadius = 0,
        maxRadius = d3.scale.linear();

    function angle_histogram (data, i) {
        var bins = histogram.call(this, data, i),
            radians = d3.scale.linear()
                .domain([0, d3.max(bins.map(function (d) { return d.x; }))])
                .range([0, 2*Math.PI]);

        bins = bins.map(function (d, i) {
            d.innerRadius = typeof innerRadius === 'function' ?     
                innerRadius(d, i) : innerRadius;
            
            d.startAngle = radians(d.x)-radians(d.dx/2);
            d.endAngle = radians(d.x)+radians(d.dx/2);

            return d;
        });

        maxRadius.domain([0,
                          d3.max(bins.map(function (d) { return d.innerRadius+d.y; }))]);

        bins = bins.map(function (d) {
            d.outerRadius = maxRadius(d.innerRadius+d.y);
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

    angle_histogram.innerRadius = function (x) {
        if (!arguments.length) return innerRadius;
        innerRadius = x;
        return angle_histogram;
    };
    
    angle_histogram.maxRadius = function (x) {
        if (!arguments.length) return maxRadius;
        if (typeof x === 'function') {
            maxRadius = x;
        }else{
            maxRadius.range([0, x]);
        }
        return angle_histogram;
    };

    return angle_histogram;
};
