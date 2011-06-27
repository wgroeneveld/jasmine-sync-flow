# Jasmine Sync Flow

## What's this? 

<a href="https://github.com/pivotal/jasmine" target="_blank">Jasmine</a> BDD JS testing is fun. It's entertaining. It's powerful. 

But it's not, in any case, _easy to use_ when _integration testing_. How come? Integration testing, requires at some point some sort of asynchronous call to be made. 
Jasmine has built-in support to "wait" for these things to return in order to do your assertions, using _waitsFor_. But it's not really practical when you have multiple async blocks of code:

```javascript
describe("stuff", function() {
  it("should be awesome", function() {
    var done = false;
	
    myRepository.saveStuff(function(stuff) {
	  done = true;
	});
	
	waitsFor(function() {
	  return done === true;
	});
	
	runs(function() {
	  expect(1).toBe(1);
	  expect(more).toEqual(otherStuff);
	});
  });
});
```

This may seem to be nice and clean, but it's impractical for a bunch of reasons:

* Using a stupid callback function to set some state is indeed stupid
* You'll have to use _waitsFor_ and wrap assertions in _runs_, 'cause otherwise Jamsine thinks the test is done. 
* It gets more complicated when multiple async calls have been made (more _waitsFor_, sigh)

So, instead of relying on that, why don't we utilize <a href="https://github.com/willconant/flow-js" target="_blank">flow-js</a> to handle all async stuff, and wrap everything in a nice _when_/_then_ mini DSL layer?
The end result will be something like this:

```javascript
describe("stuff", function() {
  it("should be awesome", function() {
  
    when(function() {
	  myRepository.saveStuff(this);
	}, function() {
	  doMoreAsyncStuff(this);
	}).then(function() {
	  expect(1).toBe(1);
	  expect(more).toEqual(otherStuff);
	});
  });
});
```

## How does this work?

All jasmine assertions will need to be placed in the _then_ function! Internally, this is the _runs()_ wrapper, and _waitsFor()_ is also used but you'll never ever have to do it yourself. Cool? Crazy!

### Test data setup: multiple async calls

the _when()_ function takes any amount of function closures and all treats those as async calls. The _this_ pointer within those functions refers to the _flowState_ object. 
For more info about internal workings of flow, see their readme (link above).

You can chain multiple async calls, using the _this_ pointer as the callback function object:

```javascript
when(function() {
  asyncStuff.go(this)
}, function() {
  asyncStuff.doMoreStuff(this)
});
```

This will execute the first closure, wait for it to finish, and execute the second one. 

### Parallel setup

Like in flow.js, you can instead of using the _this_ pointer, use the _this.MULTI()_ object:

```javascript
when(function() {
  asyncStuff.go(this.MULTI())
}, function() {
  asyncStuff.doMoreStuff(this.MULTI())
});
```

This will execute both closures using the default async mode, but will _not return_ until both calls have finished. We do not care which one fires first, as they are not dependant on each other. 

### Passing data

All closures implicitly take the result of the callback from the previous async call as their parameters:

```javascript
when(function() {
  asyncStuff.loadMe(this)
}, function(loadedObj) {
  loadedObj.saveAsync("param1", "param2", this);
}).then(function(savedObj) {
  expect(savedObj.isSaved()).toBe(true);
});
```

closure 2 takes the result of callback in closure 1, and so forth. The _then()_ function takes the result of the last executed closure in the _when()_ parameter list. 
In the above example, loadMe and saveAsync would typically behave something like this:

```javascript
var loadMe = function(callback) {
  jQuery.ajax('http://blah.rest', {
    success: function(transport) {
		console.log("ajax call finished");
		callback(transport.getObj());
	}
  });
}
var saveAsync = function(obj) {
 // save obj, return saved obj etc
}
```

As you can see, _callback_ gets fired in the success closure via jQuery, with the result object as the only parameter. This is used in the second async closure call. 

### What if I have some synchronous block between the async ones?

No problem, use the custom-made _flow.sync()_ function, which works a bit like the _.MULTI()_ things:

```javascript
when(function() {
  asyncStuff.go(this)
}, flow.sync(function() {
  console.log("Look ma, I'm doing sync stuff between two async blocks!");
}), function() {
  asyncStuff.doMoreStuff(this.MULTI())
}).then(function() {
  // assertions
});
```

Why do you have to wrap functions in _flow.sync()_? Because otherwise, you'll have to call the callback function (this) yourself:

> this()

And that's a bit (very) awkward. 

## Excellent, what Do I need to do? 

1. Fork this project. 
2. Include flow.js together with all source JS files in jasmine runners
2. Create some Jasmine specs, place them in some folder.
3. Use _when()_ and _then()_ and gogogo!
4. ???
5. Profit!
