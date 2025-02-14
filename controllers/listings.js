const Listings = require("../models/listing");

// Display all listings
module.exports.index = async (req, res) => {
    try {
        const allListings = await Listings.find({});
        res.render("listings/index.ejs", { allListings });
    } catch (err) {
        console.error("Error fetching listings:", err);
        req.flash("error", "Failed to load listings.");
        res.redirect("/");
    }
};

// Display the form for creating a new listing
module.exports.newForm = (req, res) => {
    res.render("listings/new");
};

// Display a specific listing by ID
module.exports.show = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listings.findById(id)
            .populate({
                path: "reviews",
                populate: { path: "author" },
            })
            .populate("owner");

        if (!listing) {
            req.flash("error", "The listing you requested does not exist!");
            return res.redirect(req.get("Referrer") || "/listings");
        }

        res.render("listings/show", { listing });
    } catch (err) {
        console.error("Error fetching listing:", err);
        req.flash("error", "Invalid listing ID or listing not found.");
        res.redirect(req.get("Referrer") || "/listings");
    }
};

// Handle form submission to create a new listing
module.exports.create = async (req, res) => {
    try {
        console.log("Received Form Data:", req.body);
        console.log("Uploaded File:", req.file);

        if (!req.file) {
            req.flash("error", "Image upload failed.");
            return res.redirect("/listings/new");
        }

        const { path: url, filename } = req.file;
        const { title, description, price, country, location } = req.body.listing;

        if (!title || !description || !price || !country || !location) {
            req.flash("error", "Please fill in all the fields.");
            return res.redirect("/listings/new");
        }

        const newListing = new Listings({
            title,
            description,
            image: { url, filename },
            price,
            country,
            location,
            owner: req.user._id,
        });

        await newListing.save();

        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    } catch (err) {
        console.error("Error creating listing:", err);
        req.flash("error", `Something went wrong: ${err.message}`);
        res.redirect("/listings/new");
    }
};

// Display the form for editing a listing
module.exports.editForm = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listings.findById(id);

        if (!listing) {
            req.flash("error", "The listing you requested to edit does not exist!");
            return res.redirect(req.get("Referrer") || "/listings");
        }

        res.render("listings/edit", { listing });
    } catch (err) {
        console.error("Error fetching listing for edit:", err);
        req.flash("error", "Invalid listing ID or listing not found.");
        res.redirect(req.get("Referrer") || "/listings");
    }
};

// Handle form submission to update a listing
module.exports.update = async (req, res) => {
    try {
        const { id } = req.params;

        const updates = { ...req.body.listing };
        if (req.file) {
            const { path: url, filename } = req.file;
            updates.image = { url, filename };
        }

        const updatedListing = await Listings.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!updatedListing) {
            req.flash("error", "Listing not found.");
            return res.redirect(req.get("Referrer") || "/listings");
        }

        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error("Error updating listing:", err);
        req.flash("error", `Something went wrong: ${err.message}`);
        res.redirect(req.get("Referrer") || `/listings/${id}/edit`);
    }
};

// Handle deleting a listing
module.exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedListing = await Listings.findByIdAndDelete(id);

        if (!deletedListing) {
            req.flash("error", "Listing not found.");
            return res.redirect(req.get("Referrer") || "/listings");
        }

        req.flash("success", "Successfully deleted listing.");
        res.redirect("/listings");
    } catch (err) {
        console.error("Error deleting listing:", err);
        req.flash("error", `Something went wrong: ${err.message}`);
        res.redirect(req.get("Referrer") || "/listings");
    }
};

// Render the error page for validation errors
module.exports.error = (req, res) => {
    const validationError = res.locals.validationError;
    res.render("listings/error", { validationError });
};





