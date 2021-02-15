const config = require("./config.json");
const adapter = require("./storageAdapters/"+config.storage);

module.exports = adapter; 