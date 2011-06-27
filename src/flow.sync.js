(function(flow) {

	flow.sync = function(work) {
		return function() {
			this(work.applyArgs(this, arguments));
		}
	};

})(flow);
