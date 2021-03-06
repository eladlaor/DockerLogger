const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.connect("mongodb://localhost/loggerdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const relevantChars = 39;
const timeFmtStart = 8;
const timeFmtEnd = 38;

const schema = new Schema({
  loggedMessage: String,
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
    loggedMessage: message.toString().substring(relevantChars),
    logType: message[0] == 1 ? "out" : "err",
    container: containerInfo.Id,
    image: containerInfo.Config.Image,
    name: containerInfo.Name,
    time: message.toString().substring(timeFmtStart, timeFmtEnd),
  }).catch((e) =>
    console.error("Cannot write to database. Error description: ", e)
  );
}

function getLogs(query) {
  return Message.find(query).exec();
}

function clear() {
  return Message.deleteMany({});
}

module.exports = { writeLog, getLogs, clear };
