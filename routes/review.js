const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { validateReview, isLoggedIn } = require("../middleware");
const reviewController = require("../controllers/reviews");

// Route to create a new review
router.post(
    "/listings/:id/reviews",
    isLoggedIn,
    validateReview, // Validate review data
    wrapAsync(reviewController.createReview)
);

// Route to delete a review
router.delete(
    "/listings/:id/reviews/:reviewId",
    isLoggedIn,
    wrapAsync(reviewController.deleteReview)
);

module.exports = router;
