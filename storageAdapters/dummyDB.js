const RELEVANT_CHARS = 39;

function writeLog(message, containerInfo) {
  console.debug(
    "Writing new message to the dummyDB adapter:",
    message.substring(RELEVANT_CHARS),
    containerInfo.Id,
    containerInfo.Config.Image,
    containerInfo.Name
  );
}

async function getLogs(query) {
  console.debug("Returning empty logs from the dummyDB adapter");
  return [];
}

async function clear() {
  console.debug("DummyDB adapter wants to clear logs, but no logs are created");
}

module.exports = { writeLog, getLogs, clear };
