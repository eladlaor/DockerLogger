/* ==================Entry Point=============== */
const serverDockerLogger = require('./server')
const config = require("./config.json");
const dockerLogger = require('./DockerLogger'); 

/* ============================================ */
dockerLogger.start();

serverDockerLogger.listen(config.port, () => {
  console.log(
    `DockerLogger is now listening at port http:localhost:${config.port}`
  );
});