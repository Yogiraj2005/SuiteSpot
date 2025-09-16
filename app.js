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
const cron = require('node-cron');
const { Op } = require('sequelize');

// --- DATABASE & MODELS ---
const sequelize = require('./database.js');
const User = require('./models/user.js');
const Listing = require('./models/listing.js');
const Review = require('./models/review.js');
const Booking = require('./models/booking.js');

// --- DEFINE RELATIONSHIPS ---
User.hasMany(Listing, { foreignKey: 'ownerId', onDelete: 'CASCADE' });
Listing.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
Listing.hasMany(Review, { foreignKey: 'listingId', onDelete: 'CASCADE' });
Review.belongsTo(Listing, { foreignKey: 'listingId' });
User.hasMany(Review, { foreignKey: 'authorId', onDelete: 'CASCADE' });
Review.belongsTo(User, { as: 'author', foreignKey: 'authorId' });
User.hasMany(Booking, { foreignKey: 'guestId', onDelete: 'CASCADE' });
Booking.belongsTo(User, { as: 'guest', foreignKey: 'guestId' });
Listing.hasMany(Booking, { foreignKey: 'listingId', onDelete: 'CASCADE' });
Booking.belongsTo(Listing, { foreignKey: 'listingId' });

// --- SYNC DATABASE ---
async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true }); 
    // await sequelize.sync({ force: true });
    console.log(' Database synchronized successfully.');
  } catch (error) {
    console.error(' Error synchronizing the database:', error);
  }
}
syncDatabase();

// --- SCHEDULED TASK FOR BOOKING CLEANUP ---
cron.schedule('* * * * *', async () => {
    console.log('Running a task every minute to check for expired bookings...');
    try {
        const result = await Booking.destroy({
            where: {
                expiresAt: { [Op.lt]: new Date() }
            }
        });
        if (result > 0) {
            console.log(`🧹 Cleaned up ${result} expired booking(s).`);
        }
    } catch (error) {
        console.error('Error during expired booking cleanup:', error);
    }
});

// --- ROUTE IMPORTS ---
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js"); // <-- ADD THIS LINE

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
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ where: { username: username } });
        if (!user) { return done(null, false, { message: 'Incorrect username.' }); }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) { return done(null, false, { message: 'Incorrect password.' }); }
        return done(null, user);
    } catch (err) { return done(err); }
}));
passport.serializeUser((user, done) => { done(null, user.id); });
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (err) { done(err); }
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
app.use("/", bookingRouter); // <-- ADD THIS LINE

// --- ERROR HANDLING ---
app.all("*", (req, res, next) => { next(new ExpressError(404, "Page Not Found!")); });
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

// --- START SERVER ---
app.listen(8080, () => { console.log("Server is listening to port 8080"); });

