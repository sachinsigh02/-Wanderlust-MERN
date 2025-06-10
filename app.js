// Load environment variables in development mode
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utils/ExpressError.js");
const User = require("./models/user.js");

// Import routes
const listingRoutes = require("./routes/listing");
const reviewRoutes = require("./routes/review");
const userRoutes = require("./routes/user");

// Initialize Express app
const app = express();

// Secure MongoDB connection string from .env
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust"; // Fallback to local MongoDB

// Connect to MongoDB Atlas
mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // 10 seconds timeout
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Exit if unable to connect
  });

// Set EJS as the templating engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware setup
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(express.json()); // Parse JSON payloads
app.use(methodOverride("_method")); // Support PUT & DELETE requests
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// MongoDB session store setup
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SESSION_SECRET || "thisshouldbeabettersecret",
  },
  touchAfter: 24 * 3600, // Session will not be updated more than once in 24 hours
});

store.on("error", (err) => {
  console.log("❌ Error in MongoDB session store:", err);
});

// Session configuration
const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET || "this should be a better secret", // Fallback if env variable is missing
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week expiration
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    httpOnly: true, // Helps prevent XSS attacks
  },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport.js authentication setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash and current user middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user; // Make currUser available in views
  next();
});

// Serve static CSS file
app.get("/css/style.css", (req, res) => {
  res.sendFile(path.join(__dirname, "public/css/style.css"));
});

// Use routes
app.use("/listings", listingRoutes);
app.use("/", reviewRoutes);
app.use("/", userRoutes);

// Handle 404 errors (Page Not Found)
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Global error handling middleware
app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    req.flash("error", `File upload error: ${err.message}`);
    return redirectBack(req, res); // Redirect safely
  }

  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error", { err: { message, statusCode } });
});

// Utility function for safe back redirection
const redirectBack = (req, res, fallback = "/") => {
  const referer = req.get("Referrer") || fallback;
  res.redirect(referer);
};

// Start the Express server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});




  
 