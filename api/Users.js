const validators = require("../helpers/validators");
const hash = require("hash-it");
var jwt = require("jsonwebtoken");
const _ = require("lodash");

class Users {
	constructor() {
		this.validate = validators.user_validator;
		this.table = "users";
	}

	get_model = async (db) => {
		try {
			// console.log(`Returning ${this.table} model`)
			return db.model(this.table);
		} catch (e) {
			// console.log(`Iniitializing ${this.table} model`)
			this.queryInterface = db.getQueryInterface();
			let def = await this.queryInterface.describeTable(this.table);
			delete def.id;
			let model = await db.define(this.table, def, {
				tableName: this.table,
				createdAt: "created_on",
				updatedAt: "updated_on",
				underscored: true,
			});
			return model;
		}
	};

	get = (req, res) => {
		res.send("USER : GET");
	};

	register = async (req, res) => {
		let valid = this.validate.post(req.body);
		if (valid === true) {
			req.body.password_copy = req.body.password;
			req.body.password = hash(req.body.password);
			req.body.email = req.body.email.toLowerCase();
			let model = await this.get_model(req.db);
			try {
				await model.create(req.body, {
					whereisNewRecord: true,
				});
				this.login(req, res);
			} catch (e) {
				console.log("e: ", e);
				let errors = e.errors.map((err) => {
					return {
						[err.path.replace("_UNIQUE", "")]: err.message.replace(
							"_UNIQUE",
							""
						),
					};
				});
				res.status(400);
				res.send({ errors });
			}
		} else {
			res.status(400);
			res.send({ errors: valid });
		}
	};

	login = async (req, res) => {
		let model = await this.get_model(req.db);
		let user = await model.findOne({
			where: {
				email: req.body.email.toLowerCase(),
			},
		});
		if (_.isEmpty(user)) {
			res.status(400);
			res.send({
				errors: [
					{
						email: "No account is associated with this email",
					},
				],
			});
			return;
		}
		if (req.body.password_copy != undefined) {
			req.body.password = req.body.password_copy;
		}
		if (hash(req.body.password) == parseInt(user.password)) {
			let token = jwt.sign(
				{
					user,
				},
				"secret",
				{ expiresIn: 3 * 24 * 3600 }
			);
			res.status(200);
			res.send({ token, user });
			return;
		}
		res.status(400);
		res.send({
			errors: [
				{
					password: "Invalid Password",
				},
			],
		});
		return;
	};

	google_login = async (req, res) => {
		let model = await this.get_model(req.db);
		const { google_token } = req.body;
		let user = await model.findOne({
			where: {
				google_token: google_token,
			},
		});
		if (_.isEmpty(user)) {
			res.status(400);
			res.send({
				errors: [
					{
						email: "No account is associated with this token",
					},
				],
			});
			return;
		}
		let token = jwt.sign(
			{
				user,
			},
			"secret",
			{ expiresIn: 3 * 24 * 3600 }
		);
		res.status(200);
		res.send({ token, user });
		return;
	};

	request_reset_password = async (req, res) => {
		let model = await this.get_model(req.db);
		const { email, step, reset_code, password } = req.body;
		let user = await model.findOne({
			where: {
				email: email,
			},
		});
		if (_.isEmpty(user)) {
			res.status(400);
			res.send({
				errors: [
					{
						email: "No account is associated with this email",
					},
				],
			});
			return;
		}
		if (step == 1) {
			let new_reset_code = Math.floor(100000 + Math.random() * 900000); //generate 6 digit random user verification code
			await model.update(
				{ reset_code: new_reset_code },
				{
					where: {
						id: user.id,
					},
				}
			);
			res.send({ reset_code: new_reset_code });
			return;
		}
		if (step == 2) {
			user = await model.findOne({
				where: {
					id: user.id,
					reset_code,
				},
			});
			if (_.isEmpty(user)) {
				res.status(400);
				res.send({
					errors: [
						{
							reset_code: "Verification code is not correct",
						},
					],
				});
				return;
			}
			res.send({
				user,
			});
			return;
		}
		if (step == 3) {
			user = await model.findOne({
				where: {
					id: user.id,
					reset_code,
				},
			});
			if (_.isEmpty(user)) {
				res.status(400);
				res.send({
					errors: [
						{
							reset_code: "Verification code is not correct",
						},
					],
				});
				return;
			}
			user.update({ password: hash(password), reset_code: null });
			res.send({
				message: "Password reset successfully",
			});
			return;
		}
		res.status(400);
		res.send({
			errors: {
				step: "step is a required parameter",
			},
		});
		return;
	};

	put = (req, res) => {
		res.send("USER : PUT");
	};

	delete = (req, res) => {
		res.send("USER : DELETE");
	};
}
module.exports = new Users();
