const proxyquire = require("proxyquire");
const sinon = require("sinon");
const knex = require("knex")(require("../../knexfile.js")["dev"]);
const request = require("supertest");
const assert = require("assert");
const tk = require("timekeeper");

describe("rate limiting", function() {
	var server;
	var getPlayerRankStub;

	beforeEach(function(done) {
		knex.seed.run().then(function() {
			done();
		});
		delete require.cache[require.resolve("../../index.js")];
		server = proxyquire("../../index.js", {
			"./getPlayerRank.js": getPlayerRankStub
		});
		tk.freeze(new Date(1234567890));
	});
	afterEach(function() {
		tk.reset();
		server.close();
	});

	describe(">5 mins old (sixMinutesAgo#1234)", function() {

		before(function() {
			getPlayerRankStub = sinon.stub();

			getPlayerRankStub.yields(null, {
				player: "sixMinutesAgo#1234",
				rank: 2500
			});
		});

		it("checks for new OW.com data if the most recent recording is more than 5 mins old", function(done) {
			request(server)
				.get("/players/sixMinutesAgo-1234")
				.expect(200)
				.expect(function() {
					assert(getPlayerRankStub.callCount > 0, "Server did not check for new data for records that were more than 5 mins old");
				})
				.end(done);
		});
	});


	describe("<5 mins old (fourMinutesAgo#1234)", function() {
		before(function() {
			getPlayerRankStub = sinon.stub();

			getPlayerRankStub.yields(null, {
				player: "fourMinutesAgo#1234",
				rank: 2500
			});
		});
		it("doesn't check for new OW.com data the most recent piece of data is less than 5 mins old", function(done) {
			request(server)
				.get("/players/fourMinutesAgo-1234")
				.expect(200)
				.expect(function() {
					assert(getPlayerRankStub.callCount == 0, "Server checked for new data for records that were less than 5 mins old");
				})
				.end(done);
		});
	});
});
