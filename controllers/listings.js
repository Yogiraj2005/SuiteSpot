const { Op } = require('sequelize');
const User = require('../models/user.js');
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const Booking = require('../models/booking.js');const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geoCodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports = {
    // ... (index, renderNewForm, showListing, etc. are unchanged)
    index: async (req, res) => {
        const allListings = await Listing.findAll();
        res.render("listings/index.ejs", { allListings });
    },

    renderNewForm: (req, res) => {
        res.render("listings/new.ejs");
    },

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
        const currentBooking = await Booking.findOne({ where: { listingId: id } });
        res.render("listings/show.ejs", { listing, currentBooking });
    },

    // --- THIS IS THE FULLY UPDATED CREATE FUNCTION ---
    createListing: async (req, res, next) => {
        // 1. Get coordinates for the map
        const geocodeResponse = await geoCodingClient
            .forwardGeocode({
                query: req.body.listing.location,
                limit: 1,
            })
            .send();

        const newListingData = req.body.listing;
        newListingData.ownerId = req.user.id;
        newListingData.geometry = geocodeResponse.body.features[0].geometry;

        // 2. Process multiple image URLs from req.files
        if (req.files && req.files.length > 0) {
            newListingData.image = req.files.map(f => f.path); // Create an array of URLs
        } else {
            newListingData.image = []; // Ensure it's an empty array if no files
        }

        // 3. Process the flexible nearby locations
        if (req.body.nearby_locations) {
            // Filter out any entries where the user didn't type a name
            newListingData.nearby_locations = req.body.nearby_locations.filter(loc => loc.name && loc.name.trim() !== "");
        }

        const newListing = await Listing.create(newListingData);
        
        req.flash("success", "New Listing Created!");
        res.redirect(`/listings/${newListing.id}`);
    },

    renderEditForm: async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findByPk(id);
        if (!listing) {
            req.flash("error", "Listing you requested for does not exist!");
            return res.redirect("/listings");
        }
        res.render("listings/edit.ejs", { listing });
    },

    // --- THIS IS THE FULLY UPDATED UPDATE FUNCTION ---
    updateListing: async (req, res) => {
        let { id } = req.params;
        const updatedData = req.body.listing;

        const geocodeResponse = await geoCodingClient
            .forwardGeocode({ query: updatedData.location, limit: 1 })
            .send();
        updatedData.geometry = geocodeResponse.body.features[0].geometry;

        // Add new images if they were uploaded, but keep old ones if no new files
        if (req.files && req.files.length > 0) {
            updatedData.image = req.files.map(f => f.path);
        }

        if (req.body.nearby_locations) {
            updatedData.nearby_locations = req.body.nearby_locations.filter(loc => loc.name && loc.name.trim() !== "");
        } else {
            updatedData.nearby_locations = [];
        }

        await Listing.update(updatedData, { where: { id: id } });
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    },

    destroyListing: async (req, res) => {
        let { id } = req.params;
        await Listing.destroy({ where: { id: id } });
        req.flash("success", "Listing Deleted!");
        res.redirect("/listings");
    },
    
    showMyListings: async (req, res) => {
        const myListings = await Listing.findAll({
            where: { ownerId: req.user.id }
        });
        res.render("listings/my-listings.ejs", { myListings });
    },

    searchListings: async (req, res) => {
        const { q } = req.query;
        const searchResults = await Listing.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.like]: `%${q}%` } },
                    { location: { [Op.like]: `%${q}%` } },
                    { country: { [Op.like]: `%${q}%` } }
                ]
            }
        });
        res.render("listings/search-results.ejs", { listings: searchResults, query: q });
    }
};

