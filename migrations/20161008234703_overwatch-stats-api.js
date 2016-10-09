exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable("recorded-stats", function(table) {
			table.increments("id").primary();
			table.string("player_battletag");
			table.integer("rank");
			table.dateTime("timestamp").defaultTo(knex.fn.now());
		})
	]);
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable("recorded-stats")
	]);
};
