/* ============================================ */
const fs = require("fs"); 
const express = require("express");
const app = express(); 
const storage = require("./storage");
const config = require("./config.json");
const mcache = require('memory-cache'); 
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/* ============================================ */
const cache = (duration) => {
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url;
    let cachedBody = mcache.get(key);
    if (cachedBody) {
      res.send(cachedBody)
      return;
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body);
      }
      next();
    }
  }
}

/* ============================================ */
app.get("/", (req, res) => {
  console.log("someone just entered the logger service"); 
  res.send("<h1>welcome to the <i>logger</i> buddy!</h1>"); 
});

app.get("/log", cache(30), async (req, res) => {
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
    const millisecondsAgo = minutesAgo * 60000;
    const currInMilliSecs = new Date().valueOf();
    const since = currInMilliSecs - millisecondsAgo; 
    dbQuery.time = { "$gte": new Date(since) }
  }

  console.log(`someone wants to check up on the container named: ${name}`);

  res.send(await storage.getLogs(dbQuery)); 
});

app.get("/container", async (req, res) => {
  const data = JSON.parse(fs.readFileSync(config.currentContainersFile));
  res.send(data);
});

/* ============================================ */
app.post("/log", (req, res) => {
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
app.delete("/log", async (req, res) => {
  await storage.clear();
  res.send("deleted successfully");
});

/* ============================================ */
module.exports = app;
