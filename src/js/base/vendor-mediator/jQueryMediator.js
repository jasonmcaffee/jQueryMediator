define(['jquery'], function($){
    
    //configuration object which whitelists allowed functionality.
    //The MediatedQueryObject's prototype will end up with functions and properties
    //which match these entries. 
    //Functions created based off of these entries will act as simple passthroughs to the underlying jquery lib.
    var isConfigFrozen = false;
    var config = {
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
            //gets or sets html
            html: function(newHtml){
                if(newHtml){ //chainable
                    var $result = this._$el.html(newHtml);
                    return jQueryMediator.mediator.mediateJQueryResult($result);//chained result shouldn't allow functions we dont allow
                }
                return this._$el.html();
            },

            attr: function(attr, value){
                if(typeof value != "undefined"){//chainable
                    var $result = this._$el.attr(attr, value);
                    return jQueryMediator.mediator.mediateJQueryResult($result);
                }
                return this._$el.attr(attr);
            },

            //custom functions #############################################################
            //performance comparison
            find2: function(selector){
                return jQueryMediator.mediator.mediateJQueryResult(this._$el.find(selector));
            },

            changeClass: function(toClass, fromClass){
                this._$el.addClass(toClass).removeClass(fromClass);
            }


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
            for(var i =0, allowedFunctionName; undefined !== (allowedFunctionName = this.allowedChainedFunctions[i]); ++i){
                this._createChainablePrototypeFunction(allowedFunctionName);
            }
            for(i =0, allowedFunctionName; undefined !== (allowedFunctionName = this.allowedNonChainedFunctions[i]); ++i){
                this._createNonChainablePrototypeFunction(allowedFunctionName);
            }
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
        _setMediatedQueryObjectPrototype: function (){
            this._MediatedQueryObject.prototype = this.explicitFunctions;
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

        //primary mediator function for the jquery function $()
        _jQueryMediator: function(selector, context){
            //execute the query function, using the same arguments passed into this function
            //var $el = $.apply($, arguments); //this is slower than calling directly
            var $el = $(selector, context);
            //wrap the $el result with a mediator object that only exposes the allowed jquery functions.
            return jQueryMediator.mediator.mediateJQueryResult($el);
        }
    };

    var jQueryMediator = config._jQueryMediator;
    config._createAllowedJqueryFunctions();

    //expose a mediator object on the jQueryMediator function so configuration can be set.
    jQueryMediator.mediator = {
        //allows the jQueryMediator to be configured at runtime.
        setConfig: function (newConfig){
            if(isConfigFrozen){return;}
            config = newConfig;
            config._createAllowedJqueryFunctions();
        },
        getConfig: function(){
            return config; //todo: clone this so it cant be modified.
        },
        //prevent further runtime configurations.
        freezeConfig: function (){
            isConfigFrozen = true;
        },
        //allow explicit functions to call $.mediator.exposeFunctions so that chained results are mediated.
        mediateJQueryResult: function($el){
            return new config._MediatedQueryObject($el);
        }
    };

    config._setMediatedQueryObjectPrototype();
    config._createPrototypeForMediatedQueryObject();


    return jQueryMediator;    
});