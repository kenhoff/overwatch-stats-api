const request = require("supertest");

describe("server", function() {
	var server;
	beforeEach(function() {
		server = require("../index.js");
	});
	afterEach(function() {
		server.close();
	});
	describe("malformed battletags", function() {
		it("/players/ -> 400", function(done) {
			request(server)
				.get("/players/")
				.expect(400)
				.expect({
					"status": "error",
					"error": "You need to include a valid battletag with number identifier in the URL, like /players/notajetski-1447."
				})
				.end(function(err) {
					if (err) {
						throw err;
					}
					done();
				});
		});
		it("/players/notajetski -> 400");
		it("/players/notajetski- -> 400");
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
