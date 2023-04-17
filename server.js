const path = require('path');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const soketio = require('socket.io');
const io = soketio(server);
const port = 4000;
const db = require('./models/db');
const session = require('express-session'); // Para manejar sesiones
const bodyParser = require('body-parser'); // Para leer los datos del formulario
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
botName = 'Spark-Bot';

//Import message
const formatMessage = require('./models/message');

//Import users
const {userJoin, getCurrentUser,userLeave,getRoomUsers,User} = require('./models/user');


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'ejs');


// Run when client connects
io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    //Join User to chatRoom
    socket.on('joinRoom', ({username, room}) => {
      console.log(username, room);
      const user = userJoin(socket.id, username, room);      
      socket.join(user.room);
      
      // Welcome current user
      socket.emit('message',formatMessage(botName,'Welcome to Spark LiveChat!'));
      // Broadcast when a user connects
      socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));
      // Send users and room info to client in the room
      io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(room)
      });        
    });
    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        if (user) {
          io.to(user.room).emit('message', formatMessage(user.username, msg));}  

    });
    // Runs when client disconnects
    socket.on('disconnect', () => {
        console.log('Client disconnected');
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));
            io.to(user.room).emit('roomUsers', {
              room: user.room,
              users: getRoomUsers(user.room)
          });
        } else {socket.emit('leaveRoom'); }


        
         
    });
});

//ROUTES

//Main Page
app.get('/', (req, res) => {
  if (req.session.user) {
    delete req.session.errorMessage
    res.render('index', { username: req.session.user.username, errorMessage: req.session.errorMessage });
  } else {
    res.redirect('/login');
}});
app.post('/', (req, res) => {
  const room = req.body.room;
  const username = req.body.username;
  const users= getRoomUsers(room);
  
  // Buscar si el usuario ya existe en el array
  const existingUser = users.find(user => user.username === username);

  // Si el usuario ya existe, mostrar un error
  if (existingUser) {
    req.session.errorMessage ='Ya esta conectado a esta sala, por favor elija otra.'
    console.log(req.session.errorMessage)
    res.render('index', {username, errorMessage: req.session.errorMessage });
  } else {
    // Si el usuario no existe, redirigir al chat
    res.render('chat', { username, room });
  }
});

//Register Page
app.get('/register', (req, res) => {
    delete req.session.errorMessage; // Elimina cualquier mensaje de error de sesion previo
    res.render('register', { errorMessage: req.session.errorMessage });
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
          delete req.session.errorMessage;
          res.render('index', { username: req.session.user.username, errorMessage: req.session.errorMessage  });//send the username to index
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

//Login Page
app.get('/login', (req, res) => {
delete req.session.errorMessage;
res.render('login', { errorMessage: req.session.errorMessage });
});
app.post('/login', ( req,res) => {
    const username= req.body.username;
    const password= req.body.password;
    let errorMsg = '';
    
    User.findOne({username})
    .then((user) => {
      if (user) {
        if (user.password === password) {
          console.log('Usuario autenticado');
          req.session.user = user;
          console.log(req.session.user);
          delete req.session.errorMessage;
          res.render('index', { username: req.session.user.username, errorMessage: req.session.errorMessage }); //send the username to index

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

app.get('/chat', (req, res) => {
  res.redirect('/');
});

    



// Listen on port when connection is established to database
db.on('connected', () => {
    console.log('Conexión establecida');
    server.listen(port, () => console.log(`Listening on port ${port}`));
  });
