(function($) {
    $.fn.webSocket = function(config){
        var defaults = {
            _class : WebSocket,
            entry  : 'ws://' + location.hostname + ':8081/jenkins',
        };
        config = $.extend(defaults, config);

        var target = this;
        function fire(name, data){
            target.trigger(name, data);
        }

        var ws = new config._class(config.entry);
        ws.onopen = function() {
            fire('websocket::connect', ws);
        }

        ws.onmessage = function(text){
            var obj = $.parseJSON(text.data);
            fire('websocket::message', obj);
        }

        ws.onerror = function(){
            fire('websocket::error', ws);
        }

        ws.onclose = function(){
            fire('websocket::close', ws);
        }

        // detect url error
        setTimeout(function() {
            if(ws == null || ws.readyState != 1){
                fire('websocket::error', ws);
            }
        }, 5000);

        return this;
    }
})(jQuery);
