// Import Sequelize models individually from their files
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const User = require('../models/user.js');

// We are temporarily commenting out Mapbox and Image Upload logic
// to focus on getting basic CRUD working first.
// const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
// const mapToken = process.env.MAP_TOKEN;
// const geoCodingClient = mbxGeocoding({ accessToken: mapToken });

// 1. Show all listings (Index Route)
module.exports.index = async (req, res) => {
    const allListings = await Listing.findAll();
    res.render("listings/index.ejs", { allListings });
};

// 2. Show the form to create a new listing
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// 3. Show details for one specific listing
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByPk(id, {
        // Use "include" to fetch related data, similar to Mongoose's "populate"
        include: [
            { model: Review, include: { model: User, as: 'author' } }, // Include reviews and the author of each review
            { model: User, as: 'owner' } // Include the owner of the listing
        ]
    });

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

// 4. Create a new listing in the database
module.exports.createListing = async (req, res, next) => {
    // NOTE: We are ignoring image uploads and map data for now.
    const newListingData = req.body.listing;
    // We will need to add the owner's ID. We assume a logged-in user.
    // This will fail until we implement login, which is our next major step.
    newListingData.ownerId = req.user ? req.user.id : 1; // Temporary ownerId

    await Listing.create(newListingData);

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

// 5. Show the form to edit a listing
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByPk(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    // Note: The logic for a resized "originalImageUrl" will need to be re-evaluated
    // since our 'image' field is now just a single URL string.
    res.render("listings/edit.ejs", { listing });
};

// 6. Update a listing in the database
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    await Listing.update(req.body.listing, {
        where: { id: id }
    });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

// 7. Delete a listing from the database
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.destroy({
        where: { id: id }
    });
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};

