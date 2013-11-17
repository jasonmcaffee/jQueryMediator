define([], function(){
    function log(){
        if(window.console && window.console.log){
            console.log.apply(console, arguments);
        }    
    } 
    
    return log;
});