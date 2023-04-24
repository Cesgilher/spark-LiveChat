const { default: mongoose } = require("mongoose");
const User = require("./user");
const {AddMessage} = require('./message');
const {RetrieveMessages} = require('./message');
const date = require('moment');


//Parametros para la conexion a la base de datos de MongoDB
 mongoose.connect('mongodb://host.docker.internal:2112', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  user: 'spark',
  pass: 'spark',
  dbName: 'spark'
});

const db = mongoose.connection;

module.exports = db;

