var _ = require("lodash");
module.exports.user_validator = {
	post: (data) => {
		errors = [];
		if (_.isEmpty(data.first_name)) {
			errors.push({
				field: "first_name",
				error: "First Name is a required field",
			});
		}
		if (_.isEmpty(data.last_name)) {
			errors.push({
				field: "last_name",
				error: "Last Name is a required field",
			});
		}
		if (_.isEmpty(data.email)) {
			errors.push({
				field: "email",
				error: "Email is a required field",
			});
		}
		// if (_.isEmpty(data.phone)) {
		// 	errors.push({
		// 		field: "phone",
		// 		error: "Phone is a required field"
		// 	})
		// }
		if (_.isEmpty(data.password)) {
			errors.push({
				field: "password",
				error: "Password is a required field",
			});
		}

		return errors.length > 0 ? errors : true;
	},
};
module.exports.job_validator = {
	post: (data) => {
		errors = [];
		if (_.isEmpty(data.jobDetails)) {
			errors.push({
				field: "jobDetails",
				error: "Job Details is a required field",
			});
		}
		if (_.isEmpty(data.location)) {
			errors.push({
				field: "location",
				error: "Location is a required field",
			});
		}
		if (_.isEmpty(data.budget)) {
			errors.push({
				field: "budget",
				error: "Budget is a required field",
			});
		}
		if (_.isEmpty(data.serviceName)) {
			errors.push({
				field: "serviceName",
				error: "Service name is a required field",
			});
		}
		return errors.length > 0 ? errors : true;
	},
};
