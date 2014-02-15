//DB model for saving texts

var mongoose = require('mongoose');

module.exports = mongoose.model('SMS', {
  From: Number,
  To: Number,
  Body: String,
  Response: String,
  Responder: String,
  Searchable: Array,
  date: {type: Date, default: Date.now}
});