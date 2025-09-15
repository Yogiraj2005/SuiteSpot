// Import Sequelize models
const Listing = require('../models/listing.js');
const User = require('../models/user.js');
const Review = require('../models/review.js');

module.exports = {
    // ... index, renderNewForm functions are unchanged ...
    index: async (req, res) => {
        const allListings = await Listing.findAll();
        res.render("listings/index.ejs", { allListings });
    },

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

        // --- THIS IS THE DEBUGGING LINE WE ADDED ---
        // It will print the full listing object to your terminal
        console.log(JSON.stringify(listing, null, 2)); 

        if (!listing) {
            req.flash("error", "Listing you requested for does not exist!");
            return res.redirect("/listings");
        }
        res.render("listings/show.ejs", { listing });
    },
    
    // ... create, edit, update, destroy functions are unchanged ...
    createListing: async (req, res, next) => {
        const newListingData = req.body.listing;
        newListingData.ownerId = req.user.id;
        newListingData.image = req.file.path;
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
        if (req.file) {
            updatedData.image = req.file.path;
        }
        await Listing.update(updatedData, {
            where: { id: id }
        });
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    },

    destroyListing: async (req, res) => {
        let { id } = req.params;
        await Listing.destroy({
            where: { id: id }
        });
        req.flash("success", "Listing Deleted!");
        res.redirect("/listings");
    }
};

