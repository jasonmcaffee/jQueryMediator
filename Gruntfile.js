module.exports = function (grunt) {
    var buildVersion = "0.0.1",
        distFileNameNoRequirejsNoMin = 'jQueryMediator-' + buildVersion,
        distFileNameWithRequirejsNoMin = distFileNameNoRequirejsNoMin + '-requirejs-support',
        distFilePathWithRequirejsNoMin = 'dist/' + distFileNameWithRequirejsNoMin + '.js',
        minFileNameNoRequirejs = distFileNameNoRequirejsNoMin + ".min.js",
        minFileNameWithRequirejs = distFileNameWithRequirejsNoMin + ".min.js",
        jQueryMediatorDistFilePathNoRequirejs = 'dist/' + minFileNameNoRequirejs,
        jQueryMediatorDistFilePathWithRequirejs = 'dist/' + minFileNameWithRequirejs,
        jQueryMediatorSrcFilePath = 'src/js/base/vendor-mediator/jQueryMediator.js',
        uglifyConfig = {};
    //uglify from the dist to the dist.
    uglifyConfig[jQueryMediatorDistFilePathNoRequirejs] = [jQueryMediatorSrcFilePath];
    uglifyConfig[jQueryMediatorDistFilePathWithRequirejs] = [distFilePathWithRequirejsNoMin];

    grunt.initConfig({
        jQueryMediator:{
        },
        uglify: {
            options: {
                //http://lisperator.net/uglifyjs/compress
                compress:{
                    sequences     : false,  // join consecutive statemets with the “comma operator”
                    properties    : false,  // optimize property access: a["foo"] → a.foo
                    dead_code     : true,  // discard unreachable code
                    drop_debugger : true,  // discard “debugger” statements
                    unsafe        : false, // some unsafe optimizations (see below)
                    conditionals  : false,  // optimize if-s and conditional expressions
                    comparisons   : false,  // optimize comparisons
                    evaluate      : false,  // evaluate constant expressions
                    booleans      : false,  // optimize boolean expressions
                    loops         : false,  // optimize loops
                    unused        : true,  // drop unused variables/functions
                    hoist_funs    : false,  // hoist function declarations
                    hoist_vars    : false, // hoist variable declarations
                    if_return     : false,  // optimize if-s followed by return/continue
                    join_vars     : false,  // join var declarations
                    cascade       : false,  // try to cascade `right` into `left` in sequences
                    side_effects  : true,  // drop side-effect-free statements
                    warnings      : true,  // warn about potentially dangerous optimizations/code
                    global_defs   : {}     // global definitions
                },

                report: 'gzip'
            },
            jQueryMediator: {files: uglifyConfig}
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('create-requirejs-version', function(){
        var srcContents = "return " + grunt.file.read(jQueryMediatorSrcFilePath) +"\n";
        var beginStr = "define(['jquery'], function($){\n";
        var endStr = "});"
        var newContents = beginStr + srcContents + endStr;
        grunt.file.write(distFilePathWithRequirejsNoMin, newContents);
    });



    grunt.registerTask('build', ['create-requirejs-version', 'uglify:jQueryMediator']);

    grunt.registerTask('default', ['build']);
};