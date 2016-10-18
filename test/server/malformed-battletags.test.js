const request = require("supertest");

// we can test writing to the DB later
// we can also unit test getPlayerRank.js later

// INVALID BATTLETAGS
// notajetski
// 1447
// notajetski#
// #1447
// notajetski#notajetski
// #

describe("malformed battletags", function() {
	var server;
	afterEach(function() {
		server.close();
	});
	var testMalformedBattletag = function(url, done) {
		request(server)
			.get(url)
			.expect(function () {
				console.log("made request");
			})
			.expect(400)
			.expect({
				"status": "error",
				"error": "You need to include a valid battletag with number identifier, like /players/notajetski-1447."
			})
			.end(done);
	};
	beforeEach(function() {
		// because node caches server every time, need to bust the require cache
		// check out https://glebbahmutov.com/blog/how-to-correctly-unit-test-express-server/
		delete require.cache[require.resolve("../../index.js")];
		server = require("../../index.js");
	});
	it("/players/ -> 400", function(done) {
		console.log("made it into first test");
		testMalformedBattletag("/players/", done);
	});
	it("/players/notajetski -> 400", function(done) {
		testMalformedBattletag("/players/notajetski", done);
	});
	it("/players/notajetski- -> 400", function(done) {
		testMalformedBattletag("/players/notajetski-", done);
	});
	it("/players/- -> 400", function(done) {
		testMalformedBattletag("/players/-", done);
	});
	it("/players/-1447 -> 400", function(done) {
		testMalformedBattletag("/players/-1447", done);
	});
	it("/players/notajetski-notajetski -> 400", function(done) {
		testMalformedBattletag("/players/notajetski-notajetski", done);
	});
	it("/players/1447-notajetski -> 400", function(done) {
		testMalformedBattletag("/players/1447-notajetski", done);
	});
});
