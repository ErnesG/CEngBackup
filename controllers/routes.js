// app/routes.js

var loggedMiddleware  =  require('../middlewares/rutasprotegidas');




/**  @params  app y passport de server.js */
module.exports = function(app, passport) {

	
	// ===========e==========================
	// Pagina principal con login (links)
	// =====================================
	app.get('/', function(req, res) {
		res.render('index.ejs', { mensaje_flash: req.flash('loginmensaje_flash') });

	});


	// process the login form
	app.post('/entrar', passport.authenticate('local-login', {
			successRedirect : '/perfil', // redirect to the secure profile section
			failureRedirect : '/', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash mensaje_flashs
		}),

		function(req, res) {

			console.log("req.body.remember", req.body.remember);

			if (req.body.remember) {
			  req.session.cookie.maxAge = 1000 * 60 * 3;
			} else {
			  req.session.cookie.expires = false;
			}
		res.redirect('/');
	});

	// =====================================
	//  Registro
	// =====================================
	app.get('/registro', function(req, res) {
		res.render('registro.ejs', { mensaje_flash: req.flash('signupmensaje_flash') });
	});

	app.post('/registro', passport.authenticate('local-signup', {
		successRedirect : '/', 
		failureRedirect : '/registro', 
		failureFlash : true 
	}));

	// =====================================
	// seccion de perfil con middleware: isLoggedIn
	// =====================================
	app.get('/perfil', loggedMiddleware, function(req, res) {
		res.render('perfil.ejs', {
			user : req.user 
		});
	});

	// =====================================
	// LOGOUT
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
	
};
