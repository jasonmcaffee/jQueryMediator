define(['jquery'], function($){
    
    //configuration object which whitelists allowed functionality.
    //The MediatedQueryObject's prototype will end up with functions and properties
    //which match these entries. 
    //Functions created based off of these entries will act as simple passthroughs to the underlying jquery lib.
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
        provideAccessToDomElementArray: true
    };
    
    
    //when our code base executes $(), they will actually be executing this function
    var jQueryMediator = function(selector, context){
        //execute the query function, using the same arguments passed into this function
        //var $el = $.apply($, arguments); //this is slower than calling directly
        var $el = $(selector, context); 
        //wrap the $el result with a mediator object that only exposes the allowed jquery functions.
        return exposeFunctions($el);
    };
    
    createAllowedJqueryFunctions();
    
    //expose $.func function properties (data, extend, ajax, etc)
    function createAllowedJqueryFunctions(){
        for(var i=0; i < config.allowedJQueryFunctionProperties.length; ++i){
            var allowedFuncProp = config.allowedJQueryFunctionProperties[i];
            createAllowedJqueryFunction(allowedFuncProp);
        }    
    }
    
    //adds the allowed $.func to the jQueryMediator function.
    function createAllowedJqueryFunction(allowedFuncProp){
        jQueryMediator[allowedFuncProp] = function(){
            return $[allowedFuncProp].apply($, arguments);    
        };    
    }
    
    
    //############################################# MediatedQueryObject ###################################
    //wrapper object for the jquery object.
    //Acts as a mediator for all interactions with the jquery object.
    function MediatedQueryObject($el){
        //for performance and convenience. 
        //Direct access to the underlying jquery object is discouraged, but is there if you really need it.
        this._$el = $el;
        
        //expose allowed props like .length
        exposeAllowedjQueryObjectProperties(this);
        
        if(config.provideAccessToDomElementArray){
            for(var i=0, length=$el.length; i < length; ++i){
                this[i] = $el[i];
            }
        }
    }
    
    //copies allowed properties from the mediatedQueryObject's _$el
    function exposeAllowedjQueryObjectProperties(mediatedQueryObject){
        for(var i =0, allowedPropName; undefined !== (allowedPropName = config.allowedProps[i]); ++i){
            mediatedQueryObject[allowedPropName] = mediatedQueryObject._$el[allowedPropName];
        }    
    }
    
    //exposed/mediated functions are defined in the prototype.
    MediatedQueryObject.prototype = {
        //we explicitly define functions that are sometimes chainable.
        //(this could also probably be done by checking if the result is an instance of jquery object)
        //gets or sets html
        html: function(newHtml){
            if(newHtml){ //chainable
                var $result = this._$el.html(newHtml);
                return exposeFunctions($result);//chained result shouldn't allow functions we dont allow
            }
            return this._$el.html();
        },
        
        attr: function(attr, value){
            if(typeof value != "undefined"){//chainable
                var $result = this._$el.attr(attr, value);
                return exposeFunctions($result);
            }
            return this._$el.attr(attr);
        },
        
        //custom functions #############################################################
        //performance comparison
        find2: function(selector){
            return exposeFunctions(this._$el.find(selector));        
        },
        
        changeClass: function(toClass, fromClass){
            this._$el.addClass(toClass).removeClass(fromClass);    
        },
        
        isChildOrSelf: function(parent, selector){
            parent = $(parent);
            while(parent.parent().length) {
                if(parent.filter(selector).length === 0) {
                    parent = parent.parent();
                }
                else {
                    return true;
                }
            }
            return false;    
        }   
    };
    
    
    //dynamically create the prototype by iterating over the allowed functions and assigning mediator functions to the prototype.
    //these types of functions are simply pass throughs to the underlying library.
    createPrototypeForMediatedQueryObject();
    
    //assign functions to prototype
    function createPrototypeForMediatedQueryObject(){
        for(var i =0, allowedFunctionName; undefined !== (allowedFunctionName = config.allowedChainedFunctions[i]); ++i){
            createChainablePrototypeFunction(allowedFunctionName);
        }    
        for(i =0, allowedFunctionName; undefined !== (allowedFunctionName = config.allowedNonChainedFunctions[i]); ++i){
            createNonChainablePrototypeFunction(allowedFunctionName);
        }    
    }
    
    //creates a function that expects a jquery object to be the result when the underlying jquery function is executed.
    //wraps and returns the result in a MediatedQueryObject
    function createChainablePrototypeFunction(funcName){
        MediatedQueryObject.prototype[funcName] = function(){
            var $res = this._$el[funcName].apply(this._$el, arguments); 
            return exposeFunctions($res); //chained results should only have functions we allow.    
        };
    }
    
    //creates a function that returns the jquery function result.
    function createNonChainablePrototypeFunction(funcName){
        MediatedQueryObject.prototype[funcName] = function(){
            var res = this._$el[funcName].apply(this._$el, arguments); 
            return res;   
        };
    }
    
    //creates and returns a new MediatedQueryObject
    function exposeFunctions($el){
        return new MediatedQueryObject($el);
    }

    return jQueryMediator;    
});