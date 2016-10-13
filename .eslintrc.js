module.exports = {
	"env": {
		"node": true,
		"es6": true,
		"browser": true,
		"jquery": true
	},
	"extends": "eslint:recommended",
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"always"
		],
		"no-console": ["off"]
	}
};
