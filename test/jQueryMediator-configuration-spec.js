define(['jquery', 'core', 'jasmine', '../dist/jQueryMediator-0.0.1-requirejs-support.min'], function(jquery, core, jasmine, $){
    core.log('jquery mediator spec module loaded');
    //disabling now as multiple configurations (spec1 spec2) cause an issue.
    //test that our assumptions about how the mediator works are correct.
    //I do not intend on testing every function here, just enough to ensure that the mediator acting appropriately as a passthrough.
    xdescribe("jQueryMediator - Configuration", function(){
        it("should allow configuration to be set at runtime", function(){

            $.mediator.setConfig({
                //array of function names for functions that allow chaining.
                allowedChainedFunctions: [
                    'find',
                    'not',
                    'addClass',
                    'removeClass',
                    'toggleClass',
                    'clone',
                    'detached',
                    'append',
                    'appendTo',
                    'prepend',
                    'after',
                    'removeAttr',
                    'replaceWith',
                    'remove',
                    'show',
                    'hide',
                    'prev',
                    'next',
                    'toggle'
                ],
                //array of function names for functions that do not allow chaining.
                allowedNonChainedFunctions: [
                    'hasClass',
                    'outerHeight',
                    'height',
                    'data'
                ],
                //exposed properties from the jquery object.
                allowedProperties: [
                    'length'  //$('#someEl').length
                ],
                //exposed functions and properties from the jquery function.
                allowedJQueryFunctionProperties: [
                    'data',
                    'ajax'  //$.ajax({...}).done(function(){...})
                ],
                //e.g. $('#someEl')[0]
                provideAccessToDomElementArray: true,

                //when you need functionality other than the default pass through to jquery, you can
                //add an explicit function here.
                //when you return a jquery result object, you should first wrap it with the mediator via $.mediator.mediateJQueryResult($result)
                //so that only the allowed functions
                explicitFunctions:{
                    //we explicitly define functions that are sometimes chainable.
                    //(this could also probably be done by checking if the result is an instance of jquery object)
                    //gets or sets html
                    html: function(newHtml){
                        if(newHtml){ //chainable
                            var $result = this._$el.html(newHtml);
                            //chained result shouldn't allow functions we dont allow
                            return $.mediator.mediateJQueryResult($result);
                        }
                        return this._$el.html();
                    },

                    attr: function(attr, value){
                        if(typeof value != "undefined"){//chainable
                            var $result = this._$el.attr(attr, value);
                            return $.mediator.mediateJQueryResult($result);
                        }
                        return this._$el.attr(attr);
                    }
                }
            });

            //test some of our configured functions
            expect($.ajax).toBeDefined();
        });
    });
});
