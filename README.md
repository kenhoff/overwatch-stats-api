# Overwatch Stats API

Note: player battletags are **case sensitive!**

Don't forget to encode the `#` in the URL (`%23`).

`http://overwatch-stats-api.herokuapp.com/players/notajetski%231447`

```json
{
	"player_battletag": "notajetski#1447",
	"rank": 2347,
	"timestamp": "2016-10-09T17:09:03.192Z",
	"history": [
		{
			"rank": 2347,
			"timestamp": "2016-10-09T17:09:03.192Z",
		}, {
			"rank": 2345,
			"timestamp": "2016-10-08T17:09:03.192Z",
		}, {
			"rank": 2340,
			"timestamp": "2016-10-07T17:09:03.192Z",
		}
	]
}
```
