const debug = require("debug")("ow-stats-api");

debug("Starting up...");

if (process.env.NODE_ENV != "production") {
	require("dotenv").config();
}

const express = require("express");
const app = express();

const knex = require("knex")(require("./knexfile.js"));

// knex.migrate.latest();

const getPlayerRank = require("./getPlayerRank.js");

app.use(express.static(__dirname + "/static"));

app.get("/players", function(req, res) {
	return malformedBattleTagResponse(res);
});

app.get("/players/:player_battletag", function(req, res) {
	// convert the battletag to include a "#" character
	let player_battletag = req.params.player_battletag.replace("-", "#");

	// first, enforce that it's a valid battletag
	let battletagParts = player_battletag.split("#");
	let battletagIdentifier = battletagParts[1];
	if (battletagParts.length != 2 || isNaN(parseInt(battletagIdentifier))) {
		return malformedBattleTagResponse(res);
	}

	// request should have the battletag in the format of "notajetski-1447" or "notajetski#1447"
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

var malformedBattleTagResponse = function(res) {
	return res.status(400).send({
		"status": "error",
		"error": "You need to include a valid battletag with number identifier, like /players/notajetski-1447."
	});
};

var port = process.env.PORT || 1234;
var server = app.listen(port, function() {
	debug("Listening on " + port + "...");
});

module.exports = server;
