
(function() {

	var slice = Array.prototype.slice;
	
	Function.prototype.curry = function() {
		if(!arguments.length) return this;
		
		var curryArgs = slice.call(arguments, 0);
		var myFunction = this;
		
		return function() {
			var functionArgs = slice.call(arguments, 0);
			myFunction.apply(this, curryArgs.concat(functionArgs));
		}
	};
	
	Function.prototype.applyArgs = function(thisObj, args) {
		return this.apply(thisObj, slice.call(args, 0));
	};

})();

