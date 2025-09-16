const { Op } = require('sequelize');
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const Booking = require('../models/booking.js');

module.exports = {
    // Renders the page showing all of the current user's bookings
    showMyBookings: async (req, res) => {
        const myBookings = await Booking.findAll({
            where: { guestId: req.user.id },
            include: { model: Listing } 
        });
        res.render("bookings/index.ejs", { myBookings });
    },

    // Handles the creation of a new booking with a date range
    createBooking: async (req, res) => {
        const { id: listingId } = req.params;
        const guestId = req.user.id;
        const { startDate, endDate } = req.body.booking;

        // Basic Validation: Ensure end date is after start date
        if (!startDate || !endDate || new Date(endDate) <= new Date(startDate)) {
            req.flash("error", "Invalid dates. Please ensure the end date is after the start date.");
            return res.redirect(`/listings/${listingId}`);
        }

        // Advanced Validation: Check for overlapping bookings
        const overlappingBooking = await Booking.findOne({
            where: {
                listingId: listingId,
                [Op.or]: [
                    { startDate: { [Op.between]: [startDate, endDate] } },
                    { endDate: { [Op.between]: [startDate, endDate] } },
                    { [Op.and]: [
                        { startDate: { [Op.lte]: startDate } },
                        { endDate: { [Op.gte]: endDate } }
                    ]}
                ]
            }
        });

        if (overlappingBooking) {
            req.flash("error", "Sorry, this property is already booked for the selected dates.");
            return res.redirect(`/listings/${listingId}`);
        }

        // If validation passes, create the new booking
        await Booking.create({
            listingId,
            guestId,
            startDate,
            endDate
        });

        req.flash("success", "Listing successfully booked!");
        res.redirect(`/listings/${listingId}`);
    },
};

