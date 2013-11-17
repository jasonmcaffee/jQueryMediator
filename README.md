# jQueryMediator
Typical mediators for dom libraries such as jQuery, tend to poorly abstract the underlying API, and lead to an inconvenient,
verbose syntax that resonates throughout your code base.

This project provides a jQuery API mediator that can be used in a manner that is indistinguishable from jQuery.

## Try it out!
Visit this link and click Project->Fork to try it out yourself:
https://codio.com/jasonmcaffee/jQueryMediator/master/tree/test/jQueryMediator-spec.js

## Usage
You can use the jQueryMediator in any way you see fit.

Note: usage examples assume jQueryMediator has already been configured. See Configuration section.

Here are a few usage examples.
### Functionally scoped jQueryMediator as $
```javascript
(function($){
    $('#someSelector').find('.some-el').html();
})(jQueryMediator);
```
or
```javascript
function myModule(){
    var $ = jQueryMediator;
    $('#someSelector').find('.some-el').html();
}
```
or
```javascript
define(['jQueryMediator'], function($){
    $('#someSelector').find('.some-el').html();
});
```
## Configuration
jQueryMediator is completely customizable and extensible.
You can override any functionality with your own.

### Basic Configuration
Note: in the configuration examples, it is assumed that $ == jQueryMediator.

#### White listing allowed functions and properties
You can white list the allowed properties and functions of the mediated jQuery result object and the jQuery function.

```javascript
$.mediator.setConfig({
    //allowed jQuery result functions. e.g. $('#someEl').find('.some-class').html()
    //default is []
    allowedFunctions:[
        'html',
        'find',
        'hasClass'
    ],
    //allowed Props
    //default is []
    allowedProps:[
        'length'
    ],
    //default is []
    allowedJQueryFunctionProperties:[
        'ajax'
    ]
});
```

### Advanced Configuration
All advanced configuration options have a underscore '_' prefix.


## Reasons to use a Mediator
### Switching out third party libraries
Ostensibly, a mediator around a third party library could allow to switch out a the third party library with another one, without
having to refactor your entire codebase.

### Manage API changes
If a function gets deprecated or superceded by another, newer function, you can redefine the deprecated function to use the newer
ones.
(Note: you could do this without a mediator, but it may impact the underlying library)

### See all the third party api functions you use in one place
In the jQuery API Mediator, exposed functions are white listed, and those which are not are unavailable.
This can help when you are upgrading or replacing a library, as you only need to worry about the exposed functions.

### Help enforce best practices
If certain functionality in a library is causing you issues, or is commonly misused, a mediator can help in mitigating issues
by blocking usage or enforcing usage in a certain way.
e.g. you could prevent chaining after N chains, prevent use of binding on anything but the document object, etc.

### Enhance the library
You can also choose to enhance or modify the library when you use a mediator, without worrying about unintended side effects
in other dependent third party code (plugins).

For example, we could modify the html function to always remove white space from injected html, we could inject logging or 
broadcasting into certain functions, etc.

## Reasons you shouldn't use a Mediator
### Javascript isn't statically typed
Your application code is written using interfaces provided by other modules and libraries.
Other modules and libraries are accessed via weakly typed variables.
These variables can easily be redifined so long as the interface remains the same.
In statically typed languages this is harder to do, so mediators or Interfaces are created so we can later switch libraries without
having to refactor.

Beware of assuming that because this is a best practice on the server side, it should be a best practice in javascript.

### You don't always need to preemptively mediate
As stated above, it is relatively easy to reassign 3rd party variables, especially if you are using modules.
If you don't find any of the other advantages of the Mediator pattern all that useful for your project (like seeing all the used third party functions
in one place), you can always inject a mediator when it's actually needed, rather than preemptively.

### You cant switch out third party libraries
If the library you are switching to has a completely different API (paradigm shift, 4 params for a function instead of 1, etc) the 
mediator will not help you.
There is no abstraction that can save you from having to rewrite the code.

### You may choose to not switch out a library
What if jQuery is the defacto standard for the next 10 years? 
You will have done all this preemptive mediator work for nothing!

### You are going to completely rewrite your UI within a few years
Designs are always radically changing. 
Skeuomorphism is the way to go! No wait, flat UI is the latest rage!
You can usually expect a major UI overhaul every few years.
If you're going to change major underlying libraries, this is likely the best time to do it.

## Its a tough decision
If you do decide to use a mediator, make it easy to use, and preferably with a familiar API!

## Examples of Mediators
Most Mediators for dom libraries are either a naive implementation, defined only in theory, or are written in a manner that makes it inconvenient to use.

### Osmani
https://github.com/addyosmani/largescale-demo/blob/master/js/application_core/jquery-core.js
http://addyosmani.com/largescalejavascript/#applyingmediator
dependencies such as third party libraries (eg. jQuery?)
A: I'm specifically referring to dependencies on other modules here. What some developers opting for an architecture such as 
this opt for is actually abstracting utilities common to DOM libraries -eg. one could have a DOM utility class for query 
selectors which when used returns the result of querying the DOM using jQuery (or, if you switched it out at a later point, Dojo). 
This way, although modules still query the DOM, they aren't directly using hardcoded functions from any particular library or 
toolkit. There's quite a lot of variation in how this might be achieved, but the takeaway is that ideally core modules shouldn't 
depend on other modules if opting for this architecture.

https://github.com/rudolfrck/backbone-aura/blob/master/aura/mediator.js

### Zakas
http://www.slideshare.net/nzakas/scalable-javascript-application-architecture
"Only the application core knows what base library is being used. No other part of the architecture should need to know."

### Misc
#### Scalable Javascript Architecture
https://github.com/aranm/scalable-javascript-architecture/blob/master/Core.DomManipulation.js
#### Stack Overflow Question
http://stackoverflow.com/questions/12534338/is-the-use-of-the-mediator-pattern-recommend
#### Tapestry
https://github.com/apache/tapestry-5/blob/5.4-js-rewrite/tapestry-core/src/main/coffeescript/META-INF/modules/core/dom.coffee


## Code Overview

### Specs
You can run the tests by visiting the [test](../preview/test.html) page.

You can see the specs here: [jQueryMediator-spec.js](test/jQueryMediator-spec.js).

### [jQueryMediator](src/js/base/vendor-mediator/jQueryMediator.js)
Provides the mediator for the jQuery function and mediator for the jQuery result object.

### [test-main.js](test/test-main.js)
requires the spec and runs jasmine

### Other
The other src/js code is simply there to mimic a typical project scaffold.

## Performance
Performance for jQueryMediator is awesome.  Performance is only slightly slower than using jQuery directly.

http://jsperf.com/jquery-mediator-vs-jquery/4

## Compatibility
jQueryMediator is written in vanilla javascript, and should work in all browsers supported by the version of jquery you are using.

## Dependencies
Currently dependent on jquery and requirejs, but a non requirejs version should be available soon.

In the meantime you can simply replace the requirejs define with an IIFE that passes in jQuery.

##FAQs
### Won't developers be confused by this?
No. It takes 30 seconds to explain:

"We use a mediator for jQuery. The API is very similar, but can differ in some cases. Check the specs when you are unsure or run into issues."
### Does it make sense to mimic the jQuery API?
Yes. 
* The jQuery API is truly awesome. It is unlikely that you will write a better one.
* Most everyone is familiar with the jQuery API.  Do you really want to spend time training devs on your hand rolled dom api?
