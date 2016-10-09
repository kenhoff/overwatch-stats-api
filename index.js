console.log("Starting up...");
const app = require("express")();
const knex = require("knex")(require("./knexfile.js"));

knex.migrate.latest();

const getPlayerRank = require("./getPlayerRank.js");

app.get("/players/:player_battletag", function(req, res) {
	let player_battletag = req.params.player_battletag;
	// get latest player data before responding
	getPlayerRank(req.params.player_battletag, function(err, data) {
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
						console.log("Error retrieving data:", err);
						res.status(500).send(err);
					});
			}).catch(function(err) {
				console.log("Error inserting data:", err);
				res.status(500).send(err);
			});
		}
	});
});

var port = process.env.PORT || 1234;
app.listen(port, function() {
	console.log("Listening on " + port + "...");
});