/* ============================================ */
const Dockerode = require('dockerode');
const dockerConnection = new Dockerode();
const express = require('express');
const app = express();
const port = 4000;

/* ============================================ */
app.get('/', (req, res) => {
	console.log("Fulfilling my purpose in life as a container: creating a log!");
	res.send("<h1>Welcome to log-maker!</h1> Go to '/log_stdout' to send a log to stdout, or to '/log_stderr' to send it to stderr.");
})

app.get('/hi', (req, res) => {
	console.log("");
	res.send("hi to you too");
})

app.get('/log_stdout', (req, res) => {
	console.log("out-standing! this log was sent to stdout");
	res.send("out-standing! this log was sent to stdout");
})

app.get('/log_stderr', (req, res) => {
	console.error("err-gonomic! this log was sent to stderr");
	res.send("err-gonomic! this log was sent to stderr");
})

app.listen(port, () => {
	console.log(`log-maker is listening at port http:localhost:${port}`);
})