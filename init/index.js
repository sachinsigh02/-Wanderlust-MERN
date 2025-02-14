const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.error("Error connecting to DB:", err.message);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    try {
        // Delete all existing listings
        await Listing.deleteMany({});

        // Ensure all listings have the required fields
        initData.data = initData.data.map((obj) => ({
            ...obj,
            owner: "6730788d2311881ed64730fd", // assign a specific owner
            price: obj.price || 100, // provide a default price if missing
            image: {
                url: obj.image?.url || "https://example.com/default-image.jpg", // default URL
                filename: obj.image?.filename || "default-image.jpg", // default filename
            },
        }));

        // Insert new data into the database
        await Listing.insertMany(initData.data);

        console.log("Data was initialized successfully");
    } catch (err) {
        console.error("Error initializing data:", err.message);
    }
};

initDB();
