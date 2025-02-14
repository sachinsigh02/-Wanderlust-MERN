const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  comment: {
    type: String,
    required: true,  // Optional, depending on your use case
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,  // Make sure the rating is required
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: Schema.Types.ObjectId,  // Corrected from ObjectedId to ObjectId
    ref: "User",
    required: true,  // Ensure the author field is required
  },
});

module.exports = mongoose.model("Review", reviewSchema);
