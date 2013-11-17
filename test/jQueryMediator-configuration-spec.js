define(['jquery', 'core', 'jasmine', 'base/vendor-mediator/jQueryMediator'], function(jquery, core, jasmine, $){
    core.log('jquery mediator spec module loaded');

    //test that our assumptions about how the mediator works are correct.
    //I do not intend on testing every function here, just enough to ensure that the mediator acting appropriately as a passthrough.
    describe("jQueryMediator configuration", function(){
        it("should allow configuration to be set at runtime", function(){
            $._setConfig({
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
                allowedProps: [
                    'length'  //$('#someEl').length
                ],
                //exposed functions and properties from the jquery function.
                allowedJQueryFunctionProperties: [
                    'data',
                    'ajax'  //$.ajax({...}).done(function(){...})
                ],
                //e.g. $('#someEl')[0]
                provideAccessToDomElementArray: true,

                explicitFunctions:{
                    //we explicitly define functions that are sometimes chainable.
                    //(this could also probably be done by checking if the result is an instance of jquery object)
                    //gets or sets html
                    html: function(newHtml){
                        if(newHtml){ //chainable
                            var $result = this._$el.html(newHtml);
                            return $.mediator.mediateJQueryResult($result);//chained result shouldn't allow functions we dont allow
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
        });
    });
});