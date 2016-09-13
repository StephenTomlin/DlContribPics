const request = require('request')
const env = require('dotenv').config()
var fs = require("fs")
var hits = []
// Helper function to do authenticated requests to the Github API
function githubRequest(endpoint, callback) {
  var requestData = {
    url: `https://api.github.com${endpoint}`,
    auth: {
      bearer: process.env.DB_TOKEN
    },
    headers: {
      'User-Agent': "request" // Github requires a user agent header. You can put anything here.
    }
  }

  request.get(requestData, callback) // The actual request. When the data is ready, `callback` is called.
}


// This gets the list of repo contributors and sends it to the `callback` function
function getRepoContributors(repoOwner, repoName, callback) {
  // Notice that the callback for githubRequest takes three parameters. That's because
  // we're simply passing it to the `request` call itself (see function above).
  // Also note the "fat arrow" syntax.
  githubRequest(`/repos/${repoOwner}/${repoName}/contributors`, (err, response, body) => {
    var data = JSON.parse(body)
    if (err) throw err;
    if (!fs.existsSync('avatar')) {
      fs.mkdirSync('avatar');
    }
    for (var i = 0; i < data.length; i++) {
      var destination = fs.createWriteStream(`./avatar/${data[i].login}.jpg`)
      request(data[i].avatar_url).pipe(destination);
    }
    callback(hits)
  })
}
// This is where the party actually starts!
getRepoContributors(process.argv[2], process.argv[3], console.log);

