
function when() {
	var flowDone = false;
	var argsArray = Array.prototype.slice.call(arguments, 0);
	var laatsteArgumenten;
	
	argsArray.push(function() {
		laatsteArgumenten = arguments;
		flowDone = true;
	});
	
	flow.exec.apply(this, argsArray);
	waitsFor(function() {
		return flowDone === true;
	});
	
	return {
		then: function(assertionsFn) {
			runs(function() {
				assertionsFn.applyArgs(this, laatsteArgumenten);
			});
		}
	};
}