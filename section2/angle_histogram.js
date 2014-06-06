
d3.layout.angle_histogram = function () {
    var histogram = d3.layout.histogram(),
        innerRadius = 0,
        maxHeight = d3.scale.linear();

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

        maxHeight.domain([d3.min(bins.map(function (d) { return d.y; })),
                          d3.max(bins.map(function (d) { return d.y; }))]);

        bins = bins.map(function (d) {
            d.outerRadius = d.innerRadius+maxHeight(d.y);
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
    
    angle_histogram.maxHeight = function (x, scale) {
        if (!arguments.length) return maxHeight;

        if (typeof x === 'function') {
            maxHeight = x;
        }else{
            maxHeight.range([0, x]);
        }

        return angle_histogram;
    };

    return angle_histogram;
};
