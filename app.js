// dotenv
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
// -------------------------------------------------------------------



// all requires
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

// custom defined error handler
const expressError = require('./utils/expressError');

// flash and session
const flash = require('connect-flash')
const session = require('express-session');

// passport
const passport = require('passport');
const LocalStrategy = require('passport-local');

// models
const User = require('./models/user')

// routes
const campgroundRoute = require('./routes/campgrounds')
const reviewsRoute = require('./routes/reviews')
const userRoute = require('./routes/users');
// -------------------------------------------------------------------

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const MongoStore = require('connect-mongo');

// database connection stuff
// mongodb://localhost:27017/yelp-camp
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

mongoose.connection.on("error", console.error.bind(console, 'Connection error!'));
mongoose.connection.once("open", () => {
    console.log('Connected to MongoDB!')
});
// -------------------------------------------------------------------



const app = express();



// ejs configuration
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// -------------------------------------------------------------------



// middlewares
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}))
app.use(helmet());
// -------------------------------------------------------------------

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dtmkyq0au/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);
// -------------------------------------------------------------------

const secret = process.env.SECRET || 'shrey2807';

// session configuration
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    secret,
    name: 'session',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
// -------------------------------------------------------------------



// passport portion for authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// -------------------------------------------------------------------



// flash message
app.use(flash());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
// -------------------------------------------------------------------



// exported routers
app.use('/', userRoute);
app.use('/campgrounds', campgroundRoute);
app.use('/campgrounds/:id/reviews', reviewsRoute);
// -------------------------------------------------------------------



// remaining routes, if any
app.get('/', (req, res) => {
    res.render('home');
})
// -------------------------------------------------------------------



// error handling
app.all('*', (req, res, next) => {
    next(new expressError('Page not found!', 404));
})

app.use((err, req, res, next) => {
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).render('error', { err });
})
// -------------------------------------------------------------------



// starting the server and serving on a port
app.listen(3000, () => {
    console.log('Serving on port 3000');
})
// -------------------------------------------------------------------
