const config = require("./config.json");
const databaseAdapter = require("./storageAdapters/"+config.storage);

module.exports = databaseAdapter; 