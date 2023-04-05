const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema({
  nombreUsuario: {
    type: String,
    required: true
  },
  contenido: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Mensaje', mensajeSchema);

