
describe("util functions", function() {

	describe("currying of functions", function() {
	
		var theOne, theTwo, theThree;
		function f(one, two, three) {
			theOne = one;
			theTwo = two;
			theThree = three;
		}
	
		it("should return the own function if no arguments specified", function() {			
			f.curry()(1);
			expect(theOne).toEqual(1);
		});
	
		it("should automagically fill in the first argument if curried", function() {
			f.curry(1)();
			expect(theOne).toEqual(1);
		});
	
		it("should automagically fill in the first argument and continue with manually entered", function() {
			f.curry(1)(2, 3);
			expect(theOne).toEqual(1);
			expect(theTwo).toEqual(2);
			expect(theThree).toEqual(3);
		});
	
	});

});
