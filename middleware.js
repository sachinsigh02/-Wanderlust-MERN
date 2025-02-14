const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to proceed!");
    return res.redirect("/login");
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing || !listing.owner.equals(req.user._id)) {
    req.flash("error", "You are not the owner of this listing.");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  console.log("Validating Listing Data:", req.body);

  // Validate the structure of req.body
  const { error } = listingSchema.validate(req.body);

  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    console.error("Validation Error Details:", error.details);

    req.flash("error", msg);  // Send validation error as a flash message
    return res.redirect("/listings/new");
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id,reviewId } = req.params;
  const review= await Review.findById(reviewId);

  if (!review || !review.author.equals(req.user._id)) {
    req.flash("error", "You are not the author of thisreview.");
    return res.redirect(`/listings/${id}`);
  }
  next();
};





// Middleware to validate review data
module.exports.validateReview = (req, res, next) => {
  console.log("Validating Review Data:", req.body);

  // Validate using the updated schema (nested review object)
  const { error } = reviewSchema.validate(req.body);  

  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    console.error("Validation Error Details:", error.details);
    
    req.flash("error", msg);  // Send the validation error to the user as a flash message
    return res.redirect(`/listings/${req.params.id}`);  // Redirect back to the listing page with errors
  }
  next();
};

