path = require("path");

module.exports = {
    listenPort: 3000,
    webRoot: path.resolve(__dirname, "../client/web"),
    githubHandle: "Crisu83",
    cacheDuration: 0 // 60000 // 10 mins in ms
};