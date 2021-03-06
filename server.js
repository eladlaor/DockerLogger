/* ============================================ */
const fileSystemAPI = require("fs");
const express = require("express");
const app = express();
const storage = require("./storage");
const config = require("./config.json");
const cacheModule = require("memory-cache");
const swaggerUI = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const dockerLogger = require("./DockerLogger");

const minuteToMillisecond = 60000;
const secondsInCache = 30;
const milliSecondsWaitingBeforeRemoval = 1000;

const labelsToAttach = [];

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

/* ============================================ */
app.get("/", (req, res) => {
  console.log("someone just entered the logger service");
  res.send("<h1>welcome to the <i>logger!</i></h1>");
});

/* ============================================ */
const cache = (duration) => {
  return (req, res, next) => {
    let key = "__express__" + req.originalUrl || req.url;
    let cachedBody = cacheModule.get(key);
    if (cachedBody) {
      res.send(cachedBody);
      console.log("retrieved by CACHE, thank you cache!");
      return;
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        cacheModule.put(key, body, duration * milliSecondsWaitingBeforeRemoval);
        res.sendResponse(body);
      };
      next();
    }
  };
};

app.get("/logs", cache(secondsInCache), async (req, res) => {
  const name = req.query.containerName;
  const logType = req.query.logType;
  const minutesAgo = req.query.minutesAgo;

  const dbQuery = {};

  if (name) {
    dbQuery.name = "/" + name;
  }

  if (logType) {
    dbQuery.logType = logType;
  }

  if (minutesAgo) {
    const millisecondsAgo = minutesAgo * minuteToMillisecond;
    const currInMillisecs = new Date().valueOf();
    const since = currInMillisecs - millisecondsAgo;
    dbQuery.time = { $gte: new Date(since) };
  }

  console.log(
    `the logs of the container named: ${name} are now retrieved from the db!`
  );

  res.send(await storage.getLogs(dbQuery));
});

/* ============================================ */
app.delete("/logs", async (req, res) => {
  await storage.clear();
  res.send("deleted successfully");
});

/* ============================================ */
app.post("/logs", (req, res) => {
  const containerInfo = {
    Id: "interface",
    Config: {
      Image: "interface",
    },
    Name: "/interface",
  };
  const message = "log written from the interface";
  storage.writeLog(
    Buffer.from("111111110000000000000000000000000000000" + message, "utf8"),
    containerInfo
  );
  res.send(JSON.stringify({ ...containerInfo, message }));
});

/* ============================================ */
app.get("/containers", async (req, res) => {
  const data = JSON.parse(
    fileSystemAPI.readFileSync(config.currentContainersFile)
  );
  res.send(data);
});

app.post("/labels", (req, res) => {
  const labelKey = req.query.labelKey;
  const labelValue = req.query.labelValue;

  const labelObj = {
    [labelKey] : labelValue
  }

  dockerLogger.addLabel(labelObj);

  res.send("The label was added successfully!");
})

/* ============================================ */
module.exports = app;