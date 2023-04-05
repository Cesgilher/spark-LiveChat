const { default: mongoose } = require("mongoose");
const User = require("./user");
const Mensaje = require('./message');


//Parametros para la conexion a la base de datos de MongoDB
mongoose.connect('mongodb://localhost:2112', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  user: 'spark',
  pass: 'spark',
  dbName: 'spark'
});
//Conexion a la base de datos de MongoDB
mongoose.connection.on('connected', () => {
  console.log('Conexión establecida');
})
//Creacion de un usuario de prueba

// const newUser = new User({username:'cesgher',email:'cesgiher@gmail.com',password:'123456789'});
// newUser.save()
//         .then((user) => {
//         console.log(user.username + ' guardado en la base de datos.');
//         })
//         .catch((err) => {
//           let errorMsg = 'Error al guardar el usuario en la base de datos. ';
//           if (err.code === 11000) {
//             // Manejar el error de clave única duplicada (username o email)
//             if (err.keyPattern.username) {
//               console.log('El nombre de usuario ya está en uso.');
//             } else if (err.keyPattern.email) {
//               console.log('El correo electrónico ya está en uso.');
//             }
//           } else {
//             // Manejar cualquier otro error
//             errorMsg += err.message;
//           }
//         });

        User.find()
        .then((users) => {
            console.log(users);
        })
        .catch((err) => {
            console.error(err);
        });
//Comprovar que el usuario se ha creado correctamente

// module.exports = db;

// const newMensaje = new Mensaje({nombreUsuario:'cesgiher',contenido:'Hola, que tal juan?'});
// newMensaje.save()
//         .then((mensaje) => {
//         console.log('mensaje guardado en la base de datos.');
//         })
//         .catch((err) => {
//           let errorMsg = 'Error al guardar el mensaje en la base de datos. ';});
Mensaje.find()
.then((mensajes) => {
    console.log(mensajes);
})

