//MongoDB Heroku location || local location 

module.exports = {
		url : process.env.MONGOHQ_URL || 'mongodb://localhost/heartgov'
	};