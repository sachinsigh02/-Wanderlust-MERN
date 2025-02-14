const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const listingController = require("../controllers/listings");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage }); // Configure Multer with Cloudinary or local storage

// Route to display all listings
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn, 
        upload.single("image"), // Handle file upload (single image)
        validateListing, 
        wrapAsync(listingController.create)
    );

// Route to display the form for creating a new listing
router.get("/new", isLoggedIn, listingController.newForm);

// Routes for individual listings
router.route("/:id")
    .get(wrapAsync(listingController.show))
    .put(
        isLoggedIn, 
        isOwner, 
        upload.single("image"), // File upload during update
        validateListing, 
        wrapAsync(async (req, res, next) => {
            if (req.file) {
                req.body.image = req.file.path; // Add file path to the listing object
            }
            await listingController.update(req, res, next);
        })
    )
    .delete(
        isLoggedIn, 
        isOwner, 
        wrapAsync(listingController.delete)
    );

// Route to display the edit form for a listing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editForm));

// Specific error handling for Multer errors
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        req.flash("error", `File upload error: ${err.message}`);
        return res.redirect(req.get("Referrer") || "/");
    }
    next(err); // Pass to global error handler
});

module.exports = router;



