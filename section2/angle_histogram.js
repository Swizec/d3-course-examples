
d3.layout.angle_histogram = function () {
    var histogram = d3.layout.histogram(),
        innerRadius = 0,
        maxHeight = d3.scale.linear(),
        minHeight = 0,
        startAngle = 0,
        endAngle = 2*Math.PI;

    function angle_histogram(data, i) {        
        var binned = histogram.call(this, data, i),
            _startAngle = typeof startAngle === 'function'
                ? startAngle.apply(this, arguments)
                : startAngle,
            _endAngle = typeof endAngle === 'function'
                ? endAngle.apply(this, arguments)
                : endAngle;

        var radians = d3.scale.linear()
                .domain([0, d3.max(binned.map(function (d) { return d.x; }))])
                .range([_startAngle, _endAngle]);

        binned = binned.map(function (d) {
            d.innerRadius = typeof innerRadius === 'function'
                ? innerRadius(d, i)
                : innerRadius;

            d.value = histogram.value()(d[0]);
            d.outerRadius = d.innerRadius+d.y;
            d.startAngle = radians(d.x)-radians(d.dx/2);
            d.endAngle = radians(d.x)+radians(d.dx/2);

            return d;
        });

        maxHeight.domain([typeof minHeight === 'function'
                          ? minHeight(d3.min(binned.map(
                              function (d) { return d.y; })))
                          : minHeight,
                          d3.max(binned.map(function (d) { return d.y; }))]);

        binned = binned.map(function (d) {
            d.outerRadius = d.innerRadius+maxHeight(d.y);
            return d;
        });

        return binned;
    }

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
