// Update with your config settings.

module.exports = {
	dev: {
		client: "pg",
		connection: "postgres://localhost/overwatch-stats-api"
	},
	production: {
		client: "pg",
		connection: process.env.DATABASE_URL
	}
};
