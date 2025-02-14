const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const userController = require("../controllers/users");


router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.registerUser));

router.route("/login")
.get(userController.renderLoginForm)
.post(
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    userController.loginUser
);


// Logout route
router.get("/logout", userController.logoutUser);

module.exports = router;
