$(function() {
    function eachField(f) {
        $(".text").each(function(_, elem) {
            var elem = $(elem);
            f(elem);
        });
    }
    function restore() {
        eachField(function(elem) {
            var name = elem.attr("name");
            elem.attr("value", localStorage[name]);
        });
    }
    function save() {
        eachField(function(elem) {
            var name = elem.attr("name");
            localStorage[name] = elem.attr("value");
        });
        chrome.extension.getBackgroundPage().window.location.reload();
    }

    restore();
    $(".save").bind("click", function(e) {
        e.preventDefault();
        save();
        window.close();
    });
});
