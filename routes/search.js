const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controllers/listings.js");

// This route handles GET requests to /search
router.get("/search", wrapAsync(listingController.searchListings));

module.exports = router;
