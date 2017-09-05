

var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);


/** =============================================
	Usando  nodemailer 4 para verificar email
============================================== */
var nodemailer = require('nodemailer');


// create reusable transporter object using the default SMTP transport
var smtpTransport = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465,
	secure: true, // secure:true for port 465, secure:false for port 587
	auth: {
		user: 'thrafiker@gmail.com',
		pass: ''
	}
});

/** =============================================
	FIN   Usando  nodemailer 4 para verificar email
============================================== */

var rand,mailOptions,host,link;


module.exports = function(app) {



	/** =============================================
		Rutas para verificar email
	============================================== */

	app.get('/verify',function(req,res){
		

		console.log(req.protocol+":/"+req.get('host'));
		
		//if((req.protocol+"://"+req.get('host'))==("http://"+host)){

			connection.query("SELECT email FROM users WHERE id = ?", [req.query.id], function(err, filaUsuario){
				if (err) res.end("<h1>Error en servidor</h1>");
				
				if(filaUsuario){

					connection.query("UPDATE users SET activo = 'si' WHERE id = ?", [req.query.id], function(error, updateUser){
						if (err) res.end("<h1>Error en servidor</h1>");
						
							
							var str1 = '/confirmar?email=';
							res.redirect( str1.concat(filaUsuario[0].email) );

					});
				}else{
					res.end("<h1>Peticion erronea</h1>");
				}
			});

		//}else
		//	res.end("<h1>Peticion desconocida</h1>");
		
	});


	app.get('/confirmar', function(req, res){

		res.render('verificar.ejs', {correo : req.query.email});

	})

};

