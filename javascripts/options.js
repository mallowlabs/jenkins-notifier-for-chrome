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
            elem.attr( "value", localStorage[name]);
        });

        if(localStorage['use-websocket'] == 'true') {
            $("#use-websocket").attr("checked","checked")
        }else{
            $("#use-websocket").attr("checked","")
        }
        update();
    }
    function save() {
        eachField(function(elem) {
            var name = elem.attr("name");
            localStorage[name] = elem.attr("value");
        })
        localStorage['use-websocket'] = $("#use-websocket").attr("checked");

        chrome.extension.getBackgroundPage().window.location.reload();
    }
    function update(){
        if($("#use-websocket").attr("checked")){
            $("#websocket-url").attr("disabled","");
        }else{
            $("#websocket-url").attr("disabled","disabled");
        }
    }

    restore();
    $(".save").bind("click", function(e) {
        e.preventDefault();
        save();
        window.close();
    });

    $("#use-websocket").bind("change",function(e){
        update();
    })
});
