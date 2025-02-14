const Listings = require("../models/listing");
const Review = require("../models/review");

// Create a new review and associate it with a listing
module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const listing = await Listings.findById(id.trim());
    if (!listing) {
        return res.status(404).send("Listing not found");
    }

    const newReview = new Review({
        rating: req.body.review.rating,
        comment: req.body.review.comment,
        author: req.user._id, // Associate the review with the logged-in user
    });

    await newReview.save();
    listing.reviews.push(newReview); // Associate the review with the listing
    await listing.save();

    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
};

// Delete a review from a listing
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove the review reference from the listing
    await Listings.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the review itself
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};
