var contLen = 0;
var Url = "not specified"
var requestFilter = {
        urls: ["<all_urls>"]
    },
    extraInfoSpec = ['responseHeaders'],
    handler = function (details) {
        var headers = details.responseHeaders;
        for (var i = 0, l = headers.length; i < l; ++i) {
            if (/content-length|Content-Length/g.test(headers[i].name)) {
                contLen = (parseFloat(headers[i].value));
                break;
            }
        }
        chrome.tabs.get(details.tabId, function (Tab) {
            Url = extractDomain(Tab.url);
            var result;
            var getResult = db.transaction(["websites"], "readwrite").objectStore("websites").get("nohing");
            getResult.onsuccess = function (e) {
                var res = e.target.result;
                if (res) {
                    result = res;
                } else {
                    result = {
                        "website": Url,
                        "items": [{
                            "name": "object",
                            "value": 123,
                            "unit": 1
                                }, {
                            "name": "image",
                            "value": 223,
                            "unit": 1
                                }, {
                            "name": "main_frame",
                            "value": 345,
                            "unit": 1
                              }, {
                            "name": "other",
                            "value": 123,
                            "unit": 1
                                 }, {
                            "name": "script",
                            "value": 89,
                            "unit": 1
                                 }, {
                            "name": "stylesheet",
                            "value": 987,
                            "unit": 1
                                }, {
                            "name": "sub_frame",
                            "value": 678,
                            "unit": 1
                              }, {
                            "name": "xmlhttprequest",
                            "value": 10000,
                            "unit": 1
                              }]
                    };
                }
                var tot = getTotal(result) / 2;

                for (var i = 0; i < result.items.length; i++) {
                    if (result.items[i].value > tot && result.items[i].value > 9000) {
                        result.items[i].unit += 9;
                    }
                    if (result.items[i].name == details.type)
                        result.items[i].value = parseFloat(((result.items[i].value) + (contLen / 1024)) / result.items[i].unit);

                }
                var putRes = db.transaction(["websites"], "readwrite").objectStore("websites");
                var request = putRes.put(result);
                request.onerror = function (e) {
                    alert("Sorry, that email address already exists.");
                    console.log("Error", e.target.error.name);
                    console.dir(e.target);
                }
                request.onsuccess = function (e) {
                    console.log("done" + result.website);
                }
            }


        });

    }
chrome.webRequest.onCompleted.addListener(handler, requestFilter, extraInfoSpec);

function extractDomain(url) {
    return url.split('/')[2];
}

function getTotal(json) {
    var tot = 0;
    for (i = 0; i < json.items.length; i++) {
        tot += json.items[i].value
    }
    return Math.round(tot);
}

//database logic


var db;

function indexedDBOk() {
    return "indexedDB" in window; //checking the availablilty of indexedDB
}
document.addEventListener("DOMContentLoaded", function () {

    if (!indexedDBOk) return;
    indexedDB.deleteDatabase("chromeexten1");
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
        db = e.target.result;
    }

    openRequest.onerror = function (e) {
        console.log("error occured");
    }


}, false);