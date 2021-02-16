/*  ========================================= */
const fileSystemAPI = require("fs");
const storage = require("./storage"); 
const config = require("./config.json");
const Dockerode = require("dockerode");
const dockerConnection = new Dockerode();

/*  ========================================= */
const detectedContainersCounter = {};
const attachedContainers = [];

/*  ========================================= */
function saveContainerAttachment(containerInfo) {  
  attachedContainers.push(containerInfo);
  const data = JSON.stringify(attachedContainers);
  fileSystemAPI.writeFileSync(config.currentContainersFile, data);
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

  dockerConnection.listContainers(
    { all: config.logStoppedContainersAlso },
    function (err, containers) {
      if (err) {
        console.error("Docker is not running!");
      } else {
        containers.forEach((containerInfo) => logContainer(containerInfo.Id));
      }
    }
  );
}

/*  ========================================= */
async function logContainer(containerId) {
  const defaultSettings = { follow: true, timestamps: true };
  const container = dockerConnection.getContainer(containerId);
  const containerInfo = await container.inspect(); 
  const containerImage = containerInfo.Config.Image; 

  let shouldListen = true;
  let maxAttached = 0;
  let lowListenThreshold = 0;
  let attachOneForEvery = 0;

  if (!config.imageSettings[containerImage]) {
    maxAttached = config.imageSettings["*"].maxAttached;
    lowListenThreshold = config.imageSettings["*"].lowListenThreshold;
    attachOneForEvery = config.imageSettings["*"].attachOneForEvery;
  } else {
    maxAttached = config.imageSettings[containerImage].maxAttached;
    lowListenThreshold = config.imageSettings[containerImage].lowListenThreshold;
    attachOneForEvery = config.imageSettings[containerImage].attachOneForEvery;
  }
  
  if (!detectedContainersCounter[containerImage]) { 
    detectedContainersCounter[containerImage] = {
      listenedTo: 0,
      total: 0,
    };
  } else if (detectedContainersCounter[containerImage].listenedTo >= maxAttached) {
    shouldListen = false;
  } else if (
    detectedContainersCounter[containerImage].listenedTo >
      lowListenThreshold &&
    detectedContainersCounter[containerImage].total % attachOneForEvery != 0
  ) {
    shouldListen = false;
  }

  if (shouldListen) {
    saveContainerAttachment({ id: containerInfo.Id,
      image: containerInfo.Config.Image,
      name: containerInfo.Name})

    detectedContainersCounter[containerImage].listenedTo++;
    const logsStdout = await container.logs({
      ...defaultSettings, 
      stdout: true,
    });

    logsStdout.on("data", (incoming_message) => storage.writeLog(incoming_message, containerInfo));
  }

  detectedContainersCounter[containerImage].total++;

  if (config.logErrorsOfAll) {
    const logsStderr = await container.logs({
      ...defaultSettings,
      stderr: true,
    });
    logsStderr.on("data", (incoming_message) =>
      storage.writeLog(incoming_message, containerInfo)
    );
  }
}

module.exports = { start };
