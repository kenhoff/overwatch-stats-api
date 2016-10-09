const cheerio = require("cheerio");
const request = require("request");

module.exports = function(player_id, cb) {
	var ow_url = "https://playoverwatch.com/en-us/career/pc/us/" + player_id.split("#")[0] + "-" + player_id.split("#")[1];
	request(ow_url, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			let $ = cheerio.load(body);
			var rankElements = $(".competitive-rank");
			if (rankElements.length >= 1) {
				var rank = rankElements.slice(0, 1).text();
			} else {
				rank = "";
			}
			if (cb) {
				cb(null, {
					player: player_id,
					rank: rank
				});
			}
		} else {
			if (cb) {
				cb("Got a non-200 response from playoverwatch.com");
			}
		}
	});
};
