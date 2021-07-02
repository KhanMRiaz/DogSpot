const validators = require("../helpers/validators")
const hash = require('hash-it')
var jwt = require('jsonwebtoken')
const _ = require('lodash')

class Jobs {
	constructor() {
		this.validate = validators.job_validator
		this.table = 'jobs'
	}

	get_model = async (db) => {
		try {
			// console.log(`Returning ${this.table} model`)
			return db.model(this.table)
		} catch (e) {
			// console.log(`Iniitializing ${this.table} model`)
			this.queryInterface = db.getQueryInterface()
			let def = await this.queryInterface.describeTable(this.table)
			delete def.id
			let model = await db.define(this.table, def, {
				tableName: this.table,
				'createdAt': 'created_on',
				'updatedAt': 'updated_on',
				underscored: false
			})
			return model
		}
	}

	post = async (req, res) => {
		let valid = this.validate.post(req.body)
		var result
		if (valid === true) {
			req.body.user_id = req.user ? req.user.id : 1
			let model = await this.get_model(req.db)
			try {
				result = await model.create(req.body, {
					whereisNewRecord: true,
				})
			} catch (e) {
				if (Array.isArray(e.errors)) {
					var errors = e.errors.map((err) => {
						return { [err.path.replace("_UNIQUE", "")]: err.message.replace("_UNIQUE", "") }
					})
				}
				res.status(400)
				res.send({ errors })
			}
			res.status(200)
			res.send({ data: { ...result.dataValues, bids: [] } })
		}
		else {
			res.status(400)
			res.send({ errors: valid })
		}
	}

	get_jobs = async (req, res) => {
		let user = req.user
		console.log(user)
		let jobs

		let model = await this.get_model(req.db)
		if (user.type == 0) {
			jobs = await model.findAll({
				'where': {
					user_id: user.id
				}
			})
		} else {
			jobs = await model.findAll({})
		}

		jobs.map(job => {
			return job.dataValues.bids = []
		})
		res.status(200)
		res.send({ data: jobs })
	}
}
module.exports = new Jobs()