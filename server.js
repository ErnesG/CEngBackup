// server.js

'use strict'
// ======================================================================

let express  	= 	require('express');
let session  	= 	require('express-session');
let cookieParser = 	require('cookie-parser');
let bodyParser  = 	require('body-parser');
let morgan 	 	= 	require('morgan');
let app      	= 	express();


let port     	= 	process.env.PORT || 8080;
	
let passport 	= 	require('passport');
let flash    	= 	require('connect-flash');

// configuration ===============================================================
// connect to our database

require('./config/passport')(passport); // pasamos passport para configuracion


app.use(morgan('dev')); // debug


app.use(cookieParser()); // read cookies (con auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

// nuestro motor de template
app.set('view engine', 'ejs');


app.use(express.static('public'));
app.use(express.static('files'));


// required for passport
app.use(session({
	secret: 'keysupersecret',
	resave: true,
	saveUninitialized: true
 } )); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistencia sesiones
app.use(flash()); // usamos connect-flash para almacenamiento de sesiones con flash 


// Run server to listen on port 3000.
let server = app.listen(8080, () => {
  console.log('App corriendo en puerto: ' + port);
});

let io = require('socket.io')(server);


// routes ======================================================================

let routes = require('./controllers/routes.js')(app, passport);
let confirmar =  require('./controllers/confirmar-email.js')(app); 

let chat =  require('./controllers/chat-sockets.js')(app, io); 
