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
	beforeEach(function() {
		knex.seed.run(); // because the database is actually modified every time that we get the latest data, gotta reseed it after every test ¯\_(ツ)_/¯
		// bust the cache...
		delete require.cache[require.resolve("../../index.js")];
		server = proxyquire("../../index.js", {
			"./getPlayerRank.js": getPlayerRankStub
		});
		tk.freeze(new Date(2016, 0, 6));
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

describe("ranked, unranked, unavailable, unknown players", function() {
	var server;
	beforeEach(function() {
		knex.seed.run();
	});
	afterEach(function() {
		server.close();
	});

	describe("Ranked player: normal player w/ history", function() {
		var notajetskiHistory = [{
			"rank": 2500,
			"timestamp": new Date(2016, 0, 5).toISOString()
		}, {
			"rank": 2400,
			"timestamp": new Date(2016, 0, 4).toISOString()
		}, {
			"rank": 2300,
			"timestamp": new Date(2016, 0, 3).toISOString()
		}];
		// server should retrieve the following **new** data for notajetski#1447:
		var notajetskiNewData = {
			player_battletag: "notajetski#1447",
			rank: 2600,
			timestamp: new Date(2016, 0, 6).toISOString()
		};
		var notajetskiReturnedData = Object.assign({}, notajetskiNewData, {
			history: [{
				rank: notajetskiNewData.rank,
				timestamp: notajetskiNewData.timestamp
			}, ...notajetskiHistory]
		});

		var getPlayerRankStub = function(player_battletag, cb) {
			cb(null, {
				player: player_battletag,
				rank: 2600
			});
		};

		// set up server with getPlayerRank stubbed out
		before(function() {
			// bust the cache...
			delete require.cache[require.resolve("../../index.js")];
			server = proxyquire("../../index.js", {
				"./getPlayerRank.js": getPlayerRankStub
			});
			tk.freeze(new Date(2016, 0, 6));
		});


		it("/players/notajetski-1447 -> 200 with data", function(done) {
			request(server)
				.get("/players/notajetski-1447")
				.expect(200)
				.expect(notajetskiReturnedData)
				.end(done);
		});

		after(function() {
			tk.reset();
		});
	});
	describe("Unranked player: player exists w/ history, but does not have ranked info", function() {
		var getPlayerRankStub = function(player_battletag, cb) {
			cb(null, {
				player: player_battletag,
				rank: ""
			});
		};

		// set up server with getPlayerRank stubbed out
		before(function() {
			// bust the cache...
			delete require.cache[require.resolve("../../index.js")];
			server = proxyquire("../../index.js", {
				"./getPlayerRank.js": getPlayerRankStub
			});
			tk.freeze(new Date(2016, 0, 6));
		});
		var unrankedPlayerHistory = [{
			timestamp: new Date(2016, 0, 5).toISOString()
		}, {
			timestamp: new Date(2016, 0, 4).toISOString()
		}, {
			timestamp: new Date(2016, 0, 3).toISOString()
		}];

		var unrankedPlayerNewData = {
			player_battletag: "unranked#1234",
			timestamp: new Date(2016, 0, 6).toISOString()
		};

		var unrankedPlayerReturnedData = Object.assign({}, unrankedPlayerNewData, {
			history: [{
				timestamp: unrankedPlayerNewData.timestamp
			}, ...unrankedPlayerHistory]
		});

		it("/players/unranked-1234 -> 200 with data", function(done) {
			request(server)
				.get("/players/unranked-1234")
				.expect(200)
				.expect(unrankedPlayerReturnedData)
				.end(done);
		});

		after(function() {
			tk.reset();
		});
	});
	describe("Unavailable player: if ow.com 404s, but we have data on player, send player data", function() {
		it("/players/unavailable-1234 -> 200 with data");
	});
	describe("Unknown player: if ow.com 404s, and we don't have data on player, send 404", function() {
		it("/players/unknown-1234 -> 404");
	});
});


describe("response formatting", function() {
	describe("limit history to 100 items", function() {

	});
});
