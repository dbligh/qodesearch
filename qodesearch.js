// Written by Daniel Bligh

(function( $ ) {
    $.fn.qodeSearch = function( options, callback ) {
        var thisObj = this;
        var settings = $.extend({
            url: "#",
            method: "POST",
            limit: 10,
            delay: 200,
            searchField: "search",
            senddata: {},
            displayorder: {},
            resultCSS: {
                backgroundColor: "white",
                position: "absolute",
                width: thisObj.width(),
                borderBottom: "1px dotted grey",
                paddingTop: "10px",
                paddingBottom: "10px",
                paddingLeft: "10px",
                paddingRight: "10px",
            },
            highlightCSS: {
                backgroundColor: "yellow",
            }
        }, options );
        this.focusout(function(){
            $(".qodeResults").remove();
        });
        
        var currentHighlight = -1;
        var jsonResponse;
        
        this.keyup(function(e){
            if (e.keyCode === 38 || e.keyCode === 40) {
                switch(e.keyCode){
                    case 38: {
                        // don't go into negatives
                        if( currentHighlight > -1 ) 
                            currentHighlight--;
                    }break;
                    case 40: {
                        // don't exceed the limit of the results
                        if( currentHighlight < $(".qodeResults").size() ) 
                        currentHighlight++;
                    }break;
                }
                $(".qodeResults").each(function(index){
                    if( index !== currentHighlight )
                        $(this).css(settings.resultCSS);
                    else
                        $(this).css(settings.highlightCSS);
                });
                return this;
            }
            
            if( e.keyCode === 13 ){
                if (typeof callback === 'function') { // make sure the callback is a function
                    $(".qodeResults").each(function(index){
                        if( index === currentHighlight ){
                            callback.call(this, jsonResponse[index]); // brings the scope to the callback
                        }
                    });
                    
                }
            }
            
            var currentValue = thisObj.val();
            setTimeout(function(){
                if( currentValue == thisObj.val() ){
                    $(".qodeResults").remove();
                    currentHighlight = -1;
                    settings.senddata[settings.searchField] = thisObj.val();
                    $.ajax({
                        url: settings.url,
                        type: settings.method,
                        dataType: "json",
                        data: settings.senddata,
                    }).then(function(data){
                        jsonResponse = data;
                        for( var i = 0; i < data.length && i < settings.limit; i++){
                            var outputString = "";
                            $.each(data[i], function(key,value){
                                var regex = new RegExp( '(' + currentValue + ')', 'gi' );
                                outputString = outputString.concat( String(value).replace(regex, "<b>$1</b>") + "<br />" );
                            });
                            var newResult = $("<div/>");
                            newResult.addClass("qodeResults");
                            newResult.append(outputString);
                            $("body").append(newResult);
                            newResult.css(settings.resultCSS);
                            newResult.css({display: "none"});
                        }
                        
                        var topStart = thisObj.offset().top;
                        var topBuffer = thisObj.height() + 7;
                        
                        $(".qodeResults").each(function(index){
                            $(this).delay(100 * index).css({
                                top: topStart + topBuffer,
                                left: thisObj.offset().left
                            }).slideDown(100);
                            topBuffer = topBuffer + $(this).height() + parseInt($(this).css("paddingTop")) + parseInt($(this).css("paddingBottom")) + 1;
                            
                        });
                    });
                    $(".qodeResults").each(function(index){
                        $(this).hover($(".sentRes").append("in"), $(".sentRes").append("out"));
                    });
                }
                // discard event - value changes due to quick keystrokes
            }, settings.delay);  
        });
 
        return this;
 
    };
 
}( jQuery ));

$(".qodeSearch").qodeSearch({url: "Search", method: "POST", senddata: {mode:"site"}}, function(items){
    $.each(items, function(key,value){
        
    });
    document.location = "Sites?id=" + items["id"];
});