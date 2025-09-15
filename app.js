require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require('bcrypt');

// --- DATABASE & MODELS ---
const sequelize = require('./database.js');
// The paths must start with "./" to look in the current directory.
const User = require('./models/user.js');
const Listing = require('./models/listing.js');
const Review = require('./models/review.js');

// --- DEFINE RELATIONSHIPS ---
User.hasMany(Listing, { foreignKey: 'ownerId', onDelete: 'CASCADE' });
Listing.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
Listing.hasMany(Review, { foreignKey: 'listingId', onDelete: 'CASCADE' });
Review.belongsTo(Listing, { foreignKey: 'listingId' });
User.hasMany(Review, { foreignKey: 'authorId', onDelete: 'CASCADE' });
Review.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

// --- SYNC DATABASE ---
// IMPORTANT: This will reset your database one last time.
async function syncDatabase() {
  try {
    sequelize.sync({ alter: true });
    // await sequelize.sync({ force: true });
    console.log('✅ Database forced sync complete. Tables dropped and recreated!');
    // AFTER THIS RUNS ONCE, CHANGE { force: true } TO { alter: true }
    // This will prevent deleting your data every time you restart the server.
  } catch (error) {
    console.error('❌ Error synchronizing the database:', error);
  }
}
syncDatabase();

// --- ROUTE IMPORTS ---
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// --- MIDDLEWARE & VIEW ENGINE SETUP ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: { expires: Date.now() + 7 * 24 * 60 * 60 * 1000, maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true },
};

app.use(session(sessionOptions));
app.use(flash());

// --- PASSPORT.JS AUTHENTICATION CONFIGURATION ---
app.use(passport.initialize());
app.use(passport.session());

// Define the "local" strategy for username/password login
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        // 1. Find the user in the database
        const user = await User.findOne({ where: { username: username } });
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        // 2. Compare the provided password with the hashed password in the database
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        // 3. If everything is correct, return the user
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// Tell Passport how to store the user in the session (it only stores the UUID)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Tell Passport how to retrieve the user from the session using the UUID
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Middleware to make flash messages and user info available in all templates
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// --- ROUTE HANDLERS ---
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// --- ERROR HANDLING ---
app.all("*", (req, res, next) => { next(new ExpressError(404, "Page Not Found!")); });

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

// --- START SERVER ---
app.listen(8080, () => { console.log("Server is listening to port 8080"); });

