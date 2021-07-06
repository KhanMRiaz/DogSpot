const express = require("express");
const app = express();
var bodyParser = require("body-parser");
const api = require("./api");
const config = require("./config");
var jwt = require("jsonwebtoken");

//db connection to be used by all endpoints
const { Sequelize } = require("sequelize");
const db = new Sequelize(
	config.db.database,
	config.db.username,
	config.db.password,
	{
		host: config.db.host,
		port: config.db.port,
		dialect: config.db.dialect,
		logging: false,
	}
);
db.authenticate()
	.then(() => console.log("Connection has been established successfully."))
	.catch((err) => console.error(err));

//session management
function authenticate_token(req, res, next) {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (token == null) return res.sendStatus(401);

	jwt.verify(token, "secret", (err, user) => {
		console.log(err);

		if (err) return res.sendStatus(401);

		req.user = user.user;

		next();
	});
}

const PORT = 3000;
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(function (req, res, next) {
	// console.log(req)
	console.debug(
		`Request Url: ${req.url}, Request Method: ${
			req.method
		}, Request Body: ${JSON.stringify(
			req.body
		)}, Request Params: ${JSON.stringify(
			req.params
		)}, Request Query: ${JSON.stringify(req.query)}`
	);
	next();
});

app.post("/api/login", async (req, res) => {
	req.db = db;
	api.users.login(req, res);
});

app.post("/api/register", (req, res) => {
	req.db = db;
	api.users.register(req, res);
});
app.post("/api/google_login", (req, res) => {
	req.db = db;
	api.users.google_login(req, res);
});

app.post("/api/user/:method?", authenticate_token, (req, res) => {
	req.db = db;
	if (req.params.method) api.users[req.params.method](req, res);
	else api.users[req.method.toLowerCase()](req, res);
});

app.post("/api/job/:method?", authenticate_token, (req, res) => {
	req.db = db;
	if (req.params.method) api.jobs[req.params.method](req, res);
	else api.jobs[req.method.toLowerCase()](req, res);
});

app.listen(PORT);
console.log(`App is running at port:${PORT}`);
