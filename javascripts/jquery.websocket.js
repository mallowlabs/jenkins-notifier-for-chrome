(function($) {
    jQuery.fn.webSocket = function(config){
	var defaults = {
	    _class    : WebSocket,
	    entry : 'ws://' + location.hostname + ':18081/room',
	};
	config = jQuery.extend(defaults, config);

	var target = this;
	function fire(name, data){
	    target.trigger(name, data);
	}

	var ws = new config._class(config.entry);
	ws.onopen = function() {
	    fire('websocket::connect', ws);
	}
	ws.onmessage = function(text){
	    var obj = jQuery.parseJSON(text.data);
	    fire('websocket::message', obj);
	}

	ws.onerror = function(){
            console.log(msg);
	    fire('websocket::error', ws);
	}

        // detect url error
        setTimeout(function() {
            if(ws == null || ws.readyState != 1){
	        fire('websocket::error', ws);
            }
        }, 5000);

        // auto reconnect
        ws.bind("websocket::close", function() {
            setTimeout(function(){ wait(wsUrl, url); }, 5000);
        });

        // resume
        var reload  = 300000;
        var before = new Date();
        setInterval(function(){
            var current = new Date();
            var diff = current - before;
            if ( before > reload ) {
                wait(websocketUrl, url);
            }
            before = current;
        },reload);

	return this;
    }
})(jQuery);
