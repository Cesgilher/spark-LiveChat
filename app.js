const express = require('express');
const app = express();
const http = require('http').createServer(app);
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const session = require('express-session');
const io= require('socket.io')(http);
const path = require('path');
const ejs = require('ejs');
const mongoose = require("mongoose");
const User = require('./models/user');
//Body-Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.engine('.html', ejs.__express);
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'html');

mongoose.connect('mongodb://localhost:2112', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  user: 'spark',
  pass: 'spark',
  dbName: 'spark'
});
mongoose.connection.on('connected', () => {
  console.log('Conexión establecida');
    http.listen(3000, () => {
      console.log('listening on *:3000');
    });
});

app.get('/register', (req, res) => {
  delete req.session.errorMessage; // Elimina cualquier mensaje de error de sesion previo
  res.render('register', { errorMessage: req.session.errorMessage });
});
app.get('/login', (req, res) => {
  delete req.session.errorMessage;
  res.render('login', { errorMessage: req.session.errorMessage });
});

app.post('/register', (req, res) => {
  const username= req.body.username;
  const email= req.body.email;
  const password= req.body.password;
  const newUser = new User({username,email,password});
  newUser.save()
          .then((user) => {
          console.log(user.username + ' guardado en la base de datos.');
          req.session.user = user;
          res.render('chat', { user: req.session.user });
          })
          .catch((err) => {
            let errorMsg = 'Error al guardar el usuario en la base de datos. ';
            if (err.code === 11000) {
              // Manejar el error de clave única duplicada (username o email)
              if (err.keyPattern.username) {
                console.log('El nombre de usuario ya está en uso.');
                errorMsg='El nombre de usuario ya está en uso.';                    
              } else if (err.keyPattern.email) {
                console.log('El correo electrónico ya está en uso.');
                errorMsg='El correo electrónico ya está en uso.';
              }
              req.session.errorMessage = errorMsg;
              res.render('register', { errorMessage: req.session.errorMessage });
            } else {
              // Manejar cualquier otro error
              errorMsg += err.message;
            }
          });
});

app.post('/login', ( req,res) => {
  const username= req.body.username;
  const password= req.body.password;
  let errorMsg = '';
  if (!username) {
    errorMsg='Intruduzca un nombre de usuario';
    req.session.errorMessage = errorMsg;
    res.render('login', { errorMessage: req.session.errorMessage });

  }
  else if (!password) {
    errorMsg='Introduzca una contraseña';
    req.session.errorMessage = errorMsg;
    res.render('login', { errorMessage: req.session.errorMessage });
  }

  User.findOne({username})
  .then((user) => {
    if (user) {
      if (user.password === password) {
        console.log('Usuario autenticado');
        req.session.user = user;
        res.render('chat', { user: req.session.user });
      } else {
        errorMsg='Contraseña incorrecta';
        req.session.errorMessage = errorMsg;
        res.render('login', { errorMessage: req.session.errorMessage });
      }
    } else {
        errorMsg='El usuario no existe';
        req.session.errorMessage = errorMsg;
        res.render('login', { errorMessage: req.session.errorMessage });     
        }
      })
      .catch((err) => {
        console.log(err);
      });
  
});


// app.get('/mensajes', (req, res) => {
//   Mensaje.find({},(err, mensajes)=> {
//     res.send(mensajes);
//   });
// });
// app.post('/mensajes', (req, res) => {
//   var mensaje = new Mensaje(req.body);
//   mensaje.save((err) =>{
//     if(err)
//       sendStatus(500);
//     res.sendStatus(200);
//   });
// });


app.get('/', (req, res) => {

  if (req.session.user) {
    res.render('chat', { user: req.session.user });
  } else {
    res.redirect('/login')};
});


io.on('connection', (socket)=>{
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
      });
});
io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
      console.log('message: ' + msg);
    });
  });

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});
