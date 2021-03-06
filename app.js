if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const dataBaseURL = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
const port = process.env.PORT || 80;
const secret = process.env.SECRET || "thisshouldbeabettersecret";
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");
const catchAsync = require("./utils/catchAsync");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const langData = require("./public/data/language.json");
const { getLanguage, isLoggedIn, isAuthor, validateCampground } = require("./middleware");

const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

mongoose.connect(dataBaseURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const mongoStore = new MongoStore({
    url: dataBaseURL,
    secret,
    touchAfter: 24 * 60 * 60, // 24 hours
});

mongoStore.on("error", (error) => {
    console.log("Session store error", error);
});

app.use(
    session({
        secret,
        name: "YelpCamp",
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            // secure: true,
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
            maxAge: 1000 * 60 * 60 * 24 * 7,
        },
        store: mongoStore,
    })
);
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://cdn.jsdelivr.net",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = ["https://api.mapbox.com", "https://*.tiles.mapbox.com", "https://events.mapbox.com"];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: ["'self'", "blob:", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

// routing
app.get("/", getLanguage, (req, res) => {
    const { language } = req.session;
    req.session.language = "hu";
    req.session.langData = langData.languages.hu;
    res.render("home", { language, langData: req.session.langData });
});

app.all("*", (req, res, next) => {
    next(new ExpressError(req.session.langData._404, 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = req.session.langData.wrong } = err;
    if (!err.message) err.message = req.session.langData.wrong;
    res.status(statusCode).render("error", { err });
});

app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});
