require.config({
    baseUrl: 'src/js',
    paths:{
        jquery: 'vendor/jquery-1.9.0.min',
        core: 'base/core'
    },
    map:{
       
    }
});

define(['jquery', 'core'], function($, core){
    core.log('main module loaded');
    
    $(function(){
        core.log('document ready');
    });
});