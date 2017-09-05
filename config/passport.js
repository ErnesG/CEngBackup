// config/passport.js

var LocalStrategy   = require('passport-local').Strategy;

// Modelos
var bcrypt = require('bcrypt-nodejs');

var mysql = require('mysql');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);


connection.query('USE ' + dbconfig.database);


/** =============================================
	Usando  nodemailer 4 para verificar email
============================================== */
const nodemailer = require('nodemailer');


// create reusable transporter object using the default SMTP transport
let smtpTransport = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465,
	secure: true, // secure:true for port 465, secure:false for port 587
	auth: {
		user: 'thrafiker@gmail.com',
		pass: ''
	}
});

var rand,mailOptions,host,link;




// expose this function to our app using module.exports
module.exports = function(passport) {

	// used to serialize the user for the session
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	// used to deserialize the user
	passport.deserializeUser(function(id, done) {
		connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
			done(err, rows[0]);
		});
	});

	// =========================================================================
	//      Registro
	// =========================================================================
	passport.use(
		'local-signup',
		
		new LocalStrategy({
			emailField : 'email',
			passwordField : 'password',
			passReqToCallback : true 
		},

		function(req, email, password, done) {

			var nombre = req.body.nombre;
			var apellidopaterno = req.body.apellidopaterno;
			var apellidomaterno = req.body.apellidomaterno;
			var rol;

			if( email.includes("corporateenglish.com.mx") )
				rol = "profesor";
			else
				rol = "alumno";

			 // encuentra un usuario cuyo correo electrónico es el mismo que el correo electrónico de formularios
			 // estamos revisando para ver si ya existe el usuario que intenta ingresar
			connection.query("SELECT * FROM users WHERE email = ?",[email], function(err, rows) {
				
				if (err)
					return done(err);
				if (rows.length) {
					return done(null, false, req.flash('signupMessage', 'Este correo ya esta registrado'));
				} else {

					//  sino existe lo creamos
					var newUserMysql = {
						email: email,
						nombre: nombre,
						apellidopaterno: apellidopaterno,
						apellidomaterno: apellidomaterno,
						rol: rol,
						password: bcrypt.hashSync(password, null, null),  // use the generateHash function in our user model
						activo:'no'
					};

					var insertQuery = "INSERT INTO users ( email, nombre, apellidopaterno, apellidomaterno, rol, password, activo ) values (?,?,?,?,?,?,?)";

					connection.query(
						insertQuery,
						[newUserMysql.email, newUserMysql.nombre, newUserMysql.apellidopaterno, newUserMysql.apellidomaterno, newUserMysql.rol, newUserMysql.password, newUserMysql.activo],

						function(err, rows) {

							host=req.get('host');
							link="http://"+req.get('host')+"/verify?id="+rows.insertId;;

							// setup email data with unicode symbols
							mailOptions = {
								from: '"corporateenglish" <corporateenglish@corporateenglish.com>', // sender address
								// to: 'bar@blurdybloop.com, baz@blurdybloop.com', // puede ser una lista
								to : email, 
								subject : "Por favor confirme su cuenta.",
								html : "Saludos,<br> Su registro ha sido exitoso, ya puede acceder al sistema, solo confirme su cuenta haciendo clic en el siguiente enlace: <<enlace>>”.<br><a href="+link+">Clic aqui para verificar</a>"	
							};

							console.log(mailOptions);
							
							smtpTransport.sendMail(mailOptions, function(error, response){
								if(error){
									console.log(error);
								}else{
									console.log("Message sent: " + response.message);
								}

							});


							newUserMysql.id = rows.insertId;
							return done(null, newUserMysql);
						}
					);
				}
			});
		})
	);

	// =========================================================================
	//   Entrar
	// =========================================================================
	// estamos utilizando estrategias nombradas ya que tenemos una para el inicio de sesión y otra para la suscripción
	// por defecto, si no había nombre, simplemente se llamaría 'local'
	passport.use(
		'local-login',

		new LocalStrategy({
			// by default, local strategy uses email and password, we will override with email
			emailField : 'email', 
			passwordField : 'password',
			passReqToCallback : true // allows us to pass back the entire request to the callback
		},

		function(req, email, password, done) { 

			connection.query("SELECT * FROM users WHERE email = ? AND activo='si'", [email], function(err, filaUsuario){
				if (err)
					return done(err);
				if (!filaUsuario.length) {
					return done(null, false, req.flash('loginMessage', 'No se encuentra usuario')); 
				}

				if (!bcrypt.compareSync(password, filaUsuario[0].password))
					return done(null, false, req.flash('loginMessage', 'Error en contraseña, verificar')); 


				return done(null, filaUsuario[0]);
			});
		})
	);
};
