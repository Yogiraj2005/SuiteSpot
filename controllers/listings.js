// Import Sequelize models and Mapbox SDK
const User = require('../models/user.js');
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geoCodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports = {
    // 1. Show all listings (Index Route)
    index: async (req, res) => {
        const allListings = await Listing.findAll();
        res.render("listings/index.ejs", { allListings });
    },

    // 2. Show the form to create a new listing
    renderNewForm: (req, res) => {
        res.render("listings/new.ejs");
    },

    // 3. Show details for one specific listing
    showListing: async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findByPk(id, {
            include: [
                { model: Review, include: { model: User, as: 'author' } },
                { model: User, as: 'owner' }
            ]
        });
        if (!listing) {
            req.flash("error", "Listing you requested does not exist!");
            return res.redirect("/listings");
        }
        res.render("listings/show.ejs", { listing });
    },

    // 4. Create a new listing in the database
    createListing: async (req, res, next) => {
        // Call Mapbox API to get coordinates
        const geocodeResponse = await geoCodingClient
            .forwardGeocode({
                query: req.body.listing.location,
                limit: 1,
            })
            .send();

        const newListingData = req.body.listing;
        newListingData.ownerId = req.user.id;
        newListingData.image = req.file.path;
        // Save the coordinates from the API response
        newListingData.geometry = geocodeResponse.body.features[0].geometry;

        const newListing = await Listing.create(newListingData);
        
        req.flash("success", "New Listing Created!");
        res.redirect(`/listings/${newListing.id}`);
    },

    // 5. Show the form to edit an existing listing
    renderEditForm: async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findByPk(id);
        if (!listing) {
            req.flash("error", "Listing you requested for does not exist!");
            return res.redirect("/listings");
        }
        res.render("listings/edit.ejs", { listing });
    },

    // 6. Update a listing in the database
    updateListing: async (req, res) => {
        let { id } = req.params;
        const updatedData = req.body.listing;

        // If the location was changed, get new coordinates from Mapbox
        const geocodeResponse = await geoCodingClient
            .forwardGeocode({
                query: updatedData.location,
                limit: 1,
            })
            .send();
        updatedData.geometry = geocodeResponse.body.features[0].geometry;

        // If a new file was uploaded, update the image URL
        if (req.file) {
            updatedData.image = req.file.path;
        }

        await Listing.update(updatedData, { where: { id: id } });
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    },

    // 7. Delete a listing from the database
    destroyListing: async (req, res) => {
        let { id } = req.params;
        await Listing.destroy({ where: { id: id } });
        req.flash("success", "Listing Deleted!");
        res.redirect("/listings");
    }
};

