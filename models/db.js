const { default: mongoose } = require("mongoose");
const User = require("./user");
const {AddMessage} = require('./message');
const {RetrieveMessages} = require('./message');
const date = require('moment');



//Parametros para la conexion a la base de datos de MongoDB
 mongoose.connect(`mongodb+srv://doadmin:ka5i821L0U69MH3e@mongodb-spark-cbd2512d.mongo.ondigitalocean.com/admin?tls=true&authSource=admin`, {

});

const db = mongoose.connection;

module.exports = db;

