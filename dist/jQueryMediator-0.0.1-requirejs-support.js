define(['jquery'], function($){
return (function($){
    //allows config to be frozen i.e. not be modified any further.
    var isConfigFrozen = false;

    //default configuration option.
    //when jQueryMediator.mediator.setConfig is called, the new config parameter is merged with this object.
    var defaults = {
        //The MediatedQueryObject's prototype will end up with functions and properties that match these entries.
        //Functions created based off of these entries will act as simple passthroughs to the underlying jquery lib.
        //When the result is an instance of jQuery, the result is wrapped by jQueryMediator so chained functions only get allowed functions.
        //If the result is not an instance of jquery, unmodified result is returned.
        allowedFunctions: [], //['html'],

        //exposed properties from the jquery object.
        //$('#someEl').length
        allowedProperties: [], //[ 'length' ],

        //exposed functions and properties from the jquery function.
        //$.ajax({...}).done(function(){...})
        allowedJQueryFunctionProperties: [], //['data', 'ajax'],

        //allow mediated result objects to have array results.
        //e.g. $('#someEl')[0]
        provideAccessToDomElementArray: true,

        //explicit functions allow you to define mediated functions for tricky scenarios, as well as add
        //custom functions you wish to expose.
        explicitFunctions: {
            //we explicitly define functions that are sometimes chainable.
            //gets or sets html
            //html: function(newHtml){
            //  if(newHtml){ //chainable
            //      var $result = this._$el.html(newHtml);
            //      //chained result shouldn't allow access to functions we don't allow.
            //      return jQueryMediator.mediator.mediateJQueryResult($result);
            //  }
            //  //return the non-chainable result. e.g. string "<div>content</div>"
            //  return this._$el.html();
            //}
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

        //sets the prototype of the _MediatedQueryObject to the explicitFunctions defined in the config.
        _setMediatedQueryObjectPrototype: function (){
            this._MediatedQueryObject.prototype = this.explicitFunctions;
        },

        //expose $.func function properties (data, extend, ajax, etc)
        //Note: since this is a configuration property, you can override how allowed jquery functions are created and exposed.
        _createAllowedJqueryFunctions: function createAllowedJqueryFunctions(){
            for(var i=0; i < this.allowedJQueryFunctionProperties.length; ++i){
                var allowedFuncProp = this.allowedJQueryFunctionProperties[i];
                this._createAllowedJQueryFunction(allowedFuncProp);
            }
        },

        //creates a function on jQueryMediator
        _createAllowedJQueryFunction: function createAllowedJqueryFunction(allowedFuncProp){
            this._jQueryMediator[allowedFuncProp] = function(){
                return $[allowedFuncProp].apply($, arguments);
            };
        },

        //dynamically create the prototype by iterating over the allowed functions and assigning mediator functions to the prototype.
        //these types of functions are simply pass throughs to the underlying library.
        _createPrototypeForMediatedQueryObject: function createPrototypeForMediatedQueryObject(){
            for(var i =0, allowedFunctionName; undefined !== (allowedFunctionName = this.allowedFunctions[i]); ++i){
                this._createPrototypeFunction(allowedFunctionName);
            }
        },

        //creates the _MediatorQueryObject.prototype[funcName] function.
        //by default the mediated function will act as a pass through to the underlying jQuery function.
        //if the result of the jquery function is an instance of jQuery, the result is wrapped with jQueryMediator before it is returned.
        //if the result is not an instance of jQuery, the unmodified result is returned.
        _createPrototypeFunction: function (funcName){
            this._MediatedQueryObject.prototype[funcName] = function(){
                var result = this._$el[funcName].apply(this._$el, arguments);
                if(result instanceof $){  //chained results should only have functions we allow.
                    result = jQueryMediator.mediator.mediateJQueryResult(result);
                }
                return result;
            };
        },

        //iterates over the config's allowedProperties array and copies each one from the $el into the mediatedQueryObject.
        //if config.provideAccessToDomElementsArray is true, copies each item into the mediatedQueryObject. e.g. mediatedQueryObject[0] = $el[0]
        _exposeAllowedjQueryObjectProperties: function (mediatedQueryObject, $el){
            for(var i =0, allowedPropName; undefined !== (allowedPropName = this.allowedProperties[i]); ++i){
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
        //returns the current configuration object.
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

    window.jQueryMediator = jQueryMediator;
    return jQueryMediator;    
})($);
});