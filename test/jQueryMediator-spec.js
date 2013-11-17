define(['jquery', 'core', 'jasmine', 'base/vendor-mediator/jQueryMediator'], function(jquery, core, jasmine, $){
    core.log('jquery mediator spec module loaded'); 

    //first configure the mediator to expose only the functions we allow, etc.
    $.mediator.setConfig({
        allowedFunctions:[
            'html',
            'find',
            'hasClass'
        ],
        allowedProperties:[
            'length'
        ],
        allowedJQueryFunctionProperties:[
            'ajax'
        ],
        //in explicit functions, 'this' is the mediatedQueryObject.
        //you also have access to the underlying jquery object via this._$el
        explicitFunctions:{
            //demonstrates a custom each replacement
            each: function(iterationCallback){
                for(var i=0; i < this.length; ++i){
                    var item = this[i];
                    iterationCallback(i, item);
                }
            },
            //demonstrate an explicit function which wraps jquery results with a mediated jquery object.
            attr: function(name, value){
                var result = this._$el.attr(name, value);
                //when the result is an instance of jquery e.g. $el
                //we wrap the jquery instance with the mediator so that only functions we allow are available
                //during chaining.
                if(result instanceof jquery){
                    result = $.mediator.mediateJQueryResult(result);
                }
                return result;
            }
        }
    });

    //test that our assumptions about how the mediator works are correct.
    //I do not intend on testing every function here, just enough to ensure that the mediator acting appropriately as a passthrough.
    describe("jQueryMediator - Mediated API", function(){
        it("should support html", function(){
            var test1Html = $('#htmlTest1').html(); 
            expect(test1Html).toEqual('html test 1');
        });
        
        it("should support find", function(){
            var $test1 = $('#findTest').find('.test1');
            expect(!!$test1).toEqual(true);
        });
        
        it("should support find with chained html (chained)", function(){
            var test1html = $('#findTest').find('.test1').html();
            expect(test1html).toEqual('test1');
        });
        
        it("should support hasClass (non chained)", function(){
            expect($('#findTest').find('.test1').hasClass('test1')).toEqual(true);        
        });
        
        it("should support length (properties)", function(){
            expect($('#lengthTest li').length).toEqual(4);    
        });
        
        it("shoud provide array of dom elements", function(){
            expect($('#lengthTest li')[0]+"").toEqual('[object HTMLLIElement]'); 
        });
        
        it("should not expose jquery function functions we havent allowed", function(){
            expect($.extend).toEqual(undefined);    
        });
        
        it("should not expose jquery object functions we havent allowed", function(){
            expect($('#findTest').live).toEqual(undefined);    
        });
        
        it("should not expose jquery object functions we havent allowed when chaining is used", function(){
            expect($('#findTest').find('.test1').live).toEqual(undefined);    
        });

        it("should provide access to underlying jquery object (for emergencies)", function(){
            var $el = $('#findTest').find('.test1')._$el;
            expect($el instanceof jquery).toEqual(true);
        });

        it("should support explicitly defined functions", function(){
            var $lengthTest = $('#lengthTest');
            var eachCount = 0;
            $lengthTest.each(function(i, item){
                expect(i).toEqual(eachCount);
                eachCount++;
            });
            expect(eachCount).toEqual(1);

            eachCount = 0;

            $lengthTest.find('li').each(function(i, item){
                eachCount++;
                expect(item.innerHTML).toEqual(eachCount+"");
            });
            expect(eachCount).toEqual(4);


        });
        it("should not get confused by multiple cached objects", function(){
            var $mediatedEl1 = $('#htmlTest1');
            var $mediatedEl2 = $('#findTest');
            var $mediatedEl3 = $mediatedEl2.find('.test1');
            expect($mediatedEl1.html() == $mediatedEl2.html()).toEqual(false);
            expect($mediatedEl3.html() == $mediatedEl2.html()).toEqual(false);
        });
        
        it("should support ajax", function(){
            var receivedExpectedResult = false;
            runs(function(){
                $.ajax({
                    url: 'http://1h1h1h4lj4l3j3l4.com'
                }).error(function(){
                    receivedExpectedResult = true;
                    core.log('ajax test has completed');
                });      
            });
            waits(700);
            runs(function(){
                expect(receivedExpectedResult).toEqual(true);
            });
        });
        
    });
});