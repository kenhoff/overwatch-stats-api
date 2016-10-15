const debug = require("debug")("ow-stats-api");

debug("Starting up...");

if (process.env.NODE_ENV != "production") {
	require("dotenv").config();
}

const express = require("express");
const app = express();

const knex = require("knex")(require("./knexfile.js"));

knex.migrate.latest();

const getPlayerRank = require("./getPlayerRank.js");

app.use(express.static(__dirname + "/static"));

app.get("/players/:player_battletag", function(req, res) {
	// request should have the battletag in the format of "notajetski-1447" or "notajetski#1447"
	let player_battletag = req.params.player_battletag.replace("-", "#");
	// battletag should be passed to getPlayerRank in the format of "notajetski#1447", **not** "notajetski-1447"
	debug(player_battletag);
	getPlayerRank(player_battletag, function(err, data) {
		if (err) {
			res.status(500).send(err);
		} else {
			knex.insert({
				player_battletag: player_battletag,
				rank: data.rank
			}).into("recorded-stats").then(function() {
				knex.select("rank", "timestamp")
					.from("recorded-stats")
					.where({
						player_battletag: player_battletag
					})
					.orderBy("timestamp", "desc")
					.then(function(rows) {
						// build response object
						let playerData = Object.assign({}, rows[0]);
						playerData.history = rows;
						playerData.player_battletag = player_battletag;
						res.json(playerData);
					}).catch(function(err) {
						debug("Error retrieving data:", err);
						res.status(500).send(err);
					});
			}).catch(function(err) {
				debug("Error inserting data:", err);
				res.status(500).send(err);
			});
		}
	});
});

var port = process.env.PORT || 1234;
app.listen(port, function() {
	debug("Listening on " + port + "...");
});
