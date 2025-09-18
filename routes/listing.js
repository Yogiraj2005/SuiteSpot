const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const bookingController = require("../controllers/bookings.js");
const { storage } = require("../cloudConfig.js");
const multer = require('multer');
const upload = multer({ storage });

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn, 
        upload.array('listing[image]', 5), // <-- THIS IS THE CHANGE (accept up to 5 images)
        validateListing, 
        wrapAsync(listingController.createListing)
    );
    
// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// My Listings Route
router.get("/my-listings", isLoggedIn, wrapAsync(listingController.showMyListings));

// Booking Route
router.post("/:id/book", isLoggedIn, wrapAsync(bookingController.createBooking));

router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn, 
        isOwner, 
        upload.array('listing[image]', 5), // <-- THIS IS THE CHANGE
        validateListing, 
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;

