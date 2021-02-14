const config = require("./config.json");
const adapter = require("./storageAdapters/"+config.storage);

module.exports = adapter; // module: a way to pass objects through diff javascript files. existing keyword.