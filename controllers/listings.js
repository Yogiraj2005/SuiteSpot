// Import Sequelize models, including the new Booking model
const User = require('../models/user.js');
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const Booking = require('../models/booking.js');

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geoCodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports = {
    index: async (req, res) => {
        const allListings = await Listing.findAll();
        res.render("listings/index.ejs", { allListings });
    },

    renderNewForm: (req, res) => {
        res.render("listings/new.ejs");
    },

    // THIS IS THE UPDATED FUNCTION
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

        // NEW: When finding the booking, also "include" the User model associated with it as the "guest"
        const currentBooking = await Booking.findOne({ 
            where: { listingId: id },
            include: { model: User, as: 'guest' } // This fetches the guest's details!
        });
        
        res.render("listings/show.ejs", { listing, currentBooking });
    },

    createListing: async (req, res, next) => {
        const geocodeResponse = await geoCodingClient.forwardGeocode({ query: req.body.listing.location, limit: 1 }).send();
        const newListingData = req.body.listing;
        newListingData.ownerId = req.user.id;
        newListingData.image = req.file.path;
        newListingData.geometry = geocodeResponse.body.features[0].geometry;
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

    updateListing: async (req, res) => {
        let { id } = req.params;
        const updatedData = req.body.listing;
        const geocodeResponse = await geoCodingClient.forwardGeocode({ query: updatedData.location, limit: 1 }).send();
        updatedData.geometry = geocodeResponse.body.features[0].geometry;
        if (req.file) {
            updatedData.image = req.file.path;
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
        // Find all listings where the ownerId matches the logged-in user's ID
        const myListings = await Listing.findAll({
            where: { ownerId: req.user.id }
        });
        res.render("listings/my-listings.ejs", { myListings });
    }
};

