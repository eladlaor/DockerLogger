const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.connect("mongodb://localhost/sat1",  { useNewUrlParser: true, useUnifiedTopology: true }); 
const RELEVANT_CHARS = 39;
const TIME_FMT_START = 8;
const TIME_FMT_END = 38;

const schema = new Schema({
    logged_message: String,
    logType: String, 
    container: String,
    image: String,
    name: String,
    time: { type: Date, default: Date.now }, 
  });
  
const Message = mongoose.model("Message", schema); 

module.exports = Message;

function writeLog(message, containerInfo) {
  Message.create({
    logged_message: message.toString().substring(RELEVANT_CHARS), 
    logType: message[0] == 1 ? "out" : "err", 
    container: containerInfo.Id,
    image: containerInfo.Config.Image,
    name: containerInfo.Name,
    time: message.toString().substring(TIME_FMT_START, TIME_FMT_END)
  }).catch((e) => console.error("Cannot write to database. Error description: ", e));
}

function getLogs(query) {
  return Message.find(query).exec();
}

function clear() {
  return Message.deleteMany({})
}

module.exports = {writeLog, getLogs, clear};
