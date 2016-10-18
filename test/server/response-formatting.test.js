const request = require("supertest");
const proxyquire = require("proxyquire");
const knex = require("knex")(require("../../knexfile.js")["dev"]);

describe("response formatting", function() {
	var server;
	// 	describe("limit history to 100 items", function() {
	var getPlayerRankStub = function(player_battletag, cb) {
		cb("Got a non-200 response from playoverwatch.com");
	};
	//
	before(function() {
		knex.seed.run();
		// bust the cache...
		delete require.cache[require.resolve("../../index.js")];
		server = proxyquire("../../index.js", {
			"./getPlayerRank.js": getPlayerRankStub
		});
	});
	after(function() {
		server.close();
	});
	//
	var responseData = {
		player_battletag: "userWith200Recordings#1234",
		history: []
	};
	for (var i = 199; i > 99; i--) {
		responseData.history.push({
			timestamp: new Date(i * 1000).toISOString(),
			rank: Math.floor((i / 200) * 5000)
		});
	}
	responseData.rank = responseData.history[0].rank;
	responseData.timestamp = responseData.history[0].timestamp;
	it("/players/userWith200Recordings-1234 -> 200 and length of history is 100", function(done) {
		request(server)
			.get("/players/userWith200Recordings-1234")
			.expect(function(res) {
				if (res.body.history.length > 100) {
					throw "response body history has more than 100 items";
				}
			})
			.expect(responseData)
			.end(done);
	});
});
