var testData = [{
	player_battletag: "notajetski#1447",
	rank: 2500,
	timestamp: new Date(2016, 0, 5)
}, {
	player_battletag: "notajetski#1447",
	rank: 2400,
	timestamp: new Date(2016, 0, 4)
}, {
	player_battletag: "notajetski#1447",
	rank: 2300,
	timestamp: new Date(2016, 0, 3)
}, {
	player_battletag: "unranked#1234",
	timestamp: new Date(2016, 0, 5)
}, {
	player_battletag: "unranked#1234",
	timestamp: new Date(2016, 0, 4)
}, {
	player_battletag: "unranked#1234",
	timestamp: new Date(2016, 0, 3)
}, {
	player_battletag: "unavailable#1234",
	rank: 2500,
	timestamp: new Date(2016, 0, 5)
}, {
	player_battletag: "unavailable#1234",
	rank: 2400,
	timestamp: new Date(2016, 0, 4)
}, {
	player_battletag: "unavailable#1234",
	rank: 2300,
	timestamp: new Date(2016, 0, 3)
}];

exports.seed = function(knex, Promise) {
	// Deletes ALL existing entries
	return knex("recorded-stats").del()
		.then(function() {
			return Promise.all([
				// Inserts seed entries
				knex("recorded-stats").insert(testData)
			]);
		});
};
