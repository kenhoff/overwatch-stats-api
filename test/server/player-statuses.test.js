const request = require("supertest");
const proxyquire = require("proxyquire");
const tk = require("timekeeper");
const knex = require("knex")(require("../../knexfile.js")["dev"]);

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

		var getPlayerRankStub = function(player_battletag, cb) {
			cb("Got a non-200 response from playoverwatch.com");
		};

		before(function() {
			// bust the cache...
			delete require.cache[require.resolve("../../index.js")];
			server = proxyquire("../../index.js", {
				"./getPlayerRank.js": getPlayerRankStub
			});
		});

		var unavailablePlayerHistory = [{
			rank: 2500,
			timestamp: new Date(2016, 0, 5).toISOString()
		}, {
			rank: 2400,
			timestamp: new Date(2016, 0, 4).toISOString()
		}, {
			rank: 2300,
			timestamp: new Date(2016, 0, 3).toISOString()
		}];

		var unavailablePlayerResposeData = {
			player_battletag: "unavailable#1234",
			rank: unavailablePlayerHistory[0].rank,
			timestamp: unavailablePlayerHistory[0].timestamp,
			history: [...unavailablePlayerHistory]
		};

		it("/players/unavailable-1234 -> 200 with data", function(done) {
			request(server)
				.get("/players/unavailable-1234")
				.expect(200)
				.expect(unavailablePlayerResposeData)
				.end(done);
		});
	});
	describe("Unknown player: if ow.com 404s, and we don't have data on player, send 404", function() {

		var getPlayerRankStub = function(player_battletag, cb) {
			cb("Got a non-200 response from playoverwatch.com");
		};

		before(function() {
			// bust the cache...
			delete require.cache[require.resolve("../../index.js")];
			server = proxyquire("../../index.js", {
				"./getPlayerRank.js": getPlayerRankStub
			});
		});
		it("/players/unknown-1234 -> 404", function(done) {
			request(server)
				.get("/players/unknown-1234")
				.expect(404)
				.expect({
					"status": "error",
					"error": "We can't find a user with the battletag unknown#1234. Check the capitalization of the battletag. This might be because of a temporary issue on the Overwatch servers, so if you're sure everything is correct, try again in a few minutes."
				})
				.end(done);
		});
	});
});
