
d3.layout.angle_histogram = function () {
    var histogram = d3.layout.histogram(),
        innerRadius = 0,
        maxHeight = d3.scale.linear(),
        minHeight = 0,
        startAngle = 0,
        endAngle = 2*Math.PI;

    function angle_histogram (data, i) {
        var bins = histogram.call(this, data, i),
            _startAngle = typeof startAngle === 'function'
                ? startAngle.apply(this, arguments)
                : startAngle,
            _endAngle = typeof startAngle === 'function'
                ? endAngle.apply(this, arguments)
                : endAngle,
            radians = d3.scale.ordinal()
                .domain(bins.map(function (d) { return d.x; }))
                .rangeBands([_startAngle, _endAngle], 0, 0);

        maxHeight.domain([typeof minHeight === 'function'
                            ? minHeight(d3.min(bins.map(function (d) { return d.y; }))) 
                            : minHeight,
                          d3.max(bins.map(function (d) { return d.y; }))]);

        bins = bins.map(function (d, i) {
            d.innerRadius = typeof innerRadius === 'function' ?     
                innerRadius(d, i) : innerRadius;

            d.value = histogram.value()(d[0]);
            d.startAngle = radians(d.x)-radians.rangeBand()/2;
            d.endAngle = radians(d.x)+radians.rangeBand()/2;
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
    
    angle_histogram.maxHeight = function (x) {
        if (!arguments.length) return maxHeight;

        if (typeof x === 'function') {
            maxHeight = x;
        }else{
            maxHeight.range([0, x]);
        }

        return angle_histogram;
    };

    angle_histogram.minHeight = function (x) {
        if (!arguments.length) return minHeight;
        minHeight = x;
        return angle_histogram;
    };

    angle_histogram.startAngle = function (x) {
        if (!arguments.length) return startAngle;
        startAngle = x;
        return angle_histogram;
    };

    angle_histogram.endAngle = function (x) {
        if (!arguments.length) return endAngle;
        endAngle = x;
        return angle_histogram;
    };

    return angle_histogram;
};
