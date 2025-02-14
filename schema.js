const Joi = require("joi");

const listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().allow(""), // Make image optional or allow empty strings if not required
    price: Joi.number().required(),
    country: Joi.string().required(),
    location: Joi.string().required(),
  }).required(), // Ensure the 'listing' object itself is required
});

const reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(), // Ensure rating is between 1 and 5
    comment: Joi.string().required(), // Ensure the comment is required
  }).required(), // Ensure the 'review' object itself is required
});

module.exports = { listingSchema, reviewSchema };

