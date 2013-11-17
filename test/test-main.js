require.config({
    baseUrl: 'src/js',
    paths:{
        test: '../../',
        jquery: 'vendor/jquery-1.9.0.min',
        core: 'base/core',
        jasmine: '../../test/vendor/jasmine',
        'jasmine-html': '../../test/vendor/jasmine-html'
    },
    map:{},
    shim:{
        jasmine: {
            exports: 'jasmine'
        },
        'jasmine-html': {
            deps: ['jasmine'],
            exports: 'jasmine'
        }
    }
});


//main starting point for running all specs.
define([
    'jquery', 
    'core', 
    'jasmine', 
    'jasmine-html', 
    '../../test/jQueryMediator-spec',
    '../../test/jQueryMediator-configuration-spec' //should be last since it freezes config
], function($, core, jasmine, jasmineHtml, jQueryMediatorSpec, jQueryMediatorConfigurationSpec){
    core.log('test main module loaded'); 

    var env = jasmine.getEnv();
    env.addReporter(new jasmine.HtmlReporter());
    env.execute();
    
    core.log('done running all specs');
});