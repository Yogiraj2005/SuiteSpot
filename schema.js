const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    // Rule for the main listing object
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        country: Joi.string().required(),
        location: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.allow(), // We allow image as it's handled by multer
        capacity: Joi.number().required().min(1),
        festival_focus: Joi.string().allow('').optional(),
    }).required(),
    
    // This rule validates the nearby_locations array, which is sent separately.
    nearby_locations: Joi.array().items(
        Joi.object({
            name: Joi.string().allow('').optional(),
            distance: Joi.number().min(0).allow(null).optional()
        })
    ).optional()
});


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});

