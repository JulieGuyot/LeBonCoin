const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  title: String,
  description: String,
  price: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  picture: Object,
  created: Date,
});

module.exports = Offer;
