const request = require("supertest");

describe("server", function() {
	var server;
	beforeEach(function() {
		// because node caches server every time, need to bust the require cache
		delete require.cache[require.resolve("../index.js")];
		server = require("../index.js");
	});
	afterEach(function() {
		server.close();
	});
	describe("malformed battletags", function() {
		var testMalformedBattleTag = function(url, done) {
			request(server)
				.get(url)
				.expect(400)
				.expect({
					"status": "error",
					"error": "You need to include a valid battletag with number identifier, like /players/notajetski-1447."
				})
				.end(done);
		};
		it("/players/ -> 400", function(done) {
			testMalformedBattleTag("/players/", done);
		});
		it("/players/notajetski -> 400", function(done) {
			testMalformedBattleTag("/players/notajetski", done);
		});
		it("/players/notajetski- -> 400", function (done) {
			testMalformedBattleTag("/players/notajetski-", done);
		});
		it("/players/- -> 400");
		it("/players/-1447 -> 400");
		it("/players/notajetski-notajetski -> 400");
		it("/players/1447-notajetski -> 400");
	});
	describe("valid battletags", function() {
		it("(player exists and has ranked info) /players/notajetski-1447 -> 200");
		it("(player exists, but does not have ranked info) ??????");
		it("(player does not exist) /players/asdfasdfasdf-1234) -> 404");
	});
});
