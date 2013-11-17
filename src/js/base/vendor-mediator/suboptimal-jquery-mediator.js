define(['jquery', 'core'], function($, core){
    core.log('jquery mediator module loaded');
    
    //array of function names for functions that allow chaining.
    var allowedChainedFunctions = [
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
        allowedNonChainedFunctions = [
            'extend',
            'hasClass',
            'outerHeight',
            'height',
            'data'
        ],
        allowedJQueryFunctionProperties = [
            'data',
            'ajax',
            'extend'
        ];
    
    //when our code base executes $(), they will actually be executing this function
    var jQueryMediator = function(selector, context){
        //execute the query function, using the same arguments passed into this function
        var $el = $.apply($, arguments);
        //var $el = $(selector, context); //no speed improvement. 
        //wrap the $el result with a mediator object that only exposes the allowed jquery functions.
        return exposeFunctions($el);
    };
    
    //expose $.prop properties (data, extend, ajax, etc)
    for(var i=0; i < allowedJQueryFunctionProperties.length; ++i){
        var allowedFuncProp = allowedJQueryFunctionProperties[i];
        createAllowedJqueryFunction(allowedFuncProp);
    }
    
    function createAllowedJqueryFunction(allowedFuncProp){
        jQueryMediator[allowedFuncProp] = function(){
            return $[allowedFuncProp].apply($, arguments);    
        };    
    }
    
    function exposeFunctions($el){
        var mediatedQueryObject = {
            _$el : $el //mainly for performance, as creating a bunch of closures will eat up memory and slow things down a bit, especially in .
        };
        exposeAllowedFunctions(mediatedQueryObject);
        exposeSpecialFunctions(mediatedQueryObject);
        return mediatedQueryObject;
    }

    //iterates over the allowed functions arrays and creates proxy functions.
    //when chained functions are used, proxy functions ensure that only allowed functions are accessible.
    function exposeAllowedFunctions(mediatedQueryObject){
        for(var i =0, allowedFunctionName; undefined !== (allowedFunctionName = allowedChainedFunctions[i]); ++i){
            mediatedQueryObject[allowedFunctionName] = createMediatedFunctionClosureForChainable(allowedFunctionName);
        }
    }
    
    //since we are creating proxy functions within a loop, we need to scope the allowedFunctionName.
    function createMediatedFunctionClosureForChainable(funcName){
        //return (function(funcName){//todo: double check if this closure is truly needed. probably not..
            return function(){
                var $res = this._$el[funcName].apply(this._$el, arguments); 
                return exposeFunctions($res); //chained results should only have functions we allow.
            };
      //  })(allowedFunctionName);
    }
   
    //$el already has a closure
    function exposeSpecialFunctions(mediatedQueryObject){
        
        //gets or sets html
        mediatedQueryObject.html = function(newHtml){
            if(newHtml){ //chainable
                var $result = this._$el.html(newHtml);
                return exposeFunctions($result);//chained result shouldn't allow functions we dont allow
            }else{
                return this._$el.html();
            }
        };
        
        mediatedQueryObject.attr = function(attr, value){
            if(typeof value != "undefined"){
                var $result = this._$el.attr(attr, value);
                return exposeFunctions($result);
            }
            return this._$el.attr(attr);
        };
        
        mediatedQueryObject.find2 = function(selector){
            return exposeFunctions(this._$el.find(selector));        
        };
        
    }
    
    function exposeCustomFunctions(mediatedQueryObject){
        mediatedQueryObject.changeClass = function(toClass, fromClass){
            this._$el.addClass(toClass).removeClass(fromClass);    
        };
        
        mediatedQueryObject.isChildOrSelf = function(parent, selector){
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
        };
    }
    
    return jQueryMediator;    
});