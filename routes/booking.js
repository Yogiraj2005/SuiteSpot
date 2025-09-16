const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/bookings.js");

// Route to display the "My Bookings" page
router.get("/my-bookings", isLoggedIn, wrapAsync(bookingController.showMyBookings));

module.exports = router;
