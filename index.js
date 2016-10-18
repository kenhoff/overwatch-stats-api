const debug = require("debug")("ow-stats-api");
const sortObj = require("sort-object");

debug("Starting up...");

if (process.env.NODE_ENV != "production") {
	require("dotenv").config();
}

const express = require("express");
const app = express();

const knex = require("knex")(require("./knexfile.js")[process.env.NODE_ENV || "dev"]);

const getPlayerRank = require("./getPlayerRank.js");

app.use(express.static(__dirname + "/static"));

app.get("/favicon.ico", function(req, res) {
	res.sendFile(__dirname + "/static/img/icon.png");
});

app.get("/players", function(req, res) {
	return malformedBattleTagResponse(res);
});

app.get("/players/:player_battletag", function(req, res) {
	// convert the battletag to include a "#" character
	let player_battletag = req.params.player_battletag.replace("-", "#");

	// first, enforce that it's a valid battletag
	if (!player_battletag.match(/[A-Za-z0-9]+#[0-9]+/)) {
		return malformedBattleTagResponse(res);
	}

	// request should have the battletag in the format of "notajetski-1447" or "notajetski#1447"
	// battletag should be passed to getPlayerRank in the format of "notajetski#1447", **not** "notajetski-1447"
	getPlayerRank(player_battletag, function(err, data) {
		// if there's an error in getting a player's data, don't necessarily bail
		// if you get the data, great, save it to the db
		// if you don't get the data, no worries
		// in either case, look up the data in the DB and send it out
		if (!err) {
			attemptToSavePlayerDataToDB(player_battletag, data, function() {
				sendPlayerData(player_battletag, res);
			});
		} else {
			sendPlayerData(player_battletag, res);
		}
	});
});

var attemptToSavePlayerDataToDB = function(player_battletag, data, cb) {
	knex.insert({
		player_battletag: player_battletag,
		rank: (data.rank == "" ? null : data.rank), // if there isn't a rank on the player, don't send an empty string to the DB
		timestamp: new Date().toISOString()
	}).into("recorded-stats").asCallback(function(err) {
		if (err) {
			debug("Error saving player data to DB:", err);
		}
		cb();
	});
};

var sendPlayerData = function(player_battletag, res) {
	knex.select("rank", "timestamp")
		.from("recorded-stats")
		.where({
			player_battletag: player_battletag
		})
		.orderBy("timestamp", "desc")
		.then(function(rows) {
			if (rows.length == 0) {
				return res.status(404).send({
					"status": "error",
					"error": "We can't find a user with the battletag " + player_battletag + ". Check the capitalization of the battletag. This might be because of a temporary issue on the Overwatch servers, so if you're sure everything is correct, try again in a few minutes."
				});
			}
			// build response object
			let playerData = Object.assign({}, rows[0]);
			playerData.history = rows;
			// remove all the null ranks from history
			for (var historyItem of playerData.history) {
				if (historyItem.rank == null) {
					delete historyItem.rank;
				}
			}
			playerData.player_battletag = player_battletag;
			if (playerData.rank == null) {
				delete playerData.rank;
			}
			playerData = sortObj(playerData);
			res.json(playerData);
		}).catch(function(err) {
			debug("Error retrieving data:", err);
			res.status(500).send(err);
		});
};

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
