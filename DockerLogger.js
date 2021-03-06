/*  ========================================= */
const fileSystemAPI = require("fs");
const storage = require("./storage");
const config = require("./config.json");
const Dockerode = require("dockerode");
const dockerConnection = new Dockerode();
const serverDockerLogger = require("./server");

/*  ========================================= */
const detectedContainersCounter = {};
const labelsToAttach = [];

const attachedContainers = [];
const emptyFile = JSON.stringify(attachedContainers);
fileSystemAPI.writeFileSync(config.currentContainersFile, emptyFile);

/*  ========================================= */
function saveContainerAttachment(containerInfo) {
  attachedContainers.push(containerInfo);
  const data = JSON.stringify(attachedContainers);
  fileSystemAPI.writeFileSync(config.currentContainersFile, data);
}

/*  ========================================= */

function addLabel(label) {
  labelsToAttach.push(label);
  const updatedData = JSON.stringify(labelsToAttach);
  fileSystemAPI.writeFileSync(config.currentLabelsFile, updatedData);
}

/*  ========================================= */
async function start() {
  await storage.clear();

  const newContainersStream = await dockerConnection.getEvents({
    filters: '{ "event": ["create"], "Type": ["container"] }',
  });

  newContainersStream.on("data", (buffer) => {
    const eventInfo = JSON.parse(buffer.toString());
    console.log(
      `New container detected, named: (${eventInfo.Actor.Attributes.name})`
    );
    logContainer(eventInfo.id);
  });
}

/*  ========================================= */
async function logContainer(containerId) {
  const defaultSettings = { follow: true, timestamps: true };
  const container = dockerConnection.getContainer(containerId);
  const containerInfo = await container.inspect();
  const containerImage = containerInfo.Config.Image;

  let shouldListen = false;

  labelsToAttach.forEach((label) => {
    const key = Object.keys(label)[0];
    const value = label[key];

    if (
      Object.keys(containerInfo.Config.Labels).find(
        (currentKey) => currentKey === key
      ) &&
      containerInfo.Config.Labels[key] === value
    ) {
      console.log("This container will be attached to the logger.");
      shouldListen = true;
    } else {
      console.log("This container will NOT be attached.");
    }
  });

  if (shouldListen) {
    saveContainerAttachment({
      id: containerInfo.Id,
      image: containerInfo.Config.Image,
      name: containerInfo.Name,
    });

    const logsStdout = await container.logs({
      ...defaultSettings,
      stdout: true,
    });

    logsStdout.on("data", (incomingMessage) =>
      storage.writeLog(incomingMessage, containerInfo)
    );
  }

  if (config.logErrorsOfAll) {
    const logsStderr = await container.logs({
      ...defaultSettings,
      stderr: true,
    });
    logsStderr.on("data", (incomingMessage) =>
      storage.writeLog(incomingMessage, containerInfo)
    );
  }
}

start();

serverDockerLogger.listen(config.port, () => {
  console.log(`DockerLogger is now listening on port ${config.port}`);
});

exports.addLabel = addLabel;
