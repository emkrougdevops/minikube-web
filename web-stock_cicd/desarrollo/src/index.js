const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')
const { database } = require ('./keys.js');
const { getPriority } = require('os');
const passport = require('passport')

//routes
//const productsRouter = require('./routes/products.js')

//Initializations
const app = express();
require('./lib/passport')

//Settings
app.set('port',process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views' ));
app.engine('.hbs', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join( app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

//Middlewares
app.use(session({
    secret: 'steelcodessessions',
    resalve: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}))
app.use(flash())
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json()); 
app.use(passport.initialize())
app.use(passport.session())


//Global Variables
app.use((req, res, next) => {
    app.locals.success = req.flash('success')
    app.locals.message = req.flash('message')
    app.locals.user = req.user
    next()
})

//Routes
app.use(require('./routes'))
app.use(require('./routes/authentication'))
app.use('/products',require('./routes/products.js'))


//Public
app.use(express.static(path.join(__dirname, 'public')))

//Starting the server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'))
})