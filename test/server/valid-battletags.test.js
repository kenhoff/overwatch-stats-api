const request = require("supertest");
const proxyquire = require("proxyquire");
const tk = require("timekeeper");
const knex = require("knex")(require("../../knexfile.js")["dev"]);


// we can test writing to the DB later
// we can also unit test getPlayerRank.js later

// VALID BATTLETAGS
// notajetski#1447
// Aprogenji1234#1234
// 1447#1447

describe("valid battletags", function() {
	var server;

	var getPlayerRankStub = function(player_battletag, cb) {
		cb(null, {
			player: player_battletag,
			rank: 2500
		});
	};

	// set up server with getPlayerRank stubbed out
	beforeEach(function(done) {
		knex.seed.run().then(function() {
			done();
		});
		// because the database is actually modified every time that we get the latest data, gotta reseed it after every test ¯\_(ツ)_/¯
		// bust the cache...
		delete require.cache[require.resolve("../../index.js")];
		server = proxyquire("../../index.js", {
			"./getPlayerRank.js": getPlayerRankStub
		});
	});

	afterEach(function() {
		server.close();
	});

	var checkForValidBattletagResponse = function(url, done) {
		request(server)
			.get(url)
			.expect(200)
			.end(done);
	};

	it("normal battletag: /players/notajetski-1447 -> 200", function(done) {
		checkForValidBattletagResponse("/players/notajetski-1447", done);
	});

	it("player with numbers in battletag: /players/1447-1447 -> 200", function(done) { // technically valid, by our standards, but blizzard doesn't permit numbers as the first character.
		checkForValidBattletagResponse("/players/1447-1447", done);
	});
	it("player with caps in battletag: /players/Aprogenji1234-1234 -> 200", function(done) {
		checkForValidBattletagResponse("/players/Aprogenji1234-1234", done);
	}); // testing caps and numbers in battletag nickname.

});
