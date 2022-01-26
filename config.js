var config = {};

// API Keys
config.GIPHY_API_KEY = process.env.GIPHY_API_KEY;
config.TENOR_API_KEY = process.env.TENOR_API_KEY;

// Provide a list of sites DuckDuckGo will find gifs on. This must follow the following syntax
// Only check if it is undefined, allow end user to pass an empty string to search all sites
config.DUCK_SEARCH_LIST = (typeof process.env.DUCK_SEARCH_LIST == 'undefined') ? "site:tenor.com OR site:giphy.com" : process.env.DUCK_SEARCH_LIST;

// If content rating or safe search is not set, provide a default value
config.TENOR_CONTENT_RATING = !(process.env.TENOR_CONTENT_RATING) ? "low" : process.env.TENOR_CONTENT_RATING; //off (R), low (PG13 -- default), medium (PG), or high(G) more info here: https://tenor.com/gifapi/documentation#contentfilter
config.GIPHY_CONTENT_RATING = !(process.env.GIPHY_CONTENT_RATING) ? "pg13" : process.env.GIPHY_CONTENT_RATING; // r, pg13, pg, g more infor here: https://developers.giphy.com/docs/optional-settings#rating
config.DUCKDUCKGO_SAFE_SEARCH = !(process.env.DUCKDUCKGO_SAFE_SEARCH) ? "1" : process.env.DUCKDUCKGO_SAFE_SEARCH; // off (-1), moderate (1 --default). Currently no support for strict safesearch, sorry

//Matrix server information
config.MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN;
config.HOME_SERVER_URL = process.env.HOME_SERVER_URL;

module.exports = config;