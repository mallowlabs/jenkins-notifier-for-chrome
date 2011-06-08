$(function(){
    var apiUrl = localStorage["jenkins-url"];
    var jobName = localStorage["job-name"];
    if (apiUrl == null || jobName == null) {
        return;
    }

    apiUrl = appendLastSlash(apiUrl);
    var prevBuild = -1;
    var JOB = "job/"
    var API_SUB  = "/lastSuccessfulBuild/api/json";
    var POLLING_TIME = 60 * 1000;

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
        var url = "images/blue.gif";
        if (result == "UNSTABLE") {
            url = "images/yellow.gif";
        } else if (result == "FAILURE") {
            url = "images/red.gif";
        }
        return url;
    }

    function getColor(result) {
        var color = [0, 0, 255, 200];
        if (result == "UNSTABLE") {
            color =  [255, 255, 0, 200];
        } else if (result == "FAILURE") {
            color = [255, 0, 0, 200];
        }
        return color;
    }

    // replace popup event
    chrome.browserAction.setPopup({popup : ""});
    chrome.browserAction.onClicked.addListener(function(tab) {
        window.open(apiUrl + JOB + jobName);
    });

    function fetch(url) {
        $.getJSON(url, function(json, result) {
            if (result != "success") {
                return;
            }
            if (true || prevBuild != json.number) {
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

    var url = apiUrl + JOB + jobName + API_SUB;
    fetch(url); // first fetch
    setInterval(function(){
        fetch(url);
    }, POLLING_TIME);
});
