
var figue = require("./libs/figue"),
    data = require("./data/clustering-data.json");

var labels = new Array(),
    vectors = new Array();

data.forEach(function (d) {
    labels.push(d.label);
    vectors.push(d.vector);
});

// var clusters = figue.kmeans(50, vectors);

// console.log(clusters.centroids);

console.log(new Date());

var root = figue.agglomerate(labels, 
                             vectors , 
                             figue.EUCLIDIAN_DISTANCE,
                             figue.SINGLE_LINKAGE);

console.log("Done!", new Date());
