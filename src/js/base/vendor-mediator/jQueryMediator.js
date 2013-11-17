define(['jquery'], function($){
    
    //configuration object which whitelists allowed functionality.
    //The MediatedQueryObject's prototype will end up with functions and properties
    //which match these entries. 
    //Functions created based off of these entries will act as simple passthroughs to the underlying jquery lib.
    var isConfigFrozen = false;
    var defaults = {
        //array of function names for functions that allow chaining.
        allowedChainedFunctions: [], //['find', 'addClass', 'removeClass', 'toggleClass', 'append', 'appendTo', 'remove', 'show', 'hide' ],
        //array of function names for functions that do not allow chaining.
        allowedNonChainedFunctions: [], //[ 'hasClass' ],
        //when the result is an instance of jQuery, wraps result with jQueryMediator so chained functions only get allowed functions.
        //if not an instance of jquery, unmodified result
        allowedFunctions: [], //['html'],
        //exposed properties from the jquery object.
        //$('#someEl').length
        allowedProps: [], //[ 'length' ],
        //exposed functions and properties from the jquery function.
        //$.ajax({...}).done(function(){...})
        allowedJQueryFunctionProperties: [], //['data', 'ajax'],
        //e.g. $('#someEl')[0]
        provideAccessToDomElementArray: true,

        //explicit functions allow you to define mediated functions for tricky scenarios, as well as add
        //custom functions you wish to expose.
        explicitFunctions:{
            //we explicitly define functions that are sometimes chainable.
            //gets or sets html
//            html: function(newHtml){
//                if(newHtml){ //chainable
//                    var $result = this._$el.html(newHtml);
//                    //chained result shouldn't allow access to functions we don't allow.
//                    return jQueryMediator.mediator.mediateJQueryResult($result);
//                }
//                //return the non-chainable result. e.g. string "<div>content</div>"
//                return this._$el.html();
//            },
            //gets or sets an attribute
//            attr: function(attr, value){
//                if(typeof value != "undefined"){//chainable
//                    var $result = this._$el.attr(attr, value);
//                    //chained result shouldn't allow access to functions we don't allow.
//                    return jQueryMediator.mediator.mediateJQueryResult($result);
//                }
//                //return the non-chainable result. e.g. string "attributeValue"
//                return this._$el.attr(attr);
//            }
        },

        //primary mediator function for the jquery function $()
        _jQueryMediator: function(selector, context){
            //execute the query function, using the same arguments passed into this function
            //var $el = $.apply($, arguments); //this is slower than calling directly
            var $el = $(selector, context);
            //wrap the $el result with a mediator object that only exposes the allowed jquery functions.
            return jQueryMediator.mediator.mediateJQueryResult($el);
        },
        //wrapper object for the jquery query result object.
        //Acts as a mediator for all interactions with the jquery object.
        _MediatedQueryObject: function MediatedQueryObject($el){
            //for performance and convenience.
            //Direct access to the underlying jquery object is discouraged, but is there if you really need it.
            this._$el = $el;

            //expose allowed props like .length  and array access  $('#someEl')[0]
            config._exposeAllowedjQueryObjectProperties(this, $el);
        },

        _setMediatedQueryObjectPrototype: function (){
            this._MediatedQueryObject.prototype = this.explicitFunctions;
        },
        //you can override how allowed jquery functions are created and exposed.
        //expose $.func function properties (data, extend, ajax, etc)
        _createAllowedJqueryFunctions: function createAllowedJqueryFunctions(){
            for(var i=0; i < this.allowedJQueryFunctionProperties.length; ++i){
                var allowedFuncProp = this.allowedJQueryFunctionProperties[i];
                this._createAllowedJQueryFunction(allowedFuncProp);
            }
        },
        _createAllowedJQueryFunction: function createAllowedJqueryFunction(allowedFuncProp){
            jQueryMediator[allowedFuncProp] = function(){
                return $[allowedFuncProp].apply($, arguments);
            };
        },

        //dynamically create the prototype by iterating over the allowed functions and assigning mediator functions to the prototype.
        //these types of functions are simply pass throughs to the underlying library.
        _createPrototypeForMediatedQueryObject: function createPrototypeForMediatedQueryObject(){
//            for(var i =0, allowedFunctionName; undefined !== (allowedFunctionName = this.allowedChainedFunctions[i]); ++i){
//                this._createChainablePrototypeFunction(allowedFunctionName);
//            }
//            for(i =0, allowedFunctionName; undefined !== (allowedFunctionName = this.allowedNonChainedFunctions[i]); ++i){
//                this._createNonChainablePrototypeFunction(allowedFunctionName);
//            }
            for(var i =0, allowedFunctionName; undefined !== (allowedFunctionName = this.allowedFunctions[i]); ++i){
                this._createPrototypeFunction(allowedFunctionName);
            }
        },
        _createPrototypeFunction: function (funcName){
            this._MediatedQueryObject.prototype[funcName] = function(){
                var result = this._$el[funcName].apply(this._$el, arguments);
                if(result instanceof $){  //chained results should only have functions we allow.
                    result = jQueryMediator.mediator.mediateJQueryResult(result);
                }
                return result;
            };
        },
        //creates a function that expects a jquery object to be the result when the underlying jquery function is executed.
        //wraps and returns the result in a MediatedQueryObject
        _createChainablePrototypeFunction: function (funcName){
            this._MediatedQueryObject.prototype[funcName] = function(){
                var $res = this._$el[funcName].apply(this._$el, arguments);
                return jQueryMediator.mediator.mediateJQueryResult($res); //chained results should only have functions we allow.
            };
        },
        ////creates a function that returns the jquery function result.
        _createNonChainablePrototypeFunction: function (funcName){
            this._MediatedQueryObject.prototype[funcName] = function(){
                var res = this._$el[funcName].apply(this._$el, arguments);
                return res;
            };
        },

        _exposeAllowedjQueryObjectProperties: function (mediatedQueryObject, $el){
            for(var i =0, allowedPropName; undefined !== (allowedPropName = this.allowedProps[i]); ++i){
                mediatedQueryObject[allowedPropName] = $el[allowedPropName];
            }
            //expose access to the dom element array. e.g. $('#someEl')[0]
            if(this.provideAccessToDomElementArray){
                for(var x=0, length=$el.length; x < length; ++x){
                    mediatedQueryObject[x] = $el[x];
                }
            }
        }
    };

    var config = defaults,
        jQueryMediator = config._jQueryMediator;

    //expose a mediator object on the jQueryMediator function so configuration can be set.
    jQueryMediator.mediator = {
        //allows the jQueryMediator to be configured at runtime.
        setConfig: function (newConfig){
            if(isConfigFrozen){return;}
            config = $.extend({}, defaults, newConfig);//merge newConfig with defaults.

            //init jQueryMediator and MediatedQueryObject
            jQueryMediator = config._jQueryMediator;
            config._createAllowedJqueryFunctions();
            config._setMediatedQueryObjectPrototype();
            config._createPrototypeForMediatedQueryObject();
        },
        getConfig: function(){
            return config; //todo: clone this so it cant be modified.
        },
        //prevent further runtime configurations.
        freezeConfig: function (){
            isConfigFrozen = true;
        },
        //allow explicit functions to call $.mediator.mediateJQueryResult so that chained results are mediated.
        //this can be overridden if necessary.
        mediateJQueryResult: function($el){
            return new config._MediatedQueryObject($el);
        }
    };

    jQueryMediator.mediator.setConfig(defaults);

    return jQueryMediator;    
});