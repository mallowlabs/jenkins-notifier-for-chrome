$(function(){
    var apiUrl = localStorage["jenkins-url"];
    var jobName = localStorage["job-name"];
    if (apiUrl == null || jobName == null) {
        return;
    }

    var prevBuild = -1;
    var JOB = "job/"
    var API_SUB  = "/lastSuccessfulBuild/api/json";

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
    
    var url = apiUrl + JOB + jobName + API_SUB;
    setInterval(function(){
        $.getJSON(url, function(json) {
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
    }, 1000);
});
