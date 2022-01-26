const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const hbs = require('express-handlebars');
const axios = require('axios')
const config = require("../config");

const tenor_url = "https://g.tenor.com/v1";
const giphy_url = "http://api.giphy.com/v1";
const duck_url = "https://duckduckgo.com";

//DuckDuckGo headers
const duck_config = {
  headers: {
    'Accept': 'application/json, text/javascript, */*;',
    "Accept-Encoding": "gzip, deflate, sdch"
  }
};

app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
}));
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.json());
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
  let service = "";
  let padding = "1";
  if (config.GIPHY_API_KEY) {
    service = "giphy";
  }
  else if (config.TENOR_API_KEY) {
    service = "tenor";
    padding = 0;
  }//default to DuckDuckGo as it does not require an API key
  else {
    service = "duck";
  }
  res.render('search-gif', { service: service, padding: padding });
});

app.get('/search', function (req, res) {
  let raw_keyword = req.query.keyword;
  //As long as keyword is not undefined, encode it.
  let keyword = (typeof raw_keyword == 'undefined' ? raw_keyword : encodeURI(raw_keyword));
  //For some reason we cannot pre-encode spaces for DuckDuckGo, but we want to encode other special chars
  keyword = (typeof keyword == 'undefined' ? keyword : keyword.replaceAll("%20", " "));
  if (config.GIPHY_API_KEY) {
    giphy_search(res, keyword);
  }
  else if (config.TENOR_API_KEY) {
    tenor_search(res, keyword);
  }
  else {
    duckduckgo_search(res, keyword);
  }
});


app.post('/upload', function (req, resp) {
  let gif_url = req.body.url;
  let matrix_upload_url = config.HOME_SERVER_URL + "/_matrix/media/v3/upload?access_token=";
  let access_token = "";
  let axios_config_gif = {
    headers: {
      "Content-Type": "image/gif",
    }
  }

  axios
    .get(gif_url, {
      responseType: 'arraybuffer'
    })
    .then(response => {
      // Put the gif in a buffer for upload
      const gif_buffer = Buffer.from(response.data, 'binary');
      access_token = config.MATRIX_ACCESS_TOKEN;
      axios
        .post(matrix_upload_url + access_token, gif_buffer, axios_config_gif)
        .then(res => {
          // Get the size of the image and add it to the response
          res.data.size = Buffer.byteLength(gif_buffer);
          resp.json(res.data);
        })
        .catch(error => {
          console.error(error)
        })

    })
    .catch(ex => {
      console.error(ex);
    });

});

app.listen(port, () => {
  console.log('Gif Search listening on port: ', port);
});

function tenor_search(res, keyword) {
  let url = (typeof keyword == 'undefined' ? tenor_url + '/trending?key=' + config.TENOR_API_KEY + "&contentfilter=" + config.TENOR_CONTENT_RATING : tenor_url + '/search?q=' + keyword + "&contentfilter=" + config.TENOR_CONTENT_RATING + '&key=' + config.TENOR_API_KEY);
  axios.get(url)
    .then(function (response) {
      let gifs = response.data.results;
      res.render('partials/results_tenor', { layout: false, gifs: gifs });
    });
}

function giphy_search(res, keyword) {
  let url = (typeof keyword == 'undefined' ? giphy_url + '/gifs/trending?api_key=' + config.GIPHY_API_KEY + "&rating=" + config.GIPHY_CONTENT_RATING : giphy_url + '/gifs/search?q=' + keyword + "&rating=" + config.GIPHY_CONTENT_RATING + '&api_key=' + config.GIPHY_API_KEY);
  axios.get(url)
    .then(function (response) {
      let gifs = response.data.data;
      res.render('partials/results_giphy', { layout: false, gifs: gifs });
    });
}

function duckduckgo_search(res, keyword) {
  // Append list of allowed sites to query
  let query = keyword;
  if (config.DUCK_SEARCH_LIST) {
    query = query + " (" + config.DUCK_SEARCH_LIST + ")";
  }
  get_duck_token(query)
    .then(function (response) {
      token = response.data.match(/vqd=([\d-]+)\&/)[1];
      let params = {
        "l": "wt-wt",
        "o": "json",
        "q": query,
        "vqd": token,
        "f": ",,,type:gif,,",
        "p": config.DUCKDUCKGO_SAFE_SEARCH
      }
      axios.get(duck_url + "/i.js", { headers: duck_config.headers, params: params })
        .then(function (response) {
          let gifs = response.data.results;
          res.render('partials/results_duck', { layout: false, gifs: gifs });
        })
        .catch(error => {
          console.error(error)
        });
    })
    .catch(error => {
      console.error(error)
    });
}

function get_duck_token(keyword) {
  return axios.get(duck_url, {
    params: {
      q: keyword
    }
  });
}