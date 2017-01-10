//db logic
var db, Url;
chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
}, function (array_of_Tabs) {
    Url = array_of_Tabs[0].url.split('/')[2];
});


function indexedDBOk() {
    return "indexedDB" in window; //checking the availablilty of indexedDB
}
document.addEventListener("DOMContentLoaded", function () {

    if (!indexedDBOk) return;
    // indexedDB.deleteDatabase("chromeexten1");
    var openRequest = indexedDB.open("chromeexten1", 1); //creating the database

    openRequest.onupgradeneeded = function (e) {
        var thisDB = e.target.result;
        console.log("running onupgradeneeded");
        if (!thisDB.objectStoreNames.contains("websites")) {
            var os = thisDB.createObjectStore("websites", {
                keyPath: "website"
            });
        }
    }
    openRequest.onsuccess = function (e) {
        console.log("running onsuccess");
        var json;
        db = e.target.result;
        var getResult = db.transaction(["websites"], "readwrite").objectStore("websites").get(Url);
        getResult.onsuccess = function (e) {
            if (e.target.result) {
                json = e.target.result;
            } else
                json = {
                    "website": Url,
                    "items": [{
                        "name": "object",
                        "value": 0
                    }, {
                        "name": " image",
                        "value": 0
                    }, {
                        "name": "main_frame",
                        "value": 0
                    }, {
                        "name": "other",
                        "value": 0
                    }, {
                        "name": "script",
                        "value": 0
                    }, {
                        "name": "stylesheet",
                        "value": 0
                    }, {
                        "name": "sub_frame",
                        "value": 0
                    }, {
                        "name": "xmlhttprequest",
                        "value": 0
                    }]
                }
            document.getElementById("total").innerHTML = "Total: " + getTotal(json) + " KB&nbsp";

            (function () {
                console.log("barchart function called");
                var margin = {
                    top: 50,
                    bottom: 50,
                    left: 130,
                    right: 40
                };
                var width = 540 - margin.left - margin.right;
                var height = 260 - margin.top - margin.bottom;

                var xScale = d3.scale.linear().range([0, width]);
                var yScale = d3.scale.ordinal().rangeRoundBands([0, height], 1.8, 0);

                var numTicks = 5;
                console.log((-height));
                var xAxis = d3.svg.axis().scale(xScale)
                    .orient("top")
                    .tickSize((-height))
                    .ticks(numTicks);


                var svg = d3.select("tr#tab").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .attr("class", "base-svg");

                var barSvg = svg.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .attr("class", "bar-svg");

                var x = barSvg.append("g")
                    .attr("class", "x-axis");
                var data = json.items;
                var xMax = d3.max(data, function (d) {
                    return d.value;
                });
                var xMin = 0;
                xScale.domain([xMin, xMax]);
                yScale.domain(data.map(function (d) {
                    return d.name;
                }));
                d3.select(".base-svg").append("text")
                    .attr("x", margin.left)
                    .attr("y", (margin.top) / 2)
                    .attr("text-anchor", "start")
                    .text(json.website)
                    .attr("class", "title");

                var groups = barSvg.append("g").attr("class", "labels")

                .selectAll("text")
                    .data(data)
                    .enter()
                    .append("g");

                groups.append("text")

                .attr("x", "0")
                    .attr("y", function (d) {
                        return yScale(d.name);
                    })
                    .text(function (d) {
                        return d.name;
                    })
                    .attr("text-anchor", "end")
                    .attr("dy", ".9em")
                    .attr("dx", "-.32em")
                    .attr("class", "yaxis")
                    .attr("id", function (d, i) {
                        return "label" + i;
                    });

                var bars = groups
                    .attr("class", "bars")
                    .append("rect")

                .attr("width", function (d) {
                    return xScale(d.value);
                })

                .attr("height", height /
                    10)
                    .attr("x", xScale(xMin))
                    .attr("y", function (d) {
                        return yScale(d.name);
                    })
                    .attr("id", function (d, i) {
                        return "bar" + i;
                    });

                groups.append("text")
                    .attr("x", function (d) {
                        return xScale(d.value);
                    })
                    .attr("y", function (d) {
                        return yScale(d.name);
                    })
                    .text(function (d) {
                        if (d.value > 10)
                            return Math.round(d.value) + "KB";
                        else {
                            return "";
                        }
                    })
                    .attr("text-anchor", "end")
                    .attr("dy", "1.2em")
                    .attr("dx", "-.32em")
                    .attr("id", "precise-value")

                bars
                    .on("mouseover", function () {
                        var currentGroup = d3.select(this.parentNode);
                        currentGroup.select("rect").style("fill", "#e32e2e");
                        currentGroup.select("text").style("font-weight", "bold");
                    })
                    .on("mouseout", function () {
                        var currentGroup = d3.select(this.parentNode);
                        currentGroup.select("rect").style("fill", "steelblue");
                        currentGroup.select("text").style("font-weight", "normal");
                    });

                x.call(xAxis);
                var grid = xScale.ticks(numTicks);
                barSvg.append("g").attr("class", "grid")

                .selectAll("line")
                    .data(grid, function (d) {
                        return d;
                    })
                    .enter().append("line")
                    .attr("y1", 0)
                    .attr("y2", height + margin.bottom)
                    .attr("x1", function (d) {
                        return xScale(d);
                    })
                    .attr("x2", function (d) {
                        return xScale(d);
                    })
                    .attr("stroke", "#fafafa");


            })();
        }
    }
    openRequest.onerror = function (e) {
        console.log("error occured");
    }


}, false);

function getTotal(json) {
    var tot = 0;
    for (i = 0; i < json.items.length; i++) {
        tot += json.items[i].value
    }
    return Math.round(tot);
}