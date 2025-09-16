const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const bookingController = require("../controllers/bookings.js"); // 1. Import the bookings controller
const { storage } = require("../cloudConfig.js");
const multer = require('multer');
const upload = multer({ storage });

// Routes for getting all listings and creating a new one
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn, 
        upload.single('listing[image]'),
        validateListing, 
        wrapAsync(listingController.createListing)
    );
    
// Route to show the "new listing" form
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Routes for showing, updating, and deleting a specific listing
router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn, 
        isOwner, 
        upload.single('listing[image]'),
        validateListing, 
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Route to show the "edit listing" form
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// --- THIS IS THE NEW BOOKING ROUTE ---
// 2. This route listens for the form submission from the "Book Now" button
router.post("/:id/book", isLoggedIn, wrapAsync(bookingController.createBooking));

module.exports = router;

