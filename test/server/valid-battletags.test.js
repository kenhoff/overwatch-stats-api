const request = require("supertest");
const proxyquire = require("proxyquire");
const tk = require("timekeeper");

// we can test writing to the DB later
// we can also unit test getPlayerRank.js later

// VALID BATTLETAGS
// notajetski#1447
// Aprogenji1234#1234
// 1447#1447

describe("valid battletags", function() {
	var server;
	afterEach(function() {
		server.close();
	});

	describe("valid battletag (notajetski#1447), response from ow.com with rank, history with ranks", function() {
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


		it("(player exists and has rank + history info) /players/notajetski-1447 -> 200", function(done) {
			request(server)
			.get("/players/notajetski-1447")
			.expect(200)
			.expect(notajetskiReturnedData)
			.end(done);
		});

		after(function() {
			tk.reset();
		});
	})

	it("(player exists, but does not have ranked info) ??????");
	it("(player does not exist) /players/asdfasdfasdf-1234) -> 404");
	it("/players/1447-1447 -> 200"); // technically valid, by our standards, but blizzard doesn't permit numbers as the first character.
	it("/players/Aprogenji1234-1234 -> 200"); // testing caps and numbers in battletag nickname.

});
