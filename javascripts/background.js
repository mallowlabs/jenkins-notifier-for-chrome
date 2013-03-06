$(function(){
    var apiUrl = localStorage["jenkins-url"];
    var jobName = localStorage["job-name"];
    var useWebsocket   = localStorage["use-websocket"];
    var websocketUrl   = localStorage["websocket-url"];
    var pollingInterval    = localStorage["polling-interval"];

    if(pollingInterval == null) {
        pollingInterval = 60; // default 60 sec
    }

    if (apiUrl == null || jobName == null || (useWebsocket == 'true' && websocketUrl == null)) {
        return;
    }

    apiUrl = appendLastSlash(apiUrl);
    var prevBuild = -1;
    var JOB = "job/"
    var BUILD_NUMBER = "lastBuild"
    var API_SUB  = "/api/json";
    var POLLING_TIME = pollingInterval * 1000;

    $.ajaxSetup({
        "error": function() {
            $.fn.desktopNotify(
                {
                    picture: getIcon("FAILURE"),
                    title: "Failed to access to Jenkins",
                    text : apiUrl
                }
            );
        }
    });

    function appendLastSlash(url) {
        var lastChar = url.substring(url.length - 1);
        if (lastChar != "/") {
            return url + "/";
        }
        return url;
    }

    function getIcon(result) {
        var url = "images/blue.png";
        if (result == "UNSTABLE") {
            url = "images/yellow.png";
        } else if (result == "FAILURE") {
            url = "images/red.png";
        } else if (result == "ABORTED") {
            url = "images/grey.png";
        }
        return url;
    }

    function getColor(result) {
        var color = [0, 0, 255, 200];
        if (result == "UNSTABLE") {
            color =  [255, 255, 0, 200];
        } else if (result == "FAILURE") {
            color = [255, 0, 0, 200];
        } else if (result == "ABORTED") {
            color = [200, 200, 200, 200];
        }
        return color;
    }

    // replace popup event
    chrome.browserAction.setPopup({popup : ""});
    chrome.browserAction.onClicked.addListener(function(tab) {
        window.open(apiUrl + JOB + jobName);
    });

    function fetch(apiUrl, num) {
        if (num == null) {
            num = BUILD_NUMBER;
        }
        var url = apiUrl + JOB + jobName + "/" + num + API_SUB;

        $.getJSON(url, function(json, result) {
            if (result != "success") {
                return;
            }
            if (prevBuild != json.number) {
                prevBuild = json.number;
                chrome.browserAction.setBadgeText({text: String(json.number)});
                chrome.browserAction.setBadgeBackgroundColor({color: getColor(json.result)});
                $.fn.desktopNotify(
                    {
                        picture: getIcon(json.result),
                        title: "#" + json.number + " (" + json.result + ")",
                        text : json.actions[0].causes[0].shortDescription
                    }
                );
            }
        });
    }

    var retryTime = 2500;
    function bind(wsUrl, apiUrl) {
        var ws = $("<div />");

        ws.bind("websocket::connect", function() {
            console.log('opened connection');
            retryTime = 5000;
        });

        ws.bind("websocket::message", function(_, obj) {
            if (obj.project == jobName) {
                fetch(apiUrl, obj.number);
            }
        });

        ws.bind("websocket::error", function() {
            $.fn.desktopNotify(
                {
                    picture: getIcon("FAILURE"),
                    title: "Failed to access to Jenkins Websocket Notifier. Please check your websocket URL",
                    text : wsUrl
                }
            );
        });

        // auto reconnect
        ws.bind('websocket::close', function() {
            console.log('closed connection');
            retryTime *= 2;
            setTimeout(function() {
                bind(websocketUrl, apiUrl);
            }, retryTime);
        });

        ws.webSocket({
            entry : wsUrl
        });
    }

    if (useWebsocket == 'true') {
        bind(websocketUrl, apiUrl);
    } else {
        fetch(apiUrl, BUILD_NUMBER); // first fetch
        setInterval(function() {
            fetch(apiUrl, BUILD_NUMBER);
        }, POLLING_TIME);
    }
});
