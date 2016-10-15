describe("server", function() {
	describe("malformed battletags", function() {
		it("/players/ -> 400", function(done) {
			// var server = require("../index.js")
			// throw "err"
			done()
		});
		it("/players/notajetski -> 400");
		it("/players/notajetski- -> 400");
		it("/players/- -> 400");
		it("/players/-1447 -> 400");
		it("/players/notajetski-notajetski -> 400");
		it("/players/1447-notajetski -> 400");
	});
});

describe("valid battletags", function() {
	it("(player exists and has ranked info) /players/notajetski-1447 -> 200");
	it("(player exists, but does not have ranked info) ??????");
	it("(player does not exist) /players/asdfasdfasdf-1234) -> 404");
});
